/**
 * Token Resolver with Caching
 *
 * Resolves design token paths to actual values with performance optimizations.
 * Implements TokiForge-compatible resolution API.
 *
 * @example
 * ```typescript
 * const resolver = new TokenResolver()
 * const color = resolver.resolve('tokens.colors.accent.solid') // → '#FF5AC4'
 * const space = resolver.resolve('tokens.space.4') // → '16px'
 * ```
 */

import { pinkTokensLight, pinkTokensDark, type TokenDefinition } from './tokens'

export type ThemeMode = 'light' | 'dark'

export interface ResolverOptions {
  theme?: ThemeMode
  tokens?: TokenDefinition
  cacheLimit?: number
}

/**
 * Token path type guard
 */
function isValidTokenPath(path: string): boolean {
  return path.startsWith('tokens.') && path.split('.').length >= 3
}

/**
 * Resolves nested object paths
 */
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * Token Resolver with LRU Cache
 */
export class TokenResolver {
  private theme: ThemeMode
  private tokens: Record<ThemeMode, TokenDefinition>
  private cache: Map<string, string>
  private cacheLimit: number
  private accessOrder: string[]

  constructor(options: ResolverOptions = {}) {
    this.theme = options.theme ?? 'light'
    this.tokens = {
      light: options.tokens ?? pinkTokensLight,
      dark: pinkTokensDark
    }
    this.cache = new Map()
    this.cacheLimit = options.cacheLimit ?? 1000
    this.accessOrder = []
  }

  /**
   * Resolve a token path to its value
   *
   * @param path - Token path (e.g., 'tokens.colors.accent.solid')
   * @returns Resolved token value
   * @throws Error if path is invalid or token not found
   */
  resolve(path: string): string {
    // Validate path format
    if (!isValidTokenPath(path)) {
      throw new Error(`Invalid token path: ${path}. Expected format: tokens.{category}.{...}`)
    }

    // Generate cache key
    const cacheKey = `${this.theme}:${path}`

    // Check cache
    if (this.cache.has(cacheKey)) {
      this.updateAccessOrder(cacheKey)
      return this.cache.get(cacheKey)!
    }

    // Resolve token
    const value = this.resolveToken(path)

    if (value === undefined) {
      throw new Error(`Token not found: ${path}`)
    }

    // Cache the result
    this.addToCache(cacheKey, value)

    return value
  }

  /**
   * Internal token resolution logic
   */
  private resolveToken(path: string): string | undefined {
    // Remove 'tokens.' prefix for lookup
    const lookupPath = path.replace(/^tokens\./, '')

    // Get current theme tokens
    const themeTokens = this.tokens[this.theme]

    // Resolve nested path
    return getNestedValue(themeTokens, lookupPath)
  }

  /**
   * Add value to cache with LRU eviction
   */
  private addToCache(key: string, value: string): void {
    // If cache is full, evict least recently used
    if (this.cache.size >= this.cacheLimit && !this.cache.has(key)) {
      const lruKey = this.accessOrder.shift()
      if (lruKey) {
        this.cache.delete(lruKey)
      }
    }

    this.cache.set(key, value)
    this.updateAccessOrder(key)
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    // Remove key if it exists
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }

    // Add to end (most recently used)
    this.accessOrder.push(key)
  }

  /**
   * Set current theme and clear cache
   */
  setTheme(theme: ThemeMode): void {
    if (this.theme !== theme) {
      this.theme = theme
      this.clearCache()
    }
  }

  /**
   * Get current theme
   */
  getTheme(): ThemeMode {
    return this.theme
  }

  /**
   * Set custom token value
   */
  setToken(path: string, value: string): void {
    if (!isValidTokenPath(path)) {
      throw new Error(`Invalid token path: ${path}`)
    }

    // Remove 'tokens.' prefix
    const lookupPath = path.replace(/^tokens\./, '')
    const keys = lookupPath.split('.')

    // Set value in current theme tokens
    let current: any = this.tokens[this.theme]
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value

    // Invalidate cache for this path
    const cacheKey = `${this.theme}:${path}`
    this.cache.delete(cacheKey)
  }

  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; limit: number; hitRate: number } {
    return {
      size: this.cache.size,
      limit: this.cacheLimit,
      hitRate: this.cache.size > 0 ? this.cache.size / this.cacheLimit : 0
    }
  }

  /**
   * Batch resolve multiple tokens
   */
  resolveMany(paths: string[]): Record<string, string> {
    const results: Record<string, string> = {}

    for (const path of paths) {
      try {
        results[path] = this.resolve(path)
      } catch (error) {
        // Skip invalid paths
        console.warn(`Failed to resolve token: ${path}`, error)
      }
    }

    return results
  }

  /**
   * Get all tokens for current theme
   */
  getAllTokens(): TokenDefinition {
    return this.tokens[this.theme]
  }
}

/**
 * Global singleton resolver instance
 */
export const resolver = new TokenResolver()
