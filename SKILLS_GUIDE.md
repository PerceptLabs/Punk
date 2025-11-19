# Skills Guide

Complete guide to the Punk skill system - portable plugins via GlyphCase.

---

## Table of Contents

1. [What are Skills?](#what-are-skills)
2. [Installing Skills](#installing-skills)
3. [Available Skills](#available-skills)
4. [Creating Skills](#creating-skills)
5. [Skill Structure](#skill-structure)
6. [Extension Points](#extension-points)
7. [Publishing Skills](#publishing-skills)
8. [GlyphCase Format](#glyphcase-format)

---

## What are Skills?

**Skills** are portable plugins that extend Punk's capabilities. They're packaged as **GlyphCase (.gcasex) files** - self-contained bundles that include:

- **TCMR scripts** (sandboxed JavaScript)
- **Knowledge base** (JSON data)
- **Templates** (code templates)
- **Dependencies** (npm packages)
- **Documentation** (README, examples)

### Why Skills?

- ✅ **Portable** - Single .gcasex file contains everything
- ✅ **Sandboxed** - TCMR execution prevents security issues
- ✅ **Versioned** - Immutable, content-addressed
- ✅ **Shareable** - Easy to distribute and install
- ✅ **Self-contained** - No external dependencies required

---

## Installing Skills

### Via CLI (Interactive)

```bash
punk add skill
```

Search and install from the marketplace:

```
Search skills: supabase

Results:
  ◉ supabase-backend     v1.0.0  ⭐ 4.8/5 (1.2k)
    Supabase backend adapter

  ○ supabase-auth        v2.1.0  ⭐ 4.6/5 (834)
    Supabase auth patterns

[Enter to install]
```

### Via CLI (Direct)

```bash
# Install from marketplace
punk skills install supabase-backend

# Install specific version
punk skills install supabase-backend@1.0.0

# Install from file
punk skills install ./my-skill.gcasex

# Install from URL
punk skills install https://skills.punk.dev/my-skill.gcasex
```

### Via Configuration

```javascript
// punk.config.js
export default {
  skills: [
    'shadcn-components',
    'supabase-backend@2.0.0',
    './local-skill.gcasex'
  ]
}
```

Then run:
```bash
npm install  # Installs skill dependencies
```

---

## Available Skills

### Official Skills

#### shadcn-components
**shadcn/ui component library integration**

```bash
punk skills install shadcn-components
```

Adds:
- All shadcn/ui components
- Pre-configured Tailwind
- Component schemas
- Examples

#### supabase-backend
**Supabase backend adapter**

```bash
punk skills install supabase-backend
```

Features:
- Auth (email, OAuth, magic link)
- Realtime subscriptions
- Storage buckets
- Edge functions
- Pre-built templates

#### firebase-backend
**Firebase backend integration**

```bash
punk skills install firebase-backend
```

Features:
- Firestore database
- Firebase Auth
- Cloud Functions
- Storage
- Analytics

#### docx-generator
**Generate Microsoft Word documents**

```bash
punk skills install docx-generator
```

Features:
- Template-based generation
- Markdown to DOCX
- Tables, images, styles
- Headers, footers

#### pdf-processor
**Process PDF files**

```bash
punk skills install pdf-processor
```

Features:
- PDF parsing
- Text extraction
- Form filling
- PDF generation

### Community Skills

Browse all skills at: [skills.punk.dev](https://skills.punk.dev)

---

## Creating Skills

### Initialize a New Skill

```bash
punk skills create
```

Interactive prompts:
1. **Skill name:** `my-custom-validator`
2. **Description:** `Custom validation rules for forms`
3. **Extension point:** `validator`
4. **Template:** `Validator`

### Generated Structure

```
my-custom-validator/
├── scripts/                  # TCMR scripts
│   ├── validate.js
│   └── helpers.js
├── knowledge/               # Knowledge base
│   ├── rules.json
│   └── examples.json
├── templates/               # Code templates
│   └── validator.ts
├── tests/                   # Tests
│   └── validate.test.js
├── README.md               # Documentation
├── package.json            # Metadata
└── skill.json              # Skill manifest
```

### Skill Manifest

```json
// skill.json
{
  "name": "my-custom-validator",
  "version": "1.0.0",
  "description": "Custom validation rules for forms",
  "author": "Your Name",
  "license": "MIT",
  "extensionPoint": "validator",
  "dependencies": {
    "zod": "^3.22.0"
  },
  "scripts": {
    "validate": "scripts/validate.js"
  },
  "knowledge": {
    "rules": "knowledge/rules.json",
    "examples": "knowledge/examples.json"
  },
  "permissions": [
    "schema:read",
    "schema:modify",
    "context:read"
  ]
}
```

---

## Skill Structure

### TCMR Scripts

**TCMR (Totally Constrained Module Runtime)** - sandboxed JavaScript execution.

```javascript
// scripts/validate.js

/**
 * Custom email validator
 */
export function validateEmail(email) {
  const rules = loadKnowledge('rules')
  const regex = new RegExp(rules.emailPattern)

  if (!regex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    }
  }

  // Check against blocked domains
  const domain = email.split('@')[1]
  if (rules.blockedDomains.includes(domain)) {
    return {
      valid: false,
      error: 'This email domain is not allowed'
    }
  }

  return {
    valid: true
  }
}

/**
 * Custom phone validator
 */
export function validatePhone(phone, country = 'US') {
  const rules = loadKnowledge('rules')
  const pattern = rules.phonePatterns[country]

  if (!pattern) {
    return {
      valid: false,
      error: `No validation pattern for country: ${country}`
    }
  }

  const regex = new RegExp(pattern)
  return {
    valid: regex.test(phone),
    error: regex.test(phone) ? null : 'Invalid phone number'
  }
}
```

### Knowledge Base

```json
// knowledge/rules.json
{
  "emailPattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
  "blockedDomains": [
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com"
  ],
  "phonePatterns": {
    "US": "^\\+1[2-9]\\d{2}[2-9]\\d{2}\\d{4}$",
    "UK": "^\\+44[1-9]\\d{9}$",
    "DE": "^\\+49[1-9]\\d{10}$"
  }
}
```

### Templates

```typescript
// templates/validator.ts
import { z } from 'zod'

export const {{skillName}}Schema = z.object({
  {{#each fields}}
  {{name}}: z.{{type}}(){{#if required}}.min(1){{/if}},
  {{/each}}
})

export function validate{{skillName}}(data: unknown) {
  return {{skillName}}Schema.parse(data)
}
```

---

## Extension Points

Skills can extend Punk at specific extension points:

### 1. UI Components

**Extension Point:** `ui_component`

```javascript
// Register custom components
export function registerComponents() {
  return {
    'my-carousel': MyCarousel,
    'my-chart': MyChart,
  }
}
```

### 2. Backend Adapters

**Extension Point:** `backend_adapter`

```javascript
// Implement backend adapter interface
export class MyBackendAdapter {
  async initialize(config) { /* ... */ }
  async generateEndpoint(spec) { /* ... */ }
  async deploy(config) { /* ... */ }
}
```

### 3. Validators

**Extension Point:** `validator`

```javascript
// Custom validation rules
export function validateCustom(data, rules) {
  // Validation logic
  return { valid: true }
}
```

### 4. Code Generators

**Extension Point:** `generator`

```javascript
// Generate code from schemas
export function generateCode(schema) {
  // Code generation logic
  return generatedCode
}
```

### 5. AI Prompts

**Extension Point:** `ai_prompt`

```javascript
// Custom AI prompt templates
export function buildPrompt(context) {
  return `Custom prompt: ${context.userInput}`
}
```

---

## Publishing Skills

### Build Your Skill

```bash
cd my-custom-validator
punk skill build
```

This creates: `my-custom-validator.gcasex`

### Test Locally

```bash
# Test in a test project
cd ../test-project
punk skills install ../my-custom-validator/my-custom-validator.gcasex
```

### Publish to Marketplace

```bash
punk skill publish
```

Requirements:
- ✅ README.md with documentation
- ✅ Tests (minimum 80% coverage)
- ✅ Valid skill.json manifest
- ✅ No security vulnerabilities
- ✅ Valid license (MIT, Apache 2.0, etc.)

Interactive prompts:
1. **Category:** Backend, UI, Utility, AI, etc.
2. **Tags:** Relevant keywords
3. **Icon:** Path to icon file
4. **Screenshots:** Paths to screenshots
5. **Pricing:** Free, $X/month, one-time $X

### Publish to GitHub

```bash
# Create GitHub release
gh release create v1.0.0 my-custom-validator.gcasex
```

Users can install:
```bash
punk skills install github:username/repo@v1.0.0
```

---

## GlyphCase Format

### What is GlyphCase?

**GlyphCase (.gcasex)** is Punk's portable package format. It's a SQLite database containing:

- **Scripts** (TCMR JavaScript)
- **Knowledge** (JSON/YAML data)
- **Templates** (code templates)
- **Assets** (images, fonts, etc.)
- **Metadata** (manifest, checksums)

### Why SQLite?

- ✅ **Single file** - Easy to distribute
- ✅ **Queryable** - Fast lookups
- ✅ **Portable** - Works everywhere
- ✅ **Verifiable** - Built-in checksums
- ✅ **Version controlled** - Can be committed

### Structure

```sql
-- GlyphCase schema
CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE scripts (
  path TEXT PRIMARY KEY,
  content TEXT,
  checksum TEXT
);

CREATE TABLE knowledge (
  key TEXT PRIMARY KEY,
  value TEXT,  -- JSON
  schema TEXT  -- JSON Schema
);

CREATE TABLE templates (
  name TEXT PRIMARY KEY,
  content TEXT,
  variables TEXT  -- JSON
);

CREATE TABLE assets (
  path TEXT PRIMARY KEY,
  content BLOB,
  mime_type TEXT
);
```

### Creating Manually

```javascript
// build-gcasex.js
import { GlyphCaseBuilder } from '@punk/glyphcase'

const builder = new GlyphCaseBuilder('my-skill.gcasex')

// Add metadata
builder.setMetadata('name', 'my-skill')
builder.setMetadata('version', '1.0.0')

// Add scripts
builder.addScript('validate.js', await readFile('scripts/validate.js'))

// Add knowledge
builder.addKnowledge('rules', {
  emailPattern: '^[a-z]+@[a-z]+\\.[a-z]+$'
})

// Add template
builder.addTemplate('validator', await readFile('templates/validator.ts'))

// Build
await builder.build()
```

---

## Example: Creating a Stripe Skill

### 1. Initialize

```bash
punk skills create stripe-payments \
  --extension-point backend_adapter \
  --template backend
```

### 2. Implement

```javascript
// scripts/stripe.js
import Stripe from 'stripe'

export async function createPaymentIntent(amount, currency = 'usd') {
  const stripe = new Stripe(getSecret('STRIPE_SECRET_KEY'))

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
  })

  return {
    clientSecret: paymentIntent.client_secret,
    id: paymentIntent.id,
  }
}

export async function confirmPayment(paymentIntentId) {
  const stripe = new Stripe(getSecret('STRIPE_SECRET_KEY'))

  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)

  return {
    status: paymentIntent.status,
    id: paymentIntent.id,
  }
}
```

### 3. Add Knowledge

```json
// knowledge/plans.json
{
  "plans": [
    {
      "id": "basic",
      "name": "Basic",
      "price": 9.99,
      "interval": "month",
      "features": ["Feature 1", "Feature 2"]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 29.99,
      "interval": "month",
      "features": ["All Basic", "Feature 3", "Feature 4"]
    }
  ]
}
```

### 4. Add Templates

```typescript
// templates/payment-endpoint.ts
import { api } from "encore.dev/api"
import { stripe } from "../lib/stripe"

interface CreatePaymentRequest {
  amount: number
  currency?: string
}

export const createPayment = api(
  { method: "POST", path: "/payments", auth: true },
  async (req: CreatePaymentRequest) => {
    const paymentIntent = await stripe.createPaymentIntent(
      req.amount,
      req.currency
    )

    return {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.id,
    }
  }
)
```

### 5. Build & Publish

```bash
# Build
punk skill build

# Test
punk skill test

# Publish
punk skill publish --category payments --price 19.99
```

---

## Best Practices

### Security

1. **Validate all inputs** - Use Zod schemas
2. **Sanitize outputs** - Prevent XSS
3. **Minimize permissions** - Request only what's needed
4. **Audit dependencies** - Check for vulnerabilities
5. **Use secrets** - Never hardcode API keys

### Performance

1. **Lazy load** - Load scripts on demand
2. **Cache knowledge** - Don't re-read from DB
3. **Optimize queries** - Use indexes
4. **Minimize bundle** - Tree shake unused code

### Compatibility

1. **Version dependencies** - Pin versions
2. **Test across tiers** - Punk, Synthpunk, Atompunk
3. **Document requirements** - List prerequisites
4. **Provide examples** - Include working code

---

[Back to README](README.md) • [Backend Guide](BACKEND_GUIDE.md) • [Contributing](CONTRIBUTING.md)
