/**
 * Utilities Tests
 */

import { describe, it, expect } from 'vitest'
import {
  cn,
  isValidTokenPath,
  parseTokenPath,
  isColorToken,
  isSpaceToken,
  isRadiusToken,
  isTypographyToken,
  getTokenCategory,
  formatCSSValue
} from '../src/utils'

describe('Utils', () => {
  describe('cn (classnames)', () => {
    it('should combine string classes', () => {
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should filter out falsy values', () => {
      expect(cn('foo', false, 'bar', null, 'baz', undefined)).toBe('foo bar baz')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const isDisabled = false

      expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active')
    })

    it('should handle array of classes', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
    })

    it('should handle object class maps', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    it('should handle mixed inputs', () => {
      expect(cn(
        'base',
        ['foo', 'bar'],
        { active: true, disabled: false },
        'end'
      )).toBe('base foo bar active end')
    })

    it('should handle nested arrays', () => {
      expect(cn(['foo', ['bar', 'baz']], 'qux')).toBe('foo bar baz qux')
    })
  })

  describe('isValidTokenPath', () => {
    it('should validate correct token paths', () => {
      expect(isValidTokenPath('tokens.colors.accent.solid')).toBe(true)
      expect(isValidTokenPath('tokens.space.4')).toBe(true)
      expect(isValidTokenPath('tokens.radii.md')).toBe(true)
    })

    it('should reject invalid token paths', () => {
      expect(isValidTokenPath('accent.solid')).toBe(false)
      expect(isValidTokenPath('tokens')).toBe(false)
      expect(isValidTokenPath('tokens.colors')).toBe(false)
      expect(isValidTokenPath('')).toBe(false)
      expect(isValidTokenPath('not.a.token.path')).toBe(false)
    })

    it('should reject non-string inputs', () => {
      expect(isValidTokenPath(null as any)).toBe(false)
      expect(isValidTokenPath(undefined as any)).toBe(false)
      expect(isValidTokenPath(123 as any)).toBe(false)
    })

    it('should reject paths with empty segments', () => {
      expect(isValidTokenPath('tokens..colors.accent')).toBe(false)
      expect(isValidTokenPath('tokens.colors.')).toBe(false)
    })
  })

  describe('parseTokenPath', () => {
    it('should parse valid token paths', () => {
      const result = parseTokenPath('tokens.colors.accent.solid')

      expect(result).toEqual({
        category: 'colors',
        subcategory: 'accent',
        name: 'solid',
        path: ['colors', 'accent', 'solid']
      })
    })

    it('should handle paths without subcategory', () => {
      const result = parseTokenPath('tokens.space.4')

      expect(result).toEqual({
        category: 'space',
        subcategory: '4',
        name: '4',
        path: ['space', '4']
      })
    })

    it('should return null for invalid paths', () => {
      expect(parseTokenPath('invalid.path')).toBeNull()
      expect(parseTokenPath('tokens.invalid')).toBeNull()
    })
  })

  describe('token type guards', () => {
    it('should identify color tokens', () => {
      expect(isColorToken('tokens.colors.accent.solid')).toBe(true)
      expect(isColorToken('tokens.space.4')).toBe(false)
    })

    it('should identify space tokens', () => {
      expect(isSpaceToken('tokens.space.4')).toBe(true)
      expect(isSpaceToken('tokens.colors.accent.solid')).toBe(false)
    })

    it('should identify radius tokens', () => {
      expect(isRadiusToken('tokens.radii.md')).toBe(true)
      expect(isRadiusToken('tokens.space.4')).toBe(false)
    })

    it('should identify typography tokens', () => {
      expect(isTypographyToken('tokens.fontSize.md')).toBe(true)
      expect(isTypographyToken('tokens.fontWeight.bold')).toBe(true)
      expect(isTypographyToken('tokens.lineHeight.normal')).toBe(true)
      expect(isTypographyToken('tokens.letterSpacing.wide')).toBe(true)
      expect(isTypographyToken('tokens.fontFamily.sans')).toBe(true)
      expect(isTypographyToken('tokens.colors.accent.solid')).toBe(false)
    })
  })

  describe('getTokenCategory', () => {
    it('should extract category from token path', () => {
      expect(getTokenCategory('tokens.colors.accent.solid')).toBe('colors')
      expect(getTokenCategory('tokens.space.4')).toBe('space')
      expect(getTokenCategory('tokens.radii.md')).toBe('radii')
    })

    it('should return null for invalid paths', () => {
      expect(getTokenCategory('invalid.path')).toBeNull()
    })
  })

  describe('formatCSSValue', () => {
    it('should add px to numbers', () => {
      expect(formatCSSValue(16)).toBe('16px')
      expect(formatCSSValue(0)).toBe('0px')
    })

    it('should preserve values with units', () => {
      expect(formatCSSValue('16px')).toBe('16px')
      expect(formatCSSValue('1rem')).toBe('1rem')
      expect(formatCSSValue('50%')).toBe('50%')
      expect(formatCSSValue('100vh')).toBe('100vh')
    })

    it('should add px to number strings without units', () => {
      expect(formatCSSValue('16')).toBe('16px')
      expect(formatCSSValue('16.5')).toBe('16.5px')
    })

    it('should preserve colors and keywords', () => {
      expect(formatCSSValue('#FF5AC4')).toBe('#FF5AC4')
      expect(formatCSSValue('auto')).toBe('auto')
      expect(formatCSSValue('inherit')).toBe('inherit')
      expect(formatCSSValue('none')).toBe('none')
    })
  })
})
