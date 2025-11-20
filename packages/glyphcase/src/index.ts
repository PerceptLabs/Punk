/**
 * GlyphCase - Active Capsule Reactive Database with Lua Runtime
 *
 * Main entry point for the GlyphCase library
 */

export { ActiveCapsule } from './capsule';
export { EventBus } from './events';
export { LuaRuntime } from './lua';
export { SkillManager } from './skill';
export { SyncEngine } from './sync';
export { createLuaBindings } from './bindings';
export { configureLogging, createLogger, loggers, redact } from './logger';

export type {
  // Core types
  Watcher,
  ChangeEvent,
  Subscription,
  WatchCallback,
  UnwatchFn,
  UnsubscribeFn,

  // Event Bus types
  Subscriber,
  EventHandler,

  // Lua types
  LuaSandbox,
  LuaConfig,

  // Skill types
  Skill,
  SkillManifest,
  SkillComponent,
  SkillTemplate,
  SkillHook,

  // Sync types
  SyncConfig,
  SyncResult,
  ChangeLog,

  // Schema types
  ColumnDef,
  TableDef,
  IndexDef,
  SchemaDefinition,
  GlyphCaseConfig
} from './types';

/**
 * GlyphCase
 * Complete reactive database system with Lua runtime
 */
import { ActiveCapsule } from './capsule';
import { EventBus } from './events';
import { LuaRuntime } from './lua';
import { SkillManager } from './skill';
import { SyncEngine } from './sync';
import type { GlyphCaseConfig, TableDef } from './types';

export class GlyphCase {
  private capsule: ActiveCapsule;
  private eventBus: EventBus;
  private luaRuntime?: LuaRuntime;
  private skillManager: SkillManager;
  private syncEngine?: SyncEngine;

  constructor(config: GlyphCaseConfig) {
    // Initialize event bus
    this.eventBus = new EventBus();

    // Initialize Active Capsule
    this.capsule = new ActiveCapsule(config.dbPath, config);

    // Initialize skill manager
    this.skillManager = new SkillManager(this.capsule, this.eventBus);

    // Initialize Lua runtime if configured
    if (config.lua) {
      this.luaRuntime = new LuaRuntime(this.capsule, this.eventBus, config.lua);
    }

    // Initialize sync engine if configured
    if (config.sync?.enabled) {
      this.syncEngine = new SyncEngine(this.capsule, config.sync);
    }

    // Create schema if provided
    if (config.schema) {
      this.createSchema(config.schema.tables);
    }
  }

  /**
   * Create database schema
   */
  private createSchema(tables: TableDef[]): void {
    for (const table of tables) {
      this.capsule.createTable(table);
    }
  }

  /**
   * Execute SQL query
   */
  query(sql: string, params?: any[]): any[] {
    return this.capsule.query(sql, params);
  }

  /**
   * Insert data
   */
  insert(table: string, data: Record<string, any>): number {
    const id = this.capsule.insert(table, data);

    // Record for sync if enabled
    if (this.syncEngine) {
      this.syncEngine.recordChange(table, 'INSERT', id, data);
    }

    return id;
  }

  /**
   * Update data
   */
  update(table: string, id: number, data: Record<string, any>): void {
    this.capsule.update(table, id, data);

    // Record for sync if enabled
    if (this.syncEngine) {
      this.syncEngine.recordChange(table, 'UPDATE', id, data);
    }
  }

  /**
   * Delete data
   */
  delete(table: string, id: number): void {
    this.capsule.delete(table, id);

    // Record for sync if enabled
    if (this.syncEngine) {
      this.syncEngine.recordChange(table, 'DELETE', id, {});
    }
  }

  /**
   * Watch table for changes
   */
  watch(table: string, callback: (events: any[]) => void, filter?: string) {
    return this.capsule.watch(table, callback, filter);
  }

  /**
   * Execute Lua script
   */
  async executeLua(script: string): Promise<any> {
    if (!this.luaRuntime) {
      throw new Error('Lua runtime not initialized');
    }

    return await this.luaRuntime.execute(script);
  }

  /**
   * Call Lua function
   */
  async callLuaFunction(name: string, ...args: any[]): Promise<any> {
    if (!this.luaRuntime) {
      throw new Error('Lua runtime not initialized');
    }

    return await this.luaRuntime.callFunction(name, ...args);
  }

  /**
   * Load skill
   */
  async loadSkill(skillPath: string) {
    return await this.skillManager.loadSkill(skillPath);
  }

  /**
   * Activate skill
   */
  async activateSkill(skillId: string) {
    return await this.skillManager.activateSkill(skillId);
  }

  /**
   * Deactivate skill
   */
  async deactivateSkill(skillId: string) {
    return await this.skillManager.deactivateSkill(skillId);
  }

  /**
   * Sync to cloud
   */
  async sync() {
    if (!this.syncEngine) {
      throw new Error('Sync not enabled');
    }

    return await this.syncEngine.sync();
  }

  /**
   * Run transaction
   */
  transaction<T>(fn: () => T): T {
    return this.capsule.transaction(fn);
  }

  /**
   * Clean up old events
   */
  cleanup(retentionDays?: number): void {
    this.capsule.cleanup(retentionDays);
  }

  /**
   * Close database
   */
  close(): void {
    this.capsule.close();
  }

  /**
   * Get skill manager
   */
  getSkillManager(): SkillManager {
    return this.skillManager;
  }

  /**
   * Get event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get Active Capsule
   */
  getCapsule(): ActiveCapsule {
    return this.capsule;
  }

  /**
   * Get Lua runtime
   */
  getLuaRuntime(): LuaRuntime | undefined {
    return this.luaRuntime;
  }

  /**
   * Get sync engine
   */
  getSyncEngine(): SyncEngine | undefined {
    return this.syncEngine;
  }
}

// Default export
export default GlyphCase;
