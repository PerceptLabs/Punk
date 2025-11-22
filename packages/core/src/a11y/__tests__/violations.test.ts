/**
 * @punk/core - Tests for getA11yViolations
 */

import { describe, test, expect } from 'vitest'
import { getA11yViolations, summarizeViolations } from '../violations'
import type { PunkNode, PunkSchema } from '../../types'
// Note: test-utils.tsx was moved from __tests__/ to parent directory

describe('getA11yViolations', () => {
  describe('Missing required fields', () => {
    test('detects missing label on Chart', () => {
      const node: PunkNode = {
        type: 'Chart',
        id: 'sales-chart',
        props: { type: 'bar', data: [] },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0]).toMatchObject({
        nodeId: 'sales-chart',
        nodeType: 'Chart',
        field: 'label',
        severity: 'error',
      })
      expect(violations[0].message).toContain('Missing required')
    })

    test('detects missing caption on Table', () => {
      const node: PunkNode = {
        type: 'Table',
        props: { columns: [], data: [] },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0]).toMatchObject({
        nodeType: 'Table',
        field: 'caption',
        severity: 'error',
      })
    })

    test('detects empty required fields', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'pie', data: [] },
        a11y: { label: '   ' }, // Whitespace only
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].field).toBe('label')
      expect(violations[0].severity).toBe('error')
    })
  })

  describe('Suspicious generic labels', () => {
    test('flags generic "label" as label value', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'label' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0]).toMatchObject({
        field: 'label',
        severity: 'warn',
      })
      expect(violations[0].message).toContain('Generic')
    })

    test('flags "title" as suspicious', () => {
      const node: PunkNode = {
        type: 'Command',
        props: { items: [] },
        a11y: { label: 'title' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].severity).toBe('warn')
    })

    test('flags placeholder text', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'TODO: Add label' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0]).toMatchObject({
        severity: 'warn',
      })
      expect(violations[0].message).toContain('Placeholder')
    })

    test('flags very short labels', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'ab' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('too short')
    })

    test('flags all-caps placeholder constants', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'CHART_LABEL' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('constant or placeholder')
    })

    test('flags label that only contains component type', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'chart' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('only contains component type')
    })
  })

  describe('Valid schemas', () => {
    test('returns empty array for valid Chart', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'Sales performance chart' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(0)
    })

    test('returns empty array for valid Table', () => {
      const node: PunkNode = {
        type: 'Table',
        props: { columns: [], data: [] },
        a11y: { caption: 'Customer data table' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(0)
    })

    test('returns empty array for non-Rig components', () => {
      const node: PunkNode = {
        type: 'Button',
        props: { text: 'Click me' },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(0)
    })
  })

  describe('Optional fields', () => {
    test('validates optional field if present', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: {
          label: 'Sales chart',
          description: 'test', // Too short
        },
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(1)
      expect(violations[0].field).toBe('description')
      expect(violations[0].severity).toBe('warn')
    })

    test('does not flag missing optional fields', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'Sales chart' },
        // description is optional and missing - should not be flagged
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(0)
    })
  })

  describe('Nested schemas', () => {
    test('detects violations in nested children', () => {
      const node: PunkNode = {
        type: 'Container',
        children: [
          {
            type: 'Chart',
            props: { type: 'bar', data: [] },
            // Missing a11y
          },
          {
            type: 'Table',
            props: { columns: [], data: [] },
            // Missing a11y
          },
        ],
      }

      const violations = getA11yViolations(node)

      expect(violations).toHaveLength(2)
      expect(violations[0].nodeType).toBe('Chart')
      expect(violations[1].nodeType).toBe('Table')
    })

    test('includes path in nodeId for nested violations', () => {
      const node: PunkNode = {
        type: 'Container',
        children: [
          {
            type: 'Chart',
            props: { type: 'bar', data: [] },
          },
        ],
      }

      const violations = getA11yViolations(node)

      expect(violations[0].nodeId).toContain('children')
    })
  })

  describe('Full schema analysis', () => {
    test('analyzes full PunkSchema with root', () => {
      const schema: PunkSchema = {
        punkVersion: '1.0.0',
        schemaVersion: '1.0.0',
        root: {
          type: 'Chart',
          props: { type: 'bar', data: [] },
        },
      }

      const violations = getA11yViolations(schema)

      expect(violations).toHaveLength(1)
      expect(violations[0].nodeType).toBe('Chart')
    })
  })

  describe('Multiple violations on single node', () => {
    test('detects multiple issues on one component', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: {
          label: 'TODO', // Placeholder
          description: 'x', // Too short
        },
      }

      const violations = getA11yViolations(node)

      expect(violations.length).toBeGreaterThanOrEqual(2)
      const fields = violations.map((v) => v.field)
      expect(fields).toContain('label')
      expect(fields).toContain('description')
    })
  })
})

describe('summarizeViolations', () => {
  test('counts total violations', () => {
    const violations = [
      { nodeId: '1', nodeType: 'Chart', field: 'label', message: 'test', severity: 'error' as const },
      { nodeId: '2', nodeType: 'Table', field: 'caption', message: 'test', severity: 'warn' as const },
    ]

    const summary = summarizeViolations(violations)

    expect(summary.total).toBe(2)
  })

  test('separates errors and warnings', () => {
    const violations = [
      { nodeId: '1', nodeType: 'Chart', field: 'label', message: 'test', severity: 'error' as const },
      { nodeId: '2', nodeType: 'Chart', field: 'label', message: 'test', severity: 'error' as const },
      { nodeId: '3', nodeType: 'Table', field: 'caption', message: 'test', severity: 'warn' as const },
    ]

    const summary = summarizeViolations(violations)

    expect(summary.errors).toBe(2)
    expect(summary.warnings).toBe(1)
  })

  test('groups by component type', () => {
    const violations = [
      { nodeId: '1', nodeType: 'Chart', field: 'label', message: 'test', severity: 'error' as const },
      { nodeId: '2', nodeType: 'Chart', field: 'description', message: 'test', severity: 'warn' as const },
      { nodeId: '3', nodeType: 'Table', field: 'caption', message: 'test', severity: 'error' as const },
    ]

    const summary = summarizeViolations(violations)

    expect(summary.byType['Chart']).toHaveLength(2)
    expect(summary.byType['Table']).toHaveLength(1)
  })

  test('groups by severity', () => {
    const violations = [
      { nodeId: '1', nodeType: 'Chart', field: 'label', message: 'test', severity: 'error' as const },
      { nodeId: '2', nodeType: 'Table', field: 'caption', message: 'test', severity: 'warn' as const },
    ]

    const summary = summarizeViolations(violations)

    expect(summary.bySeverity.error).toHaveLength(1)
    expect(summary.bySeverity.warn).toHaveLength(1)
  })

  test('handles empty violations array', () => {
    const summary = summarizeViolations([])

    expect(summary.total).toBe(0)
    expect(summary.errors).toBe(0)
    expect(summary.warnings).toBe(0)
    expect(Object.keys(summary.byType)).toHaveLength(0)
  })
})
