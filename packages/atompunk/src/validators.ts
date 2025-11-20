import { z } from 'zod'
import type { BackendTemplate } from './registry'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Validate template parameters against schema
 */
export function validateTemplateParams(
  params: unknown,
  schema: z.ZodSchema
): ValidationResult {
  try {
    schema.parse(params)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      }
    }
    return {
      valid: false,
      errors: [(error as Error).message]
    }
  }
}

/**
 * Validate generated code for security issues
 */
export function validateGeneratedCode(
  code: string,
  template?: BackendTemplate
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for forbidden patterns
  const forbiddenPatterns = [
    { pattern: /eval\s*\(/gi, message: 'eval() is forbidden' },
    { pattern: /exec\s*\(/gi, message: 'exec() is forbidden' },
    { pattern: /new\s+Function\s*\(/gi, message: 'new Function() is forbidden' },
    { pattern: /child_process/gi, message: 'child_process is forbidden' },
    { pattern: /__proto__/gi, message: '__proto__ manipulation is forbidden' },
    { pattern: /constructor\s*\[/gi, message: 'constructor manipulation is forbidden' },
  ]

  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(code)) {
      errors.push(message)
    }
  }

  // Check for SQL injection vulnerabilities
  const sqlInjectionPatterns = [
    {
      pattern: /query\s*\([^)]*\$\{[^}]*\}/g,
      message: 'Potential SQL injection: use parameterized queries instead of template literals'
    },
    {
      pattern: /query\s*\([^)]*\+\s*[a-zA-Z]/g,
      message: 'Potential SQL injection: use parameterized queries instead of string concatenation'
    },
    {
      pattern: /exec\s*\([^)]*\+/g,
      message: 'Potential SQL injection in exec: use parameterized queries'
    }
  ]

  for (const { pattern, message } of sqlInjectionPatterns) {
    if (pattern.test(code)) {
      errors.push(message)
    }
  }

  // Check for insecure randomness
  if (code.includes('Math.random()')) {
    warnings.push('Math.random() is not cryptographically secure. Use crypto.randomBytes() for security tokens')
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /password\s*=\s*["'][^"']+["']/gi,
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
  ]

  for (const pattern of secretPatterns) {
    if (pattern.test(code)) {
      warnings.push('Potential hardcoded secret detected. Use environment variables instead')
    }
  }

  // Check for unsafe file operations
  if (code.includes('../') && code.includes('readFile')) {
    errors.push('Potential path traversal vulnerability detected')
  }

  // Check for XSS vulnerabilities
  if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML')) {
    warnings.push('Potential XSS vulnerability: sanitize user input before rendering')
  }

  // Template-specific validation
  if (template) {
    // Check for forbidden operations defined in template
    for (const forbidden of template.constraints.forbiddenOperations) {
      if (code.includes(forbidden)) {
        errors.push(`Generated code contains forbidden operation: ${forbidden}`)
      }
    }

    // Check for required validations
    for (const required of template.constraints.requiredValidation) {
      // Basic check - could be made more sophisticated
      const normalizedRequired = required.toLowerCase().replace(/\s+/g, '')
      const normalizedCode = code.toLowerCase().replace(/\s+/g, '')

      if (!normalizedCode.includes(normalizedRequired)) {
        warnings.push(`Generated code may be missing required validation: ${required}`)
      }
    }
  }

  // Check for proper error handling
  if (!code.includes('try') && !code.includes('catch') && code.includes('await')) {
    warnings.push('Consider adding error handling for async operations')
  }

  // Check for rate limiting in endpoints
  if (code.includes('api(') && !code.includes('rateLimit') && !code.includes('checkRateLimit')) {
    warnings.push('Consider adding rate limiting to API endpoints')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Validate parameters for security issues
 */
export function validateParameterSecurity(params: any): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const paramsStr = JSON.stringify(params)

  // Check for code injection attempts
  const injectionPatterns = [
    { pattern: /eval\s*\(/gi, message: 'eval() detected in parameters' },
    { pattern: /exec\s*\(/gi, message: 'exec() detected in parameters' },
    { pattern: /__proto__/gi, message: 'prototype pollution attempt detected' },
    { pattern: /constructor/gi, message: 'constructor manipulation attempt detected' },
  ]

  for (const { pattern, message } of injectionPatterns) {
    if (pattern.test(paramsStr)) {
      errors.push(message)
    }
  }

  // Check for SQL injection attempts
  const sqlPatterns = [
    /(\bor\b|\band\b).*?=.*?/i,
    /union\s+select/i,
    /;\s*drop\s+table/i,
    /--/,
    /\/\*/
  ]

  for (const pattern of sqlPatterns) {
    if (pattern.test(paramsStr)) {
      errors.push('Potential SQL injection pattern detected in parameters')
      break
    }
  }

  // Check for path traversal
  if (paramsStr.includes('../') || paramsStr.includes('..\\')) {
    errors.push('Path traversal pattern detected in parameters')
  }

  // Check for command injection
  const cmdPatterns = [
    /;\s*rm\s+-rf/i,
    /&&\s*rm/i,
    /\|\s*sh/i,
    /`.*`/,
    /\$\(.*\)/
  ]

  for (const pattern of cmdPatterns) {
    if (pattern.test(paramsStr)) {
      errors.push('Potential command injection pattern detected in parameters')
      break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Comprehensive validation of template generation
 */
export function validateTemplateGeneration(
  templateName: string,
  params: unknown,
  template: BackendTemplate
): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []

  // 1. Validate parameters against schema
  const paramValidation = validateTemplateParams(params, template.params)
  if (!paramValidation.valid) {
    allErrors.push(...paramValidation.errors)
  }

  // 2. Validate parameter security
  const securityValidation = validateParameterSecurity(params)
  if (!securityValidation.valid) {
    allErrors.push(...securityValidation.errors)
  }
  if (securityValidation.warnings) {
    allWarnings.push(...securityValidation.warnings)
  }

  // Stop here if parameters are invalid
  if (allErrors.length > 0) {
    return {
      valid: false,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    }
  }

  // 3. Generate code
  let generatedCode: string
  try {
    const result = template.generates(params)
    generatedCode = result.service
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to generate code: ${(error as Error).message}`]
    }
  }

  // 4. Validate generated code
  const codeValidation = validateGeneratedCode(generatedCode, template)
  if (!codeValidation.valid) {
    allErrors.push(...codeValidation.errors)
  }
  if (codeValidation.warnings) {
    allWarnings.push(...codeValidation.warnings)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  }
}

/**
 * Sanitize user input for safe use in templates
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/\\/g, '') // Remove backslashes
    .replace(/\x00/g, '') // Remove null bytes
    .trim()
}

/**
 * Validate file name is safe
 */
export function validateFileName(fileName: string): ValidationResult {
  const errors: string[] = []

  if (fileName.includes('../') || fileName.includes('..\\')) {
    errors.push('File name contains path traversal pattern')
  }

  if (fileName.includes('\x00')) {
    errors.push('File name contains null byte')
  }

  if (fileName.match(/[<>:"|?*]/)) {
    errors.push('File name contains invalid characters')
  }

  if (fileName.startsWith('.')) {
    errors.push('File name should not start with a dot')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
