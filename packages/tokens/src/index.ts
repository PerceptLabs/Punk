/**
 * @punk/tokens - TokiForge Integration for Design Tokens
 *
 * Complete design token system with TokiForge runtime resolution,
 * theme switching, and CSS variable generation.
 *
 * @example
 * ```tsx
 * import { PunkThemeProvider, useTheme, useToken } from '@punk/tokens'
 *
 * function App() {
 *   return (
 *     <PunkThemeProvider theme="light">
 *       <MyComponent />
 *     </PunkThemeProvider>
 *   )
 * }
 *
 * function MyComponent() {
 *   const { theme, toggleTheme, resolver } = useTheme()
 *   const accentColor = useToken('tokens.colors.accent.solid')
 *
 *   return (
 *     <button
 *       style={{ backgroundColor: accentColor }}
 *       onClick={toggleTheme}
 *     >
 *       Current theme: {theme}
 *     </button>
 *   )
 * }
 * ```
 */

// Token definitions
export {
  pinkTokens,
  pinkTokensLight,
  pinkTokensDark,
  type TokenDefinition,
  type ColorTokens,
  type ColorScale,
  type BackgroundColors,
  type TextColors,
  type SpaceTokens,
  type RadiiTokens,
  type TypographyTokens,
  type FontSizeTokens,
  type FontWeightTokens,
  type LineHeightTokens,
  type LetterSpacingTokens,
  type FontFamilyTokens,
  type ShadowTokens,
  type AnimationTokens
} from './tokens'

// Token resolver
export {
  TokenResolver,
  resolver,
  type ThemeMode,
  type ResolverOptions
} from './resolver'

// Theme provider
export {
  PunkThemeProvider,
  useTheme,
  useTokenResolver,
  useToken,
  useTokens,
  type ThemeContextValue,
  type PunkThemeProviderProps
} from './theme-provider'

// CSS variable generation
export {
  generateCSSVariables,
  generateCSSString,
  injectCSSVariables,
  updateRootCSSVariables,
  removeRootCSSVariables,
  getCSSVariable,
  setCSSVariable,
  type CSSVariableMap
} from './css-vars'

// Utilities
export {
  cn,
  isValidTokenPath,
  parseTokenPath,
  isColorToken,
  isSpaceToken,
  isRadiusToken,
  isTypographyToken,
  isShadowToken,
  isAnimationToken,
  getTokenCategory,
  tokenPathToCSSVar,
  cssVarToTokenPath,
  formatCSSValue,
  debounce,
  memoize
} from './utils'

// Type definitions
export type {
  ColorToken,
  SpaceToken,
  RadiusToken,
  FontSizeToken,
  FontWeightToken,
  LineHeightToken,
  LetterSpacingToken,
  FontFamilyToken,
  ShadowToken,
  DurationToken,
  EasingToken,
  TokenPath
} from './types'
