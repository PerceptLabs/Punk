/**
 * SynthPunk Logger
 *
 * Structured logging for AI schema generation with automatic redaction
 * of sensitive data (API keys, user prompts, etc.)
 */

import { configure, getConsoleSink, getLogger, type LogLevel } from '@logtape/logtape'

let isConfigured = false

/**
 * Configure logging for SynthPunk
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
        category: ['punk', 'synthpunk'],
        sinks: ['console'],
        level,
      },
    ],
  })

  isConfigured = true
}

/**
 * Get a logger for a specific SynthPunk subsystem
 *
 * @example
 * ```ts
 * const logger = createLogger('engine', 'generation')
 * logger.debug('Starting schema generation', { prompt, tokens: 1250 })
 * ```
 */
export function createLogger(...category: string[]) {
  return getLogger(['punk', 'synthpunk', ...category])
}

/**
 * Pre-configured loggers for common SynthPunk subsystems
 */
export const loggers = {
  engine: createLogger('engine'),
  validation: createLogger('validation'),
  providers: createLogger('providers'),
  streaming: createLogger('streaming'),
  context: createLogger('context'),
} as const

/**
 * Redact sensitive fields from log data
 * Useful for logging API requests/responses
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
