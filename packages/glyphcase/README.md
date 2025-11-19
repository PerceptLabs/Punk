# @punk/glyphcase

**Active Capsule** reactive database with embedded **Lua 5.4** runtime for the Punk Framework.

## Features

- **Reactive Database**: SQLite with automatic change detection via triggers
- **Event-Driven**: Real-time event emission to subscribers
- **Lua Runtime**: Sandboxed Lua 5.4 environment via wasmoon (WASM)
- **Skill System**: Modular plugin architecture with Lua scripts
- **Local-First**: All data stored locally in SQLite
- **Optional Sync**: Bidirectional cloud sync with conflict resolution
- **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install @punk/glyphcase
```

## Quick Start

### Basic Usage

```typescript
import { GlyphCase } from '@punk/glyphcase';

// Initialize database
const db = new GlyphCase({
  dbPath: './app.db',
  schema: {
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true },
          { name: 'email', type: 'TEXT', unique: true },
          { name: 'name', type: 'TEXT', notNull: true }
        ],
        capsule: { watch: true }
      }
    ]
  },
  lua: {
    runtime: '5.4'
  }
});

// Insert data
const userId = db.insert('users', {
  email: 'alice@example.com',
  name: 'Alice'
});

// Query data
const users = db.query('SELECT * FROM users WHERE name LIKE ?', ['%Alice%']);

// Watch for changes
const unwatch = db.watch('users', (events) => {
  console.log('Users changed:', events);
});

// Clean up
db.close();
```

### Lua Integration

```typescript
// Execute Lua script
await db.executeLua(`
  -- Insert user from Lua
  local id = glyphcase.insert("users", {
    email = "bob@example.com",
    name = "Bob"
  })

  print("Created user:", id)

  -- Query users
  local users = glyphcase.query("SELECT * FROM users")
  for _, user in ipairs(users) do
    print(user.name)
  end
`);
```

### Reactive Lua Skills

```lua
-- scripts/reactive.lua

-- Called when data changes
function on_data_changed(table_name, operation, row)
  if table_name == "users" and operation == "INSERT" then
    -- Send welcome email
    glyphcase.dispatch("email:send", {
      to = row.email,
      subject = "Welcome " .. row.name
    })
  end
end

-- Called when skill activates
function on_activate()
  print("Skill activated!")

  -- Watch for changes
  glyphcase.watch("users", function(events)
    print("Users changed:", #events, "events")
  end)
end
```

## API Reference

### Database Operations

```typescript
// Query
const rows = db.query('SELECT * FROM users WHERE age > ?', [18]);

// Insert
const id = db.insert('users', { name: 'Alice', age: 25 });

// Update
db.update('users', id, { age: 26 });

// Delete
db.delete('users', id);

// Transaction
db.transaction(() => {
  db.insert('users', { name: 'Bob' });
  db.insert('users', { name: 'Charlie' });
});
```

### Reactive Watchers

```typescript
// Watch entire table
const unwatch = db.watch('users', (events) => {
  for (const event of events) {
    console.log(`${event.operation}: ${event.newData.name}`);
  }
});

// Watch with filter
const unwatch2 = db.watch('users', (events) => {
  console.log('Active users changed');
}, 'WHERE status = "active"');

// Unwatch
unwatch();
```

### Lua API

Available in Lua scripts:

```lua
-- Database
glyphcase.query(sql, ...)
glyphcase.insert(table, data)
glyphcase.update(table, id, data)
glyphcase.delete(table, id)
glyphcase.transaction(fn)

-- Events
glyphcase.dispatch(action, payload)
actionbus.register(action, handler)

-- Crypto
crypto.uuid()

-- Scheduler
scheduler.every("1h", fn)
scheduler.after("5m", fn)

-- Cache
cache.set("key", value, "10m")
cache.get("key")
cache.delete("key")
```

### Skills

```typescript
// Load skill from directory
const skill = await db.loadSkill('./skills/my-skill');

// Activate skill
await db.activateSkill('my-skill');

// Deactivate skill
await db.deactivateSkill('my-skill');

// Call Lua function in skill
const result = await db.getSkillManager()
  .callSkillFunction('my-skill', 'process_data', { foo: 'bar' });
```

### Sync

```typescript
const db = new GlyphCase({
  dbPath: './app.db',
  sync: {
    enabled: true,
    endpoint: 'https://api.example.com',
    interval: 30000, // 30 seconds
    conflictResolution: 'last-write-wins'
  }
});

// Manual sync
const result = await db.sync();
console.log(`Pushed: ${result.pushed}, Pulled: ${result.pulled}`);
```

## Architecture

```
┌─────────────────────────────┐
│   Lua Scripts / React UI    │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│      Event Bus              │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   Active Capsule            │
│   (Change Detection)        │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│   SQLite Database           │
│   + Internal Tables         │
└─────────────────────────────┘
```

## Documentation

- [GLYPHCASE_INTERNALS.md](../../GLYPHCASE_INTERNALS.md) - Technical deep dive
- [GLYPHCASE_SKILLS_SPEC.md](../../GLYPHCASE_SKILLS_SPEC.md) - Skill system guide
- [LUA_RUNTIME.md](../../LUA_RUNTIME.md) - Lua runtime specification

## License

MIT
