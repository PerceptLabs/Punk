import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const StripeCheckoutParams = z.object({
  currency: z.string().default('usd'),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  collectShipping: z.boolean().default(false),
  allowPromoCodes: z.boolean().default(true)
})

export const stripeCheckoutTemplate: BackendTemplate = {
  name: 'stripeCheckout',
  category: 'payments',
  description: 'Stripe checkout integration with webhook handling',
  version: '1.0.0',
  params: StripeCheckoutParams,

  generates: (params) => {
    const p = StripeCheckoutParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import Stripe from "stripe"
import { z } from "zod"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia"
})

const db = new SQLDatabase("payments", { migrations: "./migrations" })

const CreateCheckoutSessionRequest = z.object({
  priceId: z.string(),
  quantity: z.number().default(1),
  metadata: z.record(z.string()).optional()
})

export const createCheckoutSession = api(
  { method: "POST", path: "/payments/checkout", auth: true },
  async (req: z.infer<typeof CreateCheckoutSessionRequest>, ctx): Promise<{
    sessionId: string
    url: string
  }> => {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: req.priceId,
          quantity: req.quantity
        }
      ],
      success_url: "${p.successUrl}?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "${p.cancelUrl}",
      customer_email: ctx.auth.email,
      metadata: {
        userId: ctx.auth.userId,
        ...req.metadata
      }${p.collectShipping ? `,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB"]
      }` : ''}${p.allowPromoCodes ? `,
      allow_promotion_codes: true` : ''}
    })

    await db.query(
      \`INSERT INTO checkout_sessions (id, user_id, status, created_at)
       VALUES ($1, $2, $3, NOW())\`,
      [session.id, ctx.auth.userId, "pending"]
    )

    return {
      sessionId: session.id,
      url: session.url!
    }
  }
)

// Webhook handler
export const stripeWebhook = api(
  { method: "POST", path: "/webhooks/stripe", auth: false },
  async (req: any, ctx): Promise<{ received: boolean }> => {
    const signature = ctx.headers["stripe-signature"]

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        JSON.stringify(req),
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      throw APIError.unauthenticated("Invalid signature")
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break
    }

    return { received: true }
  }
)

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  await db.query(
    \`UPDATE checkout_sessions
     SET status = $1, completed_at = NOW()
     WHERE id = $2\`,
    ["completed", session.id]
  )

  console.log("Checkout completed:", session.id)
  // TODO: Fulfill order, grant access, etc.
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  await db.query(
    \`INSERT INTO payments (id, amount, currency, status, created_at)
     VALUES ($1, $2, $3, $4, NOW())\`,
    [paymentIntent.id, paymentIntent.amount, paymentIntent.currency, "succeeded"]
  )

  console.log("Payment succeeded:", paymentIntent.id)
}
`.trim()

    const migrations = `
-- Create checkout sessions table

CREATE TABLE IF NOT EXISTS checkout_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES User(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_checkout_sessions_user ON checkout_sessions(user_id);

-- Create payments table

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'exposing secret keys',
      'skipping webhook verification'
    ],
    requiredValidation: [
      'webhook signature',
      'price validation'
    ]
  },

  dependencies: {
    npm: ['stripe', 'zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        currency: 'usd',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        allowPromoCodes: true
      },
      description: 'Basic Stripe checkout',
      useCase: 'E-commerce checkout'
    }
  ]
}
