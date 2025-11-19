'use client'

import { useState } from 'react'

interface SchemaInspectorProps {
  schema: any
  onSchemaChange?: (schema: any) => void
}

interface TabConfig {
  value: string
  label: string
  content: React.ReactNode
}

function Tabs({ tabs }: { tabs: TabConfig[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || '')

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {tabs.find(tab => tab.value === activeTab)?.content}
      </div>
    </div>
  )
}

function JSONViewer({ data }: { data: any }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2)
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No schema data available
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors z-10"
      >
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>
      <pre className="p-4 text-sm overflow-auto h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  )
}

function CodeViewer({ schema }: { schema: any }) {
  if (!schema) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No schema to convert to code
      </div>
    )
  }

  // Generate sample React code from schema
  const generateCode = () => {
    return `import { PunkRenderer } from '@punk/core'

export default function GeneratedApp() {
  const schema = ${JSON.stringify(schema, null, 2)}

  const data = {}
  const actions = {}

  return (
    <PunkRenderer
      schema={schema}
      data={data}
      actions={actions}
    />
  )
}
`
  }

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative h-full">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors z-10"
      >
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>
      <pre className="p-4 text-sm overflow-auto h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <code>{generateCode()}</code>
      </pre>
    </div>
  )
}

function SettingsPanel() {
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4000)

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          AI Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
          <option value="claude-3-opus-20240229">Claude 3 Opus</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Temperature: {temperature}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Max Tokens
        </label>
        <input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview Settings
        </h3>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" defaultChecked />
          <span className="text-sm text-gray-700 dark:text-gray-300">Live preview updates</span>
        </label>
        <label className="flex items-center space-x-2 mt-2">
          <input type="checkbox" className="rounded" defaultChecked />
          <span className="text-sm text-gray-700 dark:text-gray-300">Auto-save schemas</span>
        </label>
        <label className="flex items-center space-x-2 mt-2">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show component tree</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Clear Conversation & Schema
        </button>
      </div>
    </div>
  )
}

export function SchemaInspector({ schema, onSchemaChange }: SchemaInspectorProps) {
  const tabs: TabConfig[] = [
    {
      value: 'schema',
      label: 'Schema',
      content: <JSONViewer data={schema} />
    },
    {
      value: 'code',
      label: 'Code',
      content: <CodeViewer schema={schema} />
    },
    {
      value: 'settings',
      label: 'Settings',
      content: <SettingsPanel />
    }
  ]

  return (
    <div className="h-64 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Tabs tabs={tabs} />
    </div>
  )
}
