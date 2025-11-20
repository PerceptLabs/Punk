import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const APIProxyParams = z.object({
  targetUrl: z.string().url(),
  allowedPaths: z.array(z.string()).default(['*']),
  requireAuth: z.boolean().default(true),
  rateLimitPerMinute: z.number().default(60),
  cacheResponses: z.boolean().default(false),
  cacheTTL: z.number().default(300)
})

export const apiProxyTemplate: BackendTemplate = {
  name: 'apiProxy',
  category: 'integrations',
  description: 'Proxy requests to external APIs with rate limiting and caching',
  version: '1.0.0',
  params: APIProxyParams,

  generates: (params) => {
    const p = APIProxyParams.parse(params)

    const service = `
import { api, APIError } from "encore.dev/api"
import { z } from "zod"

const ProxyRequest = z.object({
  path: z.string(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  body: z.any().optional(),
  headers: z.record(z.string()).optional()
})

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

async function checkRateLimit(userId: string): Promise<void> {
  const now = Date.now()
  const entry = rateLimitStore.get(userId) || { count: 0, resetAt: now + 60000 }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + 60000
  }

  entry.count++

  if (entry.count > ${p.rateLimitPerMinute}) {
    throw APIError.resourceExhausted("Rate limit exceeded")
  }

  rateLimitStore.set(userId, entry)
}

${p.cacheResponses ? `
const cache = new Map<string, { data: any; expiresAt: number }>()

function getCached(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ${p.cacheTTL} * 1000
  })
}
` : ''}

export const proxyRequest = api(
  { method: "POST", path: "/proxy", auth: ${p.requireAuth} },
  async (req: z.infer<typeof ProxyRequest>${p.requireAuth ? ', ctx' : ''}): Promise<any> => {
    ${p.requireAuth ? `
    await checkRateLimit(ctx.auth.userId)
    ` : ''}

    const allowedPaths = ${JSON.stringify(p.allowedPaths)}
    const isAllowed = allowedPaths.includes('*') ||
      allowedPaths.some(pattern => {
        if (pattern.endsWith('*')) {
          return req.path.startsWith(pattern.slice(0, -1))
        }
        return req.path === pattern
      })

    if (!isAllowed) {
      throw APIError.permissionDenied("Path not allowed")
    }

    ${p.cacheResponses ? `
    if (req.method === "GET") {
      const cacheKey = \`\${req.path}:\${JSON.stringify(req.headers || {})}\`
      const cached = getCached(cacheKey)
      if (cached) {
        return cached
      }
    }
    ` : ''}

    const targetUrl = "${p.targetUrl}".replace(/\\/$/, "") + "/" + req.path.replace(/^\\//, "")

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...req.headers
      },
      body: req.body ? JSON.stringify(req.body) : undefined
    })

    if (!response.ok) {
      throw APIError.internal(\`Proxy request failed: \${response.statusText}\`)
    }

    const data = await response.json()

    ${p.cacheResponses ? `
    if (req.method === "GET") {
      const cacheKey = \`\${req.path}:\${JSON.stringify(req.headers || {})}\`
      setCache(cacheKey, data)
    }
    ` : ''}

    return data
  }
)
`.trim()

    return {
      service
    }
  },

  constraints: {
    forbiddenOperations: [
      'exposing target URL to client',
      'bypassing rate limits'
    ],
    requiredValidation: [
      'path allowlist',
      'rate limiting'
    ]
  },

  dependencies: {
    npm: ['zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        targetUrl: 'https://api.example.com',
        allowedPaths: ['/users/*', '/posts/*'],
        requireAuth: true,
        rateLimitPerMinute: 60
      },
      description: 'Proxy to external API with auth and rate limiting',
      useCase: 'Backend API aggregation'
    }
  ]
}
