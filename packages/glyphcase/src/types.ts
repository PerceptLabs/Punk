/**
 * GlyphCase Core Types
 * TypeScript interfaces for Active Capsule reactive database
 */

import type Database from 'better-sqlite3';

// ============================================================================
// Active Capsule Types
// ============================================================================

export interface Watcher {
  id: string;
  tableOrQuery: string;
  filterExpression?: string;
  subscriptions: Set<string>;
  createdAt: Date;
}

export interface ChangeEvent {
  watcherId: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  tableName: string;
  rowId: number;
  oldData?: Record<string, any>;
  newData: Record<string, any>;
  timestamp: Date;
  transactionId: string;
}

export interface Subscription {
  id: string;
  watcherId: string;
  listenerId: string;
  filter?: (event: ChangeEvent) => boolean;
  handler: (event: ChangeEvent) => void;
}

export type WatchCallback = (events: ChangeEvent[]) => void;
export type UnwatchFn = () => void;
export type UnsubscribeFn = () => void;

// ============================================================================
// Event Bus Types
// ============================================================================

export interface Subscriber {
  id: string;
  handler: (data: any) => void;
  once?: boolean;
}

export type EventHandler = (data: any) => void;

// ============================================================================
// Lua Runtime Types
// ============================================================================

export interface LuaSandbox {
  allowedModules: string[];
  blockedFunctions: string[];
  maxMemory?: number;
  maxExecutionTime?: number;
}

export interface LuaConfig {
  runtime: '5.4' | 'jit';
  sandbox?: Partial<LuaSandbox>;
}

// ============================================================================
// Skill Types
// ============================================================================

export interface SkillManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  extends?: {
    components?: string[];
    actions?: string[];
    templates?: string[];
  };
  permissions?: {
    database?: boolean;
    network?: boolean;
    filesystem?: boolean;
    lua?: Partial<LuaConfig> & {
      enabled: boolean;
    };
  };
  dependencies?: Record<string, string>;
}

export interface SkillComponent {
  name: string;
  path: string;
  type: 'punk' | 'tsx' | 'jsx';
}

export interface SkillTemplate {
  name: string;
  path: string;
  type: 'api' | 'worker' | 'cron';
}

export interface Skill {
  id: string;
  name: string;
  version: string;
  manifest: SkillManifest;
  luaScripts: Map<string, string>;
  components: SkillComponent[];
  templates: SkillTemplate[];
  dbPath?: string;
}

export type SkillHook = 'on_install' | 'on_activate' | 'on_deactivate';

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncConfig {
  enabled: boolean;
  endpoint: string;
  interval?: number;
  conflictResolution: 'last-write-wins' | 'custom';
  conflictResolver?: (local: any, remote: any) => any;
  tables?: string[];
  exclude?: string[];
  maxRetries?: number;
  retryDelay?: number;
  compression?: 'gzip' | 'brotli' | 'none';
  encryption?: {
    enabled: boolean;
    algorithm: 'AES-256-GCM';
    keyDerivation: 'PBKDF2';
  };
}

export interface SyncResult {
  pushed: number;
  pulled: number;
  conflicts?: number;
  errors?: Error[];
}

export interface ChangeLog {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  rowId: number;
  data: any;
  timestamp: number;
  synced: boolean;
}

// ============================================================================
// Database Schema Types
// ============================================================================

export interface ColumnDef {
  name: string;
  type: 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'JSON';
  primary?: boolean;
  autoIncrement?: boolean;
  unique?: boolean;
  notNull?: boolean;
  default?: any;
}

export interface ForeignKeyDef {
  columns: string[];
  references: {
    table: string;
    columns: string[];
  };
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export interface TableDef {
  name: string;
  columns: ColumnDef[];
  indexes?: IndexDef[];
  foreignKeys?: ForeignKeyDef[];
  capsule?: {
    watch: boolean;
    batchSize?: number;
    retentionDays?: number;
  };
}

export interface IndexDef {
  name: string;
  columns: string[];
  unique?: boolean;
}

export interface SchemaDefinition {
  tables: TableDef[];
  indexes?: IndexDef[];
}

// ============================================================================
// GlyphCase Config
// ============================================================================

export interface GlyphCaseConfig {
  dbPath: string;
  schema?: SchemaDefinition;
  capsule?: {
    enabled: boolean;
    batchInterval?: number;
    batchSize?: number;
  };
  sync?: SyncConfig;
  lua?: LuaConfig;
}
