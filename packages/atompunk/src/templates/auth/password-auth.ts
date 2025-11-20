import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const PasswordAuthParams = z.object({
  userModel: z.string().describe("Database model name (e.g., 'User')"),
  emailField: z.string().default('email'),
  passwordField: z.string().default('password'),
  sessionType: z.enum(['jwt', 'cookie']).default('jwt'),
  sessionDuration: z.string().default('7d').describe("Duration like '7d', '24h'"),
  requireEmailVerification: z.boolean().default(false),
  passwordMinLength: z.number().default(8),
  enablePasswordReset: z.boolean().default(true),
  maxLoginAttempts: z.number().default(5),
  lockoutDuration: z.string().default('15m')
})

export const passwordAuthTemplate: BackendTemplate = {
  name: 'passwordAuth',
  category: 'authentication',
  description: 'Email and password authentication with bcrypt hashing, secure session management, and optional email verification',
  version: '1.0.0',
  params: PasswordAuthParams,

  generates: (params) => {
    const p = PasswordAuthParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { SQLDatabase } from "encore.dev/storage/sqldb"
import { hash, compare } from "bcrypt"
import { sign, verify } from "jsonwebtoken"
import { z } from "zod"

const db = new SQLDatabase("auth", {
  migrations: "./migrations"
})

// ===== Schemas =====

const RegisterRequest = z.object({
  email: z.string().email(),
  password: z.string().min(${p.passwordMinLength}),
  name: z.string().optional()
})

const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string()
})

const LoginResponse = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().optional()
  })
})

// ===== Rate Limiting =====

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

async function checkRateLimit(identifier: string): Promise<void> {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier) || {
    attempts: 0,
    firstAttempt: now
  }

  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingMs = entry.lockedUntil - now
    throw APIError.resourceExhausted(
      \`Too many login attempts. Try again in \${Math.ceil(remainingMs / 1000)}s\`
    )
  }

  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    entry.attempts = 0
    entry.firstAttempt = now
    entry.lockedUntil = undefined
  }

  entry.attempts++

  if (entry.attempts > ${p.maxLoginAttempts}) {
    entry.lockedUntil = now + parseDuration("${p.lockoutDuration}")
    rateLimitStore.set(identifier, entry)
    throw APIError.resourceExhausted(
      \`Too many login attempts. Account locked for ${p.lockoutDuration}\`
    )
  }

  rateLimitStore.set(identifier, entry)
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\\d+)([smhd])$/)
  if (!match) throw new Error(\`Invalid duration: \${duration}\`)

  const value = parseInt(match[1])
  const unit = match[2]

  const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return value * multipliers[unit]
}

// ===== Registration =====

export const register = api(
  { method: "POST", path: "/auth/register", auth: false },
  async (req: z.infer<typeof RegisterRequest>): Promise<{ message: string }> => {
    const validated = RegisterRequest.parse(req)

    const existing = await db.query(
      \`SELECT id FROM ${p.userModel} WHERE ${p.emailField} = $1\`,
      [validated.email]
    )

    if (existing.rows.length > 0) {
      throw APIError.alreadyExists("User with this email already exists")
    }

    const hashedPassword = await hash(validated.password, 12)

    await db.query(
      \`INSERT INTO ${p.userModel} (${p.emailField}, ${p.passwordField}, name, email_verified, created_at)
       VALUES ($1, $2, $3, $4, NOW())\`,
      [validated.email, hashedPassword, validated.name || null, ${!p.requireEmailVerification}]
    )

    ${p.requireEmailVerification ? `
    return {
      message: "Registration successful. Please check your email to verify your account."
    }
    ` : `
    return {
      message: "Registration successful. You can now log in."
    }
    `}
  }
)

// ===== Login =====

export const login = api(
  { method: "POST", path: "/auth/login", auth: false },
  async (req: z.infer<typeof LoginRequest>): Promise<z.infer<typeof LoginResponse>> => {
    await checkRateLimit(req.email)

    const validated = LoginRequest.parse(req)

    const result = await db.query(
      \`SELECT id, ${p.emailField}, ${p.passwordField}, name, email_verified
       FROM ${p.userModel}
       WHERE ${p.emailField} = $1\`,
      [validated.email]
    )

    if (result.rows.length === 0) {
      throw APIError.unauthenticated("Invalid email or password")
    }

    const user = result.rows[0]

    ${p.requireEmailVerification ? `
    if (!user.email_verified) {
      throw APIError.permissionDenied("Please verify your email before logging in")
    }
    ` : ''}

    const passwordValid = await compare(validated.password, user.${p.passwordField})

    if (!passwordValid) {
      throw APIError.unauthenticated("Invalid email or password")
    }

    const token = sign(
      {
        userId: user.id,
        email: user.${p.emailField}
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "${p.sessionDuration}"
      }
    )

    rateLimitStore.delete(validated.email)

    return {
      token,
      user: {
        id: user.id,
        email: user.${p.emailField},
        name: user.name
      }
    }
  }
)

${p.enablePasswordReset ? `
// ===== Password Reset =====

const RequestPasswordResetRequest = z.object({
  email: z.string().email()
})

export const requestPasswordReset = api(
  { method: "POST", path: "/auth/password-reset", auth: false },
  async (req: z.infer<typeof RequestPasswordResetRequest>): Promise<{ message: string }> => {
    const validated = RequestPasswordResetRequest.parse(req)

    const result = await db.query(
      \`SELECT id FROM ${p.userModel} WHERE ${p.emailField} = $1\`,
      [validated.email]
    )

    if (result.rows.length > 0) {
      // TODO: Generate and send reset token
      // const resetToken = await generateResetToken(result.rows[0].id)
      // await sendPasswordResetEmail(validated.email, resetToken)
    }

    return {
      message: "If an account exists with this email, a password reset link has been sent."
    }
  }
)
` : ''}

// ===== Token Verification =====

export async function verifyToken(token: string): Promise<{ userId: string; email: string }> {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
    }
    return decoded
  } catch (err) {
    throw APIError.unauthenticated("Invalid or expired token")
  }
}
`.trim()

    const migrations = `
-- Create users table

CREATE TABLE IF NOT EXISTS ${p.userModel} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ${p.emailField} VARCHAR(255) UNIQUE NOT NULL,
    ${p.passwordField} VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_${p.userModel.toLowerCase()}_${p.emailField} ON ${p.userModel}(${p.emailField});
`.trim()

    return {
      service,
      migrations
    }
  },

  constraints: {
    forbiddenOperations: [
      'eval(',
      'exec(',
      'Function(',
      'MD5',
      'SHA1'
    ],
    requiredValidation: [
      'email',
      'password',
      'bcrypt'
    ],
    rateLimiting: {
      maxAttempts: 5,
      windowMs: 900000
    }
  },

  dependencies: {
    npm: ['bcrypt', 'jsonwebtoken', 'zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        userModel: 'User',
        sessionType: 'jwt',
        sessionDuration: '7d'
      },
      description: 'Simple JWT-based authentication',
      useCase: 'Standard web application'
    },
    {
      params: {
        userModel: 'User',
        sessionType: 'jwt',
        requireEmailVerification: true,
        passwordMinLength: 12,
        maxLoginAttempts: 3,
        lockoutDuration: '1h'
      },
      description: 'Enhanced security with email verification',
      useCase: 'Banking or healthcare application'
    }
  ]
}
