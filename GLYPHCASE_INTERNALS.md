# GlyphCase Internals: Active Capsule Technical Deep Dive

**Document Version:** 1.0.0
**Last Updated:** November 19, 2025
**Status:** Active Development

---

## Table of Contents

1. [What is Active Capsule?](#1-what-is-active-capsule)
2. [Architecture Overview](#2-architecture-overview)
3. [Reactive System](#3-reactive-system)
4. [Database Schema](#4-database-schema)
5. [Lua Integration](#5-lua-integration)
6. [Sync Protocol](#6-sync-protocol)
7. [Performance Characteristics](#7-performance-characteristics)
8. [Implementation Guide](#8-implementation-guide)
9. [Advanced Topics](#9-advanced-topics)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What is Active Capsule?

### 1.1 Definition

**Active Capsule** is the reactive data binding system that sits on top of SQLite. It automatically detects changes to the database and emits events to subscribers, enabling real-time UI updates without polling or manual subscriptions.

Unlike traditional SQLite which is a passive storage layer, Active Capsule makes SQLite reactive through:
- **Change detection** - Monitors INSERT, UPDATE, DELETE operations
- **Event emission** - Broadcasts data changes to listeners
- **Reactive binding** - Automatically updates UI components and Lua scripts
- **Subscriptions** - Allows fine-grained subscriptions to specific table changes

### 1.2 Why "Active"?

The term "Active" refers to the system's proactive behavior:

```
Traditional SQLite:          Active Capsule:
────────────────             ───────────────
Passive Storage              Active Monitoring
  ↓                            ↓
Manual Queries               Automatic Detection
  ↓                            ↓
Manual Updates               Reactive Binding
  ↓                            ↓
Poll for Changes             Push Events to Listeners
  ↓                            ↓
Stale Data Risk              Always In Sync
```

**Key Characteristics:**
- **Reactive:** Changes propagate automatically
- **Event-driven:** Subscribers notified in real-time
- **Decoupled:** Database layer independent from UI
- **Performant:** Minimal overhead through batching and indexing
- **Safe:** Transactions ensure consistency

### 1.3 Core Concepts

#### Watcher
A watcher monitors a specific table or query for changes. It's defined by:
```typescript
interface Watcher {
  id: string                    // Unique identifier
  tableOrQuery: string          // Table name or SQL query
  filterExpression?: string     // Optional WHERE clause
  subscriptions: Set<string>    // Connected listeners
  createdAt: Date
}
```

#### Change Event
When data changes, a change event is emitted:
```typescript
interface ChangeEvent {
  watcherId: string             // Which watcher detected it
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  tableName: string
  rowId: number
  oldData?: Record<string, any> // Before UPDATE
  newData: Record<string, any>  // After INSERT/UPDATE
  timestamp: Date
  transactionId: string         // Groups related changes
}
```

#### Subscription
A subscription connects a listener to a watcher:
```typescript
interface Subscription {
  id: string                    // Unique identifier
  watcherId: string
  listenerId: string           // Component, Lua script, etc.
  filter?: (event: ChangeEvent) => boolean
  handler: (event: ChangeEvent) => void
}
```

---

## 2. Architecture Overview

### 2.1 Layered Design

```
┌────────────────────────────────────────────────────┐
│          Lua Runtime / React Components            │
│         (Subscribers & Event Handlers)             │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│         GlyphCase Event Bus                       │
│  • Emit events                                   │
│  • Manage subscriptions                          │
│  • Route to listeners                            │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│         Active Capsule (Change Detection)         │
│  • Monitor triggers                              │
│  • Batch changes                                 │
│  • Emit to event bus                             │
└────────────────────┬─────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────┐
│         SQLite Database + Internal Tables         │
│  • _capsule_watchers (track watched tables)      │
│  • _capsule_events (log changes)                 │
│  • _capsule_subscriptions (listener registry)    │
│  • User data tables                              │
└────────────────────────────────────────────────────┘
```

### 2.2 Component Relationships

```typescript
class GlyphCase {
  // Core SQLite wrapper
  private sqlite: Database

  // Active Capsule manager
  private capsule: ActiveCapsule

  // Event system
  private eventBus: EventBus

  // Change detection via triggers
  private triggers: TriggerManager

  // Lua runtime with bindings
  private luaVM: LuaVM

  // Sync engine (optional)
  private syncEngine?: SyncEngine

  // Constructor and methods
  constructor(config: GlyphCaseConfig) { }

  async query(sql: string, params?: any[]): Promise<any[]> { }
  async insert(table: string, data: Record<string, any>): Promise<number> { }
  async update(table: string, id: number, data: Record<string, any>): Promise<void> { }
  async delete(table: string, id: number): Promise<void> { }

  // Active Capsule methods
  watch(table: string, filter?: string): Watcher { }
  subscribe(watcher: Watcher, handler: EventHandler): Subscription { }
  unsubscribe(subscription: Subscription): void { }

  // Lua integration
  registerLuaFunction(name: string, fn: Function): void { }
  executeLuaScript(script: string): any { }

  // Sync methods
  async syncToCloud(endpoint: string): Promise<SyncResult> { }
  async pullFromCloud(endpoint: string): Promise<SyncResult> { }
}
```

---

## 3. Reactive System

### 3.1 Change Detection Mechanism

Active Capsule uses **SQLite triggers** for change detection. When any INSERT, UPDATE, or DELETE happens, triggers automatically log the change:

#### How It Works

```sql
-- Example: Trigger for INSERT on tasks table
CREATE TRIGGER tasks_insert_capsule
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
  INSERT INTO _capsule_events (
    operation,
    table_name,
    row_id,
    new_data,
    timestamp,
    watcher_id
  ) VALUES (
    'INSERT',
    'tasks',
    NEW.id,
    json_object(
      'id', NEW.id,
      'title', NEW.title,
      'completed', NEW.completed
    ),
    CURRENT_TIMESTAMP,
    (SELECT id FROM _capsule_watchers WHERE table_name = 'tasks')
  );
END;
```

#### Trigger Generation

Triggers are automatically created when:
1. A table is created in GlyphCase
2. A watcher is created for a table
3. Schema changes occur

```typescript
class TriggerManager {
  async createTriggersForTable(tableName: string): Promise<void> {
    // CREATE TRIGGER for INSERT
    await this.sqlite.run(`
      CREATE TRIGGER ${tableName}_insert_capsule
      AFTER INSERT ON ${tableName}
      FOR EACH ROW
      BEGIN
        INSERT INTO _capsule_events (
          operation, table_name, row_id, new_data, timestamp
        ) VALUES (
          'INSERT',
          '${tableName}',
          NEW.id,
          json_object(${this.buildJsonObject(tableName, 'NEW')}),
          CURRENT_TIMESTAMP
        );
      END
    `)

    // CREATE TRIGGER for UPDATE
    // CREATE TRIGGER for DELETE
    // (Similar structure)
  }

  private buildJsonObject(tableName: string, prefix: string): string {
    // Build JSON representation of row
  }
}
```

### 3.2 Event Emission Pipeline

```
┌─────────────────┐
│ Data Operation  │
│ (INSERT/UPDATE) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ SQLite Trigger Fires    │
│ Logs to _capsule_events │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ ActiveCapsule Batches   │
│ Changes (100ms window)  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ EventBus Emits          │
│ Events to Subscribers   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Handlers Execute        │
│ (Lua, React, custom)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ UI Updates              │
│ (Automatic Re-renders)  │
└─────────────────────────┘
```

### 3.3 Change Batching

To avoid event flooding, Active Capsule batches changes:

```typescript
class ActiveCapsule {
  private eventQueue: ChangeEvent[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private batchInterval = 100 // milliseconds

  async recordChange(event: ChangeEvent): Promise<void> {
    this.eventQueue.push(event)

    // Debounce batch processing
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.batchInterval)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const batch = this.eventQueue.splice(0)
    this.batchTimer = null

    // Group by watcher
    const byWatcher = new Map<string, ChangeEvent[]>()
    for (const event of batch) {
      const watcherId = event.watcherId
      if (!byWatcher.has(watcherId)) {
        byWatcher.set(watcherId, [])
      }
      byWatcher.get(watcherId)!.push(event)
    }

    // Emit to each watcher's subscribers
    for (const [watcherId, events] of byWatcher) {
      await this.eventBus.emit(`watcher:${watcherId}`, events)
    }
  }
}
```

### 3.4 Subscription Model

#### Pattern 1: Table-Level Subscription

```typescript
// Subscribe to all changes on a table
const watcher = glyphcase.watch('users')
const subscription = glyphcase.subscribe(watcher, (events) => {
  console.log('Users table changed:', events)
  // Update UI
})

// Unsubscribe when done
glyphcase.unsubscribe(subscription)
```

#### Pattern 2: Filtered Subscription

```typescript
// Subscribe to specific rows (e.g., active users)
const watcher = glyphcase.watch('users', 'WHERE status = "active"')
const subscription = glyphcase.subscribe(watcher, (events) => {
  console.log('Active users changed:', events)
})
```

#### Pattern 3: Query-Based Subscription

```typescript
// Subscribe to query results
const watcher = glyphcase.watch(
  'SELECT u.id, u.name, COUNT(t.id) as task_count FROM users u LEFT JOIN tasks t ON u.id = t.user_id GROUP BY u.id'
)
const subscription = glyphcase.subscribe(watcher, (events) => {
  console.log('User task counts changed:', events)
})
```

#### Pattern 4: Lua Integration

```lua
-- Automatically called when users table changes
function on_data_changed(table_name, operation, row)
  if table_name == "users" then
    print("User " .. row.id .. " was " .. operation)

    -- Dispatch action to frontend
    glyphcase.dispatch("user:changed", {
      userId = row.id,
      operation = operation,
      data = row
    })
  end
end
```

---

## 4. Database Schema

### 4.1 Internal Capsule Tables

GlyphCase creates several internal tables to manage the reactive system:

#### _capsule_watchers

Tracks all active watchers:

```sql
CREATE TABLE _capsule_watchers (
  id TEXT PRIMARY KEY,
  table_or_query TEXT NOT NULL,
  filter_expression TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexing
  is_active BOOLEAN DEFAULT 1,
  subscription_count INTEGER DEFAULT 0
);

CREATE INDEX idx_capsule_watchers_active ON _capsule_watchers(is_active);
```

**Fields:**
- `id` - Unique identifier (UUID v4)
- `table_or_query` - Table name (e.g., "users") or SQL query
- `filter_expression` - Optional WHERE clause for filtering
- `description` - Human-readable description
- `is_active` - Whether watcher is currently monitoring
- `subscription_count` - Number of active subscribers

#### _capsule_events

Log of all database changes:

```sql
CREATE TABLE _capsule_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  watcher_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  row_id INTEGER,
  old_data JSON,
  new_data JSON NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_id TEXT,
  source TEXT, -- 'trigger' | 'lua' | 'sync'

  FOREIGN KEY (watcher_id) REFERENCES _capsule_watchers(id)
);

CREATE INDEX idx_capsule_events_watcher ON _capsule_events(watcher_id);
CREATE INDEX idx_capsule_events_timestamp ON _capsule_events(timestamp);
CREATE INDEX idx_capsule_events_table ON _capsule_events(table_name);
```

**Fields:**
- `operation` - Type of change (INSERT, UPDATE, DELETE)
- `table_name` - Which table was affected
- `row_id` - Primary key of affected row
- `old_data` - Previous values (UPDATE/DELETE)
- `new_data` - New values (INSERT/UPDATE)
- `transaction_id` - Groups related changes

**Cleanup Policy:**
Events older than 7 days are automatically archived/deleted:

```sql
-- Cleanup old events (run daily)
DELETE FROM _capsule_events
WHERE timestamp < datetime('now', '-7 days')
AND source != 'sync'; -- Keep sync events longer
```

#### _capsule_subscriptions

Maps listeners to watchers:

```sql
CREATE TABLE _capsule_subscriptions (
  id TEXT PRIMARY KEY,
  watcher_id TEXT NOT NULL,
  listener_id TEXT NOT NULL,
  listener_type TEXT NOT NULL CHECK(listener_type IN ('lua', 'react', 'custom')),
  filter_json TEXT, -- Serialized filter function
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,

  FOREIGN KEY (watcher_id) REFERENCES _capsule_watchers(id)
);

CREATE INDEX idx_capsule_subscriptions_watcher ON _capsule_subscriptions(watcher_id);
CREATE INDEX idx_capsule_subscriptions_listener ON _capsule_subscriptions(listener_id);
```

#### _capsule_transactions

Tracks transaction boundaries for atomic operations:

```sql
CREATE TABLE _capsule_transactions (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'committed', 'rolled_back')),
  event_count INTEGER DEFAULT 0,
  source TEXT
);

CREATE INDEX idx_capsule_transactions_status ON _capsule_transactions(status);
```

### 4.2 Creating Capsule Tables

#### Declarative Schema

```typescript
// Define tables with Active Capsule support
interface SchemaDefinition {
  tables: TableDef[]
  indexes: IndexDef[]
  triggers?: TriggerDef[]
}

interface TableDef {
  name: string
  columns: ColumnDef[]
  capsule?: {
    watch: true           // Enable Active Capsule
    batchSize?: number    // Events per batch
    retentionDays?: number // How long to keep events
  }
}

interface ColumnDef {
  name: string
  type: 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'JSON'
  primary?: boolean
  unique?: boolean
  notNull?: boolean
  default?: any
}
```

#### Example: Creating a Capsule Table

```typescript
const db = new GlyphCase({
  filename: 'app.db',
  schema: {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true },
          { name: 'email', type: 'TEXT', unique: true },
          { name: 'name', type: 'TEXT', notNull: true },
          { name: 'status', type: 'TEXT', default: 'active' },
          { name: 'created_at', type: 'INTEGER', default: () => Date.now() }
        ],
        capsule: {
          watch: true,
          retentionDays: 30
        }
      }
    ]
  }
})

// Automatically creates:
// - users table
// - _capsule_watchers entry
// - _capsule_events tracking
// - SQLite triggers
```

---

## 5. Lua Integration

### 5.1 Lua API Reference

GlyphCase provides a sandboxed Lua environment with specific APIs:

#### glyphcase.query()

Execute SQL query:

```lua
-- SELECT query
local users = glyphcase.query("SELECT * FROM users WHERE status = ?", {"active"})
for _, user in ipairs(users) do
  print("User: " .. user.name)
end

-- Single result
local user = glyphcase.queryOne("SELECT * FROM users WHERE id = ?", {1})
if user then
  print("Found: " .. user.name)
end

-- Count
local count = glyphcase.queryScalar("SELECT COUNT(*) FROM users")
print("Total users: " .. count)
```

#### glyphcase.insert()

Insert rows:

```lua
-- Insert single row
local user_id = glyphcase.insert("users", {
  email = "alice@example.com",
  name = "Alice",
  status = "active"
})

print("Created user: " .. user_id)

-- Insert multiple
glyphcase.insertMultiple("users", {
  { email = "bob@example.com", name = "Bob" },
  { email = "charlie@example.com", name = "Charlie" }
})
```

#### glyphcase.update()

Update rows:

```lua
-- Update by ID
glyphcase.update("users", 1, {
  name = "Alice Updated",
  status = "inactive"
})

-- Update with WHERE clause
glyphcase.updateWhere("users", "status = ?", { "inactive" }, {
  updated_at = os.time()
})
```

#### glyphcase.delete()

Delete rows:

```lua
-- Delete by ID
glyphcase.delete("users", 1)

-- Delete with WHERE
glyphcase.deleteWhere("users", "status = ?", { "deleted" })
```

#### glyphcase.transaction()

Atomic operations:

```lua
glyphcase.transaction(function()
  -- All operations here are atomic
  local user = glyphcase.insert("users", {
    email = "test@example.com",
    name = "Test User"
  })

  glyphcase.insert("user_profiles", {
    user_id = user,
    bio = "Initial bio"
  })

  -- If any error occurs, all changes are rolled back
end)
```

#### glyphcase.watch()

Create watchers from Lua:

```lua
-- Watch entire table
glyphcase.watch("users", function(events)
  for _, event in ipairs(events) do
    if event.operation == "INSERT" then
      print("New user: " .. event.new_data.email)
      -- Send welcome email
      send_email(event.new_data.email, "Welcome!")
    elseif event.operation == "DELETE" then
      print("Deleted user: " .. event.old_data.email)
    end
  end
end)

-- Watch with filter
glyphcase.watch("users", "WHERE status = 'premium'", function(events)
  print("Premium users changed: " .. #events .. " events")
end)
```

#### glyphcase.dispatch()

Send events to ActionBus:

```lua
glyphcase.dispatch("user:created", {
  userId = user_id,
  email = email,
  timestamp = os.time()
})
```

### 5.2 Lua Lifecycle Hooks

#### on_data_changed()

Called when watched table changes:

```lua
function on_data_changed(table_name, operation, row)
  if table_name == "orders" then
    if operation == "INSERT" then
      print("New order: " .. row.id)

      -- Calculate order total
      local total = glyphcase.queryScalar(
        "SELECT SUM(price * quantity) FROM order_items WHERE order_id = ?",
        {row.id}
      )

      -- Update order total
      glyphcase.update("orders", row.id, { total = total })

      -- Notify user
      glyphcase.dispatch("order:created", {
        orderId = row.id,
        userId = row.user_id,
        total = total
      })
    elseif operation == "UPDATE" then
      if row.status == "shipped" then
        send_shipment_notification(row)
      end
    end
  end
end
```

#### on_install()

Called when skill is installed:

```lua
function on_install()
  print("Installing skill...")

  -- Create default data
  glyphcase.insert("settings", {
    key = "skill_installed",
    value = "true",
    created_at = os.time()
  })

  -- Initialize schema
  glyphcase.execute([[
    CREATE TABLE IF NOT EXISTS skill_data (
      id INTEGER PRIMARY KEY,
      key TEXT UNIQUE,
      value JSON
    )
  ]])

  print("Skill installed successfully")
end
```

#### on_activate()

Called when skill is activated:

```lua
function on_activate()
  print("Activating skill...")

  -- Start watchers
  glyphcase.watch("users", handle_user_changes)

  -- Schedule tasks
  scheduler.every("1h", sync_external_data)

  print("Skill activated")
end
```

#### on_deactivate()

Called when skill is deactivated:

```lua
function on_deactivate()
  print("Deactivating skill...")

  -- Clean up
  scheduler.stop_all()
  glyphcase.unwatch_all()

  print("Skill deactivated")
end
```

### 5.3 Advanced Lua Features

#### Data Transformation

```lua
function before_insert(table_name, data)
  if table_name == "users" then
    -- Auto-hash password
    if data.password then
      data.password_hash = crypto.bcrypt(data.password)
      data.password = nil
    end

    -- Generate slug
    if data.name and not data.slug then
      data.slug = string.lower(data.name):gsub("%s+", "-")
    end
  end

  return data
end
```

#### Validation

```lua
function validate_insert(table_name, data)
  if table_name == "users" then
    if not data.email or not string.match(data.email, "^[^@]+@[^@]+$") then
      error("Invalid email")
    end

    if not data.name or string.len(data.name) < 2 then
      error("Name too short")
    end
  end

  return true
end
```

#### Complex Queries

```lua
function get_user_stats(user_id)
  local result = glyphcase.queryOne([[
    SELECT
      u.id,
      u.name,
      COUNT(DISTINCT t.id) as task_count,
      COUNT(DISTINCT o.id) as order_count,
      SUM(o.total) as lifetime_value
    FROM users u
    LEFT JOIN tasks t ON u.id = t.user_id AND t.status = 'completed'
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = ?
    GROUP BY u.id
  ]], {user_id})

  return result
end
```

---

## 6. Sync Protocol

### 6.1 Local-First Architecture

GlyphCase is primarily **local-first**, meaning:

1. **All data lives locally** - Single SQLite file
2. **No cloud required** - Fully functional offline
3. **Optional sync** - Bidirectional sync to cloud (opt-in)
4. **Conflict resolution** - Last-write-wins or custom resolution

### 6.2 Sync Flow

```
┌─────────────────────────┐
│   Local GlyphCase DB    │
│   (Master Copy)         │
└────────────┬────────────┘
             │
             │ Change Detection
             ▼
┌─────────────────────────┐
│   Pending Changes Queue  │
│   (Not yet synced)      │
└────────────┬────────────┘
             │
             │ Batch & Compress
             ▼
┌─────────────────────────┐
│   Sync Request to Cloud │
│   (HTTPS)               │
└────────────┬────────────┘
             │
             │ Merge on Server
             ▼
┌─────────────────────────┐
│   Cloud Database        │
│   (Backup/Archive)      │
└────────────┬────────────┘
             │
             │ Return Changes
             ▼
┌─────────────────────────┐
│   Pull Remote Changes   │
│   (Optional)            │
└────────────┬────────────┘
             │
             │ Merge Locally
             ▼
┌─────────────────────────┐
│   Updated Local DB      │
│   (Now In Sync)         │
└─────────────────────────┘
```

### 6.3 Sync Configuration

```typescript
interface SyncConfig {
  enabled: boolean
  endpoint: string              // Cloud API URL
  interval: number              // Sync interval (ms)
  conflictResolution: 'last-write-wins' | 'custom'
  conflictResolver?: (local: any, remote: any) => any

  // Selective sync
  tables?: string[]             // Only sync specific tables
  exclude?: string[]            // Don't sync these tables

  // Retry logic
  maxRetries: number
  retryDelay: number

  // Compression
  compression: 'gzip' | 'brotli' | 'none'

  // Encryption
  encryption?: {
    enabled: boolean
    algorithm: 'AES-256-GCM'
    keyDerivation: 'PBKDF2'
  }
}
```

### 6.4 Sync Implementation

#### Tracking Changes

```typescript
class SyncEngine {
  private changes: ChangeLog[] = []

  async recordChange(event: ChangeEvent): Promise<void> {
    const log: ChangeLog = {
      id: generateUUID(),
      tableName: event.tableName,
      operation: event.operation,
      rowId: event.rowId,
      data: event.newData,
      timestamp: Date.now(),
      synced: false
    }

    await this.db.insert('_sync_changelog', log)
    this.changes.push(log)
  }

  async markSynced(changeIds: string[]): Promise<void> {
    await this.db.updateWhere(
      '_sync_changelog',
      'id IN (?)',
      [changeIds],
      { synced: true }
    )
  }
}
```

#### Pushing Changes

```typescript
async push(): Promise<SyncResult> {
  // Get unsynced changes
  const changes = await this.db.query(
    "SELECT * FROM _sync_changelog WHERE synced = 0 ORDER BY timestamp"
  )

  if (changes.length === 0) return { pushed: 0, pulled: 0 }

  // Batch changes
  const batch = {
    version: 1,
    timestamp: Date.now(),
    changes: changes,
    deviceId: this.deviceId,
    checksum: calculateChecksum(changes)
  }

  // Send to server
  const response = await fetch(`${this.endpoint}/sync/push`, {
    method: 'POST',
    body: JSON.stringify(batch),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) throw new Error('Sync failed')

  // Mark as synced
  await this.markSynced(changes.map(c => c.id))

  return { pushed: changes.length, pulled: 0 }
}
```

#### Pulling Changes

```typescript
async pull(): Promise<SyncResult> {
  const lastSync = await this.getLastSyncTimestamp()

  const response = await fetch(
    `${this.endpoint}/sync/pull?since=${lastSync}`
  )

  const { changes } = await response.json()

  // Apply to local database
  let applied = 0
  for (const change of changes) {
    try {
      await this.applyRemoteChange(change)
      applied++
    } catch (error) {
      // Handle conflicts
      if (this.hasLocalChange(change)) {
        await this.resolveConflict(change)
      }
    }
  }

  return { pushed: 0, pulled: applied }
}
```

### 6.5 Conflict Resolution

#### Last-Write-Wins

```typescript
async resolveConflict(remote: Change): Promise<void> {
  const local = await this.db.queryOne(
    "SELECT * FROM ? WHERE id = ?",
    [remote.table, remote.id]
  )

  // Remote is newer, accept it
  if (remote.timestamp > local.updatedAt) {
    await this.applyRemoteChange(remote)
  }
  // Local is newer, keep it
  // (do nothing)
}
```

#### Custom Resolution

```typescript
const customResolver = (local: any, remote: any) => {
  // Example: Merge arrays
  if (Array.isArray(local.tags) && Array.isArray(remote.tags)) {
    return {
      ...remote,
      tags: [...new Set([...local.tags, ...remote.tags])]
    }
  }

  // Default to remote
  return remote
}
```

### 6.6 Offline Support

GlyphCase works seamlessly offline:

```typescript
// Offline mode detection
class GlyphCase {
  private online = navigator.onLine

  constructor() {
    window.addEventListener('online', () => {
      this.online = true
      this.syncEngine.syncWhenOnline()
    })

    window.addEventListener('offline', () => {
      this.online = false
    })
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    // Always works - local database
    return this.db.query(sql, params)
  }

  async syncToCloud(): Promise<void> {
    if (!this.online) {
      throw new Error('Offline - will sync when connection restored')
    }

    return this.syncEngine.push()
  }
}
```

---

## 7. Performance Characteristics

### 7.1 Query Performance

#### Benchmarks

```
Operation               Single  Batch (1000)  Batch (10000)
─────────────────────────────────────────────────────────
SELECT (indexed)        0.5ms   50ms         400ms
SELECT (full scan)      2ms     1500ms       12000ms
INSERT                  1ms     100ms        800ms
UPDATE                  1.5ms   150ms        1200ms
DELETE                  1ms     100ms        800ms
```

#### Optimization Tips

1. **Create indexes** on frequently queried columns:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

2. **Use ANALYZE** to optimize query plans:
```sql
ANALYZE;
VACUUM;
```

3. **Batch operations** for better performance:
```lua
glyphcase.transaction(function()
  for i = 1, 1000 do
    glyphcase.insert("items", { value = i })
  end
end)
```

### 7.2 Memory Footprint

```
Component               Memory (Typical)
────────────────────────────────────────
SQLite Engine           ~2MB
Active Capsule          1-5MB (depends on watchers)
Event Queue             100KB-1MB
Lua Runtime             ~500KB (per script)
Database File (100KB)   100KB + WAL overhead
─────────────────────────────────────────
Total (minimal)         ~4MB
Total (with Lua + sync) ~10MB
```

### 7.3 Database Size

```
Data Type               Size Per 1000 Records
──────────────────────────────────────────────
Simple text fields      50-100KB
JSON documents          100-500KB
Full-text indexes       2x data size
_capsule_events table   10-20KB/day
WAL file                varies (cleared on commit)
```

### 7.4 Scaling Characteristics

GlyphCase scales well up to moderate data sizes:

```
Database Size    Performance    Notes
─────────────────────────────────────
< 1MB           Excellent      All in memory cache
1-10MB          Good           Some disk seeks
10-100MB        Fair           Noticeable latency
> 100MB         Consider alternatives (PostgreSQL)
```

### 7.5 Reactive System Overhead

```
Number of Watchers  Event Emission Latency  Memory
────────────────────────────────────────────────────
1-5                 < 1ms                   minimal
5-20                1-5ms                   low
20-100              5-20ms                  moderate
> 100               > 20ms                  consider pooling
```

---

## 8. Implementation Guide

### 8.1 Step-by-Step: Building Active Capsule

#### Step 1: SQLite Foundation

```typescript
import Database from 'better-sqlite3'

class GlyphCase {
  private sqlite: Database.Database

  constructor(filename: string) {
    this.sqlite = new Database(filename)
    this.sqlite.pragma('journal_mode = WAL')
    this.sqlite.pragma('foreign_keys = ON')
  }
}
```

#### Step 2: Create Internal Tables

```typescript
private async initializeCapsule(): Promise<void> {
  // Create watcher table
  this.sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _capsule_watchers (
      id TEXT PRIMARY KEY,
      table_or_query TEXT NOT NULL,
      filter_expression TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create events table
  this.sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _capsule_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      watcher_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      table_name TEXT NOT NULL,
      row_id INTEGER,
      new_data JSON NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (watcher_id) REFERENCES _capsule_watchers(id)
    )
  `)
}
```

#### Step 3: Implement Event Bus

```typescript
type EventHandler = (events: ChangeEvent[]) => void

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()

  on(channel: string, handler: EventHandler): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set())
    }

    this.listeners.get(channel)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(handler)
    }
  }

  emit(channel: string, events: ChangeEvent[]): void {
    const handlers = this.listeners.get(channel)
    if (handlers) {
      handlers.forEach(h => h(events))
    }
  }
}
```

#### Step 4: Create Trigger Manager

```typescript
class TriggerManager {
  constructor(private sqlite: Database.Database) {}

  createTriggersForTable(tableName: string, columns: string[]): void {
    // INSERT trigger
    const insertTrigger = `
      CREATE TRIGGER ${tableName}_after_insert
      AFTER INSERT ON ${tableName}
      FOR EACH ROW
      BEGIN
        INSERT INTO _capsule_events (
          watcher_id, operation, table_name, row_id, new_data, timestamp
        ) VALUES (
          (SELECT id FROM _capsule_watchers WHERE table_or_query = '${tableName}'),
          'INSERT',
          '${tableName}',
          NEW.id,
          json_object(${columns.map(c => `'${c}', NEW.${c}`).join(', ')}),
          CURRENT_TIMESTAMP
        );
      END
    `

    this.sqlite.exec(insertTrigger)

    // Similar for UPDATE and DELETE triggers...
  }
}
```

#### Step 5: Implement Active Capsule

```typescript
class ActiveCapsule {
  private eventQueue: ChangeEvent[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private batchInterval = 100

  constructor(
    private sqlite: Database.Database,
    private eventBus: EventBus
  ) {}

  watch(table: string, filter?: string): string {
    const watcherId = generateUUID()

    this.sqlite.prepare(`
      INSERT INTO _capsule_watchers (id, table_or_query, filter_expression)
      VALUES (?, ?, ?)
    `).run(watcherId, table, filter || null)

    return watcherId
  }

  subscribe(watcherId: string, handler: EventHandler): () => void {
    return this.eventBus.on(`watcher:${watcherId}`, handler)
  }

  async recordChange(event: ChangeEvent): Promise<void> {
    this.eventQueue.push(event)

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchInterval)
    }
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const batch = this.eventQueue.splice(0)
    this.batchTimer = null

    // Group by watcher
    const byWatcher = new Map<string, ChangeEvent[]>()
    for (const event of batch) {
      if (!byWatcher.has(event.watcherId)) {
        byWatcher.set(event.watcherId, [])
      }
      byWatcher.get(event.watcherId)!.push(event)
    }

    // Emit to subscribers
    for (const [watcherId, events] of byWatcher) {
      this.eventBus.emit(`watcher:${watcherId}`, events)
    }
  }
}
```

#### Step 6: Put It All Together

```typescript
class GlyphCase {
  private sqlite: Database.Database
  private capsule: ActiveCapsule
  private eventBus: EventBus
  private triggerManager: TriggerManager

  constructor(filename: string) {
    this.sqlite = new Database(filename)
    this.eventBus = new EventBus()
    this.capsule = new ActiveCapsule(this.sqlite, this.eventBus)
    this.triggerManager = new TriggerManager(this.sqlite)

    this.initializeCapsule()
  }

  private initializeCapsule(): void {
    // Create internal tables
    // Set up pragmas
    // etc.
  }

  createTable(name: string, schema: ColumnDef[], enableCapsule: boolean): void {
    // Create table
    // If enableCapsule, create watcher and triggers
  }

  watch(table: string, filter?: string): string {
    return this.capsule.watch(table, filter)
  }

  subscribe(watcherId: string, handler: EventHandler): () => void {
    return this.capsule.subscribe(watcherId, handler)
  }

  async insert(table: string, data: Record<string, any>): Promise<number> {
    const stmt = this.sqlite.prepare(`
      INSERT INTO ${table} (${Object.keys(data).join(', ')})
      VALUES (${Object.keys(data).map(() => '?').join(', ')})
    `)

    const result = stmt.run(...Object.values(data))
    return result.lastInsertRowid as number
  }

  // ... other CRUD methods
}
```

### 8.2 Lua Runtime Integration

```typescript
import Lua from 'wasmoon'

class LuaRuntime {
  private lua: Lua.LuaFactory

  constructor(private glyphcase: GlyphCase) {
    this.lua = new Lua()
    this.registerAPIs()
  }

  private registerAPIs(): void {
    // Register glyphcase object
    this.lua.global.set('glyphcase', {
      query: (...args) => this.glyphcaseQuery(...args),
      insert: (...args) => this.glyphcaseInsert(...args),
      update: (...args) => this.glyphcaseUpdate(...args),
      delete: (...args) => this.glyphcaseDelete(...args),
      watch: (...args) => this.glyphcaseWatch(...args),
      dispatch: (...args) => this.glyphcaseDispatch(...args)
    })
  }

  private glyphcaseQuery(sql: string, params?: any[]): any[] {
    return this.glyphcase.query(sql, params)
  }

  // ... other API implementations

  async executeScript(script: string): Promise<void> {
    await this.lua.doString(script)
  }
}
```

---

## 9. Advanced Topics

### 9.1 Custom Watchers

Create complex watchers for derived data:

```typescript
// Watch a view (derived data)
const watcher = glyphcase.watch(`
  SELECT u.id, u.name, COUNT(t.id) as task_count
  FROM users u
  LEFT JOIN tasks t ON u.id = t.user_id
  GROUP BY u.id
`)

glyphcase.subscribe(watcher, (events) => {
  console.log('User task counts changed')
  events.forEach(e => {
    console.log(`${e.new_data.name}: ${e.new_data.task_count} tasks`)
  })
})
```

### 9.2 Transactional Consistency

Ensure multiple changes are atomic:

```typescript
glyphcase.transaction(async () => {
  // All changes here are grouped as one transaction
  const userId = await glyphcase.insert('users', { name: 'Alice' })
  await glyphcase.insert('user_profiles', { user_id: userId })

  // If any error occurs, all changes are rolled back
  // Subscribers see one batch with all changes
})
```

### 9.3 Performance Monitoring

Monitor Active Capsule performance:

```typescript
class PerformanceMonitor {
  trackQuery(sql: string, duration: number): void {
    if (duration > 100) {
      console.warn(`Slow query: ${sql} (${duration}ms)`)
    }
  }

  trackEventEmission(watcherId: string, eventCount: number): void {
    console.log(`Emitted ${eventCount} events to ${watcherId}`)
  }
}
```

### 9.4 Multi-Device Sync

Sync between multiple devices:

```typescript
const config = {
  endpoint: 'https://sync.example.com',
  deviceId: 'device-uuid',
  conflictResolution: 'last-write-wins',
  syncInterval: 30000 // 30 seconds
}

const glyphcase = new GlyphCase({
  filename: 'app.db',
  sync: config
})

// Automatic background sync
setInterval(() => {
  glyphcase.syncToCloud()
}, config.syncInterval)
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Issue: Watchers Not Triggering

**Symptom:** Subscribers don't receive events after data changes

**Diagnosis:**
```lua
-- Check if watcher exists
local watchers = glyphcase.query("SELECT * FROM _capsule_watchers")
print("Active watchers: " .. #watchers)

-- Check if triggers exist
local triggers = glyphcase.query(
  "SELECT name FROM sqlite_master WHERE type='trigger'"
)
print("Triggers: " .. #triggers)
```

**Solution:**
```typescript
// Ensure Active Capsule is enabled
const glyphcase = new GlyphCase('app.db', {
  capsule: { enabled: true } // ← Important!
})

// Re-create triggers if needed
glyphcase.recreateTriggersForTable('users')
```

#### Issue: Slow Event Processing

**Symptom:** Events are processed with latency

**Diagnosis:**
```lua
-- Check event queue size
local pending = glyphcase.queryScalar(
  "SELECT COUNT(*) FROM _capsule_events WHERE processed = 0"
)
print("Pending events: " .. pending)
```

**Solution:**
```typescript
// Increase batch size
const glyphcase = new GlyphCase('app.db', {
  capsule: {
    batchInterval: 200,   // Increase from 100ms
    batchSize: 1000      // Increase from 100
  }
})
```

#### Issue: Database Size Growing

**Symptom:** Database file size increasing rapidly

**Solution:**
```lua
-- Clean up old events
glyphcase.execute([[
  DELETE FROM _capsule_events
  WHERE timestamp < datetime('now', '-7 days')
]])

-- Vacuum to reclaim space
glyphcase.execute("VACUUM")
```

### 10.2 Debugging Tips

#### Enable Logging

```typescript
class GlyphCase {
  private logger = console.log

  async recordChange(event: ChangeEvent): Promise<void> {
    this.logger(`[Capsule] ${event.operation} on ${event.tableName}`)
    await this.capsule.recordChange(event)
  }
}
```

#### Inspect Database State

```lua
-- View all watchers
local watchers = glyphcase.query("SELECT * FROM _capsule_watchers")
for _, w in ipairs(watchers) do
  print("Watcher: " .. w.id .. " -> " .. w.table_or_query)
end

-- View recent events
local events = glyphcase.query(
  "SELECT * FROM _capsule_events ORDER BY timestamp DESC LIMIT 10"
)
for _, e in ipairs(events) do
  print(e.operation .. " on " .. e.table_name .. " at " .. e.timestamp)
end
```

---

## Summary

Active Capsule is a powerful reactive system built on top of SQLite that enables:

1. **Automatic change detection** via triggers
2. **Real-time event emission** to subscribers
3. **Lua scripting** for business logic
4. **Optional cloud sync** without required cloud dependency
5. **Excellent performance** for typical use cases

The system is designed to be:
- **Local-first** - all data lives locally
- **Reactive** - changes propagate automatically
- **Secure** - Lua scripts are sandboxed
- **Scalable** - batching and indexing for performance
- **Simple** - straightforward API for developers

See [GLYPHCASE_SKILLS_SPEC.md](GLYPHCASE_SKILLS_SPEC.md) for how to use Active Capsule in Skills, or [BACKEND_GUIDE.md](BACKEND_GUIDE.md) for GlyphCase backend setup.

---

**References:**
- [Punk Framework Documentation](README.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Skills Specification](GLYPHCASE_SKILLS_SPEC.md)
- [Backend Guide](BACKEND_GUIDE.md)
- [Philosophy](PHILOSOPHY.md)
