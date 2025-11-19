import { describe, it, expect } from 'vitest'
import { defaultGenerator, quickGenerate } from '../index'

describe('TemplateGenerator', () => {
  describe('passwordAuth template', () => {
    it('should generate password auth service', async () => {
      const result = await quickGenerate('passwordAuth', {
        userModel: 'User',
        sessionType: 'jwt',
        sessionDuration: '7d',
        passwordMinLength: 8
      })

      expect(result.success).toBe(true)
      expect(result.code).toBeDefined()
      expect(result.code?.service).toContain('import { api')
      expect(result.code?.service).toContain('bcrypt')
      expect(result.code?.service).toContain('jsonwebtoken')
      expect(result.code?.service).toContain('register')
      expect(result.code?.service).toContain('login')
      expect(result.code?.migrations).toContain('CREATE TABLE')
      expect(result.code?.migrations).toContain('User')
    })

    it('should validate parameters', async () => {
      const result = await quickGenerate('passwordAuth', {
        userModel: 'User',
        passwordMinLength: 'invalid' // Should be number
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should include email verification when enabled', async () => {
      const result = await quickGenerate('passwordAuth', {
        userModel: 'User',
        requireEmailVerification: true
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('email_verified')
      expect(result.code?.service).toContain('verify your email')
    })
  })

  describe('crudResource template', () => {
    it('should generate CRUD operations', async () => {
      const result = await quickGenerate('crudResource', {
        resourceName: 'Post',
        fields: [
          { name: 'title', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'published', type: 'boolean', required: false }
        ],
        enableSoftDelete: true,
        ownershipField: 'user_id'
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('createPost')
      expect(result.code?.service).toContain('getPost')
      expect(result.code?.service).toContain('listPost')
      expect(result.code?.service).toContain('updatePost')
      expect(result.code?.service).toContain('deletePost')
      expect(result.code?.service).toContain('deleted_at')
      expect(result.code?.migrations).toContain('CREATE TABLE')
    })

    it('should include pagination', async () => {
      const result = await quickGenerate('crudResource', {
        resourceName: 'Product',
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'price', type: 'number', required: true }
        ]
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('pagination')
      expect(result.code?.service).toContain('page')
      expect(result.code?.service).toContain('limit')
      expect(result.code?.service).toContain('total')
    })
  })

  describe('magicLinkAuth template', () => {
    it('should generate magic link auth', async () => {
      const result = await quickGenerate('magicLinkAuth', {
        userModel: 'User',
        tokenExpiration: '15m',
        sessionDuration: '7d',
        createUserIfNotExists: true
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('requestMagicLink')
      expect(result.code?.service).toContain('verifyMagicLink')
      expect(result.code?.service).toContain('randomBytes')
      expect(result.code?.migrations).toContain('magic_link_tokens')
    })

    it('should enforce rate limiting', async () => {
      const result = await quickGenerate('magicLinkAuth', {
        userModel: 'User',
        maxAttemptsPerHour: 3
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('maxAttemptsPerHour')
      expect(result.code?.service).toContain('resourceExhausted')
    })
  })

  describe('fileUpload template', () => {
    it('should generate file upload service', async () => {
      const result = await quickGenerate('fileUpload', {
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        maxFileSize: 5 * 1024 * 1024,
        storageProvider: 'local'
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('uploadFile')
      expect(result.code?.service).toContain('contentType')
      expect(result.code?.service).toContain('createHash')
      expect(result.code?.service).toContain('maxFileSize')
    })
  })

  describe('webhookReceiver template', () => {
    it('should generate webhook receiver', async () => {
      const result = await quickGenerate('webhookReceiver', {
        provider: 'stripe',
        eventTypes: ['checkout.session.completed', 'payment_intent.succeeded'],
        retryOnFailure: true,
        maxRetries: 3
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('receiveWebhook')
      expect(result.code?.service).toContain('verifySignature')
      expect(result.code?.service).toContain('timingSafeEqual')
      expect(result.code?.migrations).toContain('webhook_events')
    })
  })

  describe('scheduledJob template', () => {
    it('should generate scheduled job', async () => {
      const result = await quickGenerate('scheduledJob', {
        jobName: 'cleanupOldData',
        schedule: '0 2 * * *',
        task: 'Clean up old records',
        enableJobHistory: true
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('CronJob')
      expect(result.code?.service).toContain('cleanupOldDataJob')
      expect(result.code?.service).toContain('0 2 * * *')
      expect(result.code?.migrations).toContain('job_runs')
    })
  })

  describe('pubsubChannel template', () => {
    it('should generate pubsub topic and subscription', async () => {
      const result = await quickGenerate('pubsubChannel', {
        topicName: 'orderCreated',
        messageFields: {
          orderId: 'string',
          userId: 'string',
          amount: 'number'
        },
        deliveryGuarantee: 'at-least-once'
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('Topic')
      expect(result.code?.service).toContain('Subscription')
      expect(result.code?.service).toContain('orderCreatedTopic')
      expect(result.code?.service).toContain('publishOrderCreated')
    })
  })

  describe('stripeCheckout template', () => {
    it('should generate Stripe checkout', async () => {
      const result = await quickGenerate('stripeCheckout', {
        currency: 'usd',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        allowPromoCodes: true
      })

      expect(result.success).toBe(true)
      expect(result.code?.service).toContain('createCheckoutSession')
      expect(result.code?.service).toContain('stripeWebhook')
      expect(result.code?.service).toContain('stripe.checkout.sessions.create')
      expect(result.code?.migrations).toContain('checkout_sessions')
    })
  })

  describe('template validation', () => {
    it('should reject invalid template names', async () => {
      const result = await quickGenerate('invalidTemplate', {})

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should validate security issues', async () => {
      const result = await quickGenerate('passwordAuth', {
        userModel: 'User; DROP TABLE users--',
        sessionType: 'jwt'
      })

      expect(result.success).toBe(false)
    })
  })

  describe('template listing', () => {
    it('should list all templates', () => {
      const templates = defaultGenerator.listTemplates()

      expect(templates.length).toBeGreaterThan(0)
      expect(templates.some(t => t.name === 'passwordAuth')).toBe(true)
      expect(templates.some(t => t.name === 'crudResource')).toBe(true)
    })

    it('should list templates by category', () => {
      const authTemplates = defaultGenerator.listTemplatesByCategory('authentication')

      expect(authTemplates.length).toBeGreaterThan(0)
      expect(authTemplates.every(t => t.category === 'authentication')).toBe(true)
    })
  })
})
