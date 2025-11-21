import { NextRequest, NextResponse } from 'next/server'
import { EpochEngine, createContext, type ModDefinition } from '@punk/synthpunk'
import { loggers } from '@/lib/logger'

export const runtime = 'edge'

/**
 * Shadow API - Non-streaming, headless endpoint for system-to-system AI schema generation.
 * Used by Runtime → AI calls that need a complete schema response (not SSE).
 */

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()

  // Body size guard (100KB limit)
  const contentLength = req.headers.get('content-length')
  if (contentLength && Number.parseInt(contentLength, 10) > 100_000) {
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { prompt, mods: rawMods, dataModels, userPreferences } = body ?? {}

    // 1) Validate prompt
    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      loggers.api.warn('Shadow API: invalid prompt', { requestId })
      return NextResponse.json(
        { error: "Missing or invalid 'prompt'." },
        { status: 400 }
      )
    }

    // 2) Sanitize mods
    let mods: Record<string, ModDefinition> = {}
    if (rawMods && typeof rawMods === 'object' && !Array.isArray(rawMods)) {
      mods = rawMods as Record<string, ModDefinition>
    }

    // 3) Config check
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      loggers.api.error('Shadow API: missing ANTHROPIC_API_KEY', { requestId })
      return NextResponse.json(
        { error: 'AI engine not configured' },
        { status: 500 }
      )
    }

    // 4) Init engine
    const engine = new EpochEngine({
      provider: 'anthropic',
      apiKey,
    })

    // 5) Build context
    const context = createContext(
      Array.isArray(dataModels) ? dataModels : [],
      typeof userPreferences === 'object' && userPreferences !== null
        ? userPreferences
        : undefined,
      mods
    )

    // 6) Non-streaming generation
    const schema = await engine.generateComplete(prompt.trim(), context)

    // 7) Log & return success
    const modCount = Object.keys(mods).length
    loggers.api.info('Shadow API: generation success', { requestId, modCount })

    return NextResponse.json(
      {
        success: true,
        data: schema,
        meta: {
          requestId,
          modCount,
        },
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)

    loggers.api.error('Shadow API: unexpected error', {
      requestId,
      error: errorMessage,
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
