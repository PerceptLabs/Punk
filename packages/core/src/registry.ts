/**
 * @punk/core - Component Registry
 * Centralized component registration and lookup
 */

import { useState, useEffect } from 'react'
import type { PunkComponent, ComponentMap, ComponentRegistration, ComponentMeta } from './types'

/**
 * ComponentRegistry manages the mapping between type strings and React components
 */
export class ComponentRegistry {
  private components: ComponentMap
  private metadata: Map<string, ComponentMeta>
  private schemas: Map<string, any>

  constructor(initialComponents?: ComponentMap) {
    this.components = initialComponents || new Map()
    this.metadata = new Map()
    this.schemas = new Map()
  }

  /**
   * Register a component with a type name
   * @param type - Component type identifier (e.g., 'button', 'text')
   * @param component - React component to register
   * @param registration - Optional schema and metadata
   */
  register(type: string, component: PunkComponent, registration?: Omit<ComponentRegistration, 'component'>): void {
    if (!type || typeof type !== 'string') {
      throw new Error('Component type must be a non-empty string')
    }

    if (!component) {
      throw new Error('Component must be provided')
    }

    this.components.set(type, component)

    // Store metadata if provided
    if (registration?.meta) {
      this.metadata.set(type, registration.meta)
    }

    // Store schema if provided
    if (registration?.schema) {
      this.schemas.set(type, registration.schema)
    }
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
    const newRegistry = new ComponentRegistry(newMap)
    newRegistry.metadata = new Map(this.metadata)
    newRegistry.schemas = new Map(this.schemas)
    return newRegistry
  }

  /**
   * Get component metadata
   * @param type - Component type to look up
   * @returns Metadata if found, undefined otherwise
   */
  getMeta(type: string): ComponentMeta | undefined {
    return this.metadata.get(type)
  }

  /**
   * Get component schema
   * @param type - Component type to look up
   * @returns Schema if found, undefined otherwise
   */
  getSchema(type: string): any | undefined {
    return this.schemas.get(type)
  }

  /**
   * Get all metadata entries
   * @returns Array of [type, metadata] tuples
   */
  getAllMeta(): Array<[string, ComponentMeta]> {
    return Array.from(this.metadata.entries())
  }

  /**
   * Get components by category
   * @param category - Category to filter by
   * @returns Array of component types in the category
   */
  getByCategory(category: string): string[] {
    return Array.from(this.metadata.entries())
      .filter(([_, meta]) => meta.category === category)
      .map(([type, _]) => type)
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
 * @param registration - Optional schema and metadata
 */
export function registerComponent(
  type: string,
  component: PunkComponent,
  registration?: Omit<ComponentRegistration, 'component'>
): void {
  defaultRegistry.register(type, component, registration)
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

/**
 * React hook to access the component registry
 * Provides reactive access to registered components and their metadata
 *
 * @param registry - Optional registry instance (defaults to defaultRegistry)
 * @returns Object with registry methods and current state
 *
 * @example
 * ```tsx
 * function ComponentPalette() {
 *   const { getTypes, getMeta, getByCategory } = useComponentRegistry()
 *   const types = getTypes()
 *   return (
 *     <div>
 *       {types.map(type => {
 *         const meta = getMeta(type)
 *         return <div key={type}>{meta?.displayName}</div>
 *       })}
 *     </div>
 *   )
 * }
 * ```
 */
export function useComponentRegistry(registry: ComponentRegistry = defaultRegistry) {
  const [, forceUpdate] = useState(0)

  // Force re-render when registry changes
  // This is a simple implementation - for production, you might want to use
  // a more sophisticated change detection mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    /**
     * Get all registered component types
     */
    getTypes: () => registry.getTypes(),

    /**
     * Get a component by type
     */
    get: (type: string) => registry.get(type),

    /**
     * Check if a component exists
     */
    has: (type: string) => registry.has(type),

    /**
     * Get component metadata
     */
    getMeta: (type: string) => registry.getMeta(type),

    /**
     * Get component schema
     */
    getSchema: (type: string) => registry.getSchema(type),

    /**
     * Get all metadata entries
     */
    getAllMeta: () => registry.getAllMeta(),

    /**
     * Get components by category
     */
    getByCategory: (category: string) => registry.getByCategory(category),

    /**
     * Get the registry size
     */
    size: () => registry.size(),

    /**
     * Access to the registry instance itself
     */
    registry,
  }
}
