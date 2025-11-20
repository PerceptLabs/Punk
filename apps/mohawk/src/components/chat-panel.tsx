'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatPanelProps {
  onMessage: (message: string) => Promise<void>
  conversation: Message[]
  isStreaming?: boolean
}

function Message({ role, content, timestamp }: Message) {
  const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        role === 'user'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      }`}>
        <div className="text-sm mb-1 opacity-70">{role === 'user' ? 'You' : 'Mohawk'}</div>
        <div className="whitespace-pre-wrap">{content}</div>
        <div className="text-xs mt-1 opacity-60">{formattedTime}</div>
      </div>
    </div>
  )
}

export function ChatPanel({ onMessage, conversation, isStreaming = false }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isStreaming) return

    const message = input.trim()
    setInput('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await onMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const examplePrompts = [
    "Create a dashboard with cards and charts",
    "Build a login form with validation",
    "Make a product catalog with filters",
    "Design a user profile page"
  ]

  return (
    <div className="w-[35%] border-r border-gray-300 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mohawk Builder</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered app builder</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Start Building Your App
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Describe what you want to build and I'll generate it for you in real-time.
            </p>
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Try these examples:
              </p>
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {conversation.map((msg, i) => (
              <Message key={i} {...msg} />
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app..."
            disabled={isStreaming}
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isStreaming ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>
    </div>
  )
}
