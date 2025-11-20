/**
 * Skill Manager
 * Manages loading, activation, and lifecycle of GlyphCase skills
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ActiveCapsule } from './capsule';
import { LuaRuntime } from './lua';
import type { EventBus } from './events';
import type {
  Skill,
  SkillManifest,
  SkillComponent,
  SkillTemplate,
  SkillHook
} from './types';

export class SkillManager {
  private skills: Map<string, Skill> = new Map();
  private activeSkills: Set<string> = new Set();
  private luaRuntimes: Map<string, LuaRuntime> = new Map();

  constructor(
    private capsule: ActiveCapsule,
    private eventBus: EventBus
  ) {}

  /**
   * Load a skill from directory
   */
  async loadSkill(skillPath: string): Promise<Skill> {
    // Read manifest
    const manifestPath = path.join(skillPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`manifest.json not found in ${skillPath}`);
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: SkillManifest = JSON.parse(manifestContent);

    // Load Lua scripts
    const luaScripts = new Map<string, string>();
    const scriptsDir = path.join(skillPath, 'scripts');

    if (fs.existsSync(scriptsDir)) {
      const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.lua'));

      for (const file of scriptFiles) {
        const scriptPath = path.join(scriptsDir, file);
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
        const scriptName = file.replace('.lua', '');
        luaScripts.set(scriptName, scriptContent);
      }
    }

    // Load components
    const components: SkillComponent[] = [];
    const componentsDir = path.join(skillPath, 'components');

    if (fs.existsSync(componentsDir)) {
      const componentFiles = fs.readdirSync(componentsDir);

      for (const file of componentFiles) {
        const ext = path.extname(file);
        const type = ext === '.punk' ? 'punk' : ext === '.tsx' ? 'tsx' : 'jsx';

        components.push({
          name: path.basename(file, ext),
          path: path.join(componentsDir, file),
          type
        });
      }
    }

    // Load templates
    const templates: SkillTemplate[] = [];
    const templatesDir = path.join(skillPath, 'templates');

    if (fs.existsSync(templatesDir)) {
      const templateFiles = fs.readdirSync(templatesDir);

      for (const file of templateFiles) {
        const name = path.basename(file, path.extname(file));
        const type = this.inferTemplateType(name);

        templates.push({
          name,
          path: path.join(templatesDir, file),
          type
        });
      }
    }

    // Check for database
    const dbPath = path.join(skillPath, 'glyphcase.db');
    const hasDb = fs.existsSync(dbPath);

    const skill: Skill = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      manifest,
      luaScripts,
      components,
      templates,
      dbPath: hasDb ? dbPath : undefined
    };

    this.skills.set(skill.id, skill);

    return skill;
  }

  /**
   * Infer template type from filename
   */
  private inferTemplateType(name: string): 'api' | 'worker' | 'cron' {
    if (name.includes('worker')) return 'worker';
    if (name.includes('cron')) return 'cron';
    return 'api';
  }

  /**
   * Activate a skill
   */
  async activateSkill(skillId: string): Promise<void> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill '${skillId}' not loaded`);
    }

    if (this.activeSkills.has(skillId)) {
      console.warn(`[SkillManager] Skill '${skillId}' already active`);
      return;
    }

    // Check permissions
    if (!skill.manifest.permissions?.database) {
      console.warn(`[SkillManager] Skill '${skillId}' has no database permission`);
    }

    // Initialize Lua runtime if enabled
    if (skill.manifest.permissions?.lua?.enabled) {
      const luaRuntime = new LuaRuntime(
        this.capsule,
        this.eventBus,
        skill.manifest.permissions.lua as any
      );

      await luaRuntime.init();

      // Load all Lua scripts
      for (const [scriptName, scriptContent] of skill.luaScripts) {
        try {
          await luaRuntime.execute(scriptContent);
          console.log(`[SkillManager] Loaded Lua script: ${scriptName}`);
        } catch (error) {
          console.error(`[SkillManager] Error loading Lua script '${scriptName}':`, error);
          throw error;
        }
      }

      this.luaRuntimes.set(skillId, luaRuntime);

      // Execute on_install hook if this is first activation
      if (!this.activeSkills.has(skillId)) {
        await this.executeHook(skillId, 'on_install');
      }

      // Execute on_activate hook
      await this.executeHook(skillId, 'on_activate');
    }

    this.activeSkills.add(skillId);

    console.log(`[SkillManager] Activated skill: ${skill.name} (${skillId})`);
  }

  /**
   * Deactivate a skill
   */
  async deactivateSkill(skillId: string): Promise<void> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill '${skillId}' not loaded`);
    }

    if (!this.activeSkills.has(skillId)) {
      console.warn(`[SkillManager] Skill '${skillId}' not active`);
      return;
    }

    // Execute on_deactivate hook
    await this.executeHook(skillId, 'on_deactivate');

    // Clean up Lua runtime
    const luaRuntime = this.luaRuntimes.get(skillId);
    if (luaRuntime) {
      await luaRuntime.close();
      this.luaRuntimes.delete(skillId);
    }

    this.activeSkills.delete(skillId);

    console.log(`[SkillManager] Deactivated skill: ${skill.name} (${skillId})`);
  }

  /**
   * Execute a lifecycle hook
   */
  private async executeHook(skillId: string, hookName: SkillHook): Promise<void> {
    const luaRuntime = this.luaRuntimes.get(skillId);
    if (!luaRuntime) return;

    try {
      const hasHook = await luaRuntime.hasFunction(hookName);
      if (hasHook) {
        console.log(`[SkillManager] Executing ${hookName} for skill ${skillId}`);
        await luaRuntime.callFunction(hookName);
      }
    } catch (error) {
      console.error(`[SkillManager] Error executing ${hookName} for skill ${skillId}:`, error);
      throw error;
    }
  }

  /**
   * Get loaded skill
   */
  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Get all loaded skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get active skills
   */
  getActiveSkills(): Skill[] {
    return Array.from(this.activeSkills)
      .map(id => this.skills.get(id))
      .filter((s): s is Skill => s !== undefined);
  }

  /**
   * Check if skill is active
   */
  isActive(skillId: string): boolean {
    return this.activeSkills.has(skillId);
  }

  /**
   * Unload skill
   */
  async unloadSkill(skillId: string): Promise<void> {
    if (this.activeSkills.has(skillId)) {
      await this.deactivateSkill(skillId);
    }

    this.skills.delete(skillId);
  }

  /**
   * Call Lua function in skill
   */
  async callSkillFunction(skillId: string, functionName: string, ...args: any[]): Promise<any> {
    const luaRuntime = this.luaRuntimes.get(skillId);
    if (!luaRuntime) {
      throw new Error(`Skill '${skillId}' not active or has no Lua runtime`);
    }

    return await luaRuntime.callFunction(functionName, ...args);
  }

  /**
   * Trigger data change event in skills
   */
  async triggerDataChange(tableName: string, operation: string, row: any): Promise<void> {
    // Call on_data_changed in all active skills
    for (const skillId of this.activeSkills) {
      const luaRuntime = this.luaRuntimes.get(skillId);
      if (!luaRuntime) continue;

      try {
        const hasHandler = await luaRuntime.hasFunction('on_data_changed');
        if (hasHandler) {
          await luaRuntime.callFunction('on_data_changed', tableName, operation, row);
        }
      } catch (error) {
        console.error(`[SkillManager] Error in on_data_changed for skill ${skillId}:`, error);
      }
    }
  }
}
