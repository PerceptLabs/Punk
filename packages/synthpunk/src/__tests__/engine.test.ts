/**
 * SynthPunk Engine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EpochEngine, EpochError } from '../engine'
import { createContext } from '../context'
import { validatePatch } from '../validation'

describe('EpochEngine', () => {
  let context: ReturnType<typeof createContext>

  beforeEach(() => {
    context = createContext([
      {
        name: 'User',
        fields: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
        },
      },
    ])
  })

  describe('initialization', () => {
    it('should create engine with Anthropic provider', () => {
      const engine = new EpochEngine({
        provider: 'anthropic',
        apiKey: 'test-key',
      })

      const info = engine.getProviderInfo()
      expect(info.name).toBe('Anthropic Claude')
      expect(info.supportsStreaming).toBe(true)
    })

    it('should create engine with OpenAI provider', () => {
      const engine = new EpochEngine({
        provider: 'openai',
        apiKey: 'test-key',
      })

      const info = engine.getProviderInfo()
      expect(info.name).toBe('OpenAI GPT')
      expect(info.supportsStreaming).toBe(true)
    })

    it('should create engine with Ollama provider', () => {
      const engine = new EpochEngine({
        provider: 'ollama',
        ollama: {
          baseUrl: 'http://localhost:11434',
          model: 'mistral',
        },
      })

      const info = engine.getProviderInfo()
      expect(info.name).toBe('Ollama (Local)')
      expect(info.supportsStreaming).toBe(true)
    })
  })

  describe('validation', () => {
    it('should reject empty prompt', async () => {
      const engine = new EpochEngine({
        provider: 'anthropic',
        apiKey: 'test-key',
      })

      await expect(async () => {
        for await (const _ of engine.generateSchema('', context)) {
          // Should throw before yielding
        }
      }).rejects.toThrow(EpochError)
    })

    it('should reject insufficient token budget', async () => {
      const engine = new EpochEngine({
        provider: 'anthropic',
        apiKey: 'test-key',
      })

      const lowBudgetContext = { ...context, tokenBudget: 10 }

      await expect(async () => {
        for await (const _ of engine.generateSchema('test', lowBudgetContext)) {
          // Should throw before yielding
        }
      }).rejects.toThrow(EpochError)
    })
  })

  describe('cache', () => {
    it('should cache generated patches', async () => {
      const engine = new EpochEngine({
        provider: 'anthropic',
        apiKey: 'test-key',
      })

      // Mock: In real test, would need to mock LLM provider
      // This is a structure test
      expect(engine.clearCache).toBeDefined()
      engine.clearCache()
    })
  })
})

describe('Validation Pipeline', () => {
  let context: ReturnType<typeof createContext>

  beforeEach(() => {
    context = createContext()
  })

  it('should validate correct patch', async () => {
    const patch = {
      op: 'add' as const,
      path: '/root',
      value: {
        type: 'Container',
        id: 'root',
        props: { padding: 'md' },
        children: [],
      },
    }

    const result = await validatePatch(patch, context)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid component type', async () => {
    const patch = {
      op: 'add' as const,
      path: '/root',
      value: {
        type: 'InvalidComponent',
        id: 'root',
      },
    }

    const result = await validatePatch(patch, context)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('Unknown component type'))).toBe(true)
  })

  it('should reject malicious content', async () => {
    const patch = {
      op: 'add' as const,
      path: '/root',
      value: {
        type: 'Text',
        id: 'text',
        text: '<script>alert("xss")</script>',
      },
    }

    const result = await validatePatch(patch, context)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('malicious'))).toBe(true)
  })

  it('should validate accessibility requirements', async () => {
    const patch = {
      op: 'add' as const,
      path: '/root',
      value: {
        type: 'Button',
        id: 'btn',
        props: {}, // Missing label
      },
    }

    const result = await validatePatch(patch, context)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('label'))).toBe(true)
  })
})
