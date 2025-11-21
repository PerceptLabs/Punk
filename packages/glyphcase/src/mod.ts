/**
 * Mod Manager
 * Manages loading, activation, and lifecycle of GlyphCase mods
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ActiveCapsule } from './capsule';
import { LuaRuntime } from './lua';
import type { EventBus } from './events';
import type {
  Mod,
  ModManifest,
  ModComponent,
  ModTemplate,
  ModHook
} from './types';

export class ModManager {
  private mods: Map<string, Mod> = new Map();
  private activeMods: Set<string> = new Set();
  private luaRuntimes: Map<string, LuaRuntime> = new Map();

  constructor(
    private capsule: ActiveCapsule,
    private eventBus: EventBus
  ) {}

  /**
   * Load a mod from directory
   */
  async loadMod(modPath: string): Promise<Mod> {
    // Read manifest
    const manifestPath = path.join(modPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`manifest.json not found in ${modPath}`);
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: ModManifest = JSON.parse(manifestContent);

    // Load Lua scripts
    const luaScripts = new Map<string, string>();
    const scriptsDir = path.join(modPath, 'scripts');

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
    const components: ModComponent[] = [];
    const componentsDir = path.join(modPath, 'components');

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
    const templates: ModTemplate[] = [];
    const templatesDir = path.join(modPath, 'templates');

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
    const dbPath = path.join(modPath, 'glyphcase.db');
    const hasDb = fs.existsSync(dbPath);

    const mod: Mod = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      manifest,
      luaScripts,
      components,
      templates,
      dbPath: hasDb ? dbPath : undefined
    };

    this.mods.set(mod.id, mod);

    return mod;
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
   * Activate a mod
   */
  async activateMod(modId: string): Promise<void> {
    const mod = this.mods.get(modId);
    if (!mod) {
      throw new Error(`Mod '${modId}' not loaded`);
    }

    if (this.activeMods.has(modId)) {
      console.warn(`[ModManager] Mod '${modId}' already active`);
      return;
    }

    // Check permissions
    if (!mod.manifest.permissions?.database) {
      console.warn(`[ModManager] Mod '${modId}' has no database permission`);
    }

    // Initialize Lua runtime if enabled
    if (mod.manifest.permissions?.lua?.enabled) {
      const luaRuntime = new LuaRuntime(
        this.capsule,
        this.eventBus,
        mod.manifest.permissions.lua as any
      );

      await luaRuntime.init();

      // Load all Lua scripts
      for (const [scriptName, scriptContent] of mod.luaScripts) {
        try {
          await luaRuntime.execute(scriptContent);
          console.log(`[ModManager] Loaded Lua script: ${scriptName}`);
        } catch (error) {
          console.error(`[ModManager] Error loading Lua script '${scriptName}':`, error);
          throw error;
        }
      }

      this.luaRuntimes.set(modId, luaRuntime);

      // Execute on_install hook if this is first activation
      if (!this.activeMods.has(modId)) {
        await this.executeHook(modId, 'on_install');
      }

      // Execute on_activate hook
      await this.executeHook(modId, 'on_activate');
    }

    this.activeMods.add(modId);

    console.log(`[ModManager] Activated mod: ${mod.name} (${modId})`);
  }

  /**
   * Deactivate a mod
   */
  async deactivateMod(modId: string): Promise<void> {
    const mod = this.mods.get(modId);
    if (!mod) {
      throw new Error(`Mod '${modId}' not loaded`);
    }

    if (!this.activeMods.has(modId)) {
      console.warn(`[ModManager] Mod '${modId}' not active`);
      return;
    }

    // Execute on_deactivate hook
    await this.executeHook(modId, 'on_deactivate');

    // Clean up Lua runtime
    const luaRuntime = this.luaRuntimes.get(modId);
    if (luaRuntime) {
      await luaRuntime.close();
      this.luaRuntimes.delete(modId);
    }

    this.activeMods.delete(modId);

    console.log(`[ModManager] Deactivated mod: ${mod.name} (${modId})`);
  }

  /**
   * Execute a lifecycle hook
   */
  private async executeHook(modId: string, hookName: ModHook): Promise<void> {
    const luaRuntime = this.luaRuntimes.get(modId);
    if (!luaRuntime) return;

    try {
      const hasHook = await luaRuntime.hasFunction(hookName);
      if (hasHook) {
        console.log(`[ModManager] Executing ${hookName} for mod ${modId}`);
        await luaRuntime.callFunction(hookName);
      }
    } catch (error) {
      console.error(`[ModManager] Error executing ${hookName} for mod ${modId}:`, error);
      throw error;
    }
  }

  /**
   * Get loaded mod
   */
  getMod(modId: string): Mod | undefined {
    return this.mods.get(modId);
  }

  /**
   * Get all loaded mods
   */
  getAllMods(): Mod[] {
    return Array.from(this.mods.values());
  }

  /**
   * Get active mods
   */
  getActiveMods(): Mod[] {
    return Array.from(this.activeMods)
      .map(id => this.mods.get(id))
      .filter((s): s is Mod => s !== undefined);
  }

  /**
   * Check if mod is active
   */
  isActive(modId: string): boolean {
    return this.activeMods.has(modId);
  }

  /**
   * Unload mod
   */
  async unloadMod(modId: string): Promise<void> {
    if (this.activeMods.has(modId)) {
      await this.deactivateMod(modId);
    }

    this.mods.delete(modId);
  }

  /**
   * Call Lua function in mod
   */
  async callModFunction(modId: string, functionName: string, ...args: any[]): Promise<any> {
    const luaRuntime = this.luaRuntimes.get(modId);
    if (!luaRuntime) {
      throw new Error(`Mod '${modId}' not active or has no Lua runtime`);
    }

    return await luaRuntime.callFunction(functionName, ...args);
  }

  /**
   * Trigger data change event in mods
   */
  async triggerDataChange(tableName: string, operation: string, row: any): Promise<void> {
    // Call on_data_changed in all active mods
    for (const modId of this.activeMods) {
      const luaRuntime = this.luaRuntimes.get(modId);
      if (!luaRuntime) continue;

      try {
        const hasHandler = await luaRuntime.hasFunction('on_data_changed');
        if (hasHandler) {
          await luaRuntime.callFunction('on_data_changed', tableName, operation, row);
        }
      } catch (error) {
        console.error(`[ModManager] Error in on_data_changed for mod ${modId}:`, error);
      }
    }
  }
}
