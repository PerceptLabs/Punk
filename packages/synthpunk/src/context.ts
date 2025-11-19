/**
 * SynthPunk - Context Management
 */

import {
  EpochContext,
  ComponentSchema,
  DesignToken,
  DataModel,
  TokenBudgetTracker,
  PunkSchema,
} from './types'
import { SYSTEM_PROMPT, buildUserMessage } from './prompts'

/**
 * Build default component registry
 */
export function buildComponentRegistry(): Map<string, ComponentSchema> {
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
            enum: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
            defaultValue: 'md',
          },
          gap: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
          },
          direction: {
            type: 'enum',
            enum: ['row', 'column'],
            defaultValue: 'column',
          },
          align: {
            type: 'enum',
            enum: ['start', 'center', 'end', 'stretch'],
          },
          justify: {
            type: 'enum',
            enum: ['start', 'center', 'end', 'between', 'around'],
          },
          background: { type: 'string' },
          border: { type: 'string' },
        },
        children: true,
        maxChildren: 12,
      },
    ],
    [
      'Box',
      {
        type: 'Box',
        label: 'Box',
        icon: 'square',
        props: {
          padding: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg', 'xl'],
          },
          background: { type: 'string' },
          border: { type: 'string' },
          shadow: {
            type: 'enum',
            enum: ['sm', 'md', 'lg'],
          },
        },
        children: true,
      },
    ],
    [
      'Text',
      {
        type: 'Text',
        label: 'Text',
        icon: 'type',
        props: {
          size: {
            type: 'enum',
            enum: ['h1', 'h2', 'h3', 'body', 'caption'],
            defaultValue: 'body',
          },
          weight: {
            type: 'enum',
            enum: ['normal', 'medium', 'semibold', 'bold'],
          },
          color: { type: 'string' },
          align: {
            type: 'enum',
            enum: ['left', 'center', 'right', 'justify'],
          },
          lineHeight: { type: 'number' },
        },
        children: false,
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
          onClick: { type: 'string' },
        },
        children: false,
      },
    ],
    [
      'Input',
      {
        type: 'Input',
        label: 'Input',
        icon: 'edit',
        props: {
          type: {
            type: 'enum',
            enum: ['text', 'email', 'password', 'number', 'tel', 'url'],
            defaultValue: 'text',
          },
          placeholder: { type: 'string' },
          label: { type: 'string' },
          defaultValue: { type: 'string' },
          required: { type: 'boolean', defaultValue: false },
        },
        children: false,
      },
    ],
    [
      'Select',
      {
        type: 'Select',
        label: 'Select',
        icon: 'list',
        props: {
          label: { type: 'string' },
          options: { type: 'array', required: true },
          defaultValue: { type: 'string' },
          multiple: { type: 'boolean', defaultValue: false },
        },
        children: false,
      },
    ],
    [
      'Form',
      {
        type: 'Form',
        label: 'Form',
        icon: 'form',
        props: {
          layout: {
            type: 'enum',
            enum: ['vertical', 'horizontal', 'inline'],
            defaultValue: 'vertical',
          },
          spacing: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg'],
            defaultValue: 'md',
          },
          onSubmit: { type: 'string' },
        },
        children: true,
      },
    ],
    [
      'FormField',
      {
        type: 'FormField',
        label: 'Form Field',
        icon: 'input',
        props: {
          label: { type: 'string' },
          hint: { type: 'string' },
          error: { type: 'string' },
          required: { type: 'boolean', defaultValue: false },
        },
        children: true,
        maxChildren: 1,
      },
    ],
    [
      'DataGrid',
      {
        type: 'DataGrid',
        label: 'Data Grid',
        icon: 'table',
        props: {
          columns: { type: 'array', required: true },
          data: { type: 'string', required: true },
          striped: { type: 'boolean', defaultValue: false },
          sortable: { type: 'boolean', defaultValue: false },
        },
        children: false,
      },
    ],
    [
      'Card',
      {
        type: 'Card',
        label: 'Card',
        icon: 'card',
        props: {
          padding: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg', 'xl'],
            defaultValue: 'md',
          },
          shadow: {
            type: 'enum',
            enum: ['sm', 'md', 'lg'],
            defaultValue: 'md',
          },
          border: { type: 'boolean', defaultValue: false },
        },
        children: true,
      },
    ],
    [
      'Badge',
      {
        type: 'Badge',
        label: 'Badge',
        icon: 'tag',
        props: {
          variant: {
            type: 'enum',
            enum: ['primary', 'secondary', 'success', 'danger', 'warning'],
            defaultValue: 'primary',
          },
          size: {
            type: 'enum',
            enum: ['sm', 'md', 'lg'],
            defaultValue: 'md',
          },
        },
        children: false,
      },
    ],
    [
      'Avatar',
      {
        type: 'Avatar',
        label: 'Avatar',
        icon: 'user',
        props: {
          src: { type: 'string' },
          size: {
            type: 'enum',
            enum: ['sm', 'md', 'lg', 'xl'],
            defaultValue: 'md',
          },
          fallback: { type: 'string' },
          alt: { type: 'string' },
        },
        children: false,
      },
    ],
    [
      'Modal',
      {
        type: 'Modal',
        label: 'Modal',
        icon: 'window',
        props: {
          open: { type: 'boolean', required: true },
          title: { type: 'string' },
          onClose: { type: 'string' },
          size: {
            type: 'enum',
            enum: ['sm', 'md', 'lg', 'xl'],
            defaultValue: 'md',
          },
        },
        children: true,
      },
    ],
    [
      'Tabs',
      {
        type: 'Tabs',
        label: 'Tabs',
        icon: 'tabs',
        props: {
          defaultTab: { type: 'string' },
          tabs: { type: 'array', required: true },
        },
        children: true,
      },
    ],
    [
      'Stack',
      {
        type: 'Stack',
        label: 'Stack',
        icon: 'layers',
        props: {
          direction: {
            type: 'enum',
            enum: ['row', 'column'],
            defaultValue: 'column',
          },
          spacing: {
            type: 'enum',
            enum: ['xs', 'sm', 'md', 'lg', 'xl'],
            defaultValue: 'md',
          },
          align: {
            type: 'enum',
            enum: ['start', 'center', 'end', 'stretch'],
          },
          justify: {
            type: 'enum',
            enum: ['start', 'center', 'end', 'between', 'around'],
          },
        },
        children: true,
      },
    ],
  ])
}

/**
 * Build default design token registry
 */
export function buildTokenRegistry(): Map<string, DesignToken> {
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
  const typography = {
    h1: { size: '32px', weight: 700, lineHeight: 1.2 },
    h2: { size: '24px', weight: 700, lineHeight: 1.3 },
    h3: { size: '20px', weight: 600, lineHeight: 1.4 },
    body: { size: '16px', weight: 400, lineHeight: 1.5 },
    caption: { size: '14px', weight: 400, lineHeight: 1.4 },
  }
  for (const [name, value] of Object.entries(typography)) {
    tokens.set(`typography-${name}`, {
      name: `typography-${name}`,
      value,
      type: 'typography',
      group: 'typography',
    })
  }

  // Shadow tokens
  const shadows = {
    sm: '0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  }
  for (const [name, value] of Object.entries(shadows)) {
    tokens.set(`shadow-${name}`, {
      name: `shadow-${name}`,
      value,
      type: 'shadow',
      group: 'shadows',
    })
  }

  // Radius tokens
  const radius = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  }
  for (const [name, value] of Object.entries(radius)) {
    tokens.set(`radius-${name}`, {
      name: `radius-${name}`,
      value,
      type: 'radius',
      group: 'radius',
    })
  }

  return tokens
}

/**
 * Create a new Epoch context
 */
export function createContext(
  dataModels: DataModel[] = [],
  userPreferences?: EpochContext['userPreferences']
): EpochContext {
  return {
    componentRegistry: buildComponentRegistry(),
    tokenRegistry: buildTokenRegistry(),
    dataModels,
    conversationHistory: [],
    tokenBudget: 100000, // Claude Sonnet 4.5 max
    tokenUsed: 0,
    complexityBudget: 100,
    complexityUsed: 0,
    userPreferences,
    sessionId: generateSessionId(),
    createdAt: Date.now(),
  }
}

/**
 * Calculate token budget distribution
 */
export function calculateTokenBudget(context: EpochContext): TokenBudgetTracker {
  const systemPromptTokens = estimateTokens(SYSTEM_PROMPT)
  const contextTokens = estimateTokens(formatContextForPrompt(context))
  const historyTokens = context.conversationHistory.reduce(
    (sum, msg) => sum + estimateTokens(msg.content),
    0
  )
  const reserved = 2000 // Reserve for response

  const total = context.tokenBudget
  const used = systemPromptTokens + contextTokens + historyTokens
  const remaining = Math.max(0, total - used - reserved)

  return {
    total,
    systemPrompt: systemPromptTokens,
    context: contextTokens,
    userMessage: historyTokens,
    reserved,
    remaining,
  }
}

/**
 * Format context for inclusion in prompts
 */
function formatContextForPrompt(context: EpochContext): string {
  let output = 'Available Components:\n'
  output += Array.from(context.componentRegistry.keys()).join(', ')
  output += '\n\n'

  if (context.dataModels.length > 0) {
    output += 'Data Models:\n'
    for (const model of context.dataModels) {
      output += `- ${model.name}: ${Object.keys(model.fields).join(', ')}\n`
    }
    output += '\n'
  }

  if (context.userPreferences) {
    output += 'User Preferences:\n'
    output += JSON.stringify(context.userPreferences, null, 2)
    output += '\n'
  }

  return output
}

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Approximate: 1 token ≈ 4 characters for English
  return Math.ceil(text.length / 4)
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `epoch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Update context with usage metrics
 */
export function updateContextMetrics(
  context: EpochContext,
  tokensUsed: number,
  complexityUsed: number
): void {
  context.tokenUsed += tokensUsed
  context.complexityUsed += complexityUsed
}
