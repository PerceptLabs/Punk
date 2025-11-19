# SynthPunk Quick Start Guide

Get started with the Epoch AI schema generation engine in 5 minutes.

## Installation

```bash
cd /home/user/Punk/packages/synthpunk
npm install
```

## Environment Setup

Create a `.env` file:

```bash
# For Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# For OpenAI GPT
OPENAI_API_KEY=sk-...

# For Ollama (local)
# No API key needed - just ensure Ollama is running
```

## Basic Usage

```typescript
import { EpochEngine, createContext } from '@punk/synthpunk'

// 1. Initialize engine
const engine = new EpochEngine({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  validateChunks: true,
})

// 2. Create context
const context = createContext()

// 3. Generate schema
for await (const patch of engine.generateSchema(
  'Create a login form with email and password',
  context
)) {
  console.log('Received:', patch.op, patch.path)
}
```

## With Data Models

```typescript
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

for await (const patch of engine.generateSchema(
  'Create a user profile card with avatar, name, and email',
  context
)) {
  // Process patches
}
```

## Provider Options

### Anthropic Claude (Recommended)

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

### Ollama (Local/Free)

```typescript
const engine = new EpochEngine({
  provider: 'ollama',
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'mistral',
  },
})
```

## Run Examples

```bash
# Basic usage
ANTHROPIC_API_KEY=your-key npx tsx examples/basic-usage.ts

# With progress tracking
ANTHROPIC_API_KEY=your-key npx tsx examples/streaming-progress.ts
```

## Build & Test

```bash
# Build
npm run build

# Test
npm test

# Type check
npm run type-check

# Development mode
npm run dev
```

## Common Prompts

**Login Form**:
```typescript
"Create a login form with email and password fields"
```

**Data Table**:
```typescript
"Create a data table showing users with columns for name, email, and role"
```

**Dashboard**:
```typescript
"Create a dashboard with stats cards showing total users, revenue, and orders"
```

**Profile Card**:
```typescript
"Create a user profile card with avatar, name, bio, and action buttons"
```

## Error Handling

```typescript
import { EpochError } from '@punk/synthpunk'

try {
  for await (const patch of engine.generateSchema(prompt, context)) {
    // Process patch
  }
} catch (error) {
  if (error instanceof EpochError) {
    console.error('Code:', error.code)
    console.error('Message:', error.message)
  }
}
```

## Next Steps

- Read `README.md` for complete documentation
- Check `IMPLEMENTATION_SUMMARY.md` for architecture details
- Review `examples/` for more use cases
- See `EPOCH_IMPL.md` for prompt engineering details

---

**Need help?** Check the issues at github.com/punk-framework/punk
