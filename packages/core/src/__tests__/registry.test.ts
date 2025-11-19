/**
 * @punk/core - Component Registry Tests
 */

import { describe, it, expect } from 'vitest'
import { ComponentRegistry, defaultRegistry } from '../registry'

// Mock components
const MockComponent1 = () => null
const MockComponent2 = () => null
const MockComponent3 = () => null

describe('ComponentRegistry', () => {
  it('should create empty registry', () => {
    const registry = new ComponentRegistry()
    expect(registry.size()).toBe(0)
  })

  it('should register components', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockComponent1)

    expect(registry.has('text')).toBe(true)
    expect(registry.get('text')).toBe(MockComponent1)
  })

  it('should get registered component', () => {
    const registry = new ComponentRegistry()
    registry.register('button', MockComponent2)

    const component = registry.get('button')
    expect(component).toBe(MockComponent2)
  })

  it('should return undefined for unregistered component', () => {
    const registry = new ComponentRegistry()
    expect(registry.get('unknown')).toBeUndefined()
  })

  it('should check if component exists', () => {
    const registry = new ComponentRegistry()
    registry.register('input', MockComponent1)

    expect(registry.has('input')).toBe(true)
    expect(registry.has('missing')).toBe(false)
  })

  it('should unregister components', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockComponent1)

    expect(registry.has('text')).toBe(true)

    const removed = registry.unregister('text')
    expect(removed).toBe(true)
    expect(registry.has('text')).toBe(false)
  })

  it('should return false when unregistering non-existent component', () => {
    const registry = new ComponentRegistry()
    const removed = registry.unregister('missing')
    expect(removed).toBe(false)
  })

  it('should get all registered types', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockComponent1)
    registry.register('button', MockComponent2)
    registry.register('input', MockComponent3)

    const types = registry.getTypes()
    expect(types).toEqual(['button', 'input', 'text']) // Sorted
  })

  it('should get size', () => {
    const registry = new ComponentRegistry()
    expect(registry.size()).toBe(0)

    registry.register('text', MockComponent1)
    expect(registry.size()).toBe(1)

    registry.register('button', MockComponent2)
    expect(registry.size()).toBe(2)

    registry.unregister('text')
    expect(registry.size()).toBe(1)
  })

  it('should clear all components', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockComponent1)
    registry.register('button', MockComponent2)

    expect(registry.size()).toBe(2)

    registry.clear()
    expect(registry.size()).toBe(0)
    expect(registry.has('text')).toBe(false)
    expect(registry.has('button')).toBe(false)
  })

  it('should register batch of components', () => {
    const registry = new ComponentRegistry()

    registry.registerBatch({
      text: MockComponent1,
      button: MockComponent2,
      input: MockComponent3,
    })

    expect(registry.size()).toBe(3)
    expect(registry.get('text')).toBe(MockComponent1)
    expect(registry.get('button')).toBe(MockComponent2)
    expect(registry.get('input')).toBe(MockComponent3)
  })

  it('should clone registry', () => {
    const registry = new ComponentRegistry()
    registry.register('text', MockComponent1)
    registry.register('button', MockComponent2)

    const clone = registry.clone()

    expect(clone.size()).toBe(2)
    expect(clone.get('text')).toBe(MockComponent1)
    expect(clone.get('button')).toBe(MockComponent2)

    // Modifications to clone should not affect original
    clone.register('input', MockComponent3)
    expect(clone.size()).toBe(3)
    expect(registry.size()).toBe(2)
  })

  it('should throw error for invalid type', () => {
    const registry = new ComponentRegistry()

    expect(() => {
      registry.register('', MockComponent1)
    }).toThrow()

    expect(() => {
      registry.register(null as any, MockComponent1)
    }).toThrow()
  })

  it('should throw error for missing component', () => {
    const registry = new ComponentRegistry()

    expect(() => {
      registry.register('text', null as any)
    }).toThrow()

    expect(() => {
      registry.register('text', undefined as any)
    }).toThrow()
  })

  it('should allow overwriting existing components', () => {
    const registry = new ComponentRegistry()

    registry.register('text', MockComponent1)
    expect(registry.get('text')).toBe(MockComponent1)

    registry.register('text', MockComponent2)
    expect(registry.get('text')).toBe(MockComponent2)
  })

  it('should create registry with initial components', () => {
    const initialMap = new Map([
      ['text', MockComponent1],
      ['button', MockComponent2],
    ])

    const registry = new ComponentRegistry(initialMap)

    expect(registry.size()).toBe(2)
    expect(registry.get('text')).toBe(MockComponent1)
    expect(registry.get('button')).toBe(MockComponent2)
  })
})

describe('defaultRegistry', () => {
  it('should be a ComponentRegistry instance', () => {
    expect(defaultRegistry).toBeInstanceOf(ComponentRegistry)
  })

  it('should be accessible globally', () => {
    // Save original state
    const originalSize = defaultRegistry.size()

    // Test registration
    defaultRegistry.register('test-component', MockComponent1)
    expect(defaultRegistry.has('test-component')).toBe(true)

    // Cleanup
    defaultRegistry.unregister('test-component')
    expect(defaultRegistry.size()).toBe(originalSize)
  })
})
