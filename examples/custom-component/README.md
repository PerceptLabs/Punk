# Creating Custom Component Wrappers

This example demonstrates how to create custom component wrappers for Punk Framework. By following the canonical pattern, you can wrap any React library to work seamlessly with Punk's schema-driven architecture.

## What You'll Learn

- The 4-step canonical pattern for component wrappers
- How to integrate external libraries (e.g., drag-and-drop)
- How to use DataContext for reactive data
- How to use ActionBus for declarative events
- How to make components work with SynthPunk and Mohawk

## The Example: Kanban Board

This example wraps [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd) to create a drag-and-drop Kanban board that works via JSON schemas.

### Features

- Drag-and-drop task cards between columns
- Schema-driven configuration
- Reactive data integration
- Declarative event handling
- Ready for AI generation (SynthPunk)
- Ready for visual building (Mohawk)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to see the example.

## The Canonical Pattern

Every Punk component wrapper follows this 4-step pattern:

### Step 1: Zod Schema Definition

Define the props structure using Zod. This enables:
- Runtime validation
- TypeScript type inference
- AI generation (SynthPunk)

```typescript
import { z } from 'zod'

export const KanbanPropsSchema = z.object({
  columns: z.array(KanbanColumnSchema),
  cards: z.array(KanbanCardSchema),
  onCardMove: z.string().optional(),
  height: z.string().optional().default('600px'),
  readOnly: z.boolean().optional().default(false),
})

export const KanbanSchemaMap = {
  Kanban: KanbanPropsSchema
}
```

**Why?** The schema serves as the contract between JSON and React. SynthPunk uses this to generate valid schemas from natural language.

### Step 2: Component Metadata

Define metadata for UI builders and documentation:

```typescript
export const KanbanMeta = {
  displayName: 'Kanban Board',
  description: 'Drag-and-drop Kanban board for task management',
  icon: 'kanban-square', // Lucide icon name
  category: 'Data Visualization',
  tags: ['kanban', 'board', 'tasks', 'drag-drop'],
  complexity: 'advanced' as const,
}
```

**Why?** Mohawk uses this to display components in the visual builder. The metadata enables:
- Component palettes with icons
- Categorization and grouping
- Search and filtering
- Beginner/advanced mode filtering

### Step 3: Component Implementation

Implement the React component using Punk's context hooks:

```typescript
type KanbanProps = z.infer<typeof KanbanPropsSchema>

export function Kanban(props: KanbanProps) {
  // Access reactive data
  const dataContext = useDataContext()

  // Access action handlers
  const actionBus = useActionBus()

  // Resolve data references
  const cards = typeof props.cards === 'string'
    ? dataContext[props.cards]
    : props.cards

  // Call actions declaratively
  const handleDragEnd = (result) => {
    if (props.onCardMove && actionBus[props.onCardMove]) {
      actionBus[props.onCardMove]({
        cardId: result.draggableId,
        fromColumn: result.source.droppableId,
        toColumn: result.destination.droppableId,
      })
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* Implementation */}
    </DragDropContext>
  )
}
```

**Why?** Using `useDataContext()` and `useActionBus()` makes components:
- Work with JSON schemas
- Renderer-agnostic (DOM/GPU/XR)
- Declarative and reusable

### Step 4: Auto-Registration

Register the component automatically on import:

```typescript
import { registerComponent } from '@punk/core'

registerComponent('Kanban', Kanban, {
  schema: KanbanPropsSchema,
  meta: KanbanMeta,
})
```

**Why?** Auto-registration means:
- No manual registry management
- Works immediately when imported
- Lazy loading friendly
- Clean, simple APIs

## Using the Component

### Via PunkRenderer (Recommended)

```typescript
import { PunkRenderer } from '@punk/core'
import './kanban-wrapper' // Auto-registers

const schema = {
  type: 'Kanban',
  props: {
    columns: [
      { id: 'todo', title: 'To Do', color: '#3b82f6' },
      { id: 'done', title: 'Done', color: '#10b981' },
    ],
    cards: 'tasks', // Reference to data.tasks
    onCardMove: 'handleCardMove', // Reference to actions.handleCardMove
  }
}

const data = {
  tasks: [
    { id: '1', title: 'Task 1', columnId: 'todo' },
    { id: '2', title: 'Task 2', columnId: 'done' },
  ]
}

const actions = {
  handleCardMove: (payload) => {
    console.log('Card moved:', payload)
  }
}

<PunkRenderer schema={schema} data={data} actions={actions} />
```

### Direct Usage (Also Works)

```typescript
import { Kanban } from './kanban-wrapper'

<Kanban
  columns={[...]}
  cards={[...]}
  onCardMove={(payload) => console.log(payload)}
/>
```

## Integration Points

### SynthPunk (AI Generation)

```typescript
import { KanbanSchemaMap } from './kanban-wrapper'

// SynthPunk uses the schema to generate valid JSON
const componentRegistry = buildComponentRegistry({
  Kanban: {
    type: 'Kanban',
    label: 'Kanban Board',
    props: KanbanSchemaMap.Kanban, // Zod schema
  }
})
```

### Mohawk (Visual Builder)

```typescript
import { useComponentRegistry } from '@punk/core'

function ComponentPalette() {
  const { getAllMeta, getByCategory } = useComponentRegistry()

  // Display components with metadata
  const dataVizComponents = getByCategory('Data Visualization')
  // Returns: ['Kanban', 'Chart', 'Table', ...]

  const meta = getMeta('Kanban')
  // Returns: { displayName: 'Kanban Board', icon: 'kanban-square', ... }
}
```

## Best Practices

### 1. Keep Components Renderer-Agnostic

**Do:**
```typescript
// Use DataContext
const data = useDataContext()
const items = data[props.dataSource]

// Use ActionBus
const actions = useActionBus()
actions[props.onClick]?.()
```

**Don't:**
```typescript
// Don't directly access global state
const items = store.getState().items

// Don't create non-serializable handlers
onClick={() => doSomething()}
```

### 2. Support String References

Allow props to be either values OR string references:

```typescript
const cards = typeof props.cards === 'string'
  ? dataContext[props.cards]
  : props.cards
```

This enables declarative schemas:
```json
{ "cards": "tasks" }  // Reference
{ "cards": [...] }     // Direct value
```

### 3. Use Zod Defaults

Provide sensible defaults in schemas:

```typescript
z.object({
  height: z.string().default('600px'),
  readOnly: z.boolean().default(false),
})
```

### 4. Include Metadata Tags

Add comprehensive tags for searchability:

```typescript
tags: ['kanban', 'board', 'tasks', 'drag-drop', 'project-management']
```

### 5. Handle Errors Gracefully

```typescript
if (!Array.isArray(cards)) {
  console.warn('Cards must be an array, got:', cards)
  return <div>Invalid cards data</div>
}
```

## Common Pitfalls

### 1. Forgetting Auto-Registration

**Problem:**
```typescript
// Component defined but not registered
export function Kanban() { ... }
```

**Solution:**
```typescript
export function Kanban() { ... }
registerComponent('Kanban', Kanban, { schema, meta })
```

### 2. Not Using DataContext

**Problem:**
```typescript
// Props are always expected to be direct values
function MyComponent(props: MyProps) {
  return <div>{props.data.map(...)}</div>
}
```

**Solution:**
```typescript
// Support both direct values and references
function MyComponent(props: MyProps) {
  const dataContext = useDataContext()
  const data = typeof props.data === 'string'
    ? dataContext[props.data]
    : props.data

  return <div>{data.map(...)}</div>
}
```

### 3. Inline Event Handlers

**Problem:**
```typescript
// Non-serializable, won't work in JSON schemas
<button onClick={() => console.log('clicked')}>
```

**Solution:**
```typescript
// Use ActionBus
const actions = useActionBus()
<button onClick={() => actions[props.onClick]?.()}>
```

### 4. Missing Type Exports

**Problem:**
```typescript
// Schema defined but not exported
const MyPropsSchema = z.object({ ... })
```

**Solution:**
```typescript
// Export schema and schema map
export const MyPropsSchema = z.object({ ... })
export const MySchemaMap = { MyComponent: MyPropsSchema }
```

## File Structure

```
custom-component/
├── src/
│   ├── kanban-wrapper.tsx   # The component wrapper (STUDY THIS!)
│   ├── App.tsx               # Usage example
│   ├── schema.ts             # Example schemas and data
│   ├── main.tsx              # Entry point
│   └── index.css             # Styles
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
├── README.md                 # This file
└── PATTERN_GUIDE.md          # Detailed pattern documentation
```

## Next Steps

1. **Study the Code**
   - Read `src/kanban-wrapper.tsx` line by line
   - Check the detailed comments explaining each section
   - Run the example and experiment with the code

2. **Create Your Own Wrapper**
   - Choose a library you want to wrap
   - Copy `PATTERN_GUIDE.md` as a template
   - Follow the 4-step pattern
   - Test with PunkRenderer

3. **Package Your Component**
   - Create a package in `packages/component-{name}/`
   - Follow the same structure
   - Publish to npm or keep private

4. **Integrate with Tools**
   - Add schema to SynthPunk for AI generation
   - Add metadata to Mohawk for visual building
   - Test in different rendering modes

## Resources

- **Pattern Guide:** See `PATTERN_GUIDE.md` for detailed documentation
- **Core Docs:** See `/packages/core/README.md`
- **Implementation Plan:** See `/LOADOUT_IMPLEMENTATION_PLAN.md`
- **Zod Docs:** https://zod.dev
- **@hello-pangea/dnd Docs:** https://github.com/hello-pangea/dnd

## Questions?

Check the detailed comments in `src/kanban-wrapper.tsx` - they explain every aspect of the pattern with examples and reasoning.

---

**Happy Hacking!**
