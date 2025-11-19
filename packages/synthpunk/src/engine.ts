/**
 * SynthPunk - Epoch AI Schema Generation Engine
 * Main Engine Implementation
 */

import {
  EpochConfig,
  EpochContext,
  GenerationOptions,
  SchemaPatch,
  PunkSchema,
  LLMProvider,
  ErrorCategory,
  RecoveryAction,
} from './types'
import { LLMProviderFactory } from './providers'
import { validatePatch, calculateComplexity } from './validation'
import { SYSTEM_PROMPT, buildUserMessage, buildRecoveryPrompt } from './prompts'
import { StreamingPatchExtractor } from './streaming'
import { updateContextMetrics, estimateTokens } from './context'

/**
 * Epoch Error Class
 */
export class EpochError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'EpochError'
  }
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Partial<EpochConfig> = {
  maxRetries: 3,
  retryDelayMs: 100,
  chunkTimeoutMs: 30000,
  validateChunks: true,
}

/**
 * Default generation options
 */
const DEFAULT_OPTIONS: GenerationOptions = {
  includeHistory: true,
  maxPatches: 500,
  timeoutMs: 60000,
  fallbackToSimpler: true,
}

/**
 * Main Epoch Engine - AI Schema Generation
 */
export class EpochEngine {
  private config: EpochConfig
  private provider: LLMProvider
  private cache: Map<string, SchemaPatch[]>

  constructor(config: Partial<EpochConfig> & { provider: EpochConfig['provider'] }) {
    this.config = { ...DEFAULT_CONFIG, ...config } as EpochConfig
    this.provider = LLMProviderFactory.create(this.config)
    this.cache = new Map()
  }

  /**
   * Main generation method - streams schema patches
   */
  async *generateSchema(
    userPrompt: string,
    context: EpochContext,
    options: Partial<GenerationOptions> = {}
  ): AsyncGenerator<SchemaPatch> {
    const opts: GenerationOptions = { ...DEFAULT_OPTIONS, ...options }

    // 1. Validate input
    this.validateInput(userPrompt, context)

    // 2. Check cache
    const cacheKey = this.getCacheKey(userPrompt, context)
    if (this.cache.has(cacheKey)) {
      yield* this.cache.get(cacheKey)!
      return
    }

    // 3. Prepare prompts
    const systemPrompt = SYSTEM_PROMPT
    const userMessage = buildUserMessage(userPrompt, context, opts)

    // 4. Stream from LLM with retry
    const patches: SchemaPatch[] = []
    let retries = 0
    const errors: string[] = []

    while (retries < this.config.maxRetries) {
      try {
        for await (const patch of this.streamFromLLM(
          systemPrompt,
          userMessage,
          context,
          opts
        )) {
          // Validate patch
          if (this.config.validateChunks) {
            const validation = await validatePatch(patch, context)

            if (!validation.valid) {
              console.warn(`Invalid patch: ${validation.errors.join(', ')}`)
              errors.push(...validation.errors)
              continue
            }

            // Update complexity budget
            const complexity = calculateComplexity(patch)
            context.complexityUsed += complexity
          }

          patches.push(patch)
          yield patch

          if (patches.length >= opts.maxPatches) {
            console.warn(`Reached max patches limit: ${opts.maxPatches}`)
            break
          }
        }

        // Success - cache results
        this.cache.set(cacheKey, patches)
        return
      } catch (error) {
        retries++
        errors.push((error as Error).message)

        console.error(`Generation attempt ${retries} failed:`, error)

        if (retries >= this.config.maxRetries) {
          if (opts.fallbackToSimpler) {
            // Fallback to minimal schema
            console.warn('Using fallback schema after max retries')
            yield* this.generateFallbackSchema(userPrompt, context)
          } else {
            throw new EpochError(
              `Generation failed after ${retries} retries`,
              'GENERATION_FAILED',
              error
            )
          }
          return
        }

        // Exponential backoff
        await this.delay(this.config.retryDelayMs * Math.pow(2, retries - 1))

        // Update system prompt with recovery instructions
        const recoveryPrompt = buildRecoveryPrompt(errors)
        // Note: In retry, we'd use recoveryPrompt instead of systemPrompt
      }
    }
  }

  /**
   * Non-streaming version - returns complete schema
   */
  async generateComplete(
    userPrompt: string,
    context: EpochContext,
    options: Partial<GenerationOptions> = {}
  ): Promise<PunkSchema | null> {
    const patches: SchemaPatch[] = []

    for await (const patch of this.generateSchema(userPrompt, context, options)) {
      patches.push(patch)
    }

    // Find root patch
    const rootPatch = patches.find((p) => p.path === '/root' && p.op === 'add')
    if (!rootPatch || !rootPatch.value) {
      return null
    }

    return rootPatch.value as PunkSchema
  }

  /**
   * Stream patches from the LLM provider
   */
  private async *streamFromLLM(
    systemPrompt: string,
    userMessage: string,
    context: EpochContext,
    options: GenerationOptions
  ): AsyncGenerator<SchemaPatch> {
    const extractor = new StreamingPatchExtractor()
    let totalTokens = 0

    try {
      for await (const chunk of this.provider.generateSchema(
        systemPrompt,
        userMessage,
        context.conversationHistory
      )) {
        totalTokens += estimateTokens(chunk)

        // Extract complete patches from chunk
        const patches = extractor.process(chunk)

        for (const patch of patches) {
          yield patch
        }
      }

      // Update context metrics
      updateContextMetrics(context, totalTokens, 0)
    } catch (error) {
      throw new EpochError(
        `Provider streaming failed: ${(error as Error).message}`,
        'PROVIDER_ERROR',
        error
      )
    }
  }

  /**
   * Generate a minimal fallback schema when LLM fails
   */
  private async *generateFallbackSchema(
    userPrompt: string,
    context: EpochContext
  ): AsyncGenerator<SchemaPatch> {
    // Extract key concepts from prompt to build minimal schema
    const keywords = this.extractKeywords(userPrompt)
    const componentType = this.inferComponentType(keywords)

    yield {
      op: 'add',
      path: '/root',
      value: {
        type: componentType,
        id: 'root',
        props: this.buildMinimalProps(componentType),
        children: [
          {
            type: 'Text',
            id: 'fallback-message',
            text: `Content placeholder: ${userPrompt.substring(0, 100)}`,
            props: { size: 'body' },
          },
        ],
      },
    }
  }

  /**
   * Extract keywords from user prompt
   */
  private extractKeywords(prompt: string): string[] {
    return prompt
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
  }

  /**
   * Infer component type from keywords
   */
  private inferComponentType(keywords: string[]): string {
    if (keywords.some((k) => ['form', 'input', 'field'].includes(k))) {
      return 'Form'
    }
    if (keywords.some((k) => ['button', 'action', 'submit'].includes(k))) {
      return 'Button'
    }
    if (keywords.some((k) => ['list', 'table', 'data', 'grid'].includes(k))) {
      return 'DataGrid'
    }
    if (keywords.some((k) => ['card', 'panel'].includes(k))) {
      return 'Card'
    }
    return 'Container'
  }

  /**
   * Build minimal props for component type
   */
  private buildMinimalProps(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      Form: { layout: 'vertical', spacing: 'md' },
      Button: { variant: 'primary', size: 'md' },
      DataGrid: { striped: true, columns: [], data: '[]' },
      Card: { padding: 'md', shadow: 'md' },
      Container: { padding: 'md', direction: 'column' },
    }
    return defaults[componentType] || { padding: 'md' }
  }

  /**
   * Validate input before generation
   */
  private validateInput(prompt: string, context: EpochContext): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new EpochError('User prompt cannot be empty', 'INVALID_INPUT')
    }
    if (context.tokenBudget < 1000) {
      throw new EpochError('Insufficient token budget', 'BUDGET_ERROR')
    }
    if (!context.componentRegistry || context.componentRegistry.size === 0) {
      throw new EpochError('Component registry is empty', 'INVALID_CONTEXT')
    }
  }

  /**
   * Generate cache key for prompt + context
   */
  private getCacheKey(prompt: string, context: EpochContext): string {
    return `${prompt}:${context.componentRegistry.size}:${context.dataModels.length}:${context.sessionId}`
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get provider info
   */
  getProviderInfo(): { name: string; model: string; supportsStreaming: boolean } {
    return {
      name: this.provider.name,
      model: this.provider.model,
      supportsStreaming: this.provider.supportsStreaming,
    }
  }
}

/**
 * Error Recovery Strategy Implementation
 */
export class EpochErrorRecovery {
  classify(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()

    if (message.includes('json') || message.includes('parse')) {
      return ErrorCategory.MALFORMED_JSON
    }
    if (message.includes('validation')) {
      return ErrorCategory.INVALID_SCHEMA
    }
    if (message.includes('timeout')) {
      return ErrorCategory.TIMEOUT
    }
    if (message.includes('rate') || message.includes('429')) {
      return ErrorCategory.RATE_LIMIT
    }
    if (message.includes('budget')) {
      return ErrorCategory.BUDGET_EXCEEDED
    }

    return ErrorCategory.PROVIDER_ERROR
  }

  canRecover(category: ErrorCategory): boolean {
    return ![ErrorCategory.BUDGET_EXCEEDED].includes(category)
  }

  recover(category: ErrorCategory, context: EpochContext): RecoveryAction {
    switch (category) {
      case ErrorCategory.MALFORMED_JSON:
        return { type: 'retry', delayMs: 100, maxRetries: 2 }

      case ErrorCategory.INVALID_SCHEMA:
        return {
          type: 'adjust',
          changes: {
            complexityBudget: Math.floor(context.complexityBudget * 0.7),
          },
        }

      case ErrorCategory.TIMEOUT:
        return { type: 'retry', delayMs: 500, maxRetries: 1 }

      case ErrorCategory.RATE_LIMIT:
        return { type: 'retry', delayMs: 5000, maxRetries: 1 }

      case ErrorCategory.PROVIDER_ERROR:
        return { type: 'fallback', strategy: 'minimal' }

      default:
        return { type: 'fail', message: 'Unrecoverable error' }
    }
  }
}

/**
 * User-friendly error messages
 */
export const USER_ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.MALFORMED_JSON]:
    'Schema generation had formatting issues. Retrying with simplified approach...',
  [ErrorCategory.INVALID_SCHEMA]:
    'Your request requires too much complexity. Simplifying...',
  [ErrorCategory.TIMEOUT]:
    'Generation took too long. Retrying with timeout adjustment...',
  [ErrorCategory.RATE_LIMIT]:
    'Rate limited. Please wait a moment and try again...',
  [ErrorCategory.PROVIDER_ERROR]:
    'Service temporarily unavailable. Showing minimal content...',
  [ErrorCategory.BUDGET_EXCEEDED]:
    'Request exceeds available resources. Please try a simpler request.',
  [ErrorCategory.CONTEXT_MISMATCH]:
    'Context configuration mismatch. Resetting and retrying...',
}
