import { z } from 'zod'
import type { BackendTemplate } from '../../registry'

const EmailTemplateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  bodyTemplate: z.string()
})

const EmailSenderParams = z.object({
  provider: z.enum(['resend', 'sendgrid', 'smtp']),
  fromEmail: z.string().email(),
  fromName: z.string(),
  templates: z.array(EmailTemplateSchema),
  enableTracking: z.boolean().default(true)
})

export const emailSenderTemplate: BackendTemplate = {
  name: 'emailSender',
  category: 'integrations',
  description: 'Send transactional emails with templating support',
  version: '1.0.0',
  params: EmailSenderParams,

  generates: (params) => {
    const p = EmailSenderParams.parse(params)

    const templateMap = p.templates.map(t =>
      `"${t.name}": {
        subject: "${t.subject}",
        body: \`${t.bodyTemplate}\`
      }`
    ).join(',\n      ')

    const service = `
import { api, APIError } from "encore.dev/api"
import { z } from "zod"

const SendEmailRequest = z.object({
  to: z.string().email(),
  template: z.string(),
  variables: z.record(z.any()).optional()
})

export const sendEmail = api(
  { method: "POST", path: "/email/send", auth: true },
  async (req: z.infer<typeof SendEmailRequest>): Promise<{ messageId: string }> => {
    const templates: Record<string, { subject: string; body: string }> = {
      ${templateMap}
    }

    const template = templates[req.template]
    if (!template) {
      throw APIError.invalidArgument(\`Template not found: \${req.template}\`)
    }

    let subject = template.subject
    let body = template.body

    if (req.variables) {
      for (const [key, value] of Object.entries(req.variables)) {
        const regex = new RegExp(\`{{\${key}}}\`, "g")
        subject = subject.replace(regex, String(value))
        body = body.replace(regex, String(value))
      }
    }

    ${p.provider === 'resend' ? `
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.RESEND_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "${p.fromName} <${p.fromEmail}>",
        to: req.to,
        subject,
        html: body
      })
    })

    if (!response.ok) {
      throw APIError.internal("Failed to send email")
    }

    const data = await response.json()
    return { messageId: data.id }
    ` : ''}

    ${p.provider === 'sendgrid' ? `
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.SENDGRID_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: req.to }] }],
        from: { email: "${p.fromEmail}", name: "${p.fromName}" },
        subject,
        content: [{ type: "text/html", value: body }]
      })
    })

    if (!response.ok) {
      throw APIError.internal("Failed to send email")
    }

    return { messageId: response.headers.get("X-Message-Id") || "" }
    ` : ''}
  }
)
`.trim()

    return {
      service
    }
  },

  constraints: {
    forbiddenOperations: [
      'exposing API keys',
      'sending to unvalidated emails'
    ],
    requiredValidation: [
      'email format',
      'template existence'
    ]
  },

  dependencies: {
    npm: ['zod', 'encore.dev']
  },

  examples: [
    {
      params: {
        provider: 'resend',
        fromEmail: 'noreply@example.com',
        fromName: 'My App',
        templates: [
          {
            name: 'welcome',
            subject: 'Welcome to {{appName}}!',
            bodyTemplate: '<h1>Hello {{name}}!</h1><p>Welcome to our platform.</p>'
          }
        ]
      },
      description: 'Welcome email with Resend',
      useCase: 'User onboarding'
    }
  ]
}
