/**
 * @punk/core - Schema Validator
 * Zod-based validation for Punk schemas
 */

import { z } from 'zod'
import type { PunkNode, ValidationResult, ComplexityResult } from './types'

/**
 * Complexity budget configuration
 */
const COMPLEXITY_BUDGET = {
  maxNodes: 1000,
  maxDepth: 50,
  maxPropsPerNode: 50,
}

/**
 * Base node schema - foundation for all components
 */
const PunkBaseNodeSchema = z.object({
  type: z.string().min(1),
  id: z.string().optional(),
  key: z.string().optional(),
  testId: z.string().optional(),
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
})

/**
 * Recursive PunkNode schema
 * Supports children and nested structures
 */
export const PunkNodeSchema: z.ZodType<PunkNode> = z.lazy(() =>
  PunkBaseNodeSchema.extend({
    props: z.record(z.any()).optional(),
    children: z.array(PunkNodeSchema).optional(),
    dataSource: z.string().optional(),
    itemTemplate: PunkNodeSchema.optional(),
    condition: z.string().optional(),
  })
)

/**
 * Full PunkSchema validation
 */
export const PunkSchemaSchema = z.object({
  punkVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  schemaVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  root: PunkNodeSchema,
  metadata: z.record(z.any()).optional(),
})

/**
 * Validate a schema against the Zod schema
 */
export function validateSchema(schema: unknown): ValidationResult {
  try {
    // Try to parse as full PunkSchema first
    const result = PunkSchemaSchema.safeParse(schema)

    if (result.success) {
      // Check complexity budget
      const complexity = validateComplexity(result.data.root)
      if (!complexity.withinBudget) {
        return {
          valid: false,
          errors: [
            {
              code: 'COMPLEXITY_EXCEEDED',
              message: `Schema exceeds complexity budget: ${complexity.nodeCount} nodes (max: ${complexity.budget.maxNodes}), depth ${complexity.maxDepth} (max: ${complexity.budget.maxDepth})`,
              context: complexity,
            },
          ],
        }
      }

      return {
        valid: true,
        schema: result.data,
      }
    }

    // Try to parse as a single PunkNode
    const nodeResult = PunkNodeSchema.safeParse(schema)
    if (nodeResult.success) {
      const complexity = validateComplexity(nodeResult.data)
      if (!complexity.withinBudget) {
        return {
          valid: false,
          errors: [
            {
              code: 'COMPLEXITY_EXCEEDED',
              message: `Node exceeds complexity budget`,
              context: complexity,
            },
          ],
        }
      }

      return {
        valid: true,
        schema: nodeResult.data,
      }
    }

    // Neither worked, return errors
    return {
      valid: false,
      errors: result.error.errors.map((err) => ({
        code: err.code,
        message: err.message,
        path: err.path.map(String),
      })),
    }
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
      ],
    }
  }
}

/**
 * Validate complexity budget
 * Ensures schemas don't exceed performance limits
 */
export function validateComplexity(node: PunkNode): ComplexityResult {
  let nodeCount = 0
  let maxDepth = 0

  function traverse(n: PunkNode, depth: number): void {
    nodeCount++
    maxDepth = Math.max(maxDepth, depth)

    // Check children
    if (n.children) {
      for (const child of n.children) {
        traverse(child, depth + 1)
      }
    }

    // Check item template
    if (n.itemTemplate) {
      traverse(n.itemTemplate, depth + 1)
    }
  }

  traverse(node, 1)

  return {
    nodeCount,
    maxDepth,
    withinBudget:
      nodeCount <= COMPLEXITY_BUDGET.maxNodes &&
      maxDepth <= COMPLEXITY_BUDGET.maxDepth,
    budget: {
      maxNodes: COMPLEXITY_BUDGET.maxNodes,
      maxDepth: COMPLEXITY_BUDGET.maxDepth,
    },
  }
}

/**
 * Validate a data path string
 * Examples: 'user.name', 'items[0].title'
 */
export function validateDataPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false
  }

  // Allow simple property access with dots and array brackets
  const pathRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\d+\])*$/
  return pathRegex.test(path)
}

/**
 * Validate an event handler name
 * Examples: 'onClick', 'handleSubmit', 'onFormChange'
 */
export function validateHandlerName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false
  }

  // Handler names should be valid JavaScript identifiers
  const handlerRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
  return handlerRegex.test(name)
}

/**
 * Security validation - check for dangerous content
 */
export function validateSecurity(schema: PunkNode): { safe: boolean; issues: string[] } {
  const issues: string[] = []

  function checkNode(node: PunkNode): void {
    // Check for script injection in strings
    if (node.props) {
      for (const [key, value] of Object.entries(node.props)) {
        if (typeof value === 'string') {
          // Check for script tags
          if (/<script/i.test(value)) {
            issues.push(`Potential script injection in ${key}`)
          }

          // Check for javascript: protocol
          if (/javascript:/i.test(value)) {
            issues.push(`Dangerous javascript: protocol in ${key}`)
          }

          // Check for data: protocol with HTML
          if (/data:text\/html/i.test(value)) {
            issues.push(`Dangerous data URI in ${key}`)
          }
        }
      }
    }

    // Check inline styles for dangerous content
    if (node.style) {
      for (const [key, value] of Object.entries(node.style)) {
        const strValue = String(value)
        if (/expression|javascript:|@import/i.test(strValue)) {
          issues.push(`Dangerous style in ${key}: ${strValue}`)
        }
      }
    }

    // Recursively check children
    if (node.children) {
      node.children.forEach(checkNode)
    }

    if (node.itemTemplate) {
      checkNode(node.itemTemplate)
    }
  }

  checkNode(schema)

  return {
    safe: issues.length === 0,
    issues,
  }
}
