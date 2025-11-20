/**
 * Token Resolver Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TokenResolver } from '../src/resolver'
import { pinkTokensLight, pinkTokensDark } from '../src/tokens'

describe('TokenResolver', () => {
  let resolver: TokenResolver

  beforeEach(() => {
    resolver = new TokenResolver()
  })

  describe('resolve', () => {
    it('should resolve valid color tokens', () => {
      const color = resolver.resolve('tokens.colors.accent.solid')
      expect(color).toBe('#FF5AC4')
    })

    it('should resolve valid space tokens', () => {
      const space = resolver.resolve('tokens.space.4')
      expect(space).toBe('16px')
    })

    it('should resolve valid radius tokens', () => {
      const radius = resolver.resolve('tokens.radii.md')
      expect(radius).toBe('6px')
    })

    it('should resolve valid typography tokens', () => {
      const fontSize = resolver.resolve('tokens.fontSize.md')
      expect(fontSize).toBe('16px')

      const fontWeight = resolver.resolve('tokens.fontWeight.semibold')
      expect(fontWeight).toBe('600')
    })

    it('should throw error for invalid paths', () => {
      expect(() => resolver.resolve('invalid.path')).toThrow('Invalid token path')
      expect(() => resolver.resolve('tokens.invalid')).toThrow('Invalid token path')
    })

    it('should throw error for non-existent tokens', () => {
      expect(() => resolver.resolve('tokens.colors.nonexistent.token')).toThrow('Token not found')
    })

    it('should resolve nested semantic aliases', () => {
      const subtle = resolver.resolve('tokens.colors.accent.subtle')
      const step2 = resolver.resolve('tokens.colors.accent.2')
      expect(subtle).toBe(step2) // subtle maps to step 2
    })
  })

  describe('theme switching', () => {
    it('should resolve different values for different themes', () => {
      const lightResolver = new TokenResolver({ theme: 'light' })
      const darkResolver = new TokenResolver({ theme: 'dark' })

      const lightColor = lightResolver.resolve('tokens.colors.accent.solid')
      const darkColor = darkResolver.resolve('tokens.colors.accent.solid')

      expect(lightColor).toBe('#FF5AC4')
      expect(darkColor).toBe('#FF5AC4') // Same solid color for both themes
    })

    it('should update resolved values when theme changes', () => {
      const lightBg = resolver.resolve('tokens.colors.background.base')
      expect(lightBg).toBe('#FFFFFF')

      resolver.setTheme('dark')
      const darkBg = resolver.resolve('tokens.colors.background.base')
      expect(darkBg).toBe('#0D0D0D')
    })

    it('should clear cache when theme changes', () => {
      // Resolve in light theme
      resolver.resolve('tokens.colors.accent.solid')
      const stats1 = resolver.getCacheStats()
      expect(stats1.size).toBe(1)

      // Switch theme
      resolver.setTheme('dark')
      const stats2 = resolver.getCacheStats()
      expect(stats2.size).toBe(0) // Cache cleared
    })
  })

  describe('caching', () => {
    it('should cache resolved values', () => {
      // First resolve
      const color1 = resolver.resolve('tokens.colors.accent.solid')

      // Second resolve (should hit cache)
      const color2 = resolver.resolve('tokens.colors.accent.solid')

      expect(color1).toBe(color2)

      const stats = resolver.getCacheStats()
      expect(stats.size).toBe(1)
    })

    it('should respect cache limit', () => {
      const smallResolver = new TokenResolver({ cacheLimit: 2 })

      smallResolver.resolve('tokens.colors.accent.solid')
      smallResolver.resolve('tokens.colors.neutral.solid')
      smallResolver.resolve('tokens.colors.critical.solid')

      const stats = smallResolver.getCacheStats()
      expect(stats.size).toBeLessThanOrEqual(2)
    })

    it('should implement LRU eviction', () => {
      const smallResolver = new TokenResolver({ cacheLimit: 2 })

      smallResolver.resolve('tokens.colors.accent.1')
      smallResolver.resolve('tokens.colors.accent.2')
      smallResolver.resolve('tokens.colors.accent.3') // Should evict accent.1

      const stats = smallResolver.getCacheStats()
      expect(stats.size).toBe(2)
    })

    it('should clear cache manually', () => {
      resolver.resolve('tokens.colors.accent.solid')
      resolver.resolve('tokens.space.4')

      let stats = resolver.getCacheStats()
      expect(stats.size).toBe(2)

      resolver.clearCache()

      stats = resolver.getCacheStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('batch resolution', () => {
    it('should resolve multiple tokens at once', () => {
      const paths = [
        'tokens.colors.accent.solid',
        'tokens.space.4',
        'tokens.radii.md'
      ]

      const results = resolver.resolveMany(paths)

      expect(results['tokens.colors.accent.solid']).toBe('#FF5AC4')
      expect(results['tokens.space.4']).toBe('16px')
      expect(results['tokens.radii.md']).toBe('6px')
    })

    it('should skip invalid tokens in batch resolution', () => {
      const paths = [
        'tokens.colors.accent.solid',
        'invalid.path',
        'tokens.space.4'
      ]

      const results = resolver.resolveMany(paths)

      expect(results['tokens.colors.accent.solid']).toBe('#FF5AC4')
      expect(results['tokens.space.4']).toBe('16px')
      expect(results['invalid.path']).toBeUndefined()
    })
  })

  describe('custom token values', () => {
    it('should allow setting custom token values', () => {
      resolver.setToken('tokens.colors.accent.solid', '#00FF00')

      const color = resolver.resolve('tokens.colors.accent.solid')
      expect(color).toBe('#00FF00')
    })

    it('should invalidate cache when setting custom token', () => {
      // Resolve and cache
      resolver.resolve('tokens.colors.accent.solid')
      let stats = resolver.getCacheStats()
      expect(stats.size).toBe(1)

      // Set custom value
      resolver.setToken('tokens.colors.accent.solid', '#00FF00')

      // Cache should not contain old value
      const color = resolver.resolve('tokens.colors.accent.solid')
      expect(color).toBe('#00FF00')
    })
  })

  describe('token access', () => {
    it('should get all tokens for current theme', () => {
      const tokens = resolver.getAllTokens()
      expect(tokens).toBeDefined()
      expect(tokens.colors).toBeDefined()
      expect(tokens.space).toBeDefined()
      expect(tokens.radii).toBeDefined()
    })

    it('should get current theme', () => {
      const theme = resolver.getTheme()
      expect(theme).toBe('light')

      resolver.setTheme('dark')
      expect(resolver.getTheme()).toBe('dark')
    })
  })
})
