import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const WebhookReceiverParams = z.object({
  provider: z.enum(['stripe', 'github', 'sendgrid', 'custom']),
  signatureHeader: z.string().default('X-Signature'),
  secretEnvVar: z.string().default('WEBHOOK_SECRET'),
  eventTypes: z.array(z.string()),
  retryOnFailure: z.boolean().default(true),
  maxRetries: z.number().default(3)
})

export const webhookReceiverTemplate: BackendTemplate = {
  name: 'webhookReceiver',
  category: 'integrations',
  description: 'Receive and validate webhooks from external services with signature verification',
  version: '1.0.0',
  params: WebhookReceiverParams,

  generates: (params) => {
    const p = WebhookReceiverParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import { createHmac, timingSafeEqual } from "crypto"
import { z } from "zod"

const db = new SQLDatabase("webhooks", { migrations: "./migrations" })

const WebhookRequest = z.object({
  event: z.string(),
  payload: z.record(z.any())
})

export const receiveWebhook = api(
  { method: "POST", path: "/webhooks/${p.provider}", auth: false },
  async (req: z.infer<typeof WebhookRequest>, ctx): Promise<{ received: boolean }> => {
    const signature = ctx.headers["${p.signatureHeader.toLowerCase()}"]

    if (!signature) {
      throw APIError.unauthenticated("Missing webhook signature")
    }

    const isValid = verifySignature(
      JSON.stringify(req),
      signature,
      process.env.${p.secretEnvVar}!
    )

    if (!isValid) {
      throw APIError.unauthenticated("Invalid webhook signature")
    }

    const allowedEvents = ${JSON.stringify(p.eventTypes)}
    if (!allowedEvents.includes(req.event)) {
      throw APIError.invalidArgument(\`Unsupported event type: \${req.event}\`)
    }

    const result = await db.query(
      \`INSERT INTO webhook_events (provider, event_type, payload, status, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id\`,
      ["${p.provider}", req.event, JSON.stringify(req.payload), "pending"]
    )

    const eventId = result.rows[0].id

    // Process webhook asynchronously
    processWebhook(eventId, req.event, req.payload).catch(console.error)

    return { received: true }
  }
)

function verifySignature(payload: string, signature: string, secret: string): boolean {
  ${p.provider === 'stripe' ? `
  const elements = signature.split(",")
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1]
  const sigs = elements.filter(e => e.startsWith("v1=")).map(e => e.split("=")[1])

  const signedPayload = \`\${timestamp}.\${payload}\`
  const expectedSig = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex")

  return sigs.some(sig => timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSig)
  ))
  ` : `
  const expectedSig = createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  )
  `}
}

async function processWebhook(
  eventId: string,
  eventType: string,
  payload: any,
  retryCount = 0
): Promise<void> {
  try {
    // Handle different event types
    console.log(\`Processing \${eventType} event:\`, payload)

    // TODO: Implement event handlers

    await db.query(
      \`UPDATE webhook_events SET status = $1, processed_at = NOW() WHERE id = $2\`,
      ["processed", eventId]
    )
  } catch (error) {
    ${p.retryOnFailure ? `
    if (retryCount < ${p.maxRetries}) {
      const delay = Math.pow(2, retryCount) * 1000
      setTimeout(() => {
        processWebhook(eventId, eventType, payload, retryCount + 1)
      }, delay)
    } else {
      await db.query(
        \`UPDATE webhook_events SET status = $1, error = $2, processed_at = NOW() WHERE id = $3\`,
        ["failed", (error as Error).message, eventId]
      )
    }
    ` : `
    await db.query(
      \`UPDATE webhook_events SET status = $1, error = $2, processed_at = NOW() WHERE id = $3\`,
      ["failed", (error as Error).message, eventId]
    )
    `}
  }
}
`.trim()

    const migrations = `
-- Create webhook events table

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'skipping signature validation'
    ],
    requiredValidation: [
      'signature verification',
      'event type validation'
    ]
  },

  dependencies: {
    npm: ['zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        provider: 'stripe',
        eventTypes: ['checkout.session.completed', 'payment_intent.succeeded'],
        retryOnFailure: true
      },
      description: 'Stripe webhook receiver with retry logic',
      useCase: 'Payment processing'
    }
  ]
}
