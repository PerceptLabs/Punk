/**
 * SynthPunk - JSON Patch Streaming Utilities
 */

import { applyPatch as applyJsonPatch, Operation } from 'fast-json-patch'
import { SchemaPatch, PunkSchema } from './types'

/**
 * Parse streaming chunks and extract complete JSON objects
 */
export function parseStreamChunk(buffer: string): SchemaPatch[] {
  const patches: SchemaPatch[] = []
  let depth = 0
  let start = -1

  for (let i = 0; i < buffer.length; i++) {
    if (buffer[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (buffer[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try {
          const json = buffer.substring(start, i + 1)
          const patch = JSON.parse(json) as SchemaPatch
          patches.push(patch)
        } catch {
          // Skip malformed JSON
        }
        start = -1
      }
    }
  }

  return patches
}

/**
 * Extract patches from text buffer with brace counting
 */
export class StreamingPatchExtractor {
  private buffer = ''
  private jsonBuffer = ''
  private braceCount = 0
  private inJsonBlock = false

  /**
   * Process incoming text chunk
   */
  process(chunk: string): SchemaPatch[] {
    this.buffer += chunk
    const patches: SchemaPatch[] = []

    for (const char of chunk) {
      if (char === '{') {
        this.braceCount++
        this.inJsonBlock = true
      }

      if (this.inJsonBlock) {
        this.jsonBuffer += char
      }

      if (char === '}') {
        this.braceCount--

        if (this.braceCount === 0 && this.inJsonBlock) {
          // Try to parse complete JSON object
          try {
            const patch = JSON.parse(this.jsonBuffer) as SchemaPatch
            patches.push(patch)
            this.jsonBuffer = ''
            this.inJsonBlock = false
          } catch {
            // Incomplete or malformed JSON, continue buffering
          }
        }
      }
    }

    return patches
  }

  /**
   * Get remaining buffer content
   */
  getBuffer(): string {
    return this.buffer
  }

  /**
   * Reset extractor state
   */
  reset(): void {
    this.buffer = ''
    this.jsonBuffer = ''
    this.braceCount = 0
    this.inJsonBlock = false
  }
}

/**
 * Apply a JSON Patch to a Punk schema
 */
export function applyPatch(schema: PunkSchema, patch: SchemaPatch): PunkSchema {
  // Convert to fast-json-patch format
  const operation: Operation = {
    op: patch.op as Operation['op'],
    path: patch.path,
    value: patch.value,
  }

  if (patch.from) {
    ;(operation as any).from = patch.from
  }

  try {
    const result = applyJsonPatch([schema], [operation], true, false)
    return result.newDocument as PunkSchema
  } catch (error) {
    throw new Error(`Failed to apply patch: ${(error as Error).message}`)
  }
}

/**
 * Apply multiple patches sequentially
 */
export function applyPatches(schema: PunkSchema, patches: SchemaPatch[]): PunkSchema {
  let current = schema

  for (const patch of patches) {
    current = applyPatch(current, patch)
  }

  return current
}

/**
 * Build a schema from patches starting from empty
 */
export function buildSchemaFromPatches(patches: SchemaPatch[]): PunkSchema | null {
  if (patches.length === 0) {
    return null
  }

  // Find the root patch
  const rootPatch = patches.find((p) => p.path === '/root' && p.op === 'add')
  if (!rootPatch || !rootPatch.value) {
    return null
  }

  // Start with root
  let schema = rootPatch.value as PunkSchema

  // Apply remaining patches
  const remainingPatches = patches.filter((p) => p !== rootPatch)
  for (const patch of remainingPatches) {
    try {
      schema = applyPatch(schema, patch)
    } catch (error) {
      console.warn(`Failed to apply patch ${patch.path}:`, error)
      // Continue with other patches
    }
  }

  return schema
}

/**
 * Validate that a patch can be applied to a schema
 */
export function canApplyPatch(schema: PunkSchema | null, patch: SchemaPatch): boolean {
  if (!schema) {
    // Can only add root to empty schema
    return patch.path === '/root' && patch.op === 'add'
  }

  try {
    applyPatch(schema, patch)
    return true
  } catch {
    return false
  }
}

/**
 * Deduplicate patches by path (keep last)
 */
export function deduplicatePatches(patches: SchemaPatch[]): SchemaPatch[] {
  const seen = new Map<string, SchemaPatch>()

  for (const patch of patches) {
    const key = `${patch.op}:${patch.path}`
    seen.set(key, patch)
  }

  return Array.from(seen.values())
}

/**
 * Sort patches for optimal application order
 */
export function sortPatches(patches: SchemaPatch[]): SchemaPatch[] {
  return patches.slice().sort((a, b) => {
    // Root operations first
    if (a.path === '/root' && b.path !== '/root') return -1
    if (b.path === '/root' && a.path !== '/root') return 1

    // Then by path depth (shallower first)
    const depthA = a.path.split('/').length
    const depthB = b.path.split('/').length
    if (depthA !== depthB) return depthA - depthB

    // Then by operation priority (add > replace > remove)
    const opPriority = { add: 0, replace: 1, move: 2, copy: 3, remove: 4, test: 5 }
    return opPriority[a.op] - opPriority[b.op]
  })
}

/**
 * Get affected paths from a patch
 */
export function getAffectedPaths(patch: SchemaPatch): string[] {
  const paths = [patch.path]

  if (patch.from) {
    paths.push(patch.from)
  }

  return paths
}

/**
 * Check if two patches conflict
 */
export function patchesConflict(a: SchemaPatch, b: SchemaPatch): boolean {
  const pathsA = getAffectedPaths(a)
  const pathsB = getAffectedPaths(b)

  // Check for direct path overlap
  for (const pathA of pathsA) {
    for (const pathB of pathsB) {
      if (pathA === pathB) return true

      // Check for parent-child relationship
      if (pathA.startsWith(pathB + '/') || pathB.startsWith(pathA + '/')) {
        return true
      }
    }
  }

  return false
}

/**
 * Merge non-conflicting patches
 */
export function mergePatches(patches: SchemaPatch[]): SchemaPatch[] {
  const merged: SchemaPatch[] = []
  const used = new Set<number>()

  for (let i = 0; i < patches.length; i++) {
    if (used.has(i)) continue

    const current = patches[i]
    let canMerge = true

    // Check if this patch conflicts with any already merged
    for (const mergedPatch of merged) {
      if (patchesConflict(current, mergedPatch)) {
        canMerge = false
        break
      }
    }

    if (canMerge) {
      merged.push(current)
      used.add(i)
    }
  }

  return merged
}
