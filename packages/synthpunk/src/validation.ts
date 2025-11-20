/**
 * SynthPunk - 8-Stage Validation Pipeline
 */

import { z } from 'zod'
import {
  SchemaPatch,
  EpochContext,
  ValidationResult,
  PropertySchema,
  DataModel,
  DataField,
} from './types'

/**
 * Complete 8-stage validation pipeline
 */
export async function validatePatch(
  patch: SchemaPatch,
  context: EpochContext
): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // STEP 1: Structural Validation (Zod)
  const structureValidation = validateStructure(patch)
  if (!structureValidation.valid) {
    errors.push(...structureValidation.errors)
    return { valid: false, errors, warnings }
  }

  // STEP 2: Component Type Validation
  if (patch.op === 'add' && patch.value && typeof patch.value === 'object') {
    const value = patch.value as Record<string, unknown>
    if (value.type && typeof value.type === 'string') {
      if (!context.componentRegistry.has(value.type)) {
        errors.push(`Unknown component type: ${value.type}`)
        return { valid: false, errors, warnings }
      }
    }
  }

  // STEP 3: Props Validation
  if (patch.value && typeof patch.value === 'object') {
    const value = patch.value as Record<string, unknown>
    if (value.type && value.props && typeof value.type === 'string') {
      const schema = context.componentRegistry.get(value.type)
      if (schema) {
        const props = value.props as Record<string, unknown>
        for (const [propName, propValue] of Object.entries(props)) {
          const propSchema = schema.props[propName]
          if (!propSchema) {
            warnings.push(`Unknown prop for ${value.type}: ${propName}`)
            continue
          }

          // Type check
          if (!isValidPropValue(propValue, propSchema)) {
            errors.push(
              `Invalid value for ${value.type}.${propName}: ${JSON.stringify(propValue)}`
            )
          }

          // Token validation
          if (typeof propValue === 'string' && isTokenReference(propValue)) {
            const tokenKey = propValue.replace(/^(spacing|color|typography|shadow|radius)-/, '')
            const fullTokenName = propValue
            let found = false

            // Check if token exists in registry
            for (const [key, token] of context.tokenRegistry) {
              if (key === fullTokenName || token.name === fullTokenName) {
                found = true
                break
              }
            }

            if (!found) {
              warnings.push(`Unknown token: ${propValue}`)
            }
          }
        }
      }
    }
  }

  // STEP 4: Data Binding Validation
  if (patch.value && typeof patch.value === 'object') {
    const value = patch.value as Record<string, unknown>
    if (value.props) {
      const bindings = extractDataBindings(value.props as Record<string, unknown>)
      for (const binding of bindings) {
        const isValid = validateDataBinding(binding, context.dataModels)
        if (!isValid) {
          errors.push(`Invalid data binding: ${binding}`)
        }
      }
    }
  }

  // STEP 5: Complexity Check
  const complexity = calculateComplexity(patch)
  if (context.complexityUsed + complexity > context.complexityBudget) {
    errors.push(
      `Complexity budget exceeded: ${context.complexityUsed} + ${complexity} > ${context.complexityBudget}`
    )
  }

  // STEP 6: Security Validation
  if (patch.value && typeof patch.value === 'object') {
    const value = patch.value as Record<string, unknown>
    if (value.text && typeof value.text === 'string') {
      if (containsMaliciousContent(value.text)) {
        errors.push('Content contains malicious patterns')
      }
    }
  }

  // STEP 7: Accessibility Validation
  if (patch.op === 'add' && patch.value && typeof patch.value === 'object') {
    const a11yErrors = validateAccessibility(patch.value as Record<string, unknown>, context)
    errors.push(...a11yErrors)
  }

  // STEP 8: JSON Pointer Path Validation
  const pathErrors = validateJsonPointerPath(patch.path)
  errors.push(...pathErrors)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    metrics: {
      complexity,
      depth: measureDepth(patch.value as Record<string, unknown>),
      tokenUsage: 0, // Calculated elsewhere
    },
  }
}

/**
 * Step 1: Structural validation using Zod
 */
function validateStructure(patch: SchemaPatch): ValidationResult {
  try {
    const schema = z.object({
      op: z.enum(['add', 'replace', 'remove', 'move', 'copy', 'test']),
      path: z.string().startsWith('/'),
      value: z.unknown().optional(),
      from: z.string().optional(),
      meta: z
        .object({
          id: z.string().optional(),
          sequence: z.number().optional(),
          validated: z.boolean().optional(),
          complexity: z
            .object({
              nodes: z.number(),
              depth: z.number(),
              bindings: z.number(),
            })
            .optional(),
        })
        .optional(),
    })

    schema.parse(patch)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      }
    }
    return { valid: false, errors: [(error as Error).message] }
  }
}

/**
 * Check if a string is a design token reference
 */
function isTokenReference(value: string): boolean {
  return /^(spacing|color|typography|shadow|radius)-(xs|sm|md|lg|xl|2xl|primary|secondary|success|danger|warning|neutral|surface|h1|h2|h3|body|caption)$/.test(
    value
  )
}

/**
 * Validate prop value against property schema
 */
function isValidPropValue(value: unknown, schema: PropertySchema): boolean {
  if (schema.type === 'enum') {
    return schema.enum?.includes(value) ?? false
  }
  if (schema.type === 'string') {
    return typeof value === 'string'
  }
  if (schema.type === 'number') {
    return typeof value === 'number'
  }
  if (schema.type === 'boolean') {
    return typeof value === 'boolean'
  }
  if (schema.type === 'array') {
    return Array.isArray(value)
  }
  if (schema.type === 'object') {
    return typeof value === 'object' && value !== null
  }
  return true
}

/**
 * Extract data binding references from props
 */
function extractDataBindings(props: Record<string, unknown>): string[] {
  const bindings: string[] = []
  const bindingRegex = /\{(context\.[^}]+|props\.[^}]+|item\.[^}]+)\}/g

  function traverse(obj: unknown) {
    if (typeof obj === 'string') {
      const matches = obj.matchAll(bindingRegex)
      for (const match of matches) {
        bindings.push(match[1])
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        traverse(value)
      }
    }
  }

  traverse(props)
  return bindings
}

/**
 * Validate data binding path against data models
 */
function validateDataBinding(binding: string, dataModels: DataModel[]): boolean {
  // Split binding path: context.user.name -> ['context', 'user', 'name']
  const parts = binding.split('.')

  if (parts.length < 2) {
    return false
  }

  const [scope, modelName, ...fieldPath] = parts

  // Validate scope
  if (!['context', 'props', 'item'].includes(scope)) {
    return false
  }

  // For props and item, we can't validate without more context
  if (scope === 'props' || scope === 'item') {
    return true
  }

  // For context, validate against data models
  const dataModel = dataModels.find((m) => m.name === modelName)
  if (!dataModel) {
    return false
  }

  // Traverse field path
  let currentFields = dataModel.fields
  for (const fieldName of fieldPath) {
    const field = currentFields[fieldName]
    if (!field) {
      return false
    }

    // If this is an object field, continue traversing
    if (field.type === 'object' && field.fields) {
      currentFields = field.fields
    }
  }

  return true
}

/**
 * Calculate complexity score for a patch
 */
export function calculateComplexity(patch: SchemaPatch): number {
  let score = 0

  if (patch.op === 'add' && patch.value && typeof patch.value === 'object') {
    const value = patch.value as Record<string, unknown>

    // Count nodes
    score += countNodes(value)

    // Measure depth
    score += measureDepth(value)

    // Count bindings
    if (value.props) {
      const bindings = extractDataBindings(value.props as Record<string, unknown>)
      score += bindings.length * 2
    }
  }

  return score
}

/**
 * Count total component nodes
 */
function countNodes(obj: Record<string, unknown>): number {
  let count = 1

  if (Array.isArray(obj.children)) {
    for (const child of obj.children) {
      if (typeof child === 'object' && child !== null) {
        count += countNodes(child as Record<string, unknown>)
      }
    }
  }

  return count
}

/**
 * Measure component tree depth
 */
function measureDepth(obj: Record<string, unknown>, current: number = 0): number {
  if (!obj || typeof obj !== 'object') {
    return current
  }

  if (!Array.isArray(obj.children) || obj.children.length === 0) {
    return current
  }

  return Math.max(
    ...obj.children.map((child) =>
      measureDepth(child as Record<string, unknown>, current + 1)
    )
  )
}

/**
 * Check for malicious content patterns
 */
function containsMaliciousContent(text: string): boolean {
  const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick=', 'onload=']
  const lowerText = text.toLowerCase()
  return dangerous.some((pattern) => lowerText.includes(pattern))
}

/**
 * Validate accessibility requirements
 */
function validateAccessibility(
  component: Record<string, unknown>,
  context: EpochContext
): string[] {
  const errors: string[] = []
  const type = component.type as string

  if (!type) {
    return errors
  }

  // Check interactive elements have labels
  if (['Button', 'Input', 'Select'].includes(type)) {
    const props = (component.props as Record<string, unknown>) || {}
    const hasLabel = props.label || props.ariaLabel || props['aria-label']
    const hasText = component.text

    if (!hasLabel && !hasText && type !== 'Input') {
      errors.push(`${type} component missing label or text`)
    }
  }

  // Check form fields have descriptions
  if (type === 'FormField') {
    const props = (component.props as Record<string, unknown>) || {}
    if (!props.label && !props.hint) {
      errors.push('FormField should have label or hint')
    }
  }

  // Check images have alt text
  if (type === 'Avatar') {
    const props = (component.props as Record<string, unknown>) || {}
    if (!props.alt && !props.fallback) {
      errors.push('Avatar should have alt or fallback text')
    }
  }

  return errors
}

/**
 * Validate JSON Pointer path format
 */
function validateJsonPointerPath(path: string): string[] {
  const errors: string[] = []

  if (!path.startsWith('/')) {
    errors.push('JSON Pointer path must start with /')
  }

  // Validate path segments don't contain invalid characters
  const segments = path.split('/').slice(1)
  for (const segment of segments) {
    if (segment === '-' || segment === '') continue // Valid array operation

    // Allow alphanumeric, underscore, hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
      errors.push(`Invalid path segment: ${segment}`)
    }
  }

  return errors
}
