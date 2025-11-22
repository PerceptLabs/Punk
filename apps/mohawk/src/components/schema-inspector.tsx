'use client'

import { useState } from 'react'
import { hasRigA11yProfile } from '@punk/core'
import type { PunkNodeA11y } from '@punk/core'
import { A11yPanel } from './a11y-panel'

interface SchemaInspectorProps {
  schema: any
  selectedNodeId?: string | null
  onSchemaChange?: (schema: any) => void
}

/**
 * Recursively find a node by ID in the schema tree
 */
function findNodeById(node: any, targetId: string): any | null {
  if (!node) return null
  if (node.id === targetId) return node

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId)
      if (found) return found
    }
  }

  return null
}

/**
 * Update a specific node's a11y metadata in the schema tree
 */
function updateNodeA11y(
  schema: any,
  nodeId: string,
  a11yUpdates: Partial<PunkNodeA11y>
): any {
  if (!schema || !nodeId) return schema

  // Clone the schema to avoid mutations
  const clonedSchema = JSON.parse(JSON.stringify(schema))

  // Find and update the node
  function updateInTree(node: any): boolean {
    if (!node) return false

    if (node.id === nodeId) {
      // Found the target node - update its a11y
      node.a11y = { ...node.a11y, ...a11yUpdates }
      return true
    }

    // Recurse into children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (updateInTree(child)) return true
      }
    }

    return false
  }

  // Start from root
  const root = clonedSchema.root || clonedSchema
  updateInTree(root)

  return clonedSchema
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

function NodePropertiesPanel({ node }: { node: any }) {
  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No node selected
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 bg-white dark:bg-gray-800 overflow-auto">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Node Details
        </h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Type:</span>
            <div className="text-sm font-mono text-blue-600 dark:text-blue-400">{node.type}</div>
          </div>
          {node.id && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">ID:</span>
              <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{node.id}</div>
            </div>
          )}
          {node.className && (
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Class:
              </span>
              <div className="text-sm font-mono text-gray-900 dark:text-gray-100">
                {node.className}
              </div>
            </div>
          )}
        </div>
      </div>

      {node.props && Object.keys(node.props).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Props</h3>
          <pre className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto">
            {JSON.stringify(node.props, null, 2)}
          </pre>
        </div>
      )}

      {node.children && node.children.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Children: {node.children.length}
          </span>
        </div>
      )}
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

export function SchemaInspector({
  schema,
  selectedNodeId,
  onSchemaChange,
}: SchemaInspectorProps) {
  // Find the selected node if any
  const schemaRoot = schema?.root || schema
  const selectedNode = selectedNodeId ? findNodeById(schemaRoot, selectedNodeId) : null

  // Handle A11y updates
  const handleA11yUpdate = (a11yUpdates: Partial<PunkNodeA11y>) => {
    if (!selectedNodeId || !onSchemaChange) return
    const updatedSchema = updateNodeA11y(schema, selectedNodeId, a11yUpdates)
    onSchemaChange(updatedSchema)
  }

  // Build tabs based on selection
  const tabs: TabConfig[] = []

  if (selectedNode) {
    // Node is selected - show node-specific tabs
    tabs.push({
      value: 'properties',
      label: 'Properties',
      content: <NodePropertiesPanel node={selectedNode} />,
    })

    // Show A11y tab only if node has an a11y profile
    if (hasRigA11yProfile(selectedNode.type)) {
      tabs.push({
        value: 'accessibility',
        label: 'Accessibility',
        content: (
          <div className="h-full overflow-auto">
            <A11yPanel node={selectedNode} onUpdate={handleA11yUpdate} />
          </div>
        ),
      })
    }

    // Still show the full schema for reference
    tabs.push({
      value: 'schema',
      label: 'Full Schema',
      content: <JSONViewer data={schema} />,
    })
  } else {
    // No node selected - show default tabs
    tabs.push({
      value: 'schema',
      label: 'Schema',
      content: <JSONViewer data={schema} />,
    })
    tabs.push({
      value: 'code',
      label: 'Code',
      content: <CodeViewer schema={schema} />,
    })
    tabs.push({
      value: 'settings',
      label: 'Settings',
      content: <SettingsPanel />,
    })
  }

  return (
    <div className="h-64 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      {selectedNode && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <span className="text-xs font-medium text-blue-900 dark:text-blue-300">
            Inspecting: <span className="font-mono">{selectedNode.type}</span>
            {selectedNode.id && <span className="opacity-75"> #{selectedNode.id}</span>}
          </span>
        </div>
      )}
      <Tabs tabs={tabs} />
    </div>
  )
}
