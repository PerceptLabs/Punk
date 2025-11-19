import { EpochEngine, createContext, type EpochContext, type SchemaPatch } from '@punk/synthpunk'
import { NextRequest } from 'next/server'
import { applyPatch } from 'fast-json-patch'

export const runtime = 'edge' // Optional: Use edge runtime for better performance

export async function POST(req: NextRequest) {
  try {
    const { prompt, context: reqContext } = await req.json()

    if (!prompt) {
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
          // Stream schema generation
          let patchCount = 0

          for await (const patch of engine.generateSchema(prompt, epochContext)) {
            patchCount++

            // Apply patch to current schema
            try {
              const patchArray = [{ op: patch.op, path: patch.path, value: patch.value, from: patch.from }]
              const patchResult = applyPatch(currentSchema, patchArray, true, false)
              currentSchema = patchResult.newDocument

              // Send schema chunk
              const data = JSON.stringify({
                type: 'schema_chunk',
                data: currentSchema,
                patch,
                patchCount
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } catch (patchError: any) {
              console.warn('Failed to apply patch:', patchError.message, patch)
              // Send error but continue
              const errorData = JSON.stringify({
                type: 'patch_error',
                message: patchError.message,
                patch
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
            }
          }

          // Send completion
          const completeData = JSON.stringify({
            type: 'schema_complete',
            data: currentSchema,
            patchCount
          })
          controller.enqueue(encoder.encode(`data: ${completeData}\n\n`))
          controller.close()
        } catch (error: any) {
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
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
