# Punk Framework: Complete Specification (Unabridged)

**Version:** 1.0.0  
**Last Updated:** November 18, 2025  
**Document Type:** Complete Technical Specification

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Problem & Solution](#2-the-problem--solution)
3. [Core Philosophy: Punk Pragmatism](#3-core-philosophy-punk-pragmatism)
4. [The Three Tiers](#4-the-three-tiers)
5. [Product 1: Punk CLI](#5-product-1-punk-cli)
6. [Product 2: Mohawk](#6-product-2-atompunk-web-builder)
7. [Colorful Terminal UI Design](#7-colorful-terminal-ui-design)
8. [Core Technology Architecture](#8-core-technology-architecture)
9. [GlyphCase Integration](#9-glyphcase-integration)
10. [Mod Cases Extension System](#10-mod-cases-extension-system)
11. [Extension Points Architecture](#11-extension-points-architecture)
12. [Punk Schema Specification](#12-punk-schema-specification)
13. [Backend Adapters](#13-backend-adapters)
14. [Template Composition System](#14-template-composition-system)
15. [AI Generation Engine (Epoch)](#15-ai-generation-engine-epoch)
16. [Code Generation & Validation](#16-code-generation--validation)
17. [Security Model](#17-security-model)
18. [Desktop Runtime Architecture](#18-desktop-runtime-architecture)
19. [Distribution & Installation](#19-distribution--installation)
20. [Development Workflows](#20-development-workflows)
21. [API Reference](#21-api-reference)
22. [Configuration Reference](#22-configuration-reference)
23. [Mod Development Guide](#23-mod-development-guide)
24. [Deployment Strategies](#24-deployment-strategies)
25. [Performance Considerations](#25-performance-considerations)
26. [Comparison with Alternatives](#26-comparison-with-alternatives)
27. [Roadmap & Future Development](#27-roadmap--future-development)
28. [Community & Ecosystem](#28-community--ecosystem)
29. [Troubleshooting Guide](#29-troubleshooting-guide)
30. [Appendices](#30-appendices)

---

## 1. Executive Summary

### 1.1 Overview

The Punk Framework is a comprehensive AI-powered development platform built on the principle of **"Punk Pragmatism"** - the belief that artificial intelligence code generation must be constrained by deterministic, verifiable rules rather than operating on pure probability.

Unlike existing AI development tools (v0.dev, Bolt.new, Lovable.dev) that generate raw code as a "best guess," Punk constrains AI to work within rigorous frameworks:

- **Frontend:** AI generates validated JSON schemas rendered deterministically
- **Backend:** AI fills sandboxed templates, preventing arbitrary code generation
- **Result:** Guaranteed accessible, secure, working applications

### 1.2 The Ecosystem Components

The Punk ecosystem consists of four primary components:

```
┌─────────────────────────────────────────────────────────┐
│                  Punk Framework Core                    │
│         (@punk/core, @punk/adapters, shared libs)       │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼────────┐
│   Punk CLI     │  │ Atompunk Web  │
│ (Product 1)    │  │ (Product 2)   │
│                │  │               │
│ Terminal TUI   │  │ Browser UI    │
│ For Developers │  │ For Builders  │
│ Scaffolds Code │  │ Builds Apps   │
│                │  │               │
│ Go + Charm     │  │ React + AI    │
└────────────────┘  └───────────────┘

        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐          ┌──────▼──────┐
│   GlyphCase    │          │ Mod Cases │
│  (Component 3) │          │ (Component 4)│
│                │          │             │
│ Optional       │          │ Extension   │
│ SQLite Backend │          │ System      │
│ Local-first DB │          │ Portable    │
│ Active Capsule │          │ Plugins     │
└────────────────┘          └─────────────┘
```

### 1.3 Design Principles

1. **Determinism over Probability:** AI generates schemas, not raw code
2. **Safety by Default:** Sandboxed templates prevent security vulnerabilities
3. **Accessibility First:** All generated UIs meet WCAG standards
4. **Local-First:** Optional local database, no required cloud dependencies
5. **Extensible:** Plugin system via portable Mod Cases
6. **Beautiful Tooling:** Colorful, animated terminal interfaces
7. **Developer Choice:** Multiple backend options, flexible architecture
8. **Self-Hosting:** Full platform can run locally

### 1.4 Target Audiences

**Primary Audience 1: Developers (Punk CLI)**
- Professional software engineers
- Teams building production applications
- Developers who want to write code but need scaffolding
- CLI enthusiasts who value beautiful tooling

**Primary Audience 2: Builders (Atompunk Web)**
- Founders and product builders
- No-code/low-code users
- Rapid prototypers
- People who want working apps, not starter kits

**Secondary Audience: Extension Developers**
- Plugin creators
- Community contributors
- Companies building custom integrations

---

## 2. The Problem & Solution

### 2.1 The Problem: Probabilistic AI Code Generation

Current AI development tools operate on a fundamentally flawed approach:

#### 2.1.1 How Current Tools Work

```
User Prompt: "Build a task manager"
             ↓
    AI Language Model (GPT-4, Claude, etc.)
             ↓
    Generates Raw Code (HTML/CSS/JS/TS)
             ↓
    "Best Guess" Output
             ↓
    Problems:
    • Often buggy
    • Frequently inaccessible
    • Sometimes insecure
    • No validation
    • Inconsistent quality
    • Developer must debug
```

#### 2.1.2 Specific Problems with Probabilistic Generation

**Problem 1: Accessibility Violations**
```html
<!-- AI might generate: -->
<div onclick="handleClick()">Click me</div>

<!-- Problems:
   - Not keyboard accessible
   - No ARIA labels
   - Screen readers can't use it
   - Violates WCAG standards
-->
```

**Problem 2: Security Vulnerabilities**
```javascript
// AI might generate:
function login(username, password) {
  fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
}

// Problems:
//   - No CSRF protection
//   - No rate limiting
//   - No input validation
//   - Credentials in plaintext
```

**Problem 3: Inconsistent Patterns**
```javascript
// AI generates different patterns each time:
// Try 1: Class components
// Try 2: Function components with useState
// Try 3: Function components with useReducer
// Try 4: Mixed approaches
// Result: Inconsistent codebase
```

### 2.2 The Solution: Punk Pragmatism

Punk solves these problems by constraining AI within deterministic frameworks:

#### 2.2.1 Frontend: Schema-Based Generation

```
User Prompt: "Build a task manager"
             ↓
    AI Language Model (Claude Sonnet 4)
             ↓
    Generates Punk Schema (JSON)
             ↓
    Zod Validation (strict schema check)
             ↓
    @punk/core Renderer
             ↓
    Guaranteed Accessible React UI
    • Always keyboard accessible
    • ARIA labels included
    • Screen reader compatible
    • WCAG 2.1 Level AA compliant
    • Consistent patterns
```

**Example Punk Schema:**
```json
{
  "type": "container",
  "id": "task-manager",
  "props": {
    "className": "min-h-screen p-6",
    "role": "main",
    "aria-label": "Task Manager Application"
  },
  "children": [
    {
      "type": "form",
      "id": "add-task-form",
      "props": {
        "onSubmit": "handleAddTask",
        "aria-label": "Add new task form"
      },
      "children": [
        {
          "type": "input",
          "props": {
            "name": "taskTitle",
            "type": "text",
            "placeholder": "Enter task title",
            "required": true,
            "aria-required": "true",
            "aria-label": "Task title"
          }
        },
        {
          "type": "button",
          "props": {
            "type": "submit",
            "children": "Add Task",
            "aria-label": "Add task to list"
          }
        }
      ]
    },
    {
      "type": "list",
      "id": "task-list",
      "props": {
        "role": "list",
        "aria-label": "Task list"
      },
      "dataSource": "tasks",
      "itemTemplate": {
        "type": "listItem",
        "props": {
          "role": "listitem"
        },
        "children": [
          {
            "type": "checkbox",
            "props": {
              "checked": "{{item.completed}}",
              "onChange": "handleToggleTask",
              "aria-label": "Mark task as {{item.completed ? 'incomplete' : 'complete'}}"
            }
          },
          {
            "type": "text",
            "props": {
              "children": "{{item.title}}"
            }
          }
        ]
      }
    }
  ]
}
```

**Why This Works:**
1. **Validated:** Zod ensures schema is structurally correct
2. **Deterministic:** Same schema always renders same UI
3. **Accessible:** Renderer enforces ARIA labels, roles, keyboard navigation
4. **Consistent:** Same patterns across all generated UIs
5. **Type-Safe:** TypeScript types generated from schema

#### 2.2.2 Backend: Template-Based Generation

```
User Prompt: "Add user authentication"
             ↓
    AI Language Model
             ↓
    Selects: authEndpoint Template
             ↓
    Fills Template Parameters:
    • provider: "email"
    • features: ["oauth", "magic_link"]
    • session: "jwt"
             ↓
    Generated Encore Service (TypeScript)
    • Uses vetted template
    • Cannot write arbitrary SQL
    • Cannot bypass security checks
    • Rate limiting included
    • CSRF protection included
```

**Example Template:**
```typescript
// templates/backends/encore-ts/authEndpoint.ts

import { api, APIError } from "encore.dev/api"
import { hash, verify } from "bcrypt"
import { sign, verify as verifyJWT } from "jsonwebtoken"

interface AuthParams {
  // Template parameters (filled by AI)
  provider: "email" | "oauth"
  features: string[]
  sessionType: "jwt" | "session"
}

// Template generates this code:
export const login = api(
  { method: "POST", path: "/auth/login", auth: false },
  async (req: LoginRequest): Promise<LoginResponse> => {
    // Rate limiting (built into template)
    await rateLimiter.check(req.ip, { max: 5, window: "1m" })
    
    // Input validation (built into template)
    const validated = LoginSchema.parse(req)
    
    // Query user (using safe ORM)
    const user = await db.users.findUnique({
      where: { email: validated.email }
    })
    
    if (!user) {
      throw APIError.unauthenticated("Invalid credentials")
    }
    
    // Verify password (using bcrypt)
    const valid = await verify(validated.password, user.passwordHash)
    
    if (!valid) {
      throw APIError.unauthenticated("Invalid credentials")
    }
    
    // Generate JWT (if sessionType === "jwt")
    const token = sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )
    
    return {
      user: { id: user.id, email: user.email },
      token
    }
  }
)
```

**Why This Works:**
1. **Vetted:** Templates reviewed by security experts
2. **Complete:** All edge cases handled
3. **Safe:** Cannot inject SQL or bypass validation
4. **Consistent:** Same security patterns everywhere
5. **Testable:** Templates have comprehensive test suites

### 2.3 Comparison: Before vs After

| Aspect | Traditional AI Tools | Punk Framework |
|--------|---------------------|----------------|
| **Frontend Generation** | Raw HTML/CSS/JS (probabilistic) | Validated JSON Schema (deterministic) |
| **Accessibility** | Often missing, must fix manually | Guaranteed WCAG 2.1 AA compliance |
| **Backend Generation** | Raw code, arbitrary patterns | Sandboxed templates, vetted patterns |
| **Security** | Developer must audit | Security built into templates |
| **Consistency** | Varies by generation | Identical patterns every time |
| **Type Safety** | May or may not be typed | Always fully typed |
| **Validation** | None | Zod schemas enforce structure |
| **Testing** | Must write from scratch | Templates include tests |
| **Maintenance** | Refactor AI-generated mess | Clean, predictable structure |

---

## 3. Core Philosophy: Punk Pragmatism

### 3.1 Definition

**Punk Pragmatism** is the philosophical foundation of the Punk Framework. It states:

> "AI code generation must be constrained by deterministic, verifiable rules. Unconstrained probability leads to chaos. Constrained creativity leads to reliable systems."

### 3.2 Core Tenets

#### 3.2.1 Tenet 1: Schemas Over Code

**Principle:** AI should generate data structures (schemas), not executable code.

**Rationale:**
- Schemas are validatable with static analysis
- Schemas cannot execute arbitrary operations
- Schemas can be rendered deterministically
- Schemas are portable across implementations

**Implementation:**
```typescript
// ✅ GOOD: AI generates schema
const schema = {
  type: "button",
  props: {
    onClick: "handleClick",
    children: "Submit"
  }
}

// Renderer converts schema to safe code
function render(schema: PunkSchema) {
  return <button onClick={handlers[schema.props.onClick]}>
    {schema.props.children}
  </button>
}

// ❌ BAD: AI generates code directly
const code = `
<button onClick={() => {
  fetch('/api/users', {
    method: 'DELETE',
    body: JSON.stringify({ id: 'all' })
  })
}}>
  Submit
</button>
`
```

#### 3.2.2 Tenet 2: Templates Over Generation

**Principle:** For backend logic, AI should fill templates, not generate raw code.

**Rationale:**
- Templates are peer-reviewed and tested
- Templates enforce security best practices
- Templates handle edge cases comprehensively
- Templates prevent common vulnerabilities

**Implementation:**
```typescript
// ✅ GOOD: AI fills template
const template = loadTemplate("authEndpoint")
const filled = template.fill({
  provider: "email",
  features: ["oauth", "2fa"],
  sessionType: "jwt"
})

// ❌ BAD: AI generates backend code
const code = `
export async function login(email, password) {
  const user = await db.query('SELECT * FROM users WHERE email = ?', [email])
  if (user.password === password) {
    return { success: true, user }
  }
  return { success: false }
}
`
// Problems: plaintext passwords, SQL injection risk, no rate limiting, etc.
```

#### 3.2.3 Tenet 3: Validation Over Trust

**Principle:** All AI outputs must be validated before execution.

**Rationale:**
- AI models are probabilistic and can hallucinate
- Malformed schemas could crash the renderer
- Invalid templates could create security holes
- Validation provides a safety net

**Implementation:**
```typescript
// Zod schema for validation
import { z } from 'zod'

const PunkSchemaZod = z.object({
  type: z.string(),
  id: z.string().optional(),
  props: z.record(z.any()).optional(),
  children: z.array(z.lazy(() => PunkSchemaZod)).optional()
})

// AI generates schema
const aiOutput = await anthropic.generate(prompt)

// Validate before using
try {
  const validated = PunkSchemaZod.parse(aiOutput)
  // Safe to render
  render(validated)
} catch (error) {
  // Invalid schema, reject and regenerate
  console.error("AI generated invalid schema:", error)
  throw new Error("Schema validation failed")
}
```

#### 3.2.4 Tenet 4: Determinism Over Probability

**Principle:** The same input should always produce the same output.

**Rationale:**
- Predictability enables testing
- Consistency enables maintenance
- Reproducibility enables debugging
- Reliability enables production use

**Implementation:**
```typescript
// ✅ GOOD: Deterministic rendering
const schema = { type: "button", props: { children: "Click" } }

render(schema) // <button>Click</button>
render(schema) // <button>Click</button> (identical)
render(schema) // <button>Click</button> (identical)

// ❌ BAD: Probabilistic generation
generateButton("Click") // <button onclick="...">Click</button>
generateButton("Click") // <div class="btn">Click</div>
generateButton("Click") // <input type="button" value="Click" />
// Different every time!
```

#### 3.2.5 Tenet 5: Safety Over Flexibility

**Principle:** Restrict capabilities to ensure safety, even if it limits flexibility.

**Rationale:**
- Developers can always write custom code if needed
- Most use cases fit within safe patterns
- Safety violations are catastrophic
- Constraints breed creativity

**Implementation:**
```typescript
// ✅ GOOD: Restricted event handlers
const schema = {
  type: "button",
  props: {
    onClick: "handleSubmit" // References predefined handler
  }
}

const handlers = {
  handleSubmit: () => {
    // Validated, safe handler
  }
}

// ❌ BAD: Arbitrary code execution
const schema = {
  type: "button",
  props: {
    onClick: "eval('alert(document.cookie)')" // DANGEROUS!
  }
}
```

### 3.3 Practical Benefits

#### 3.3.1 For Developers

1. **Predictable Outputs:** Know what to expect every time
2. **Easy Debugging:** Consistent patterns make issues obvious
3. **Fast Iteration:** Safe to regenerate without breaking things
4. **Quality Baseline:** Every output meets minimum standards
5. **Reduced Cognitive Load:** Don't need to audit every line

#### 3.3.2 For Organizations

1. **Security:** Reduced attack surface, vetted patterns
2. **Compliance:** Built-in accessibility, security standards
3. **Maintainability:** Consistent codebase, clear patterns
4. **Scalability:** Templates can be improved centrally
5. **Audit Trail:** Schema changes are traceable

#### 3.3.3 For End Users

1. **Accessibility:** Apps work with screen readers, keyboards
2. **Reliability:** Fewer bugs, more stable applications
3. **Security:** Personal data handled safely
4. **Performance:** Optimized rendering, no bloat
5. **Consistency:** Familiar patterns across apps

---

## 4. The Three Tiers

The Punk Framework is organized into three progressive tiers, each building on the previous:

### 4.1 Tier 1: Punk (Foundation)

**Tagline:** "Deterministic UI Rendering"

**Capabilities:**
- Render Punk Schemas to React components
- Validate schemas with Zod
- Ensure accessibility compliance
- Provide type-safe component interfaces

**Use Cases:**
- Design systems
- Component libraries
- UI documentation
- Manual schema authoring

**What It Includes:**
```
@punk/core
├── Renderer (schema → React)
├── Validator (Zod schemas)
├── Type definitions
└── Base components
```

**Example Usage:**
```typescript
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'container',
  children: [
    { type: 'heading', props: { level: 1, children: 'Hello World' } },
    { type: 'button', props: { onClick: 'handleClick', children: 'Click Me' } }
  ]
}

function App() {
  const handlers = {
    handleClick: () => alert('Clicked!')
  }
  
  return <PunkRenderer schema={schema} handlers={handlers} />
}
```

**Who Uses This:**
- Teams building design systems
- Developers creating component libraries
- Organizations with strict UI guidelines
- Projects requiring deterministic rendering

**Pricing:** Free, open source (MIT license)

### 4.2 Tier 2: Synthpunk (AI-Powered)

**Tagline:** "AI-Generated UI Schemas"

**Capabilities:**
- Everything in Tier 1, plus:
- AI generation of Punk Schemas
- Natural language → UI schemas
- Schema refinement and iteration
- Revision history and diffing

**Use Cases:**
- Rapid prototyping
- UI experimentation
- Low-code development
- Design exploration

**What It Includes:**
```
@punk/synthpunk
├── Epoch Engine (AI generation)
├── Schema optimizer
├── Revision manager
├── Diff viewer
└── Context manager
```

**Example Usage:**
```typescript
import { EpochEngine } from '@punk/synthpunk'

const epoch = new EpochEngine({
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY
})

const schema = await epoch.generate({
  prompt: "Create a login form with email and password",
  context: [],
  constraints: {
    maxNodeCount: 50,
    requiredComponents: ['form', 'input', 'button']
  }
})

// Schema is automatically validated
console.log(schema.type) // 'form'
```

**Who Uses This:**
- Product designers
- Rapid prototypers
- Startup founders
- Agencies building client prototypes

**Pricing:** Free for open source, $29/mo for commercial use

### 4.3 Tier 3: Atompunk (Full-Stack)

**Tagline:** "Complete AI-Generated Applications"

**Capabilities:**
- Everything in Tier 1 & 2, plus:
- Backend code generation (via templates)
- Database schema generation
- API endpoint generation
- Authentication scaffolding
- Deployment configuration

**Use Cases:**
- Full application development
- SaaS product creation
- Internal tools
- MVP development

**What It Includes:**
```
@punk/atompunk
├── Backend generator
├── Template manager
├── Database schema generator
├── Auth scaffolding
├── Deployment config generator
└── Integration templates
```

**Example Usage:**
```typescript
import { AtompunkEngine } from '@punk/atompunk'

const atompunk = new AtompunkEngine({
  model: 'claude-sonnet-4-20250514',
  backend: 'encore-ts'
})

const app = await atompunk.generateFullStack({
  prompt: "Build a task management app with user authentication",
  features: {
    auth: { provider: 'email', oauth: ['google'] },
    database: { provider: 'postgresql' },
    realtime: true
  }
})

// Returns:
// {
//   frontend: PunkSchema,
//   backend: EncoreServices[],
//   database: SQLMigrations[],
//   deployment: DeployConfig
// }
```

**Who Uses This:**
- Founders building MVPs
- Agencies delivering client projects
- Internal tools teams
- Solo developers shipping products

**Pricing:** $99/mo for individuals, $299/mo for teams

### 4.4 Tier Comparison Matrix

| Feature | Punk (T1) | Synthpunk (T2) | Atompunk (T3) |
|---------|-----------|----------------|---------------|
| **UI Rendering** | ✅ | ✅ | ✅ |
| **Schema Validation** | ✅ | ✅ | ✅ |
| **Accessibility** | ✅ | ✅ | ✅ |
| **Type Safety** | ✅ | ✅ | ✅ |
| **AI Generation (Frontend)** | ❌ | ✅ | ✅ |
| **Revision History** | ❌ | ✅ | ✅ |
| **Context Management** | ❌ | ✅ | ✅ |
| **Backend Generation** | ❌ | ❌ | ✅ |
| **Database Schemas** | ❌ | ❌ | ✅ |
| **Auth Scaffolding** | ❌ | ❌ | ✅ |
| **API Generation** | ❌ | ❌ | ✅ |
| **Deployment Config** | ❌ | ❌ | ✅ |
| **Price** | Free | $29/mo | $99/mo |

### 4.5 Upgrade Path

Users can seamlessly upgrade between tiers:

```bash
# Start with Punk (free)
npm install @punk/core

# Upgrade to Synthpunk
npm install @punk/synthpunk
punk upgrade synthpunk

# Upgrade to Atompunk
npm install @punk/atompunk
punk upgrade atompunk
```

**What Happens During Upgrade:**
1. New dependencies installed
2. Configuration file updated
3. Additional templates copied
4. README updated with new capabilities
5. Example files added
6. No breaking changes to existing code

---

## 5. Product 1: Punk CLI

### 5.1 Overview

The Punk CLI is a **beautiful, colorful Terminal User Interface (TUI)** built with Go and the Charm libraries (Bubble Tea, Lip Gloss, Bubbles). It serves as an **ergonomic scaffolding tool** for developers who want to write code themselves but need a best-in-class, modular foundation.

**Metaphor:** "The Ergonomic Bootstrapper"

### 5.2 Core Features

#### 5.2.1 Interactive Project Creation

```bash
$ punk create

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗                   ║
║   ██╔══██╗██║   ██║████╗  ██║██║ ██╔╝                   ║
║   ██████╔╝██║   ██║██╔██╗ ██║█████╔╝                    ║
║   ██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗                    ║
║   ██║     ╚██████╔╝██║ ╚████║██║  ██╗                   ║
║   ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝                   ║
║                                                           ║
║        BUILD FAST. BREAK RULES. SHIP CODE. 🎸            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

What are you building?

  ◉ Punk         Just render UI schemas
                 • Deterministic React renderer
                 • Zod validation
                 • Accessibility built-in
                 
  ○ Synthpunk    UI + AI generation
                 • Everything in Punk
                 • AI schema generation (Epoch)
                 • Revision history
                 
  ○ Atompunk     Full-stack with backend generation
                 • Everything in Synthpunk
                 • Backend code generation
                 • Database schema generation

[↑↓ to navigate, Enter to select, q to quit]
```

#### 5.2.2 Backend Selection

```
Choose your backend:

  ○ None         Browser-only, no persistence
                 • Perfect for static sites
                 • No server required
                 • Client-side only

  ○ Manifest     Declarative YAML backend
                 • Define APIs in YAML
                 • Generates TypeScript stubs
                 • Easy to understand

  ○ tRPC         TypeScript RPC backend
                 • End-to-end type safety
                 • No code generation
                 • React hooks included

  ◉ Encore.ts    TypeScript declarative backend
                 • Infrastructure from code
                 • Built-in dev tools
                 • Deploy anywhere
                 
  ○ Encore       Go backend (high performance)
                 • Native speed
                 • Low resource usage
                 • Production-ready
                 
  ○ GlyphCase    Local-first SQLite backend ⭐
                 • Portable database
                 • Works offline
                 • Active Capsule support

[↑↓ to navigate, Enter to select, ← back, q to quit]
```

#### 5.2.3 Mod Selection

```
Add mods? (optional)

Mods extend Punk with additional capabilities.

Available mods:

  ☐ shadcn-components    shadcn/ui component library
  ☐ supabase-backend     Supabase backend integration
  ☐ docx-generator       Generate Word documents
  ☐ pdf-processor        Process PDF files
  ☐ analytics            Usage analytics

[Space to toggle, Enter to continue, ← back, q to quit]
```

#### 5.2.4 Project Configuration

```
Project configuration:

  Name:         my-awesome-app
  Location:     ~/dev/my-awesome-app
  Tier:         Synthpunk
  Backend:      Encore.ts
  Mods:       shadcn-components, supabase-backend
  
  Package manager:
    ◉ npm
    ○ yarn
    ○ pnpm
    ○ bun

  Git initialization:
    ☑ Initialize git repository
    ☑ Create .gitignore
    ☐ Create initial commit

  Additional options:
    ☑ Include examples
    ☑ Include tests
    ☑ Include documentation
    ☐ Include Docker config

[↑↓ to navigate, Space to toggle, Enter to create, ← back, q to quit]
```

#### 5.2.5 Generation Progress

```
Creating your Punk app

✓ Creating directory structure
✓ Copying base template
⠋ Adding Synthpunk layer
  Merging configurations
  Setting up Encore.ts backend
  Installing mods
  Generating README

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 40%
```

#### 5.2.6 Success Screen

```
✓ Project created successfully!

┌─────────────────────────────────────────────────────────┐
│  📦 my-awesome-app                                      │
│                                                         │
│  Structure:                                             │
│  ├── frontend/              React + TypeScript         │
│  │   ├── src/                                          │
│  │   │   ├── App.tsx                                   │
│  │   │   ├── schemas/      Punk schemas               │
│  │   │   ├── components/   React components           │
│  │   │   └── lib/          Utilities                  │
│  │   └── package.json                                  │
│  │                                                      │
│  ├── backend/               Encore.ts                  │
│  │   ├── services/          API services              │
│  │   └── encore.ts          Config                    │
│  │                                                      │
│  ├── punk.config.js         Punk configuration        │
│  └── README.md              Documentation              │
│                                                         │
│  Dependencies installed:                                │
│  ├── @punk/core            v1.0.0                     │
│  ├── @punk/synthpunk       v1.0.0                     │
│  ├── @punk/adapters        v1.0.0                     │
│  └── encore.dev            v1.40.0                    │
│                                                         │
│  Mods loaded:                                         │
│  ├── shadcn-components     v2.0.0                     │
│  └── supabase-backend      v1.0.0                     │
└─────────────────────────────────────────────────────────┘

Next steps:
  
  $ cd my-awesome-app
  $ npm install
  $ punk dev

Documentation: https://docs.punk.dev
Discord: https://discord.gg/punk

[Press any key to exit]
```

### 5.3 Additional Commands

#### 5.3.1 `punk dev` - Development Server

```bash
$ punk dev

╔═══════════════════════════════════════════════════════════╗
║  🎸 Punk Development Server                               ║
╚═══════════════════════════════════════════════════════════╝

Services:
  ● Frontend    http://localhost:3000
  ● Backend     http://localhost:4000  
  ● Database    localhost:5432

Logs:
  [11:23:45] [Frontend] ✓ Vite dev server running
  [11:23:46] [Backend]  ✓ Encore.ts server started
  [11:23:46] [Backend]  ℹ API available at /api
  [11:23:50] [Frontend] → HMR update: src/App.tsx
  [11:24:12] [Backend]  → POST /api/tasks 201 45ms

Press h for help, r to restart, q to quit
```

**Interactive Help Menu:**
```
Keyboard Shortcuts:

  h     Show this help
  r     Restart all services
  c     Clear console
  f     Focus frontend logs
  b     Focus backend logs
  a     Show all logs
  o     Open in browser
  t     Run tests
  l     Show service URLs
  d     Toggle debug mode
  q     Quit

[Press any key to return]
```

#### 5.3.2 `punk add` - Add Features

```bash
$ punk add

What would you like to add?

  ◉ Tier upgrade         Upgrade to Synthpunk or Atompunk
  ○ Backend adapter      Add a new backend option
  ○ Mod                Add a mod to extend capabilities
  ○ Component library    Add UI component library
  ○ Authentication       Add auth scaffolding
  ○ Database             Add database integration
  ○ Deployment target    Add deployment configuration

[Select to continue...]
```

**Adding a Mod:**
```bash
$ punk add mod

Search mods: supabase

Results:

  ◉ supabase-backend      v1.0.0  ⭐ 4.8/5 (1.2k ratings)
    Supabase backend adapter
    
    Features:
    • Auth (email, OAuth, magic link)
    • Realtime subscriptions
    • Storage buckets
    • Edge functions
    
    Dependencies:
    • @supabase/supabase-js ^2.0.0
    
  ○ supabase-auth        v2.1.0  ⭐ 4.6/5 (834 ratings)
    Supabase auth patterns
    
  ○ supabase-storage     v1.5.0  ⭐ 4.7/5 (652 ratings)
    Supabase storage integration

[Enter to install, ↑↓ to navigate, q to cancel]
```

**Installation Progress:**
```
Installing supabase-backend

⠋ Downloading from https://mods.punk.dev/
✓ Downloaded supabase-backend.gcasex (234 KB)
⠋ Verifying checksum
✓ Verified (SHA256 match)
⠋ Extracting mod
✓ Extracted 15 files
⠋ Installing dependencies
✓ Installed @supabase/supabase-js@2.39.0
⠋ Updating configuration
✓ Updated punk.config.js
⠋ Generating examples
✓ Created examples/supabase-auth.ts

✓ Successfully installed supabase-backend v1.0.0

Configuration:
  Add these to your .env:
  
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key

Next steps:
  
  1. Create Supabase project at https://supabase.com
  2. Copy your project URL and anon key
  3. Add to .env file
  4. Use in your app:
  
     import { supabase } from './lib/supabase'
     
     const { data } = await supabase.auth.signUp({
       email: 'user@example.com',
       password: 'secure-password'
     })

Documentation: https://docs.punk.dev/mods/supabase-backend
```

#### 5.3.3 `punk upgrade` - Tier Upgrades

```bash
$ punk upgrade

╔═══════════════════════════════════════════════════════════╗
║  Upgrade Tier                                             ║
╚═══════════════════════════════════════════════════════════╝

Current: Punk (Tier 1)

Available upgrades:

  ◉ Synthpunk (Tier 2)    $29/month
    Add AI-powered schema generation
    
    What you get:
    ✓ Epoch AI engine
    ✓ Natural language → UI schemas
    ✓ Revision history
    ✓ Context management
    ✓ Schema optimization
    
  ○ Atompunk (Tier 3)     $99/month
    Add full-stack generation
    
    What you get:
    ✓ Everything in Synthpunk
    ✓ Backend code generation
    ✓ Database schema generation
    ✓ Auth scaffolding
    ✓ Deployment configuration

[↑↓ to select, Enter to continue, q to cancel]
```

**Upgrade Preview:**
```
Upgrade Preview: Punk → Synthpunk

Files to be added:
  ✓ @punk/synthpunk package
  ✓ src/lib/epoch.ts            AI engine setup
  ✓ src/components/Generator.tsx   UI generator component
  ✓ src/components/RevisionHistory.tsx   Schema history
  ✓ examples/ai-generation.ts   Example usage

Configuration changes:
  punk.config.js:
    + tier: 'synthpunk'
    + anthropic: { apiKey: process.env.ANTHROPIC_API_KEY }

Dependencies to install:
  + @punk/synthpunk@1.0.0
  + @anthropic-ai/sdk@0.20.0
  + zod@3.22.0

Estimated time: ~30 seconds

[Enter to upgrade, ← back, q to cancel]
```

#### 5.3.4 `punk theme` - Theme Selection

```bash
$ punk theme

╔═══════════════════════════════════════════════════════════╗
║  Choose Your Theme                                        ║
╚═══════════════════════════════════════════════════════════╝

  ◉ Punk         Classic punk rock aesthetic 🎸
                 Hot pink, electric blue, neon green
                 Bold, chaotic, high-contrast
                 Glitch effects, animated borders

  ○ Synthpunk    Synthwave cyberpunk vibes 🌆
                 Cyan, magenta, purple, pink
                 Smooth gradients, neon glow
                 Rainbow text, pulsing effects

  ○ Atompunk     Retro-futuristic atomic age ⚛️
                 Orange, teal, cream, rust
                 Clean lines, vintage borders
                 Atomic spinner, 1950s aesthetics

  ○ Solarpunk    Eco-futuristic optimism 🌿
                 Green, gold, earth tones
                 Organic shapes, natural patterns
                 Growth animations

  ○ Custom       Create your own theme
                 Define custom colors
                 Configure effects
                 Save as preset

[↑↓ to navigate, Enter to select, p to preview, q to cancel]
```

**Theme Preview:**
```bash
$ punk theme preview synthpunk

╔═══════════════════════════════════════════════════════════╗
║   SYNTHPUNK THEME PREVIEW                                 ║
╚═══════════════════════════════════════════════════════════╝

Colors:
  Primary:   ████ Cyan (#00D9FF)
  Secondary: ████ Magenta (#FF006E)
  Accent:    ████ Pink (#FF5AC4)
  Success:   ████ Green (#00FF41)
  Warning:   ████ Yellow (#FFD93D)
  Error:     ████ Red (#FF006E)

UI Elements:

  ▸ Selected item          ← Cyan background
  ○ Unselected item        ← Gray text
  ✓ Completed task         ← Green icon
  ✗ Failed task            ← Red icon
  
Progress Bar:
  [████████████████████░░░░] 75%  ← Rainbow gradient

Spinner:
  ▰▰▰▰▰▰▰ ← Neon pulse animation

Effects:
  ☑ Rainbow text
  ☑ Gradient borders
  ☐ Glitch effects
  ☑ Glow effects

[Enter to apply, ← back]
```

#### 5.3.5 `punk mods` - Mod Management

```bash
$ punk mods

╔═══════════════════════════════════════════════════════════╗
║  Mod Management                                         ║
╚═══════════════════════════════════════════════════════════╝

  list          List installed and available mods
  search        Search for mods
  install       Install a mod
  uninstall     Remove a mod
  info          View mod details
  update        Update installed mods
  create        Create a new mod

[Type command or select from menu...]
```

**List Mods:**
```bash
$ punk mods list

Installed Mods:

  shadcn-components  v2.0.0
    shadcn/ui component library
    Extends: ui_components
    Last updated: 3 days ago

  supabase-backend   v1.0.0
    Supabase backend adapter
    Extends: backend_adapter
    Last updated: 1 week ago

Available Mods (from registry):

  firebase-backend   v2.1.0  ⭐ 4.7/5
    Firebase backend integration
    
  docx-generator     v1.0.0  ⭐ 4.8/5
    Generate Word documents
    
  pdf-processor      v1.2.0  ⭐ 4.6/5
    Process PDF files
    
  [More mods available - punk mods search]
```

**Create Custom Mod:**
```bash
$ punk mod create

╔═══════════════════════════════════════════════════════════╗
║  Create New Mod                                         ║
╚═══════════════════════════════════════════════════════════╝

  Mod name:        my-custom-validator
  Description:       Custom validation rules for forms
  Extension point:   validator
  
  Include TCMR scripts:     ☑ Yes
  Include WASM modules:      ☐ No
  Include examples:          ☑ Yes
  Include tests:             ☑ Yes
  
  Template:
    ◉ Basic              Minimal setup
    ○ Backend Adapter    Backend integration template
    ○ UI Components      Component library template
    ○ Code Generator     Code generation template
    ○ Validator          Validation rules template

[Enter to create, ← back, q to cancel]
```

**Generated Structure:**
```
my-custom-validator/
├── my-custom-validator.gcasex    # The GlyphCase file
├── scripts/                       # TCMR scripts
│   ├── validate.js
│   └── helpers.js
├── knowledge/                     # Knowledge base
│   ├── rules.json
│   └── examples.json
├── tests/                         # Tests
│   └── validate.test.js
├── README.md                      # Documentation
└── package.json                   # Metadata

Next steps:
  
  1. Edit scripts/validate.js with your validation logic
  2. Add rules to knowledge/rules.json
  3. Test: punk mod test my-custom-validator
  4. Build: punk mod build my-custom-validator
  5. Publish: punk mod publish my-custom-validator
```

### 5.4 CLI Architecture

#### 5.4.1 Technology Stack

```
Punk CLI
├── Language: Go 1.21+
├── UI Framework: Bubble Tea (TUI framework)
├── Styling: Lip Gloss (terminal styling)
├── Components: Bubbles (pre-built components)
├── Forms: Huh (form builder)
└── Build: Go build (single binary)
```

#### 5.4.2 Project Structure

```
tools/cli/
├── main.go                   # Entry point
├── cmd/                      # Commands
│   ├── create.go            # punk create
│   ├── add.go               # punk add
│   ├── dev.go               # punk dev
│   ├── upgrade.go           # punk upgrade
│   ├── theme.go             # punk theme
│   ├── mods.go            # punk mods
│   └── config.go            # punk config
│
├── ui/                       # UI components
│   ├── banner.go            # ASCII art banners
│   ├── picker.go            # Selection menus
│   ├── progress.go          # Progress bars
│   ├── spinner.go           # Loading spinners
│   ├── form.go              # Form inputs
│   ├── gradient.go          # Gradient text
│   ├── rainbow.go           # Rainbow animations
│   └── effects.go           # Visual effects
│
├── themes/                   # Theme system
│   ├── theme.go             # Theme interface
│   ├── punk.go              # Punk theme
│   ├── synthpunk.go         # Synthpunk theme
│   ├── atompunk.go          # Atompunk theme
│   ├── solarpunk.go         # Solarpunk theme
│   └── colors.go            # Color utilities
│
├── composer/                 # Template composition
│   ├── composer.go          # Main composer
│   ├── template.go          # Template struct
│   ├── merger.go            # Template merging
│   └── validator.go         # Validation
│
├── mods/                   # Mod management
│   ├── manager.go           # Mod manager
│   ├── installer.go         # Install/uninstall
│   ├── registry.go          # Registry client
│   └── validator.go         # Mod validation
│
├── config/                   # Configuration
│   ├── config.go            # Config types
│   ├── loader.go            # Load config
│   └── writer.go            # Write config
│
└── utils/                    # Utilities
    ├── fs.go                # File system
    ├── git.go               # Git operations
    ├── npm.go               # NPM operations
    └── http.go              # HTTP client
```

#### 5.4.3 Key Implementation: Template Composer

```go
// tools/cli/composer/composer.go
package composer

import (
    "encoding/json"
    "io/fs"
    "os"
    "path/filepath"
)

type Template struct {
    Name         string            `json:"name"`
    Tier         string            `json:"tier"`
    Backend      string            `json:"backend"`
    Mods       []string          `json:"mods"`
    Dependencies []string          `json:"dependencies"`
    DevDeps      []string          `json:"devDependencies"`
    Files        map[string]string `json:"files"`
    Scripts      map[string]string `json:"scripts"`
}

type Composer struct {
    templatesDir string
    outputDir    string
}

func NewComposer(templatesDir, outputDir string) *Composer {
    return &Composer{
        templatesDir: templatesDir,
        outputDir:    outputDir,
    }
}

// Compose creates a project from modular templates
func (c *Composer) Compose(
    name, tier, backend string,
    mods []string,
) (*Template, error) {
    template := &Template{
        Name:         name,
        Tier:         tier,
        Backend:      backend,
        Mods:       mods,
        Dependencies: []string{},
        DevDeps:      []string{},
        Files:        make(map[string]string),
        Scripts:      make(map[string]string),
    }
    
    // 1. Load base template (common to all projects)
    base, err := c.loadModule("base")
    if err != nil {
        return nil, fmt.Errorf("failed to load base: %w", err)
    }
    c.merge(template, base)
    
    // 2. Load tier template (punk/synthpunk/atompunk)
    tierModule, err := c.loadModule(filepath.Join("layers", tier))
    if err != nil {
        return nil, fmt.Errorf("failed to load tier %s: %w", tier, err)
    }
    c.merge(template, tierModule)
    
    // 3. Load backend template
    if backend != "none" {
        backendModule, err := c.loadModule(filepath.Join("backends", backend))
        if err != nil {
            return nil, fmt.Errorf("failed to load backend %s: %w", backend, err)
        }
        c.merge(template, backendModule)
    }
    
    // 4. Load mod templates
    for _, mod := range mods {
        modModule, err := c.loadMod(mod)
        if err != nil {
            return nil, fmt.Errorf("failed to load mod %s: %w", mod, err)
        }
        c.merge(template, modModule)
    }
    
    return template, nil
}

// loadModule loads a template module from disk
func (c *Composer) loadModule(path string) (*Module, error) {
    manifestPath := filepath.Join(c.templatesDir, path, "manifest.json")
    
    data, err := os.ReadFile(manifestPath)
    if err != nil {
        return nil, err
    }
    
    var module Module
    if err := json.Unmarshal(data, &module); err != nil {
        return nil, err
    }
    
    module.BasePath = filepath.Join(c.templatesDir, path)
    
    return &module, nil
}

// loadMod loads a mod from .gcasex file or directory
func (c *Composer) loadMod(modPath string) (*Module, error) {
    // Check if it's a .gcasex file
    if filepath.Ext(modPath) == ".gcasex" {
        return c.loadModFromGlyphCase(modPath)
    }
    
    // Otherwise load from directory
    return c.loadModule(modPath)
}

// merge combines a module into the template
func (c *Composer) merge(template *Template, module *Module) {
    // Merge dependencies (deduplicate)
    template.Dependencies = c.mergeDeps(
        template.Dependencies,
        module.Dependencies,
    )
    template.DevDeps = c.mergeDeps(
        template.DevDeps,
        module.DevDependencies,
    )
    
    // Merge files
    for src, dest := range module.Files {
        // Convert relative source to absolute
        absSrc := filepath.Join(module.BasePath, src)
        template.Files[absSrc] = dest
    }
    
    // Merge scripts (later modules override earlier ones)
    for name, script := range module.Scripts {
        template.Scripts[name] = script
    }
}

// Generate creates the actual project files
func (c *Composer) Generate(template *Template) error {
    // 1. Create output directory
    if err := os.MkdirAll(c.outputDir, 0755); err != nil {
        return err
    }
    
    // 2. Copy files
    for src, dest := range template.Files {
        destPath := filepath.Join(c.outputDir, dest)
        
        if err := c.copyFile(src, destPath, template); err != nil {
            return fmt.Errorf("failed to copy %s: %w", src, err)
        }
    }
    
    // 3. Generate package.json
    if err := c.generatePackageJson(template); err != nil {
        return err
    }
    
    // 4. Generate punk.config.js
    if err := c.generatePunkConfig(template); err != nil {
        return err
    }
    
    // 5. Generate README.md
    if err := c.generateReadme(template); err != nil {
        return err
    }
    
    // 6. Initialize git (if requested)
    if c.initGit {
        if err := c.initializeGit(); err != nil {
            return err
        }
    }
    
    return nil
}

// copyFile copies a file with template variable replacement
func (c *Composer) copyFile(src, dest string, template *Template) error {
    // Read source
    content, err := os.ReadFile(src)
    if err != nil {
        return err
    }
    
    // Process template variables
    processed := c.processTemplate(string(content), template)
    
    // Create destination directory
    destDir := filepath.Dir(dest)
    if err := os.MkdirAll(destDir, 0755); err != nil {
        return err
    }
    
    // Write destination
    return os.WriteFile(dest, []byte(processed), 0644)
}

// processTemplate replaces template variables
func (c *Composer) processTemplate(content string, template *Template) string {
    replacer := strings.NewReplacer(
        "{{.ProjectName}}", template.Name,
        "{{.Tier}}", template.Tier,
        "{{.Backend}}", template.Backend,
    )
    return replacer.Replace(content)
}

// generatePackageJson creates package.json
func (c *Composer) generatePackageJson(template *Template) error {
    pkg := map[string]interface{}{
        "name":    template.Name,
        "version": "0.1.0",
        "type":    "module",
        "scripts": template.Scripts,
        "dependencies": c.depsToMap(template.Dependencies),
        "devDependencies": c.depsToMap(template.DevDeps),
    }
    
    data, err := json.MarshalIndent(pkg, "", "  ")
    if err != nil {
        return err
    }
    
    path := filepath.Join(c.outputDir, "package.json")
    return os.WriteFile(path, data, 0644)
}

// generatePunkConfig creates punk.config.js
func (c *Composer) generatePunkConfig(template *Template) error {
    config := fmt.Sprintf(`export default {
  tier: '%s',
  backend: '%s',
  mods: %s,
}
`, template.Tier, template.Backend, c.formatMods(template.Mods))
    
    path := filepath.Join(c.outputDir, "punk.config.js")
    return os.WriteFile(path, []byte(config), 0644)
}
```

#### 5.4.4 Key Implementation: Colorful Progress UI

```go
// tools/cli/ui/progress.go
package ui

import (
    "time"
    
    "github.com/charmbracelet/bubbles/progress"
    "github.com/charmbracelet/bubbles/spinner"
    tea "github.com/charmbracelet/bubbletea"
    "github.com/charmbracelet/lipgloss"
    
    "punk/themes"
)

type progressModel struct {
    theme     *themes.Theme
    progress  progress.Model
    spinner   spinner.Model
    steps     []string
    current   int
    done      bool
}

func NewProgressModel(theme *themes.Theme, steps []string) progressModel {
    p := progress.New(
        progress.WithDefaultGradient(),
        progress.WithWidth(50),
    )
    
    s := spinner.New()
    s.Spinner = GetSpinner(theme.SpinnerType)
    s.Style = theme.SpinnerStyle
    
    return progressModel{
        theme:    theme,
        progress: p,
        spinner:  s,
        steps:    steps,
        current:  0,
        done:     false,
    }
}

func (m progressModel) Init() tea.Cmd {
    return tea.Batch(
        m.spinner.Tick,
        performStep(0),
    )
}

func (m progressModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case stepCompleteMsg:
        m.current++
        if m.current >= len(m.steps) {
            m.done = true
            return m, tea.Quit
        }
        return m, performStep(m.current)
    
    case spinner.TickMsg:
        var cmd tea.Cmd
        m.spinner, cmd = m.spinner.Update(msg)
        return m, cmd
    }
    
    return m, nil
}

func (m progressModel) View() string {
    if m.done {
        return m.renderSuccess()
    }
    
    var s string
    
    // Title with theme styling
    title := "Creating your Punk app"
    if m.theme.Gradient {
        title = SynthwaveGradient(title)
    } else {
        title = m.theme.Title.Render(title)
    }
    s += title + "\n\n"
    
    // Steps list
    for i, step := range m.steps {
        if i < m.current {
            // Completed step
            s += m.theme.Success.Render(m.theme.Bullets.Done) + " "
            s += m.theme.Muted.Render(step) + "\n"
        } else if i == m.current {
            // Current step with spinner
            s += m.spinner.View() + " " + step + "\n"
        } else {
            // Pending step
            s += "  " + m.theme.Unselected.Render(step) + "\n"
        }
    }
    
    // Progress bar
    percent := float64(m.current) / float64(len(m.steps))
    s += "\n" + m.progress.ViewAs(percent) + "\n"
    
    return s
}

func (m progressModel) renderSuccess() string {
    var s string
    
    s += "\n"
    s += m.theme.Success.Render("✓ Project created successfully!") + "\n\n"
    
    s += "Next steps:\n"
    s += m.theme.Bullets.Info + " cd " + m.theme.Code.Render("my-app") + "\n"
    s += m.theme.Bullets.Info + " npm install\n"
    s += m.theme.Bullets.Info + " punk dev\n\n"
    
    s += m.theme.Muted.Render("Documentation: https://docs.punk.dev") + "\n"
    s += m.theme.Muted.Render("Discord: https://discord.gg/punk") + "\n"
    
    return s
}

// Message types
type stepCompleteMsg struct {
    step int
}

// Command to perform a step
func performStep(step int) tea.Cmd {
    return func() tea.Msg {
        // Simulate work
        time.Sleep(500 * time.Millisecond)
        
        // Do actual work here based on step
        switch step {
        case 0:
            copyBaseTemplate()
        case 1:
            copyLayerTemplate()
        case 2:
            copyBackendTemplate()
        case 3:
            mergePackageJson()
        case 4:
            generateReadme()
        }
        
        return stepCompleteMsg{step}
    }
}
```

### 5.5 Distribution

#### 5.5.1 Binary Distribution

The CLI is distributed as a single, statically-linked binary:

```bash
# Build for all platforms
$ task build:all

Building Punk CLI...

  ✓ darwin/amd64    punk-darwin-amd64      (8.2 MB)
  ✓ darwin/arm64    punk-darwin-arm64      (7.9 MB)
  ✓ linux/amd64     punk-linux-amd64       (8.5 MB)
  ✓ linux/arm64     punk-linux-arm64       (8.1 MB)
  ✓ windows/amd64   punk-windows-amd64.exe (8.7 MB)

Output: dist/
```

#### 5.5.2 Installation Methods

**Homebrew (macOS/Linux):**
```bash
brew tap punk-framework/tap
brew install punk

# Verify installation
punk --version
# punk v1.0.0
```

**curl (Linux/macOS):**
```bash
curl -sSL https://punk.dev/install.sh | bash

# The script:
# 1. Detects OS and architecture
# 2. Downloads appropriate binary
# 3. Installs to /usr/local/bin
# 4. Makes executable
# 5. Verifies installation
```

**PowerShell (Windows):**
```powershell
iwr https://punk.dev/install.ps1 | iex

# The script:
# 1. Detects Windows architecture
# 2. Downloads punk-windows-amd64.exe
# 3. Installs to C:\Program Files\Punk\
# 4. Adds to PATH
# 5. Verifies installation
```

**Direct Download:**
```
https://github.com/punk-framework/punk/releases/latest

Assets:
  punk-darwin-amd64       (Mac Intel)
  punk-darwin-arm64       (Mac Apple Silicon)
  punk-linux-amd64        (Linux x64)
  punk-linux-arm64        (Linux ARM)
  punk-windows-amd64.exe  (Windows)
```

#### 5.5.3 Auto-Update

```bash
$ punk update

Checking for updates...

Current version: v1.0.0
Latest version:  v1.1.0

Changelog:
  • Added Firebase backend mod
  • Improved Synthpunk generation
  • Fixed Windows path issues
  • Updated dependencies

[y/N] Update now? y

Downloading v1.1.0...
████████████████████████████████████████ 100%

Installing...
✓ Updated to v1.1.0

$ punk --version
punk v1.1.0
```

---

## 6. Product 2: Mohawk

### 6.1 Overview

Mohawk is a **self-hostable web application** (similar to Bolt.new or Lovable.dev) that enables users to "vibe code" with AI to build full applications without sacrificing security or stability. Unlike the Punk CLI which scaffolds projects for developers to write code, Atompunk Web generates complete, working applications.

**Metaphor:** "The AI Architect with Guardrails"

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│              Mohawk                       │
├─────────────────────┬───────────────────────────────────┤
│                     │                                   │
│  Chat Interface     │  Live Preview                     │
│  (Left Panel)       │  (Right Panel)                    │
│                     │                                   │
│  💬 Natural         │  👁️ Real-time                     │
│     Language        │     Preview                       │
│     Prompts         │                                   │
│                     │  Working app                      │
│  🤖 AI              │  renders as AI                    │
│     Responses       │  generates                        │
│                     │                                   │
│  📊 Generation      │  🔄 Hot reload                    │
│     Progress        │                                   │
│                     │                                   │
└─────────────────────┴───────────────────────────────────┘
```

### 6.2 User Interface

#### 6.2.1 Main Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Mohawk            [New Project] [Deploy] [Settings]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────────────┬───────────────────────────────────┐  │
│ │  Chat                │  Live Preview                     │  │
│ │                      │                                   │  │
│ │ 💬 You:              │  ┌─────────────────────────────┐ │  │
│ │ Build a task manager │  │  📋 Task Manager            │ │  │
│ │ with auth            │  │  ───────────────────────    │ │  │
│ │                      │  │                             │ │  │
│ │ 🤖 Claude:           │  │  ┌─ Login ─────────────┐   │ │  │
│ │ I'll create:         │  │  │ Email: [          ] │   │ │  │
│ │ • Login page         │  │  │ Password: [       ] │   │ │  │
│ │ • Task list          │  │  │ [Sign In]           │   │ │  │
│ │ • Add task form      │  │  └─────────────────────┘   │ │  │
│ │                      │  │                             │ │  │
│ │ Generating...        │  │  Tasks (0)                  │ │  │
│ │ [████████░░] 80%     │  │  ─────────────              │ │  │
│ │                      │  │  No tasks yet. Add one!     │ │  │
│ │ [Send message]       │  │  [+ New Task]               │ │  │
│ │                      │  └─────────────────────────────┘ │  │
│ └──────────────────────┴───────────────────────────────────┘  │
│                                                                │
│ ┌──────────────────────┬───────────────────────────────────┐  │
│ │  Generated Code      │  Revision History                │  │
│ │                      │                                   │  │
│ │  frontend/           │  v3 (current) - Added auth       │  │
│ │  ├─ App.tsx          │  v2 - Added task form            │  │
│ │  ├─ Login.tsx        │  v1 - Initial structure          │  │
│ │  └─ TaskList.tsx     │                                   │  │
│ │                      │  [View] [Restore] [Compare]      │  │
│ │  backend/            │                                   │  │
│ │  ├─ auth.ts          │                                   │  │
│ │  └─ tasks.ts         │                                   │  │
│ └──────────────────────┴───────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

#### 6.2.2 Component Breakdown

**Top Bar:**
```typescript
// apps/atompunk-web/frontend/components/TopBar.tsx

export function TopBar() {
  const { project } = useProject()
  
  return (
    <div className="h-14 border-b flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Logo />
        <span className="font-semibold">{project.name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        
        <Button onClick={handleDeploy}>
          <Rocket className="w-4 h-4 mr-2" />
          Deploy
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Settings className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Project Settings</DropdownMenuItem>
            <DropdownMenuItem>Backend Config</DropdownMenuItem>
            <DropdownMenuItem>Mods</DropdownMenuItem>
            <DropdownMenuItem>Export Code</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
```

**Chat Panel:**
```typescript
// apps/atompunk-web/frontend/components/ChatPanel.tsx

export function ChatPanel() {
  const { messages, sendMessage, isGenerating } = useChat()
  const [input, setInput] = useState('')
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
            <Progress value={generationProgress} className="w-32" />
          </div>
        )}
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                handleSend()
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Press ⌘+Enter to send
        </div>
      </div>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="mb-4 flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
          {message.content}
        </div>
      </div>
    )
  }
  
  return (
    <div className="mb-4 flex gap-3">
      <Avatar className="w-8 h-8">
        <Bot className="w-5 h-5" />
      </Avatar>
      <div className="flex-1">
        <div className="prose prose-sm">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        {message.schema && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => previewSchema(message.schema)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Schema
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

**Live Preview Panel:**
```typescript
// apps/atompunk-web/frontend/components/PreviewPanel.tsx

export function PreviewPanel() {
  const { currentSchema, handlers } = usePreview()
  const [scale, setScale] = useState(1)
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Preview Controls */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant={device === 'desktop' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDevice('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDevice('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={device === 'mobile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDevice('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setScale(s => s - 0.1)}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setScale(s => s + 0.1)}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setScale(1)}>
            Reset
          </Button>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open
        </Button>
      </div>
      
      {/* Preview Iframe */}
      <div className="flex-1 overflow-auto bg-slate-100 p-4">
        <div 
          className={`mx-auto ${deviceSizes[device]} bg-white shadow-lg transition-all`}
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          {currentSchema ? (
            <PunkRenderer schema={currentSchema} handlers={handlers} />
          ) : (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <p>Start chatting to generate your app</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Code View Panel:**
```typescript
// apps/atompunk-web/frontend/components/CodeView.tsx

export function CodeView() {
  const { generatedFiles } = useGeneration()
  const [selectedFile, setSelectedFile] = useState<string>()
  
  return (
    <div className="flex h-full">
      {/* File Tree */}
      <div className="w-64 border-r">
        <div className="p-2 border-b font-semibold">Generated Code</div>
        <ScrollArea className="h-[calc(100%-40px)]">
          <FileTree
            files={generatedFiles}
            selected={selectedFile}
            onSelect={setSelectedFile}
          />
        </ScrollArea>
      </div>
      
      {/* Code Editor */}
      <div className="flex-1">
        {selectedFile ? (
          <CodeEditor
            file={generatedFiles[selectedFile]}
            readOnly
            language={getLanguageFromExtension(selectedFile)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  )
}

function FileTree({ files, selected, onSelect }) {
  const tree = buildTree(files)
  
  return (
    <div className="p-2">
      {Object.entries(tree).map(([name, node]) => (
        <FileTreeNode
          key={name}
          name={name}
          node={node}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
```

**Revision History Panel:**
```typescript
// apps/atompunk-web/frontend/components/RevisionHistory.tsx

export function RevisionHistory() {
  const { revisions, currentRevision, restoreRevision } = useRevisions()
  const [compareMode, setCompareMode] = useState(false)
  const [compareWith, setCompareWith] = useState<string>()
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex items-center justify-between">
        <span className="font-semibold">Revision History</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCompareMode(!compareMode)}
        >
          <GitCompare className="w-4 h-4 mr-2" />
          Compare
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {revisions.map((revision) => (
            <RevisionCard
              key={revision.id}
              revision={revision}
              isCurrent={revision.id === currentRevision}
              compareMode={compareMode}
              isCompareTarget={compareWith === revision.id}
              onRestore={() => restoreRevision(revision.id)}
              onCompare={() => setCompareWith(revision.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function RevisionCard({ revision, isCurrent, compareMode, onRestore, onCompare }) {
  return (
    <Card className={isCurrent ? 'border-primary' : ''}>
      <CardHeader className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              {isCurrent && <Badge variant="default">Current</Badge>}
              {revision.message}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {formatDistanceToNow(revision.createdAt, { addSuffix: true })}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onRestore}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Restore
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCompare}>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <div className="text-xs text-muted-foreground">
          <div>Files changed: {revision.filesChanged}</div>
          <div>Generated by: {revision.generatedBy}</div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 6.3 Backend Architecture

#### 6.3.1 API Structure

```
apps/atompunk-web/backend/
├── services/
│   ├── chat.ts              # Chat with AI
│   ├── generation.ts        # Generate schemas/code
│   ├── validation.ts        # Validate outputs
│   ├── preview.ts           # Live preview server
│   ├── deployment.ts        # Deploy apps
│   ├── revisions.ts         # Revision management
│   └── mods.ts            # Mod management
│
├── engine/
│   ├── epoch.ts             # Synthpunk AI engine
│   ├── atompunk.ts          # Atompunk full-stack engine
│   ├── context.ts           # Context management
│   └── optimizer.ts         # Schema optimization
│
├── templates/
│   ├── encore-ts/           # Encore.ts templates
│   ├── encore-go/           # Encore Go templates
│   ├── trpc/                # tRPC templates
│   └── supabase/            # Supabase templates (from mod)
│
└── db/
    ├── schema.ts            # Database schema
    └── migrations/          # Database migrations
```

#### 6.3.2 Chat Service Implementation

```typescript
// apps/atompunk-web/backend/services/chat.ts

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export interface ChatRequest {
  projectId: string
  message: string
  context?: ChatContext
}

export interface ChatContext {
  previousMessages: Message[]
  currentSchema?: PunkSchema
  projectConfig: ProjectConfig
  mods: string[]
}

export interface ChatResponse {
  message: string
  schema?: PunkSchema
  backendCode?: GeneratedCode
  suggestions?: string[]
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  // 1. Load context
  const context = await loadContext(req.projectId, req.context)
  
  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(context)
  
  // 3. Build messages
  const messages = buildMessages(req, context)
  
  // 4. Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages
  })
  
  // 5. Parse response
  const parsed = parseResponse(response)
  
  // 6. Validate schema if generated
  if (parsed.schema) {
    parsed.schema = validateSchema(parsed.schema)
  }
  
  // 7. Save to revision history
  await saveRevision(req.projectId, parsed)
  
  return parsed
}

function buildSystemPrompt(context: ChatContext): string {
  let prompt = `You are an AI assistant helping build applications using the Punk Framework.

# Punk Framework Rules

1. ALWAYS generate valid Punk Schemas (JSON format)
2. NEVER generate raw HTML/CSS/JavaScript
3. ENSURE all UI elements are accessible (ARIA labels, roles, keyboard navigation)
4. USE semantic component types (button, form, input, etc.)
5. FOLLOW the schema structure strictly

# Available Component Types

${getComponentTypes(context.mods)}

# Project Context

Project type: ${context.projectConfig.tier}
Backend: ${context.projectConfig.backend}
Loaded mods: ${context.mods.join(', ')}

# Current Schema

${context.currentSchema ? JSON.stringify(context.currentSchema, null, 2) : 'None yet'}

# Instructions

When the user asks you to build something:
1. Generate a valid Punk Schema
2. Ensure accessibility
3. Use appropriate components from available types
4. Return the schema in a code block marked with \`\`\`json

When generating backend code:
1. Use templates from the configured backend
2. Fill template parameters
3. Do NOT write raw SQL or arbitrary backend code
4. Return code in appropriate code blocks
`

  // Add mod-specific context
  for (const mod of context.mods) {
    prompt += `\n\n# Mod: ${mod}\n`
    prompt += await getModContext(mod)
  }
  
  return prompt
}

function buildMessages(req: ChatRequest, context: ChatContext): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = []
  
  // Add previous messages
  if (context.previousMessages) {
    for (const msg of context.previousMessages) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })
    }
  }
  
  // Add current message
  messages.push({
    role: 'user',
    content: req.message
  })
  
  return messages
}

function parseResponse(response: Anthropic.Message): ChatResponse {
  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }
  
  const text = content.text
  
  // Extract JSON schema from code blocks
  const schemaMatch = text.match(/```json\n([\s\S]+?)\n```/)
  let schema: PunkSchema | undefined
  
  if (schemaMatch) {
    try {
      schema = JSON.parse(schemaMatch[1])
    } catch (e) {
      console.error('Failed to parse schema:', e)
    }
  }
  
  // Extract backend code
  const backendMatch = text.match(/```typescript\n([\s\S]+?)\n```/)
  let backendCode: GeneratedCode | undefined
  
  if (backendMatch) {
    backendCode = {
      language: 'typescript',
      code: backendMatch[1]
    }
  }
  
  // Extract suggestions
  const suggestions = extractSuggestions(text)
  
  return {
    message: text,
    schema,
    backendCode,
    suggestions
  }
}

function validateSchema(schema: any): PunkSchema {
  // Validate with Zod
  const validated = PunkSchemaZod.parse(schema)
  
  // Additional validation
  validateAccessibility(validated)
  validateComponentTypes(validated)
  
  return validated
}

function validateAccessibility(schema: PunkSchema) {
  // Ensure forms have labels
  // Ensure buttons have aria-labels
  // Ensure proper heading hierarchy
  // etc.
}
```

#### 6.3.3 Generation Service

```typescript
// apps/atompunk-web/backend/services/generation.ts

import { EpochEngine } from '@punk/synthpunk'
import { AtompunkEngine } from '@punk/atompunk'

export interface GenerationRequest {
  projectId: string
  prompt: string
  tier: 'punk' | 'synthpunk' | 'atompunk'
  options: GenerationOptions
}

export interface GenerationOptions {
  backend?: string
  features?: Features
  mods?: string[]
}

export interface Features {
  auth?: AuthFeatures
  database?: DatabaseFeatures
  realtime?: boolean
  storage?: boolean
}

export interface GenerationResult {
  frontend: PunkSchema
  backend?: GeneratedBackend
  database?: DatabaseSchema
  deployment?: DeploymentConfig
}

export async function generate(req: GenerationRequest): Promise<GenerationResult> {
  switch (req.tier) {
    case 'punk':
      return generatePunk(req)
    case 'synthpunk':
      return generateSynthpunk(req)
    case 'atompunk':
      return generateAtompunk(req)
  }
}

async function generateSynthpunk(req: GenerationRequest): Promise<GenerationResult> {
  const epoch = new EpochEngine({
    model: 'claude-sonnet-4-20250514'
  })
  
  // Load context from mods
  const context = await loadModContext(req.options.mods || [])
  
  // Generate schema
  const schema = await epoch.generate({
    prompt: req.prompt,
    context,
    constraints: {
      maxNodeCount: 500,
      requiredComponents: inferRequiredComponents(req.prompt)
    }
  })
  
  // Validate
  const validated = PunkSchemaZod.parse(schema)
  
  // Save revision
  await saveRevision(req.projectId, {
    type: 'frontend',
    schema: validated,
    message: `Generated from: ${req.prompt}`,
    generatedBy: 'ai'
  })
  
  return {
    frontend: validated
  }
}

async function generateAtompunk(req: GenerationRequest): Promise<GenerationResult> {
  const atompunk = new AtompunkEngine({
    model: 'claude-sonnet-4-20250514',
    backend: req.options.backend || 'encore-ts'
  })
  
  // Load mods
  const mods = await loadMods(req.options.mods || [])
  
  // Get backend adapter (from core or mod)
  const backendAdapter = getBackendAdapter(req.options.backend!, mods)
  
  // Generate full-stack
  const result = await atompunk.generateFullStack({
    prompt: req.prompt,
    features: req.options.features,
    backendAdapter,
    mods
  })
  
  // Validate all outputs
  result.frontend = PunkSchemaZod.parse(result.frontend)
  result.backend = validateBackendCode(result.backend)
  
  // Save revisions
  await saveRevision(req.projectId, {
    type: 'fullstack',
    frontend: result.frontend,
    backend: result.backend,
    database: result.database,
    message: `Generated full-stack from: ${req.prompt}`,
    generatedBy: 'ai'
  })
  
  return result
}

function getBackendAdapter(backendName: string, mods: Mod[]): BackendAdapter {
  // Check core adapters
  const coreAdapters = {
    'encore-ts': EncoreTsAdapter,
    'encore-go': EncoreGoAdapter,
    'trpc': TrpcAdapter
  }
  
  if (coreAdapters[backendName]) {
    return new coreAdapters[backendName]()
  }
  
  // Check mod adapters
  for (const mod of mods) {
    if (mod.extends === 'backend_adapter' && mod.name === backendName) {
      return createModAdapter(mod)
    }
  }
  
  throw new Error(`Backend adapter '${backendName}' not found`)
}

function createModAdapter(mod: Mod): BackendAdapter {
  return {
    name: mod.name,
    generate: async (params) => {
      // Execute mod's generation script
      return await mod.execute('/scripts/generate.js', params)
    },
    validate: async (code) => {
      return await mod.execute('/scripts/validate.js', code)
    }
  }
}
```

### 6.4 Deployment System

```typescript
// apps/atompunk-web/backend/services/deployment.ts

export interface DeploymentRequest {
  projectId: string
  target: 'vercel' | 'netlify' | 'cloudflare' | 'docker'
  config?: DeploymentConfig
}

export interface DeploymentResult {
  url: string
  status: 'success' | 'failed'
  logs: string[]
  deploymentId: string
}

export async function deploy(req: DeploymentRequest): Promise<DeploymentResult> {
  // 1. Get project files
  const files = await getProjectFiles(req.projectId)
  
  // 2. Build project
  const built = await buildProject(files)
  
  // 3. Deploy to target
  switch (req.target) {
    case 'vercel':
      return deployToVercel(built, req.config)
    case 'netlify':
      return deployToNetlify(built, req.config)
    case 'cloudflare':
      return deployToCloudflare(built, req.config)
    case 'docker':
      return deployToDocker(built, req.config)
  }
}

async function deployToVercel(files: ProjectFiles, config?: DeploymentConfig) {
  // Use Vercel API to deploy
  const vercel = new VercelClient(process.env.VERCEL_TOKEN)
  
  const deployment = await vercel.deployments.create({
    name: config?.name || `punk-${Date.now()}`,
    files: convertToVercelFiles(files),
    projectSettings: {
      framework: 'vite',
      buildCommand: 'npm run build',
      outputDirectory: 'dist'
    },
    env: config?.env || {}
  })
  
  return {
    url: deployment.url,
    status: 'success',
    logs: deployment.buildLogs,
    deploymentId: deployment.id
  }
}
```

### 6.5 Self-Hosting Setup

#### 6.5.1 Docker Compose

```yaml
# apps/atompunk-web/docker-compose.yml

version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://punk:punk@db:5432/atompunk
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=punk
      - POSTGRES_PASSWORD=punk
      - POSTGRES_DB=atompunk
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 6.5.2 Installation Script

```bash
#!/bin/bash
# apps/atompunk-web/install.sh

echo "Installing Mohawk..."

# 1. Check prerequisites
command -v docker >/dev/null 2>&1 || {
  echo "Docker is required but not installed. Aborting."
  exit 1
}

command -v docker-compose >/dev/null 2>&1 || {
  echo "Docker Compose is required but not installed. Aborting."
  exit 1
}

# 2. Clone repository
git clone https://github.com/punk-framework/atompunk-web.git
cd atompunk-web

# 3. Setup environment
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
ANTHROPIC_API_KEY=your-api-key-here
JWT_SECRET=$(openssl rand -base64 32)
EOF
  
  echo ""
  echo "⚠️  Please edit .env and add your Anthropic API key"
  echo ""
  read -p "Press enter when ready..."
fi

# 4. Build and start
echo "Building and starting services..."
docker-compose up -d

# 5. Wait for services
echo "Waiting for services to be ready..."
sleep 10

# 6. Run migrations
echo "Running database migrations..."
docker-compose exec backend npm run migrate

# 7. Done
echo ""
echo "✓ Mohawk is running!"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"
```

---

## 7. Colorful Terminal UI Design

### 7.1 Theme System Architecture

```go
// tools/cli/themes/theme.go
package themes

import (
    "github.com/charmbracelet/lipgloss"
)

type Theme struct {
    Name        string
    Description string
    
    // 24-bit RGB Colors
    Primary     lipgloss.Color
    Secondary   lipgloss.Color
    Accent      lipgloss.Color
    Success     lipgloss.Color
    Warning     lipgloss.Color
    Error       lipgloss.Color
    Muted       lipgloss.Color
    Background  lipgloss.Color
    Foreground  lipgloss.Color
    
    // Styles
    Title       lipgloss.Style
    Subtitle    lipgloss.Style
    Highlight   lipgloss.Style
    Selected    lipgloss.Style
    Unselected  lipgloss.Style
    Border      lipgloss.Style
    Code        lipgloss.Style
    
    // ASCII Art
    Banner      string
    Logo        string
    Separator   string
    
    // Bullets
    Bullets     BulletSet
    
    // Animation
    SpinnerStyle lipgloss.Style
    SpinnerType  string
    
    // Effects
    Glitch      bool
    Rainbow     bool
    Gradient    bool
}

type BulletSet struct {
    Selected   string
    Unselected string
    Done       string
    Error      string
    Info       string
}

// Global theme registry
var themes = map[string]*Theme{
    "punk":       PunkTheme(),
    "synthpunk":  SynthpunkTheme(),
    "atompunk":   AtompunkTheme(),
    "solarpunk":  SolarpunkTheme(),
}

func Get(name string) *Theme {
    if theme, ok := themes[name]; ok {
        return theme
    }
    return PunkTheme() // Default
}

func List() []string {
    names := make([]string, 0, len(themes))
    for name := range themes {
        names = append(names, name)
    }
    return names
}
```

### 7.2 Color Utilities

```go
// tools/cli/themes/colors.go
package themes

import (
    "fmt"
    "math"
    
    "github.com/charmbracelet/lipgloss"
)

// RGB creates a color from RGB values
func RGB(r, g, b int) lipgloss.Color {
    return lipgloss.Color(fmt.Sprintf("#%02x%02x%02x", r, g, b))
}

// HSL creates a color from HSL values
func HSL(h, s, l float64) lipgloss.Color {
    c := (1 - math.Abs(2*l-1)) * s
    x := c * (1 - math.Abs(math.Mod(h/60, 2)-1))
    m := l - c/2
    
    var r, g, b float64
    switch {
    case h < 60:
        r, g, b = c, x, 0
    case h < 120:
        r, g, b = x, c, 0
    case h < 180:
        r, g, b = 0, c, x
    case h < 240:
        r, g, b = 0, x, c
    case h < 300:
        r, g, b = x, 0, c
    default:
        r, g, b = c, 0, x
    }
    
    return RGB(
        int((r+m)*255),
        int((g+m)*255),
        int((b+m)*255),
    )
}

// Interpolate between two colors
func Interpolate(c1, c2 lipgloss.Color, t float64) lipgloss.Color {
    r1, g1, b1 := hexToRGB(string(c1))
    r2, g2, b2 := hexToRGB(string(c2))
    
    r := int(float64(r1)*(1-t) + float64(r2)*t)
    g := int(float64(g1)*(1-t) + float64(g2)*t)
    b := int(float64(b1)*(1-t) + float64(b2)*t)
    
    return RGB(r, g, b)
}

// Rainbow generator
type Rainbow struct {
    offset float64
    speed  float64
}

func NewRainbow(speed float64) *Rainbow {
    return &Rainbow{offset: 0, speed: speed}
}

func (r *Rainbow) Next() lipgloss.Color {
    r.offset += r.speed
    if r.offset >= 360 {
        r.offset = 0
    }
    return HSL(r.offset, 1.0, 0.5)
}

func (r *Rainbow) ColorAt(position float64) lipgloss.Color {
    hue := math.Mod(r.offset+(position*360), 360)
    return HSL(hue, 1.0, 0.5)
}
```

(Continued with remaining sections...)
