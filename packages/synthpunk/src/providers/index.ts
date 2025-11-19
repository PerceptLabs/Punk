/**
 * SynthPunk - LLM Provider Abstraction Layer
 */

import { LLMProvider, LLMProviderType, EpochConfig, EpochContext, TokenBudgetTracker } from '../types'
import { AnthropicProvider } from './anthropic'
import { OpenAIProvider } from './openai'
import { OllamaProvider } from './ollama'
import { calculateTokenBudget } from '../context'

export { AnthropicProvider } from './anthropic'
export { OpenAIProvider } from './openai'
export { OllamaProvider } from './ollama'

/**
 * Factory for creating LLM provider instances
 */
export class LLMProviderFactory {
  static create(config: EpochConfig): LLMProvider {
    switch (config.provider) {
      case 'anthropic':
        return new AnthropicProvider(config.apiKey)

      case 'openai':
        return new OpenAIProvider(config.apiKey)

      case 'ollama':
        return new OllamaProvider(
          config.ollama?.baseUrl,
          config.ollama?.model
        )

      default:
        throw new Error(`Unknown provider: ${config.provider}`)
    }
  }

  /**
   * Select optimal provider based on context and availability
   */
  static async selectOptimalProvider(
    providers: LLMProvider[],
    context: EpochContext
  ): Promise<LLMProvider> {
    const tokenBudget = calculateTokenBudget(context)

    // Filter by availability
    const available = await Promise.all(
      providers.map(async (p) => ({
        provider: p,
        valid: await p.validateConfig(),
      }))
    )

    const validProviders = available
      .filter((a) => a.valid)
      .map((a) => a.provider)

    if (validProviders.length === 0) {
      throw new Error('No valid providers available')
    }

    // Score providers
    const scored = validProviders.map((provider) => ({
      provider,
      score: this.scoreProvider(provider, tokenBudget),
    }))

    // Return highest scoring
    return scored.sort((a, b) => b.score - a.score)[0].provider
  }

  /**
   * Score provider based on token budget and capabilities
   */
  private static scoreProvider(
    provider: LLMProvider,
    budget: TokenBudgetTracker
  ): number {
    let score = 100

    // Penalize if max tokens < needed
    if (provider.maxTokens < budget.total) {
      score -= 50
    }

    // Prefer free/cheap providers
    score -= provider.costPer1kTokens * 100

    // Prefer with streaming for better UX
    if (!provider.supportsStreaming) {
      score -= 20
    }

    return Math.max(0, score)
  }
}
