# GlyphCase Skills Specification

## What is a Skill?

A **Skill** is a portable plugin that extends Atompunk with new functionality. Skills are self-contained packages that bundle:

- **Punk components** - UI and interactive elements
- **Backend templates** - Server-side logic and API handlers
- **ActionBus actions** - Event handlers and state management
- **GlyphCase SQLite database** - Local-first data storage with reactivity

Skills enable modular, composable extension of Atompunk projects without modifying core code.

## Skill Structure

```
skill-name/
├── manifest.json          # Metadata: name, version, dependencies, permissions
├── components/            # Punk components (UI elements)
│   ├── Button.punk
│   ├── Modal.punk
│   └── ...
├── templates/             # Backend templates (server handlers)
│   ├── api.ts
│   ├── workers.ts
│   └── ...
├── glyphcase.db          # SQLite database with schema and Active Capsules
├── README.md             # Skill documentation
└── package.json          # Dependencies (optional)
```

### manifest.json

```json
{
  "id": "skill-name",
  "name": "Skill Display Name",
  "version": "1.0.0",
  "description": "What this skill does",
  "author": "Author Name",
  "extends": {
    "components": ["Button", "Modal"],
    "actions": ["auth", "sync"],
    "templates": ["api", "workers"]
  },
  "permissions": {
    "database": true,
    "network": false,
    "filesystem": false
  },
  "dependencies": {
    "atompunk": "^1.0.0"
  }
}
```

## GlyphCase Integration

GlyphCase provides the reactive, local-first data layer for skills:

- **SQLite Storage** - Lightweight, portable embedded database
- **Active Capsule** - Reactive data binding that automatically syncs UI updates
- **Schema Definition** - Declarative table structures in the skill's glyphcase.db
- **Sync Engine** - Optional backend synchronization for cloud features

Skills access GlyphCase through the ActionBus:

```typescript
// Query data
const users = await ActionBus.dispatch('glyphcase:query', {
  skill: 'skill-name',
  table: 'users'
});

// Insert/update data
await ActionBus.dispatch('glyphcase:upsert', {
  skill: 'skill-name',
  table: 'users',
  data: { id: 1, name: 'Alice' }
});

// Subscribe to changes
ActionBus.subscribe('glyphcase:changed', (event) => {
  console.log('Data updated:', event.data);
});
```

## Installation

### CLI Installation

```bash
punk add skill shadcn-components
punk add skill supabase-backend
punk add skill pdf-processor
```

### Builder Installation

1. Open Atompunk Builder
2. Navigate to **Extensions > Skills**
3. Browse available skills
4. Click **Install** for one-click installation

## Example Skills

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
Skills declare required permissions in manifest.json:
- `database` - Access to GlyphCase
- `network` - HTTP requests to external services
- `filesystem` - Read/write local files
- `actionbus` - Dispatch to action handlers

### Sandboxing
Skills run in isolated contexts:
- Component code has restricted DOM access
- Template code runs with declared permissions only
- Database access scoped to skill namespace

### Code Signing (Optional)
Trusted publishers can sign skills for verified installation:

```bash
punk sign-skill ./my-skill --key ~/.punk/keys/private.pem
```

## Development

### Create a New Skill

```bash
punk create-skill my-skill
```

This generates the skill template:

```
my-skill/
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
punk add skill ./my-skill --local

# Watch for changes
punk dev-skill ./my-skill --watch

# Test in sandbox
punk test-skill ./my-skill
```

### Publishing

```bash
punk publish-skill ./my-skill --registry official
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

## Best Practices

1. **Namespace Everything** - Use skill ID as prefix for actions, components, tables
2. **Document Schemas** - Clear ERD or schema documentation
3. **Minimize Dependencies** - Keep skills self-contained
4. **Handle Permissions** - Request only necessary permissions
5. **Test Offline** - Ensure skills work without network
6. **Version Stability** - Use semantic versioning; breaking changes increment major version
7. **Error Handling** - Graceful degradation when permissions denied
