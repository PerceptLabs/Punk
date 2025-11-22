/**
 * @punk/core - A11y Repair Utilities
 * Automatically repairs missing accessibility metadata using heuristics
 */

import type { PunkSchema, PunkNode, PunkNodeA11y } from '../types'
import { getRigA11yProfile } from './profiles'

/**
 * Repairs accessibility metadata across an entire schema.
 * Uses heuristics to fill missing required metadata.
 *
 * @param schema - The schema to repair (can be full PunkSchema or just a node)
 * @returns A new schema with repaired accessibility metadata
 *
 * @example
 * const schema = { type: 'Chart', props: { type: 'bar' } }
 * const repaired = repairA11y(schema)
 * // repaired.a11y.label === 'bar visualization'
 */
export function repairA11y(schema: PunkSchema | PunkNode): PunkSchema | PunkNode {
  // If it's a full schema with root, repair the root
  if ('root' in schema && 'punkVersion' in schema) {
    return {
      ...schema,
      root: repairNode(schema.root),
    } as PunkSchema
  }

  // Otherwise repair as a node
  return repairNode(schema as PunkNode)
}

/**
 * Recursively repairs a single node and its children.
 */
function repairNode(node: PunkNode): PunkNode {
  const profile = getRigA11yProfile(node.type)

  // If there's no profile, this isn't a Rig component - just repair children
  if (!profile) {
    return repairChildren(node)
  }

  // Clone existing a11y or create new
  const a11y: PunkNodeA11y = { ...(node.a11y || {}) }

  // Apply heuristics based on component type
  const heuristics = getHeuristicMetadata(node)

  // Fill in missing required fields
  for (const field of profile.required) {
    if (!a11y[field] || a11y[field]?.trim() === '') {
      a11y[field] = heuristics[field] || getDefaultMetadata(node.type, field)
    }
  }

  // Fill in missing optional fields from heuristics (if available)
  for (const field of profile.optional) {
    if ((!a11y[field] || a11y[field]?.trim() === '') && heuristics[field]) {
      a11y[field] = heuristics[field]
    }
  }

  // Return repaired node with children also repaired
  const repairedNode = {
    ...node,
    a11y,
  }

  return repairChildren(repairedNode)
}

/**
 * Repairs children of a node recursively.
 */
function repairChildren(node: PunkNode): PunkNode {
  if (!node.children || node.children.length === 0) {
    return node
  }

  return {
    ...node,
    children: node.children.map(repairNode),
  }
}

/**
 * Generate heuristic metadata based on component type and props.
 */
function getHeuristicMetadata(node: PunkNode): Partial<PunkNodeA11y> {
  const props = node.props || {}

  switch (node.type) {
    case 'Chart':
      return {
        label: props.type
          ? `${String(props.type).charAt(0).toUpperCase() + String(props.type).slice(1)} visualization`
          : 'Chart visualization',
        description: props.title
          ? `Chart showing ${props.title}`
          : undefined,
      }

    case 'Table':
      return {
        caption: props.title
          ? String(props.title)
          : props.columns && Array.isArray(props.columns) && props.columns.length > 0
          ? 'Data table'
          : 'Table',
        summary: props.columns
          ? `Table with ${Array.isArray(props.columns) ? props.columns.length : 'multiple'} columns`
          : undefined,
      }

    case 'Command':
      return {
        label: props.placeholder
          ? String(props.placeholder)
          : props.label
          ? String(props.label)
          : 'Menu or command palette',
      }

    case 'RichText':
      return {
        label: props.label
          ? String(props.label)
          : props.placeholder
          ? String(props.placeholder)
          : props.name
          ? String(props.name)
          : 'Rich text content',
        description: props.placeholder
          ? `Rich text editor: ${props.placeholder}`
          : undefined,
      }

    case 'Code':
      return {
        label: props.language
          ? `${String(props.language)} code block`
          : props.filename
          ? `Code: ${props.filename}`
          : props.title
          ? String(props.title)
          : 'Code block',
        description: props.filename && props.language
          ? `${props.language} code from ${props.filename}`
          : undefined,
      }

    case 'Mermaid':
      return {
        label: props.type
          ? `${String(props.type)} diagram`
          : 'Diagram',
        description: props.value && typeof props.value === 'string' && props.value.length < 100
          ? `Diagram: ${props.value.substring(0, 100)}`
          : 'Interactive diagram visualization',
      }

    case 'FileDrop':
      return {
        label: props.label
          ? String(props.label)
          : props.accept
          ? `File upload area (${props.accept})`
          : 'File upload area',
        description: props.accept
          ? `Accepts ${props.accept} files${props.maxSize ? `, max size ${props.maxSize}` : ''}`
          : props.multiple
          ? 'Drop multiple files here to upload'
          : 'Drop a file here to upload',
      }

    case 'DatePicker':
      return {
        label: props.label
          ? String(props.label)
          : props.placeholder
          ? String(props.placeholder)
          : props.name
          ? String(props.name)
          : 'Date picker',
        description: props.format
          ? `Select a date in ${props.format} format`
          : undefined,
      }

    default:
      return {}
  }
}

/**
 * Get default metadata for a component type and field.
 * Used as a last resort when heuristics don't provide a value.
 */
function getDefaultMetadata(componentType: string, field: keyof PunkNodeA11y): string {
  switch (field) {
    case 'label':
      return `${componentType} component`
    case 'caption':
      return `${componentType} content`
    case 'description':
      return `Interactive ${componentType.toLowerCase()} component`
    case 'summary':
      return `${componentType} summary`
    default:
      return `${componentType}`
  }
}
