/**
 * Lua Runtime Integration
 * Sandboxed Lua 5.4 environment using wasmoon
 */

import { LuaFactory, LuaEngine } from 'wasmoon';
import type { ActiveCapsule } from './capsule';
import type { EventBus } from './events';
import type { LuaConfig, LuaSandbox } from './types';

export class LuaRuntime {
  private lua: LuaEngine | null = null;
  private factory: LuaFactory;
  private sandbox: LuaSandbox;
  private initialized = false;

  constructor(
    private capsule: ActiveCapsule,
    private eventBus: EventBus,
    config?: LuaConfig
  ) {
    this.factory = new LuaFactory();
    this.sandbox = {
      allowedModules: config?.sandbox?.allowedModules ?? ['string', 'table', 'math'],
      blockedFunctions: [
        'os.execute',
        'os.exit',
        'os.getenv',
        'os.remove',
        'os.rename',
        'os.tmpname',
        'io.open',
        'io.popen',
        'io.tmpfile',
        'io.input',
        'io.output',
        'loadfile',
        'dofile',
        'require',
        'package.loadlib'
      ],
      maxMemory: config?.sandbox?.maxMemory ?? 512 * 1024 * 1024, // 512MB
      maxExecutionTime: config?.sandbox?.maxExecutionTime ?? 30000 // 30s
    };
  }

  /**
   * Initialize Lua engine with sandbox
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    this.lua = await this.factory.createEngine();

    // Set up sandbox
    await this.setupSandbox();

    // Inject APIs
    await this.injectAPIs();

    this.initialized = true;
  }

  /**
   * Set up sandboxed environment
   */
  private async setupSandbox(): Promise<void> {
    if (!this.lua) throw new Error('Lua engine not initialized');

    // Remove dangerous modules
    await this.lua.doString(`
      -- Remove dangerous modules
      os = {
        time = os.time,
        date = os.date,
        clock = os.clock,
        difftime = os.difftime
      }

      -- Remove io completely
      io = nil

      -- Remove debug
      debug = nil

      -- Remove package/require
      package = nil
      require = nil
      loadfile = nil
      dofile = nil
    `);

    // Set memory limit (if supported by Lua runtime)
    try {
      await this.lua.doString(`
        collectgarbage("setpause", 100)
        collectgarbage("setstepmul", 200)
      `);
    } catch (error) {
      console.warn('[LuaRuntime] Could not set GC parameters:', error);
    }
  }

  /**
   * Inject safe APIs into Lua environment
   */
  private async injectAPIs(): Promise<void> {
    if (!this.lua) throw new Error('Lua engine not initialized');

    // Create glyphcase API
    const glyphcaseAPI = {
      query: (sql: string, ...params: any[]) => {
        return this.capsule.query(sql, params);
      },

      queryOne: (sql: string, ...params: any[]) => {
        const results = this.capsule.query(sql, params);
        return results[0] ?? null;
      },

      queryScalar: (sql: string, ...params: any[]) => {
        const results = this.capsule.query(sql, params);
        if (results.length === 0) return null;
        const firstRow = results[0];
        const firstKey = Object.keys(firstRow)[0];
        return firstRow[firstKey];
      },

      insert: (table: string, data: any) => {
        return this.capsule.insert(table, data);
      },

      update: (table: string, id: number, data: any) => {
        return this.capsule.update(table, id, data);
      },

      delete: (table: string, id: number) => {
        return this.capsule.delete(table, id);
      },

      dispatch: (action: string, payload: any) => {
        this.eventBus.emit(action, payload);
      },

      execute: (sql: string) => {
        const db = this.capsule.getDatabase();
        db.exec(sql);
      },

      transaction: (fn: Function) => {
        return this.capsule.transaction(() => fn());
      }
    };

    // Create actionbus API
    const actionbusAPI = {
      dispatch: (action: string, payload: any) => {
        this.eventBus.emit(action, payload);
      },

      register: (action: string, handler: Function) => {
        return this.eventBus.on(action, (data) => handler(data));
      }
    };

    // Create crypto API
    const cryptoAPI = {
      uuid: () => {
        return crypto.randomUUID();
      },

      // Note: bcrypt would require additional dependency
      // Left as placeholder for implementation
      bcrypt: (_password: string) => {
        throw new Error('bcrypt not yet implemented - add bcrypt dependency');
      },

      verify: (_password: string, _hash: string) => {
        throw new Error('bcrypt not yet implemented - add bcrypt dependency');
      }
    };

    // Create scheduler API (simplified)
    const schedulerAPI = {
      every: (interval: string, fn: Function) => {
        // Parse interval (e.g., "1h", "30m", "5s")
        const ms = this.parseInterval(interval);
        return setInterval(() => fn(), ms);
      },

      after: (delay: string, fn: Function) => {
        const ms = this.parseInterval(delay);
        return setTimeout(() => fn(), ms);
      },

      stop_all: () => {
        // Would need to track timers to implement properly
        console.warn('[LuaRuntime] scheduler.stop_all not fully implemented');
      }
    };

    // Create cache API (in-memory)
    const cache = new Map<string, { value: any; expiry: number }>();

    const cacheAPI = {
      set: (key: string, value: any, ttl?: string) => {
        const expiry = ttl ? Date.now() + this.parseInterval(ttl) : Infinity;
        cache.set(key, { value, expiry });
      },

      get: (key: string) => {
        const item = cache.get(key);
        if (!item) return null;
        if (item.expiry < Date.now()) {
          cache.delete(key);
          return null;
        }
        return item.value;
      },

      delete: (key: string) => {
        cache.delete(key);
      }
    };

    // Inject all APIs into Lua global scope
    this.lua.global.set('glyphcase', glyphcaseAPI);
    this.lua.global.set('actionbus', actionbusAPI);
    this.lua.global.set('crypto', cryptoAPI);
    this.lua.global.set('scheduler', schedulerAPI);
    this.lua.global.set('cache', cacheAPI);
  }

  /**
   * Parse time interval string to milliseconds
   */
  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid interval format: ${interval}`);

    const [, amount, unit] = match;
    const num = parseInt(amount, 10);

    switch (unit) {
      case 's': return num * 1000;
      case 'm': return num * 60 * 1000;
      case 'h': return num * 60 * 60 * 1000;
      case 'd': return num * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid interval unit: ${unit}`);
    }
  }

  /**
   * Execute Lua script
   */
  async execute(script: string): Promise<any> {
    if (!this.lua || !this.initialized) {
      await this.init();
    }

    try {
      // Set execution timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Lua execution timeout')), this.sandbox.maxExecutionTime);
      });

      const executionPromise = this.lua!.doString(script);

      return await Promise.race([executionPromise, timeoutPromise]);
    } catch (error) {
      console.error('[LuaRuntime] Execution error:', error);
      throw error;
    }
  }

  /**
   * Call a Lua function
   */
  async callFunction(name: string, ...args: any[]): Promise<any> {
    if (!this.lua || !this.initialized) {
      await this.init();
    }

    const luaFunction = this.lua!.global.get(name);
    if (typeof luaFunction !== 'function') {
      throw new Error(`Lua function '${name}' not found`);
    }

    return await luaFunction(...args);
  }

  /**
   * Check if a Lua function exists
   */
  async hasFunction(name: string): Promise<boolean> {
    if (!this.lua || !this.initialized) {
      await this.init();
    }

    const luaFunction = this.lua!.global.get(name);
    return typeof luaFunction === 'function';
  }

  /**
   * Set a global Lua variable
   */
  async setGlobal(name: string, value: any): Promise<void> {
    if (!this.lua || !this.initialized) {
      await this.init();
    }

    this.lua!.global.set(name, value);
  }

  /**
   * Get a global Lua variable
   */
  async getGlobal(name: string): Promise<any> {
    if (!this.lua || !this.initialized) {
      await this.init();
    }

    return this.lua!.global.get(name);
  }

  /**
   * Inject custom API into Lua
   */
  injectAPI(name: string, api: Record<string, Function>): void {
    if (!this.lua || !this.initialized) {
      throw new Error('Lua engine not initialized. Call init() first.');
    }

    this.lua.global.set(name, api);
  }

  /**
   * Clean up and close Lua engine
   */
  async close(): Promise<void> {
    if (this.lua) {
      this.lua.global.close();
      this.lua = null;
      this.initialized = false;
    }
  }
}
