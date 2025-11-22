/**
 * @punk/core - Accessibility Profiles
 * Declarative accessibility profiles for Rig components
 */

import type { PunkNodeA11y } from '../types'

/**
 * Accessibility profile for Rig components.
 * Defines which a11y fields are required/optional and provides hints for AI generation.
 */
export interface RigA11yProfile {
  /** ARIA role for the component */
  role: string

  /** Required a11y fields that must be populated */
  required: Array<keyof PunkNodeA11y>

  /** Optional a11y fields that should be added when helpful */
  optional: Array<keyof PunkNodeA11y>

  /** Generation hint for the AI on how to create meaningful labels */
  hint: string

  /** Documentation sources for accessibility best practices (prop paths to reference) */
  sources?: string[]
}

/**
 * Chart component accessibility profile
 */
const chartA11yProfile: RigA11yProfile = {
  role: 'img',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a chart. Provide a short label describing the chart type and data (e.g., "Sales trend for 2024"), and an optional detailed description for screen readers.',
  sources: ['props.type', 'props.data', 'props.title', 'props.chartType'],
}

/**
 * Table component accessibility profile
 */
const tableA11yProfile: RigA11yProfile = {
  role: 'table',
  required: ['caption'],
  optional: ['summary'],
  hint: 'This is a data table. Provide a caption describing what the table contains (e.g., "Customer list"), and an optional summary explaining the table structure for screen readers.',
  sources: ['props.data', 'props.columns', 'props.title', 'props.headers'],
}

/**
 * Command component accessibility profile
 */
const commandA11yProfile: RigA11yProfile = {
  role: 'combobox',
  required: ['label'],
  optional: [],
  hint: 'This is a command palette/combobox input. Provide a label describing the search function (e.g., "Search commands" or "Quick action finder").',
  sources: ['props.placeholder', 'props.label', 'props.items'],
}

/**
 * RichText component accessibility profile
 */
const richTextA11yProfile: RigA11yProfile = {
  role: 'textbox',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a rich text editor. Provide a label describing the content being edited (e.g., "Message body" or "Article content"), and an optional description with usage hints.',
  sources: ['props.placeholder', 'props.label', 'props.name', 'props.defaultValue'],
}

/**
 * Code component accessibility profile
 */
const codeA11yProfile: RigA11yProfile = {
  role: 'code',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a code block or code editor. Provide a label describing the code (e.g., "TypeScript example" or "API response"), and an optional description of what the code does.',
  sources: ['props.language', 'props.filename', 'props.title', 'props.value'],
}

/**
 * Mermaid component accessibility profile
 */
const mermaidA11yProfile: RigA11yProfile = {
  role: 'img',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a Mermaid diagram. Provide a short label describing the diagram type (e.g., "User authentication flow diagram"), and a detailed description explaining the diagram content for screen readers.',
  sources: ['props.value', 'props.chart', 'props.diagram', 'props.type'],
}

/**
 * FileDrop component accessibility profile
 */
const fileDropA11yProfile: RigA11yProfile = {
  role: 'button',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a file drop zone. Provide a label describing the upload action (e.g., "Upload profile image" or "Drop files here"), and an optional description with file type restrictions.',
  sources: ['props.accept', 'props.label', 'props.multiple', 'props.maxSize'],
}

/**
 * DatePicker component accessibility profile
 */
const datePickerA11yProfile: RigA11yProfile = {
  role: 'combobox',
  required: ['label'],
  optional: ['description'],
  hint: 'This is a date picker input. Provide a label describing the date field (e.g., "Start date" or "Birth date"), and an optional description with format or constraints.',
  sources: ['props.label', 'props.placeholder', 'props.name', 'props.format'],
}

/**
 * Registry of all Rig accessibility profiles
 */
const RIG_A11Y_PROFILES: Record<string, RigA11yProfile> = {
  Chart: chartA11yProfile,
  Table: tableA11yProfile,
  Command: commandA11yProfile,
  RichText: richTextA11yProfile,
  Code: codeA11yProfile,
  Mermaid: mermaidA11yProfile,
  FileDrop: fileDropA11yProfile,
  DatePicker: datePickerA11yProfile,
}

/**
 * Get the accessibility profile for a Rig component type.
 *
 * @param componentType - The component type identifier (e.g., 'Chart', 'Table')
 * @returns The accessibility profile if found, undefined otherwise
 */
export function getRigA11yProfile(componentType: string): RigA11yProfile | undefined {
  return RIG_A11Y_PROFILES[componentType]
}

/**
 * Get all registered Rig accessibility profiles.
 *
 * @returns Record of all profiles keyed by component type
 */
export function getAllRigA11yProfiles(): Record<string, RigA11yProfile> {
  return { ...RIG_A11Y_PROFILES }
}

/**
 * Check if a component type has an accessibility profile.
 *
 * @param componentType - The component type identifier
 * @returns True if the component has a profile, false otherwise
 */
export function hasRigA11yProfile(componentType: string): boolean {
  return componentType in RIG_A11Y_PROFILES
}
