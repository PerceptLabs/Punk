/**
 * @punk/core - A11y Test Utilities
 * Helpers for testing Rig component accessibility
 */

import { render, type RenderResult } from '@testing-library/react'
import { PunkRenderer } from '../renderer'
import type { PunkSchema, PunkNode } from '../types'

/**
 * Render a schema node with the PunkRenderer for testing.
 * Uses 'relaxed' a11y mode by default.
 */
export function renderSchema(schema: PunkNode | PunkSchema, a11yMode: 'off' | 'relaxed' | 'strict' = 'relaxed'): RenderResult {
  return render(<PunkRenderer schema={schema} a11yMode={a11yMode} />)
}

/**
 * Create a test node with minimal configuration.
 * Useful for quickly building test schemas.
 */
export function createTestNode(
  type: string,
  props: any = {},
  a11y?: any,
  children?: PunkNode[]
): PunkNode {
  return {
    type,
    id: `test-${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
    props,
    a11y,
    children,
  }
}

/**
 * Create a full test schema with version info.
 */
export function createTestSchema(root: PunkNode): PunkSchema {
  return {
    punkVersion: '1.0.0',
    schemaVersion: '1.0.0',
    root,
  }
}

/**
 * Create a mock data context for testing.
 */
export function createTestData(data: Record<string, any> = {}) {
  return {
    user: { name: 'Test User', id: 1 },
    items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
    ...data,
  }
}
