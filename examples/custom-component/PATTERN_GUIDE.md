# Component Wrapper Pattern - Complete Guide

This guide provides a comprehensive reference for creating custom Punk component wrappers. Use this as a template and checklist when creating your own wrappers.

## Table of Contents

- [Overview](#overview)
- [The Pattern](#the-pattern)
- [Step-by-Step Guide](#step-by-step-guide)
- [Template Code](#template-code)
- [Requirements Checklist](#requirements-checklist)
- [Advanced Topics](#advanced-topics)
- [Testing Recommendations](#testing-recommendations)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What is a Component Wrapper?

A component wrapper is a thin layer around a React component or library that makes it compatible with Punk's schema-driven architecture. It enables:

- **JSON Schemas:** Define UIs declaratively
- **AI Generation:** SynthPunk can generate valid schemas
- **Visual Building:** Mohawk can display and configure components
- **Renderer Agnostic:** Works in DOM, GPU, and XR modes

### Architecture Principles

1. **Declarative:** Everything configurable via JSON
2. **Type-Safe:** Zod schemas provide runtime validation
3. **Discoverable:** Metadata enables UI/AI tooling
4. **Composable:** Works with other Punk components
5. **Renderer-Agnostic:** No DOM assumptions

---

## The Pattern

Every Punk component wrapper has **4 required parts**:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ZOD SCHEMA                                               │
│    - Props definition                                       │
│    - Runtime validation                                     │
│    - TypeScript types                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. METADATA                                                 │
│    - Display name, icon, description                        │
│    - Category, tags, complexity                             │
│    - For UI builders & documentation                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPONENT                                                │
│    - React implementation                                   │
│    - Uses DataContext & ActionBus                           │
│    - Renderer-agnostic logic                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. AUTO-REGISTRATION                                        │
│    - registerComponent() call                               │
│    - Happens on import                                      │
│    - Makes component globally available                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Guide

### Step 1: Zod Schema Definition

Define the component's props using Zod:

```typescript
import { z } from 'zod'

// Define sub-schemas if needed
const MyItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.any(),
})

// Main props schema
export const MyComponentPropsSchema = z.object({
  // Required props
  items: z.array(MyItemSchema),

  // Optional props with defaults
  title: z.string().optional().default('Untitled'),
  showHeader: z.boolean().optional().default(true),

  // Action handlers (string references)
  onSelect: z.string().optional(),
  onChange: z.string().optional(),

  // Data sources (string references or direct values)
  data: z.union([
    z.string(), // Reference to DataContext
    z.array(z.any()), // Direct value
  ]).optional(),

  // Styling
  height: z.string().optional().default('auto'),
  theme: z.enum(['light', 'dark']).optional().default('light'),
})

// Export schema map for SynthPunk
export const MyComponentSchemaMap = {
  MyComponent: MyComponentPropsSchema
}
```

**Key Points:**

- Use `.optional()` for optional props
- Use `.default()` for default values
- Action handlers should be `z.string().optional()` (action names)
- Data sources should support both string references and direct values
- Export both the schema and the schema map

### Step 2: Component Metadata

Define metadata for UI builders:

```typescript
import type { ComponentMeta } from '@punk/core'

export const MyComponentMeta: ComponentMeta = {
  // Displayed in UI
  displayName: 'My Component',

  // Shown in tooltips/docs
  description: 'A brief description of what the component does',

  // Lucide icon name (see https://lucide.dev)
  icon: 'component',

  // Category for grouping
  // Options: 'Layout', 'Data Visualization', 'Content', 'Input', 'Navigation'
  category: 'Data Visualization',

  // Tags for search
  tags: ['tag1', 'tag2', 'tag3'],

  // Complexity level
  // Options: 'simple', 'medium', 'advanced'
  complexity: 'medium',
}
```

**Category Guidelines:**

- **Layout:** Containers, grids, flexbox, etc.
- **Data Visualization:** Charts, tables, graphs, etc.
- **Content:** Text, images, rich text, code, etc.
- **Input:** Forms, buttons, dropdowns, etc.
- **Navigation:** Menus, breadcrumbs, tabs, etc.

**Complexity Guidelines:**

- **simple:** Basic components, minimal configuration
- **medium:** Moderate configuration, some advanced features
- **advanced:** Complex components, many options, requires expertise

### Step 3: Component Implementation

Implement the React component:

```typescript
import { useDataContext, useActionBus } from '@punk/core'

type MyComponentProps = z.infer<typeof MyComponentPropsSchema>

export function MyComponent(props: MyComponentProps) {
  // -------------------------------------------------------------------------
  // 1. DATA CONTEXT INTEGRATION
  // -------------------------------------------------------------------------
  const dataContext = useDataContext()

  // Resolve data references
  const items = typeof props.items === 'string'
    ? (dataContext[props.items] || [])
    : props.items

  const data = typeof props.data === 'string'
    ? dataContext[props.data]
    : props.data

  // -------------------------------------------------------------------------
  // 2. ACTION BUS INTEGRATION
  // -------------------------------------------------------------------------
  const actionBus = useActionBus()

  // Create action handlers
  const handleSelect = (item: any) => {
    if (props.onSelect && actionBus[props.onSelect]) {
      actionBus[props.onSelect](item)
    }
  }

  const handleChange = (value: any) => {
    if (props.onChange && actionBus[props.onChange]) {
      actionBus[props.onChange](value)
    }
  }

  // -------------------------------------------------------------------------
  // 3. VALIDATION & ERROR HANDLING
  // -------------------------------------------------------------------------
  if (!Array.isArray(items)) {
    console.warn('MyComponent: items must be an array')
    return <div>Invalid items prop</div>
  }

  // -------------------------------------------------------------------------
  // 4. RENDERING
  // -------------------------------------------------------------------------
  return (
    <div className="my-component" style={{ height: props.height }}>
      {props.showHeader && (
        <div className="header">
          <h3>{props.title}</h3>
        </div>
      )}

      <div className="content">
        {items.map((item) => (
          <div
            key={item.id}
            className="item"
            onClick={() => handleSelect(item)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Include component styles */}
      <style>{`
        .my-component {
          /* styles */
        }
      `}</style>
    </div>
  )
}
```

**Key Patterns:**

1. **Always use `useDataContext()`** to access reactive data
2. **Always use `useActionBus()`** to access actions
3. **Support string references** for data props
4. **Validate inputs** and handle errors gracefully
5. **Keep styles scoped** (use CSS-in-JS or scoped classes)

### Step 4: Auto-Registration

Register the component on import:

```typescript
import { registerComponent } from '@punk/core'

registerComponent('MyComponent', MyComponent, {
  schema: MyComponentPropsSchema,
  meta: MyComponentMeta,
})
```

**Important:**

- Place this at the **end of the file**
- Use the **exact same name** as the schema type
- Include **both** schema and meta
- This runs **automatically** when the file is imported

---

## Template Code

Copy this template to create a new component wrapper:

```typescript
/**
 * [ComponentName] Component Wrapper
 * [Brief description]
 */

import { z } from 'zod'
import { registerComponent } from '@punk/core'
import { useDataContext, useActionBus } from '@punk/core'
import React from 'react'
// Import external library
import { ExternalComponent } from 'external-library'

// ============================================================================
// STEP 1: ZOD SCHEMA
// ============================================================================

export const [ComponentName]PropsSchema = z.object({
  // Define props here
})

export const [ComponentName]SchemaMap = {
  [ComponentName]: [ComponentName]PropsSchema
}

// ============================================================================
// STEP 2: METADATA
// ============================================================================

export const [ComponentName]Meta = {
  displayName: '[Display Name]',
  description: '[Description]',
  icon: '[icon-name]',
  category: '[Category]',
  tags: ['tag1', 'tag2'],
  complexity: 'medium' as const,
}

// ============================================================================
// STEP 3: COMPONENT
// ============================================================================

type [ComponentName]Props = z.infer<typeof [ComponentName]PropsSchema>

export function [ComponentName](props: [ComponentName]Props) {
  const dataContext = useDataContext()
  const actionBus = useActionBus()

  // Resolve data references
  // Implement component logic
  // Return JSX

  return (
    <div className="[component-name]">
      {/* Implementation */}
    </div>
  )
}

// ============================================================================
// STEP 4: AUTO-REGISTRATION
// ============================================================================

registerComponent('[ComponentName]', [ComponentName], {
  schema: [ComponentName]PropsSchema,
  meta: [ComponentName]Meta,
})
```

---

## Requirements Checklist

Use this checklist when creating a component wrapper:

### Schema Requirements

- [ ] Schema uses Zod (`z.object()`)
- [ ] Schema is exported as `[Name]PropsSchema`
- [ ] Schema map is exported as `[Name]SchemaMap`
- [ ] Action handlers are `z.string().optional()`
- [ ] Data sources support string references
- [ ] Optional props have `.optional()` or `.default()`
- [ ] Complex types are broken into sub-schemas

### Metadata Requirements

- [ ] Metadata object is exported as `[Name]Meta`
- [ ] `displayName` is user-friendly
- [ ] `description` is concise and clear
- [ ] `icon` is a valid Lucide icon name
- [ ] `category` matches standard categories
- [ ] `tags` include relevant keywords
- [ ] `complexity` accurately reflects difficulty

### Component Requirements

- [ ] Component uses `useDataContext()` hook
- [ ] Component uses `useActionBus()` hook
- [ ] Props support string references (data sources)
- [ ] Actions are called through ActionBus
- [ ] Input validation with error messages
- [ ] TypeScript types from Zod schema
- [ ] Styles are scoped (CSS-in-JS or unique classes)
- [ ] No direct DOM manipulation
- [ ] No global state dependencies

### Registration Requirements

- [ ] `registerComponent()` called at end of file
- [ ] Component name matches schema type
- [ ] Schema and meta both provided
- [ ] Registration is unconditional (no `if` statements)

### Documentation Requirements

- [ ] JSDoc comments on exported items
- [ ] Usage example in comments
- [ ] Complex logic has inline comments
- [ ] Edge cases documented

### File Structure Requirements

- [ ] One component per file
- [ ] File named `[component-name]-wrapper.tsx`
- [ ] Exports: schema, schema map, meta, component
- [ ] Imports from `@punk/core`

---

## Advanced Topics

### Supporting List Rendering

For components that render lists of data:

```typescript
export const MyListPropsSchema = z.object({
  // Support both direct arrays and DataContext references
  items: z.union([
    z.string(), // Reference: "users"
    z.array(z.any()), // Direct: [...]
  ]),
})

export function MyList(props: MyListProps) {
  const dataContext = useDataContext()

  const items = typeof props.items === 'string'
    ? (dataContext[props.items] || [])
    : props.items

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id || index}>{item.label}</div>
      ))}
    </div>
  )
}
```

### Nested Data Access

For accessing nested data paths:

```typescript
import { getValueFromPath } from '@punk/core'

export const MyComponentPropsSchema = z.object({
  dataPath: z.string(), // e.g., "user.profile.name"
})

export function MyComponent(props: MyComponentProps) {
  const dataContext = useDataContext()

  // Access nested property
  const value = getValueFromPath(props.dataPath, dataContext)

  return <div>{value}</div>
}
```

### Conditional Rendering

Components can support conditional visibility:

```typescript
export const MyComponentPropsSchema = z.object({
  condition: z.string().optional(), // e.g., "user.isLoggedIn"
})

export function MyComponent(props: MyComponentProps) {
  const dataContext = useDataContext()

  // Evaluate condition
  if (props.condition) {
    const shouldRender = evaluateCondition(props.condition, dataContext)
    if (!shouldRender) return null
  }

  return <div>Content</div>
}
```

### Async Actions

For components that need async behavior:

```typescript
export function MyComponent(props: MyComponentProps) {
  const actionBus = useActionBus()
  const [loading, setLoading] = useState(false)

  const handleAsync = async () => {
    setLoading(true)
    try {
      // Call async action
      if (props.onSubmit && actionBus[props.onSubmit]) {
        await actionBus[props.onSubmit]()
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleAsync} disabled={loading}>
      {loading ? 'Loading...' : 'Submit'}
    </button>
  )
}
```

### Theme Support

For components with theming:

```typescript
export const MyComponentPropsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional().default('light'),
  customColors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }).optional(),
})

export function MyComponent(props: MyComponentProps) {
  const colors = props.customColors || {
    primary: props.theme === 'light' ? '#000' : '#fff',
    secondary: props.theme === 'light' ? '#666' : '#999',
  }

  return (
    <div style={{ color: colors.primary }}>
      {/* Content */}
    </div>
  )
}
```

---

## Testing Recommendations

### Unit Tests

Test the component in isolation:

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MyComponent } from './my-component-wrapper'

describe('MyComponent', () => {
  it('renders with default props', () => {
    const { container } = render(<MyComponent items={[]} />)
    expect(container).toBeInTheDocument()
  })

  it('calls action on interaction', () => {
    const mockAction = vi.fn()
    // Test action handling
  })
})
```

### Schema Validation Tests

Test the Zod schema:

```typescript
import { describe, it, expect } from 'vitest'
import { MyComponentPropsSchema } from './my-component-wrapper'

describe('MyComponentPropsSchema', () => {
  it('validates valid props', () => {
    const result = MyComponentPropsSchema.safeParse({
      items: [],
      title: 'Test',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid props', () => {
    const result = MyComponentPropsSchema.safeParse({
      items: 'not-an-array',
    })
    expect(result.success).toBe(false)
  })
})
```

### Integration Tests

Test with PunkRenderer:

```typescript
import { PunkRenderer } from '@punk/core'
import './my-component-wrapper'

it('works with PunkRenderer', () => {
  const schema = {
    type: 'MyComponent',
    props: {
      items: 'data.items',
    }
  }

  const data = {
    items: [{ id: '1', label: 'Item 1' }]
  }

  const { container } = render(
    <PunkRenderer schema={schema} data={data} />
  )

  expect(container).toHaveTextContent('Item 1')
})
```

### Accessibility Tests

Test for a11y:

```typescript
import { axe } from 'jest-axe'

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent items={[]} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Troubleshooting

### Component Not Found

**Problem:** "Unknown component type: MyComponent"

**Solutions:**
1. Ensure you're importing the wrapper file
2. Check that `registerComponent()` is called
3. Verify the component name matches exactly
4. Check for TypeScript compilation errors

### Data Not Updating

**Problem:** Component doesn't reflect data changes

**Solutions:**
1. Ensure you're using `useDataContext()` hook
2. Check that data is passed to `PunkRenderer`
3. Verify string references match data keys
4. Use React DevTools to inspect context

### Actions Not Firing

**Problem:** Event handlers don't work

**Solutions:**
1. Ensure you're using `useActionBus()` hook
2. Check action name matches exactly
3. Verify action is passed to `PunkRenderer`
4. Check console for errors
5. Verify action is called correctly:
   ```typescript
   if (props.onClick && actionBus[props.onClick]) {
     actionBus[props.onClick](payload)
   }
   ```

### TypeScript Errors

**Problem:** Type errors when using component

**Solutions:**
1. Ensure schema is exported
2. Use `z.infer<typeof Schema>` for types
3. Check TypeScript version compatibility
4. Verify `@punk/core` types are available

### Schema Validation Fails

**Problem:** Valid data rejected by schema

**Solutions:**
1. Test schema with `.safeParse()`
2. Check for typos in property names
3. Verify optional props use `.optional()`
4. Check nested schema definitions
5. Use Zod error messages:
   ```typescript
   const result = schema.safeParse(data)
   if (!result.success) {
     console.log(result.error.issues)
   }
   ```

---

## Additional Resources

- **Zod Documentation:** https://zod.dev
- **Punk Core API:** `/packages/core/README.md`
- **Lucide Icons:** https://lucide.dev
- **Implementation Plan:** `/RIGS_IMPLEMENTATION_PLAN.md`
- **Example Code:** `/examples/custom-component/src/kanban-wrapper.tsx`

---

**Questions?** Check the detailed example in `src/kanban-wrapper.tsx` which demonstrates all these concepts with extensive comments.
