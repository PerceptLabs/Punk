/**
 * Lua API Bindings
 * Creates safe API bindings for Lua scripts
 */

import type { ActiveCapsule } from './capsule';
import type { EventBus } from './events';

export interface LuaBindings {
  glyphcase: GlyphCaseAPI;
  actionbus: ActionBusAPI;
  crypto: CryptoAPI;
  scheduler: SchedulerAPI;
  cache: CacheAPI;
}

export interface GlyphCaseAPI {
  query: (sql: string, ...params: any[]) => any[];
  queryOne: (sql: string, ...params: any[]) => any | null;
  queryScalar: (sql: string, ...params: any[]) => any;
  insert: (table: string, data: any) => number;
  insertMultiple: (table: string, rows: any[]) => number[];
  update: (table: string, id: number, data: any) => void;
  updateWhere: (table: string, where: string, whereParams: any[], data: any) => void;
  delete: (table: string, id: number) => void;
  deleteWhere: (table: string, where: string, whereParams: any[]) => void;
  execute: (sql: string) => void;
  transaction: (fn: Function) => any;
  dispatch: (action: string, payload: any) => void;
  watch: (table: string, callback: Function, filter?: string) => Function;
}

export interface ActionBusAPI {
  dispatch: (action: string, payload: any) => void;
  register: (action: string, handler: Function) => Function;
}

export interface CryptoAPI {
  uuid: () => string;
  bcrypt: (password: string) => string;
  verify: (password: string, hash: string) => boolean;
}

export interface SchedulerAPI {
  every: (interval: string, fn: Function) => any;
  after: (delay: string, fn: Function) => any;
  stop_all: () => void;
}

export interface CacheAPI {
  set: (key: string, value: any, ttl?: string) => void;
  get: (key: string) => any;
  delete: (key: string) => void;
  clear: () => void;
}

/**
 * Create Lua bindings for GlyphCase APIs
 */
export function createLuaBindings(
  capsule: ActiveCapsule,
  eventBus: EventBus
): LuaBindings {
  // In-memory cache
  const cache = new Map<string, { value: any; expiry: number }>();

  // Timer tracking for scheduler
  const timers: Set<NodeJS.Timeout> = new Set();

  return {
    glyphcase: {
      query: (sql: string, ...params: any[]) => {
        return capsule.query(sql, params);
      },

      queryOne: (sql: string, ...params: any[]) => {
        const results = capsule.query(sql, params);
        return results[0] ?? null;
      },

      queryScalar: (sql: string, ...params: any[]) => {
        const results = capsule.query(sql, params);
        if (results.length === 0) return null;
        const firstRow = results[0];
        const firstKey = Object.keys(firstRow)[0];
        return firstRow[firstKey];
      },

      insert: (table: string, data: any) => {
        return capsule.insert(table, data);
      },

      insertMultiple: (table: string, rows: any[]) => {
        return rows.map(row => capsule.insert(table, row));
      },

      update: (table: string, id: number, data: any) => {
        capsule.update(table, id, data);
      },

      updateWhere: (table: string, where: string, whereParams: any[], data: any) => {
        const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`;
        const db = capsule.getDatabase();
        db.prepare(sql).run(...values);
      },

      delete: (table: string, id: number) => {
        capsule.delete(table, id);
      },

      deleteWhere: (table: string, where: string, whereParams: any[]) => {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const db = capsule.getDatabase();
        db.prepare(sql).run(...whereParams);
      },

      execute: (sql: string) => {
        const db = capsule.getDatabase();
        db.exec(sql);
      },

      transaction: (fn: Function) => {
        return capsule.transaction(() => fn());
      },

      dispatch: (action: string, payload: any) => {
        eventBus.emit(action, payload);
      },

      watch: (table: string, callback: Function, filter?: string) => {
        return capsule.watch(table, (events) => callback(events), filter);
      }
    },

    actionbus: {
      dispatch: (action: string, payload: any) => {
        eventBus.emit(action, payload);
      },

      register: (action: string, handler: Function) => {
        return eventBus.on(action, (data) => handler(data));
      }
    },

    crypto: {
      uuid: () => {
        return crypto.randomUUID();
      },

      bcrypt: (password: string) => {
        // Placeholder - requires bcrypt package
        throw new Error('bcrypt not implemented - add bcrypt package');
      },

      verify: (password: string, hash: string) => {
        // Placeholder - requires bcrypt package
        throw new Error('bcrypt verify not implemented - add bcrypt package');
      }
    },

    scheduler: {
      every: (interval: string, fn: Function) => {
        const ms = parseInterval(interval);
        const timer = setInterval(() => {
          try {
            fn();
          } catch (error) {
            console.error('[Scheduler] Error in interval function:', error);
          }
        }, ms);
        timers.add(timer);
        return timer;
      },

      after: (delay: string, fn: Function) => {
        const ms = parseInterval(delay);
        const timer = setTimeout(() => {
          try {
            fn();
          } catch (error) {
            console.error('[Scheduler] Error in timeout function:', error);
          } finally {
            timers.delete(timer);
          }
        }, ms);
        timers.add(timer);
        return timer;
      },

      stop_all: () => {
        for (const timer of timers) {
          clearTimeout(timer);
          clearInterval(timer);
        }
        timers.clear();
      }
    },

    cache: {
      set: (key: string, value: any, ttl?: string) => {
        const expiry = ttl ? Date.now() + parseInterval(ttl) : Infinity;
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
      },

      clear: () => {
        cache.clear();
      }
    }
  };
}

/**
 * Parse time interval string to milliseconds
 */
function parseInterval(interval: string): number {
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
