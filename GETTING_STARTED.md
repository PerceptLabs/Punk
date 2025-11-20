# Getting Started with Punk

Your step-by-step guide to building your first Punk application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Creating Your First Project](#creating-your-first-project)
4. [Understanding the Project Structure](#understanding-the-project-structure)
5. [Running the Development Server](#running-the-development-server)
6. [Your First Schema](#your-first-schema)
7. [Adding Interactivity](#adding-interactivity)
8. [Using AI Generation (Synthpunk)](#using-ai-generation-synthpunk)
9. [Adding a Backend (Atompunk)](#adding-a-backend-atompunk)
10. [Building for Production](#building-for-production)
11. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm, yarn, pnpm, or bun** (package manager)
- **Git** (for version control)
- A **code editor** (VS Code recommended)
- Basic knowledge of **JavaScript/TypeScript** and **React**

Optional:
- **Anthropic API key** (for Synthpunk/Atompunk AI features)
- **Docker** (for running Atompunk Web Builder locally)

### Check Your Environment

```bash
# Check Node.js version
node --version
# Should be v18.0.0 or higher

# Check npm version
npm --version
# Should be 9.0.0 or higher

# Check Git
git --version
```

---

## Installation

### Option 1: Install Punk CLI (Recommended)

```bash
# macOS/Linux (via curl)
curl -fsSL https://punk.dev/install.sh | sh

# macOS/Linux (via wget)
wget -qO- https://punk.dev/install.sh | sh

# Windows (PowerShell)
iwr https://punk.dev/install.ps1 -useb | iex

# Verify installation
punk --version
```

### Option 2: Install via npm

```bash
# Install globally
npm install -g @punk/cli

# Or use npx (no installation)
npx @punk/cli create my-app
```

### Option 3: Install via Homebrew (macOS)

```bash
brew tap punk-framework/tap
brew install punk
```

---

## Creating Your First Project

### Interactive Creation

The easiest way to create a project is with the interactive CLI:

```bash
punk create
```

You'll be greeted with a beautiful terminal interface:

```
╔═══════════════════════════════════════════════════════════╗
║   ██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗                   ║
║   ██╔══██╗██║   ██║████╗  ██║██║ ██╔╝                   ║
║   ██████╔╝██║   ██║██╔██╗ ██║█████╔╝                    ║
║   ██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗                    ║
║   ██║     ╚██████╔╝██║ ╚████║██║  ██╗                   ║
║   ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝                   ║
║                                                           ║
║        BUILD FAST. BREAK RULES. SHIP CODE. 🎸            ║
╚═══════════════════════════════════════════════════════════╝
```

Follow the prompts to configure your project:

1. **Project name:** `my-first-app`
2. **Tier:** Start with `Punk` (free, render-only)
3. **Backend:** Choose `None` for now
4. **Package manager:** Select your preference (npm, yarn, pnpm, bun)
5. **Git:** Enable git initialization
6. **Examples:** Include example files

### Non-Interactive Creation

If you prefer command-line flags:

```bash
punk create my-first-app \
  --tier punk \
  --backend none \
  --package-manager npm \
  --git \
  --examples
```

### What Gets Created

```
my-first-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   ├── schemas/         # Punk schemas
│   │   │   └── example.json # Example schema
│   │   ├── components/      # Custom React components
│   │   └── lib/            # Utilities
│   │       └── punk.ts     # Punk renderer setup
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── punk.config.js           # Punk configuration
├── .gitignore
└── README.md
```

---

## Understanding the Project Structure

### Frontend Structure

```typescript
// frontend/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```typescript
// frontend/src/App.tsx
import { PunkRenderer } from '@punk/core'
import schema from './schemas/example.json'

function App() {
  const handlers = {
    handleClick: () => {
      console.log('Button clicked!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PunkRenderer schema={schema} handlers={handlers} />
    </div>
  )
}

export default App
```

### Punk Configuration

```javascript
// punk.config.js
export default {
  tier: 'punk',        // Current tier (punk, synthpunk, atompunk)
  backend: 'none',     // Backend adapter
  skills: [],          // Installed skills
  theme: 'punk',       // CLI theme
}
```

---

## Running the Development Server

### Start Development

```bash
cd my-first-app
npm install
punk dev
```

You'll see:

```
╔═══════════════════════════════════════════════════════════╗
║  🎸 Punk Development Server                               ║
╚═══════════════════════════════════════════════════════════╝

Services:
  ● Frontend    http://localhost:3000

Logs:
  [11:23:45] [Frontend] ✓ Vite dev server running
  [11:23:46] [Frontend] ✓ Ready in 1.2s

Press h for help, r to restart, q to quit
```

### Open in Browser

Visit `http://localhost:3000` to see your app!

### Development Commands

While `punk dev` is running:

| Key | Action |
|-----|--------|
| `h` | Show help menu |
| `r` | Restart all services |
| `c` | Clear console |
| `o` | Open in browser |
| `l` | Show service URLs |
| `q` | Quit |

---

## Your First Schema

Let's create a simple "Hello World" schema.

### Create a Schema File

```json
// frontend/src/schemas/hello.json
{
  "type": "container",
  "props": {
    "className": "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
  },
  "children": [
    {
      "type": "container",
      "props": {
        "className": "bg-white rounded-lg shadow-2xl p-12 max-w-md"
      },
      "children": [
        {
          "type": "heading",
          "props": {
            "level": 1,
            "className": "text-4xl font-bold text-gray-900 mb-4",
            "children": "Hello, Punk! 🎸"
          }
        },
        {
          "type": "text",
          "props": {
            "className": "text-gray-600 mb-6",
            "children": "Welcome to schema-based development. This UI is guaranteed accessible, type-safe, and deterministic."
          }
        },
        {
          "type": "button",
          "props": {
            "variant": "primary",
            "onClick": "handleSayHello",
            "className": "w-full",
            "aria-label": "Say hello",
            "children": "Say Hello"
          }
        }
      ]
    }
  ]
}
```

### Render the Schema

```typescript
// frontend/src/App.tsx
import { PunkRenderer } from '@punk/core'
import helloSchema from './schemas/hello.json'

function App() {
  const handlers = {
    handleSayHello: () => {
      alert('Hello from Punk!')
    }
  }

  return <PunkRenderer schema={helloSchema} handlers={handlers} />
}

export default App
```

### What You Get

- ✅ **Accessible:** ARIA labels, keyboard navigation
- ✅ **Type-safe:** Schema validated on load
- ✅ **Responsive:** Tailwind CSS classes
- ✅ **Interactive:** Click handler works
- ✅ **Deterministic:** Always renders the same

---

## Adding Interactivity

### Using DataContext for State

```typescript
// frontend/src/App.tsx
import { PunkRenderer, createDataContext } from '@punk/core'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  const context = {
    count,
    incrementCount: () => setCount(c => c + 1),
    decrementCount: () => setCount(c => c - 1),
  }

  const handlers = {
    handleIncrement: context.incrementCount,
    handleDecrement: context.decrementCount,
  }

  return <PunkRenderer
    schema={counterSchema}
    handlers={handlers}
    context={context}
  />
}
```

### Counter Schema

```json
// frontend/src/schemas/counter.json
{
  "type": "container",
  "props": {
    "className": "p-6 bg-white rounded-lg shadow-md"
  },
  "children": [
    {
      "type": "heading",
      "props": {
        "level": 2,
        "children": "Counter: {{count}}"
      }
    },
    {
      "type": "container",
      "props": {
        "className": "flex gap-4 mt-4"
      },
      "children": [
        {
          "type": "button",
          "props": {
            "onClick": "handleDecrement",
            "aria-label": "Decrement counter",
            "children": "−"
          }
        },
        {
          "type": "button",
          "props": {
            "onClick": "handleIncrement",
            "aria-label": "Increment counter",
            "children": "+"
          }
        }
      ]
    }
  ]
}
```

Note the `{{count}}` template interpolation!

---

## Using AI Generation (Synthpunk)

### Upgrade to Synthpunk

```bash
punk upgrade synthpunk
```

This will:
1. Install `@punk/synthpunk` package
2. Update `punk.config.js`
3. Add example AI generation code
4. Set up Anthropic SDK

### Configure API Key

```bash
# Add to .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

### Generate a Schema with AI

```typescript
// frontend/src/lib/generation.ts
import { EpochEngine } from '@punk/synthpunk'

export const epoch = new EpochEngine({
  model: 'claude-sonnet-4-20250514',
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY
})

export async function generateSchema(prompt: string) {
  return await epoch.generate({
    prompt,
    context: [],
    constraints: {
      maxNodeCount: 50,
    }
  })
}
```

### Use in Your App

```typescript
// frontend/src/App.tsx
import { useState } from 'react'
import { PunkRenderer } from '@punk/core'
import { generateSchema } from './lib/generation'

function App() {
  const [schema, setSchema] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateSchema(prompt)
      setSchema(result.schema)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Synthpunk Generator</h1>

        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the UI you want..."
            className="w-full h-32 p-4 border rounded-lg"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {schema && (
          <div className="border rounded-lg p-6">
            <PunkRenderer schema={schema} handlers={{}} />
          </div>
        )}
      </div>
    </div>
  )
}
```

### Try It Out

Prompts to try:
- "Create a login form with email and password"
- "Build a product card with image, title, price, and buy button"
- "Make a todo list with add and delete functionality"
- "Design a pricing table with three tiers"

---

## Adding a Backend (Atompunk)

### Upgrade to Atompunk

```bash
punk upgrade atompunk
```

### Choose a Backend

```bash
punk add backend encore-ts
```

This creates:
```
backend/
├── services/
│   └── hello.ts          # Example API endpoint
├── encore.app            # Encore configuration
└── package.json
```

### Example API Endpoint

```typescript
// backend/services/hello.ts
import { api } from "encore.dev/api"

interface HelloRequest {
  name: string
}

interface HelloResponse {
  message: string
}

export const hello = api(
  { method: "POST", path: "/hello", auth: false },
  async (req: HelloRequest): Promise<HelloResponse> => {
    return {
      message: `Hello, ${req.name}! 🎸`
    }
  }
)
```

### Call from Frontend

```typescript
// frontend/src/lib/api.ts
export async function callHello(name: string) {
  const response = await fetch('http://localhost:4000/hello', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  })
  return await response.json()
}
```

### Run Both Frontend & Backend

```bash
punk dev
```

Now runs:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:4000`

---

## Building for Production

### Build All Services

```bash
punk build
```

This creates:
```
dist/
├── frontend/        # Static files
└── backend/         # Compiled backend
```

### Test Production Build

```bash
punk preview
```

### Deploy

See [deployment docs](https://docs.punk.dev/deployment) for:
- Vercel (frontend)
- Encore Cloud (backend)
- Netlify
- AWS
- Docker

---

## Next Steps

### Learn More

- **[CLI Reference](CLI_REFERENCE.md)** - All CLI commands
- **[Component Reference](COMPONENT_REFERENCE.md)** - Available components
- **[Backend Guide](BACKEND_GUIDE.md)** - Backend options
- **[Skills Guide](SKILLS_GUIDE.md)** - Extending Punk

### Explore Examples

- [Todo App](docs/examples/todo-app) - Classic todo with Synthpunk
- [Dashboard](docs/examples/dashboard) - Data visualization
- [E-commerce](docs/examples/e-commerce) - Shopping cart
- [SaaS App](docs/examples/saas-app) - Full app with auth

### Join the Community

- **Discord:** [discord.gg/punk](https://discord.gg/punk)
- **GitHub:** [github.com/punk-framework/punk](https://github.com/punk-framework/punk)
- **Twitter:** [@punkframework](https://twitter.com/punkframework)

### Pro Tips

1. **Start small:** Begin with Punk (Tier 1), upgrade as needed
2. **Use examples:** Copy from `examples/` folder
3. **Validate schemas:** Use online JSON schema validators
4. **Hot reload:** Schemas update instantly during dev
5. **Type safety:** Enable TypeScript strict mode
6. **Accessibility:** Test with screen readers
7. **Version control:** Commit schemas separately from code

---

**You're now ready to Build Fast, Break Norms, and Ship Code!** 🎸

[Back to README](README.md) • [Next: CLI Reference](CLI_REFERENCE.md)
