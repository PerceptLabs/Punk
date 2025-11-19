/**
 * @punk/core - Validator Tests
 */

import { describe, it, expect } from 'vitest'
import {
  validateSchema,
  validateComplexity,
  validateDataPath,
  validateHandlerName,
  validateSecurity,
} from '../validator'
import type { PunkNode } from '../types'

describe('validateSchema', () => {
  it('should validate a simple node', () => {
    const node: PunkNode = {
      type: 'text',
      props: {
        children: 'Hello World',
      },
    }

    const result = validateSchema(node)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
  })

  it('should validate a full PunkSchema', () => {
    const schema = {
      punkVersion: '1.0.0',
      schemaVersion: '1.0.0',
      root: {
        type: 'container',
        props: {},
      },
    }

    const result = validateSchema(schema)
    expect(result.valid).toBe(true)
  })

  it('should fail for invalid schema', () => {
    const invalid = {
      // Missing required fields
      type: '',
    }

    const result = validateSchema(invalid)
    expect(result.valid).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors!.length).toBeGreaterThan(0)
  })

  it('should validate nested children', () => {
    const node: PunkNode = {
      type: 'container',
      children: [
        {
          type: 'text',
          props: { children: 'Child 1' },
        },
        {
          type: 'text',
          props: { children: 'Child 2' },
        },
      ],
    }

    const result = validateSchema(node)
    expect(result.valid).toBe(true)
  })
})

describe('validateComplexity', () => {
  it('should pass for simple nodes', () => {
    const node: PunkNode = {
      type: 'text',
      props: {},
    }

    const result = validateComplexity(node)
    expect(result.withinBudget).toBe(true)
    expect(result.nodeCount).toBe(1)
    expect(result.maxDepth).toBe(1)
  })

  it('should count children correctly', () => {
    const node: PunkNode = {
      type: 'container',
      children: [
        { type: 'text', props: {} },
        { type: 'text', props: {} },
        { type: 'text', props: {} },
      ],
    }

    const result = validateComplexity(node)
    expect(result.nodeCount).toBe(4) // container + 3 children
    expect(result.maxDepth).toBe(2)
  })

  it('should count nested depth correctly', () => {
    const node: PunkNode = {
      type: 'container',
      children: [
        {
          type: 'container',
          children: [
            {
              type: 'container',
              children: [{ type: 'text', props: {} }],
            },
          ],
        },
      ],
    }

    const result = validateComplexity(node)
    expect(result.maxDepth).toBe(4)
  })

  it('should fail for excessive nodes', () => {
    // Create a very large tree
    const node: PunkNode = {
      type: 'container',
      children: Array(1001)
        .fill(null)
        .map(() => ({ type: 'text', props: {} })),
    }

    const result = validateComplexity(node)
    expect(result.withinBudget).toBe(false)
    expect(result.nodeCount).toBeGreaterThan(result.budget.maxNodes)
  })

  it('should include itemTemplate in complexity calculation', () => {
    const node: PunkNode = {
      type: 'list',
      dataSource: 'items',
      itemTemplate: {
        type: 'container',
        children: [
          { type: 'text', props: {} },
          { type: 'text', props: {} },
        ],
      },
    }

    const result = validateComplexity(node)
    expect(result.nodeCount).toBe(4) // list + template container + 2 children
  })
})

describe('validateDataPath', () => {
  it('should accept valid simple paths', () => {
    expect(validateDataPath('user')).toBe(true)
    expect(validateDataPath('userName')).toBe(true)
    expect(validateDataPath('user_name')).toBe(true)
    expect(validateDataPath('$data')).toBe(true)
  })

  it('should accept valid nested paths', () => {
    expect(validateDataPath('user.name')).toBe(true)
    expect(validateDataPath('user.profile.email')).toBe(true)
    expect(validateDataPath('data.items.first.value')).toBe(true)
  })

  it('should accept array access', () => {
    expect(validateDataPath('items[0]')).toBe(true)
    expect(validateDataPath('items[0].name')).toBe(true)
    expect(validateDataPath('data.users[5].email')).toBe(true)
  })

  it('should reject invalid paths', () => {
    expect(validateDataPath('')).toBe(false)
    expect(validateDataPath('123invalid')).toBe(false)
    expect(validateDataPath('user..name')).toBe(false)
    expect(validateDataPath('.user')).toBe(false)
    expect(validateDataPath('user.')).toBe(false)
    expect(validateDataPath('user name')).toBe(false)
  })
})

describe('validateHandlerName', () => {
  it('should accept valid handler names', () => {
    expect(validateHandlerName('onClick')).toBe(true)
    expect(validateHandlerName('handleSubmit')).toBe(true)
    expect(validateHandlerName('onFormChange')).toBe(true)
    expect(validateHandlerName('_privateHandler')).toBe(true)
    expect(validateHandlerName('$handler')).toBe(true)
  })

  it('should reject invalid handler names', () => {
    expect(validateHandlerName('')).toBe(false)
    expect(validateHandlerName('123invalid')).toBe(false)
    expect(validateHandlerName('handle-click')).toBe(false)
    expect(validateHandlerName('handle.click')).toBe(false)
    expect(validateHandlerName('handle click')).toBe(false)
  })
})

describe('validateSecurity', () => {
  it('should pass safe schemas', () => {
    const node: PunkNode = {
      type: 'text',
      props: {
        children: 'Safe content',
      },
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('should detect script injection', () => {
    const node: PunkNode = {
      type: 'text',
      props: {
        children: '<script>alert("xss")</script>',
      },
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('should detect javascript: protocol', () => {
    const node: PunkNode = {
      type: 'link',
      props: {
        href: 'javascript:alert("xss")',
      },
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(false)
    expect(result.issues.some((i) => i.includes('javascript:'))).toBe(true)
  })

  it('should detect dangerous data URIs', () => {
    const node: PunkNode = {
      type: 'link',
      props: {
        href: 'data:text/html,<script>alert("xss")</script>',
      },
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(false)
  })

  it('should detect dangerous inline styles', () => {
    const node: PunkNode = {
      type: 'div',
      style: {
        background: 'url(javascript:alert("xss"))',
      },
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(false)
  })

  it('should check nested children', () => {
    const node: PunkNode = {
      type: 'container',
      children: [
        {
          type: 'text',
          props: {
            children: 'Safe',
          },
        },
        {
          type: 'text',
          props: {
            children: '<script>danger</script>',
          },
        },
      ],
    }

    const result = validateSecurity(node)
    expect(result.safe).toBe(false)
  })
})
