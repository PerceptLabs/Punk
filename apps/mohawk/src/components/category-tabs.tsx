'use client'

import { useMemo } from 'react'
import { useComponentRegistry } from '@punk/core'
import {
  LayoutGrid,
  BarChart3,
  FileText,
  MousePointerClick,
  Navigation,
  Package,
} from 'lucide-react'

interface CategoryTabsProps {
  /** Currently active category */
  activeCategory: string
  /** Callback when category changes */
  onCategoryChange: (category: string) => void
  /** Custom class name */
  className?: string
  /** Show component counts */
  showCounts?: boolean
}

/**
 * Category configuration with icons and display names
 */
const CATEGORIES = [
  {
    id: 'All',
    label: 'All Components',
    icon: Package,
  },
  {
    id: 'Layout',
    label: 'Layout',
    icon: LayoutGrid,
  },
  {
    id: 'Data Visualization',
    label: 'Data Visualization',
    icon: BarChart3,
  },
  {
    id: 'Content',
    label: 'Content',
    icon: FileText,
  },
  {
    id: 'Input',
    label: 'Input',
    icon: MousePointerClick,
  },
  {
    id: 'Navigation',
    label: 'Navigation',
    icon: Navigation,
  },
] as const

/**
 * CategoryTabs - Tabbed interface for filtering components by category
 *
 * Features:
 * - Displays all available categories
 * - Shows component count per category
 * - Active tab highlighting
 * - Responsive design
 * - Dark mode support
 */
export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className = '',
  showCounts = true,
}: CategoryTabsProps) {
  const { getAllMeta, getByCategory } = useComponentRegistry()

  // Calculate component counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const allMeta = getAllMeta()

    // Count all components
    counts['All'] = allMeta.length

    // Count by category
    CATEGORIES.forEach(({ id }) => {
      if (id === 'All') return
      const categoryComponents = getByCategory(id)
      counts[id] = categoryComponents.length
    })

    return counts
  }, [getAllMeta, getByCategory])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Tabs Container */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const isActive = activeCategory === id
          const count = categoryCounts[id] || 0

          return (
            <button
              key={id}
              onClick={() => onCategoryChange(id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }
              `}
              aria-pressed={isActive}
              aria-label={`Filter by ${label}`}
            >
              {/* Icon */}
              <Icon size={16} />

              {/* Label */}
              <span>{label}</span>

              {/* Count Badge */}
              {showCounts && count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-xs font-semibold
                    ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * CategoryTabsMobile - Compact dropdown version for mobile devices
 */
export function CategoryTabsMobile({
  activeCategory,
  onCategoryChange,
  className = '',
  showCounts = true,
}: CategoryTabsProps) {
  const { getAllMeta, getByCategory } = useComponentRegistry()

  // Calculate component counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const allMeta = getAllMeta()

    counts['All'] = allMeta.length

    CATEGORIES.forEach(({ id }) => {
      if (id === 'All') return
      const categoryComponents = getByCategory(id)
      counts[id] = categoryComponents.length
    })

    return counts
  }, [getAllMeta, getByCategory])

  const activeItem = CATEGORIES.find(({ id }) => id === activeCategory)
  const ActiveIcon = activeItem?.icon || Package

  return (
    <div className={`relative ${className}`}>
      <select
        value={activeCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none cursor-pointer"
      >
        {CATEGORIES.map(({ id, label }) => {
          const count = categoryCounts[id] || 0
          return (
            <option key={id} value={id}>
              {label}
              {showCounts && count > 0 ? ` (${count})` : ''}
            </option>
          )
        })}
      </select>

      {/* Custom Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ActiveIcon size={16} className="text-gray-500 dark:text-gray-400" />
      </div>

      {/* Dropdown Arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500 dark:text-gray-400"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * Hook to get all available categories with counts
 */
export function useCategories() {
  const { getAllMeta, getByCategory } = useComponentRegistry()

  return useMemo(() => {
    const allMeta = getAllMeta()

    return CATEGORIES.map(({ id, label, icon }) => {
      const count = id === 'All' ? allMeta.length : getByCategory(id).length

      return {
        id,
        label,
        icon,
        count,
      }
    })
  }, [getAllMeta, getByCategory])
}
