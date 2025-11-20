# @punk/component-command

Punk wrapper for [cmdk](https://cmdk.paco.me/) - a fast, composable command menu for React.

## Installation

```bash
pnpm add @punk/component-command
```

## Features

- **Command Palette**: Fast command menu with keyboard navigation
- **Grouping**: Organize commands into logical groups
- **Search**: Built-in fuzzy search with custom keywords
- **Actions**: Trigger actions via Punk's ActionBus
- **Renderer-Agnostic**: Works in DOM, GPU, and XR rendering modes
- **Auto-Registration**: Registers with Punk ComponentRegistry on import
- **Schema-Driven**: Full Zod schema for AI-powered generation (SynthPunk)
- **Metadata Rich**: Component metadata for visual builders (Mohawk)

## Usage

### Direct Component Usage

```tsx
import { Command } from '@punk/component-command'

function MyApp() {
  const items = [
    { id: 'new', label: 'New File', icon: '📄', action: 'createFile' },
    { id: 'open', label: 'Open File', icon: '📂', action: 'openFile' },
    { id: 'save', label: 'Save', icon: '💾', action: 'saveFile' },
  ]

  return (
    <Command
      placeholder="Type a command..."
      items={items}
      onSelect="handleCommand"
    />
  )
}
```

### JSON Schema Usage (with PunkRenderer)

#### Simple Command Menu

```json
{
  "type": "Command",
  "props": {
    "placeholder": "Type a command...",
    "items": [
      {
        "id": "new",
        "label": "New File",
        "icon": "📄",
        "action": "createFile"
      },
      {
        "id": "open",
        "label": "Open File",
        "icon": "📂",
        "action": "openFile"
      }
    ]
  }
}
```

#### Grouped Commands

```json
{
  "type": "Command",
  "props": {
    "placeholder": "Search commands...",
    "items": [
      {
        "heading": "File",
        "items": [
          { "id": "new", "label": "New File", "action": "file.new" },
          { "id": "open", "label": "Open File", "action": "file.open" },
          { "id": "save", "label": "Save", "action": "file.save" }
        ]
      },
      {
        "heading": "Edit",
        "items": [
          { "id": "undo", "label": "Undo", "action": "edit.undo" },
          { "id": "redo", "label": "Redo", "action": "edit.redo" }
        ]
      }
    ]
  }
}
```

#### With Search Keywords

```json
{
  "type": "Command",
  "props": {
    "placeholder": "Search...",
    "searchable": true,
    "items": [
      {
        "id": "settings",
        "label": "Settings",
        "keywords": ["preferences", "config", "options"],
        "action": "openSettings"
      },
      {
        "id": "profile",
        "label": "User Profile",
        "keywords": ["account", "user", "me"],
        "action": "openProfile"
      }
    ]
  }
}
```

#### Non-Searchable Menu

```json
{
  "type": "Command",
  "props": {
    "searchable": false,
    "showSearch": false,
    "items": [
      { "id": "option1", "label": "Option 1", "action": "select1" },
      { "id": "option2", "label": "Option 2", "action": "select2" }
    ]
  }
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Type a command or search...'` | Placeholder for search input |
| `items` | `CommandItem[] \| CommandGroup[]` | `[]` | Command items or groups |
| `onSelect` | `string` | `undefined` | Action to trigger on item selection |
| `searchable` | `boolean` | `true` | Enable search functionality |
| `showSearch` | `boolean` | `true` | Show search input |
| `emptyMessage` | `string` | `'No results found.'` | Message when no results |
| `filterFunction` | `string` | `undefined` | Custom filter function name |
| `className` | `string` | `undefined` | Custom CSS class |

### CommandItem Schema

```typescript
{
  id: string           // Unique item ID
  label: string        // Display label
  icon?: string        // Optional icon
  keywords?: string[]  // Search keywords
  action?: string      // Action to trigger
  disabled?: boolean   // Item is disabled
}
```

### CommandGroup Schema

```typescript
{
  heading?: string     // Group heading
  items: CommandItem[] // Items in group
}
```

## Component Metadata

```typescript
{
  displayName: 'Command Menu',
  description: 'Command palette for quick actions and navigation',
  icon: 'terminal',
  category: 'Navigation',
  tags: ['command', 'search', 'menu', 'palette', 'navigation'],
  complexity: 'medium'
}
```

## Schema Export

The component exports its Zod schema for use with SynthPunk AI:

```typescript
import {
  CommandPropsSchema,
  CommandSchemaMap,
  CommandItemSchema,
  CommandGroupSchema
} from '@punk/component-command'

// Use in validation
const result = CommandPropsSchema.parse(props)

// Use in schema map
const schemas = CommandSchemaMap
```

## Auto-Registration

This component automatically registers itself with the Punk ComponentRegistry when imported:

```typescript
import '@punk/component-command' // Component is now registered

import { getComponent } from '@punk/core'
const CommandComponent = getComponent('Command')
```

## Styling

The component uses the default `cmdk` styles. You can customize with CSS:

```css
[cmdk-root] {
  /* Root styles */
}

[cmdk-input] {
  /* Search input styles */
}

[cmdk-item] {
  /* Item styles */
}

[cmdk-group-heading] {
  /* Group heading styles */
}
```

## Integration with DataContext

Use with Punk's DataContext for reactive data:

```json
{
  "type": "Command",
  "props": {
    "items": "{{commandItems}}",
    "placeholder": "{{searchPlaceholder}}"
  }
}
```

## Keyboard Navigation

- **↑↓**: Navigate items
- **Enter**: Select item
- **Escape**: Close menu
- **Type**: Search/filter items

## Examples

### Application Menu

```json
{
  "type": "Command",
  "props": {
    "placeholder": "Search commands...",
    "items": [
      {
        "heading": "Navigation",
        "items": [
          { "id": "home", "label": "Go to Home", "action": "nav.home" },
          { "id": "dashboard", "label": "Go to Dashboard", "action": "nav.dashboard" }
        ]
      },
      {
        "heading": "Actions",
        "items": [
          { "id": "logout", "label": "Logout", "action": "auth.logout" }
        ]
      }
    ]
  }
}
```

### Quick Switcher

```json
{
  "type": "Command",
  "props": {
    "placeholder": "Switch to...",
    "searchable": true,
    "items": [
      { "id": "proj1", "label": "Project Alpha", "keywords": ["alpha"] },
      { "id": "proj2", "label": "Project Beta", "keywords": ["beta"] },
      { "id": "proj3", "label": "Project Gamma", "keywords": ["gamma"] }
    ]
  }
}
```

## License

MIT
