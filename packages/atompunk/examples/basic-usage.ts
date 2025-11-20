/**
 * Basic usage examples for @punk/atompunk
 */

import {
  quickGenerate,
  getAvailableTemplates,
  getTemplateCategories,
  hasTemplate,
  getTemplateInfo
} from '../src/index'

async function main() {
  console.log('=== @punk/atompunk Examples ===\n')

  // List available templates
  console.log('Available templates:', getAvailableTemplates())
  console.log('Categories:', getTemplateCategories())
  console.log()

  // Example 1: Password Authentication
  console.log('1. Generating Password Authentication...')
  const authResult = await quickGenerate('passwordAuth', {
    userModel: 'User',
    sessionType: 'jwt',
    sessionDuration: '7d',
    requireEmailVerification: true,
    passwordMinLength: 12,
    maxLoginAttempts: 3
  })

  if (authResult.success) {
    console.log('✓ Generated password auth service')
    console.log('  - Service code:', authResult.code?.service.split('\n').length, 'lines')
    console.log('  - Migrations:', authResult.code?.migrations ? 'Yes' : 'No')
    if (authResult.validation?.warnings) {
      console.log('  - Warnings:', authResult.validation.warnings.length)
    }
  } else {
    console.log('✗ Failed:', authResult.error)
  }
  console.log()

  // Example 2: CRUD Resource
  console.log('2. Generating CRUD Resource...')
  const crudResult = await quickGenerate('crudResource', {
    resourceName: 'BlogPost',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true, unique: true },
      { name: 'content', type: 'string', required: true },
      { name: 'published', type: 'boolean', required: false },
      { name: 'publishedAt', type: 'date', required: false }
    ],
    enableSoftDelete: true,
    enableAuditLog: true,
    ownershipField: 'author_id'
  })

  if (crudResult.success) {
    console.log('✓ Generated CRUD resource')
    console.log('  - Endpoints: create, get, list, update, delete')
    console.log('  - Features: soft delete, audit log, ownership')
  }
  console.log()

  // Example 3: File Upload
  console.log('3. Generating File Upload...')
  const uploadResult = await quickGenerate('fileUpload', {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    storageProvider: 'local',
    enableVirusScanning: false
  })

  if (uploadResult.success) {
    console.log('✓ Generated file upload service')
    console.log('  - Allowed types: JPEG, PNG, WebP')
    console.log('  - Max size: 5MB')
    console.log('  - Storage: local')
  }
  console.log()

  // Example 4: Webhook Receiver
  console.log('4. Generating Webhook Receiver...')
  const webhookResult = await quickGenerate('webhookReceiver', {
    provider: 'stripe',
    eventTypes: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'customer.subscription.created'
    ],
    retryOnFailure: true,
    maxRetries: 3
  })

  if (webhookResult.success) {
    console.log('✓ Generated webhook receiver')
    console.log('  - Provider: Stripe')
    console.log('  - Events: 3 types')
    console.log('  - Retry: Yes (max 3)')
  }
  console.log()

  // Example 5: Scheduled Job
  console.log('5. Generating Scheduled Job...')
  const jobResult = await quickGenerate('scheduledJob', {
    jobName: 'cleanupExpiredTokens',
    schedule: '0 3 * * *', // 3 AM daily
    task: 'Clean up expired authentication tokens',
    enableJobHistory: true,
    retryOnFailure: true
  })

  if (jobResult.success) {
    console.log('✓ Generated scheduled job')
    console.log('  - Name: cleanupExpiredTokens')
    console.log('  - Schedule: 3 AM daily')
    console.log('  - History: Enabled')
  }
  console.log()

  // Example 6: Pub/Sub Channel
  console.log('6. Generating Pub/Sub Channel...')
  const pubsubResult = await quickGenerate('pubsubChannel', {
    topicName: 'userSignedUp',
    messageFields: {
      userId: 'string',
      email: 'string',
      signupSource: 'string',
      metadata: 'object'
    },
    deliveryGuarantee: 'at-least-once'
  })

  if (pubsubResult.success) {
    console.log('✓ Generated pub/sub channel')
    console.log('  - Topic: userSignedUp')
    console.log('  - Fields: 4')
    console.log('  - Guarantee: at-least-once')
  }
  console.log()

  // Example 7: Email Sender
  console.log('7. Generating Email Sender...')
  const emailResult = await quickGenerate('emailSender', {
    provider: 'resend',
    fromEmail: 'noreply@example.com',
    fromName: 'My App',
    templates: [
      {
        name: 'welcome',
        subject: 'Welcome to {{appName}}!',
        bodyTemplate: '<h1>Hi {{name}}!</h1><p>Welcome to our platform.</p>'
      },
      {
        name: 'resetPassword',
        subject: 'Reset your password',
        bodyTemplate: '<p>Click here to reset: {{resetLink}}</p>'
      }
    ]
  })

  if (emailResult.success) {
    console.log('✓ Generated email sender')
    console.log('  - Provider: Resend')
    console.log('  - Templates: 2')
  }
  console.log()

  // Example 8: Magic Link Auth
  console.log('8. Generating Magic Link Auth...')
  const magicLinkResult = await quickGenerate('magicLinkAuth', {
    userModel: 'User',
    tokenExpiration: '15m',
    sessionDuration: '30d',
    createUserIfNotExists: true,
    maxAttemptsPerHour: 5
  })

  if (magicLinkResult.success) {
    console.log('✓ Generated magic link auth')
    console.log('  - Token expires: 15 minutes')
    console.log('  - Session: 30 days')
    console.log('  - Auto-create users: Yes')
  }
  console.log()

  // Example 9: Stripe Checkout
  console.log('9. Generating Stripe Checkout...')
  const stripeResult = await quickGenerate('stripeCheckout', {
    currency: 'usd',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
    collectShipping: true,
    allowPromoCodes: true
  })

  if (stripeResult.success) {
    console.log('✓ Generated Stripe checkout')
    console.log('  - Currency: USD')
    console.log('  - Shipping: Collected')
    console.log('  - Promo codes: Allowed')
  }
  console.log()

  // Example 10: API Proxy
  console.log('10. Generating API Proxy...')
  const proxyResult = await quickGenerate('apiProxy', {
    targetUrl: 'https://api.github.com',
    allowedPaths: ['/users/*', '/repos/*'],
    requireAuth: true,
    rateLimitPerMinute: 60,
    cacheResponses: true,
    cacheTTL: 300
  })

  if (proxyResult.success) {
    console.log('✓ Generated API proxy')
    console.log('  - Target: GitHub API')
    console.log('  - Rate limit: 60/min')
    console.log('  - Cache: 5 minutes')
  }
  console.log()

  // Check template info
  console.log('=== Template Information ===\n')

  if (hasTemplate('passwordAuth')) {
    const info = getTemplateInfo('passwordAuth')
    console.log('Password Auth Template:')
    console.log('  - Category:', info?.category)
    console.log('  - Description:', info?.description)
    console.log('  - Version:', info?.version)
    console.log('  - Examples:', info?.examples.length)
    console.log('  - Dependencies:', info?.dependencies.npm?.join(', '))
  }

  console.log('\n=== All Examples Complete ===')
}

main().catch(console.error)
