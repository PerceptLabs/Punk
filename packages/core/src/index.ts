/**
 * @punk/core - Punk Framework Core
 * Deterministic, validated, accessible UI rendering from JSON schemas
 *
 * @packageDocumentation
 */

// Main renderer component
export {
  PunkRenderer,
  useDataContext,
  useActionBus,
  DataContextProvider,
  ActionBusProvider,
} from './renderer'

// Validation utilities
export {
  validateSchema,
  validateComplexity,
  validateDataPath,
  validateHandlerName,
  validateSecurity,
  PunkNodeSchema,
  PunkSchemaSchema,
} from './validator'

// Component registry
export {
  ComponentRegistry,
  defaultRegistry,
  registerComponent,
  getComponent,
  hasComponent,
} from './registry'

// Props processing utilities
export {
  interpolateProps,
  bindActions,
  processProps,
  getValueFromPath,
  setValueAtPath,
  evaluateCondition,
  hasTemplateExpressions,
  extractTemplatePaths,
} from './props'

// Type exports
export type {
  PunkNode,
  PunkSchema,
  PunkComponent,
  ComponentMap,
  DataContext,
  ActionHandler,
  ActionBus,
  PunkRendererProps,
  ValidationResult,
  ValidationError,
  ComplexityResult,
} from './types'
