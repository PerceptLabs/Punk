'use client'

import { useState } from 'react'
import { ChatPanel } from '@/components/chat-panel'
import { PreviewPanel } from '@/components/preview-panel'
import { SchemaInspector } from '@/components/schema-inspector'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function BuilderPage() {
  const [schema, setSchema] = useState<any>(null)
  const [conversation, setConversation] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleMessage(message: string) {
    // Add user message to conversation
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    }
    setConversation(prev => [...prev, userMessage])
    setIsStreaming(true)

    try {
      // Call API endpoint with SSE
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          context: {
            currentSchema: schema,
            conversation: conversation.slice(-10) // Last 10 messages for context
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate schema')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)

              try {
                const patch = JSON.parse(data)

                if (patch.type === 'schema_chunk') {
                  // Update schema in real-time
                  setSchema(patch.data)
                } else if (patch.type === 'message_chunk') {
                  // Accumulate assistant message
                  assistantMessage += patch.data
                } else if (patch.type === 'schema_complete') {
                  // Final schema
                  setSchema(patch.data)
                } else if (patch.type === 'error') {
                  console.error('Schema generation error:', patch.message)
                }
              } catch (e) {
                // Skip invalid JSON chunks
                console.warn('Invalid JSON chunk:', data)
              }
            }
          }
        }
      }

      // Add assistant message to conversation
      const assistantMsg: Message = {
        role: 'assistant',
        content: assistantMessage || 'Schema generated successfully',
        timestamp: Date.now()
      }
      setConversation(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error('Error generating schema:', error)

      // Add error message
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error generating the schema. Please try again.',
        timestamp: Date.now()
      }
      setConversation(prev => [...prev, errorMsg])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat Panel (35%) */}
      <ChatPanel
        onMessage={handleMessage}
        conversation={conversation}
        isStreaming={isStreaming}
      />

      {/* Preview Panel (65%) */}
      <div className="flex-1 flex flex-col">
        <PreviewPanel schema={schema} />
        <SchemaInspector schema={schema} onSchemaChange={setSchema} />
      </div>
    </div>
  )
}
