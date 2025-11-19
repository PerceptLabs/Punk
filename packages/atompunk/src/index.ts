/**
 * @punk/atompunk
 * Backend Template Generation System
 *
 * Generates secure, production-ready backend code from templates.
 * Prevents AI from generating raw code by providing pre-built, audited templates.
 */

// Core exports
export { TemplateRegistry, defaultRegistry, ALLOWED_TEMPLATES } from './registry'
export type {
  BackendTemplate,
  GeneratedCode,
  TemplateConstraints,
  TemplateDependencies,
  TemplateExample,
  AllowedTemplateName
} from './registry'

export { TemplateGenerator, defaultGenerator, generateTemplate } from './generator'
export type { GenerateOptions, GenerateResult } from './generator'

export {
  validateTemplateParams,
  validateGeneratedCode,
  validateParameterSecurity,
  validateTemplateGeneration,
  sanitizeInput,
  validateFileName
} from './validators'
export type { ValidationResult } from './validators'

export { ExportGenerator, defaultExportGenerator, exportApp } from './export'
export type {
  ExportTargetName,
  ExportConfig,
  ExportArtifacts,
  GeneratedApp
} from './export'

// Adapters
export { EncoreAdapter, defaultEncoreAdapter, generateEncoreService } from './adapters/encore'
export type {
  EncoreService,
  EncoreEndpoint,
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  DatabaseIndex,
  DatabaseForeignKey,
  SQLMigration
} from './adapters/encore'

// Templates - Authentication
export { passwordAuthTemplate } from './templates/auth/password-auth'
export { magicLinkAuthTemplate } from './templates/auth/magic-link'

// Templates - CRUD
export { crudResourceTemplate } from './templates/crud/crud-resource'

// Templates - Files
export { fileUploadTemplate } from './templates/files/file-upload'

// Templates - Integrations
export { webhookReceiverTemplate } from './templates/integrations/webhook-receiver'
export { emailSenderTemplate } from './templates/integrations/email-sender'
export { apiProxyTemplate } from './templates/integrations/api-proxy'

// Templates - Jobs
export { scheduledJobTemplate } from './templates/jobs/scheduled-job'

// Templates - Real-time
export { pubsubChannelTemplate } from './templates/realtime/pubsub-channel'

// Templates - Payments
export { stripeCheckoutTemplate } from './templates/payments/stripe-checkout'

// Auto-register all templates
import { defaultRegistry } from './registry'
import { passwordAuthTemplate } from './templates/auth/password-auth'
import { magicLinkAuthTemplate } from './templates/auth/magic-link'
import { crudResourceTemplate } from './templates/crud/crud-resource'
import { fileUploadTemplate } from './templates/files/file-upload'
import { webhookReceiverTemplate } from './templates/integrations/webhook-receiver'
import { emailSenderTemplate } from './templates/integrations/email-sender'
import { apiProxyTemplate } from './templates/integrations/api-proxy'
import { scheduledJobTemplate } from './templates/jobs/scheduled-job'
import { pubsubChannelTemplate } from './templates/realtime/pubsub-channel'
import { stripeCheckoutTemplate } from './templates/payments/stripe-checkout'

// Register all templates
defaultRegistry.register('passwordAuth', passwordAuthTemplate)
defaultRegistry.register('magicLinkAuth', magicLinkAuthTemplate)
defaultRegistry.register('crudResource', crudResourceTemplate)
defaultRegistry.register('fileUpload', fileUploadTemplate)
defaultRegistry.register('webhookReceiver', webhookReceiverTemplate)
defaultRegistry.register('emailSender', emailSenderTemplate)
defaultRegistry.register('apiProxy', apiProxyTemplate)
defaultRegistry.register('scheduledJob', scheduledJobTemplate)
defaultRegistry.register('pubsubChannel', pubsubChannelTemplate)
defaultRegistry.register('stripeCheckout', stripeCheckoutTemplate)

/**
 * Get the version of @punk/atompunk
 */
export const VERSION = '1.0.0'

/**
 * Get all registered template names
 */
export function getAvailableTemplates(): string[] {
  return defaultRegistry.getNames()
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  return defaultRegistry.getCategories()
}

/**
 * Quick start: Generate code from a template
 *
 * @example
 * ```ts
 * import { quickGenerate } from '@punk/atompunk'
 *
 * const result = await quickGenerate('passwordAuth', {
 *   userModel: 'User',
 *   sessionType: 'jwt',
 *   sessionDuration: '7d'
 * })
 *
 * if (result.success) {
 *   console.log(result.code.service)
 * }
 * ```
 */
export async function quickGenerate(
  templateName: string,
  params: unknown
): Promise<import('./generator').GenerateResult> {
  return generateTemplate(templateName, params)
}

/**
 * Check if a template exists
 */
export function hasTemplate(name: string): boolean {
  return defaultRegistry.has(name)
}

/**
 * Get template info
 */
export function getTemplateInfo(name: string) {
  return defaultRegistry.get(name)
}
