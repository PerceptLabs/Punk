# Architecture

Complete technical architecture of the Punk Framework.

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Foundation Layer](#foundation-layer)
4. [Component System](#component-system)
5. [Schema Validation](#schema-validation)
6. [Rendering Pipeline](#rendering-pipeline)
7. [DataContext & ActionBus](#datacontext--actionbus)
8. [Backend Adapters](#backend-adapters)
9. [AI Integration (Epoch)](#ai-integration-epoch)
10. [CLI Architecture](#cli-architecture)
11. [Web Builder Architecture](#web-builder-architecture)
12. [Skill System](#skill-system)
13. [Security Model](#security-model)
14. [Performance Considerations](#performance-considerations)

---

## Overview

The Punk Framework is built on a **layered architecture** that separates concerns and enables progressive enhancement through tiers.

### Core Principles

1. **Schema-First:** All UI is defined as JSON schemas, not raw code
2. **Deterministic:** Same input always produces same output
3. **Validated:** All data flows through Zod validation
4. **Type-Safe:** Full TypeScript coverage
5. **Accessible:** WCAG 2.1 AA compliance built-in
6. **Extensible:** Plugin architecture via Skills

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACES                         │
│                                                             │
│  ┌──────────────────┐           ┌──────────────────┐       │
│  │   Punk CLI       │           │ Atompunk Builder │       │
│  │   (Go + Charm)   │           │   (React SPA)    │       │
│  └────────┬─────────┘           └────────┬─────────┘       │
└───────────┼──────────────────────────────┼─────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────┐
│                    CORE FRAMEWORK                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              @punk/core (Foundation)                │   │
│  │  • PunkRenderer    • Zod Schemas                    │   │
│  │  • Component Map   • Type Definitions               │   │
│  │  • DataContext     • ActionBus                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────┼────────────────────────────┐   │
│  │                        │                            │   │
│  │  ┌──────────────────┐  │  ┌──────────────────────┐ │   │
│  │  │  @punk/synthpunk │  │  │  @punk/atompunk      │ │   │
│  │  │  (AI Frontend)   │  │  │  (AI Full-Stack)     │ │   │
│  │  │                  │  │  │                      │ │   │
│  │  │  • Epoch Engine  │  │  │  • Backend Gen      │ │   │
│  │  │  • Revision Mgr  │  │  │  • DB Schemas       │ │   │
│  │  │  • Context Mgr   │  │  │  • Templates        │ │   │
│  │  └──────────────────┘  │  └──────────────────────┘ │   │
│  └────────────────────────┴────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           @punk/adapters (Backend)                  │   │
│  │  • Encore.ts   • tRPC      • GlyphCase             │   │
│  │  • Encore      • Manifest  • Custom                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼─────────────────────────────────┐
│                   DEPENDENCIES                              │
│                                                             │
│  • React          • Zod            • Anthropic SDK          │
│  • Radix UI       • TokiForge      • SQLite (GlyphCase)    │
│  • TypeScript     • Vite           • Encore SDK            │
└─────────────────────────────────────────────────────────────┘
```

---

## System Architecture

### Layer Breakdown

#### Layer 1: Foundation (@punk/core)

**Purpose:** Deterministic schema rendering
**Dependencies:** React, Radix UI, Zod
**Exports:** PunkRenderer, validation schemas, types

```typescript
// Core exports
export { PunkRenderer } from './renderer'
export { validateSchema } from './validator'
export { createDataContext } from './context'
export { createActionBus } from './actions'
export type { PunkSchema, PunkComponent, PunkProps } from './types'
```

#### Layer 2: AI Generation (@punk/synthpunk)

**Purpose:** AI-powered schema generation
**Dependencies:** @punk/core, Anthropic SDK
**Exports:** Epoch engine, revision manager

```typescript
// Synthpunk exports
export { EpochEngine } from './epoch'
export { RevisionManager } from './revisions'
export { ContextManager } from './context'
export type { GenerationRequest, GenerationResult } from './types'
```

#### Layer 3: Full-Stack (@punk/atompunk)

**Purpose:** Backend and database generation
**Dependencies:** @punk/synthpunk, backend SDKs
**Exports:** Full-stack generator, template manager

```typescript
// Atompunk exports
export { AtompunkEngine } from './engine'
export { TemplateManager } from './templates'
export { DatabaseGenerator } from './database'
export type { BackendConfig, DeployConfig } from './types'
```

---

## Foundation Layer

### Punk Schema Format

All UIs are defined as JSON schemas conforming to this structure:

```typescript
interface PunkSchema {
  type: string                    // Component type (e.g., "button", "form")
  id?: string                     // Optional unique identifier
  props?: Record<string, any>     // Component props
  children?: PunkSchema[]         // Child components
  dataSource?: string             // Reference to data context
  itemTemplate?: PunkSchema       // Template for list rendering
  condition?: string              // Conditional rendering expression
}
```

### Example Schema

```json
{
  "type": "form",
  "id": "login-form",
  "props": {
    "onSubmit": "handleLogin",
    "aria-label": "Login form"
  },
  "children": [
    {
      "type": "input",
      "props": {
        "name": "email",
        "type": "email",
        "placeholder": "Email",
        "required": true,
        "aria-label": "Email address"
      }
    },
    {
      "type": "input",
      "props": {
        "name": "password",
        "type": "password",
        "placeholder": "Password",
        "required": true,
        "aria-label": "Password"
      }
    },
    {
      "type": "button",
      "props": {
        "type": "submit",
        "children": "Sign In",
        "aria-label": "Sign in to your account"
      }
    }
  ]
}
```

---

## Component System

### Component Architecture

Punk uses a **component mapping system** that translates schema types to React components:

```typescript
// packages/core/src/components/index.ts

import { Button } from './Button'
import { Input } from './Input'
import { Form } from './Form'
import { Container } from './Container'
// ... more components

export const ComponentMap: Record<string, React.ComponentType<any>> = {
  button: Button,
  input: Input,
  form: Form,
  container: Container,
  // ... more mappings
}
```

### Component Implementation

Each component is a **thin wrapper** around Radix UI primitives with accessibility baked in:

```typescript
// packages/core/src/components/Button.tsx

import * as RadixButton from '@radix-ui/react-primitive'
import { forwardRef } from 'react'
import { cn } from '../utils'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: React.ReactNode
  onClick?: string  // Handler reference, not actual function
  'aria-label': string  // Required for accessibility
  [key: string]: any
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90':
              variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80':
              variant === 'secondary',
            'border border-input hover:bg-accent':
              variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground':
              variant === 'ghost',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
```

### Available Components

| Component | Radix Primitive | Purpose |
|-----------|----------------|---------|
| `button` | Button | Clickable buttons |
| `input` | Input | Text inputs |
| `checkbox` | Checkbox | Toggle checkboxes |
| `radio` | RadioGroup | Radio button groups |
| `select` | Select | Dropdown selects |
| `slider` | Slider | Range sliders |
| `switch` | Switch | Toggle switches |
| `textarea` | Textarea | Multi-line text |
| `form` | Form | Form containers |
| `dialog` | Dialog | Modal dialogs |
| `popover` | Popover | Popup menus |
| `tooltip` | Tooltip | Hover tooltips |
| `accordion` | Accordion | Collapsible sections |
| `tabs` | Tabs | Tabbed interfaces |
| `table` | Table | Data tables |
| `list` | - | Repeating lists |
| `container` | - | Layout containers |
| `heading` | - | Headings (h1-h6) |
| `text` | - | Text paragraphs |
| `image` | - | Images |
| `link` | - | Hyperlinks |

---

## Schema Validation

### Zod Schema Definition

All schemas are validated using Zod before rendering:

```typescript
// packages/core/src/validator.ts

import { z } from 'zod'

// Base schema that all components conform to
const PunkSchemaZod: z.ZodType<PunkSchema> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    id: z.string().optional(),
    props: z.record(z.any()).optional(),
    children: z.array(PunkSchemaZod).optional(),
    dataSource: z.string().optional(),
    itemTemplate: PunkSchemaZod.optional(),
    condition: z.string().optional(),
  })
)

export function validateSchema(schema: unknown): PunkSchema {
  try {
    return PunkSchemaZod.parse(schema)
  } catch (error) {
    throw new ValidationError('Invalid Punk schema', { cause: error })
  }
}

export function validateSchemaPartial(schema: unknown): boolean {
  return PunkSchemaZod.safeParse(schema).success
}
```

### Component-Specific Validation

Each component type has additional validation rules:

```typescript
// packages/core/src/validators/button.ts

import { z } from 'zod'

export const ButtonPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  disabled: z.boolean().default(false),
  onClick: z.string().optional(),
  children: z.union([z.string(), z.number()]),
  'aria-label': z.string().min(1), // Required!
})

export function validateButtonProps(props: unknown) {
  return ButtonPropsSchema.parse(props)
}
```

---

## Rendering Pipeline

### Render Flow

```
┌─────────────────┐
│  JSON Schema    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zod Validation  │ ← Ensures structural correctness
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PunkRenderer    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Component Lookup│ ← Maps type to React component
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Props Binding   │ ← Binds handlers, data, context
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ React Component │ ← Renders to DOM
└─────────────────┘
```

### PunkRenderer Implementation

```typescript
// packages/core/src/renderer.tsx

import React from 'react'
import { ComponentMap } from './components'
import { validateSchema } from './validator'
import { DataContext, useDataContext } from './context'
import { ActionBus, useActionBus } from './actions'

export interface PunkRendererProps {
  schema: PunkSchema
  handlers?: Record<string, Function>
  context?: Record<string, any>
  actionBus?: ActionBus
}

export function PunkRenderer({
  schema,
  handlers = {},
  context = {},
  actionBus,
}: PunkRendererProps) {
  // Validate schema
  const validated = validateSchema(schema)

  return (
    <DataContext.Provider value={context}>
      <ActionBus.Provider value={actionBus}>
        <PunkNode schema={validated} handlers={handlers} />
      </ActionBus.Provider>
    </DataContext.Provider>
  )
}

function PunkNode({
  schema,
  handlers,
  depth = 0,
}: {
  schema: PunkSchema
  handlers: Record<string, Function>
  depth?: number
}) {
  const context = useDataContext()
  const actionBus = useActionBus()

  // Lookup component
  const Component = ComponentMap[schema.type]

  if (!Component) {
    console.warn(`Unknown component type: ${schema.type}`)
    return null
  }

  // Process props
  const props = processProps(schema.props || {}, context, handlers, actionBus)

  // Handle conditional rendering
  if (schema.condition && !evaluateCondition(schema.condition, context)) {
    return null
  }

  // Handle list rendering with dataSource
  if (schema.dataSource && schema.itemTemplate) {
    const data = getDataFromContext(schema.dataSource, context)
    return (
      <>
        {data.map((item: any, index: number) => (
          <PunkNode
            key={item.id || index}
            schema={schema.itemTemplate!}
            handlers={handlers}
            depth={depth + 1}
          />
        ))}
      </>
    )
  }

  // Render children
  const children = schema.children?.map((child, index) => (
    <PunkNode
      key={child.id || index}
      schema={child}
      handlers={handlers}
      depth={depth + 1}
    />
  ))

  return <Component {...props}>{children}</Component>
}

function processProps(
  props: Record<string, any>,
  context: Record<string, any>,
  handlers: Record<string, Function>,
  actionBus?: ActionBus
): Record<string, any> {
  const processed: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // Handle event handlers (onClick, onSubmit, etc.)
    if (key.startsWith('on') && typeof value === 'string') {
      processed[key] = (...args: any[]) => {
        const handler = handlers[value]
        if (handler) {
          handler(...args)
        }
        // Also emit to action bus
        actionBus?.emit(value, ...args)
      }
    }
    // Handle template interpolation {{variable}}
    else if (typeof value === 'string' && value.includes('{{')) {
      processed[key] = interpolate(value, context)
    }
    // Pass through
    else {
      processed[key] = value
    }
  }

  return processed
}

function interpolate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
    return evaluateExpression(expr.trim(), context)
  })
}

function evaluateExpression(expr: string, context: Record<string, any>): any {
  // Safe expression evaluation
  // Only supports simple property access (no eval!)
  const parts = expr.split('.')
  let value = context

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return ''
    }
  }

  return value
}
```

---

## DataContext & ActionBus

### DataContext

**Purpose:** Provide reactive data to components

```typescript
// packages/core/src/context.ts

import { createContext, useContext } from 'react'

export const DataContext = createContext<Record<string, any>>({})

export function useDataContext() {
  return useContext(DataContext)
}

export function createDataContext(initialData: Record<string, any> = {}) {
  const [data, setData] = useState(initialData)

  const update = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const updateNested = (path: string, value: any) => {
    const parts = path.split('.')
    setData(prev => {
      const updated = { ...prev }
      let current = updated

      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] }
        current = current[parts[i]]
      }

      current[parts[parts.length - 1]] = value
      return updated
    })
  }

  return { data, update, updateNested }
}
```

### ActionBus

**Purpose:** Event-driven communication between components

```typescript
// packages/core/src/actions.ts

import { createContext, useContext } from 'react'

export class ActionBus {
  private listeners: Map<string, Set<Function>> = new Map()

  on(action: string, handler: Function) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set())
    }
    this.listeners.get(action)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(action)?.delete(handler)
    }
  }

  emit(action: string, ...args: any[]) {
    const handlers = this.listeners.get(action)
    if (handlers) {
      handlers.forEach(handler => handler(...args))
    }
  }

  off(action: string, handler: Function) {
    this.listeners.get(action)?.delete(handler)
  }

  clear() {
    this.listeners.clear()
  }
}

export const ActionBusContext = createContext<ActionBus | undefined>(undefined)

export function useActionBus() {
  return useContext(ActionBusContext)
}
```

---

## Backend Adapters

### Adapter Architecture

Backend adapters provide a **unified interface** for different backend options:

```typescript
// packages/adapters/src/types.ts

export interface BackendAdapter {
  name: string
  initialize(config: BackendConfig): Promise<void>
  generateEndpoint(spec: EndpointSpec): Promise<GeneratedCode>
  generateDatabase(schema: DatabaseSchema): Promise<GeneratedMigration>
  deploy(config: DeployConfig): Promise<DeployResult>
}

export interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  auth: boolean
  requestSchema?: z.ZodSchema
  responseSchema?: z.ZodSchema
  implementation: 'template' | 'custom'
  template?: string
  params?: Record<string, any>
}
```

### Encore.ts Adapter

```typescript
// packages/adapters/src/encore-ts/adapter.ts

export class EncoreTsAdapter implements BackendAdapter {
  name = 'encore-ts'

  async initialize(config: BackendConfig) {
    // Create Encore.ts project structure
    await createDirectory('backend')
    await writeFile('backend/encore.app', this.generateEncoreApp(config))
    await writeFile('backend/package.json', this.generatePackageJson())
  }

  async generateEndpoint(spec: EndpointSpec): Promise<GeneratedCode> {
    if (spec.implementation === 'template') {
      const template = await loadTemplate(spec.template!)
      return template.fill(spec.params)
    }

    // Generate from scratch
    return this.generateEncoreEndpoint(spec)
  }

  private generateEncoreEndpoint(spec: EndpointSpec): GeneratedCode {
    return {
      filename: `${spec.path.replace(/\//g, '-')}.ts`,
      code: `
import { api } from "encore.dev/api"
import { z } from "zod"

${spec.requestSchema ? `const RequestSchema = ${zodToString(spec.requestSchema)}` : ''}
${spec.responseSchema ? `const ResponseSchema = ${zodToString(spec.responseSchema)}` : ''}

export const ${camelCase(spec.path)} = api(
  { method: "${spec.method}", path: "${spec.path}", auth: ${spec.auth} },
  async (req: Request): Promise<Response> => {
    ${spec.requestSchema ? 'const validated = RequestSchema.parse(req)' : ''}

    // TODO: Implement logic

    return { success: true }
  }
)
      `
    }
  }
}
```

### Backend Comparison

| Adapter | Language | Type Safety | Infrastructure | Deployment |
|---------|----------|-------------|----------------|------------|
| **Encore.ts** | TypeScript | Full | Declarative | Encore Cloud |
| **Encore** | Go | Full | Declarative | Encore Cloud |
| **tRPC** | TypeScript | Full | Manual | Any |
| **GlyphCase** | SQLite | Queries | Local | Self-hosted |
| **Manifest** | YAML → TS | Full | Declarative | Any |

---

## AI Integration (Epoch)

### Epoch Engine Architecture

```
User Prompt
     ↓
┌─────────────────┐
│ Epoch Engine    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Context Builder │ ← Adds project context, constraints
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Claude API      │ ← Anthropic Claude Sonnet 4
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response Parser │ ← Extracts JSON schema
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zod Validator   │ ← Validates against PunkSchema
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Revision Store  │ ← Saves version
└─────────────────┘
```

### Implementation

```typescript
// packages/synthpunk/src/epoch.ts

import Anthropic from '@anthropic-ai/sdk'
import { validateSchema } from '@punk/core'
import { RevisionManager } from './revisions'

export class EpochEngine {
  private client: Anthropic
  private revisions: RevisionManager

  constructor(config: EpochConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    })
    this.revisions = new RevisionManager()
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    // Build prompt with context
    const prompt = this.buildPrompt(request)

    // Call Claude
    const response = await this.client.messages.create({
      model: request.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3, // Low temperature for consistency
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract schema from response
    const schema = this.extractSchema(response)

    // Validate
    const validated = validateSchema(schema)

    // Save revision
    const revision = await this.revisions.save({
      prompt: request.prompt,
      schema: validated,
      timestamp: new Date(),
    })

    return {
      schema: validated,
      revision,
      metadata: {
        model: request.model,
        tokensUsed: response.usage,
      },
    }
  }

  private buildPrompt(request: GenerationRequest): string {
    return `You are an expert at generating Punk schemas - validated JSON that renders to accessible React UIs.

USER REQUEST:
${request.prompt}

CONTEXT:
${request.context.map(c => `- ${c}`).join('\n')}

CONSTRAINTS:
- Maximum ${request.constraints?.maxNodeCount || 100} nodes
- Required components: ${request.constraints?.requiredComponents?.join(', ') || 'any'}
- Accessibility: WCAG 2.1 AA required

SCHEMA FORMAT:
{
  "type": "component-name",
  "id": "unique-id",
  "props": {
    "propName": "value",
    "aria-label": "Required for interactive elements"
  },
  "children": [...]
}

AVAILABLE COMPONENTS:
button, input, form, checkbox, select, slider, switch, textarea, dialog, popover, tooltip, accordion, tabs, table, list, container, heading, text, image, link

RULES:
1. Every interactive element MUST have an aria-label
2. Forms MUST have onSubmit handlers
3. Buttons MUST have onClick handlers (unless type="submit")
4. All handlers are STRING references (e.g., "handleClick", not functions)
5. Use semantic types (e.g., type="email" for email inputs)
6. Return ONLY valid JSON, no explanation

Generate the schema now:`
  }

  private extractSchema(response: Anthropic.Message): unknown {
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Expected text response from Claude')
    }

    // Extract JSON from markdown code blocks if present
    const text = content.text
    const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/) ||
                     text.match(/```\n([\s\S]+?)\n```/)

    const json = jsonMatch ? jsonMatch[1] : text

    return JSON.parse(json.trim())
  }
}
```

---

## CLI Architecture

### Technology Stack

- **Language:** Go 1.21+
- **TUI Framework:** Bubble Tea
- **Styling:** Lip Gloss
- **Components:** Bubbles, Huh
- **Build:** Single binary

### Project Structure

```
tools/cli/
├── main.go                   # Entry point
├── cmd/                      # Commands
│   ├── create.go
│   ├── dev.go
│   ├── add.go
│   ├── upgrade.go
│   ├── theme.go
│   └── skills.go
├── ui/                       # UI components
│   ├── banner.go
│   ├── picker.go
│   ├── progress.go
│   └── themes.go
├── composer/                 # Template composition
│   ├── composer.go
│   ├── template.go
│   └── merger.go
└── skills/                   # Skill management
    ├── manager.go
    ├── installer.go
    └── registry.go
```

### Template Composition

The CLI uses a **modular template system** that composes projects from layers:

```
base/               ← Common to all projects
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts

layers/
├── punk/           ← Tier 1
│   ├── src/App.tsx
│   └── src/lib/punk.ts
├── synthpunk/      ← Tier 2 (includes punk)
│   ├── src/lib/epoch.ts
│   └── examples/generation.ts
└── atompunk/       ← Tier 3 (includes synthpunk)
    ├── src/lib/backend.ts
    └── templates/

backends/
├── encore-ts/
├── encore/
├── trpc/
├── glyphcase/
└── manifest/

skills/              ← GlyphCase files
├── shadcn-components.gcasex
├── supabase-backend.gcasex
└── ...
```

---

## Web Builder Architecture

### Frontend Stack

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Routing:** TanStack Router
- **Forms:** React Hook Form + Zod

### Backend Stack

- **Framework:** Encore.ts
- **Database:** PostgreSQL (Neon)
- **Auth:** Encore Auth
- **Storage:** S3-compatible

### Component Architecture

```
apps/atompunk-web/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── CodePanel.tsx
│   │   │   └── RevisionPanel.tsx
│   │   ├── stores/
│   │   │   ├── project.ts
│   │   │   ├── chat.ts
│   │   │   └── preview.ts
│   │   └── lib/
│   │       ├── epoch.ts
│   │       └── api.ts
│   └── package.json
└── backend/
    ├── services/
    │   ├── generation.ts
    │   ├── projects.ts
    │   ├── deployments.ts
    │   └── auth.ts
    └── encore.app
```

---

## Skill System

Skills are **portable plugins** packaged as GlyphCase (.gcasex) files containing:
- TCMR scripts (sandboxed JavaScript)
- Knowledge base (JSON)
- Templates
- Dependencies

See [SKILLS_GUIDE.md](SKILLS_GUIDE.md) for complete documentation.

---

## Security Model

### Frontend Security

1. **No eval():** Template expressions use safe property access only
2. **Handler allowlist:** Only predefined handlers can be called
3. **Schema validation:** All schemas validated before rendering
4. **XSS prevention:** All user content escaped
5. **CSP headers:** Content Security Policy enforced

### Backend Security

1. **Template-based:** No arbitrary code generation
2. **Input validation:** All inputs validated with Zod
3. **SQL injection prevention:** ORM-only database access
4. **CSRF protection:** Built into templates
5. **Rate limiting:** Automatic rate limiting on endpoints
6. **Auth required:** Authentication enforced by default

### Skill Security

1. **Sandboxed execution:** TCMR scripts run in isolated context
2. **Permission system:** Skills declare required permissions
3. **Checksum verification:** .gcasex files verified before installation
4. **Code review:** Community skills reviewed before marketplace listing

---

## Performance Considerations

### Frontend Performance

- **Code splitting:** Dynamic imports for components
- **Tree shaking:** Unused components removed
- **Bundle optimization:** Vite build optimization
- **React optimization:** memo, useMemo, useCallback where needed

### Rendering Performance

- **Virtual scrolling:** Lists use virtual scrolling
- **Lazy loading:** Components loaded on demand
- **Memoization:** Schema rendering memoized
- **Batched updates:** State updates batched

### Backend Performance

- **Connection pooling:** Database connection pooling
- **Query optimization:** Indexed queries
- **Caching:** Response caching where appropriate
- **CDN:** Static assets served from CDN

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│            CDN (Cloudflare)             │
│          Static Assets + Cache          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│         Frontend (Vercel/Netlify)       │
│              React SPA                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│         Backend (Encore Cloud)          │
│          API Services + Auth            │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│       Database (Neon PostgreSQL)        │
│          Persistent Storage             │
└─────────────────────────────────────────┘
```

---

For more details, see:
- [Component Reference](COMPONENT_REFERENCE.md)
- [Backend Guide](BACKEND_GUIDE.md)
- [Skills Guide](SKILLS_GUIDE.md)
