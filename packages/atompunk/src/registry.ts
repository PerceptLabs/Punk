import { z } from 'zod'

/**
 * Backend Template Definition
 */
export interface BackendTemplate {
  name: string
  category: string
  description: string
  version: string
  params: z.ZodSchema
  generates: (params: any) => GeneratedCode
  constraints: TemplateConstraints
  dependencies: TemplateDependencies
  examples: TemplateExample[]
}

export interface GeneratedCode {
  service: string
  tests?: string
  migrations?: string
  docs?: string
}

export interface TemplateConstraints {
  forbiddenOperations: string[]
  requiredValidation: string[]
  rateLimiting?: {
    maxAttempts: number
    windowMs: number
    lockoutDuration?: number
  }
  permissions?: string[]
}

export interface TemplateDependencies {
  npm?: string[]
  go?: string[]
}

export interface TemplateExample {
  params: any
  description: string
  useCase: string
}

/**
 * Allowlist of permitted template names
 */
export const ALLOWED_TEMPLATES = [
  // Authentication & Authorization
  'passwordAuth', 'magicLinkAuth', 'oauthProvider', 'jwtSession',
  'rbacPermissions', 'apiKeyAuth', 'twoFactorAuth', 'sessionManager',

  // CRUD Operations
  'crudResource', 'listEndpoint', 'searchEndpoint', 'bulkOperations',
  'softDeleteResource', 'auditLoggedCrud',

  // File Handling
  'fileUpload', 'imageProcessor', 'pdfGenerator', 'csvImport', 'csvExport',

  // External Integrations
  'webhookReceiver', 'webhookSender', 'apiProxy', 'emailSender', 'smsSender',

  // Background Jobs
  'scheduledJob', 'queueWorker', 'batchProcessor',

  // Payments & Commerce
  'stripeCheckout', 'subscriptionManager', 'invoiceGenerator',

  // Data Processing
  'dataValidator', 'dataTransformer', 'reportGenerator',

  // Real-time
  'pubsubChannel', 'websocketHandler'
] as const

export type AllowedTemplateName = typeof ALLOWED_TEMPLATES[number]

/**
 * Template Registry
 * Stores and retrieves backend templates with validation
 */
export class TemplateRegistry {
  private templates: Map<string, BackendTemplate> = new Map()

  /**
   * Register a new template
   */
  register(name: AllowedTemplateName, template: BackendTemplate): void {
    // Validate template name is in allowlist
    if (!ALLOWED_TEMPLATES.includes(name as any)) {
      throw new Error(
        `Template '${name}' is not in the allowlist. ` +
        `Allowed templates: ${ALLOWED_TEMPLATES.join(', ')}`
      )
    }

    // Validate template structure
    this.validateTemplate(template)

    this.templates.set(name, template)
  }

  /**
   * Get a template by name
   */
  get(name: string): BackendTemplate | undefined {
    return this.templates.get(name)
  }

  /**
   * Get a template by name (throws if not found)
   */
  getOrThrow(name: string): BackendTemplate {
    const template = this.get(name)
    if (!template) {
      throw new Error(`Template '${name}' not found`)
    }
    return template
  }

  /**
   * List all registered templates
   */
  list(): BackendTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * List templates by category
   */
  listByCategory(category: string): BackendTemplate[] {
    return this.list().filter(t => t.category === category)
  }

  /**
   * Check if a template exists
   */
  has(name: string): boolean {
    return this.templates.has(name)
  }

  /**
   * Get all template names
   */
  getNames(): string[] {
    return Array.from(this.templates.keys())
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set(this.list().map(t => t.category))
    return Array.from(categories).sort()
  }

  /**
   * Validate template structure
   */
  private validateTemplate(template: BackendTemplate): void {
    if (!template.name) {
      throw new Error('Template must have a name')
    }
    if (!template.category) {
      throw new Error('Template must have a category')
    }
    if (!template.description) {
      throw new Error('Template must have a description')
    }
    if (!template.params) {
      throw new Error('Template must have a params schema')
    }
    if (typeof template.generates !== 'function') {
      throw new Error('Template must have a generates function')
    }
    if (!template.constraints) {
      throw new Error('Template must have constraints')
    }
    if (!Array.isArray(template.constraints.forbiddenOperations)) {
      throw new Error('Template constraints must include forbiddenOperations array')
    }
    if (!Array.isArray(template.constraints.requiredValidation)) {
      throw new Error('Template constraints must include requiredValidation array')
    }
  }
}

/**
 * Default global template registry
 */
export const defaultRegistry = new TemplateRegistry()
