/**
 * @punk/core - Type Definitions
 * Core type system for the Punk framework
 */

import type React from 'react'
import type { ComponentRegistry } from './registry'

/**
 * Accessibility metadata for schema nodes.
 * Used to provide screen reader labels, descriptions, and other ARIA metadata
 * without cluttering component props.
 */
export interface PunkNodeA11y {
  /** Short label for screen readers (aria-label) */
  label?: string
  /** Longer description (aria-describedby) */
  description?: string
  /** Table caption or figure caption */
  caption?: string
  /** Summary text for complex widgets */
  summary?: string
}

/**
 * PunkNode represents a single node in the schema tree
 */
export type PunkNode = {
  /** Component type identifier (e.g., 'button', 'text', 'container') */
  type: string

  /** Unique identifier for the node */
  id?: string

  /** React key for list rendering */
  key?: string

  /** Test ID for testing libraries */
  testId?: string

  /** Additional CSS class names */
  className?: string

  /** Inline styles (use sparingly) */
  style?: Record<string, string | number>

  /** Component props */
  props?: Record<string, unknown>

  /** Child nodes */
  children?: PunkNode[]

  /** Data source path for list rendering (e.g., 'users') */
  dataSource?: string

  /** Template node for rendering list items */
  itemTemplate?: PunkNode

  /** Conditional rendering expression (e.g., 'user.isLoggedIn') */
  condition?: string

  /** Optional per-node accessibility metadata */
  a11y?: PunkNodeA11y
}

/**
 * PunkSchema is the root schema structure
 */
export type PunkSchema = {
  /** Punk framework version */
  punkVersion: string

  /** Schema version for this document */
  schemaVersion: string

  /** Root node of the UI tree */
  root: PunkNode

  /** Optional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Component type - any React component
 */
export type PunkComponent = React.ComponentType<any>

/**
 * Component registry map
 */
export type ComponentMap = Map<string, PunkComponent>

/**
 * DataContext provides reactive data to components
 * Supports nested property access (e.g., user.profile.name)
 */
export type DataContext = Record<string, any>

/**
 * Action handler function type
 */
export type ActionHandler = (payload?: any) => void | Promise<void>

/**
 * ActionBus is a registry of named action handlers
 */
export type ActionBus = Record<string, ActionHandler>

/**
 * Props for the main PunkRenderer component
 */
export interface PunkRendererProps {
  /** Schema to render (can be full PunkSchema or just a node) */
  schema: PunkSchema | PunkNode | PunkNode[]

  /** Data context for interpolation */
  data?: DataContext

  /** Named action handlers */
  actions?: ActionBus

  /** Component registry override */
  registry?: ComponentRegistry

  /** Error callback */
  onError?: (error: Error) => void

  /** Enable error boundary (default: true) */
  errorBoundary?: boolean

  /** Accessibility mode (default: 'relaxed') */
  a11yMode?: 'off' | 'relaxed' | 'strict'
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation succeeded */
  valid: boolean

  /** Validation errors if any */
  errors?: ValidationError[]

  /** Validated schema if valid */
  schema?: PunkSchema | PunkNode
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string

  /** Error message */
  message: string

  /** Path to the error in the schema */
  path?: string[]

  /** Additional context */
  context?: Record<string, any>
}

/**
 * Complexity analysis result
 */
export interface ComplexityResult {
  /** Total node count */
  nodeCount: number

  /** Maximum nesting depth */
  maxDepth: number

  /** Whether complexity is within budget */
  withinBudget: boolean

  /** Complexity budget limits */
  budget: {
    maxNodes: number
    maxDepth: number
  }
}

/**
 * Component metadata for UI builders (Mohawk) and documentation
 */
export interface ComponentMeta {
  /** Display name for UI */
  displayName: string

  /** Description of the component */
  description: string

  /** Lucide icon name */
  icon: string

  /** Category for grouping (e.g., 'Layout', 'Data Visualization', 'Input') */
  category: string

  /** Tags for searchability */
  tags: string[]

  /** Complexity level */
  complexity: 'simple' | 'medium' | 'advanced'
}

/**
 * Component registration data including schema and metadata
 */
export interface ComponentRegistration {
  /** The React component */
  component: PunkComponent

  /** Zod schema for props validation (optional) */
  schema?: any

  /** Component metadata (optional) */
  meta?: ComponentMeta
}
