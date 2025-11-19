/**
 * Mohawk Logger
 *
 * Structured logging for Mohawk builder app with audit trails
 * for user actions, AI generation, and deployments
 */

import { configure, getConsoleSink, getLogger, type LogLevel } from '@logtape/logtape'

let isConfigured = false

/**
 * Configure logging for Mohawk
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
        category: ['punk', 'mohawk'],
        sinks: ['console'],
        level,
      },
    ],
  })

  isConfigured = true
}

/**
 * Get a logger for a specific Mohawk subsystem
 *
 * @example
 * ```ts
 * const logger = createLogger('api', 'generate')
 * logger.info('Schema generation started', { userId, projectId })
 * ```
 */
export function createLogger(...category: string[]) {
  return getLogger(['punk', 'mohawk', ...category])
}

/**
 * Pre-configured loggers for common Mohawk subsystems
 */
export const loggers = {
  api: createLogger('api'),
  database: createLogger('database'),
  builder: createLogger('builder'),
  deployment: createLogger('deployment'),
  audit: createLogger('audit'),
} as const

/**
 * Redact sensitive user data from logs
 */
export function redactUserData<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[] = ['email', 'password', 'apiKey', 'token']
): T {
  const redacted = { ...data }

  for (const field of fields) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]' as any
    }
  }

  return redacted
}

// Auto-configure on import
configureLogging().catch(() => {
  // Silent failure - logging is not critical
})
