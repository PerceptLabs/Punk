/**
 * Punk Theme Provider
 *
 * React context provider for theme management with TokiForge integration.
 * Handles theme switching, CSS variable injection, and provides theme context.
 *
 * @example
 * ```tsx
 * <PunkThemeProvider theme="light">
 *   <App />
 * </PunkThemeProvider>
 * ```
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { TokenResolver, type ThemeMode } from './resolver'
import { pinkTokensLight, pinkTokensDark, type TokenDefinition } from './tokens'
import { generateCSSVariables, injectCSSVariables, updateRootCSSVariables } from './css-vars'

export interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  resolver: TokenResolver
  tokens: TokenDefinition
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface PunkThemeProviderProps {
  /**
   * Initial theme mode
   * @default 'light'
   */
  theme?: ThemeMode

  /**
   * Custom token definition (overrides default)
   */
  tokens?: TokenDefinition

  /**
   * Whether to persist theme preference to localStorage
   * @default true
   */
  persistTheme?: boolean

  /**
   * localStorage key for theme persistence
   * @default 'punk-theme'
   */
  storageKey?: string

  /**
   * Whether to inject CSS variables into DOM
   * @default true
   */
  injectCSS?: boolean

  /**
   * ID for injected style element
   * @default 'punk-theme-vars'
   */
  styleElementId?: string

  /**
   * Callback when theme changes
   */
  onThemeChange?: (theme: ThemeMode) => void

  children: React.ReactNode
}

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme(
  defaultTheme: ThemeMode,
  persistTheme: boolean,
  storageKey: string
): ThemeMode {
  if (!persistTheme || typeof window === 'undefined') {
    return defaultTheme
  }

  // Try localStorage first
  const stored = localStorage.getItem(storageKey)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return defaultTheme
}

/**
 * Punk Theme Provider Component
 */
export function PunkThemeProvider({
  theme: initialTheme = 'light',
  tokens: customTokens,
  persistTheme = true,
  storageKey = 'punk-theme',
  injectCSS = true,
  styleElementId = 'punk-theme-vars',
  onThemeChange,
  children
}: PunkThemeProviderProps) {
  // Initialize theme
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    getInitialTheme(initialTheme, persistTheme, storageKey)
  )

  // Create resolver instance
  const resolver = useMemo(() => {
    return new TokenResolver({
      theme,
      tokens: customTokens
    })
  }, [theme, customTokens])

  // Get current tokens
  const tokens = useMemo(() => {
    return theme === 'dark' ? pinkTokensDark : (customTokens ?? pinkTokensLight)
  }, [theme, customTokens])

  // Set theme with side effects
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)

    // Update resolver
    resolver.setTheme(newTheme)

    // Persist to localStorage
    if (persistTheme && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }

    // Update data-theme attribute
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }

    // Call onChange callback
    onThemeChange?.(newTheme)
  }, [resolver, persistTheme, storageKey, onThemeChange])

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  // Inject CSS variables on mount and theme change
  useEffect(() => {
    if (!injectCSS || typeof document === 'undefined') {
      return
    }

    const cssVars = generateCSSVariables(tokens, theme)

    // Inject via style element
    injectCSSVariables(cssVars, styleElementId)

    // Also update root element directly for immediate access
    updateRootCSSVariables(cssVars)

    // Set data-theme attribute
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme, tokens, injectCSS, styleElementId])

  // Listen for system theme changes
  useEffect(() => {
    if (!persistTheme || typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if no explicit preference is stored
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [persistTheme, storageKey, setTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      resolver,
      tokens
    }),
    [theme, setTheme, toggleTheme, resolver, tokens]
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 *
 * @returns Theme context value
 * @throws Error if used outside PunkThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a PunkThemeProvider')
  }

  return context
}

/**
 * Hook to resolve token values
 *
 * @returns Token resolver function
 */
export function useTokenResolver() {
  const { resolver } = useTheme()

  return useCallback(
    (path: string) => {
      try {
        return resolver.resolve(path)
      } catch (error) {
        console.error(`Failed to resolve token: ${path}`, error)
        return ''
      }
    },
    [resolver]
  )
}

/**
 * Hook to get token value with memoization
 *
 * @param path - Token path
 * @returns Resolved token value
 */
export function useToken(path: string): string {
  const { resolver } = useTheme()

  return useMemo(() => {
    try {
      return resolver.resolve(path)
    } catch (error) {
      console.error(`Failed to resolve token: ${path}`, error)
      return ''
    }
  }, [path, resolver])
}

/**
 * Hook to get multiple token values
 *
 * @param paths - Array of token paths
 * @returns Record of resolved token values
 */
export function useTokens(paths: string[]): Record<string, string> {
  const { resolver } = useTheme()

  return useMemo(() => {
    return resolver.resolveMany(paths)
  }, [paths, resolver])
}
