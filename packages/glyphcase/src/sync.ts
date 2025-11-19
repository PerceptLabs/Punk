/**
 * Sync Engine
 * Optional cloud sync for GlyphCase databases
 */

import { v4 as uuid } from 'uuid';
import type { ActiveCapsule } from './capsule';
import type { SyncConfig, SyncResult, ChangeLog } from './types';

export class SyncEngine {
  private deviceId: string;
  private syncInProgress = false;
  private lastSyncTimestamp = 0;

  constructor(
    private capsule: ActiveCapsule,
    private config: SyncConfig
  ) {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupSyncTables();

    // Start auto-sync if interval is set
    if (config.interval && config.interval > 0) {
      this.startAutoSync();
    }
  }

  /**
   * Get or create unique device ID
   */
  private getOrCreateDeviceId(): string {
    const db = this.capsule.getDatabase();

    // Check if device ID exists
    const result = db.prepare('SELECT value FROM _sync_meta WHERE key = ?').get('device_id') as any;

    if (result) {
      return result.value;
    }

    // Create new device ID
    const deviceId = uuid();
    db.prepare('INSERT INTO _sync_meta (key, value) VALUES (?, ?)').run('device_id', deviceId);

    return deviceId;
  }

  /**
   * Setup sync tables
   */
  private setupSyncTables(): void {
    const db = this.capsule.getDatabase();

    // Sync metadata
    db.exec(`
      CREATE TABLE IF NOT EXISTS _sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Changelog for tracking local changes
    db.exec(`
      CREATE TABLE IF NOT EXISTS _sync_changelog (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
        row_id INTEGER NOT NULL,
        data JSON NOT NULL,
        timestamp INTEGER NOT NULL,
        synced BOOLEAN DEFAULT 0,
        sync_attempt INTEGER DEFAULT 0,
        UNIQUE(table_name, row_id, operation, timestamp)
      )
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sync_changelog_synced ON _sync_changelog(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_changelog_table ON _sync_changelog(table_name);
    `);
  }

  /**
   * Start automatic sync
   */
  private startAutoSync(): void {
    setInterval(async () => {
      if (!this.syncInProgress) {
        try {
          await this.sync();
        } catch (error) {
          console.error('[SyncEngine] Auto-sync error:', error);
        }
      }
    }, this.config.interval);
  }

  /**
   * Perform full sync (push + pull)
   */
  async sync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;

    try {
      // Push local changes
      const pushResult = await this.push();

      // Pull remote changes
      const pullResult = await this.pull();

      this.lastSyncTimestamp = Date.now();

      return {
        pushed: pushResult.pushed,
        pulled: pullResult.pulled,
        conflicts: (pushResult.conflicts ?? 0) + (pullResult.conflicts ?? 0),
        errors: [...(pushResult.errors ?? []), ...(pullResult.errors ?? [])]
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Push local changes to server
   */
  async push(): Promise<SyncResult> {
    const db = this.capsule.getDatabase();

    // Get unsynced changes
    const changes = db.prepare('SELECT * FROM _sync_changelog WHERE synced = 0 ORDER BY timestamp').all() as ChangeLog[];

    if (changes.length === 0) {
      return { pushed: 0, pulled: 0 };
    }

    // Filter by configured tables
    const filteredChanges = this.filterChangesByTables(changes);

    if (filteredChanges.length === 0) {
      return { pushed: 0, pulled: 0 };
    }

    // Build sync batch
    const batch = {
      version: 1,
      timestamp: Date.now(),
      deviceId: this.deviceId,
      changes: filteredChanges,
      checksum: this.calculateChecksum(filteredChanges)
    };

    try {
      // Send to server
      const response = await fetch(`${this.config.endpoint}/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        throw new Error(`Sync push failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Mark changes as synced
      const changeIds = filteredChanges.map(c => c.id);
      this.markChangesSynced(changeIds);

      return { pushed: filteredChanges.length, pulled: 0 };
    } catch (error) {
      console.error('[SyncEngine] Push error:', error);

      // Increment sync attempt counter
      const changeIds = filteredChanges.map(c => c.id);
      db.prepare(
        `UPDATE _sync_changelog SET sync_attempt = sync_attempt + 1 WHERE id IN (${changeIds.map(() => '?').join(', ')})`
      ).run(...changeIds);

      return {
        pushed: 0,
        pulled: 0,
        errors: [error as Error]
      };
    }
  }

  /**
   * Pull remote changes from server
   */
  async pull(): Promise<SyncResult> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/sync/pull?since=${this.lastSyncTimestamp}&device=${this.deviceId}`
      );

      if (!response.ok) {
        throw new Error(`Sync pull failed: ${response.statusText}`);
      }

      const { changes } = await response.json() as { changes: ChangeLog[] };

      let applied = 0;
      let conflicts = 0;
      const errors: Error[] = [];

      // Apply remote changes
      for (const change of changes) {
        try {
          const hasConflict = await this.hasLocalChange(change);

          if (hasConflict) {
            await this.resolveConflict(change);
            conflicts++;
          } else {
            await this.applyRemoteChange(change);
          }

          applied++;
        } catch (error) {
          console.error('[SyncEngine] Error applying change:', error);
          errors.push(error as Error);
        }
      }

      return { pushed: 0, pulled: applied, conflicts, errors };
    } catch (error) {
      console.error('[SyncEngine] Pull error:', error);
      return {
        pushed: 0,
        pulled: 0,
        errors: [error as Error]
      };
    }
  }

  /**
   * Check if there's a conflicting local change
   */
  private async hasLocalChange(remoteChange: ChangeLog): Promise<boolean> {
    const db = this.capsule.getDatabase();

    const result = db.prepare(
      `SELECT COUNT(*) as count FROM _sync_changelog
       WHERE table_name = ? AND row_id = ? AND synced = 0`
    ).get(remoteChange.tableName, remoteChange.rowId) as any;

    return result.count > 0;
  }

  /**
   * Resolve conflict between local and remote changes
   */
  async resolveConflict(remoteChange: ChangeLog): Promise<void> {
    if (this.config.conflictResolution === 'last-write-wins') {
      // Remote always wins in last-write-wins
      await this.applyRemoteChange(remoteChange);

      // Mark local change as synced
      const db = this.capsule.getDatabase();
      db.prepare(
        `UPDATE _sync_changelog SET synced = 1
         WHERE table_name = ? AND row_id = ? AND synced = 0`
      ).run(remoteChange.tableName, remoteChange.rowId);
    } else if (this.config.conflictResolver) {
      // Custom resolution
      const db = this.capsule.getDatabase();
      const localRow = db.prepare(
        `SELECT * FROM ${remoteChange.tableName} WHERE id = ?`
      ).get(remoteChange.rowId);

      const resolved = this.config.conflictResolver(localRow, remoteChange.data);

      // Apply resolved data
      await this.capsule.update(remoteChange.tableName, remoteChange.rowId, resolved);
    }
  }

  /**
   * Apply remote change to local database
   */
  private async applyRemoteChange(change: ChangeLog): Promise<void> {
    const { tableName, operation, rowId, data } = change;

    switch (operation) {
      case 'INSERT':
        await this.capsule.insert(tableName, data);
        break;

      case 'UPDATE':
        await this.capsule.update(tableName, rowId, data);
        break;

      case 'DELETE':
        await this.capsule.delete(tableName, rowId);
        break;
    }
  }

  /**
   * Filter changes by configured tables
   */
  private filterChangesByTables(changes: ChangeLog[]): ChangeLog[] {
    if (!this.config.tables && !this.config.exclude) {
      return changes;
    }

    return changes.filter(change => {
      // Exclude tables
      if (this.config.exclude?.includes(change.tableName)) {
        return false;
      }

      // Include only specific tables
      if (this.config.tables && !this.config.tables.includes(change.tableName)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Mark changes as synced
   */
  private markChangesSynced(changeIds: string[]): void {
    const db = this.capsule.getDatabase();

    db.prepare(
      `UPDATE _sync_changelog SET synced = 1
       WHERE id IN (${changeIds.map(() => '?').join(', ')})`
    ).run(...changeIds);
  }

  /**
   * Calculate checksum for changes
   */
  private calculateChecksum(changes: ChangeLog[]): string {
    const data = JSON.stringify(changes);
    // Simple checksum - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get last sync timestamp
   */
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }

  /**
   * Record a change for syncing
   */
  recordChange(tableName: string, operation: 'INSERT' | 'UPDATE' | 'DELETE', rowId: number, data: any): void {
    const db = this.capsule.getDatabase();

    const changeLog: ChangeLog = {
      id: uuid(),
      tableName,
      operation,
      rowId,
      data,
      timestamp: Date.now(),
      synced: false
    };

    db.prepare(`
      INSERT INTO _sync_changelog (id, table_name, operation, row_id, data, timestamp, synced)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      changeLog.id,
      changeLog.tableName,
      changeLog.operation,
      changeLog.rowId,
      JSON.stringify(changeLog.data),
      changeLog.timestamp,
      0
    );
  }
}
