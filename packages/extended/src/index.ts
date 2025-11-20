/**
 * @punk/extended - Extended Component Loadout
 * Meta-package bundling all Punk component wrappers
 *
 * This package provides a curated collection of pre-wrapped React component
 * libraries that work via JSON schemas (similar to Puck). Each component
 * auto-registers with the ComponentRegistry on import.
 *
 * @example
 * ```typescript
 * // Import all components
 * import '@punk/extended'
 *
 * // Or import specific components
 * import '@punk/component-chart'
 * import '@punk/component-table'
 * ```
 */

// Re-export all component wrappers
// These will auto-register on import
export * from '@punk/component-chart'
export * from '@punk/component-table'
export * from '@punk/component-mermaid'
export * from '@punk/component-richtext'
export * from '@punk/component-code'
export * from '@punk/component-filedrop'
export * from '@punk/component-date'
export * from '@punk/component-command'

// Re-export core types for convenience
export type { ComponentMeta, ComponentRegistration } from '@punk/core'

/**
 * Aggregate all component schemas for SynthPunk AI generation
 * This object maps component names to their Zod schemas
 */
import { ChartSchemaMap } from '@punk/component-chart'
import { TableSchemaMap } from '@punk/component-table'
import { MermaidSchemaMap } from '@punk/component-mermaid'
import { RichTextSchemaMap } from '@punk/component-richtext'
import { CodeSchemaMap } from '@punk/component-code'
import { FileDropSchemaMap } from '@punk/component-filedrop'
import { DatePickerSchemaMap } from '@punk/component-date'
import { CommandSchemaMap } from '@punk/component-command'

/**
 * Complete schema registry for all extended components
 * Use this in SynthPunk for AI-driven component generation
 */
export const ExtendedSchemaRegistry = {
  ...ChartSchemaMap,
  ...TableSchemaMap,
  ...MermaidSchemaMap,
  ...RichTextSchemaMap,
  ...CodeSchemaMap,
  ...FileDropSchemaMap,
  ...DatePickerSchemaMap,
  ...CommandSchemaMap,
}

/**
 * List of all available component types in the extended loadout
 */
export const EXTENDED_COMPONENTS = [
  'Chart',
  'Table',
  'Mermaid',
  'RichText',
  'Code',
  'FileDrop',
  'DatePicker',
  'Command',
] as const

export type ExtendedComponentType = (typeof EXTENDED_COMPONENTS)[number]

// Re-export schema utilities
export {
  buildExtendedComponentRegistry,
  getExtendedSchemasAsJSON,
  getComponentCategories,
  type ExtendedComponentEntry,
} from './schemas'

// Re-export presets
export * from './presets'
