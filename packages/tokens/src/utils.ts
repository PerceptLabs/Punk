/**
 * Token System Utilities
 *
 * Helper functions for token validation, class name generation, and type guards.
 */

/**
 * Class name utility (cn)
 *
 * Combines class names, filtering out falsy values.
 * Compatible with conditional class names and arrays.
 *
 * @param classes - Class names to combine
 * @returns Combined class name string
 *
 * @example
 * ```typescript
 * cn('foo', 'bar') // → 'foo bar'
 * cn('foo', false && 'bar', 'baz') // → 'foo baz'
 * cn(['foo', 'bar'], 'baz') // → 'foo bar baz'
 * cn({ foo: true, bar: false, baz: true }) // → 'foo baz'
 * ```
 */
export function cn(...classes: unknown[]): string {
  const result: string[] = []

  for (const cls of classes) {
    if (!cls) continue

    // String
    if (typeof cls === 'string') {
      result.push(cls)
    }
    // Array
    else if (Array.isArray(cls)) {
      const nested = cn(...cls)
      if (nested) result.push(nested)
    }
    // Object (class map)
    else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key)
      }
    }
  }

  return result.join(' ')
}

/**
 * Validate token path format
 *
 * @param path - Token path to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidTokenPath('tokens.colors.accent.solid') // → true
 * isValidTokenPath('accent.solid') // → false
 * isValidTokenPath('tokens.colors') // → false (too short)
 * ```
 */
export function isValidTokenPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false
  }

  // Must start with 'tokens.'
  if (!path.startsWith('tokens.')) {
    return false
  }

  // Must have at least 3 segments (tokens.category.name)
  const segments = path.split('.')
  if (segments.length < 3) {
    return false
  }

  // All segments must be non-empty
  if (segments.some(s => s.length === 0)) {
    return false
  }

  return true
}

/**
 * Parse token path into components
 *
 * @param path - Token path
 * @returns Parsed path components
 *
 * @example
 * ```typescript
 * parseTokenPath('tokens.colors.accent.solid')
 * // → { category: 'colors', subcategory: 'accent', name: 'solid', path: ['colors', 'accent', 'solid'] }
 * ```
 */
export function parseTokenPath(path: string): {
  category: string
  subcategory?: string
  name: string
  path: string[]
} | null {
  if (!isValidTokenPath(path)) {
    return null
  }

  const segments = path.replace(/^tokens\./, '').split('.')

  return {
    category: segments[0],
    subcategory: segments.length > 2 ? segments[1] : undefined,
    name: segments[segments.length - 1],
    path: segments
  }
}

/**
 * Check if path is a color token
 */
export function isColorToken(path: string): boolean {
  return path.startsWith('tokens.colors.')
}

/**
 * Check if path is a space token
 */
export function isSpaceToken(path: string): boolean {
  return path.startsWith('tokens.space.')
}

/**
 * Check if path is a radius token
 */
export function isRadiusToken(path: string): boolean {
  return path.startsWith('tokens.radii.')
}

/**
 * Check if path is a typography token
 */
export function isTypographyToken(path: string): boolean {
  return path.startsWith('tokens.fontSize.') ||
         path.startsWith('tokens.fontWeight.') ||
         path.startsWith('tokens.lineHeight.') ||
         path.startsWith('tokens.letterSpacing.') ||
         path.startsWith('tokens.fontFamily.')
}

/**
 * Check if path is a shadow token
 */
export function isShadowToken(path: string): boolean {
  return path.startsWith('tokens.shadows.')
}

/**
 * Check if path is an animation token
 */
export function isAnimationToken(path: string): boolean {
  return path.startsWith('tokens.duration.') ||
         path.startsWith('tokens.easing.')
}

/**
 * Get token category from path
 *
 * @param path - Token path
 * @returns Token category or null if invalid
 */
export function getTokenCategory(path: string): string | null {
  const parsed = parseTokenPath(path)
  return parsed ? parsed.category : null
}

/**
 * Convert token path to CSS variable name
 *
 * @param path - Token path
 * @returns CSS variable name (without -- prefix)
 *
 * @example
 * ```typescript
 * tokenPathToCSSVar('tokens.colors.accent.solid') // → 'accent-solid'
 * tokenPathToCSSVar('tokens.space.4') // → 'space-4'
 * ```
 */
export function tokenPathToCSSVar(path: string): string {
  if (!isValidTokenPath(path)) {
    throw new Error(`Invalid token path: ${path}`)
  }

  // Remove 'tokens.' prefix and convert dots to hyphens
  return path
    .replace(/^tokens\./, '')
    .replace(/\./g, '-')
}

/**
 * Convert CSS variable name to token path
 *
 * @param varName - CSS variable name (with or without -- prefix)
 * @returns Token path
 *
 * @example
 * ```typescript
 * cssVarToTokenPath('accent-solid') // → 'tokens.colors.accent.solid'
 * cssVarToTokenPath('--accent-solid') // → 'tokens.colors.accent.solid'
 * cssVarToTokenPath('space-4') // → 'tokens.space.4'
 * ```
 */
export function cssVarToTokenPath(varName: string): string {
  // Remove -- prefix if present
  const cleaned = varName.replace(/^--/, '')

  // Convert hyphens to dots and add tokens prefix
  return 'tokens.' + cleaned.replace(/-/g, '.')
}

/**
 * Format token value for CSS
 *
 * Ensures pixel values have 'px' suffix, etc.
 *
 * @param value - Raw token value
 * @returns Formatted CSS value
 */
export function formatCSSValue(value: string | number): string {
  if (typeof value === 'number') {
    return `${value}px`
  }

  // Already has unit
  if (/^[\d.]+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex)$/.test(value)) {
    return value
  }

  // Pure number string - add px
  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return `${value}px`
  }

  // Return as-is (color, keyword, etc.)
  return value
}

/**
 * Debounce function
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Memoize function results
 *
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
