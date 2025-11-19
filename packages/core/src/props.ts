/**
 * @punk/core - Props Processing
 * Template interpolation and action binding utilities
 */

import type { DataContext, ActionBus } from './types'

/**
 * Interpolate template strings with data context
 * Replaces {{path.to.value}} with actual values from context
 *
 * @param props - Raw props object with potential template strings
 * @param data - Data context for interpolation
 * @returns Props with interpolated values
 *
 * @example
 * interpolateProps({ text: "Hello {{user.name}}" }, { user: { name: "Alice" } })
 * // Returns: { text: "Hello Alice" }
 */
export function interpolateProps(
  props: Record<string, any>,
  data: DataContext
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    result[key] = interpolateValue(value, data)
  }

  return result
}

/**
 * Interpolate a single value (recursive for objects/arrays)
 */
function interpolateValue(value: any, data: DataContext): any {
  // Handle strings with template syntax
  if (typeof value === 'string') {
    return interpolateString(value, data)
  }

  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, data))
  }

  // Handle objects recursively
  if (value && typeof value === 'object') {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      result[k] = interpolateValue(v, data)
    }
    return result
  }

  // Return primitives as-is
  return value
}

/**
 * Interpolate template expressions in a string
 * Supports: {{path.to.value}}
 */
function interpolateString(template: string, data: DataContext): string {
  // Match {{...}} patterns
  const regex = /\{\{([^}]+)\}\}/g

  return template.replace(regex, (match, path) => {
    const trimmedPath = path.trim()
    const value = getValueFromPath(trimmedPath, data)

    // Convert to string, handling null/undefined
    if (value === null || value === undefined) {
      return ''
    }

    return String(value)
  })
}

/**
 * Get a value from a nested data path
 * Supports: 'user.profile.name' or 'items[0].title'
 *
 * @param path - Dot-separated path string
 * @param data - Data context object
 * @returns Value at path, or undefined if not found
 */
export function getValueFromPath(path: string, data: DataContext): any {
  if (!path || !data) {
    return undefined
  }

  // Split path by dots and brackets
  const parts = path.split(/[.[\]]/).filter(Boolean)

  let current: any = data

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined
    }

    // Handle array indices
    if (/^\d+$/.test(part)) {
      const index = parseInt(part, 10)
      if (Array.isArray(current) && index < current.length) {
        current = current[index]
      } else {
        return undefined
      }
    }
    // Handle object properties
    else if (typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Set a value at a nested data path
 * Useful for form data binding
 *
 * @param path - Dot-separated path string
 * @param value - Value to set
 * @param data - Data context object (will be mutated)
 */
export function setValueAtPath(path: string, value: any, data: DataContext): void {
  if (!path || !data) {
    return
  }

  const parts = path.split(/[.[\]]/).filter(Boolean)
  let current: any = data

  // Navigate to parent of target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]

    if (!(part in current)) {
      // Create intermediate objects/arrays as needed
      const nextPart = parts[i + 1]
      current[part] = /^\d+$/.test(nextPart) ? [] : {}
    }

    current = current[part]
  }

  // Set the final value
  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}

/**
 * Bind action handlers to props
 * Converts handler names (strings) to actual functions
 *
 * @param props - Raw props with handler names
 * @param actions - ActionBus with registered handlers
 * @returns Props with bound handler functions
 *
 * @example
 * bindActions({ onClick: "handleClick" }, { handleClick: () => {} })
 * // Returns: { onClick: [Function] }
 */
export function bindActions(
  props: Record<string, any>,
  actions: ActionBus
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // Check if this looks like an event handler prop
    if (key.startsWith('on') && typeof value === 'string') {
      // Look up the handler in the action bus
      const handler = actions[value]

      if (handler) {
        // Bind the handler
        result[key] = handler
      } else {
        // Handler not found - log warning but don't fail
        console.warn(`Action handler '${value}' not found for prop '${key}'`)
        // Provide a no-op function to prevent runtime errors
        result[key] = () => {
          console.warn(`No-op handler called for missing action: ${value}`)
        }
      }
    } else {
      // Not an event handler, pass through
      result[key] = value
    }
  }

  return result
}

/**
 * Process all props: interpolate data and bind actions
 * This is the main props processing function used by the renderer
 *
 * @param props - Raw props from schema
 * @param data - Data context for interpolation
 * @param actions - Action bus for handler binding
 * @returns Fully processed props ready for React components
 */
export function processProps(
  props: Record<string, any>,
  data: DataContext,
  actions: ActionBus
): Record<string, any> {
  // First interpolate data
  const interpolated = interpolateProps(props, data)

  // Then bind actions
  const bound = bindActions(interpolated, actions)

  return bound
}

/**
 * Check if a string contains template expressions
 */
export function hasTemplateExpressions(value: string): boolean {
  return /\{\{[^}]+\}\}/.test(value)
}

/**
 * Extract all template expression paths from a string
 * @param value - String with template expressions
 * @returns Array of data paths referenced
 *
 * @example
 * extractTemplatePaths("Hello {{user.name}}, you have {{count}} messages")
 * // Returns: ["user.name", "count"]
 */
export function extractTemplatePaths(value: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const paths: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(value)) !== null) {
    paths.push(match[1].trim())
  }

  return paths
}

/**
 * Evaluate a condition expression
 * Used for conditional rendering (node.condition)
 *
 * @param condition - Condition string (e.g., 'user.isLoggedIn', '!user.isGuest')
 * @param data - Data context
 * @returns True if condition passes
 */
export function evaluateCondition(condition: string, data: DataContext): boolean {
  if (!condition) {
    return true
  }

  // Handle negation
  const isNegated = condition.startsWith('!')
  const path = isNegated ? condition.slice(1).trim() : condition.trim()

  // Handle equality checks (simple version)
  if (path.includes('===')) {
    const [leftPath, rightValue] = path.split('===').map((s) => s.trim())
    const leftVal = getValueFromPath(leftPath, data)
    // Remove quotes from string literals
    const rightVal = rightValue.replace(/^["']|["']$/g, '')
    return isNegated ? leftVal !== rightVal : leftVal === rightVal
  }

  if (path.includes('!==')) {
    const [leftPath, rightValue] = path.split('!==').map((s) => s.trim())
    const leftVal = getValueFromPath(leftPath, data)
    const rightVal = rightValue.replace(/^["']|["']$/g, '')
    return isNegated ? leftVal === rightVal : leftVal !== rightVal
  }

  // Simple boolean check
  const value = getValueFromPath(path, data)
  const result = Boolean(value)

  return isNegated ? !result : result
}
