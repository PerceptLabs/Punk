'use client'

import { useState } from 'react'
import { PunkRenderer } from '@punk/core'

type Viewport = 'mobile' | 'tablet' | 'desktop'

interface PreviewPanelProps {
  schema: any
  onNodeSelect?: (nodeId: string | null) => void
  selectedNodeId?: string | null
}

function ViewportToggle({
  value,
  onChange
}: {
  value: Viewport
  onChange: (viewport: Viewport) => void
}) {
  const viewports: { value: Viewport; label: string; icon: string }[] = [
    { value: 'mobile', label: 'Mobile', icon: '📱' },
    { value: 'tablet', label: 'Tablet', icon: '📱' },
    { value: 'desktop', label: 'Desktop', icon: '🖥️' }
  ]

  return (
    <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
      {viewports.map(({ value: v, label, icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            value === v
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
          title={label}
        >
          <span className="mr-1">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  )
}

function RefreshButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
      title="Refresh Preview"
    >
      🔄 Refresh
    </button>
  )
}

function ExportButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
      title="Export Schema"
    >
      💾 Export
    </button>
  )
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">🎨</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No Preview Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        Start a conversation in the chat panel to generate your app.
        Your preview will appear here in real-time as the AI builds it.
      </p>
    </div>
  )
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
        Preview Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md">
        {error}
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
        Fix with AI
      </button>
    </div>
  )
}

function SchemaTree({
  node,
  onNodeSelect,
  selectedNodeId,
  depth = 0
}: {
  node: any
  onNodeSelect: (nodeId: string | null) => void
  selectedNodeId: string | null
  depth?: number
}) {
  const hasChildren = node?.children && node.children.length > 0
  const [isExpanded, setIsExpanded] = useState(depth < 2) // Auto-expand first 2 levels

  if (!node) return null

  return (
    <div className="text-xs">
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${
          selectedNodeId === node.id ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation()
          onNodeSelect(node.id || null)
        }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="w-4 h-4 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <span className="font-mono text-blue-600 dark:text-blue-400">{node.type}</span>
        {node.id && <span className="text-gray-500 dark:text-gray-400">#{node.id}</span>}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child: any, i: number) => (
            <SchemaTree
              key={child.id || `${child.type}-${i}`}
              node={child}
              onNodeSelect={onNodeSelect}
              selectedNodeId={selectedNodeId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function PreviewPanel({ schema, onNodeSelect, selectedNodeId }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showTree, setShowTree] = useState(false)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setRenderError(null)
  }

  const handleExport = () => {
    if (!schema) return

    const dataStr = JSON.stringify(schema, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `mohawk-schema-${Date.now()}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const viewportClasses = {
    mobile: 'max-w-sm',
    tablet: 'max-w-2xl',
    desktop: 'max-w-full'
  }

  const schemaNode = schema?.root || schema

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="p-2 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800">
        <ViewportToggle value={viewport} onChange={setViewport} />
        <div className="flex-1" />
        {schema && (
          <button
            onClick={() => setShowTree(!showTree)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showTree
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            title="Toggle Schema Tree"
          >
            🌲 Tree
          </button>
        )}
        <RefreshButton onClick={handleRefresh} />
        <ExportButton onClick={handleExport} />
      </div>

      {/* Preview Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Tree (Collapsible) */}
        {showTree && schema && onNodeSelect && (
          <div className="w-64 border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-auto p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Schema Tree
              </h3>
              <button
                onClick={() => onNodeSelect(null)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear
              </button>
            </div>
            <SchemaTree
              node={schemaNode}
              onNodeSelect={onNodeSelect}
              selectedNodeId={selectedNodeId || null}
            />
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-4">
          <div
            className={`bg-white dark:bg-gray-800 shadow-lg mx-auto min-h-full rounded-lg ${viewportClasses[viewport]}`}
          >
            {renderError ? (
              <ErrorState error={renderError} />
            ) : schema ? (
              <div key={refreshKey} className="p-4">
                <PunkRenderer
                  schema={schema}
                  data={{}}
                  actions={{}}
                  onError={(error) => setRenderError(error.message)}
                />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
