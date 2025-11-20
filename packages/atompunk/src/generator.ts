import type { BackendTemplate, GeneratedCode } from './registry'
import { defaultRegistry } from './registry'
import { validateTemplateGeneration, type ValidationResult } from './validators'

export interface GenerateOptions {
  registry?: typeof defaultRegistry
  skipValidation?: boolean
  includeTests?: boolean
  includeMigrations?: boolean
  includeDocs?: boolean
}

export interface GenerateResult {
  success: boolean
  code?: GeneratedCode
  validation?: ValidationResult
  error?: string
}

/**
 * Template Generator
 * Generates backend code from templates with validation
 */
export class TemplateGenerator {
  private registry: typeof defaultRegistry

  constructor(registry = defaultRegistry) {
    this.registry = registry
  }

  /**
   * Generate code from a template
   */
  async generate(
    templateName: string,
    params: unknown,
    options: GenerateOptions = {}
  ): Promise<GenerateResult> {
    try {
      // 1. Get template from registry
      const template = this.registry.get(templateName)
      if (!template) {
        return {
          success: false,
          error: `Template '${templateName}' not found in registry`
        }
      }

      // 2. Validate params and generation (unless skipped)
      let validation: ValidationResult | undefined
      if (!options.skipValidation) {
        validation = validateTemplateGeneration(templateName, params, template)

        if (!validation.valid) {
          return {
            success: false,
            validation,
            error: `Validation failed: ${validation.errors.join(', ')}`
          }
        }
      }

      // 3. Generate code
      const code = template.generates(params)

      // 4. Filter generated artifacts based on options
      const filteredCode: GeneratedCode = {
        service: code.service,
        ...(options.includeTests !== false && code.tests ? { tests: code.tests } : {}),
        ...(options.includeMigrations !== false && code.migrations ? { migrations: code.migrations } : {}),
        ...(options.includeDocs !== false && code.docs ? { docs: code.docs } : {})
      }

      return {
        success: true,
        code: filteredCode,
        validation
      }
    } catch (error) {
      return {
        success: false,
        error: `Generation failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Generate multiple templates at once
   */
  async generateBatch(
    templates: Array<{ name: string; params: unknown }>,
    options: GenerateOptions = {}
  ): Promise<Map<string, GenerateResult>> {
    const results = new Map<string, GenerateResult>()

    for (const { name, params } of templates) {
      const result = await this.generate(name, params, options)
      results.set(name, result)
    }

    return results
  }

  /**
   * Validate template parameters without generating
   */
  async validate(
    templateName: string,
    params: unknown
  ): Promise<ValidationResult> {
    const template = this.registry.get(templateName)
    if (!template) {
      return {
        valid: false,
        errors: [`Template '${templateName}' not found`]
      }
    }

    return validateTemplateGeneration(templateName, params, template)
  }

  /**
   * Get template metadata
   */
  getTemplateInfo(templateName: string): BackendTemplate | undefined {
    return this.registry.get(templateName)
  }

  /**
   * List all available templates
   */
  listTemplates(): BackendTemplate[] {
    return this.registry.list()
  }

  /**
   * List templates by category
   */
  listTemplatesByCategory(category: string): BackendTemplate[] {
    return this.registry.listByCategory(category)
  }

  /**
   * Get template schema for parameters
   */
  getTemplateSchema(templateName: string) {
    const template = this.registry.get(templateName)
    return template?.params
  }

  /**
   * Get template examples
   */
  getTemplateExamples(templateName: string) {
    const template = this.registry.get(templateName)
    return template?.examples || []
  }
}

/**
 * Default generator instance
 */
export const defaultGenerator = new TemplateGenerator()

/**
 * Convenience function for quick generation
 */
export async function generateTemplate(
  templateName: string,
  params: unknown,
  options?: GenerateOptions
): Promise<GenerateResult> {
  return defaultGenerator.generate(templateName, params, options)
}
