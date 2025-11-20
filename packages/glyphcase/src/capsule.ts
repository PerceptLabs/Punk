/**
 * Active Capsule
 * Reactive database layer with automatic change detection
 */

import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import { EventBus } from './events';
import { loggers } from './logger';
import type {
  Watcher,
  ChangeEvent,
  WatchCallback,
  UnwatchFn,
  GlyphCaseConfig,
  TableDef,
  ColumnDef
} from './types';

export class ActiveCapsule {
  private db: Database.Database;
  private eventBus: EventBus;
  private watchers: Map<string, Watcher> = new Map();
  private eventQueue: ChangeEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private batchInterval: number;
  private batchSize: number;
  private transactionId: string | null = null;

  constructor(dbPath: string, config?: GlyphCaseConfig) {
    this.db = new Database(dbPath);
    this.eventBus = new EventBus();
    this.batchInterval = config?.capsule?.batchInterval ?? 100;
    this.batchSize = config?.capsule?.batchSize ?? 100;

    loggers.capsule.info('ActiveCapsule initialized', {
      dbPath,
      batchInterval: this.batchInterval,
      batchSize: this.batchSize,
    });

    this.setupDatabase();
    this.setupTriggers();

    const watcherCount = this.watchers.size;
    loggers.capsule.debug('Database setup complete', { watcherCount });
  }

  /**
   * Initialize internal capsule tables
   */
  private setupDatabase(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Watchers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _capsule_watchers (
        id TEXT PRIMARY KEY,
        table_or_query TEXT NOT NULL,
        filter_expression TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        subscription_count INTEGER DEFAULT 0
      )
    `);

    // Events table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _capsule_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        watcher_id TEXT NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
        table_name TEXT NOT NULL,
        row_id INTEGER,
        old_data JSON,
        new_data JSON NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        transaction_id TEXT,
        source TEXT DEFAULT 'trigger',
        FOREIGN KEY (watcher_id) REFERENCES _capsule_watchers(id)
      )
    `);

    // Subscriptions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _capsule_subscriptions (
        id TEXT PRIMARY KEY,
        watcher_id TEXT NOT NULL,
        listener_id TEXT NOT NULL,
        listener_type TEXT NOT NULL CHECK(listener_type IN ('lua', 'react', 'custom')),
        filter_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (watcher_id) REFERENCES _capsule_watchers(id)
      )
    `);

    // Transactions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _capsule_transactions (
        id TEXT PRIMARY KEY,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'committed', 'rolled_back')),
        event_count INTEGER DEFAULT 0,
        source TEXT
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_capsule_events_watcher ON _capsule_events(watcher_id);
      CREATE INDEX IF NOT EXISTS idx_capsule_events_timestamp ON _capsule_events(timestamp);
      CREATE INDEX IF NOT EXISTS idx_capsule_events_table ON _capsule_events(table_name);
      CREATE INDEX IF NOT EXISTS idx_capsule_subscriptions_watcher ON _capsule_subscriptions(watcher_id);
    `);
  }

  /**
   * Setup triggers for existing tables
   */
  private setupTriggers(): void {
    // Load existing watchers
    const watchers = this.db.prepare('SELECT * FROM _capsule_watchers WHERE is_active = 1').all() as Array<{
      id: string;
      table_or_query: string;
      filter_expression?: string;
      created_at: string;
    }>;

    for (const w of watchers) {
      const watcher: Watcher = {
        id: w.id,
        tableOrQuery: w.table_or_query,
        filterExpression: w.filter_expression,
        subscriptions: new Set(),
        createdAt: new Date(w.created_at)
      };
      this.watchers.set(watcher.id, watcher);
    }
  }

  /**
   * Create table with Active Capsule support
   */
  createTable(tableDef: TableDef): void {
    const { name, columns, capsule } = tableDef;

    loggers.capsule.info('Creating table', {
      name,
      columnCount: columns.length,
      reactive: capsule?.watch ?? false,
    });

    // Build CREATE TABLE statement
    const columnDefs = columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.primary) def += ' PRIMARY KEY';
      if (col.unique) def += ' UNIQUE';
      if (col.notNull) def += ' NOT NULL';
      if (col.default !== undefined) {
        def += ` DEFAULT ${typeof col.default === 'string' ? `'${col.default}'` : col.default}`;
      }
      return def;
    }).join(', ');

    this.db.exec(`CREATE TABLE IF NOT EXISTS ${name} (${columnDefs})`);

    // Enable Active Capsule if requested
    if (capsule?.watch) {
      this.createTriggersForTable(name, columns);
      loggers.capsule.debug('Reactive triggers created', { table: name });
    }
  }

  /**
   * Create triggers for a table
   */
  private createTriggersForTable(tableName: string, columns: ColumnDef[]): void {
    const columnNames = columns.map(c => c.name);
    const jsonObject = columnNames.map(c => `'${c}', NEW.${c}`).join(', ');
    const oldJsonObject = columnNames.map(c => `'${c}', OLD.${c}`).join(', ');

    // INSERT trigger
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS ${tableName}_capsule_insert
      AFTER INSERT ON ${tableName}
      FOR EACH ROW
      BEGIN
        INSERT INTO _capsule_events (watcher_id, operation, table_name, row_id, new_data, timestamp)
        SELECT id, 'INSERT', '${tableName}', NEW.rowid, json_object(${jsonObject}), CURRENT_TIMESTAMP
        FROM _capsule_watchers
        WHERE table_or_query = '${tableName}' AND is_active = 1;
      END
    `);

    // UPDATE trigger
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS ${tableName}_capsule_update
      AFTER UPDATE ON ${tableName}
      FOR EACH ROW
      BEGIN
        INSERT INTO _capsule_events (watcher_id, operation, table_name, row_id, old_data, new_data, timestamp)
        SELECT id, 'UPDATE', '${tableName}', NEW.rowid, json_object(${oldJsonObject}), json_object(${jsonObject}), CURRENT_TIMESTAMP
        FROM _capsule_watchers
        WHERE table_or_query = '${tableName}' AND is_active = 1;
      END
    `);

    // DELETE trigger
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS ${tableName}_capsule_delete
      AFTER DELETE ON ${tableName}
      FOR EACH ROW
      BEGIN
        INSERT INTO _capsule_events (watcher_id, operation, table_name, row_id, old_data, timestamp)
        SELECT id, 'DELETE', '${tableName}', OLD.rowid, json_object(${oldJsonObject}), CURRENT_TIMESTAMP
        FROM _capsule_watchers
        WHERE table_or_query = '${tableName}' AND is_active = 1;
      END
    `);
  }

  /**
   * Execute SQL query
   */
  query(sql: string, params?: any[]): any[] {
    const stmt = this.db.prepare(sql);
    return params ? stmt.all(...params) : stmt.all();
  }

  /**
   * Insert data into table
   */
  insert(table: string, data: Record<string, any>): number {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const stmt = this.db.prepare(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
    );

    const result = stmt.run(...values);
    const rowId = result.lastInsertRowid as number;

    loggers.capsule.debug('Row inserted', { table, rowId, fieldCount: keys.length });

    return rowId;
  }

  /**
   * Update data in table
   */
  update(table: string, id: number, data: Record<string, any>): void {
    const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);

    const stmt = this.db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`);
    const result = stmt.run(...values, id);

    loggers.capsule.debug('Row updated', { table, id, changes: result.changes });
  }

  /**
   * Delete row from table
   */
  delete(table: string, id: number): void {
    const stmt = this.db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    const result = stmt.run(id);

    loggers.capsule.debug('Row deleted', { table, id, changes: result.changes });
  }

  /**
   * Watch a table for changes
   */
  watch(table: string, callback: WatchCallback, filter?: string): UnwatchFn {
    const watcherId = uuid();

    loggers.capsule.info('Watcher registered', {
      watcherId,
      table,
      hasFilter: !!filter,
    });

    // Create watcher record
    this.db.prepare(`
      INSERT INTO _capsule_watchers (id, table_or_query, filter_expression)
      VALUES (?, ?, ?)
    `).run(watcherId, table, filter ?? null);

    const watcher: Watcher = {
      id: watcherId,
      tableOrQuery: table,
      filterExpression: filter,
      subscriptions: new Set(),
      createdAt: new Date()
    };

    this.watchers.set(watcherId, watcher);

    // Subscribe to events
    const unsubscribe = this.eventBus.on(`watcher:${watcherId}`, callback);

    // Return unwatch function
    return () => {
      loggers.capsule.debug('Watcher unregistered', { watcherId, table });
      unsubscribe();
      this.watchers.delete(watcherId);
      this.db.prepare('UPDATE _capsule_watchers SET is_active = 0 WHERE id = ?').run(watcherId);
    };
  }

  /**
   * Process batched events
   */
  private processBatch(): void {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.batchSize);
    this.batchTimer = null;

    // Group by watcher
    const byWatcher = new Map<string, ChangeEvent[]>();
    for (const event of batch) {
      // Find watchers for this table
      for (const [watcherId, watcher] of this.watchers) {
        if (watcher.tableOrQuery === event.tableName) {
          if (!byWatcher.has(watcherId)) {
            byWatcher.set(watcherId, []);
          }
          byWatcher.get(watcherId)!.push({ ...event, watcherId });
        }
      }
    }

    // Emit to subscribers
    for (const [watcherId, events] of byWatcher) {
      this.eventBus.emit(`watcher:${watcherId}`, events);
    }

    // Process remaining events if any
    if (this.eventQueue.length > 0) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchInterval);
    }
  }

  /**
   * Start a transaction
   */
  transaction<T>(fn: () => T): T {
    this.transactionId = uuid();

    this.db.prepare(`
      INSERT INTO _capsule_transactions (id, status, source)
      VALUES (?, 'active', 'user')
    `).run(this.transactionId);

    try {
      const result = this.db.transaction(fn)();

      this.db.prepare(`
        UPDATE _capsule_transactions
        SET status = 'committed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(this.transactionId);

      return result;
    } catch (error) {
      this.db.prepare(`
        UPDATE _capsule_transactions
        SET status = 'rolled_back', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(this.transactionId);

      throw error;
    } finally {
      this.transactionId = null;
    }
  }

  /**
   * Clean up old events
   */
  cleanup(retentionDays: number = 7): void {
    this.db.prepare(`
      DELETE FROM _capsule_events
      WHERE timestamp < datetime('now', '-${retentionDays} days')
      AND source != 'sync'
    `).run();

    this.db.exec('VACUUM');
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Get underlying database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Get event bus
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
}
