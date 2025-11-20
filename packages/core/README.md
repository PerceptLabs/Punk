# @punk/core

Core rendering engine for the Punk framework - deterministic, validated, accessible UI from JSON schemas.

## Overview

`@punk/core` provides the foundation for the Punk framework, enabling you to render React UIs from validated JSON schemas. It implements the Puck renderer with full validation, type safety, and accessibility support.

## Features

- **Deterministic Rendering**: Same schema + data always produces identical output
- **Runtime Validation**: Zod-based schema validation with complexity budgets
- **Type Safety**: Full TypeScript coverage with strict mode
- **Accessibility**: Built-in ARIA support and semantic HTML
- **Performance**: Memoization and optimization strategies
- **Extensible**: Component registry for custom components
- **Secure**: No arbitrary code execution, validated template expressions

## Installation

```bash
npm install @punk/core zod react react-dom
```

## Quick Start

```tsx
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'container',
  children: [
    {
      type: 'heading',
      props: {
        level: 1,
        children: 'Hello {{user.name}}!',
      },
    },
    {
      type: 'button',
      props: {
        onClick: 'handleClick',
        children: 'Click Me',
      },
    },
  ],
}

const data = {
  user: { name: 'Alice' },
}

const actions = {
  handleClick: () => console.log('Button clicked!'),
}

function App() {
  return (
    <PunkRenderer
      schema={schema}
      data={data}
      actions={actions}
    />
  )
}
```

## Core Concepts

### Schema Structure

A Punk schema is a tree of nodes describing your UI:

```typescript
type PunkNode = {
  type: string              // Component type (e.g., 'button', 'text')
  id?: string               // Unique identifier
  props?: Record<string, any>  // Component props
  children?: PunkNode[]     // Child nodes
  dataSource?: string       // For list rendering
  itemTemplate?: PunkNode   // Template for list items
  condition?: string        // Conditional rendering
}
```

### Data Context

Data flows through your schema via template interpolation:

```tsx
// Schema
{
  type: 'text',
  props: {
    children: 'Welcome {{user.name}}!',
  },
}

// Data
{
  user: { name: 'Alice' }
}

// Result: "Welcome Alice!"
```

Supports nested paths: `{{user.profile.email}}`, `{{items[0].title}}`

### Action Bus

Event handlers are registered and bound by name:

```tsx
const schema = {
  type: 'button',
  props: {
    onClick: 'handleSubmit',  // Handler name
    children: 'Submit',
  },
}

const actions = {
  handleSubmit: (event) => {
    // Handle click event
  },
}
```

### Component Registry

Register custom components for use in schemas:

```tsx
import { registerComponent } from '@punk/core'

registerComponent('custom-card', CustomCard)

// Now use in schema
{
  type: 'custom-card',
  props: { title: 'My Card' }
}
```

## API Reference

### PunkRenderer

Main component for rendering schemas.

```tsx
<PunkRenderer
  schema={schema}           // Required: Schema to render
  data={data}               // Optional: Data context
  actions={actions}         // Optional: Event handlers
  registry={customRegistry} // Optional: Custom component registry
  onError={handleError}     // Optional: Error callback
  errorBoundary={true}      // Optional: Enable error boundary
/>
```

### Validation

```typescript
import { validateSchema, validateComplexity } from '@punk/core'

// Validate schema structure
const result = validateSchema(schema)
if (!result.valid) {
  console.error(result.errors)
}

// Check complexity budget
const complexity = validateComplexity(node)
console.log(`Nodes: ${complexity.nodeCount}, Depth: ${complexity.maxDepth}`)
```

### Props Processing

```typescript
import { interpolateProps, bindActions, getValueFromPath } from '@punk/core'

// Interpolate data
const props = interpolateProps({ text: '{{user.name}}' }, data)

// Bind actions
const boundProps = bindActions({ onClick: 'handler' }, actions)

// Get nested value
const value = getValueFromPath('user.profile.email', data)
```

### Component Registry

```typescript
import { ComponentRegistry, defaultRegistry } from '@punk/core'

// Use default registry
defaultRegistry.register('my-component', MyComponent)

// Or create custom registry
const registry = new ComponentRegistry()
registry.register('button', CustomButton)
registry.register('text', CustomText)
```

## Advanced Features

### List Rendering

Render lists from data sources:

```tsx
const schema = {
  type: 'list',
  dataSource: 'users',
  itemTemplate: {
    type: 'card',
    props: {
      title: '{{item.name}}',
      subtitle: '{{item.email}}',
    },
  },
}

const data = {
  users: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
  ],
}
```

### Conditional Rendering

Show/hide nodes based on data:

```tsx
{
  type: 'text',
  condition: 'user.isLoggedIn',
  props: {
    children: 'Welcome back!',
  },
}

// Supports negation and comparisons
condition: '!user.isGuest'
condition: 'user.role === "admin"'
```

### Security Validation

Check schemas for dangerous content:

```typescript
import { validateSecurity } from '@punk/core'

const result = validateSecurity(schema)
if (!result.safe) {
  console.error('Security issues:', result.issues)
}
```

## Testing

The package includes comprehensive tests using Vitest and React Testing Library:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  PunkNode,
  PunkSchema,
  PunkRendererProps,
  DataContext,
  ActionBus,
  ValidationResult,
  ComplexityResult,
} from '@punk/core'
```

## Performance

The renderer includes several optimizations:

- **Memoization**: Components and props are memoized to prevent unnecessary re-renders
- **Complexity Budgets**: Schemas are validated against max node count and depth
- **React.memo**: Node renderer is memoized for stable references
- **useMemo**: Props processing is cached per render

## Error Handling

Built-in error boundary catches and displays rendering errors:

```tsx
<PunkRenderer
  schema={schema}
  errorBoundary={true}  // Default
  onError={(error) => {
    // Custom error handling
    logToService(error)
  }}
/>
```

## Contributing

See the main [Punk Framework repository](https://github.com/punk-framework/punk) for contribution guidelines.

## License

MIT
