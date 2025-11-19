# Punk Framework

<div align="center">

```
██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗
██╔══██╗██║   ██║████╗  ██║██║ ██╔╝
██████╔╝██║   ██║██╔██╗ ██║█████╔╝
██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗
██║     ╚██████╔╝██║ ╚████║██║  ██╗
╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
```

### Build Fast. Break Norms. Ship Code. 🎸

[![Build Status](https://img.shields.io/github/actions/workflow/status/punk-framework/punk/ci.yml?branch=main)](https://github.com/punk-framework/punk/actions)
[![Version](https://img.shields.io/npm/v/@punk/core)](https://www.npmjs.com/package/@punk/core)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/1234567890?color=7389D8&label=discord)](https://discord.gg/punk)
[![Twitter Follow](https://img.shields.io/twitter/follow/punkframework?style=social)](https://twitter.com/punkframework)

[Quick Start](#quick-start) • [Documentation](https://docs.punk.dev) • [Discord](https://discord.gg/punk) • [Examples](docs/examples)

</div>

---

## What is Punk?

Punk is an **AI-powered development platform** that generates **guaranteed accessible, secure, and working applications** by constraining AI within deterministic frameworks instead of letting it generate raw code.

### The Problem with Traditional AI Tools

Current AI development tools (v0.dev, Bolt.new, Lovable.dev) operate on **probabilistic code generation**:
- AI generates raw HTML/CSS/JS as a "best guess"
- Often produces **inaccessible** UIs (missing ARIA labels, keyboard navigation)
- Frequently creates **security vulnerabilities** (SQL injection, XSS, CSRF)
- Results in **inconsistent patterns** that are hard to maintain
- Requires developers to **audit and fix** every generated line

### The Punk Solution: Constrained Creativity

Punk applies **"Punk Pragmatism"** - the philosophy that AI must work within validated rules:

```
Traditional AI Tools:              Punk Framework:
───────────────────               ───────────────
  Prompt                            Prompt
     ↓                                 ↓
  Raw Code ❌                      JSON Schema ✅
     ↓                                 ↓
  "Best Guess"                     Zod Validation
     ↓                                 ↓
  Maybe Works                      Deterministic Renderer
     ↓                                 ↓
  Audit Required                   Guaranteed Accessible UI
```

**Frontend:** AI generates validated JSON schemas → Deterministic React rendering
**Backend:** AI fills sandboxed templates → Vetted, secure code patterns
**Result:** 100% accessible, type-safe, production-ready applications

---

## Why Punk?

### ✅ Guaranteed Accessibility
Every UI meets **WCAG 2.1 Level AA** standards out of the box
- ARIA labels on all interactive elements
- Keyboard navigation included
- Screen reader compatible
- Focus management handled

### 🔒 Security by Default
Templates are peer-reviewed and include:
- Input validation with Zod
- CSRF protection
- Rate limiting
- SQL injection prevention
- XSS protection

### 🎯 Deterministic Outputs
Same schema = same result, every time
- Predictable rendering
- Easy debugging
- Safe regeneration
- Consistent patterns

### 🚀 Developer Experience
Beautiful, colorful CLI built with Go + Charm
- Interactive TUI
- Live reload
- Template composition
- Skill system

### 🧩 Extensible Architecture
Modular skill system via GlyphCase
- Portable plugins (.gcasex files)
- Community marketplace
- Custom integrations
- Self-contained dependencies

---

## Quick Start

### Install Punk CLI

```bash
# macOS/Linux
curl -fsSL https://punk.dev/install.sh | sh

# Windows
iwr https://punk.dev/install.ps1 -useb | iex

# npm (all platforms)
npm install -g @punk/cli

# Verify installation
punk --version
```

### Create Your First App

```bash
# Interactive project creation
punk create

# Or specify options directly
punk create my-app --tier synthpunk --backend encore-ts
```

Follow the prompts to choose:
- **Tier** (Punk / Synthpunk / Atompunk)
- **Backend** (None / Encore / tRPC / GlyphCase)
- **Skills** (Optional extensions)

### Start Development

```bash
cd my-app
npm install
punk dev
```

Visit `http://localhost:3000` to see your app!

### Generate with AI (Synthpunk/Atompunk)

```typescript
import { EpochEngine } from '@punk/synthpunk'

const epoch = new EpochEngine({
  model: 'claude-sonnet-4-20250514',
  apiKey: process.env.ANTHROPIC_API_KEY
})

const schema = await epoch.generate({
  prompt: "Create a task manager with add, delete, and complete actions",
  context: []
})

// Schema is automatically validated and ready to render
<PunkRenderer schema={schema} />
```

---

## Architecture Overview

### The Three Tiers

Punk is organized into three progressive tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                        ATOMPUNK (Tier 3)                    │
│              Full-Stack AI Generation ($99/mo)              │
│  • Backend code generation    • Database schemas            │
│  • Auth scaffolding           • Deployment config           │
├─────────────────────────────────────────────────────────────┤
│                       SYNTHPUNK (Tier 2)                    │
│               AI-Powered UI Generation ($29/mo)             │
│  • Epoch AI engine            • Revision history            │
│  • Natural language → schemas • Context management          │
├─────────────────────────────────────────────────────────────┤
│                         PUNK (Tier 1)                       │
│                  Deterministic Rendering (Free)             │
│  • Schema → React renderer    • Zod validation              │
│  • Type safety                • Accessibility               │
└─────────────────────────────────────────────────────────────┘
```

### Two Products

**1. Punk CLI** (For Developers)
- Beautiful terminal interface
- Scaffolds projects with best practices
- Template composition system
- Skill management
- Built with Go + Charm

**2. Mohawk** (For Builders)
- Web-based (SaaS or self-hosted)
- Chat with AI to build apps
- Live preview
- Deploy directly
- Like Bolt.new, but safer

### Technology Stack

**Foundation:**
- **Puck** - React rendering core
- **Radix UI (Pink)** - Accessible components
- **Zod** - Schema validation
- **TokiForge** - Type generation
- **React** - UI framework

**AI Engine:**
- **Epoch** - AI generation engine
- **Claude Sonnet 4** - Language model
- **Template system** - Backend constraints

**CLI:**
- **Go** - CLI implementation
- **Bubble Tea** - TUI framework
- **Lip Gloss** - Terminal styling
- **Charm** - Beautiful components

**Backend Options:**
- **Encore.ts** - TypeScript declarative backend
- **tRPC** - End-to-end type safety
- **GlyphCase** - Local-first SQLite
- **Manifest** - YAML-based backend

---

## Documentation

### Getting Started
- [Getting Started Guide](GETTING_STARTED.md) - Step-by-step tutorial
- [CLI Reference](CLI_REFERENCE.md) - All CLI commands
- [Builder Guide](BUILDER_GUIDE.md) - Using Atompunk Web

### Architecture & Philosophy
- [Architecture](ARCHITECTURE.md) - Technical deep dive
- [Philosophy](PHILOSOPHY.md) - Punk Pragmatism explained
- [Component Reference](COMPONENT_REFERENCE.md) - Available components

### Guides
- [Backend Guide](BACKEND_GUIDE.md) - Backend options & setup
- [Skills Guide](SKILLS_GUIDE.md) - Creating & using skills
- [Contributing](CONTRIBUTING.md) - How to contribute

### Examples
- [Hello World](docs/examples/hello-world) - Minimal example
- [Todo App](docs/examples/todo-app) - Classic todo with Synthpunk
- [Dashboard](docs/examples/dashboard) - Data visualization
- [E-commerce](docs/examples/e-commerce) - Full shopping cart
- [SaaS App](docs/examples/saas-app) - Complete SaaS with auth

---

## Comparison with Alternatives

| Feature | Punk | v0.dev | Bolt.new | Lovable |
|---------|------|--------|----------|---------|
| **Generation Method** | Validated schemas | Raw code | Raw code | Raw code |
| **Accessibility** | Guaranteed WCAG AA | Manual fixes | Manual fixes | Manual fixes |
| **Type Safety** | 100% type-safe | Varies | Varies | Varies |
| **Determinism** | Same input = same output | Non-deterministic | Non-deterministic | Non-deterministic |
| **Security** | Template-based, vetted | Must audit | Must audit | Must audit |
| **Backend** | Multiple options | Limited | Limited | Supabase only |
| **Self-Hosting** | ✅ | ❌ | ❌ | ❌ |
| **CLI Tool** | ✅ Beautiful TUI | ❌ | ❌ | ❌ |
| **Open Source** | ✅ MIT | ❌ | ❌ | ❌ |
| **Extensibility** | Skills system | ❌ | ❌ | ❌ |

---

## Features

### 🎨 Schema-Based UI Generation
```json
{
  "type": "button",
  "props": {
    "variant": "primary",
    "onClick": "handleSubmit",
    "children": "Submit Form",
    "aria-label": "Submit the registration form"
  }
}
```
Schemas are validated, type-safe, and render deterministically to accessible React components.

### 🛡️ Template-Based Backend
```typescript
// AI selects and fills this template
authEndpoint({
  provider: "email",
  features: ["oauth", "2fa"],
  sessionType: "jwt"
})
```
Templates are peer-reviewed, security-hardened, and prevent common vulnerabilities.

### 🧩 Skill System
```bash
punk add skill supabase-backend
punk add skill docx-generator
punk add skill pdf-processor
```
Portable plugins packaged as GlyphCase (.gcasex) files with scripts and knowledge.

### 🎸 Beautiful CLI
Colorful, animated terminal UI with multiple themes:
- **Punk** - Classic punk rock (hot pink, electric blue)
- **Synthpunk** - Synthwave vibes (cyan, magenta, purple)
- **Atompunk** - Retro-futuristic (orange, teal, cream)
- **Solarpunk** - Eco-optimism (green, gold, earth tones)

### 🔄 Revision History
Every AI generation is versioned:
```bash
v1 - Initial structure
v2 - Added task form
v3 - Added authentication
```
Compare, restore, or fork any version.

### 📦 Multiple Backend Options
- **None** - Static site, no backend
- **Encore.ts** - Infrastructure from code
- **Encore** - Go backend, high performance
- **tRPC** - End-to-end type safety
- **GlyphCase** - Local SQLite database
- **Manifest** - Declarative YAML backend

---

## Example: Building a Task Manager

### 1. Create Project
```bash
punk create task-manager --tier synthpunk --backend encore-ts
cd task-manager
npm install
```

### 2. Generate UI with AI
```typescript
import { EpochEngine } from '@punk/synthpunk'

const schema = await epoch.generate({
  prompt: `Create a task manager with:
  - Add task form (title, description)
  - Task list with checkboxes
  - Delete button per task
  - Filter: All, Active, Completed`
})
```

### 3. Render UI
```typescript
import { PunkRenderer } from '@punk/core'

function App() {
  return <PunkRenderer
    schema={schema}
    handlers={handlers}
    context={taskContext}
  />
}
```

### 4. Add Backend (Atompunk)
```typescript
const backend = await atompunk.generateBackend({
  prompt: "Add PostgreSQL persistence for tasks with CRUD operations",
  backend: "encore-ts"
})
```

### 5. Run & Deploy
```bash
# Development
punk dev

# Build
punk build

# Deploy
punk deploy
```

---

## Community & Support

### Get Help
- **Documentation:** [https://docs.punk.dev](https://docs.punk.dev)
- **Discord:** [https://discord.gg/punk](https://discord.gg/punk)
- **GitHub Discussions:** [Discussions](https://github.com/punk-framework/punk/discussions)
- **Stack Overflow:** Tag `punk-framework`

### Stay Updated
- **Twitter:** [@punkframework](https://twitter.com/punkframework)
- **Blog:** [https://punk.dev/blog](https://punk.dev/blog)
- **Newsletter:** [Subscribe](https://punk.dev/newsletter)

### Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Submitting issues
- Creating pull requests
- Coding standards

### Skill Marketplace
Browse and publish skills at [https://skills.punk.dev](https://skills.punk.dev)

---

## Roadmap

### v1.0 (Current)
- ✅ Punk CLI with beautiful TUI
- ✅ Schema-based rendering (@punk/core)
- ✅ AI generation (Synthpunk)
- ✅ Backend templates (Atompunk)
- ✅ GlyphCase skill system
- ✅ Multiple backend adapters

### v1.1 (Q1 2026)
- 🔲 Mohawk (SaaS)
- 🔲 Visual schema editor
- 🔲 Real-time collaboration
- 🔲 One-click deployment
- 🔲 Skill marketplace launch

### v1.2 (Q2 2026)
- 🔲 Mobile app support (React Native)
- 🔲 Desktop app support (Tauri)
- 🔲 Advanced AI context management
- 🔲 Team collaboration features
- 🔲 Enterprise SSO

### v2.0 (Q3 2026)
- 🔲 Multi-model AI support
- 🔲 Visual programming interface
- 🔲 Database query builder
- 🔲 API documentation generator
- 🔲 Testing automation

---

## License

Punk Framework is **MIT licensed**. See [LICENSE](LICENSE) for details.

### What This Means
- ✅ Use in personal projects (free forever)
- ✅ Use in commercial products
- ✅ Modify and distribute
- ✅ Private use
- ❌ No warranty provided

### Pricing

**Punk (Tier 1):** Free forever
**Synthpunk (Tier 2):** $29/month
**Atompunk (Tier 3):** $99/month (individuals), $299/month (teams)
**Enterprise:** Custom pricing

All tiers include unlimited projects and commercial use rights.

---

## Acknowledgments

Punk is built on the shoulders of giants:

- **Radix UI** - Accessible component primitives
- **Zod** - TypeScript-first schema validation
- **Anthropic** - Claude AI model
- **Charm** - Beautiful CLI tools
- **Encore** - Backend framework
- **The Open Source Community** - For making this possible

Special thanks to all our [contributors](https://github.com/punk-framework/punk/graphs/contributors).

---

<div align="center">

**Build Fast. Break Norms. Ship Code.** 🎸

Made with ⚡ by the Punk Framework team

[Website](https://punk.dev) • [Docs](https://docs.punk.dev) • [Discord](https://discord.gg/punk) • [Twitter](https://twitter.com/punkframework)

</div>
