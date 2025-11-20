/**
 * @punk/core - Component Registry
 * Centralized component registration and lookup
 */

import type { PunkComponent, ComponentMap } from './types'

/**
 * ComponentRegistry manages the mapping between type strings and React components
 */
export class ComponentRegistry {
  private components: ComponentMap

  constructor(initialComponents?: ComponentMap) {
    this.components = initialComponents || new Map()
  }

  /**
   * Register a component with a type name
   * @param type - Component type identifier (e.g., 'button', 'text')
   * @param component - React component to register
   */
  register(type: string, component: PunkComponent): void {
    if (!type || typeof type !== 'string') {
      throw new Error('Component type must be a non-empty string')
    }

    if (!component) {
      throw new Error('Component must be provided')
    }

    this.components.set(type, component)
  }

  /**
   * Get a component by type
   * @param type - Component type to look up
   * @returns Component if found, undefined otherwise
   */
  get(type: string): PunkComponent | undefined {
    return this.components.get(type)
  }

  /**
   * Check if a component type is registered
   * @param type - Component type to check
   * @returns True if component exists
   */
  has(type: string): boolean {
    return this.components.has(type)
  }

  /**
   * Unregister a component
   * @param type - Component type to remove
   * @returns True if component was removed
   */
  unregister(type: string): boolean {
    return this.components.delete(type)
  }

  /**
   * Get all registered component types
   * @returns Array of component type names
   */
  getTypes(): string[] {
    return Array.from(this.components.keys()).sort()
  }

  /**
   * Get the number of registered components
   */
  size(): number {
    return this.components.size
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear()
  }

  /**
   * Register multiple components at once
   * @param components - Object mapping type names to components
   */
  registerBatch(components: Record<string, PunkComponent>): void {
    for (const [type, component] of Object.entries(components)) {
      this.register(type, component)
    }
  }

  /**
   * Clone the registry
   * @returns New registry with same components
   */
  clone(): ComponentRegistry {
    const newMap = new Map(this.components)
    return new ComponentRegistry(newMap)
  }
}

/**
 * Default global component registry
 */
export const defaultRegistry = new ComponentRegistry()

/**
 * Helper function to register a component on the default registry
 * @param type - Component type name
 * @param component - React component
 */
export function registerComponent(type: string, component: PunkComponent): void {
  defaultRegistry.register(type, component)
}

/**
 * Helper function to get a component from the default registry
 * @param type - Component type to look up
 */
export function getComponent(type: string): PunkComponent | undefined {
  return defaultRegistry.get(type)
}

/**
 * Helper function to check if component exists in default registry
 * @param type - Component type to check
 */
export function hasComponent(type: string): boolean {
  return defaultRegistry.has(type)
}
