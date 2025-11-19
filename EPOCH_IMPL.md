# EPOCH_IMPL: AI Schema Generation Engine Implementation Guide

**Version:** 1.0.0
**Last Updated:** November 19, 2025
**Status:** Specification
**Purpose:** Detailed implementation specification for Epoch, the AI-powered Punk UI schema generation engine

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Engine Design](#core-engine-design)
3. [System Prompts](#system-prompts)
4. [Streaming Protocol](#streaming-protocol)
5. [Context Management](#context-management)
6. [Validation Pipeline](#validation-pipeline)
7. [Error Recovery](#error-recovery)
8. [LLM Provider Support](#llm-provider-support)
9. [Integration Examples](#integration-examples)
10. [Performance & Budgets](#performance--budgets)

---

## Architecture Overview

### Core Concept

Epoch is a streaming AI schema generation engine that transforms natural language prompts into valid Punk UI schemas. It operates as an incremental, validated generator that:

1. **Accepts user prompts** describing UI requirements
2. **Maintains context** about available components, tokens, and data models
3. **Streams schema patches** incrementally to the client
4. **Validates each patch** before applying to prevent invalid states
5. **Recovers gracefully** from LLM errors or incomplete outputs
6. **Manages token budgets** to ensure deterministic behavior

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER PROMPT                            │
│         "Create a login form with email/password"           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  EPOCH ENGINE CORE                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Context Preparation                              │   │
│  │    • Load available components                       │   │
│  │    • Build token reference                           │   │
│  │    • Prepare conversation history                    │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐   │
│  │ 2. LLM Provider Selection                            │   │
│  │    • Choose provider (Claude/GPT/Ollama)             │   │
│  │    • Initialize streaming connection                 │   │
│  │    • Apply provider-specific formatting              │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐   │
│  │ 3. Schema Generation (Streaming)                     │   │
│  │    • Send system prompt + context                    │   │
│  │    • Stream JSON patches                             │   │
│  │    • Validate each chunk                             │   │
│  │    • Emit SchemaPatch events                         │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────▼───────────────────────────────┐   │
│  │ 4. Error Recovery                                    │   │
│  │    • Detect malformed output                         │   │
│  │    • Retry with adjusted context                     │   │
│  │    • Fallback to simpler schema                      │   │
│  └─────────────────────┬───────────────────────────────┘   │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────────┐
              │    SCHEMA STREAM         │
              │ (SchemaPatch events)     │
              │ • structure patches      │
              │ • property patches       │
              │ • binding patches        │
              └──────────────────────────┘
```

---

## Core Engine Design

### 1. EpochEngine Class

```typescript
import { z } from 'zod'
import { Anthropic } from '@anthropic-ai/sdk'
import { OpenAI } from 'openai'

// Type definitions
type LLMProvider = 'anthropic' | 'openai' | 'ollama'
type SchemaPatchOp = 'add' | 'replace' | 'remove' | 'move'

interface SchemaPatch {
  op: SchemaPatchOp
  path: string
  value?: unknown
  from?: string
}

interface EpochContext {
  componentRegistry: Map<string, ComponentSchema>
  tokenRegistry: Map<string, DesignToken>
  dataModels: DataModel[]
  conversationHistory: ConversationMessage[]
  tokenBudget: number
  complexityBudget: number
  userPreferences?: Record<string, unknown>
}

interface EpochConfig {
  provider: LLMProvider
  apiKey?: string
  ollama?: { baseUrl: string; model: string }
  maxRetries: number
  retryDelayMs: number
  chunkTimeoutMs: number
  validateChunks: boolean
}

interface GenerationOptions {
  includeHistory: boolean
  maxPatches: number
  timeoutMs: number
  fallbackToSimpler: boolean
}

// Main Engine Implementation
export class EpochEngine {
  private config: EpochConfig
  private anthropic?: Anthropic
  private openai?: OpenAI
  private validators: Map<string, ValidatorFn>
  private cache: Map<string, SchemaPatch[]>

  constructor(config: EpochConfig) {
    this.config = config
    this.validators = new Map()
    this.cache = new Map()
    this.initializeProviders()
  }

  private initializeProviders() {
    if (this.config.provider === 'anthropic') {
      this.anthropic = new Anthropic({
        apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
      })
    } else if (this.config.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Main generation method - streams schema patches
   */
  async *generateSchema(
    userPrompt: string,
    context: EpochContext,
    options: Partial<GenerationOptions> = {}
  ): AsyncGenerator<SchemaPatch> {
    const opts: GenerationOptions = {
      includeHistory: true,
      maxPatches: 500,
      timeoutMs: 60000,
      fallbackToSimpler: true,
      ...options,
    }

    // 1. Validate input
    this.validateInput(userPrompt, context)

    // 2. Prepare context
    const systemPrompt = this.buildSystemPrompt(context)
    const userMessage = this.buildUserMessage(userPrompt, context, opts)

    // 3. Check cache
    const cacheKey = this.getCacheKey(userPrompt, context)
    if (this.cache.has(cacheKey)) {
      yield* this.cache.get(cacheKey)!
      return
    }

    // 4. Stream from LLM
    const patches: SchemaPatch[] = []
    let retries = 0

    while (retries < this.config.maxRetries) {
      try {
        for await (const patch of this.streamFromLLM(
          systemPrompt,
          userMessage,
          context,
          opts
        )) {
          // Validate patch
          const validation = await this.validatePatch(patch, context)
          if (!validation.valid) {
            console.warn(`Invalid patch: ${validation.errors.join(', ')}`)
            continue
          }

          patches.push(patch)
          yield patch

          if (patches.length >= opts.maxPatches) {
            break
          }
        }

        // Cache results
        this.cache.set(cacheKey, patches)
        return
      } catch (error) {
        retries++

        if (retries >= this.config.maxRetries) {
          if (opts.fallbackToSimpler) {
            // Fallback to minimal schema
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
      }
    }
  }

  /**
   * Stream patches from the selected LLM provider
   */
  private async *streamFromLLM(
    systemPrompt: string,
    userMessage: string,
    context: EpochContext,
    options: GenerationOptions
  ): AsyncGenerator<SchemaPatch> {
    if (this.config.provider === 'anthropic') {
      yield* this.streamFromAnthropic(systemPrompt, userMessage, context)
    } else if (this.config.provider === 'openai') {
      yield* this.streamFromOpenAI(systemPrompt, userMessage, context)
    } else if (this.config.provider === 'ollama') {
      yield* this.streamFromOllama(systemPrompt, userMessage, context)
    }
  }

  /**
   * Anthropic Claude streaming implementation
   */
  private async *streamFromAnthropic(
    systemPrompt: string,
    userMessage: string,
    context: EpochContext
  ): AsyncGenerator<SchemaPatch> {
    if (!this.anthropic) {
      throw new EpochError('Anthropic client not initialized', 'PROVIDER_ERROR')
    }

    const stream = this.anthropic.messages.stream({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...this.formatConversationHistory(context.conversationHistory),
        { role: 'user', content: userMessage },
      ],
    })

    let buffer = ''
    let jsonBuffer = ''
    let braceCount = 0
    let inJsonBlock = false

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        buffer += event.delta.text

        // Look for JSON objects
        for (const char of event.delta.text) {
          if (char === '{') {
            braceCount++
            inJsonBlock = true
          }

          if (inJsonBlock) {
            jsonBuffer += char
          }

          if (char === '}') {
            braceCount--

            if (braceCount === 0 && inJsonBlock) {
              // Try to parse complete JSON object
              try {
                const patch = JSON.parse(jsonBuffer)
                yield patch
                jsonBuffer = ''
                inJsonBlock = false
              } catch {
                // Incomplete JSON, continue buffering
              }
            }
          }
        }
      }
    }

    // Process any remaining complete JSON in buffer
    this.extractPatchesFromBuffer(buffer).forEach((patch) => {
      // Validation happens at caller level
    })
  }

  /**
   * OpenAI GPT streaming implementation
   */
  private async *streamFromOpenAI(
    systemPrompt: string,
    userMessage: string,
    context: EpochContext
  ): AsyncGenerator<SchemaPatch> {
    if (!this.openai) {
      throw new EpochError('OpenAI client not initialized', 'PROVIDER_ERROR')
    }

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...this.formatConversationHistory(context.conversationHistory),
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 4096,
    })

    let buffer = ''

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        buffer += chunk.choices[0].delta.content

        // Try to extract complete JSON objects
        const patches = this.extractPatchesFromBuffer(buffer)
        for (const patch of patches) {
          yield patch
          buffer = buffer.substring(
            buffer.indexOf(JSON.stringify(patch)) + JSON.stringify(patch).length
          )
        }
      }
    }
  }

  /**
   * Ollama local streaming implementation
   */
  private async *streamFromOllama(
    systemPrompt: string,
    userMessage: string,
    context: EpochContext
  ): AsyncGenerator<SchemaPatch> {
    const baseUrl = this.config.ollama?.baseUrl || 'http://localhost:11434'
    const model = this.config.ollama?.model || 'mistral'

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\n${userMessage}`,
        stream: true,
      }),
    })

    const reader = response.body?.getReader()
    if (!reader) {
      throw new EpochError('Failed to create Ollama stream', 'PROVIDER_ERROR')
    }

    let buffer = ''
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value)
      const lines = buffer.split('\n')
      buffer = lines[lines.length - 1]

      for (const line of lines.slice(0, -1)) {
        if (!line.trim()) continue

        const json = JSON.parse(line)
        if (json.response) {
          const patches = this.extractPatchesFromBuffer(json.response)
          for (const patch of patches) {
            yield patch
          }
        }
      }
    }
  }

  /**
   * Extract individual patches from text buffer
   */
  private extractPatchesFromBuffer(buffer: string): SchemaPatch[] {
    const patches: SchemaPatch[] = []
    let depth = 0
    let start = -1

    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === '{') {
        if (depth === 0) start = i
        depth++
      } else if (buffer[i] === '}') {
        depth--
        if (depth === 0 && start !== -1) {
          try {
            const json = buffer.substring(start, i + 1)
            const patch = JSON.parse(json)
            patches.push(patch)
          } catch {
            // Skip malformed JSON
          }
          start = -1
        }
      }
    }

    return patches
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
        children: [],
      },
    }
  }

  private extractKeywords(prompt: string): string[] {
    return prompt.toLowerCase().split(/\s+/).filter((word) => word.length > 3)
  }

  private inferComponentType(keywords: string[]): string {
    if (keywords.some((k) => ['form', 'input', 'field'].includes(k))) {
      return 'Form'
    }
    if (keywords.some((k) => ['button', 'action', 'submit'].includes(k))) {
      return 'Button'
    }
    if (keywords.some((k) => ['list', 'table', 'data'].includes(k))) {
      return 'DataGrid'
    }
    return 'Container'
  }

  private buildMinimalProps(componentType: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      Form: { layout: 'vertical' },
      Button: { variant: 'primary' },
      DataGrid: { striped: true },
      Container: { padding: 'md' },
    }
    return defaults[componentType] || {}
  }

  // Validation and utility methods follow...
  private validateInput(prompt: string, context: EpochContext) {
    if (!prompt || prompt.trim().length === 0) {
      throw new EpochError('User prompt cannot be empty', 'INVALID_INPUT')
    }
    if (context.tokenBudget < 100) {
      throw new EpochError('Insufficient token budget', 'BUDGET_ERROR')
    }
  }

  private getCacheKey(prompt: string, context: EpochContext): string {
    return `${prompt}:${context.componentRegistry.size}:${context.dataModels.length}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private formatConversationHistory(history: ConversationMessage[]): Array<{
    role: string
    content: string
  }> {
    return history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  // Validation pipeline implemented below...
  async validatePatch(
    patch: SchemaPatch,
    context: EpochContext
  ): Promise<{ valid: boolean; errors: string[] }> {
    // Implemented in Validation Pipeline section
    return { valid: true, errors: [] }
  }
}

// Error class
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
```

---

## System Prompts

### 1. Primary System Prompt (Claude)

```
You are Epoch, an advanced AI system that generates Punk UI schemas based on user prompts.

## Core Responsibility

Generate valid JSON Punk UI schemas that render as beautiful, accessible React applications.
Each schema is a hierarchical structure of components that the Punk renderer converts to interactive UIs.

## Available Components

You can use ONLY these component types:
- **Container**: Layout wrapper (props: padding, gap, direction, align, justify)
- **Box**: Basic styled box (props: padding, background, border, shadow)
- **Text**: Text content (props: size, weight, color, align, lineHeight)
- **Button**: Interactive button (props: variant, size, disabled, onClick)
- **Input**: Text input field (props: type, placeholder, label, defaultValue, required)
- **Select**: Dropdown select (props: label, options, defaultValue, multiple)
- **Form**: Form wrapper (props: layout, spacing, onSubmit)
- **FormField**: Form field wrapper (props: label, hint, error, required)
- **DataGrid**: Table component (props: columns, data, striped, sortable)
- **Card**: Content card (props: padding, shadow, border)
- **Badge**: Label badge (props: variant, size)
- **Avatar**: User avatar (props: src, size, fallback)
- **Modal**: Modal dialog (props: open, title, onClose, size)
- **Tabs**: Tab container (props: defaultTab, tabs)
- **Stack**: Flex container (props: direction, spacing, align, justify)

## Styling System (Design Tokens)

Use design tokens from the Pink token system:
- **Spacing**: xs, sm, md, lg, xl, 2xl (not px values)
- **Colors**: primary, secondary, success, danger, warning, neutral, surface
- **Typography**: h1, h2, h3, body, caption (sizes with standard font weights)
- **Shadows**: sm, md, lg (predefined shadow values)
- **Radius**: sm, md, lg (border radius values)

NEVER use arbitrary CSS values. ALWAYS use tokens.

## Complexity Budgets

You have strict budgets to ensure deterministic, performant output:
- **Maximum Component Depth**: 8 levels
- **Maximum Children Per Component**: 12
- **Maximum Total Components**: 50
- **Maximum String Length**: 500 characters
- **Maximum Data Binding Paths**: 20
- **Maximum Event Handlers**: 15

Monitor your usage and simplify if approaching limits.

## Output Format

Output ONLY valid JSON Punk schema patches in JSON Patch (RFC 6902) format.
Each patch is a separate JSON object on its own line (not a JSON array).

Format:
```
{"op": "add", "path": "/root", "value": {...}}
{"op": "add", "path": "/root/children/-", "value": {...}}
{"op": "replace", "path": "/root/props/padding", "value": "lg"}
```

## Data Binding

Use token references for dynamic data:
```
{"op": "add", "path": "/root/props/data", "value": "{context.users}"}
```

Reference patterns:
- Context data: {context.propertyName}
- Component props: {props.propertyName}
- Array items: {item.propertyName} (within list contexts)
- Nested: {context.user.profile.name}

## Accessibility Requirements

Every generated schema MUST be accessible:
- All interactive elements need clear labels
- Form fields must have associated labels
- Images need alt text (via alt prop)
- Color alone should not convey information
- Keyboard navigation must be possible
- ARIA roles and attributes where needed

ALWAYS:
- Include descriptive labels for inputs
- Set required props explicitly
- Provide proper heading hierarchy (h1 > h2 > h3)
- Use semantic component types

NEVER:
- Create unlabeled buttons or inputs
- Use color alone for status indication
- Create nested buttons or focusable elements
- Trap keyboard focus

## Validation Rules

Before outputting any patch:
1. Verify the component type exists in available list
2. Check all props against component schema
3. Ensure design tokens are valid (not arbitrary values)
4. Verify data bindings reference valid paths
5. Validate within complexity budgets
6. Confirm children types are appropriate

If validation fails, do NOT output the patch. Instead, adjust and try again.

## Progressive Enhancement

Build schemas progressively:
1. Start with root container
2. Add major sections/components
3. Add form fields or content
4. Add styling and spacing
5. Add interactions and data bindings

This allows partial rendering while generation completes.

## Common Patterns

### Login Form
```json
{"op": "add", "path": "/root", "value": {
  "type": "Card",
  "id": "loginForm",
  "props": {"padding": "lg"},
  "children": [
    {
      "type": "Text",
      "props": {"size": "h2"},
      "text": "Login"
    },
    {
      "type": "Form",
      "props": {"layout": "vertical", "spacing": "md"},
      "children": [
        {
          "type": "FormField",
          "props": {"label": "Email"},
          "children": [{"type": "Input", "props": {"type": "email"}}]
        },
        {
          "type": "FormField",
          "props": {"label": "Password"},
          "children": [{"type": "Input", "props": {"type": "password"}}]
        },
        {"type": "Button", "props": {"variant": "primary"}, "text": "Sign In"}
      ]
    }
  ]
}}
```

### Data Table
```json
{"op": "add", "path": "/root", "value": {
  "type": "Card",
  "props": {"padding": "lg"},
  "children": [{
    "type": "DataGrid",
    "props": {
      "columns": [
        {"key": "name", "label": "Name"},
        {"key": "email", "label": "Email"}
      ],
      "data": "{context.users}",
      "striped": true
    }
  }]
}}
```

## Error Handling

If you cannot generate a valid schema:
1. Explain why in your thinking (if reasoning capability available)
2. Output a minimal valid schema instead
3. Document what was simplified

Example minimal:
```json
{"op": "add", "path": "/root", "value": {
  "type": "Container",
  "props": {"padding": "md"},
  "children": [{"type": "Text", "text": "Content placeholder"}]
}}
```

## User Preferences

Consider user preferences if provided in context:
- Color scheme (light/dark)
- Preferred spacing
- Layout style (compact vs spacious)
- Component variants

## Final Notes

- Be concise but complete
- Prioritize accessibility
- Use meaningful IDs (kebab-case)
- Structure logically
- Test mentally against requirements
- Output patches in logical order

You are Epoch. Generate excellent Punk schemas.
```

### 2. Context-Aware System Prompt Variant

When user has previous context (data models, existing schema), use:

```
You are Epoch, an AI schema generator for Punk UI.

The user has provided existing context. Extend or modify the schema to meet their needs.

## Existing Context

**Data Models:**
{dataModelsJson}

**Available Components:**
{componentRegistryJson}

**Existing Schema:**
{existingSchemaJson}

**User Request:**
{userPrompt}

## Task

Generate JSON Patch operations to transform the existing schema according to the user's request.

## Guidelines

1. **Respect Existing Structure**: Only modify what's necessary
2. **Reuse IDs**: Keep existing component IDs when not changing them
3. **Maintain Data Bindings**: Preserve existing {context.*} references
4. **Type Consistency**: Match existing prop types and patterns
5. **Incremental Changes**: Use minimal set of patches

## Allowed Operations

- `add`: Insert new component or property
- `replace`: Modify existing value
- `remove`: Delete component or property
- `move`: Reorganize components

## Output

Generate only the necessary patches to achieve the requested change.
```

### 3. Retry/Recovery Prompt

When retrying after errors:

```
You are Epoch. The previous generation had issues. Please regenerate more carefully.

## Previous Issues

{previousErrors}

## Key Constraints

1. Use ONLY these components: [list]
2. Strictly follow the schema format
3. Validate all tokens exist
4. Check component props match schema
5. Keep it simpler if needed

## Requirements

Generate valid JSON Patch operations. Each patch must be valid JSON.

Use simpler components if needed. Prioritize:
1. Correctness over complexity
2. Accessibility over features
3. Standard patterns over custom solutions
```

---

## Streaming Protocol

### 1. Patch Format Specification

Epoch uses JSON Patch (RFC 6902) with extensions:

```typescript
interface SchemaPatch {
  // RFC 6902 standard operations
  op: 'add' | 'replace' | 'remove' | 'move' | 'copy' | 'test'

  // JSON Pointer path to target
  path: string

  // Value for add/replace operations
  value?: unknown

  // Source path for move/copy operations
  from?: string

  // Metadata (Epoch extensions)
  meta?: {
    // Unique patch ID for deduplication
    id?: string

    // Patch sequence number for ordering
    sequence?: number

    // Validation metadata
    validated?: boolean

    // Complexity measurement
    complexity?: {
      nodes: number
      depth: number
      bindings: number
    }
  }
}
```

### 2. Streaming Examples

#### Single Component Addition

```json
{"op": "add", "path": "/root", "value": {"type": "Container", "id": "root", "props": {"padding": "lg"}, "children": []}, "meta": {"sequence": 1}}
{"op": "add", "path": "/root/children/-", "value": {"type": "Text", "id": "title", "props": {"size": "h1"}, "text": "Welcome"}, "meta": {"sequence": 2}}
```

#### Property Updates

```json
{"op": "replace", "path": "/root/props/background", "value": "primary", "meta": {"sequence": 3}}
{"op": "add", "path": "/root/props/gap", "value": "md", "meta": {"sequence": 4}}
```

#### Complex Nested Structure

```json
{"op": "add", "path": "/root/children/-", "value": {"type": "Form", "id": "loginForm", "props": {"layout": "vertical", "spacing": "md"}, "children": [{"type": "FormField", "id": "emailField", "props": {"label": "Email"}, "children": [{"type": "Input", "props": {"type": "email", "placeholder": "user@example.com"}}]}]}, "meta": {"sequence": 5}}
```

### 3. Streaming State Machine

```
┌─────────────────┐
│  STREAMING      │
│  START          │
└────────┬────────┘
         │ receive chunk
         ▼
┌─────────────────┐
│  BUFFERING      │ (accumulate until valid JSON)
└────────┬────────┘
         │ complete object
         ▼
┌─────────────────┐
│  VALIDATING     │ (validate patch)
└────────┬────────┘
         │
    ┌────┴────┐
    │          │
    ▼(valid)   ▼(invalid)
┌────────┐  ┌─────────┐
│ APPLY  │  │  ERROR  │  (emit warning, skip)
└────┬───┘  └────┬────┘
     │           │
     └───┬───────┘
         │ next chunk
         ├─→ BUFFERING (continue)
         │
         └─→ EOS → COMPLETE
```

### 4. Chunk Validation Rules

Before applying a patch:

```typescript
interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  metrics?: {
    complexity: number
    depth: number
    tokenUsage: number
  }
}

async function validatePatch(patch: SchemaPatch): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Schema structure
  if (!['add', 'replace', 'remove', 'move', 'copy', 'test'].includes(patch.op)) {
    errors.push(`Invalid operation: ${patch.op}`)
  }

  // 2. Path validation
  if (typeof patch.path !== 'string' || !patch.path.startsWith('/')) {
    errors.push('Path must be absolute JSON Pointer')
  }

  // 3. Value validation
  if (['add', 'replace'].includes(patch.op) && patch.value === undefined) {
    errors.push('add/replace requires value')
  }

  // 4. Component type validation
  if (patch.op === 'add' && patch.value?.type) {
    const validTypes = getValidComponentTypes()
    if (!validTypes.includes(patch.value.type)) {
      errors.push(`Unknown component type: ${patch.value.type}`)
    }
  }

  // 5. Token validation
  if (patch.value?.props) {
    for (const [key, val] of Object.entries(patch.value.props)) {
      if (typeof val === 'string' && isTokenReference(val)) {
        if (!isValidToken(val)) {
          warnings.push(`Unknown token: ${val}`)
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
```

---

## Context Management

### 1. Context Structure

```typescript
interface ComponentSchema {
  type: string
  label: string
  icon: string
  props: Record<string, PropertySchema>
  children?: boolean
  maxChildren?: number
}

interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'object' | 'array'
  required?: boolean
  description?: string
  defaultValue?: unknown
  enum?: unknown[]
  validation?: string // regex or function name
}

interface DesignToken {
  name: string
  value: string | number | object
  type: 'spacing' | 'color' | 'typography' | 'shadow' | 'radius'
  group: string
  deprecated?: boolean
}

interface DataModel {
  name: string
  fields: Record<string, DataField>
  example?: Record<string, unknown>
}

interface DataField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  required?: boolean
  description?: string
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface EpochContext {
  // Component registry with metadata
  componentRegistry: Map<string, ComponentSchema>

  // Design tokens
  tokenRegistry: Map<string, DesignToken>

  // Data models available for binding
  dataModels: DataModel[]

  // Conversation history for multi-turn
  conversationHistory: ConversationMessage[]

  // Budget management
  tokenBudget: number
  tokenUsed: number
  complexityBudget: number
  complexityUsed: number

  // User preferences
  userPreferences?: {
    colorScheme?: 'light' | 'dark'
    spacing?: 'compact' | 'normal' | 'spacious'
    variant?: string
  }

  // Session metadata
  sessionId: string
  userId?: string
  createdAt: number
}
```

### 2. Building Component Registry

```typescript
function buildComponentRegistry(): Map<string, ComponentSchema> {
  return new Map([
    [
      'Container',
      {
        type: 'Container',
        label: 'Container',
        icon: 'box',
        props: {
          padding: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg', 'xl'],
            defaultValue: 'md',
          },
          gap: { type: 'enum', enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
          direction: {
            type: 'enum',
            enum: ['row', 'column'],
            defaultValue: 'column',
          },
          align: { type: 'enum', enum: ['start', 'center', 'end', 'stretch'] },
          justify: { type: 'enum', enum: ['start', 'center', 'end', 'between'] },
          background: { type: 'string' }, // token reference
          border: { type: 'string' },
        },
        children: true,
        maxChildren: 12,
      },
    ],
    [
      'Button',
      {
        type: 'Button',
        label: 'Button',
        icon: 'click',
        props: {
          variant: {
            type: 'enum',
            enum: ['primary', 'secondary', 'outline', 'ghost'],
            defaultValue: 'primary',
          },
          size: {
            type: 'enum',
            enum: ['sm', 'md', 'lg'],
            defaultValue: 'md',
          },
          disabled: { type: 'boolean', defaultValue: false },
          onClick: { type: 'string' }, // handler reference
        },
        children: false,
      },
    ],
    // ... more components
  ])
}
```

### 3. Building Token Registry

```typescript
function buildTokenRegistry(): Map<string, DesignToken> {
  const tokens = new Map<string, DesignToken>()

  // Spacing tokens
  const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 }
  for (const [name, value] of Object.entries(spacing)) {
    tokens.set(`spacing-${name}`, {
      name: `spacing-${name}`,
      value,
      type: 'spacing',
      group: 'spacing',
    })
  }

  // Color tokens
  const colors = {
    primary: '#007AFF',
    secondary: '#5AC8FA',
    success: '#4CD964',
    danger: '#FF3B30',
    warning: '#FF9500',
    neutral: '#8E8E93',
    surface: '#F2F2F7',
  }
  for (const [name, value] of Object.entries(colors)) {
    tokens.set(`color-${name}`, {
      name: `color-${name}`,
      value,
      type: 'color',
      group: 'colors',
    })
  }

  // Typography tokens
  tokens.set('typography-h1', {
    name: 'typography-h1',
    value: { size: '32px', weight: 700, lineHeight: 1.2 },
    type: 'typography',
    group: 'typography',
  })

  // Shadow tokens
  tokens.set('shadow-sm', {
    name: 'shadow-sm',
    value: '0 1px 3px rgba(0,0,0,0.1)',
    type: 'shadow',
    group: 'shadows',
  })

  return tokens
}
```

### 4. Context Preparation

```typescript
function prepareContext(
  userPrompt: string,
  existingSchema?: PunkSchema
): EpochContext {
  return {
    componentRegistry: buildComponentRegistry(),
    tokenRegistry: buildTokenRegistry(),
    dataModels: buildDataModels(),
    conversationHistory: [],
    tokenBudget: 4000, // Claude Opus max
    tokenUsed: 0,
    complexityBudget: 100,
    complexityUsed: 0,
    sessionId: generateId(),
    createdAt: Date.now(),
  }
}
```

### 5. Token Budget Management

```typescript
interface TokenBudgetTracker {
  total: number
  systemPrompt: number
  context: number
  userMessage: number
  reserved: number // for response
  remaining: number
}

function calculateTokenBudget(context: EpochContext): TokenBudgetTracker {
  const systemPromptTokens = estimateTokens(buildSystemPrompt(context))
  const contextTokens = estimateTokens(formatContext(context))
  const userMessageTokens = estimateTokens(context.conversationHistory.slice(-1)[0]?.content || '')
  const reserved = 2000 // Reserve for response

  const total = context.tokenBudget
  const used = systemPromptTokens + contextTokens + userMessageTokens
  const remaining = Math.max(0, total - used - reserved)

  return {
    total,
    systemPrompt: systemPromptTokens,
    context: contextTokens,
    userMessage: userMessageTokens,
    reserved,
    remaining,
  }
}

function estimateTokens(text: string): number {
  // Approximate: 1 token ≈ 4 characters (for English)
  return Math.ceil(text.length / 4)
}
```

---

## Validation Pipeline

### 1. Complete Validation Flow

```typescript
interface ValidationPipeline {
  validateStructure(patch: SchemaPatch): ValidationResult
  validateComponentType(type: string): ValidationResult
  validateComponentProps(
    type: string,
    props: Record<string, unknown>
  ): ValidationResult
  validateTokenReferences(value: unknown): ValidationResult
  validateDataBindings(bindings: string[]): ValidationResult
  validateComplexity(patch: SchemaPatch, context: EpochContext): ValidationResult
  validateSecurity(patch: SchemaPatch): ValidationResult
  validateAccessibility(patch: SchemaPatch): ValidationResult
}
```

### 2. Step-by-Step Validation

```typescript
async function validatePatch(
  patch: SchemaPatch,
  context: EpochContext
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []
  const warnings: string[] = []

  // STEP 1: Structural Validation (Zod)
  const structureValidation = validateStructure(patch)
  if (!structureValidation.valid) {
    errors.push(...structureValidation.errors)
    return { valid: false, errors }
  }

  // STEP 2: Component Type Validation
  if (patch.op === 'add' && patch.value?.type) {
    if (!context.componentRegistry.has(patch.value.type)) {
      errors.push(`Unknown component type: ${patch.value.type}`)
      return { valid: false, errors }
    }
  }

  // STEP 3: Props Validation
  if (patch.value?.type && patch.value?.props) {
    const schema = context.componentRegistry.get(patch.value.type)
    if (schema) {
      for (const [propName, propValue] of Object.entries(patch.value.props)) {
        const propSchema = schema.props[propName]
        if (!propSchema) {
          warnings.push(`Unknown prop for ${patch.value.type}: ${propName}`)
          continue
        }

        // Type check
        if (!isValidPropValue(propValue, propSchema)) {
          errors.push(
            `Invalid value for ${patch.value.type}.${propName}: ${propValue}`
          )
        }

        // Token validation
        if (typeof propValue === 'string' && isTokenReference(propValue)) {
          if (!context.tokenRegistry.has(propValue)) {
            errors.push(`Unknown token: ${propValue}`)
          }
        }
      }
    }
  }

  // STEP 4: Data Binding Validation
  if (patch.value?.props) {
    const bindings = extractDataBindings(patch.value.props)
    for (const binding of bindings) {
      const isValid = validateDataBinding(binding, context.dataModels)
      if (!isValid) {
        errors.push(`Invalid data binding: ${binding}`)
      }
    }
  }

  // STEP 5: Complexity Check
  const complexity = calculateComplexity(patch)
  if (context.complexityUsed + complexity > context.complexityBudget) {
    errors.push(
      `Complexity budget exceeded: ${context.complexityUsed} + ${complexity} > ${context.complexityBudget}`
    )
  }

  // STEP 6: Security Validation
  if (patch.value?.text) {
    if (containsMaliciousContent(patch.value.text)) {
      errors.push('Content contains malicious patterns')
    }
  }

  // STEP 7: Accessibility Validation
  if (patch.op === 'add' && patch.value?.type) {
    const a11yErrors = validateAccessibility(patch.value, context)
    errors.push(...a11yErrors)
  }

  // STEP 8: Operation Registry Check
  const pathErrors = validateJsonPointerPath(patch.path)
  errors.push(...pathErrors)

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Helper functions
function validateStructure(patch: SchemaPatch): ValidationResult {
  try {
    const schema = z.object({
      op: z.enum(['add', 'replace', 'remove', 'move', 'copy', 'test']),
      path: z.string().startsWith('/'),
      value: z.unknown().optional(),
      from: z.string().optional(),
    })
    schema.parse(patch)
    return { valid: true, errors: [] }
  } catch (error) {
    return { valid: false, errors: [(error as Error).message] }
  }
}

function isTokenReference(value: string): boolean {
  return /^[a-z]+-[a-z]+(-[a-z]+)*$/.test(value)
}

function isValidPropValue(value: unknown, schema: PropertySchema): boolean {
  if (schema.type === 'enum') {
    return schema.enum?.includes(value)
  }
  if (schema.type === 'string') {
    return typeof value === 'string'
  }
  if (schema.type === 'number') {
    return typeof value === 'number'
  }
  if (schema.type === 'boolean') {
    return typeof value === 'boolean'
  }
  return true
}

function extractDataBindings(props: Record<string, unknown>): string[] {
  const bindings: string[] = []
  const bindingRegex = /\{(context\.[^}]+)\}/g

  for (const value of Object.values(props)) {
    if (typeof value === 'string') {
      const matches = value.matchAll(bindingRegex)
      for (const match of matches) {
        bindings.push(match[1])
      }
    }
  }

  return bindings
}

function validateDataBinding(binding: string, dataModels: DataModel[]): boolean {
  const [model, ...path] = binding.split('.')
  const dataModel = dataModels.find((m) => m.name === model)

  if (!dataModel) {
    return false
  }

  // Traverse path through fields
  let current: DataField | undefined = undefined
  for (const segment of path) {
    // Implement path traversal
  }

  return true
}

function calculateComplexity(patch: SchemaPatch): number {
  let score = 0

  if (patch.op === 'add') {
    const value = patch.value as Record<string, unknown>

    // Count nodes
    score += countNodes(value)

    // Measure depth
    score += measureDepth(value)

    // Count bindings
    if (value.props) {
      const bindings = extractDataBindings(value.props as Record<string, unknown>)
      score += bindings.length
    }
  }

  return score
}

function countNodes(obj: Record<string, unknown>): number {
  let count = 1
  if (Array.isArray(obj.children)) {
    count += obj.children.length
    for (const child of obj.children) {
      count += countNodes(child as Record<string, unknown>)
    }
  }
  return count
}

function measureDepth(
  obj: Record<string, unknown>,
  current: number = 0
): number {
  if (!Array.isArray(obj.children) || obj.children.length === 0) {
    return current
  }
  return Math.max(
    ...obj.children.map((child) => measureDepth(child as Record<string, unknown>, current + 1))
  )
}

function containsMaliciousContent(text: string): boolean {
  const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick=']
  return dangerous.some((pattern) => text.toLowerCase().includes(pattern))
}

function validateAccessibility(
  component: Record<string, unknown>,
  context: EpochContext
): string[] {
  const errors: string[] = []
  const type = component.type as string

  // Check interactive elements have labels
  if (['Button', 'Input', 'Select'].includes(type)) {
    const props = component.props as Record<string, unknown>
    if (!props.label && !props.ariaLabel) {
      errors.push(`${type} component missing label or aria-label`)
    }
  }

  // Check form fields have descriptions
  if (type === 'FormField') {
    const props = component.props as Record<string, unknown>
    if (!props.label && !props.hint) {
      errors.push('FormField should have label or hint')
    }
  }

  return errors
}

function validateJsonPointerPath(path: string): string[] {
  const errors: string[] = []

  if (!path.startsWith('/')) {
    errors.push('JSON Pointer path must start with /')
  }

  // Validate path segments don't contain invalid characters
  const segments = path.split('/').slice(1)
  for (const segment of segments) {
    if (segment === '-' || segment === '') continue // Valid array operation
    if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
      errors.push(`Invalid path segment: ${segment}`)
    }
  }

  return errors
}
```

---

## Error Recovery

### 1. Retry Strategy

```typescript
interface RetryConfig {
  maxRetries: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitter: boolean
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  jitter: true,
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === finalConfig.maxRetries - 1) {
        throw error
      }

      // Calculate delay
      let delayMs = finalConfig.initialDelayMs * Math.pow(finalConfig.backoffMultiplier, attempt)
      if (finalConfig.jitter) {
        delayMs *= 0.5 + Math.random()
      }
      delayMs = Math.min(delayMs, finalConfig.maxDelayMs)

      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delayMs}ms:`,
        error
      )

      await delay(delayMs)
    }
  }
}
```

### 2. Error Classification & Recovery

```typescript
enum ErrorCategory {
  MALFORMED_JSON = 'MALFORMED_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
  CONTEXT_MISMATCH = 'CONTEXT_MISMATCH',
}

interface ErrorRecoveryStrategy {
  classify(error: Error): ErrorCategory
  canRecover(category: ErrorCategory): boolean
  recover(category: ErrorCategory, context: EpochContext): RecoveryAction
}

type RecoveryAction =
  | { type: 'retry'; delayMs: number; maxRetries: number }
  | { type: 'fallback'; strategy: 'minimal' | 'previous' | 'empty' }
  | { type: 'adjust'; changes: Partial<EpochContext> }
  | { type: 'fail'; message: string }

class EpochErrorRecovery implements ErrorRecoveryStrategy {
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
```

### 3. Fallback Strategies

```typescript
async function generateFallbackSchema(
  userPrompt: string,
  strategy: 'minimal' | 'previous' | 'empty',
  context: EpochContext
): Promise<SchemaPatch[]> {
  switch (strategy) {
    case 'minimal': {
      // Minimal valid schema with just essential structure
      return [
        {
          op: 'add',
          path: '/root',
          value: {
            type: 'Container',
            id: 'root',
            props: { padding: 'md' },
            children: [
              {
                type: 'Text',
                id: 'feedback',
                text: `Content generation in progress. Request: ${userPrompt.substring(0, 100)}...`,
                props: { size: 'body' },
              },
            ],
          },
        },
      ]
    }

    case 'previous': {
      // Return last known good schema
      if (context.conversationHistory.length > 0) {
        // Parse previous schema from history
        // (Implementation depends on history format)
        return []
      }
      return []
    }

    case 'empty': {
      // Truly empty schema
      return [
        {
          op: 'add',
          path: '/root',
          value: {
            type: 'Container',
            id: 'root',
            props: { padding: 'md' },
            children: [],
          },
        },
      ]
    }
  }
}

// User error messages for each recovery type
const USER_ERROR_MESSAGES: Record<ErrorCategory, string> = {
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
```

---

## LLM Provider Support

### 1. Provider Abstraction Layer

```typescript
interface LLMProvider {
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

abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string
  abstract model: string
  abstract maxTokens: number
  abstract supportsStreaming: boolean
  abstract costPer1kTokens: number
  config: Record<string, unknown>

  async validateConfig(): Promise<boolean> {
    // Override in subclasses
    return true
  }

  abstract generateSchema(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ConversationMessage[]
  ): AsyncGenerator<string>

  estimateTokens(text: string): number {
    // Default rough estimate
    return Math.ceil(text.length / 4)
  }
}
```

### 2. Anthropic Claude Implementation

```typescript
class AnthropicProvider extends BaseLLMProvider {
  name = 'Anthropic Claude'
  model = 'claude-opus-4-1-20250805'
  maxTokens = 100000
  supportsStreaming = true
  costPer1kTokens = 0.003
  private client: Anthropic

  constructor(apiKey?: string) {
    super()
    this.config = {
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
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
    } catch {
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
    // Claude uses approximately 1 token per 4 characters (more accurate for English)
    return Math.ceil(text.length / 4)
  }
}
```

### 3. OpenAI GPT Implementation

```typescript
class OpenAIProvider extends BaseLLMProvider {
  name = 'OpenAI GPT'
  model = 'gpt-4-turbo'
  maxTokens = 128000
  supportsStreaming = true
  costPer1kTokens = 0.01
  private client: OpenAI

  constructor(apiKey?: string) {
    super()
    this.config = {
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    }
    this.client = new OpenAI({
      apiKey: this.config.apiKey as string,
    })
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.client.models.retrieve('gpt-4-turbo')
      return true
    } catch {
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
    // GPT uses similar tokenization
    return Math.ceil(text.length / 4)
  }
}
```

### 4. Ollama (Local) Implementation

```typescript
class OllamaProvider extends BaseLLMProvider {
  name = 'Ollama (Local)'
  model = 'mistral' // or any local model
  maxTokens = 4096
  supportsStreaming = true
  costPer1kTokens = 0 // Free
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434', model?: string) {
    super()
    this.baseUrl = baseUrl
    if (model) this.model = model
    this.config = { baseUrl, model: this.model }
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch {
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
      { role: 'user' as const, content: userMessage },
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
      throw new Error('No response body')
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
```

### 5. Provider Factory & Selection

```typescript
class LLMProviderFactory {
  static create(config: EpochConfig): BaseLLMProvider {
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

  static async selectOptimalProvider(
    providers: BaseLLMProvider[],
    context: EpochContext
  ): Promise<BaseLLMProvider> {
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

  private static scoreProvider(
    provider: BaseLLMProvider,
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
```

---

## Integration Examples

### 1. Basic Usage

```typescript
// Initialize engine
const engine = new EpochEngine({
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 3,
  validateChunks: true,
})

// Prepare context
const context: EpochContext = {
  componentRegistry: buildComponentRegistry(),
  tokenRegistry: buildTokenRegistry(),
  dataModels: [
    {
      name: 'User',
      fields: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    },
  ],
  conversationHistory: [],
  tokenBudget: 4000,
  tokenUsed: 0,
  complexityBudget: 100,
  complexityUsed: 0,
  sessionId: 'session-123',
}

// Generate schema
const userPrompt = 'Create a user profile card showing name and email'

const patches: SchemaPatch[] = []
for await (const patch of engine.generateSchema(userPrompt, context)) {
  patches.push(patch)
  console.log('Received patch:', patch.op, patch.path)
}

console.log('Generated', patches.length, 'patches')
```

### 2. With Progress Tracking

```typescript
interface GenerationProgress {
  patchesGenerated: number
  tokensUsed: number
  complexityUsed: number
  startTime: number
  estimatedTimeRemaining: number
}

async function generateWithProgress(
  engine: EpochEngine,
  userPrompt: string,
  context: EpochContext,
  onProgress: (progress: GenerationProgress) => void
): Promise<SchemaPatch[]> {
  const patches: SchemaPatch[] = []
  const startTime = Date.now()

  for await (const patch of engine.generateSchema(userPrompt, context)) {
    patches.push(patch)

    const elapsed = Date.now() - startTime
    const avgTimePerPatch = elapsed / patches.length
    const estimatedRemaining = avgTimePerPatch * 10 // Assume ~10 more patches

    onProgress({
      patchesGenerated: patches.length,
      tokensUsed: context.tokenUsed,
      complexityUsed: context.complexityUsed,
      startTime,
      estimatedTimeRemaining: estimatedRemaining,
    })
  }

  return patches
}
```

### 3. Multi-turn Conversation

```typescript
async function generateWithHistory(
  engine: EpochEngine,
  userPrompts: string[],
  context: EpochContext
): Promise<SchemaPatch[]> {
  let allPatches: SchemaPatch[] = []

  for (const prompt of userPrompts) {
    const patches: SchemaPatch[] = []

    for await (const patch of engine.generateSchema(prompt, context, {
      includeHistory: true,
    })) {
      patches.push(patch)
    }

    allPatches.push(...patches)

    // Add to conversation history for next turn
    context.conversationHistory.push(
      { role: 'user', content: prompt, timestamp: Date.now() },
      {
        role: 'assistant',
        content: JSON.stringify(patches),
        timestamp: Date.now(),
      }
    )
  }

  return allPatches
}
```

### 4. Error Handling

```typescript
async function generateWithErrorHandling(
  engine: EpochEngine,
  userPrompt: string,
  context: EpochContext
): Promise<SchemaPatch[]> {
  try {
    const patches: SchemaPatch[] = []

    for await (const patch of engine.generateSchema(userPrompt, context)) {
      try {
        patches.push(patch)
      } catch (error) {
        console.warn('Patch processing error:', error)
        // Continue with next patch
      }
    }

    return patches
  } catch (error) {
    if (error instanceof EpochError) {
      switch (error.code) {
        case 'GENERATION_FAILED':
          console.error('Generation failed after retries:', error.message)
          // Return fallback schema
          return []

        case 'BUDGET_ERROR':
          console.error('Token budget exceeded')
          // Reduce context complexity
          context.complexityBudget = Math.floor(context.complexityBudget * 0.7)
          // Retry
          return generateWithErrorHandling(engine, userPrompt, context)

        default:
          throw error
      }
    }
    throw error
  }
}
```

---

## Performance & Budgets

### 1. Token Budget Estimation

```
System Prompt:        ~800 tokens (standard)
Component Registry:   ~500 tokens
Token Registry:       ~300 tokens
Data Models:          ~200 tokens per model
Conversation History: ~100 tokens per message
User Prompt:          variable (20-200 tokens)
Reserved for Response: 2000 tokens

Total for Claude Opus: 4,000 token budget
Remaining for generation: ~2,100 tokens
```

### 2. Complexity Budget Scoring

```
Base Complexity Score Calculation:

1. Nodes: 1 point per component
2. Depth: 1 point per level beyond 2
3. Data Bindings: 2 points each
4. Handlers: 1 point each
5. Conditional Logic: 3 points each
6. Loops/Maps: 5 points each

Maximum Allowed: 100 points

Example Scoring:
- Simple form (5 components, depth 3): 5 + 1 + 0 = 6 points
- Data table (15 components, depth 4, 3 bindings): 15 + 2 + 6 = 23 points
- Complex dashboard: 40-80 points
```

### 3. Performance Targets

```
Streaming Latency:
- First token: < 1 second
- Subsequent chunks: < 100ms
- Complete schema (20 patches): < 10 seconds

Token Usage:
- Simple prompt: 400-800 tokens
- Complex prompt: 1000-2000 tokens

Validation:
- Per-patch validation: < 5ms
- Full schema validation: < 50ms

Memory Usage:
- Single generation: < 50MB
- Concurrent generations (10): < 500MB
```

### 4. Cost Calculation

```typescript
interface GenerationCost {
  provider: string
  inputTokens: number
  outputTokens: number
  costPerM: number
  totalCost: number
}

function calculateCost(
  provider: BaseLLMProvider,
  inputTokens: number,
  outputTokens: number
): GenerationCost {
  const totalTokens = inputTokens + outputTokens
  const costPerM = provider.costPer1kTokens * 1000
  const totalCost = (totalTokens / 1000) * costPerM

  return {
    provider: provider.name,
    inputTokens,
    outputTokens,
    costPerM,
    totalCost,
  }
}

// Cost comparison
const anthropic = new AnthropicProvider()
const openai = new OpenAIProvider()

const inputTokens = 2000
const outputTokens = 1500

console.log('Costs for 2000 input + 1500 output tokens:')
console.log(calculateCost(anthropic, inputTokens, outputTokens))
// { provider: 'Anthropic Claude', inputTokens: 2000, outputTokens: 1500, costPerM: 3, totalCost: 0.0105 }

console.log(calculateCost(openai, inputTokens, outputTokens))
// { provider: 'OpenAI GPT', inputTokens: 2000, outputTokens: 1500, costPerM: 10, totalCost: 0.035 }
```

---

## Conclusion

The Epoch engine provides a robust, streaming-based approach to AI schema generation with:

- **Multi-provider support** (Claude, GPT-4, Ollama)
- **Incremental validation** at each patch
- **Budget management** to ensure determinism
- **Error recovery** with fallback strategies
- **Token optimization** for cost control
- **Full accessibility** guarantees
- **Component type safety** through Zod validation

This specification enables safe, predictable AI-driven UI generation while maintaining deterministic, verifiable outputs suitable for production systems.
