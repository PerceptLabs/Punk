'use client'

import { useState } from 'react'
import { ChatPanel } from '@/components/chat-panel'
import { PreviewPanel } from '@/components/preview-panel'
import { SchemaInspector } from '@/components/schema-inspector'
import { ComponentPalette } from '@/components/component-palette'
import { CategoryTabs } from '@/components/category-tabs'
import type { ComponentMeta } from '@punk/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function BuilderPage() {
  const [schema, setSchema] = useState<any>(null)
  const [conversation, setConversation] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  // Component palette state
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)
  const [showBeginnerMode, setShowBeginnerMode] = useState(false)

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

  // Handler for component selection from palette
  const handleComponentSelect = (type: string, meta: ComponentMeta) => {
    // Auto-insert into chat message (optional)
    console.log('Component selected:', { type, meta })

    // TODO: In the future, this could auto-insert a prompt into the chat
    // or directly add the component to the schema
  }

  // Filter by beginner mode (show only simple complexity)
  const activeComplexity = showBeginnerMode ? 'simple' : undefined

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Component Palette Sidebar (collapsible) */}
      <div
        className={`
          flex-shrink-0 border-r border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 transition-all duration-300
          ${isPaletteOpen ? 'w-80' : 'w-0'}
        `}
      >
        {isPaletteOpen && (
          <div className="flex flex-col h-full">
            {/* Palette Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Components
                </h2>
                <button
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                  aria-label="Close component palette"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Beginner/Advanced Toggle */}
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBeginnerMode}
                    onChange={(e) => setShowBeginnerMode(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Beginner Mode
                  </span>
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  (Show simple components only)
                </span>
              </div>

              {/* Category Tabs */}
              <CategoryTabs
                activeCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Component Palette Content */}
            <ComponentPalette
              category={selectedCategory}
              complexity={activeComplexity}
              onComponentSelect={handleComponentSelect}
              enableDrag={true}
            />
          </div>
        )}
      </div>

      {/* Collapse/Expand Button (when closed) */}
      {!isPaletteOpen && (
        <button
          onClick={() => setIsPaletteOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-md shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          aria-label="Open component palette"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Chat Panel */}
      <div className="flex-shrink-0 w-[35%]">
        <ChatPanel
          onMessage={handleMessage}
          conversation={conversation}
          isStreaming={isStreaming}
        />
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col">
        <PreviewPanel schema={schema} />
        <SchemaInspector schema={schema} onSchemaChange={setSchema} />
      </div>
    </div>
  )
}
