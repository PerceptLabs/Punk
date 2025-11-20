/**
 * @punk/core - Props Processing Tests
 */

import { describe, it, expect } from 'vitest'
import {
  interpolateProps,
  bindActions,
  processProps,
  getValueFromPath,
  setValueAtPath,
  evaluateCondition,
  hasTemplateExpressions,
  extractTemplatePaths,
} from '../props'
import type { DataContext, ActionBus } from '../types'

describe('getValueFromPath', () => {
  const data: DataContext = {
    user: {
      name: 'Alice',
      profile: {
        email: 'alice@example.com',
        age: 30,
      },
    },
    items: [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ],
    count: 42,
  }

  it('should get simple values', () => {
    expect(getValueFromPath('count', data)).toBe(42)
  })

  it('should get nested values', () => {
    expect(getValueFromPath('user.name', data)).toBe('Alice')
    expect(getValueFromPath('user.profile.email', data)).toBe('alice@example.com')
    expect(getValueFromPath('user.profile.age', data)).toBe(30)
  })

  it('should get array values', () => {
    expect(getValueFromPath('items[0].title', data)).toBe('First')
    expect(getValueFromPath('items[1].id', data)).toBe(2)
  })

  it('should return undefined for missing paths', () => {
    expect(getValueFromPath('missing', data)).toBeUndefined()
    expect(getValueFromPath('user.missing', data)).toBeUndefined()
    expect(getValueFromPath('items[99]', data)).toBeUndefined()
  })

  it('should handle null and undefined in path', () => {
    const dataWithNull = { value: null, obj: { nested: undefined } }
    expect(getValueFromPath('value', dataWithNull)).toBeNull()
    expect(getValueFromPath('obj.nested', dataWithNull)).toBeUndefined()
    expect(getValueFromPath('obj.nested.deep', dataWithNull)).toBeUndefined()
  })
})

describe('setValueAtPath', () => {
  it('should set simple values', () => {
    const data: DataContext = {}
    setValueAtPath('name', 'Bob', data)
    expect(data.name).toBe('Bob')
  })

  it('should set nested values', () => {
    const data: DataContext = { user: {} }
    setValueAtPath('user.name', 'Bob', data)
    expect(data.user.name).toBe('Bob')
  })

  it('should create intermediate objects', () => {
    const data: DataContext = {}
    setValueAtPath('user.profile.email', 'bob@example.com', data)
    expect(data.user.profile.email).toBe('bob@example.com')
  })

  it('should set array values', () => {
    const data: DataContext = { items: [{}, {}] }
    setValueAtPath('items[0].title', 'Updated', data)
    expect(data.items[0].title).toBe('Updated')
  })
})

describe('interpolateProps', () => {
  const data: DataContext = {
    user: {
      name: 'Alice',
      role: 'admin',
    },
    count: 5,
  }

  it('should interpolate simple templates', () => {
    const props = {
      text: 'Hello {{user.name}}',
    }

    const result = interpolateProps(props, data)
    expect(result.text).toBe('Hello Alice')
  })

  it('should interpolate multiple templates', () => {
    const props = {
      text: '{{user.name}} is an {{user.role}}',
    }

    const result = interpolateProps(props, data)
    expect(result.text).toBe('Alice is an admin')
  })

  it('should handle missing values', () => {
    const props = {
      text: 'Hello {{user.missing}}',
    }

    const result = interpolateProps(props, data)
    expect(result.text).toBe('Hello ')
  })

  it('should interpolate nested objects', () => {
    const props = {
      nested: {
        text: 'Count: {{count}}',
      },
    }

    const result = interpolateProps(props, data)
    expect(result.nested.text).toBe('Count: 5')
  })

  it('should interpolate arrays', () => {
    const props = {
      items: ['{{user.name}}', '{{user.role}}'],
    }

    const result = interpolateProps(props, data)
    expect(result.items).toEqual(['Alice', 'admin'])
  })

  it('should leave non-template strings unchanged', () => {
    const props = {
      text: 'No template here',
    }

    const result = interpolateProps(props, data)
    expect(result.text).toBe('No template here')
  })

  it('should convert values to strings', () => {
    const props = {
      text: 'Count: {{count}}',
    }

    const result = interpolateProps(props, data)
    expect(result.text).toBe('Count: 5')
  })
})

describe('bindActions', () => {
  it('should bind event handlers', () => {
    const mockHandler = () => console.log('clicked')
    const actions: ActionBus = {
      handleClick: mockHandler,
    }

    const props = {
      onClick: 'handleClick',
    }

    const result = bindActions(props, actions)
    expect(result.onClick).toBe(mockHandler)
  })

  it('should bind multiple handlers', () => {
    const actions: ActionBus = {
      handleClick: () => {},
      handleSubmit: () => {},
    }

    const props = {
      onClick: 'handleClick',
      onSubmit: 'handleSubmit',
    }

    const result = bindActions(props, actions)
    expect(result.onClick).toBe(actions.handleClick)
    expect(result.onSubmit).toBe(actions.handleSubmit)
  })

  it('should create no-op for missing handlers', () => {
    const actions: ActionBus = {}

    const props = {
      onClick: 'handleClick',
    }

    const result = bindActions(props, actions)
    expect(typeof result.onClick).toBe('function')
  })

  it('should pass through non-handler props', () => {
    const actions: ActionBus = {}

    const props = {
      text: 'Hello',
      count: 5,
    }

    const result = bindActions(props, actions)
    expect(result.text).toBe('Hello')
    expect(result.count).toBe(5)
  })

  it('should not bind non-event props starting with "on"', () => {
    const actions: ActionBus = {
      onlyData: () => {},
    }

    const props = {
      onlyData: 'value',
    }

    const result = bindActions(props, actions)
    // Should pass through as string since it's not an event handler pattern
    expect(result.onlyData).toBe('value')
  })
})

describe('processProps', () => {
  it('should interpolate and bind in one step', () => {
    const data: DataContext = {
      user: { name: 'Alice' },
    }

    const actions: ActionBus = {
      handleClick: () => {},
    }

    const props = {
      text: 'Hello {{user.name}}',
      onClick: 'handleClick',
    }

    const result = processProps(props, data, actions)
    expect(result.text).toBe('Hello Alice')
    expect(result.onClick).toBe(actions.handleClick)
  })
})

describe('evaluateCondition', () => {
  const data: DataContext = {
    user: {
      isLoggedIn: true,
      isGuest: false,
      role: 'admin',
    },
    count: 5,
  }

  it('should evaluate simple boolean conditions', () => {
    expect(evaluateCondition('user.isLoggedIn', data)).toBe(true)
    expect(evaluateCondition('user.isGuest', data)).toBe(false)
  })

  it('should evaluate negated conditions', () => {
    expect(evaluateCondition('!user.isGuest', data)).toBe(true)
    expect(evaluateCondition('!user.isLoggedIn', data)).toBe(false)
  })

  it('should evaluate equality conditions', () => {
    expect(evaluateCondition('user.role === "admin"', data)).toBe(true)
    expect(evaluateCondition('user.role === "user"', data)).toBe(false)
  })

  it('should evaluate inequality conditions', () => {
    expect(evaluateCondition('user.role !== "user"', data)).toBe(true)
    expect(evaluateCondition('user.role !== "admin"', data)).toBe(false)
  })

  it('should handle empty conditions', () => {
    expect(evaluateCondition('', data)).toBe(true)
  })

  it('should handle missing data paths', () => {
    expect(evaluateCondition('user.missing', data)).toBe(false)
  })

  it('should evaluate truthy/falsy values', () => {
    expect(evaluateCondition('count', data)).toBe(true)

    const dataWithZero = { value: 0, empty: '' }
    expect(evaluateCondition('value', dataWithZero)).toBe(false)
    expect(evaluateCondition('empty', dataWithZero)).toBe(false)
  })
})

describe('hasTemplateExpressions', () => {
  it('should detect template expressions', () => {
    expect(hasTemplateExpressions('Hello {{name}}')).toBe(true)
    expect(hasTemplateExpressions('{{value}}')).toBe(true)
    expect(hasTemplateExpressions('Start {{mid}} end')).toBe(true)
  })

  it('should return false for non-templates', () => {
    expect(hasTemplateExpressions('Hello world')).toBe(false)
    expect(hasTemplateExpressions('{ single brace }')).toBe(false)
    expect(hasTemplateExpressions('')).toBe(false)
  })
})

describe('extractTemplatePaths', () => {
  it('should extract single path', () => {
    const paths = extractTemplatePaths('Hello {{user.name}}')
    expect(paths).toEqual(['user.name'])
  })

  it('should extract multiple paths', () => {
    const paths = extractTemplatePaths('{{user.name}} is {{user.role}}')
    expect(paths).toEqual(['user.name', 'user.role'])
  })

  it('should handle no templates', () => {
    const paths = extractTemplatePaths('No templates here')
    expect(paths).toEqual([])
  })

  it('should trim whitespace in paths', () => {
    const paths = extractTemplatePaths('{{ user.name }}')
    expect(paths).toEqual(['user.name'])
  })
})
