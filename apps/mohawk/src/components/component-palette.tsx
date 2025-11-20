'use client'

import { useState, useMemo } from 'react'
import { useComponentRegistry } from '@punk/core'
import type { ComponentMeta } from '@punk/core'
import * as Icons from 'lucide-react'
import { Search, Package } from 'lucide-react'

interface ComponentPaletteProps {
  /** Filter by category */
  category?: string
  /** Filter by complexity level */
  complexity?: 'simple' | 'medium' | 'advanced'
  /** Callback when a component is selected */
  onComponentSelect?: (type: string, meta: ComponentMeta) => void
  /** Enable drag-to-canvas functionality */
  enableDrag?: boolean
  /** Custom class name */
  className?: string
}

interface ComponentCardProps {
  type: string
  meta: ComponentMeta
  onSelect?: (type: string, meta: ComponentMeta) => void
  enableDrag?: boolean
}

/**
 * Get Lucide icon component by name
 */
function getIcon(iconName: string): React.ComponentType<any> | null {
  // Convert kebab-case to PascalCase (e.g., 'bar-chart-2' -> 'BarChart2')
  const pascalName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  const IconComponent = (Icons as any)[pascalName]
  return IconComponent || null
}

/**
 * ComponentCard - Individual component card in the palette
 */
function ComponentCard({ type, meta, onSelect, enableDrag }: ComponentCardProps) {
  const IconComponent = getIcon(meta.icon) || Package

  const handleDragStart = (e: React.DragEvent) => {
    if (!enableDrag) return

    // Store component data for drop handler
    e.dataTransfer.setData('application/punk-component', JSON.stringify({ type, meta }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleClick = () => {
    onSelect?.(type, meta)
  }

  const complexityColors = {
    simple: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div
      draggable={enableDrag}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`
        group relative p-4 rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750
        hover:border-blue-500 dark:hover:border-blue-400
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:scale-105
        ${enableDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
      `}
      role="button"
      tabIndex={0}
      aria-label={`Add ${meta.displayName} component`}
    >
      {/* Icon & Title */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-shrink-0 p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <IconComponent size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {meta.displayName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Tags & Complexity */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {/* Complexity Badge */}
        <span
          className={`
            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
            ${complexityColors[meta.complexity]}
          `}
        >
          {meta.complexity}
        </span>

        {/* Tags */}
        {meta.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}

        {meta.tags.length > 2 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            +{meta.tags.length - 2}
          </span>
        )}
      </div>

      {/* Drag indicator */}
      {enableDrag && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-gray-400 dark:text-gray-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="opacity-50"
            >
              <circle cx="4" cy="4" r="1.5" />
              <circle cx="4" cy="8" r="1.5" />
              <circle cx="4" cy="12" r="1.5" />
              <circle cx="8" cy="4" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ComponentPalette - Displays all registered components with search and filtering
 */
export function ComponentPalette({
  category,
  complexity,
  onComponentSelect,
  enableDrag = true,
  className = '',
}: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Get registry data
  const { getAllMeta } = useComponentRegistry()

  // Get all components with metadata
  const allComponents = useMemo(() => {
    const metaEntries = getAllMeta()
    return metaEntries
      .map(([type, meta]) => ({ type, meta }))
      .sort((a, b) => a.meta.displayName.localeCompare(b.meta.displayName))
  }, [getAllMeta])

  // Filter components based on search, category, and complexity
  const filteredComponents = useMemo(() => {
    let filtered = allComponents

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(({ type, meta }) => {
        return (
          meta.displayName.toLowerCase().includes(query) ||
          meta.description.toLowerCase().includes(query) ||
          meta.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          type.toLowerCase().includes(query)
        )
      })
    }

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(({ meta }) => meta.category === category)
    }

    // Filter by complexity
    if (complexity) {
      filtered = filtered.filter(({ meta }) => meta.complexity === complexity)
    }

    return filtered
  }, [allComponents, searchQuery, category, complexity])

  // Group components by category for display
  const groupedComponents = useMemo(() => {
    const groups: Record<string, Array<{ type: string; meta: ComponentMeta }>> = {}

    filteredComponents.forEach((component) => {
      const cat = component.meta.category
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(component)
    })

    return groups
  }, [filteredComponents])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Bar */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          />
        </div>

        {/* Results count */}
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Component Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <Package size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No components found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : category && category !== 'All' ? (
          // Show flat grid when filtered by category
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map(({ type, meta }) => (
              <ComponentCard
                key={type}
                type={type}
                meta={meta}
                onSelect={onComponentSelect}
                enableDrag={enableDrag}
              />
            ))}
          </div>
        ) : (
          // Show grouped by category when showing all
          <div className="space-y-6">
            {Object.entries(groupedComponents).map(([categoryName, components]) => (
              <div key={categoryName}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span>{categoryName}</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({components.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {components.map(({ type, meta }) => (
                    <ComponentCard
                      key={type}
                      type={type}
                      meta={meta}
                      onSelect={onComponentSelect}
                      enableDrag={enableDrag}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
