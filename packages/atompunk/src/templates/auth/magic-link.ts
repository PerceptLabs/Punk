import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const MagicLinkAuthParams = z.object({
  userModel: z.string(),
  emailField: z.string().default('email'),
  tokenExpiration: z.string().default('15m'),
  sessionDuration: z.string().default('7d'),
  createUserIfNotExists: z.boolean().default(true),
  maxAttemptsPerHour: z.number().default(3)
})

export const magicLinkAuthTemplate: BackendTemplate = {
  name: 'magicLinkAuth',
  category: 'authentication',
  description: 'Passwordless authentication via email magic links with time-limited tokens',
  version: '1.0.0',
  params: MagicLinkAuthParams,

  generates: (params) => {
    const p = MagicLinkAuthParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import { randomBytes } from "crypto"
import { sign } from "jsonwebtoken"
import { z } from "zod"

const db = new SQLDatabase("auth", { migrations: "./migrations" })

const RequestMagicLinkRequest = z.object({
  email: z.string().email()
})

const VerifyMagicLinkRequest = z.object({
  token: z.string()
})

// ===== Request Magic Link =====

export const requestMagicLink = api(
  { method: "POST", path: "/auth/magic-link", auth: false },
  async (req: z.infer<typeof RequestMagicLinkRequest>): Promise<{ message: string }> => {
    const validated = RequestMagicLinkRequest.parse(req)

    // Rate limiting: max ${p.maxAttemptsPerHour} requests per hour per email
    const recentRequests = await db.query(
      \`SELECT COUNT(*) as count FROM magic_link_tokens
       WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'\`,
      [validated.email]
    )

    if (parseInt(recentRequests.rows[0].count) >= ${p.maxAttemptsPerHour}) {
      throw APIError.resourceExhausted(
        "Too many magic link requests. Please try again later."
      )
    }

    // Check if user exists
    const userResult = await db.query(
      \`SELECT id FROM ${p.userModel} WHERE ${p.emailField} = $1\`,
      [validated.email]
    )

    ${p.createUserIfNotExists ? `
    let userId: string

    if (userResult.rows.length === 0) {
      const newUser = await db.query(
        \`INSERT INTO ${p.userModel} (${p.emailField}, created_at)
         VALUES ($1, NOW())
         RETURNING id\`,
        [validated.email]
      )
      userId = newUser.rows[0].id
    } else {
      userId = userResult.rows[0].id
    }
    ` : `
    if (userResult.rows.length === 0) {
      return {
        message: "If an account exists with this email, a magic link has been sent."
      }
    }
    const userId = userResult.rows[0].id
    `}

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + parseDuration("${p.tokenExpiration}"))

    // Store token
    await db.query(
      \`INSERT INTO magic_link_tokens (token, user_id, email, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())\`,
      [token, userId, validated.email, expiresAt]
    )

    // TODO: Send email with magic link
    const magicLink = \`\${process.env.APP_URL}/auth/verify?token=\${token}\`
    console.log('Magic link:', magicLink)

    return {
      message: "Magic link sent! Check your email."
    }
  }
)

// ===== Verify Magic Link =====

export const verifyMagicLink = api(
  { method: "POST", path: "/auth/verify", auth: false },
  async (req: z.infer<typeof VerifyMagicLinkRequest>): Promise<{
    token: string
    user: { id: string; email: string }
  }> => {
    const validated = VerifyMagicLinkRequest.parse(req)

    const result = await db.query(
      \`SELECT t.user_id, t.email, t.expires_at, t.used
       FROM magic_link_tokens t
       WHERE t.token = $1\`,
      [validated.token]
    )

    if (result.rows.length === 0) {
      throw APIError.unauthenticated("Invalid magic link")
    }

    const tokenData = result.rows[0]

    if (tokenData.used) {
      throw APIError.unauthenticated("Magic link already used")
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      throw APIError.unauthenticated("Magic link expired")
    }

    // Mark as used
    await db.query(
      \`UPDATE magic_link_tokens SET used = TRUE WHERE token = $1\`,
      [validated.token]
    )

    // Generate JWT session
    const jwtToken = sign(
      {
        userId: tokenData.user_id,
        email: tokenData.email
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "${p.sessionDuration}"
      }
    )

    return {
      token: jwtToken,
      user: {
        id: tokenData.user_id,
        email: tokenData.email
      }
    }
  }
)

function parseDuration(duration: string): number {
  const match = duration.match(/^(\\d+)([smhd])$/)
  if (!match) throw new Error(\`Invalid duration: \${duration}\`)
  const value = parseInt(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * multipliers[unit]
}
`.trim()

    const migrations = `
-- Create magic link tokens table

CREATE TABLE IF NOT EXISTS magic_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES ${p.userModel}(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token);
CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email, created_at);
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'Math.random',
      'predictable token',
      'reusable token'
    ],
    requiredValidation: [
      'email',
      'token expiration',
      'single-use'
    ],
    rateLimiting: {
      maxAttempts: 3,
      windowMs: 3600000
    }
  },

  dependencies: {
    npm: ['jsonwebtoken', 'zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        userModel: 'User',
        tokenExpiration: '15m',
        sessionDuration: '7d',
        createUserIfNotExists: true
      },
      description: 'Passwordless login with automatic user creation',
      useCase: 'Consumer web application'
    }
  ]
}
