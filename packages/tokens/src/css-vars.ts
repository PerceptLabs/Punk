/**
 * CSS Variable Generator
 *
 * Generates CSS custom properties from design tokens for runtime theming.
 * Supports light/dark themes and dynamic injection.
 *
 * @example
 * ```typescript
 * const cssVars = generateCSSVariables(pinkTokens, 'light')
 * injectCSSVariables(cssVars)
 * ```
 */

import type { TokenDefinition, ColorScale } from './tokens'

export interface CSSVariableMap {
  [key: string]: string
}

/**
 * Flatten nested object into dot notation
 */
function flattenObject(
  obj: any,
  prefix: string = '',
  result: Record<string, string> = {}
): Record<string, string> {
  for (const key in obj) {
    const value = obj[key]
    const newKey = prefix ? `${prefix}-${key}` : key

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result)
    } else if (typeof value === 'string') {
      result[newKey] = value
    }
  }

  return result
}

/**
 * Convert color scale to CSS variables
 */
function colorScaleToCSSVars(scale: ColorScale, prefix: string): Record<string, string> {
  const vars: Record<string, string> = {}

  // Numeric steps (1-12)
  for (let i = 1; i <= 12; i++) {
    const key = i as keyof ColorScale
    if (typeof scale[key] === 'string') {
      vars[`${prefix}-${i}`] = scale[key] as string
    }
  }

  // Semantic aliases
  const aliases = [
    'subtle', 'subtleHover', 'surface', 'border', 'borderHover',
    'solid', 'solidHover', 'text', 'textContrast'
  ]

  for (const alias of aliases) {
    if (alias in scale) {
      vars[`${prefix}-${alias}`] = scale[alias as keyof ColorScale] as string
    }
  }

  return vars
}

/**
 * Generate CSS variables from token definition
 *
 * @param tokens - Token definition
 * @param theme - Theme mode (for naming)
 * @returns Object mapping CSS variable names to values
 */
export function generateCSSVariables(
  tokens: TokenDefinition,
  theme: 'light' | 'dark' = 'light'
): CSSVariableMap {
  const cssVars: CSSVariableMap = {}

  // Colors
  const colorScales = ['accent', 'neutral', 'critical', 'success', 'warning', 'info'] as const
  for (const scaleName of colorScales) {
    const scale = tokens.colors[scaleName]
    Object.assign(cssVars, colorScaleToCSSVars(scale, scaleName))
  }

  // Background colors
  Object.assign(cssVars, flattenObject(tokens.colors.background, 'background'))

  // Text colors
  Object.assign(cssVars, flattenObject(tokens.colors.text, 'text'))

  // Space
  Object.assign(cssVars, flattenObject(tokens.space, 'space'))

  // Radii
  Object.assign(cssVars, flattenObject(tokens.radii, 'radii'))

  // Typography
  Object.assign(cssVars, flattenObject(tokens.typography.fontSizes, 'fontSize'))
  Object.assign(cssVars, flattenObject(tokens.typography.fontWeights, 'fontWeight'))
  Object.assign(cssVars, flattenObject(tokens.typography.lineHeights, 'lineHeight'))
  Object.assign(cssVars, flattenObject(tokens.typography.letterSpacing, 'letterSpacing'))
  Object.assign(cssVars, flattenObject(tokens.typography.fontFamily, 'fontFamily'))

  // Shadows
  Object.assign(cssVars, flattenObject(tokens.shadows, 'shadow'))

  // Animations
  Object.assign(cssVars, flattenObject(tokens.animations.duration, 'duration'))
  Object.assign(cssVars, flattenObject(tokens.animations.easing, 'easing'))

  return cssVars
}

/**
 * Generate CSS string with variable declarations
 *
 * @param cssVars - CSS variable map
 * @param selector - CSS selector (default: ':root')
 * @returns CSS string
 */
export function generateCSSString(
  cssVars: CSSVariableMap,
  selector: string = ':root'
): string {
  let css = `${selector} {\n`

  for (const [key, value] of Object.entries(cssVars)) {
    css += `  --${key}: ${value};\n`
  }

  css += '}\n'

  return css
}

/**
 * Inject CSS variables into document
 *
 * @param cssVars - CSS variable map
 * @param elementId - ID for style element
 */
export function injectCSSVariables(
  cssVars: CSSVariableMap,
  elementId: string = 'punk-theme-vars'
): void {
  // Remove existing style element if it exists
  const existing = document.getElementById(elementId)
  if (existing) {
    existing.remove()
  }

  // Create new style element
  const style = document.createElement('style')
  style.id = elementId
  style.textContent = generateCSSString(cssVars)

  // Append to head
  document.head.appendChild(style)
}

/**
 * Update CSS variables on document root
 *
 * @param cssVars - CSS variable map
 */
export function updateRootCSSVariables(cssVars: CSSVariableMap): void {
  const root = document.documentElement

  for (const [key, value] of Object.entries(cssVars)) {
    root.style.setProperty(`--${key}`, value)
  }
}

/**
 * Remove all CSS variables from document root
 *
 * @param cssVars - CSS variable map (to know which vars to remove)
 */
export function removeRootCSSVariables(cssVars: CSSVariableMap): void {
  const root = document.documentElement

  for (const key of Object.keys(cssVars)) {
    root.style.removeProperty(`--${key}`)
  }
}

/**
 * Get computed CSS variable value
 *
 * @param varName - CSS variable name (without -- prefix)
 * @param element - Element to compute from (default: document.documentElement)
 * @returns Computed value or empty string if not found
 */
export function getCSSVariable(
  varName: string,
  element: HTMLElement = document.documentElement
): string {
  return getComputedStyle(element).getPropertyValue(`--${varName}`).trim()
}

/**
 * Set CSS variable value
 *
 * @param varName - CSS variable name (without -- prefix)
 * @param value - New value
 * @param element - Element to set on (default: document.documentElement)
 */
export function setCSSVariable(
  varName: string,
  value: string,
  element: HTMLElement = document.documentElement
): void {
  element.style.setProperty(`--${varName}`, value)
}
