/**
 * @punk/extended - Component Presets
 * Curated component collections for common use cases
 */

export interface ComponentPreset {
  /** Preset name */
  name: string

  /** Preset description */
  description: string

  /** Component types included in this preset */
  components: string[]

  /** Suggested use cases */
  useCases: string[]
}

/**
 * Dashboard Preset
 * Perfect for data visualization and analytics dashboards
 */
export const DashboardPreset: ComponentPreset = {
  name: 'Dashboard',
  description: 'Charts, tables, and data visualization components',
  components: ['Chart', 'Table', 'Mermaid', 'DatePicker'],
  useCases: [
    'Analytics dashboards',
    'Business intelligence tools',
    'Data reporting interfaces',
    'Metrics visualization',
    'KPI tracking',
  ],
}

/**
 * Content Preset
 * Ideal for content management and editing applications
 */
export const ContentPreset: ComponentPreset = {
  name: 'Content',
  description: 'Rich text, code editing, and content creation',
  components: ['RichText', 'Code', 'FileDrop'],
  useCases: [
    'Content management systems',
    'Blog editors',
    'Documentation platforms',
    'Code playgrounds',
    'File management tools',
  ],
}

/**
 * Chat Preset
 * Optimized for chat and messaging applications
 */
export const ChatPreset: ComponentPreset = {
  name: 'Chat',
  description: 'Rich text, code snippets, and file sharing for chat apps',
  components: ['RichText', 'Code', 'FileDrop', 'Command'],
  useCases: [
    'Chat applications',
    'Team messaging tools',
    'Customer support interfaces',
    'Collaborative editing',
    'Developer chat platforms',
  ],
}

/**
 * Admin Preset
 * Complete toolkit for admin panels and internal tools
 */
export const AdminPreset: ComponentPreset = {
  name: 'Admin',
  description: 'Full component suite for admin interfaces',
  components: ['Chart', 'Table', 'DatePicker', 'Command', 'FileDrop'],
  useCases: [
    'Admin panels',
    'Internal tools',
    'Backoffice systems',
    'Data management interfaces',
    'Operations dashboards',
  ],
}

/**
 * Developer Preset
 * Tools for developer-focused applications
 */
export const DeveloperPreset: ComponentPreset = {
  name: 'Developer',
  description: 'Code editing, diagrams, and developer tools',
  components: ['Code', 'Mermaid', 'Command', 'FileDrop'],
  useCases: [
    'Code editors',
    'API documentation',
    'Developer portals',
    'Architecture diagrams',
    'Technical documentation',
  ],
}

/**
 * All available presets
 */
export const ALL_PRESETS = {
  Dashboard: DashboardPreset,
  Content: ContentPreset,
  Chat: ChatPreset,
  Admin: AdminPreset,
  Developer: DeveloperPreset,
} as const

export type PresetName = keyof typeof ALL_PRESETS

/**
 * Get components for a specific preset
 * @param presetName - Name of the preset
 * @returns Array of component type names
 */
export function getPresetComponents(presetName: PresetName): string[] {
  return ALL_PRESETS[presetName].components
}

/**
 * Get all preset names
 * @returns Array of preset names
 */
export function getPresetNames(): PresetName[] {
  return Object.keys(ALL_PRESETS) as PresetName[]
}

/**
 * Find presets that include a specific component
 * @param componentName - Name of the component
 * @returns Array of preset names
 */
export function findPresetsForComponent(componentName: string): PresetName[] {
  return getPresetNames().filter((presetName) =>
    ALL_PRESETS[presetName].components.includes(componentName)
  )
}
