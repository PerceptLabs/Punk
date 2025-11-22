/**
 * @punk/core - PunkRenderer
 * Main rendering engine for Punk schemas
 */

import React, { createContext, useContext, useMemo, memo } from 'react'
import type { PunkNode, PunkSchema, PunkRendererProps, DataContext, ActionBus } from './types'
import { validateSchema } from './validator'
import { defaultRegistry } from './registry'
import { processProps, evaluateCondition, getValueFromPath } from './props'
import { getRigA11yProfile } from './a11y/profiles'
import { A11yContext, useA11yConfig, type A11yMode } from './a11y/context'

/**
 * DataContext - provides reactive data to all components
 */
const DataContextReact = createContext<DataContext>({})

/**
 * ActionBusContext - provides action bus to all components
 */
const ActionBusContext = createContext<ActionBus>({})

/**
 * Hook to access data context
 */
export function useDataContext(): DataContext {
  return useContext(DataContextReact)
}

/**
 * Hook to access action bus
 */
export function useActionBus(): ActionBus {
  return useContext(ActionBusContext)
}

/**
 * PunkRenderer - Main entry point for rendering schemas
 *
 * Validates schema, provides context, and renders the UI tree
 *
 * @example
 * <PunkRenderer
 *   schema={mySchema}
 *   data={{ user: { name: "Alice" } }}
 *   actions={{ handleClick: () => console.log("clicked") }}
 * />
 */
export function PunkRenderer({
  schema,
  data = {},
  actions = {},
  registry = defaultRegistry,
  onError,
  errorBoundary = true,
  a11yMode = 'relaxed',
}: PunkRendererProps): React.ReactElement {
  // Normalize schema input
  const normalizedSchema = useMemo(() => {
    // If it's an array of nodes
    if (Array.isArray(schema)) {
      return schema
    }

    // If it's a full PunkSchema with root
    if ('root' in schema && 'punkVersion' in schema) {
      return (schema as PunkSchema).root
    }

    // Otherwise treat as a single node
    return schema as PunkNode
  }, [schema])

  // Validate schema
  const validation = useMemo(() => {
    if (Array.isArray(normalizedSchema)) {
      // Validate each node in array
      for (const node of normalizedSchema) {
        const result = validateSchema(node)
        if (!result.valid) {
          return result
        }
      }
      return { valid: true }
    }

    return validateSchema(normalizedSchema)
  }, [normalizedSchema])

  // Handle validation errors
  if (!validation.valid) {
    const error = new Error(
      `Schema validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`
    )

    if (onError) {
      onError(error)
    }

    if (errorBoundary) {
      return <ErrorDisplay error={error} />
    }

    throw error
  }

  // Render content
  const content = (
    <A11yContext.Provider value={{ mode: a11yMode }}>
      <DataContextReact.Provider value={data}>
        <ActionBusContext.Provider value={actions}>
          {Array.isArray(normalizedSchema) ? (
            <>
              {normalizedSchema.map((node, index) => (
                <PunkNodeRenderer
                  key={node.id || node.key || `node-${index}`}
                  node={node}
                  registry={registry}
                />
              ))}
            </>
          ) : (
            <PunkNodeRenderer node={normalizedSchema} registry={registry} />
          )}
        </ActionBusContext.Provider>
      </DataContextReact.Provider>
    </A11yContext.Provider>
  )

  if (errorBoundary) {
    return <ErrorBoundary>{content}</ErrorBoundary>
  }

  return content
}

/**
 * Helper: Derive A11y attributes from profile and schema metadata
 */
function deriveA11yAttributes(
  node: PunkNode,
  a11yMode: A11yMode
): {
  a11yProps: Record<string, string>
  descriptionElement: React.ReactElement | null
} {
  const profile = getRigA11yProfile(node.type)

  // No profile = no a11y attributes
  if (!profile) {
    return { a11yProps: {}, descriptionElement: null }
  }

  const a11yProps: Record<string, string> = {}
  let descriptionElement: React.ReactElement | null = null

  // Apply role from profile
  a11yProps.role = profile.role

  // Check for missing required metadata
  const missingFields: string[] = []
  for (const field of profile.required) {
    if (!node.a11y || !node.a11y[field]) {
      missingFields.push(field)
    }
  }

  // Log warnings/errors for missing metadata (only in development or if mode !== 'off')
  const isDevelopment = process.env.NODE_ENV === 'development'
  if (isDevelopment && a11yMode !== 'off' && missingFields.length > 0) {
    const idStr = node.id ? ` (id: ${node.id})` : ''
    const message = `[Punk A11y] Rig "${node.type}"${idStr} is missing required a11y metadata: ${missingFields.join(', ')}`

    if (a11yMode === 'strict') {
      console.error(message)
    } else {
      console.warn(message)
    }
  }

  // Apply label (required)
  if (node.a11y?.label) {
    a11yProps['aria-label'] = node.a11y.label
  } else if (!isDevelopment && profile.required.includes('label')) {
    // Auto-generate fallback label in production
    a11yProps['aria-label'] = `${node.type} visualization`
  }

  // Apply description (if present)
  if (node.a11y?.description) {
    const descId = `desc-${node.id || Math.random().toString(36).substr(2, 9)}`
    a11yProps['aria-describedby'] = descId
    descriptionElement = (
      <span
        id={descId}
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        }}
      >
        {node.a11y.description}
      </span>
    )
  }

  // Apply caption (for Table components)
  // Note: This is handled specially by Table component itself

  return { a11yProps, descriptionElement }
}

/**
 * PunkNodeRenderer - Renders a single node recursively
 * Handles component lookup, prop processing, and child rendering
 */
interface PunkNodeRendererProps {
  node: PunkNode
  registry: typeof defaultRegistry
  depth?: number
}

const PunkNodeRenderer = memo(function PunkNodeRenderer({
  node,
  registry,
  depth = 0,
}: PunkNodeRendererProps): React.ReactElement | null {
  const data = useDataContext()
  const actions = useActionBus()
  const a11yConfig = useA11yConfig()

  // Security: Prevent excessive nesting
  if (depth > 100) {
    console.warn(`Maximum nesting depth exceeded at node type: ${node.type}`)
    return null
  }

  // Handle conditional rendering
  if (node.condition && !evaluateCondition(node.condition, data)) {
    return null
  }

  // Handle list rendering with dataSource
  if (node.dataSource && node.itemTemplate) {
    return (
      <ListRenderer
        dataSource={node.dataSource}
        itemTemplate={node.itemTemplate}
        registry={registry}
        depth={depth}
      />
    )
  }

  // Look up component in registry
  const Component = registry.get(node.type)

  if (!Component) {
    console.warn(`Unknown component type: ${node.type}`)
    return <UnknownComponent type={node.type} />
  }

  // Process props
  const processedProps = useMemo(() => {
    if (!node.props) {
      return {}
    }
    return processProps(node.props, data, actions)
  }, [node.props, data, actions])

  // Derive A11y attributes
  const { a11yProps, descriptionElement } = useMemo(
    () => deriveA11yAttributes(node, a11yConfig.mode),
    [node, a11yConfig.mode]
  )

  // Render children recursively
  const children = useMemo(() => {
    if (!node.children || node.children.length === 0) {
      return null
    }

    return node.children.map((child, index) => (
      <PunkNodeRenderer
        key={child.id || child.key || `child-${index}`}
        node={child}
        registry={registry}
        depth={depth + 1}
      />
    ))
  }, [node.children, registry, depth])

  // Merge metadata props - a11y attributes come AFTER base props so they win
  const finalProps = {
    ...processedProps,
    'data-testid': node.testId,
    className: node.className,
    style: node.style,
    ...a11yProps,
  }

  // If we have a description element, wrap component with a fragment
  if (descriptionElement) {
    return (
      <>
        <Component {...finalProps}>{children}</Component>
        {descriptionElement}
      </>
    )
  }

  return <Component {...finalProps}>{children}</Component>
})

/**
 * ListRenderer - Renders lists from data sources
 * Used when node has dataSource and itemTemplate
 */
interface ListRendererProps {
  dataSource: string
  itemTemplate: PunkNode
  registry: typeof defaultRegistry
  depth: number
}

function ListRenderer({
  dataSource,
  itemTemplate,
  registry,
  depth,
}: ListRendererProps): React.ReactElement | null {
  const data = useDataContext()

  // Get data array from path
  const items = useMemo(() => {
    const value = getValueFromPath(dataSource, data)

    if (!Array.isArray(value)) {
      console.warn(`Data source '${dataSource}' is not an array:`, value)
      return []
    }

    return value
  }, [dataSource, data])

  if (items.length === 0) {
    return null
  }

  return (
    <>
      {items.map((item, index) => {
        // Create scoped data context with item
        const itemData = {
          ...data,
          item,
          index,
        }

        return (
          <DataContextReact.Provider key={item.id || index} value={itemData}>
            <PunkNodeRenderer node={itemTemplate} registry={registry} depth={depth + 1} />
          </DataContextReact.Provider>
        )
      })}
    </>
  )
}

/**
 * UnknownComponent - Placeholder for unregistered component types
 */
function UnknownComponent({ type }: { type: string }): React.ReactElement {
  return (
    <div
      style={{
        padding: '12px',
        margin: '4px 0',
        backgroundColor: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '4px',
        color: '#991b1b',
        fontSize: '14px',
        fontFamily: 'monospace',
      }}
      role="alert"
    >
      Unknown component: <code>{type}</code>
    </div>
  )
}

/**
 * ErrorDisplay - Simple error display component
 */
function ErrorDisplay({ error }: { error: Error }): React.ReactElement {
  return (
    <div
      style={{
        padding: '20px',
        margin: '10px 0',
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        color: '#7f1d1d',
      }}
      role="alert"
    >
      <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
        Rendering Error
      </h2>
      <pre
        style={{
          margin: '0',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontFamily: 'monospace',
        }}
      >
        {error.message}
      </pre>
      {error.stack && (
        <details style={{ marginTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '12px' }}>Stack trace</summary>
          <pre
            style={{
              marginTop: '8px',
              fontSize: '11px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
            }}
          >
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

/**
 * ErrorBoundary - Catches rendering errors
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Punk rendering error:', error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      return <ErrorDisplay error={this.state.error} />
    }

    return this.props.children
  }
}

/**
 * DataContextProvider - Standalone context provider for advanced use cases
 */
export const DataContextProvider = DataContextReact.Provider

/**
 * ActionBusProvider - Standalone action bus provider for advanced use cases
 */
export const ActionBusProvider = ActionBusContext.Provider
