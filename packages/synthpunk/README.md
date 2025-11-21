# @punk/synthpunk

**Epoch AI Schema Generation Engine** - Transform natural language into Punk UI schemas using AI.

## Overview

SynthPunk is the AI-powered schema generation engine for the Punk Framework. It uses large language models (Claude, GPT-4, or local Ollama models) to transform natural language prompts into valid, accessible Punk UI schemas.

## Features

- **Multi-Provider Support**: Anthropic Claude, OpenAI GPT-4, or local Ollama models
- **Streaming Generation**: Real-time schema patch streaming for responsive UX
- **8-Stage Validation**: Comprehensive validation pipeline ensures schema quality
- **Error Recovery**: Automatic retry with fallback strategies
- **Token Budget Management**: Intelligent token usage tracking and optimization
- **Accessibility First**: Every generated schema meets WCAG standards
- **Type-Safe**: Full TypeScript support with strict typing

## Installation

```bash
npm install @punk/synthpunk
```

## Quick Start

```typescript
import { EpochEngine, createContext } from '@punk/synthpunk'

// Initialize engine
const engine = new EpochEngine({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  validateChunks: true,
})

// Create context
const context = createContext([
  {
    name: 'User',
    fields: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
    },
  },
])

// Generate schema
for await (const patch of engine.generateSchema('Create a login form', context)) {
  console.log('Received patch:', patch)
}
```

## Providers

### Anthropic Claude

```typescript
const engine = new EpochEngine({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

### OpenAI GPT

```typescript
const engine = new EpochEngine({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
})
```

### Ollama (Local)

```typescript
const engine = new EpochEngine({
  provider: 'ollama',
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'mistral',
  },
})
```

## Advanced Usage

### With Progress Tracking

```typescript
let patchCount = 0

for await (const patch of engine.generateSchema(prompt, context)) {
  patchCount++
  console.log(`Progress: ${patchCount} patches generated`)

  // Apply patch to UI
  applyPatch(currentSchema, patch)
}
```

### Non-Streaming Mode

```typescript
const schema = await engine.generateComplete('Create a user profile card', context)
console.log('Complete schema:', schema)
```

### With Error Handling

```typescript
try {
  for await (const patch of engine.generateSchema(prompt, context)) {
    // Process patch
  }
} catch (error) {
  if (error instanceof EpochError) {
    console.error('Generation error:', error.code, error.message)
  }
}
```

## Validation Pipeline

SynthPunk uses an 8-stage validation pipeline:

1. **Structural Validation** (Zod schema)
2. **Component Type Validation** (Registry check)
3. **Props Validation** (Type and value checking)
4. **Data Binding Validation** (Path verification)
5. **Complexity Checking** (Budget enforcement)
6. **Security Validation** (XSS prevention)
7. **Accessibility Validation** (WCAG compliance)
8. **JSON Pointer Validation** (Path format)

## Context Management

```typescript
import { createContext, buildComponentRegistry, buildTokenRegistry } from '@punk/synthpunk'

const context = createContext(
  // Data models
  [
    {
      name: 'Product',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
      },
    },
  ],
  // User preferences
  {
    colorScheme: 'dark',
    spacing: 'spacious',
  }
)
```

## System Prompts

The engine uses carefully crafted system prompts that:

- Define available components and their props
- Enforce design token usage (no arbitrary CSS)
- Set complexity budgets for deterministic output
- Require accessibility compliance
- Guide progressive enhancement patterns

See `EPOCH_IMPL.md` for the complete 800+ line system prompt.

## Architecture

```
┌─────────────────┐
│  User Prompt    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Epoch Engine   │
│  - Context Prep │
│  - LLM Provider │
│  - Validation   │
│  - Error Recovery│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Schema Patches │
│  (Streaming)    │
└─────────────────┘
```

## Performance

- **First Token Latency**: < 1 second
- **Streaming Chunks**: < 100ms between patches
- **Complete Generation**: < 10 seconds for typical schemas
- **Memory Usage**: < 50MB per generation

## Token Budgets

- **System Prompt**: ~800 tokens
- **Component Registry**: ~500 tokens
- **Token Registry**: ~300 tokens
- **User Prompt**: 20-200 tokens
- **Response Reserved**: 2000 tokens
- **Total Budget**: 4,000-100,000 tokens (model dependent)

## Contributing

See `CONTRIBUTING.md` in the Punk Framework root.

## License

MIT

## Related Packages

- `@punk/puck` - Punk UI renderer
- `@punk/pink` - Design token system
- `@punk/glyphcase` - Mods management system
- `@punk/mohawk` - Visual builder

---

**Built with ♥ by the Punk Framework Team**
