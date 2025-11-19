/**
 * GlyphCase Logger
 *
 * Structured logging for Active Capsule reactive database,
 * Lua runtime, and skill management
 */

import { configure, getConsoleSink, getLogger, type LogLevel } from '@logtape/logtape'

let isConfigured = false

/**
 * Configure logging for GlyphCase
 * Call once at startup - safe to call multiple times
 */
export async function configureLogging(options?: {
  level?: LogLevel
  enabled?: boolean
}): Promise<void> {
  if (isConfigured) return

  const enabled = options?.enabled ?? process.env.NODE_ENV !== 'production'
  const level = options?.level ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

  if (!enabled) {
    isConfigured = true
    return
  }

  await configure({
    sinks: {
      console: getConsoleSink(),
    },
    filters: {},
    loggers: [
      {
        category: ['punk', 'glyphcase'],
        sinks: ['console'],
        level,
      },
    ],
  })

  isConfigured = true
}

/**
 * Get a logger for a specific GlyphCase subsystem
 *
 * @example
 * ```ts
 * const logger = createLogger('capsule', 'watchers')
 * logger.debug('Watch triggered', { table: 'projects', operation: 'UPDATE' })
 * ```
 */
export function createLogger(...category: string[]) {
  return getLogger(['punk', 'glyphcase', ...category])
}

/**
 * Pre-configured loggers for common GlyphCase subsystems
 */
export const loggers = {
  capsule: createLogger('capsule'),
  lua: createLogger('lua'),
  skills: createLogger('skills'),
  sync: createLogger('sync'),
  events: createLogger('events'),
} as const

/**
 * Redact sensitive data from logs
 */
export function redact<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[] = ['apiKey', 'api_key', 'token', 'password', 'secret']
): T {
  const redacted = { ...data }

  for (const field of fields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]' as any
    }
  }

  return redacted
}

// Auto-configure on import (can be overridden)
configureLogging().catch(() => {
  // Silent failure - logging is not critical
})
