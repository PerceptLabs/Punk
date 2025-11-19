/**
 * SynthPunk - OpenAI GPT Provider
 */

import OpenAI from 'openai'
import { LLMProvider, ConversationMessage } from '../types'

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI GPT'
  model = 'gpt-4-turbo'
  maxTokens = 128000
  supportsStreaming = true
  costPer1kTokens = 0.01
  config: Record<string, unknown>

  private client: OpenAI

  constructor(apiKey?: string, model?: string) {
    this.config = {
      apiKey: apiKey || process.env.OPENAI_API_KEY,
      model: model || this.model,
    }

    if (model) {
      this.model = model
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey as string,
    })
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.client.models.retrieve(this.model)
      return true
    } catch (error) {
      console.error('OpenAI config validation failed:', error)
      return false
    }
  }

  async *generateSchema(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 4096,
    })

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content
      }
    }
  }

  estimateTokens(text: string): number {
    // GPT uses similar tokenization to Claude
    return Math.ceil(text.length / 4)
  }
}
