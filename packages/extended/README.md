# @punk/extended

> Extended component loadout for Punk Framework - curated collection of component wrappers

[![Version](https://img.shields.io/npm/v/@punk/extended.svg)](https://www.npmjs.com/package/@punk/extended)
[![License](https://img.shields.io/npm/l/@punk/extended.svg)](https://github.com/PerceptLabs/Punk/blob/main/LICENSE)

## 🎯 What is this?

`@punk/extended` is a **meta-package** that bundles 8 pre-wrapped React component libraries for use with the Punk Framework. Each component:

- ✅ Works via **JSON schemas** (like Puck)
- ✅ Auto-registers with the **ComponentRegistry**
- ✅ Includes **Zod schemas** for AI generation (SynthPunk)
- ✅ Provides **metadata** for visual builders (Mohawk)
- ✅ Is **renderer-agnostic** (works in DOM/GPU/XR modes)

## 📦 Installation

```bash
# Using pnpm (recommended for monorepos)
pnpm add @punk/extended

# Using npm
npm install @punk/extended

# Using yarn
yarn add @punk/extended
```

## 🚀 Quick Start

```typescript
import '@punk/extended' // Auto-registers all components
import { PunkRenderer } from '@punk/core'

const schema = {
  punkVersion: '1.0',
  schemaVersion: '1.0',
  root: {
    type: 'Container',
    children: [
      {
        type: 'Chart',
        props: {
          chartType: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{
              label: 'Sales',
              data: [12, 19, 3]
            }]
          },
          width: '100%',
          height: '300px'
        }
      },
      {
        type: 'Table',
        props: {
          data: [
            { id: 1, name: 'John', email: 'john@example.com' },
            { id: 2, name: 'Jane', email: 'jane@example.com' }
          ],
          columns: [
            { id: 'id', header: 'ID', accessor: 'id' },
            { id: 'name', header: 'Name', accessor: 'name' },
            { id: 'email', header: 'Email', accessor: 'email' }
          ],
          pagination: true,
          sorting: true
        }
      }
    ]
  }
}

function App() {
  return <PunkRenderer schema={schema} />
}
```

## 📚 Available Components

| Component | Library | Category | Complexity | Use Case |
|-----------|---------|----------|-----------|----------|
| **Chart** | Chart.js + react-chartjs-2 | Data Visualization | Medium | Interactive charts (bar, line, pie, doughnut, radar) |
| **Table** | TanStack Table | Data Visualization | Medium | Sortable, paginated data tables |
| **Mermaid** | Mermaid | Data Visualization | Simple | Flowcharts and diagrams from text |
| **RichText** | Lexical | Content | Advanced | Rich text editing with history |
| **Code** | CodeMirror | Content | Medium | Syntax-highlighted code editing |
| **FileDrop** | react-dropzone | Input | Simple | Drag-and-drop file uploads |
| **DatePicker** | react-day-picker | Input | Simple | Date selection (single, multiple, range) |
| **Command** | cmdk | Navigation | Medium | Command palette for quick actions |

## 🎨 Component Presets

Pre-configured component collections for common use cases:

### Dashboard Preset
```typescript
import { DashboardPreset } from '@punk/extended/presets'

console.log(DashboardPreset)
// {
//   name: 'Dashboard',
//   description: 'Charts, tables, and data visualization',
//   components: ['Chart', 'Table', 'Mermaid', 'DatePicker']
// }
```

### Content Preset
```typescript
import { ContentPreset } from '@punk/extended/presets'
// Components: RichText, Code, FileDrop
// Use case: Content management systems, blog editors
```

### Chat Preset
```typescript
import { ChatPreset } from '@punk/extended/presets'
// Components: RichText, Code, FileDrop, Command
// Use case: Chat apps, messaging tools
```

### Admin Preset
```typescript
import { AdminPreset } from '@punk/extended/presets'
// Components: Chart, Table, DatePicker, Command, FileDrop
// Use case: Admin panels, internal tools
```

### Developer Preset
```typescript
import { DeveloperPreset } from '@punk/extended/presets'
// Components: Code, Mermaid, Command, FileDrop
// Use case: Code editors, API docs, developer portals
```

## 📖 Individual Component Documentation

Each component has its own package with detailed documentation:

- [`@punk/component-chart`](../component-chart/README.md) - Chart.js wrapper
- [`@punk/component-table`](../component-table/README.md) - TanStack Table wrapper
- [`@punk/component-mermaid`](../component-mermaid/README.md) - Mermaid diagrams
- [`@punk/component-richtext`](../component-richtext/README.md) - Lexical editor
- [`@punk/component-code`](../component-code/README.md) - CodeMirror editor
- [`@punk/component-filedrop`](../component-filedrop/README.md) - File uploads
- [`@punk/component-date`](../component-date/README.md) - Date picker
- [`@punk/component-command`](../component-command/README.md) - Command palette

## 🤖 AI Generation (SynthPunk)

Use component schemas for AI-driven generation:

```typescript
import { ExtendedSchemaRegistry } from '@punk/extended'
import { SynthPunk } from '@punk/synthpunk'

const engine = new SynthPunk({
  schemas: ExtendedSchemaRegistry,
  // AI can now generate Chart, Table, etc.
})

const result = await engine.generate('Create a sales dashboard with a bar chart')
// Returns: { schema: { type: 'Chart', props: { ... } } }
```

## 🎨 Visual Building (Mohawk)

Components appear in the Mohawk component palette with metadata:

```typescript
import { useComponentRegistry } from '@punk/core'

function ComponentPalette() {
  const { getAllMeta, getByCategory } = useComponentRegistry()

  // Get all components
  const allMeta = getAllMeta()

  // Get by category
  const dataVizComponents = getByCategory('Data Visualization')
  // Returns: ['Chart', 'Table', 'Mermaid']

  return (
    <div>
      {allMeta.map(([type, meta]) => (
        <div key={type}>
          <Icon name={meta.icon} />
          <h3>{meta.displayName}</h3>
          <p>{meta.description}</p>
        </div>
      ))}
    </div>
  )
}
```

## 🔧 Importing Specific Components

If you don't want all components, import individually:

```typescript
// Only import what you need
import '@punk/component-chart'
import '@punk/component-table'

// These will auto-register, others won't be loaded
```

## 📝 Schema Examples

### Chart Example
```json
{
  "type": "Chart",
  "props": {
    "chartType": "line",
    "data": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "datasets": [{
        "label": "Users",
        "data": [150, 230, 180, 290],
        "borderColor": "rgb(75, 192, 192)"
      }]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "legend": { "display": true }
      }
    },
    "height": "400px"
  }
}
```

### Table Example
```json
{
  "type": "Table",
  "props": {
    "data": "usersData",
    "columns": [
      { "id": "name", "header": "Name", "accessor": "name" },
      { "id": "email", "header": "Email", "accessor": "email" },
      { "id": "role", "header": "Role", "accessor": "role" }
    ],
    "pagination": true,
    "pageSize": 10,
    "sorting": true
  }
}
```

### Mermaid Example
```json
{
  "type": "Mermaid",
  "props": {
    "diagram": "graph TD\n  A[Start] --> B[Process]\n  B --> C[End]",
    "theme": "default"
  }
}
```

### Code Example
```json
{
  "type": "Code",
  "props": {
    "code": "function hello() {\n  console.log('Hello, World!')\n}",
    "language": "javascript",
    "theme": "dark",
    "readOnly": false,
    "lineNumbers": true
  }
}
```

## 🔌 DataContext Integration

Use string references to bind data:

```typescript
import { PunkRenderer, DataContext } from '@punk/core'

const data = {
  salesData: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{ label: 'Revenue', data: [100, 150, 200, 180] }]
  }
}

const schema = {
  type: 'Chart',
  props: {
    chartType: 'bar',
    data: 'salesData' // Resolves to data.salesData
  }
}

function App() {
  return (
    <DataContext.Provider value={data}>
      <PunkRenderer schema={schema} />
    </DataContext.Provider>
  )
}
```

## 🎬 ActionBus Integration

Wire up event handlers:

```typescript
import { PunkRenderer, ActionBus } from '@punk/core'

const actions = {
  handleUpload: async (files) => {
    console.log('Uploading:', files)
    await uploadToServer(files)
  }
}

const schema = {
  type: 'FileDrop',
  props: {
    accept: 'image/*',
    maxFiles: 5,
    onUpload: 'handleUpload' // Resolves to actions.handleUpload
  }
}

function App() {
  return (
    <ActionBus.Provider value={actions}>
      <PunkRenderer schema={schema} />
    </ActionBus.Provider>
  )
}
```

## 🏗️ Creating Custom Components

Want to add your own components? Follow the canonical pattern:

```typescript
import { z } from 'zod'
import { registerComponent, ComponentMeta } from '@punk/core'

// 1. Define Zod schema
export const MyComponentPropsSchema = z.object({
  title: z.string(),
  count: z.number().default(0)
})

export const MyComponentSchemaMap = {
  MyComponent: MyComponentPropsSchema
}

// 2. Define metadata
export const MyComponentMeta: ComponentMeta = {
  displayName: 'My Component',
  description: 'A custom component',
  icon: 'box',
  category: 'Custom',
  tags: ['custom', 'example'],
  complexity: 'simple'
}

// 3. Implement component
export function MyComponent(props: z.infer<typeof MyComponentPropsSchema>) {
  return <div>{props.title}: {props.count}</div>
}

// 4. Auto-register
registerComponent('MyComponent', MyComponent, {
  schema: MyComponentPropsSchema,
  meta: MyComponentMeta
})
```

See the [custom-component example](../../examples/custom-component/README.md) for a complete tutorial.

## 📦 Package Structure

```
@punk/extended
├── src/
│   ├── index.ts        # Main exports, auto-registration
│   ├── presets.ts      # Component presets
│   └── schemas.ts      # Schema aggregation for SynthPunk
└── README.md
```

## 🔗 Dependencies

This package bundles:
- `@punk/core` - Core framework
- `@punk/component-chart` - Chart wrapper
- `@punk/component-table` - Table wrapper
- `@punk/component-mermaid` - Mermaid wrapper
- `@punk/component-richtext` - RichText wrapper
- `@punk/component-code` - Code wrapper
- `@punk/component-filedrop` - FileDrop wrapper
- `@punk/component-date` - DatePicker wrapper
- `@punk/component-command` - Command wrapper

All underlying libraries (Chart.js, TanStack Table, etc.) are included as transitive dependencies.

## 🎯 Philosophy

The loadout system follows these principles:

1. **Components are npm packages** - Easy to install, version, and distribute
2. **Not rendering engines** - Just convenience wrappers
3. **Renderer-agnostic** - Work in any rendering mode
4. **Easy to extend** - Clear pattern for custom components
5. **Auto-registration** - Import and use, no manual setup
6. **Metadata-rich** - Support both AI and visual builders

## 🚀 Examples

- [**Dashboard Example**](../../examples/loadout-dashboard/README.md) - Analytics dashboard with charts and tables
- [**Custom Component Example**](../../examples/custom-component/README.md) - How to create your own wrappers

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on:
- Adding new component wrappers
- Improving existing components
- Documentation improvements
- Bug reports and feature requests

## 📄 License

MIT © PerceptLabs

## 🔗 Links

- [Punk Framework Documentation](../../README.md)
- [Component Reference](../../COMPONENT_REFERENCE.md)
- [GitHub Repository](https://github.com/PerceptLabs/Punk)
- [Examples](../../examples/)

---

**Built with ❤️ by the Punk Framework team**
