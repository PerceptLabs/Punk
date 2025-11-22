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
  useComponentRegistry,
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

// Accessibility system
export { getRigA11yProfile, getAllRigA11yProfiles, hasRigA11yProfile } from './a11y/profiles'
export { A11yContext, useA11yConfig } from './a11y/context'
export { repairA11y } from './a11y/repair'
export { getA11yViolations, summarizeViolations, type A11yViolation } from './a11y/violations'

// Test utilities (for internal testing)
export { renderSchema, createTestNode, createTestSchema, createTestData } from './a11y/test-utils'

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
  ComponentMeta,
  ComponentRegistration,
  PunkNodeA11y,
} from './types'

// Accessibility type exports
export type { RigA11yProfile } from './a11y/profiles'
export type { A11yConfig, A11yMode } from './a11y/context'
