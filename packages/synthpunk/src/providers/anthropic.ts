/**
 * SynthPunk - Anthropic Claude Provider
 */

import Anthropic from '@anthropic-ai/sdk'
import { LLMProvider, ConversationMessage } from '../types'

export class AnthropicProvider implements LLMProvider {
  name = 'Anthropic Claude'
  model = 'claude-sonnet-4-5-20250929'
  maxTokens = 100000
  supportsStreaming = true
  costPer1kTokens = 0.003
  config: Record<string, unknown>

  private client: Anthropic

  constructor(apiKey?: string, model?: string) {
    this.config = {
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      model: model || this.model,
    }

    if (model) {
      this.model = model
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey as string,
    })
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test API key with a simple call
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      })
      return true
    } catch (error) {
      console.error('Anthropic config validation failed:', error)
      return false
    }
  }

  async *generateSchema(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ],
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text
      }
    }
  }

  estimateTokens(text: string): number {
    // Claude uses approximately 1 token per 4 characters
    return Math.ceil(text.length / 4)
  }
}
