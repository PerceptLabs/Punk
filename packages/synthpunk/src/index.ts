/**
 * @punk/synthpunk - Punk Framework AI Engine
 *
 * This package provides AI-powered app generation:
 * - Claude API integration
 * - Prompt engineering for schema generation
 * - Component suggestion and matching
 * - Natural language to schema conversion
 * - Iterative refinement
 */

// Export the main engine
export { EpochEngine, EpochError } from './engine'

// Export provider factory
export { LLMProviderFactory } from './providers'

// Export validation utilities
export { validatePatch, calculateComplexity } from './validation'

// Export prompt utilities
export { SYSTEM_PROMPT, buildUserMessage, buildRecoveryPrompt } from './prompts'

// Export streaming utilities
export { StreamingPatchExtractor } from './streaming'

// Export context utilities
export { createContext, buildComponentRegistry, buildTokenRegistry, updateContextMetrics, estimateTokens } from './context'

// Export logging utilities
export { configureLogging, createLogger, loggers, redact } from './logger'

// Export all types
export type * from './types'
