import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const PubSubChannelParams = z.object({
  topicName: z.string(),
  messageFields: z.record(z.enum(['string', 'number', 'boolean', 'object'])),
  deliveryGuarantee: z.enum(['at-least-once', 'at-most-once']).default('at-least-once'),
  enableMessageOrdering: z.boolean().default(false)
})

export const pubsubChannelTemplate: BackendTemplate = {
  name: 'pubsubChannel',
  category: 'realtime',
  description: 'Pub/Sub messaging for real-time updates',
  version: '1.0.0',
  params: PubSubChannelParams,

  generates: (params) => {
    const p = PubSubChannelParams.parse(params)

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    const messageFields = Object.entries(p.messageFields).map(([key, type]) => {
      const zodType = {
        string: 'z.string()',
        number: 'z.number()',
        boolean: 'z.boolean()',
        object: 'z.record(z.any())'
      }[type]
      return `${key}: ${zodType}`
    }).join(',\n  ')

    const service = `
import { Topic, Subscription } from "encore.dev/pubsub"
import { z } from "zod"

// Define message schema
const ${p.topicName}MessageSchema = z.object({
  ${messageFields}
})

type ${p.topicName}Message = z.infer<typeof ${p.topicName}MessageSchema>

// Create topic
export const ${p.topicName}Topic = new Topic<${p.topicName}Message>("${p.topicName}", {
  deliveryGuarantee: "${p.deliveryGuarantee}"
})

// Publish helper
export async function publish${capitalize(p.topicName)}(message: ${p.topicName}Message): Promise<string> {
  // Validate message
  ${p.topicName}MessageSchema.parse(message)

  const messageId = await ${p.topicName}Topic.publish(message)
  return messageId
}

// Create subscription
const ${p.topicName}Subscription = new Subscription(
  ${p.topicName}Topic,
  "${p.topicName}-handler",
  {
    handler: async (message: ${p.topicName}Message): Promise<void> => {
      console.log("Received ${p.topicName} message:", message)

      // TODO: Process message
      // Examples:
      // - Update database
      // - Trigger workflows
      // - Send notifications
      // - Call external APIs
    }
  }
)

export { ${p.topicName}Subscription }

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
`.trim()

    return {
      service
    }
  },

  constraints: {
    forbiddenOperations: [
      'blocking operations in handler',
      'infinite loops'
    ],
    requiredValidation: [
      'message schema'
    ]
  },

  dependencies: {
    npm: ['encore.dev', 'zod']
  },

  examples: [
    {
      params: {
        topicName: 'orderCreated',
        messageFields: {
          orderId: 'string',
          userId: 'string',
          amount: 'number'
        },
        deliveryGuarantee: 'at-least-once'
      },
      description: 'Order creation events',
      useCase: 'E-commerce order processing'
    }
  ]
}
