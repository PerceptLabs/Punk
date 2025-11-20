/**
 * SynthPunk - Epoch AI Schema Generation Engine
 * Core Type Definitions
 */

// ========== Schema Patch Types ==========

export type SchemaPatchOp = 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test'

export interface SchemaPatch {
  op: SchemaPatchOp
  path: string
  value?: unknown
  from?: string
  meta?: {
    id?: string
    sequence?: number
    validated?: boolean
    complexity?: {
      nodes: number
      depth: number
      bindings: number
    }
  }
}

// ========== Punk Schema Types ==========

export interface PunkSchema {
  type: string
  id: string
  props?: Record<string, unknown>
  children?: PunkSchema[]
  text?: string
  data?: unknown
}

// ========== Component Registry Types ==========

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'object' | 'array'
  required?: boolean
  description?: string
  defaultValue?: unknown
  enum?: unknown[]
  validation?: string
}

export interface ComponentSchema {
  type: string
  label: string
  icon: string
  props: Record<string, PropertySchema>
  children?: boolean
  maxChildren?: number
}

// ========== Design Token Types ==========

export type TokenType = 'spacing' | 'color' | 'typography' | 'shadow' | 'radius'

export interface DesignToken {
  name: string
  value: string | number | object
  type: TokenType
  group: string
  deprecated?: boolean
}

// ========== Data Model Types ==========

export interface DataField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  required?: boolean
  description?: string
  fields?: Record<string, DataField>
}

export interface DataModel {
  name: string
  fields: Record<string, DataField>
  example?: Record<string, unknown>
}

// ========== Conversation Types ==========

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// ========== Context Types ==========

export interface EpochContext {
  componentRegistry: Map<string, ComponentSchema>
  tokenRegistry: Map<string, DesignToken>
  dataModels: DataModel[]
  conversationHistory: ConversationMessage[]
  tokenBudget: number
  tokenUsed: number
  complexityBudget: number
  complexityUsed: number
  userPreferences?: {
    colorScheme?: 'light' | 'dark'
    spacing?: 'compact' | 'normal' | 'spacious'
    variant?: string
  }
  sessionId: string
  userId?: string
  createdAt: number
}

// ========== Configuration Types ==========

export type LLMProviderType = 'anthropic' | 'openai' | 'ollama'

export interface EpochConfig {
  provider: LLMProviderType
  apiKey?: string
  ollama?: {
    baseUrl: string
    model: string
  }
  maxRetries: number
  retryDelayMs: number
  chunkTimeoutMs: number
  validateChunks: boolean
}

export interface GenerationOptions {
  includeHistory: boolean
  maxPatches: number
  timeoutMs: number
  fallbackToSimpler: boolean
}

// ========== Validation Types ==========

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
  metrics?: {
    complexity: number
    depth: number
    tokenUsage: number
  }
}

// ========== Provider Types ==========

export interface LLMProvider {
  name: string
  model: string
  maxTokens: number
  supportsStreaming: boolean
  costPer1kTokens: number
  config: Record<string, unknown>

  validateConfig(): Promise<boolean>
  generateSchema(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): AsyncGenerator<string>
  estimateTokens(text: string): number
}

// ========== Budget Types ==========

export interface TokenBudgetTracker {
  total: number
  systemPrompt: number
  context: number
  userMessage: number
  reserved: number
  remaining: number
}

// ========== Error Types ==========

export enum ErrorCategory {
  MALFORMED_JSON = 'MALFORMED_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  CONTEXT_MISMATCH = 'CONTEXT_MISMATCH',
}

export type RecoveryAction =
  | { type: 'retry'; delayMs: number; maxRetries: number }
  | { type: 'fallback'; strategy: 'minimal' | 'previous' | 'empty' }
  | { type: 'adjust'; changes: Partial<EpochContext> }
  | { type: 'fail'; message: string }

export interface ErrorRecoveryStrategy {
  classify(error: Error): ErrorCategory
  canRecover(category: ErrorCategory): boolean
  recover(category: ErrorCategory, context: EpochContext): RecoveryAction
}

// ========== Progress Types ==========

export interface GenerationProgress {
  patchesGenerated: number
  tokensUsed: number
  complexityUsed: number
  startTime: number
  estimatedTimeRemaining: number
}

// ========== Cost Types ==========

export interface GenerationCost {
  provider: string
  inputTokens: number
  outputTokens: number
  costPerM: number
  totalCost: number
}
