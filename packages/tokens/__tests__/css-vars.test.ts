/**
 * CSS Variable Generation Tests
 */

import { describe, it, expect } from 'vitest'
import {
  generateCSSVariables,
  generateCSSString,
  tokenPathToCSSVar,
  cssVarToTokenPath
} from '../src'
import { pinkTokensLight } from '../src/tokens'

describe('CSS Variable Generation', () => {
  describe('generateCSSVariables', () => {
    it('should generate CSS variables from tokens', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars).toBeDefined()
      expect(typeof cssVars).toBe('object')
    })

    it('should include color scale variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['accent-1']).toBe('#FFF5FB')
      expect(cssVars['accent-solid']).toBe('#FF5AC4')
      expect(cssVars['accent-text']).toBe('#CC3A9D')
    })

    it('should include space variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['space-0']).toBe('0px')
      expect(cssVars['space-4']).toBe('16px')
      expect(cssVars['space-8']).toBe('32px')
    })

    it('should include radius variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['radii-none']).toBe('0px')
      expect(cssVars['radii-md']).toBe('6px')
      expect(cssVars['radii-full']).toBe('9999px')
    })

    it('should include typography variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['fontSize-md']).toBe('16px')
      expect(cssVars['fontWeight-semibold']).toBe('600')
      expect(cssVars['lineHeight-normal']).toBe('1.5')
    })

    it('should include shadow variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['shadow-none']).toBe('none')
      expect(cssVars['shadow-md']).toBeDefined()
    })

    it('should include animation variables', () => {
      const cssVars = generateCSSVariables(pinkTokensLight, 'light')

      expect(cssVars['duration-150']).toBe('150ms')
      expect(cssVars['easing-easeInOut']).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    })
  })

  describe('generateCSSString', () => {
    it('should generate valid CSS string', () => {
      const cssVars = {
        'accent-solid': '#FF5AC4',
        'space-4': '16px',
        'radii-md': '6px'
      }

      const cssString = generateCSSString(cssVars)

      expect(cssString).toContain(':root {')
      expect(cssString).toContain('--accent-solid: #FF5AC4;')
      expect(cssString).toContain('--space-4: 16px;')
      expect(cssString).toContain('--radii-md: 6px;')
      expect(cssString).toContain('}')
    })

    it('should support custom selector', () => {
      const cssVars = { 'accent-solid': '#FF5AC4' }
      const cssString = generateCSSString(cssVars, '[data-theme="light"]')

      expect(cssString).toContain('[data-theme="light"] {')
    })
  })

  describe('tokenPathToCSSVar', () => {
    it('should convert token path to CSS variable name', () => {
      expect(tokenPathToCSSVar('tokens.colors.accent.solid')).toBe('colors-accent-solid')
      expect(tokenPathToCSSVar('tokens.space.4')).toBe('space-4')
      expect(tokenPathToCSSVar('tokens.radii.md')).toBe('radii-md')
    })

    it('should throw error for invalid paths', () => {
      expect(() => tokenPathToCSSVar('invalid.path')).toThrow('Invalid token path')
    })
  })

  describe('cssVarToTokenPath', () => {
    it('should convert CSS variable name to token path', () => {
      expect(cssVarToTokenPath('colors-accent-solid')).toBe('tokens.colors.accent.solid')
      expect(cssVarToTokenPath('space-4')).toBe('tokens.space.4')
      expect(cssVarToTokenPath('radii-md')).toBe('tokens.radii.md')
    })

    it('should handle -- prefix', () => {
      expect(cssVarToTokenPath('--accent-solid')).toBe('tokens.accent.solid')
    })
  })
})
