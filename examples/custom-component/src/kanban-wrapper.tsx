/**
 * Kanban Board Component Wrapper
 *
 * This file demonstrates the CANONICAL PATTERN for creating custom Punk component wrappers.
 * It wraps @hello-pangea/dnd to create a drag-and-drop Kanban board that works with Punk's
 * schema-driven architecture.
 *
 * PATTERN COMPONENTS:
 * 1. Zod Schema Definition - For SynthPunk AI generation
 * 2. Component Metadata - For Mohawk UI display
 * 3. React Component - Renderer-agnostic implementation
 * 4. Auto-registration - Automatic registry on import
 */

import { z } from 'zod'
import { registerComponent } from '@punk/core'
import { useDataContext, useActionBus } from '@punk/core'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import React from 'react'

// ============================================================================
// STEP 1: ZOD SCHEMA DEFINITION
// ============================================================================
// This schema defines the props shape for the component.
// SynthPunk uses this to generate valid JSON schemas from natural language.

/**
 * Schema for a single card in the Kanban board
 */
const KanbanCardSchema = z.object({
  /** Unique identifier for the card */
  id: z.string(),

  /** Card title/content */
  title: z.string(),

  /** Optional description */
  description: z.string().optional(),

  /** Optional tags/labels */
  tags: z.array(z.string()).optional(),

  /** Column this card belongs to */
  columnId: z.string(),
})

/**
 * Schema for a column in the Kanban board
 */
const KanbanColumnSchema = z.object({
  /** Unique identifier for the column */
  id: z.string(),

  /** Column title (e.g., "To Do", "In Progress") */
  title: z.string(),

  /** Column color/theme */
  color: z.string().optional(),
})

/**
 * Main props schema for the Kanban component
 * This is what gets validated when rendering from JSON
 */
export const KanbanPropsSchema = z.object({
  /** Array of columns to display */
  columns: z.array(KanbanColumnSchema),

  /** Array of cards to display */
  cards: z.array(KanbanCardSchema),

  /** Action to call when a card is moved (receives { cardId, fromColumn, toColumn, position }) */
  onCardMove: z.string().optional(),

  /** Height of the board (CSS value) */
  height: z.string().optional().default('600px'),

  /** Whether the board is read-only */
  readOnly: z.boolean().optional().default(false),
})

/**
 * Schema map export for easy import
 * Used by SynthPunk to build its component registry
 */
export const KanbanSchemaMap = {
  Kanban: KanbanPropsSchema
}

// ============================================================================
// STEP 2: COMPONENT METADATA
// ============================================================================
// Metadata describes the component for UI builders like Mohawk.
// This enables visual component palettes, categorization, and search.

export const KanbanMeta = {
  /** Display name shown in UI */
  displayName: 'Kanban Board',

  /** Description for tooltips/documentation */
  description: 'Drag-and-drop Kanban board for task management',

  /** Lucide icon name (see https://lucide.dev) */
  icon: 'kanban-square',

  /** Category for grouping in UI */
  category: 'Data Visualization',

  /** Tags for search/filtering */
  tags: ['kanban', 'board', 'tasks', 'drag-drop', 'project-management'],

  /** Complexity level affects visibility in beginner mode */
  complexity: 'advanced' as const,
}

// ============================================================================
// STEP 3: COMPONENT IMPLEMENTATION
// ============================================================================
// The actual React component that renders the Kanban board.
// IMPORTANT: Uses Punk's DataContext and ActionBus for renderer-agnostic behavior.

type KanbanProps = z.infer<typeof KanbanPropsSchema>

/**
 * Kanban Board Component
 *
 * Implements a drag-and-drop Kanban board using @hello-pangea/dnd.
 * Integrates with Punk's DataContext for reactive data and ActionBus for events.
 *
 * @example JSON Schema
 * ```json
 * {
 *   "type": "Kanban",
 *   "props": {
 *     "columns": [
 *       { "id": "todo", "title": "To Do", "color": "#3b82f6" },
 *       { "id": "progress", "title": "In Progress", "color": "#f59e0b" },
 *       { "id": "done", "title": "Done", "color": "#10b981" }
 *     ],
 *     "cards": "tasks",
 *     "onCardMove": "handleCardMove",
 *     "height": "600px"
 *   }
 * }
 * ```
 */
export function Kanban(props: KanbanProps) {
  // -------------------------------------------------------------------------
  // DATA CONTEXT INTEGRATION
  // -------------------------------------------------------------------------
  // Use useDataContext to access reactive data from the schema
  // This makes the component work with Punk's data interpolation system
  const dataContext = useDataContext()

  // If cards is a string, resolve it from DataContext
  // This allows JSON like: "cards": "tasks" to reference data.tasks
  const cards = typeof props.cards === 'string'
    ? (dataContext[props.cards] as z.infer<typeof KanbanCardSchema>[]) || []
    : props.cards

  // -------------------------------------------------------------------------
  // ACTION BUS INTEGRATION
  // -------------------------------------------------------------------------
  // Use useActionBus to access registered action handlers
  // This enables declarative event handling in JSON schemas
  const actionBus = useActionBus()

  /**
   * Handle drag end event
   * Calls the action specified in props.onCardMove
   */
  const handleDragEnd = (result: DropResult) => {
    // If dropped outside a droppable area, do nothing
    if (!result.destination) {
      return
    }

    const { source, destination, draggableId } = result

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    // Find the moved card
    const movedCard = cards.find(card => card.id === draggableId)
    if (!movedCard) {
      return
    }

    // -----------------------------------------------------------------------
    // ACTION BUS USAGE
    // -----------------------------------------------------------------------
    // Call the registered action handler if specified
    // The action receives a payload with move details
    if (props.onCardMove && actionBus[props.onCardMove]) {
      actionBus[props.onCardMove]({
        cardId: draggableId,
        card: movedCard,
        fromColumn: source.droppableId,
        toColumn: destination.droppableId,
        fromIndex: source.index,
        toIndex: destination.index,
      })
    }
  }

  return (
    <div className="kanban-board" style={{ height: props.height }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          {props.columns.map((column) => {
            // Filter cards for this column
            const columnCards = cards.filter(card => card.columnId === column.id)

            return (
              <div key={column.id} className="kanban-column">
                {/* Column Header */}
                <div
                  className="kanban-column-header"
                  style={{
                    backgroundColor: column.color || '#e5e7eb',
                    borderBottom: `3px solid ${column.color || '#9ca3af'}`
                  }}
                >
                  <h3>{column.title}</h3>
                  <span className="kanban-card-count">{columnCards.length}</span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id} isDropDisabled={props.readOnly}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`kanban-card-list ${
                        snapshot.isDraggingOver ? 'dragging-over' : ''
                      }`}
                    >
                      {columnCards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                          isDragDisabled={props.readOnly}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${
                                snapshot.isDragging ? 'dragging' : ''
                              }`}
                            >
                              <div className="kanban-card-title">{card.title}</div>
                              {card.description && (
                                <div className="kanban-card-description">
                                  {card.description}
                                </div>
                              )}
                              {card.tags && card.tags.length > 0 && (
                                <div className="kanban-card-tags">
                                  {card.tags.map((tag, i) => (
                                    <span key={i} className="kanban-tag">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Styles */}
      <style>{`
        .kanban-board {
          display: flex;
          flex-direction: column;
          width: 100%;
          overflow-x: auto;
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
        }

        .kanban-columns {
          display: flex;
          gap: 16px;
          height: 100%;
          min-width: min-content;
        }

        .kanban-column {
          display: flex;
          flex-direction: column;
          min-width: 300px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .kanban-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px 8px 0 0;
        }

        .kanban-column-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .kanban-card-count {
          background: rgba(0, 0, 0, 0.1);
          color: #1f2937;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .kanban-card-list {
          flex: 1;
          padding: 8px;
          min-height: 100px;
          overflow-y: auto;
          transition: background-color 0.2s;
        }

        .kanban-card-list.dragging-over {
          background-color: #f3f4f6;
        }

        .kanban-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
          cursor: grab;
          transition: all 0.2s;
        }

        .kanban-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-color: #d1d5db;
        }

        .kanban-card.dragging {
          cursor: grabbing;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
          transform: rotate(2deg);
        }

        .kanban-card-title {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .kanban-card-description {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }

        .kanban-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .kanban-tag {
          background: #e0e7ff;
          color: #4338ca;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// STEP 4: AUTO-REGISTRATION
// ============================================================================
// This is the MAGIC that makes the component available throughout the framework.
// When this file is imported ANYWHERE, the component auto-registers.

registerComponent('Kanban', Kanban, {
  schema: KanbanPropsSchema,
  meta: KanbanMeta,
})

// ============================================================================
// KEY TEACHING POINTS
// ============================================================================
/*
 * 1. ZOD SCHEMA: Defines the contract between JSON and React
 *    - Enables AI generation (SynthPunk)
 *    - Provides runtime validation
 *    - Generates TypeScript types
 *
 * 2. METADATA: Describes the component for humans and UIs
 *    - Shown in visual component palettes (Mohawk)
 *    - Enables categorization and search
 *    - Indicates complexity for filtering
 *
 * 3. DATA CONTEXT: Makes components data-driven
 *    - Access reactive data via useDataContext()
 *    - Support string references (e.g., "cards": "tasks")
 *    - Enables declarative data binding
 *
 * 4. ACTION BUS: Enables declarative event handling
 *    - Reference actions by name (e.g., "onCardMove": "handleCardMove")
 *    - Decouple component from business logic
 *    - Works in all rendering modes (DOM/GPU/XR)
 *
 * 5. AUTO-REGISTRATION: Simplifies usage
 *    - Import once, available everywhere
 *    - No manual registry management
 *    - Lazy loading friendly
 *
 * 6. RENDERER-AGNOSTIC: Core principle
 *    - No DOM assumptions in logic
 *    - Works with future GPU/XR renderers
 *    - Uses React's reconciliation
 */
