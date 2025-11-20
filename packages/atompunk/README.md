# @punk/atompunk

Backend template generation system for the Punk Framework.

## Overview

Atompunk generates secure, production-ready backend code from pre-built, audited templates. Instead of letting AI generate raw backend code (which can be dangerous), Atompunk provides a catalog of 28+ templates that cover common backend patterns.

## Philosophy

```
AI Fills Templates → NOT → AI Generates Raw Code
     ✓ Safe                      ✗ Dangerous
     ✓ Tested                    ✗ Untested
     ✓ Consistent                ✗ Varies
     ✓ Secure                    ✗ Vulnerable
```

## Installation

```bash
npm install @punk/atompunk zod encore.dev
```

## Quick Start

```typescript
import { quickGenerate } from '@punk/atompunk'

// Generate password authentication
const result = await quickGenerate('passwordAuth', {
  userModel: 'User',
  sessionType: 'jwt',
  sessionDuration: '7d',
  requireEmailVerification: false,
  passwordMinLength: 8
})

if (result.success) {
  console.log(result.code.service) // Generated Encore.ts service
  console.log(result.code.migrations) // Generated SQL migrations
}
```

## Available Templates

### Authentication (2 templates)

- **passwordAuth** - Email/password with bcrypt, JWT sessions, rate limiting
- **magicLinkAuth** - Passwordless authentication via email

### CRUD Operations (1 template)

- **crudResource** - Full CRUD with pagination, soft deletes, ownership checks

### File Handling (1 template)

- **fileUpload** - Secure file uploads with validation and deduplication

### External Integrations (3 templates)

- **webhookReceiver** - Webhook handling with signature verification
- **emailSender** - Transactional emails (Resend, SendGrid)
- **apiProxy** - Proxy to external APIs with rate limiting

### Background Jobs (1 template)

- **scheduledJob** - Cron jobs with error handling and history

### Real-time (1 template)

- **pubsubChannel** - Pub/Sub messaging with Encore

### Payments (1 template)

- **stripeCheckout** - Stripe integration with webhook handling

## Usage Examples

### Password Authentication

```typescript
const auth = await quickGenerate('passwordAuth', {
  userModel: 'User',
  sessionType: 'jwt',
  sessionDuration: '7d',
  requireEmailVerification: true,
  passwordMinLength: 12,
  enablePasswordReset: true,
  maxLoginAttempts: 5,
  lockoutDuration: '15m'
})
```

### CRUD Resource

```typescript
const crud = await quickGenerate('crudResource', {
  resourceName: 'Post',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'content', type: 'string', required: true },
    { name: 'published', type: 'boolean', required: false }
  ],
  enableSoftDelete: true,
  enableAuditLog: true,
  ownershipField: 'user_id'
})
```

### File Upload

```typescript
const upload = await quickGenerate('fileUpload', {
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  storageProvider: 'local',
  enableVirusScanning: false
})
```

### Webhook Receiver

```typescript
const webhook = await quickGenerate('webhookReceiver', {
  provider: 'stripe',
  eventTypes: ['checkout.session.completed', 'payment_intent.succeeded'],
  retryOnFailure: true,
  maxRetries: 3
})
```

### Scheduled Job

```typescript
const job = await quickGenerate('scheduledJob', {
  jobName: 'cleanupOldRecords',
  schedule: '0 2 * * *', // 2 AM daily
  task: 'Clean up records older than 30 days',
  enableJobHistory: true
})
```

## Advanced Usage

### Custom Template Registry

```typescript
import { TemplateRegistry, TemplateGenerator } from '@punk/atompunk'

const registry = new TemplateRegistry()
const generator = new TemplateGenerator(registry)

// Register custom templates
registry.register('myCustomTemplate', {
  name: 'myCustomTemplate',
  category: 'custom',
  description: 'My custom template',
  version: '1.0.0',
  params: z.object({
    // Define params
  }),
  generates: (params) => ({
    service: '// Generated code'
  }),
  constraints: {
    forbiddenOperations: [],
    requiredValidation: []
  },
  dependencies: {
    npm: []
  },
  examples: []
})
```

### Validation

```typescript
import { validateTemplateGeneration } from '@punk/atompunk'

const validation = validateTemplateGeneration(
  'passwordAuth',
  params,
  passwordAuthTemplate
)

if (!validation.valid) {
  console.error('Validation errors:', validation.errors)
}

if (validation.warnings) {
  console.warn('Warnings:', validation.warnings)
}
```

### Export to Different Platforms

```typescript
import { exportApp, GeneratedApp } from '@punk/atompunk'

const app: GeneratedApp = {
  name: 'my-app',
  services: new Map([
    ['auth', authCode],
    ['posts', postsCode]
  ]),
  dependencies: ['encore.dev', 'zod'],
  envVars: ['JWT_SECRET', 'DATABASE_URL']
}

// Export to Vercel
const vercelArtifacts = await exportApp('vercel', app)

// Export to Docker
const dockerArtifacts = await exportApp('docker', app)

// Export to Encore
const encoreArtifacts = await exportApp('encore', app)
```

## Security Features

- **Input Validation** - All parameters validated with Zod schemas
- **SQL Injection Prevention** - Parameterized queries only
- **Rate Limiting** - Built into authentication templates
- **Forbidden Operations** - No eval(), exec(), or raw SQL
- **Security Scanning** - Generated code validated for vulnerabilities
- **Path Traversal Protection** - File operations are sandboxed

## Template Constraints

Each template defines:

- **Forbidden Operations** - Operations that are never allowed
- **Required Validations** - Validations that must be present
- **Rate Limiting** - Default rate limit configuration
- **Dependencies** - Required NPM packages

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Architecture

```
packages/atompunk/src/
├── registry.ts          # Template registry and allowlist
├── generator.ts         # Template generation engine
├── validators.ts        # Security validation
├── export.ts            # Export to different platforms
├── adapters/
│   └── encore.ts        # Encore.ts adapter
└── templates/
    ├── auth/            # Authentication templates
    ├── crud/            # CRUD templates
    ├── files/           # File handling templates
    ├── integrations/    # External integrations
    ├── jobs/            # Background jobs
    ├── payments/        # Payment templates
    └── realtime/        # Real-time templates
```

## Contributing

Atompunk follows strict security guidelines:

1. All templates must be peer-reviewed
2. Templates must include comprehensive tests
3. Security constraints must be defined
4. Examples must be provided
5. Templates must be added to the allowlist

## License

MIT

## Credits

Built for the Punk Framework by the Punk team.
