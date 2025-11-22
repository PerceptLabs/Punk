/**
 * @punk/core - A11y Violation Detection
 * Analyzes schemas for accessibility issues
 */

import type { PunkSchema, PunkNode, PunkNodeA11y } from '../types'
import { getRigA11yProfile } from './profiles'

/**
 * Represents a single accessibility violation.
 */
export interface A11yViolation {
  /** Node ID or path where violation occurred */
  nodeId: string
  /** Component type (e.g., 'Chart', 'Table') */
  nodeType: string
  /** The a11y field that has an issue */
  field: string
  /** Human-readable message describing the violation */
  message: string
  /** Severity level */
  severity: 'error' | 'warn'
}

/**
 * Analyzes schema and returns all accessibility violations.
 *
 * @param schema - The schema to analyze (can be full PunkSchema or just a node)
 * @returns Array of violations found (empty if schema is fully accessible)
 *
 * @example
 * const violations = getA11yViolations(schema)
 * if (violations.length > 0) {
 *   console.error('Accessibility issues found:', violations)
 * }
 */
export function getA11yViolations(schema: PunkSchema | PunkNode): A11yViolation[] {
  // If it's a full schema with root, analyze the root
  if ('root' in schema && 'punkVersion' in schema) {
    return analyzeNode(schema.root, 'root')
  }

  // Otherwise analyze as a node
  return analyzeNode(schema as PunkNode, 'node')
}

/**
 * Recursively analyzes a node and its children for violations.
 */
function analyzeNode(node: PunkNode, path: string): A11yViolation[] {
  const violations: A11yViolation[] = []

  // Check this node
  violations.push(...validateNode(node, path))

  // Recursively check children
  if (node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      const childPath = `${path}.children[${index}]`
      violations.push(...analyzeNode(child, childPath))
    })
  }

  return violations
}

/**
 * Validates a single node for accessibility violations.
 */
function validateNode(node: PunkNode, path: string): A11yViolation[] {
  const profile = getRigA11yProfile(node.type)

  // No profile means no accessibility requirements
  if (!profile) {
    return []
  }

  const violations: A11yViolation[] = []
  const nodeId = node.id || path

  // Check required fields
  for (const field of profile.required) {
    const value = node.a11y?.[field]

    // Missing or empty
    if (!value || value.trim() === '') {
      violations.push({
        nodeId,
        nodeType: node.type,
        field,
        message: `Missing required accessibility metadata: ${field}`,
        severity: 'error',
      })
      continue
    }

    // Check for suspicious/generic values
    const suspiciousResult = checkSuspiciousValue(field, value, node.type)
    if (suspiciousResult) {
      violations.push({
        nodeId,
        nodeType: node.type,
        field,
        message: suspiciousResult,
        severity: 'warn',
      })
    }
  }

  // Check optional fields if they exist
  for (const field of profile.optional) {
    const value = node.a11y?.[field]

    if (value) {
      // Check for suspicious/generic values
      const suspiciousResult = checkSuspiciousValue(field, value, node.type)
      if (suspiciousResult) {
        violations.push({
          nodeId,
          nodeType: node.type,
          field,
          message: suspiciousResult,
          severity: 'warn',
        })
      }
    }
  }

  return violations
}

/**
 * Check if a value appears to be a generic placeholder rather than meaningful content.
 */
function checkSuspiciousValue(field: keyof PunkNodeA11y, value: string, componentType: string): string | null {
  const trimmedValue = value.trim().toLowerCase()

  // Generic field names as values
  const genericPatterns = [
    /^(label|aria-label|arialabel)$/i,
    /^(title|name)$/i,
    /^(description|desc)$/i,
    /^(caption|cap)$/i,
    /^(summary|sum)$/i,
  ]

  for (const pattern of genericPatterns) {
    if (pattern.test(trimmedValue)) {
      return `Generic ${field} detected - provide a more descriptive value instead of "${value}"`
    }
  }

  // Placeholder-like values
  if (
    trimmedValue.includes('placeholder') ||
    trimmedValue.includes('todo') ||
    trimmedValue.includes('tbd') ||
    trimmedValue.includes('xxx') ||
    trimmedValue === 'test' ||
    trimmedValue === 'example'
  ) {
    return `Placeholder ${field} detected - replace "${value}" with actual descriptive text`
  }

  // Too short to be meaningful (less than 3 characters)
  if (trimmedValue.length < 3) {
    return `${field} is too short - "${value}" is not descriptive enough`
  }

  // Contains only the component type
  if (trimmedValue === componentType.toLowerCase()) {
    return `${field} only contains component type - provide more context than just "${value}"`
  }

  // All caps (often indicates placeholder)
  if (value.length > 3 && value === value.toUpperCase() && /^[A-Z_]+$/.test(value)) {
    return `${field} appears to be a constant or placeholder - replace "${value}" with descriptive text`
  }

  return null
}

/**
 * Get a summary of violations grouped by severity.
 *
 * @param violations - Array of violations to summarize
 * @returns Summary object with counts and grouped violations
 */
export function summarizeViolations(violations: A11yViolation[]): {
  total: number
  errors: number
  warnings: number
  byType: Record<string, A11yViolation[]>
  bySeverity: Record<'error' | 'warn', A11yViolation[]>
} {
  const summary = {
    total: violations.length,
    errors: violations.filter((v) => v.severity === 'error').length,
    warnings: violations.filter((v) => v.severity === 'warn').length,
    byType: {} as Record<string, A11yViolation[]>,
    bySeverity: {
      error: violations.filter((v) => v.severity === 'error'),
      warn: violations.filter((v) => v.severity === 'warn'),
    },
  }

  // Group by node type
  violations.forEach((violation) => {
    if (!summary.byType[violation.nodeType]) {
      summary.byType[violation.nodeType] = []
    }
    summary.byType[violation.nodeType].push(violation)
  })

  return summary
}
