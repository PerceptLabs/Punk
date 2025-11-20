/**
 * Type definitions for Mohawk
 */

// Message types for chat
export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// SSE Event types from the API
export type SSEEventType = 'schema_chunk' | 'message_chunk' | 'schema_complete' | 'error'

export interface SSEEvent {
  type: SSEEventType
  data?: any
  message?: string
}

// Schema streaming events
export interface SchemaChunkEvent extends SSEEvent {
  type: 'schema_chunk'
  data: any // Partial or complete schema
}

export interface MessageChunkEvent extends SSEEvent {
  type: 'message_chunk'
  data: string // Chunk of assistant message
}

export interface SchemaCompleteEvent extends SSEEvent {
  type: 'schema_complete'
  data: any // Final complete schema
}

export interface ErrorEvent extends SSEEvent {
  type: 'error'
  message: string
}

// API request/response types
export interface GenerateRequest {
  prompt: string
  context?: {
    currentSchema?: any
    conversation?: Message[]
  }
}

// Database types
export interface Project {
  id: number
  name: string
  description?: string
  schema?: string
  userId?: number
  createdAt: number
  updatedAt: number
}

export interface Revision {
  id: number
  projectId: number
  schema: string
  actor: 'user' | 'ai'
  prompt?: string
  createdAt: number
}

export interface Conversation {
  id: number
  projectId: number
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface Deployment {
  id: number
  projectId: number
  revisionId?: number
  platform: 'vercel' | 'cloudflare' | 'docker' | 'static'
  url?: string
  status: 'pending' | 'building' | 'success' | 'failed'
  logs?: string
  createdAt: number
  completedAt?: number
}

// Component props
export interface ChatPanelProps {
  onMessage: (message: string) => Promise<void>
  conversation: Message[]
  isStreaming?: boolean
}

export interface PreviewPanelProps {
  schema: any
}

export interface SchemaInspectorProps {
  schema: any
  onSchemaChange?: (schema: any) => void
}

// Viewport types
export type Viewport = 'mobile' | 'tablet' | 'desktop'

// Epoch Engine types
export interface EpochConfig {
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
}

export interface SchemaPatch {
  type: 'schema_delta' | 'message' | 'complete' | 'error'
  delta?: any
  content?: string
  schema?: any
  message?: string
}
