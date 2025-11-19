import { EpochEngine } from '@punk/synthpunk'
import { NextRequest } from 'next/server'

export const runtime = 'edge' // Optional: Use edge runtime for better performance

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json()

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Initialize Epoch Engine
    const engine = new EpochEngine({
      model: 'claude-sonnet-4-20250514',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build context from conversation history
          const conversationContext = context?.conversation
            ? context.conversation
                .map((msg: any) => `${msg.role}: ${msg.content}`)
                .join('\n\n')
            : ''

          const currentSchemaContext = context?.currentSchema
            ? `\n\nCurrent Schema:\n${JSON.stringify(context.currentSchema, null, 2)}`
            : ''

          const fullPrompt = `${conversationContext}\n\nUser: ${prompt}${currentSchemaContext}`

          // Stream schema generation
          let accumulatedSchema: any = null
          let messageBuffer = ''

          for await (const patch of engine.generateSchema(fullPrompt, context || {})) {
            // Handle different patch types
            if (patch.type === 'schema_delta') {
              // Apply delta to schema
              if (patch.delta) {
                accumulatedSchema = applyDelta(accumulatedSchema, patch.delta)

                // Send schema chunk
                const data = JSON.stringify({
                  type: 'schema_chunk',
                  data: accumulatedSchema
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            } else if (patch.type === 'message') {
              // Accumulate message
              messageBuffer += patch.content || ''

              // Send message chunk
              const data = JSON.stringify({
                type: 'message_chunk',
                data: patch.content || ''
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (patch.type === 'complete') {
              // Send completion
              const data = JSON.stringify({
                type: 'schema_complete',
                data: accumulatedSchema || patch.schema
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            } else if (patch.type === 'error') {
              // Send error
              const data = JSON.stringify({
                type: 'error',
                message: patch.message || 'Unknown error'
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

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

/**
 * Apply a delta patch to the current schema
 * This is a simple implementation - in production, use a proper JSON patch library
 */
function applyDelta(current: any, delta: any): any {
  if (!current) {
    return delta
  }

  // Simple merge strategy - can be enhanced with proper JSON patch
  if (typeof delta === 'object' && !Array.isArray(delta)) {
    return {
      ...current,
      ...delta
    }
  }

  return delta
}
