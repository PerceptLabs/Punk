# GlyphCase Mods Specification

## What is a Mod?

A **Mod** is a portable plugin that extends Atompunk with new functionality. Mods are self-contained packages that bundle:

- **Punk components** - UI and interactive elements
- **Backend templates** - Server-side logic and API handlers
- **ActionBus actions** - Event handlers and state management
- **GlyphCase SQLite database** - Local-first data storage with reactivity
- **Lua scripts** - Embedded runtime for reactive logic, data transforms, and business rules

Mods enable modular, composable extension of Atompunk projects without modifying core code.

### Why Lua?

Lua provides a **safe, fast, embeddable scripting layer** for mods:

- **Sandboxed** - Restricted runtime prevents malicious code
- **Fast** - LuaJIT compilation for performance-critical logic
- **Lightweight** - Small footprint (~200KB runtime)
- **Reactive** - Scripts respond to Active Capsule data changes
- **Portable** - Works across platforms without dependencies

## Mod Structure

```
mod-name/
├── manifest.json          # Metadata: name, version, dependencies, permissions
├── components/            # Punk components (UI elements)
│   ├── Button.punk
│   ├── Modal.punk
│   └── ...
├── templates/             # Backend templates (server handlers)
│   ├── api.ts
│   ├── workers.ts
│   └── ...
├── scripts/               # Lua scripts (reactive logic, transforms)
│   ├── init.lua          # Mod initialization
│   ├── hooks.lua         # Lifecycle hooks
│   ├── transforms.lua    # Data transformations
│   └── reactive.lua      # Active Capsule reactions
├── glyphcase.db          # SQLite database with schema and Active Capsules
├── README.md             # Mod documentation
└── package.json          # Dependencies (optional)
```

### manifest.json

```json
{
  "id": "mod-name",
  "name": "Mod Display Name",
  "version": "1.0.0",
  "description": "What this mod does",
  "author": "Author Name",
  "extends": {
    "components": ["Button", "Modal"],
    "actions": ["auth", "sync"],
    "templates": ["api", "workers"]
  },
  "permissions": {
    "database": true,
    "network": false,
    "filesystem": false,
    "lua": {
      "enabled": true,
      "allowedModules": ["string", "table", "math"],
      "maxMemory": "10MB",
      "maxExecutionTime": "5s"
    }
  },
  "dependencies": {
    "atompunk": "^1.0.0"
  }
}
```

## GlyphCase Integration

GlyphCase provides the reactive, local-first data layer for mods:

- **SQLite Storage** - Lightweight, portable embedded database
- **Active Capsule** - Reactive data binding that automatically syncs UI updates
- **Schema Definition** - Declarative table structures in the mod's glyphcase.db
- **Sync Engine** - Optional backend synchronization for cloud features
- **Lua Runtime** - Embedded scripting for reactive logic and data transforms

Mods access GlyphCase through the ActionBus and Lua scripts:

```typescript
// Query data
const users = await ActionBus.dispatch('glyphcase:query', {
  mod: 'mod-name',
  table: 'users'
});

// Insert/update data
await ActionBus.dispatch('glyphcase:upsert', {
  mod: 'mod-name',
  table: 'users',
  data: { id: 1, name: 'Alice' }
});

// Subscribe to changes
ActionBus.subscribe('glyphcase:changed', (event) => {
  console.log('Data updated:', event.data);
});
```

### Lua Scripts for Reactive Logic

Mods can use Lua to respond to Active Capsule changes:

**scripts/reactive.lua** - React to database changes:
```lua
-- Called when data changes in Active Capsule
function on_data_changed(table_name, operation, row)
  if table_name == "users" and operation == "INSERT" then
    -- Send welcome email when new user created
    local email = row.email
    local name = row.name

    glyphcase.dispatch("email:send", {
      to = email,
      subject = "Welcome " .. name,
      template = "welcome"
    })
  end

  if table_name == "orders" and row.status == "completed" then
    -- Calculate analytics when order completes
    local total = glyphcase.query([[
      SELECT SUM(amount) as total
      FROM orders
      WHERE user_id = ?
    ]], row.user_id)

    glyphcase.update("users", row.user_id, {
      lifetime_value = total
    })
  end
end
```

**scripts/transforms.lua** - Transform data before storage:
```lua
-- Called before INSERT/UPDATE operations
function before_save(table_name, data)
  if table_name == "users" then
    -- Auto-hash passwords
    if data.password then
      data.password_hash = crypto.bcrypt(data.password)
      data.password = nil  -- Remove plaintext
    end

    -- Generate slugs
    if data.name and not data.slug then
      data.slug = string.lower(data.name):gsub("%s+", "-")
    end
  end

  return data
end

-- Called after successful database operation
function after_save(table_name, data)
  if table_name == "posts" and data.status == "published" then
    -- Invalidate cache
    cache.delete("posts:latest")

    -- Trigger webhook
    webhook.send("https://api.example.com/notify", {
      event = "post.published",
      data = data
    })
  end
end
```

**scripts/hooks.lua** - Lifecycle hooks:
```lua
-- Called when mod is installed
function on_install()
  print("Installing mod...")

  -- Create default data
  glyphcase.insert("settings", {
    theme = "default",
    notifications = true
  })

  -- Register ActionBus handlers
  actionbus.register("mod:action", handle_action)
end

-- Called when mod is activated
function on_activate()
  print("Mod activated")

  -- Start background jobs
  scheduler.every("1h", sync_data)
end

-- Called when mod is deactivated
function on_deactivate()
  print("Mod deactivated")

  -- Cleanup
  scheduler.stop_all()
end
```

## Installation

### CLI Installation

```bash
punk add mod shadcn-components
punk add mod supabase-backend
punk add mod pdf-processor
```

### Builder Installation

1. Open Mohawk
2. Navigate to **Extensions > Mods**
3. Browse available mods
4. Click **Install** for one-click installation

## Example Mods

### shadcn-components
Pre-built UI component library with styles and animations. Provides Button, Modal, Card, Form, etc.

### supabase-backend
Drop-in replacement for Encore backend. Includes PostgreSQL integration templates and authentication handlers.

### docx-generator
Generates Word documents dynamically. Includes templates for reports, forms, and exports.

### pdf-processor
PDF manipulation: merge, split, extract, annotate. Templates for server-side processing.

### analytics
Event tracking and analytics. ActionBus hooks for pageviews, user actions, and custom events.

## Security Model

### Permission System
Mods declare required permissions in manifest.json:
- `database` - Access to GlyphCase
- `network` - HTTP requests to external services
- `filesystem` - Read/write local files
- `actionbus` - Dispatch to action handlers

### Sandboxing
Mods run in isolated contexts:
- Component code has restricted DOM access
- Template code runs with declared permissions only
- Database access scoped to mod namespace
- **Lua runtime is fully sandboxed**:
  - No access to `os`, `io`, `debug`, `package` modules by default
  - File system access requires explicit permission
  - Network calls only through whitelisted APIs (`glyphcase.http`)
  - Memory and execution time limits enforced
  - Cannot load arbitrary C libraries

### Code Signing (Optional)
Trusted publishers can sign mods for verified installation:

```bash
punk sign-mod ./my-mod --key ~/.punk/keys/private.pem
```

## Development

### Create a New Mod

```bash
punk create-mod my-mod
```

This generates the mod template:

```
my-mod/
├── manifest.json
├── components/
│   └── MyComponent.punk
├── templates/
│   └── api.ts
├── glyphcase.db
└── README.md
```

### Local Testing

```bash
# Install from local directory
punk add mod ./my-mod --local

# Watch for changes
punk dev-mod ./my-mod --watch

# Test in sandbox
punk test-mod ./my-mod
```

### Publishing

```bash
punk publish-mod ./my-mod --registry official
```

## Schema Definition

Define tables in `glyphcase.db` with Active Capsules:

```sqlite
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  type TEXT,
  data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Lua API Reference

Mods have access to these Lua APIs in the sandboxed environment:

### glyphcase (Database Operations)
```lua
-- Query
local rows = glyphcase.query("SELECT * FROM users WHERE age > ?", 18)

-- Insert
local id = glyphcase.insert("users", { name = "Alice", age = 25 })

-- Update
glyphcase.update("users", id, { age = 26 })

-- Delete
glyphcase.delete("users", id)

-- Execute raw SQL
glyphcase.execute("CREATE INDEX idx_email ON users(email)")
```

### actionbus (Event System)
```lua
-- Dispatch action
actionbus.dispatch("email:send", { to = "user@example.com" })

-- Register handler
actionbus.register("mod:custom", function(payload)
  return { success = true }
end)
```

### crypto (Cryptography)
```lua
-- Hash password
local hash = crypto.bcrypt("password123")

-- Verify
local valid = crypto.verify("password123", hash)

-- Generate UUID
local id = crypto.uuid()
```

### http (Network - requires permission)
```lua
-- GET request
local response = http.get("https://api.example.com/data")

-- POST request
local result = http.post("https://api.example.com/webhook", {
  json = { event = "test" }
})
```

### scheduler (Background Jobs)
```lua
-- Run every hour
scheduler.every("1h", function()
  print("Running hourly job")
end)

-- Run once after delay
scheduler.after("5m", function()
  print("Delayed task")
end)
```

### cache (In-Memory Cache)
```lua
-- Set with TTL
cache.set("key", "value", "10m")

-- Get
local value = cache.get("key")

-- Delete
cache.delete("key")
```

## Best Practices

1. **Namespace Everything** - Use mod ID as prefix for actions, components, tables
2. **Document Schemas** - Clear ERD or schema documentation
3. **Minimize Dependencies** - Keep mods self-contained
4. **Handle Permissions** - Request only necessary permissions
5. **Test Offline** - Ensure mods work without network
6. **Version Stability** - Use semantic versioning; breaking changes increment major version
7. **Error Handling** - Graceful degradation when permissions denied
8. **Lua Performance**:
   - Use LuaJIT FFI for performance-critical code
   - Avoid string concatenation in loops (use `table.concat`)
   - Cache function results when possible
   - Prefer local variables over globals
9. **Security**:
   - Never trust user input in Lua scripts
   - Sanitize data before SQL queries (use parameterized queries)
   - Validate data types and ranges
   - Use `pcall` for error handling to prevent crashes
