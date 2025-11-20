/**
 * @punk/component-command
 * Command menu component wrapper using cmdk
 */

import React from 'react'
import { z } from 'zod'
import { Command as CMDKCommand } from 'cmdk'
import { registerComponent } from '@punk/core'

// 1. Zod Schema (for SynthPunk)
export const CommandItemSchema = z.object({
  /** Unique item ID */
  id: z.string(),

  /** Display label */
  label: z.string(),

  /** Optional icon (Lucide icon name) */
  icon: z.string().optional(),

  /** Search keywords */
  keywords: z.array(z.string()).optional(),

  /** Action to trigger on select */
  action: z.string().optional(),

  /** Item is disabled */
  disabled: z.boolean().optional(),
})

export const CommandGroupSchema = z.object({
  /** Group heading */
  heading: z.string().optional(),

  /** Items in this group */
  items: z.array(CommandItemSchema),
})

export const CommandPropsSchema = z.object({
  /** Placeholder text for search input */
  placeholder: z.string().default('Type a command or search...'),

  /** Command items (can be flat array or grouped) */
  items: z.array(z.union([CommandItemSchema, CommandGroupSchema])),

  /** Action to trigger on item selection */
  onSelect: z.string().optional(),

  /** Enable search functionality */
  searchable: z.boolean().default(true),

  /** Show search input */
  showSearch: z.boolean().default(true),

  /** Empty state message */
  emptyMessage: z.string().default('No results found.'),

  /** Filter function for custom search */
  filterFunction: z.string().optional(),
})

export const CommandSchemaMap = {
  Command: CommandPropsSchema,
}

// 2. Metadata (for Mohawk)
export const CommandMeta = {
  displayName: 'Command Menu',
  description: 'Command palette for quick actions and navigation',
  icon: 'terminal',
  category: 'Navigation',
  tags: ['command', 'search', 'menu', 'palette', 'navigation'],
  complexity: 'medium' as const,
}

// 3. Component (renderer-agnostic)
export interface CommandProps extends z.infer<typeof CommandPropsSchema> {
  /** Optional className for styling */
  className?: string
}

// Type guard to check if item is a group
function isCommandGroup(
  item: z.infer<typeof CommandItemSchema> | z.infer<typeof CommandGroupSchema>
): item is z.infer<typeof CommandGroupSchema> {
  return 'items' in item && Array.isArray(item.items)
}

export function Command({
  placeholder = 'Type a command or search...',
  items = [],
  onSelect,
  searchable = true,
  showSearch = true,
  emptyMessage = 'No results found.',
  className,
}: CommandProps) {
  const [searchValue, setSearchValue] = React.useState('')

  // Handle item selection
  const handleSelect = (itemId: string, action?: string) => {
    const actionToTrigger = action || onSelect
    if (actionToTrigger) {
      // Trigger action via ActionBus
      // This will be handled by the PunkRenderer's action context
      console.log('Command item selected:', itemId, 'Action:', actionToTrigger)
    }
  }

  // Render a single command item
  const renderItem = (item: z.infer<typeof CommandItemSchema>) => (
    <CMDKCommand.Item
      key={item.id}
      value={item.id}
      keywords={item.keywords}
      onSelect={() => handleSelect(item.id, item.action)}
      disabled={item.disabled}
    >
      {item.icon && <span className="command-item-icon">{item.icon}</span>}
      <span className="command-item-label">{item.label}</span>
    </CMDKCommand.Item>
  )

  return (
    <CMDKCommand
      className={className}
      filter={searchable ? undefined : () => 1}
      value={searchValue}
      onValueChange={setSearchValue}
    >
      {showSearch && (
        <CMDKCommand.Input placeholder={placeholder} value={searchValue} />
      )}

      <CMDKCommand.List>
        <CMDKCommand.Empty>{emptyMessage}</CMDKCommand.Empty>

        {items.map((item, index) => {
          if (isCommandGroup(item)) {
            // Render as group
            return (
              <CMDKCommand.Group key={index} heading={item.heading}>
                {item.items.map(renderItem)}
              </CMDKCommand.Group>
            )
          } else {
            // Render as standalone item
            return renderItem(item)
          }
        })}
      </CMDKCommand.List>
    </CMDKCommand>
  )
}

// Auto-register on import
registerComponent('Command', Command, {
  schema: CommandPropsSchema,
  meta: CommandMeta,
})
