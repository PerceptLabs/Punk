'use client'

import { useState } from 'react'
import { getRigA11yProfile } from '@punk/core'
import type { PunkNodeA11y } from '@punk/core'

interface A11yPanelProps {
  node: any
  onUpdate: (a11y: Partial<PunkNodeA11y>) => void
}

// Field label mappings
const FIELD_LABELS: Record<string, string> = {
  label: 'Screen reader label',
  description: 'Long description (optional)',
  caption: 'Table caption',
  summary: 'Summary (optional)',
}

// Heuristics for generating default A11y values
function generateHeuristicA11y(node: any): Partial<PunkNodeA11y> {
  const type = node.type
  const props = node.props || {}

  const heuristics: Record<string, Partial<PunkNodeA11y>> = {
    Chart: {
      label: `${props.type || 'Chart'} visualization`,
      description: props.title || undefined,
    },
    Table: {
      caption: 'Data table',
      summary: props.title || undefined,
    },
    Command: {
      label: 'Menu or command palette',
    },
    Mermaid: {
      label: 'Diagram',
      description: undefined,
    },
    FileDrop: {
      label: 'File upload area',
      description: props.accept ? `Accepts: ${props.accept}` : undefined,
    },
    Code: {
      label: 'Code block',
      description: props.language ? `Language: ${props.language}` : undefined,
    },
    RichText: {
      label: 'Rich text content',
      description: props.placeholder || undefined,
    },
    DatePicker: {
      label: 'Date picker',
      description: props.format ? `Format: ${props.format}` : undefined,
    },
  }

  return heuristics[type] || {}
}

export function A11yPanel({ node, onUpdate }: A11yPanelProps) {
  if (!node) return null

  const profile = getRigA11yProfile(node.type)
  if (!profile) return null

  const [isExpanded, setIsExpanded] = useState(true)
  const currentA11y = node.a11y || {}

  const handleFieldChange = (field: keyof PunkNodeA11y, value: string) => {
    onUpdate({
      ...currentA11y,
      [field]: value || undefined,
    })
  }

  const handleImprove = () => {
    const heuristic = generateHeuristicA11y(node)
    onUpdate({
      ...currentA11y,
      ...heuristic,
    })
  }

  const allFields = [...new Set([...profile.required, ...profile.optional])]

  return (
    <div className="border-t border-gray-300 dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Accessibility
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {node.type}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
          {/* Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
              ARIA Role: {profile.role}
            </p>
            <p>{profile.hint}</p>
          </div>

          {/* Improve Button */}
          <button
            onClick={handleImprove}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            ✨ Improve Accessibility
          </button>

          {/* Fields */}
          <div className="space-y-3">
            {allFields.map((field) => {
              const isRequired = profile.required.includes(field)
              const label = FIELD_LABELS[field] || field
              const value = currentA11y[field] || ''

              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {isRequired && (
                      <span className="text-red-500 ml-1" title="Required">
                        *
                      </span>
                    )}
                  </label>
                  {field === 'description' || field === 'summary' ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Current State */}
          {Object.keys(currentA11y).length > 0 && (
            <details className="mt-4">
              <summary className="text-xs font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                Current A11y Metadata
              </summary>
              <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-auto">
                {JSON.stringify(currentA11y, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
