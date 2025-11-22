/**
 * @punk/core - Tests for repairA11y
 */

import { describe, test, expect } from 'vitest'
import { repairA11y } from '../repair'
import type { PunkNode, PunkSchema } from '../../types'
// Note: test-utils.tsx was moved from __tests__/ to parent directory

describe('repairA11y', () => {
  describe('Chart component', () => {
    test('fills missing label with heuristic from props.type', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Bar visualization')
    })

    test('uses title for description if available', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'line', title: 'Sales Trend', data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Line visualization')
      expect(repaired.a11y?.description).toBe('Chart showing Sales Trend')
    })

    test('preserves existing valid a11y data', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'pie', data: [] },
        a11y: {
          label: 'Custom label',
          description: 'Custom description',
        },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Custom label')
      expect(repaired.a11y?.description).toBe('Custom description')
    })

    test('handles chart with no type prop', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Chart visualization')
    })
  })

  describe('Table component', () => {
    test('fills missing caption with default', () => {
      const node: PunkNode = {
        type: 'Table',
        props: { columns: ['Name', 'Age'], data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.caption).toBe('Data table')
    })

    test('uses title for caption if available', () => {
      const node: PunkNode = {
        type: 'Table',
        props: { title: 'User List', columns: [], data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.caption).toBe('User List')
    })

    test('generates summary from columns', () => {
      const node: PunkNode = {
        type: 'Table',
        props: { columns: ['ID', 'Name', 'Email'], data: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.summary).toBe('Table with 3 columns')
    })
  })

  describe('Command component', () => {
    test('fills missing label from placeholder', () => {
      const node: PunkNode = {
        type: 'Command',
        props: { placeholder: 'Search commands...', items: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Search commands...')
    })

    test('uses label prop if available', () => {
      const node: PunkNode = {
        type: 'Command',
        props: { label: 'Quick actions', items: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Quick actions')
    })

    test('uses default if no props available', () => {
      const node: PunkNode = {
        type: 'Command',
        props: { items: [] },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Menu or command palette')
    })
  })

  describe('Code component', () => {
    test('fills label from language', () => {
      const node: PunkNode = {
        type: 'Code',
        props: { language: 'typescript', value: 'const x = 1' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('typescript code block')
    })

    test('uses filename if available', () => {
      const node: PunkNode = {
        type: 'Code',
        props: { filename: 'index.ts', value: 'const x = 1' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Code: index.ts')
    })

    test('generates description from filename and language', () => {
      const node: PunkNode = {
        type: 'Code',
        props: { language: 'python', filename: 'main.py', value: 'print("test")' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('python code block')
      expect(repaired.a11y?.description).toBe('python code from main.py')
    })
  })

  describe('FileDrop component', () => {
    test('fills label with accept types', () => {
      const node: PunkNode = {
        type: 'FileDrop',
        props: { accept: 'image/*' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('File upload area (image/*)')
    })

    test('generates description with accept and maxSize', () => {
      const node: PunkNode = {
        type: 'FileDrop',
        props: { accept: '.pdf,.doc', maxSize: '5MB' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.description).toContain('.pdf,.doc')
      expect(repaired.a11y?.description).toContain('5MB')
    })
  })

  describe('DatePicker component', () => {
    test('fills label from label prop', () => {
      const node: PunkNode = {
        type: 'DatePicker',
        props: { label: 'Start date' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Start date')
    })

    test('generates description from format', () => {
      const node: PunkNode = {
        type: 'DatePicker',
        props: { format: 'MM/DD/YYYY' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.description).toBe('Select a date in MM/DD/YYYY format')
    })
  })

  describe('Non-Rig components', () => {
    test('does not modify non-Rig components', () => {
      const node: PunkNode = {
        type: 'Button',
        props: { text: 'Click me' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y).toBeUndefined()
    })
  })

  describe('Nested schemas', () => {
    test('repairs nested nodes recursively', () => {
      const node: PunkNode = {
        type: 'Container',
        children: [
          {
            type: 'Chart',
            props: { type: 'bar', data: [] },
          },
          {
            type: 'Table',
            props: { columns: [], data: [] },
          },
        ],
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.children?.[0].a11y?.label).toBe('Bar visualization')
      expect(repaired.children?.[1].a11y?.caption).toBeTruthy()
    })

    test('handles deeply nested schemas', () => {
      const node: PunkNode = {
        type: 'Container',
        children: [
          {
            type: 'Section',
            children: [
              {
                type: 'Chart',
                props: { type: 'line', data: [] },
              },
            ],
          },
        ],
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.children?.[0].children?.[0].a11y?.label).toBe('Line visualization')
    })
  })

  describe('Full schema repair', () => {
    test('repairs full PunkSchema with root', () => {
      const schema: PunkSchema = {
        punkVersion: '1.0.0',
        schemaVersion: '1.0.0',
        root: {
          type: 'Chart',
          props: { type: 'pie', data: [] },
        },
      }

      const repaired = repairA11y(schema) as PunkSchema

      expect(repaired.root.a11y?.label).toBe('Pie visualization')
      expect(repaired.punkVersion).toBe('1.0.0')
    })
  })

  describe('Edge cases', () => {
    test('handles empty a11y object', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: {},
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Bar visualization')
    })

    test('handles whitespace-only labels', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: '   ' },
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('Bar visualization')
    })

    test('preserves non-empty fields even if they appear generic', () => {
      const node: PunkNode = {
        type: 'Chart',
        props: { type: 'bar', data: [] },
        a11y: { label: 'label' }, // Generic but not empty
      }

      const repaired = repairA11y(node) as PunkNode

      expect(repaired.a11y?.label).toBe('label') // Preserved as-is
    })
  })
})
