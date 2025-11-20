/**
 * @punk/extended - Schema Aggregation for SynthPunk
 * Aggregates all component Zod schemas for AI generation
 */

import { z } from 'zod'
import { ChartPropsSchema, ChartMeta } from '@punk/component-chart'
import { TablePropsSchema, TableMeta } from '@punk/component-table'
import { MermaidPropsSchema, MermaidMeta } from '@punk/component-mermaid'
import { RichTextPropsSchema, RichTextMeta } from '@punk/component-richtext'
import { CodePropsSchema, CodeMeta } from '@punk/component-code'
import { FileDropPropsSchema, FileDropMeta } from '@punk/component-filedrop'
import { DatePickerPropsSchema, DatePickerMeta } from '@punk/component-date'
import { CommandPropsSchema, CommandMeta } from '@punk/component-command'
import type { ComponentMeta } from '@punk/core'

/**
 * Component schema entry for SynthPunk
 */
export interface ExtendedComponentEntry {
  /** Component type name */
  type: string

  /** Display label */
  label: string

  /** Lucide icon name */
  icon: string

  /** Zod schema for props validation */
  props: z.ZodType<any>

  /** Component metadata */
  meta: ComponentMeta

  /** Whether component accepts children */
  children?: boolean

  /** Maximum children allowed */
  maxChildren?: number
}

/**
 * Build extended component registry for SynthPunk
 * This converts Zod schemas into SynthPunk's ComponentSchema format
 */
export function buildExtendedComponentRegistry(): Map<
  string,
  ExtendedComponentEntry
> {
  return new Map([
    [
      'Chart',
      {
        type: 'Chart',
        label: ChartMeta.displayName,
        icon: ChartMeta.icon,
        props: ChartPropsSchema,
        meta: ChartMeta,
        children: false,
      },
    ],
    [
      'Table',
      {
        type: 'Table',
        label: TableMeta.displayName,
        icon: TableMeta.icon,
        props: TablePropsSchema,
        meta: TableMeta,
        children: false,
      },
    ],
    [
      'Mermaid',
      {
        type: 'Mermaid',
        label: MermaidMeta.displayName,
        icon: MermaidMeta.icon,
        props: MermaidPropsSchema,
        meta: MermaidMeta,
        children: false,
      },
    ],
    [
      'RichText',
      {
        type: 'RichText',
        label: RichTextMeta.displayName,
        icon: RichTextMeta.icon,
        props: RichTextPropsSchema,
        meta: RichTextMeta,
        children: false,
      },
    ],
    [
      'Code',
      {
        type: 'Code',
        label: CodeMeta.displayName,
        icon: CodeMeta.icon,
        props: CodePropsSchema,
        meta: CodeMeta,
        children: false,
      },
    ],
    [
      'FileDrop',
      {
        type: 'FileDrop',
        label: FileDropMeta.displayName,
        icon: FileDropMeta.icon,
        props: FileDropPropsSchema,
        meta: FileDropMeta,
        children: false,
      },
    ],
    [
      'DatePicker',
      {
        type: 'DatePicker',
        label: DatePickerMeta.displayName,
        icon: DatePickerMeta.icon,
        props: DatePickerPropsSchema,
        meta: DatePickerMeta,
        children: false,
      },
    ],
    [
      'Command',
      {
        type: 'Command',
        label: CommandMeta.displayName,
        icon: CommandMeta.icon,
        props: CommandPropsSchema,
        meta: CommandMeta,
        children: false,
      },
    ],
  ])
}

/**
 * Get all extended component schemas as a simple object
 * Useful for JSON serialization and AI context
 */
export function getExtendedSchemasAsJSON(): Record<string, any> {
  const registry = buildExtendedComponentRegistry()
  const result: Record<string, any> = {}

  for (const [type, entry] of registry.entries()) {
    result[type] = {
      type: entry.type,
      label: entry.label,
      icon: entry.icon,
      category: entry.meta.category,
      description: entry.meta.description,
      complexity: entry.meta.complexity,
      tags: entry.meta.tags,
      // Note: Zod schemas are not directly serializable
      // In practice, you'd generate JSON schemas from Zod
      // using zodToJsonSchema library if needed
    }
  }

  return result
}

/**
 * Get component categories
 */
export function getComponentCategories(): Record<string, string[]> {
  const registry = buildExtendedComponentRegistry()
  const categories: Record<string, string[]> = {}

  for (const [type, entry] of registry.entries()) {
    const category = entry.meta.category
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(type)
  }

  return categories
}
