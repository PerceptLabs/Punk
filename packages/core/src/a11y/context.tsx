/**
 * @punk/core - Accessibility Context
 * React context for accessibility configuration
 */

import { createContext, useContext } from 'react'

/**
 * Accessibility enforcement mode
 * - off: No accessibility validation or warnings
 * - relaxed: Warn about missing accessibility metadata but don't block rendering
 * - strict: Throw errors when required accessibility metadata is missing
 */
export type A11yMode = 'off' | 'relaxed' | 'strict'

/**
 * Accessibility configuration
 */
export interface A11yConfig {
  /** Accessibility enforcement mode */
  mode: A11yMode
}

/**
 * Default accessibility configuration (relaxed mode)
 */
const defaultConfig: A11yConfig = { mode: 'relaxed' }

/**
 * Accessibility configuration context
 */
export const A11yContext = createContext<A11yConfig>(defaultConfig)

/**
 * Hook to access the current accessibility configuration.
 *
 * @returns The current A11yConfig from context
 */
export function useA11yConfig(): A11yConfig {
  return useContext(A11yContext)
}
