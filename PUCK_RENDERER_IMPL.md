# Puck Renderer Implementation Guide

**Version:** 1.0.0
**Last Updated:** November 19, 2025
**Status:** Complete Technical Reference
**Purpose:** Core rendering engine for deterministic, accessible UI generation from schemas

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Rendering Algorithm](#rendering-algorithm)
4. [Node Resolution](#node-resolution)
5. [Context Injection](#context-injection)
6. [Error Handling](#error-handling)
7. [Performance Optimizations](#performance-optimizations)
8. [Complete Implementation Examples](#complete-implementation-examples)

---

## Overview

The **PunkRenderer** is the core execution engine that transforms JSON schemas into accessible React components. It operates on a simple principle:

```
Schema JSON → Validation → Node Resolution → Context Injection → React Elements
```

### Key Characteristics

- **Deterministic:** Same schema always produces identical output
- **Validated:** All inputs validated before rendering
- **Type-Safe:** Full TypeScript coverage
- **Accessible:** WCAG 2.1 AA compliance guaranteed
- **Fast:** Optimized rendering with memoization
- **Extensible:** Plugin architecture via component registration

### Design Principles

1. **Schema-First:** UI defined as data, not code
2. **No Code Execution:** Safe template expressions only
3. **Component Registry:** Centralized component mapping
4. **Layered Context:** DataContext and ActionBus for state management
5. **Progressive Enhancement:** Handlers and data injected at render time

---

## Architecture

### System Components

```typescript
┌─────────────────────────────────────────────────────┐
│                   PunkRenderer                      │
│  Entry point for schema rendering                   │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌─────────┐   ┌──────────────┐
    │ Validate│   │ComponentMap  │
    │ Schema  │   │Registry      │
    └────┬────┘   └──────┬───────┘
         │                │
         └────────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │  PunkNode       │
         │  Recursive      │
         │  Renderer       │
         └────────┬────────┘
                  │
         ┌────────┴──────────┐
         │                   │
         ▼                   ▼
    ┌──────────┐       ┌──────────────┐
    │DataContext       │ActionBus     │
    │Provider │        │Provider      │
    └──────────┘       └──────────────┘
         │                   │
         └────────┬──────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  React Element  │
         │  With Handlers  │
         └─────────────────┘
```

### Component Registry

The **ComponentMap** is the central registry that maps schema types to React components:

```typescript
// packages/core/src/components/index.ts

import * as React from 'react'

// Foundation components
import { Container } from './Container'
import { Heading } from './Heading'
import { Text } from './Text'
import { Icon } from './Icon'
import { Divider } from './Divider'

// Layout components
import { Row } from './Row'
import { Col } from './Col'
import { Spacer } from './Spacer'

// Form components
import { Form } from './Form'
import { Input } from './Input'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Radio } from './Radio'
import { Select } from './Select'
import { Textarea } from './Textarea'

// Interactive components
import { Dialog } from './Dialog'
import { Popover } from './Popover'
import { Tooltip } from './Tooltip'
import { Accordion } from './Accordion'
import { Tabs } from './Tabs'

// Data display
import { Table } from './Table'
import { List } from './List'

/**
 * Central component registry
 * Maps schema type strings to React component classes
 *
 * All components:
 * - Accept PunkComponentProps
 * - Provide accessibility attributes
 * - Support data binding and event handlers
 */
export const ComponentMap: Record<string, React.ComponentType<any>> = {
  // Foundation
  'container': Container,
  'heading': Heading,
  'text': Text,
  'icon': Icon,
  'divider': Divider,

  // Layout
  'row': Row,
  'col': Col,
  'spacer': Spacer,

  // Forms
  'form': Form,
  'input': Input,
  'button': Button,
  'checkbox': Checkbox,
  'radio': Radio,
  'select': Select,
  'textarea': Textarea,

  // Interactive
  'dialog': Dialog,
  'popover': Popover,
  'tooltip': Tooltip,
  'accordion': Accordion,
  'tabs': Tabs,

  // Data
  'table': Table,
  'list': List,
}

/**
 * Register a custom component
 * Allows third-party component registration
 */
export function registerComponent(
  type: string,
  component: React.ComponentType<any>
): void {
  ComponentMap[type] = component
}

/**
 * Unregister a component
 */
export function unregisterComponent(type: string): void {
  delete ComponentMap[type]
}

/**
 * Check if component type is registered
 */
export function hasComponent(type: string): boolean {
  return type in ComponentMap
}

/**
 * Get all registered component types
 */
export function getRegisteredComponents(): string[] {
  return Object.keys(ComponentMap).sort()
}
```

### Context Providers

Two context providers manage state and events:

```typescript
// packages/core/src/context.ts

import { createContext, useContext, ReactNode } from 'react'

/**
 * DataContext provides reactive data to components
 * Allows template interpolation: {{user.name}}
 * Supports nested property access
 */
export interface DataContextValue {
  [key: string]: any
}

export const DataContext = createContext<DataContextValue>({})

export function useDataContext(): DataContextValue {
  return useContext(DataContext)
}

/**
 * ActionBus provides event-driven communication
 * Components emit events: actionBus.emit('handleSubmit', data)
 * Handlers subscribe: actionBus.on('handleSubmit', handler)
 */
export class ActionBus {
  private listeners: Map<string, Set<Function>> = new Map()
  private history: Array<{ action: string; timestamp: number; args: any[] }> = []
  private maxHistorySize = 100

  /**
   * Subscribe to an action
   * @param action - Action name (e.g., "handleClick")
   * @param handler - Callback function
   * @returns Unsubscribe function
   */
  on(action: string, handler: Function): () => void {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set())
    }
    this.listeners.get(action)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.listeners.get(action)?.delete(handler)
    }
  }

  /**
   * Emit an action to all subscribers
   * @param action - Action name
   * @param args - Arguments to pass to handlers
   */
  emit(action: string, ...args: any[]): void {
    // Record in history
    this.history.push({
      action,
      timestamp: Date.now(),
      args,
    })

    // Keep history size bounded
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    }

    // Call all listeners
    const handlers = this.listeners.get(action)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in ${action} handler:`, error)
        }
      })
    }
  }

  /**
   * Unsubscribe from an action
   */
  off(action: string, handler: Function): void {
    this.listeners.get(action)?.delete(handler)
  }

  /**
   * Check if action has listeners
   */
  hasListeners(action: string): boolean {
    return (this.listeners.get(action)?.size ?? 0) > 0
  }

  /**
   * Get all action names with listeners
   */
  getActions(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear()
  }

  /**
   * Get action history for debugging
   */
  getHistory(limit: number = 10): typeof this.history {
    return this.history.slice(-limit)
  }
}

export const ActionBusContext = createContext<ActionBus | undefined>(undefined)

export function useActionBus(): ActionBus | undefined {
  return useContext(ActionBusContext)
}
```

---

## Rendering Algorithm

### Overview

The rendering algorithm has five main steps:

1. **Validate Schema** - Ensure schema structure and types
2. **Resolve Node Type** - Look up component in registry
3. **Process Props** - Bind data and handlers
4. **Inject Context** - Provide DataContext and ActionBus
5. **Recursively Render** - Render children

### Complete Implementation

```typescript
// packages/core/src/renderer.tsx

import React, { memo, useMemo } from 'react'
import { z } from 'zod'
import { ComponentMap } from './components'
import { validateSchema, PunkSchema } from './schemas'
import { DataContext, ActionBus, ActionBusContext, useDataContext, useActionBus } from './context'
import { interpolate, evaluateCondition } from './utils'

/**
 * Type definition for Punk schema
 */
export interface PunkSchema {
  type: string
  id?: string
  key?: string
  testId?: string
  className?: string
  style?: Record<string, string | number>
  props?: Record<string, any>
  children?: PunkSchema[]
  dataSource?: string
  itemTemplate?: PunkSchema
  condition?: string
}

/**
 * Props for the PunkRenderer component
 */
export interface PunkRendererProps {
  schema: PunkSchema | PunkSchema[]
  data?: Record<string, any>
  handlers?: Record<string, (...args: any[]) => void>
  actionBus?: ActionBus
  onError?: (error: PunkRenderError) => void
  errorBoundary?: boolean
}

/**
 * Custom error type for render errors
 */
export class PunkRenderError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'PunkRenderError'
  }
}

/**
 * Main PunkRenderer component
 *
 * Entry point for rendering schemas
 * Provides DataContext and ActionBus to all children
 */
export function PunkRenderer({
  schema,
  data = {},
  handlers = {},
  actionBus = new ActionBus(),
  onError,
  errorBoundary = true,
}: PunkRendererProps) {
  // Validate schema structure
  let validated: PunkSchema | PunkSchema[]
  try {
    validated = Array.isArray(schema)
      ? schema.map((s) => validateSchema(s))
      : validateSchema(schema)
  } catch (error) {
    const renderError = new PunkRenderError(
      'INVALID_SCHEMA',
      `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    )
    onError?.(renderError)
    if (errorBoundary) {
      return <PunkErrorBoundary error={renderError} />
    }
    throw renderError
  }

  // Register handlers with action bus
  Object.entries(handlers).forEach(([name, handler]) => {
    actionBus.on(name, handler)
  })

  const element = (
    <DataContext.Provider value={data}>
      <ActionBusContext.Provider value={actionBus}>
        {Array.isArray(validated) ? (
          <>
            {validated.map((schema, index) => (
              <PunkNode
                key={schema.id || schema.key || index}
                schema={schema}
                handlers={handlers}
              />
            ))}
          </>
        ) : (
          <PunkNode schema={validated} handlers={handlers} />
        )}
      </ActionBusContext.Provider>
    </DataContext.Provider>
  )

  if (errorBoundary) {
    return <PunkErrorBoundary>{element}</PunkErrorBoundary>
  }

  return element
}

/**
 * Recursive node renderer
 *
 * Handles:
 * - Component lookup
 * - Conditional rendering
 * - List rendering with dataSource
 * - Child recursion
 */
interface PunkNodeProps {
  schema: PunkSchema
  handlers: Record<string, Function>
  depth?: number
}

const PunkNode = memo(function PunkNode({
  schema,
  handlers,
  depth = 0,
}: PunkNodeProps) {
  // Prevent excessive nesting depth (security)
  if (depth > 100) {
    console.warn(`Maximum nesting depth exceeded at node ${schema.id}`)
    return null
  }

  const context = useDataContext()
  const actionBus = useActionBus()

  // Step 2: Resolve node type
  const Component = ComponentMap[schema.type]

  if (!Component) {
    console.warn(`Unknown component type: ${schema.type}`)
    return <PunkUnknownComponent type={schema.type} />
  }

  // Step 3: Process props
  const props = useMemo(
    () => processProps(schema.props || {}, context, handlers, actionBus),
    [schema.props, context, handlers, actionBus]
  )

  // Handle conditional rendering
  if (schema.condition && !evaluateCondition(schema.condition, context)) {
    return null
  }

  // Handle list rendering with dataSource
  if (schema.dataSource && schema.itemTemplate) {
    return (
      <PunkListRenderer
        dataSource={schema.dataSource}
        itemTemplate={schema.itemTemplate}
        context={context}
        handlers={handlers}
        depth={depth}
      />
    )
  }

  // Render children
  const children = schema.children?.map((child, index) => (
    <PunkNode
      key={child.id || child.key || `child-${index}`}
      schema={child}
      handlers={handlers}
      depth={depth + 1}
    />
  ))

  return (
    <Component
      key={schema.id || schema.key}
      data-testid={schema.testId}
      className={schema.className}
      style={schema.style}
      {...props}
    >
      {children}
    </Component>
  )
})

/**
 * Process props for a component
 *
 * Handles:
 * - Event handler binding (onClick: "handleClick")
 * - Data interpolation ({{user.name}})
 * - Token resolution
 * - Default values
 */
function processProps(
  rawProps: Record<string, any>,
  context: Record<string, any>,
  handlers: Record<string, Function>,
  actionBus?: ActionBus
): Record<string, any> {
  const processed: Record<string, any> = {}

  for (const [key, value] of Object.entries(rawProps)) {
    // Skip internal props
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue
    }

    // Handle event handlers (onClick, onSubmit, etc.)
    if (key.startsWith('on') && typeof value === 'string') {
      processed[key] = (...args: any[]) => {
        // First call registered handler
        const handler = handlers[value]
        if (handler) {
          try {
            handler(...args)
          } catch (error) {
            console.error(`Error in handler ${value}:`, error)
          }
        }

        // Then emit to action bus
        actionBus?.emit(value, ...args)
      }
    }
    // Handle template interpolation {{variable}}
    else if (typeof value === 'string' && value.includes('{{')) {
      processed[key] = interpolate(value, context)
    }
    // Handle data path references for binding
    else if (key === 'value' && typeof value === 'string' && !value.includes('{{')) {
      // Check if this looks like a data path
      if (isDataPath(value)) {
        processed[key] = getValueFromPath(value, context)
      } else {
        processed[key] = value
      }
    }
    // Pass through other values
    else {
      processed[key] = value
    }
  }

  return processed
}

/**
 * List renderer for dataSource binding
 */
function PunkListRenderer({
  dataSource,
  itemTemplate,
  context,
  handlers,
  depth,
}: {
  dataSource: string
  itemTemplate: PunkSchema
  context: Record<string, any>
  handlers: Record<string, Function>
  depth: number
}) {
  const data = getValueFromPath(dataSource, context) || []

  if (!Array.isArray(data)) {
    console.warn(`Data source ${dataSource} is not an array`, data)
    return null
  }

  return (
    <>
      {data.map((item, index) => (
        <PunkNode
          key={item.id || index}
          schema={itemTemplate}
          handlers={handlers}
          depth={depth + 1}
        />
      ))}
    </>
  )
}

/**
 * Unknown component placeholder
 */
function PunkUnknownComponent({ type }: { type: string }) {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '4px',
        color: '#991b1b',
        fontSize: '14px',
      }}
      role="alert"
    >
      Unknown component type: <code>{type}</code>
    </div>
  )
}

/**
 * Error boundary for render errors
 */
interface PunkErrorBoundaryProps {
  children?: React.ReactNode
  error?: PunkRenderError
}

interface PunkErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class PunkErrorBoundary extends React.Component<
  PunkErrorBoundaryProps,
  PunkErrorBoundaryState
> {
  constructor(props: PunkErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: !!props.error,
      error: props.error || null,
    }
  }

  static getDerivedStateFromError(error: Error): PunkErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#7f1d1d',
          }}
          role="alert"
        >
          <h2 style={{ margin: '0 0 8px 0' }}>Rendering Error</h2>
          <pre
            style={{
              margin: '0',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## Node Resolution

### Component Lookup Process

```typescript
// packages/core/src/resolver.ts

import { ComponentMap } from './components'
import { PunkSchema } from './schemas'

/**
 * Resolution result
 */
export interface ResolvedNode {
  component: React.ComponentType<any>
  type: string
  schema: PunkSchema
}

/**
 * Resolver class for component lookup with caching
 */
export class ComponentResolver {
  private cache: Map<string, React.ComponentType<any>> = new Map()
  private lazyComponents: Map<string, () => Promise<React.ComponentType<any>>> = new Map()

  /**
   * Register a component
   */
  register(type: string, component: React.ComponentType<any>): void {
    this.cache.delete(type) // Clear cache
    ComponentMap[type] = component
  }

  /**
   * Register a lazy-loaded component
   */
  registerLazy(
    type: string,
    loader: () => Promise<React.ComponentType<any>>
  ): void {
    this.lazyComponents.set(type, loader)
  }

  /**
   * Resolve a component type to actual React component
   *
   * Returns cached component if available
   * Falls back to ComponentMap
   * Returns error component if not found
   */
  resolve(type: string): React.ComponentType<any> {
    // Check cache first
    if (this.cache.has(type)) {
      return this.cache.get(type)!
    }

    // Check global component map
    if (type in ComponentMap) {
      const component = ComponentMap[type]
      this.cache.set(type, component)
      return component
    }

    // Check lazy loaded components
    if (this.lazyComponents.has(type)) {
      // Return placeholder that will load dynamically
      return LazyComponentWrapper(type, this.lazyComponents.get(type)!)
    }

    // Return unknown component placeholder
    return UnknownComponent
  }

  /**
   * Check if component exists
   */
  has(type: string): boolean {
    return type in ComponentMap || this.lazyComponents.has(type)
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

/**
 * Lazy component wrapper
 * Loads component asynchronously and renders once loaded
 */
function LazyComponentWrapper(
  type: string,
  loader: () => Promise<React.ComponentType<any>>
): React.ComponentType<any> {
  const LazyComponent = React.lazy(loader)

  return function LazyWrapper(props: any) {
    return (
      <React.Suspense fallback={<LoadingPlaceholder type={type} />}>
        <LazyComponent {...props} />
      </React.Suspense>
    )
  }
}

/**
 * Loading placeholder for lazy components
 */
function LoadingPlaceholder({ type }: { type: string }) {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#f3f4f6',
        border: '1px dashed #d1d5db',
        borderRadius: '4px',
        color: '#4b5563',
        fontSize: '14px',
      }}
    >
      Loading component: {type}...
    </div>
  )
}

/**
 * Unknown component placeholder
 */
function UnknownComponent({ type = 'unknown' }: { type?: string }) {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '4px',
        color: '#991b1b',
        fontSize: '14px',
      }}
      role="alert"
    >
      Unknown component type: <code>{type}</code>
    </div>
  )
}

// Global resolver instance
export const defaultResolver = new ComponentResolver()
```

### Registration System

```typescript
// packages/core/src/plugins.ts

import { ComponentResolver } from './resolver'
import { PunkSchema } from './schemas'

/**
 * Plugin interface for extending Punk
 */
export interface PunkPlugin {
  name: string
  version: string
  initialize(options: PluginInitOptions): void | Promise<void>
}

export interface PluginInitOptions {
  resolver: ComponentResolver
  registerComponent: (type: string, component: React.ComponentType<any>) => void
  registerLazy: (type: string, loader: () => Promise<React.ComponentType<any>>) => void
}

/**
 * Plugin manager
 */
export class PluginManager {
  private plugins: Map<string, PunkPlugin> = new Map()

  /**
   * Register a plugin
   */
  async registerPlugin(
    plugin: PunkPlugin,
    resolver: ComponentResolver
  ): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`)
      return
    }

    await plugin.initialize({
      resolver,
      registerComponent: (type, component) => resolver.register(type, component),
      registerLazy: (type, loader) => resolver.registerLazy(type, loader),
    })

    this.plugins.set(plugin.name, plugin)
    console.log(`Plugin ${plugin.name}@${plugin.version} registered`)
  }

  /**
   * Get registered plugins
   */
  getPlugins(): Map<string, PunkPlugin> {
    return new Map(this.plugins)
  }
}

// Example custom component plugin
export const CustomComponentPlugin: PunkPlugin = {
  name: 'custom-components',
  version: '1.0.0',
  initialize({ registerComponent }) {
    // Register custom components here
    registerComponent('custom-card', CustomCard)
    registerComponent('custom-hero', CustomHero)
  },
}
```

---

## Context Injection

### DataContext Usage

```typescript
// Example: Interpolating data in templates

interface UserData {
  profile: {
    name: string
    email: string
    avatar: string
  }
  preferences: {
    theme: 'light' | 'dark'
  }
}

const data: UserData = {
  profile: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://example.com/alice.jpg',
  },
  preferences: {
    theme: 'dark',
  },
}

// Schema with data binding
const schema: PunkSchema = {
  type: 'container',
  children: [
    {
      type: 'heading',
      props: {
        level: 1,
        children: 'Welcome, {{profile.name}}!',
      },
    },
    {
      type: 'text',
      props: {
        children: 'Email: {{profile.email}}',
      },
    },
    {
      type: 'image',
      props: {
        src: '{{profile.avatar}}',
        alt: 'Profile picture for {{profile.name}}',
      },
    },
  ],
}

// Render
<PunkRenderer schema={schema} data={data} />
```

### ActionBus Event Handling

```typescript
// packages/core/src/examples/event-handling.tsx

import { PunkRenderer, ActionBus } from '@punk/core'

// Create action bus
const actionBus = new ActionBus()

// Define handlers
const handlers = {
  handleSubmit: (formData: Record<string, any>) => {
    console.log('Form submitted:', formData)
    // Handle submission logic
  },
  handleClick: (event: React.MouseEvent) => {
    console.log('Button clicked:', event)
  },
  handleNavigation: (path: string) => {
    window.location.href = path
  },
}

// Schema with event handlers
const schema = {
  type: 'form',
  props: {
    onSubmit: 'handleSubmit',
    'aria-label': 'Login form',
  },
  children: [
    {
      type: 'input',
      props: {
        name: 'email',
        inputType: 'email',
        placeholder: 'your@email.com',
        'aria-label': 'Email address',
      },
    },
    {
      type: 'input',
      props: {
        name: 'password',
        inputType: 'password',
        placeholder: 'Password',
        'aria-label': 'Password',
      },
    },
    {
      type: 'button',
      props: {
        type: 'submit',
        onClick: 'handleSubmit',
        children: 'Sign In',
        'aria-label': 'Sign in to your account',
      },
    },
  ],
}

// Listen for events
actionBus.on('handleSubmit', (data) => {
  console.log('Action bus received submission:', data)
})

// Render with handlers
export function LoginForm() {
  return (
    <PunkRenderer
      schema={schema}
      handlers={handlers}
      actionBus={actionBus}
    />
  )
}
```

### Props Merging Strategy

```typescript
// packages/core/src/utils/props.ts

import { PunkSchema } from '../schemas'

/**
 * Props merging strategy
 *
 * Order of precedence (highest to lowest):
 * 1. Injected handlers (onClick, onChange, etc.)
 * 2. Interpolated values ({{data}})
 * 3. Static props
 * 4. Component defaults
 */
export interface PropsMergingOptions {
  preserveExisting?: boolean
  allowOverride?: boolean
  sanitize?: boolean
}

export function mergeProps(
  baseProps: Record<string, any>,
  injectedProps: Record<string, any>,
  options: PropsMergingOptions = {}
): Record<string, any> {
  const {
    preserveExisting = false,
    allowOverride = true,
    sanitize = true,
  } = options

  const merged = { ...baseProps }

  for (const [key, value] of Object.entries(injectedProps)) {
    if (key === 'children' || key === 'key' || key === 'ref') {
      continue
    }

    // Event handlers always override
    if (key.startsWith('on')) {
      if (allowOverride || !merged[key]) {
        merged[key] = value
      }
    }
    // Data values can be overridden unless preserveExisting
    else if (!preserveExisting || !merged[key]) {
      merged[key] = sanitize ? sanitizeValue(value) : value
    }
  }

  return merged
}

/**
 * Sanitize prop values to prevent XSS
 */
export function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(sanitizeValue)
    }
    return Object.entries(value).reduce(
      (acc, [k, v]) => ({
        ...acc,
        [k]: sanitizeValue(v),
      }),
      {}
    )
  }

  return value
}
```

---

## Error Handling

### Error Types and Recovery

```typescript
// packages/core/src/errors.ts

/**
 * Punk-specific error types
 */
export enum ErrorCode {
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  UNKNOWN_COMPONENT = 'UNKNOWN_COMPONENT',
  INVALID_PROPS = 'INVALID_PROPS',
  INVALID_DATA_PATH = 'INVALID_DATA_PATH',
  HANDLER_NOT_FOUND = 'HANDLER_NOT_FOUND',
  RENDER_ERROR = 'RENDER_ERROR',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',
}

/**
 * Base error class
 */
export class PunkError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'PunkError'
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
    }
  }
}

/**
 * Schema validation error
 */
export class SchemaValidationError extends PunkError {
  constructor(
    message: string,
    public details: z.ZodError['errors'],
    context?: Record<string, any>
  ) {
    super(ErrorCode.INVALID_SCHEMA, message, context)
    this.name = 'SchemaValidationError'
  }
}

/**
 * Component resolution error
 */
export class ComponentNotFoundError extends PunkError {
  constructor(type: string, context?: Record<string, any>) {
    super(
      ErrorCode.UNKNOWN_COMPONENT,
      `Component type "${type}" not found in registry`,
      context
    )
    this.name = 'ComponentNotFoundError'
  }
}

/**
 * Props validation error
 */
export class PropsValidationError extends PunkError {
  constructor(
    type: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.INVALID_PROPS,
      `Props validation failed for "${type}": ${message}`,
      context
    )
    this.name = 'PropsValidationError'
  }
}

/**
 * Data path resolution error
 */
export class DataPathError extends PunkError {
  constructor(
    path: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.INVALID_DATA_PATH,
      `Failed to resolve data path "${path}": ${message}`,
      context
    )
    this.name = 'DataPathError'
  }
}

/**
 * Handler not found error
 */
export class HandlerNotFoundError extends PunkError {
  constructor(
    handlerName: string,
    context?: Record<string, any>
  ) {
    super(
      ErrorCode.HANDLER_NOT_FOUND,
      `Handler "${handlerName}" not registered. Available handlers: ${context?.available?.join(', ') || 'none'}`,
      context
    )
    this.name = 'HandlerNotFoundError'
  }
}
```

### Error Handling Patterns

```typescript
// packages/core/src/errorHandling.ts

import { PunkRenderError } from './renderer'
import { PunkError, ErrorCode } from './errors'

/**
 * Error handler type
 */
export type ErrorHandler = (error: PunkError) => void | Promise<void>

/**
 * Error recovery strategy
 */
export enum RecoveryStrategy {
  THROW = 'throw', // Re-throw the error
  RENDER_ERROR = 'renderError', // Render error boundary
  FALLBACK = 'fallback', // Render fallback component
  IGNORE = 'ignore', // Log and ignore
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  strategy: RecoveryStrategy
  fallbackComponent?: React.ComponentType<{ error: PunkError }>
  onError?: ErrorHandler
  logErrors?: boolean
}

/**
 * Handle different error types
 */
export async function handleRenderError(
  error: unknown,
  config: ErrorHandlingConfig
): Promise<void> {
  let punkError: PunkError

  if (error instanceof PunkError) {
    punkError = error
  } else if (error instanceof Error) {
    punkError = new PunkError(
      ErrorCode.RENDER_ERROR,
      error.message,
      { originalError: error }
    )
  } else {
    punkError = new PunkError(
      ErrorCode.RENDER_ERROR,
      String(error)
    )
  }

  // Log if configured
  if (config.logErrors) {
    logError(punkError)
  }

  // Call custom handler
  if (config.onError) {
    await config.onError(punkError)
  }

  // Apply recovery strategy
  switch (config.strategy) {
    case RecoveryStrategy.THROW:
      throw punkError
    case RecoveryStrategy.RENDER_ERROR:
      // Handled by error boundary
      break
    case RecoveryStrategy.FALLBACK:
      // Return fallback component
      break
    case RecoveryStrategy.IGNORE:
      // Do nothing
      break
  }
}

/**
 * Log error with context
 */
export function logError(error: PunkError): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    context: error.context,
    stack: error.stack,
  }

  console.error('Punk Render Error:', errorLog)

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorTracking(errorLog)
  }
}

/**
 * Validate handler before calling
 */
export function validateHandler(
  handlerName: string,
  handlers: Record<string, Function>,
  throwOnMissing = false
): boolean {
  const exists = handlerName in handlers

  if (!exists && throwOnMissing) {
    throw new HandlerNotFoundError(handlerName, {
      available: Object.keys(handlers),
    })
  }

  return exists
}

/**
 * Validate data path before accessing
 */
export function validateDataPath(
  path: string,
  data: Record<string, any>
): boolean {
  try {
    const parts = path.split('.')
    let current = data

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
```

---

## Performance Optimizations

### Memoization Strategy

```typescript
// packages/core/src/optimizations/memoization.ts

import { memo, useMemo, useCallback } from 'react'
import { PunkSchema } from '../schemas'

/**
 * Memoized component wrapper
 * Prevents unnecessary re-renders when props haven't changed
 */
export function createMemoComponent<P extends object>(
  Component: React.ComponentType<P>,
  isEqual?: (prevProps: P, nextProps: P) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  return memo(Component, isEqual)
}

/**
 * Memoized schema processor
 * Caches processed props to prevent recalculation
 */
export function useMemoizedProps(
  schema: PunkSchema,
  context: Record<string, any>,
  handlers: Record<string, Function>
): Record<string, any> {
  return useMemo(() => {
    return processProps(schema.props || {}, context, handlers)
  }, [schema.props, context, handlers])
}

/**
 * Memoized handler binding
 * Creates stable callback references
 */
export function useMemoizedHandler(
  handlerName: string,
  handler: Function | undefined
): (...args: any[]) => void {
  return useCallback(
    (...args: any[]) => {
      if (handler) {
        handler(...args)
      }
    },
    [handler]
  )
}

/**
 * Schema equality check
 * Used for determining if schema has changed
 */
export function schemasEqual(
  schema1: PunkSchema,
  schema2: PunkSchema
): boolean {
  return (
    schema1.type === schema2.type &&
    schema1.id === schema2.id &&
    JSON.stringify(schema1.props) === JSON.stringify(schema2.props) &&
    JSON.stringify(schema1.children) === JSON.stringify(schema2.children)
  )
}
```

### Virtual Scrolling for Lists

```typescript
// packages/core/src/optimizations/virtualScrolling.ts

import React, { useRef, useEffect, useState } from 'react'

/**
 * Virtual scrolling for large lists
 * Only renders visible items
 */
export interface VirtualListProps {
  items: any[]
  itemHeight: number
  renderItem: (item: any, index: number) => React.ReactNode
  containerHeight: number
  overscan?: number
}

export function VirtualList({
  items,
  itemHeight,
  renderItem,
  containerHeight,
  overscan = 3,
}: VirtualListProps) {
  const [scrollOffset, setScrollOffset] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement
      setScrollOffset(target.scrollTop)
    }

    ref.current?.addEventListener('scroll', handleScroll)
    return () => ref.current?.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate visible range
  const startIndex = Math.floor(scrollOffset / itemHeight) - overscan
  const endIndex = Math.ceil((scrollOffset + containerHeight) / itemHeight) + overscan
  const visibleItems = items.slice(
    Math.max(0, startIndex),
    Math.min(items.length, endIndex)
  )

  return (
    <div
      ref={ref}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: items.length * itemHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map((item, i) => (
          <div
            key={Math.max(0, startIndex) + i}
            style={{
              position: 'absolute',
              top: (Math.max(0, startIndex) + i) * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, Math.max(0, startIndex) + i)}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Code Splitting and Lazy Loading

```typescript
// packages/core/src/optimizations/codesplitting.ts

import { lazy, Suspense } from 'react'

/**
 * Lazy load components by type
 */
export function createLazyComponentLoader() {
  const loaders: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    // Heavy components loaded on demand
    'dialog': () => import('../components/Dialog'),
    'table': () => import('../components/Table'),
    'datepicker': () => import('../components/DatePicker'),
    'richtext': () => import('../components/RichTextEditor'),
  }

  return (type: string) => {
    if (type in loaders) {
      return lazy(loaders[type])
    }
    return null
  }
}

/**
 * Wrap lazy component with Suspense
 */
export function withLazySuspense<P extends object>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback: React.ReactNode = 'Loading...'
): React.ComponentType<P> {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  )
}
```

---

## Complete Implementation Examples

### Example 1: Simple Form

```typescript
// packages/core/examples/simple-form.tsx

import { PunkRenderer } from '@punk/core'

const formSchema = {
  type: 'col',
  id: 'contact-form',
  props: {
    gap: 16,
  },
  children: [
    {
      type: 'heading',
      props: {
        level: 1,
        children: 'Contact Us',
      },
    },
    {
      type: 'form',
      props: {
        onSubmit: 'handleSubmit',
        'aria-label': 'Contact form',
      },
      children: [
        {
          type: 'col',
          props: { gap: 12 },
          children: [
            {
              type: 'input',
              props: {
                name: 'name',
                inputType: 'text',
                placeholder: 'Full Name',
                'aria-label': 'Full name',
              },
            },
            {
              type: 'input',
              props: {
                name: 'email',
                inputType: 'email',
                placeholder: 'Email Address',
                'aria-label': 'Email address',
              },
            },
            {
              type: 'textarea',
              props: {
                name: 'message',
                placeholder: 'Your Message',
                'aria-label': 'Message',
              },
            },
            {
              type: 'button',
              props: {
                type: 'submit',
                children: 'Send Message',
                'aria-label': 'Send contact form',
              },
            },
          ],
        },
      ],
    },
  ],
}

export function ContactForm() {
  const handlers = {
    handleSubmit: (event: React.FormEvent) => {
      event.preventDefault()
      // Handle form submission
      console.log('Form submitted')
    },
  }

  return <PunkRenderer schema={formSchema} handlers={handlers} />
}
```

### Example 2: Dynamic Data List

```typescript
// packages/core/examples/dynamic-list.tsx

interface User {
  id: string
  name: string
  email: string
  role: string
}

const data = {
  users: [
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'User' },
    { id: '3', name: 'Carol', email: 'carol@example.com', role: 'User' },
  ],
}

const listSchema = {
  type: 'col',
  id: 'user-list',
  children: [
    {
      type: 'heading',
      props: {
        level: 1,
        children: 'Users',
      },
    },
    {
      type: 'list',
      dataSource: 'users',
      itemTemplate: {
        type: 'row',
        props: {
          gap: 12,
          justify: 'between',
          className: 'p-4 border rounded',
        },
        children: [
          {
            type: 'col',
            children: [
              {
                type: 'heading',
                props: {
                  level: 3,
                  children: '{{name}}',
                },
              },
              {
                type: 'text',
                props: {
                  children: '{{email}}',
                },
              },
            ],
          },
          {
            type: 'text',
            props: {
              children: '{{role}}',
            },
          },
        ],
      },
    },
  ],
}

export function UserList() {
  return <PunkRenderer schema={listSchema} data={data} />
}
```

### Example 3: Conditional Content

```typescript
// packages/core/examples/conditional-content.tsx

const data = {
  user: {
    isLoggedIn: true,
    name: 'Alice',
    role: 'admin',
  },
}

const conditionalSchema = {
  type: 'col',
  children: [
    {
      type: 'heading',
      props: {
        children: 'Dashboard',
      },
    },
    {
      type: 'text',
      condition: 'user.isLoggedIn',
      props: {
        children: 'Welcome {{user.name}}!',
      },
    },
    {
      type: 'button',
      condition: '!user.isLoggedIn',
      props: {
        onClick: 'handleLogin',
        children: 'Sign In',
        'aria-label': 'Sign in to your account',
      },
    },
    {
      type: 'button',
      condition: 'user.role === "admin"',
      props: {
        onClick: 'handleAdminPanel',
        children: 'Admin Panel',
        'aria-label': 'Open admin panel',
      },
    },
  ],
}

export function Dashboard() {
  const handlers = {
    handleLogin: () => {
      console.log('Navigate to login')
    },
    handleAdminPanel: () => {
      console.log('Open admin panel')
    },
  }

  return <PunkRenderer schema={conditionalSchema} data={data} handlers={handlers} />
}
```

---

## Summary

The **PunkRenderer** provides a robust, type-safe system for rendering schemas to accessible React applications. Key points:

1. **Deterministic:** Same schema + data always produces same output
2. **Validated:** All schemas validated before rendering with Zod
3. **Accessible:** WCAG 2.1 Level AA compliance built-in
4. **Performant:** Memoization, code splitting, virtual scrolling
5. **Extensible:** Plugin system for custom components
6. **Safe:** No arbitrary code execution, controlled data access

For more information, see:
- [ARCHITECTURE.md](/home/user/Punk/ARCHITECTURE.md) - System overview
- [PUNK_FOUNDATION_SPEC.md](/home/user/Punk/PUNK_FOUNDATION_SPEC.md) - Foundation details
- [COMPONENT_REFERENCE.md](/home/user/Punk/COMPONENT_REFERENCE.md) - Component catalog
