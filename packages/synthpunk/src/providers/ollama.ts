/**
 * SynthPunk - Ollama Local Provider
 */

import { LLMProvider, ConversationMessage } from '../types'

export class OllamaProvider implements LLMProvider {
  name = 'Ollama (Local)'
  model = 'mistral'
  maxTokens = 4096
  supportsStreaming = true
  costPer1kTokens = 0 // Free
  config: Record<string, unknown>

  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434', model?: string) {
    this.baseUrl = baseUrl
    this.config = { baseUrl, model: model || this.model }

    if (model) {
      this.model = model
    }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch (error) {
      console.error('Ollama config validation failed:', error)
      return false
    }
  }

  async *generateSchema(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): AsyncGenerator<string> {
    const messages = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage, timestamp: Date.now() },
    ]

    const prompt = `${systemPrompt}\n\n${messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')}`

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
      }),
    })

    if (!response.body) {
      throw new Error('No response body from Ollama')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines[lines.length - 1]

      for (const line of lines.slice(0, -1)) {
        if (!line.trim()) continue

        try {
          const data = JSON.parse(line)
          if (data.response) {
            yield data.response
          }
        } catch {
          // Skip invalid lines
        }
      }
    }
  }

  estimateTokens(text: string): number {
    // Local models vary, use conservative estimate
    return Math.ceil(text.length / 3)
  }
}
