import { EpochEngine, createContext, type EpochContext } from '@punk/synthpunk'
import { NextRequest } from 'next/server'
import { applyPatch } from 'fast-json-patch'
import { loggers } from '@/lib/logger'

export const runtime = 'edge' // Optional: Use edge runtime for better performance

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { prompt, context: reqContext } = await req.json()

    loggers.api.info('Schema generation request received', {
      requestId,
      promptLength: prompt?.length ?? 0,
      hasContext: !!reqContext,
      userAgent: req.headers.get('user-agent'),
    })

    if (!prompt) {
      loggers.api.warn('Invalid request: missing prompt', { requestId })
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Epoch Engine
    const engine = new EpochEngine({
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })

    loggers.builder.debug('EpochEngine initialized for request', { requestId })

    // Build Epoch context from request
    const epochContext: EpochContext = createContext()

    // Add conversation history from request
    if (reqContext?.conversation) {
      epochContext.conversationHistory = reqContext.conversation.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || Date.now()
      }))
    }

    // Track current schema
    let currentSchema = reqContext?.currentSchema || { type: 'root', id: 'root', children: [] }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          loggers.builder.info('Starting schema generation stream', { requestId })

          // Stream schema generation
          let patchCount = 0
          const startTime = Date.now()

          for await (const patch of engine.generateSchema(prompt, epochContext)) {
            patchCount++

            // Apply patch to current schema
            try {
              const operation: any = {
                op: patch.op,
                path: patch.path,
                value: patch.value,
              }
              if (patch.from) {
                operation.from = patch.from
              }
              const patchResult = applyPatch(currentSchema, [operation], true, false)
              currentSchema = patchResult.newDocument

              loggers.builder.debug('Patch applied successfully', {
                requestId,
                patchCount,
                op: patch.op,
                path: patch.path,
              })

              // Send schema chunk
              const data = JSON.stringify({
                type: 'schema_chunk',
                data: currentSchema,
                patch,
                patchCount
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } catch (patchError: any) {
              loggers.builder.warn('Failed to apply patch', {
                requestId,
                error: patchError.message,
                patch: { op: patch.op, path: patch.path },
              })

              // Send error but continue
              const errorData = JSON.stringify({
                type: 'patch_error',
                message: patchError.message,
                patch
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            }
          }

          const duration = Date.now() - startTime
          loggers.audit.info('Schema generation completed', {
            requestId,
            patchCount,
            durationMs: duration,
            promptPreview: prompt.substring(0, 50),
          })

          // Send completion
          const completeData = JSON.stringify({
            type: 'schema_complete',
            data: currentSchema,
            patchCount
          })
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`))
          controller.close()
        } catch (error: any) {
          loggers.api.error('Schema generation failed', {
            requestId,
            error: error.message,
            stack: error.stack,
          })

          // Send error event
          const errorData = JSON.stringify({
            type: 'error',
            message: error.message || 'Failed to generate schema'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error: any) {
    loggers.api.error('Request processing failed', {
      requestId,
      error: error.message,
      stack: error.stack,
    })

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
