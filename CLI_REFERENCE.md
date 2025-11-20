# CLI Reference

Complete reference for all Punk CLI commands.

---

## Installation

```bash
# macOS/Linux
curl -fsSL https://punk.dev/install.sh | sh

# Windows
iwr https://punk.dev/install.ps1 -useb | iex

# npm
npm install -g @punk/cli

# Homebrew (macOS)
brew install punk-framework/tap/punk
```

---

## Global Commands

### `punk --version`

Display the installed version of Punk CLI.

```bash
punk --version
# Output: 1.0.0
```

### `punk --help`

Show help information for all commands.

```bash
punk --help
punk create --help
```

---

## Project Commands

### `punk create`

Create a new Punk project.

**Interactive Mode:**
```bash
punk create
```

**Non-Interactive Mode:**
```bash
punk create <name> [options]
```

**Options:**
- `--tier <punk|synthpunk|atompunk>` - Select tier
- `--backend <none|encore-ts|encore|trpc|glyphcase|manifest>` - Select backend
- `--skills <skill1,skill2>` - Install skills
- `--package-manager <npm|yarn|pnpm|bun>` - Package manager
- `--git` - Initialize git repository
- `--no-git` - Skip git initialization
- `--examples` - Include example files
- `--no-examples` - Skip examples
- `--theme <punk|synthpunk|atompunk|solarpunk>` - CLI theme

**Examples:**
```bash
# Interactive
punk create

# Simple project
punk create my-app

# Full options
punk create my-app \
  --tier synthpunk \
  --backend encore-ts \
  --skills shadcn-components,supabase-backend \
  --package-manager pnpm \
  --git \
  --examples
```

---

### `punk dev`

Start the development server.

```bash
punk dev [options]
```

**Options:**
- `--port <number>` - Frontend port (default: 3000)
- `--backend-port <number>` - Backend port (default: 4000)
- `--host <string>` - Host address (default: localhost)
- `--open` - Open browser automatically
- `--no-open` - Don't open browser

**Interactive Controls:**
```
While running:
  h - Show help
  r - Restart services
  c - Clear console
  f - Focus frontend logs
  b - Focus backend logs
  a - Show all logs
  o - Open in browser
  t - Run tests
  l - Show URLs
  d - Toggle debug mode
  q - Quit
```

**Examples:**
```bash
# Standard
punk dev

# Custom ports
punk dev --port 8080 --backend-port 8081

# Open browser automatically
punk dev --open
```

---

### `punk build`

Build the project for production.

```bash
punk build [options]
```

**Options:**
- `--outdir <path>` - Output directory (default: dist)
- `--minify` - Minify output
- `--sourcemap` - Generate source maps
- `--analyze` - Analyze bundle size

**Examples:**
```bash
# Standard build
punk build

# With analysis
punk build --analyze

# Custom output
punk build --outdir build
```

---

### `punk preview`

Preview production build locally.

```bash
punk preview [options]
```

**Options:**
- `--port <number>` - Port (default: 4173)
- `--host <string>` - Host (default: localhost)
- `--open` - Open browser

**Examples:**
```bash
punk preview
punk preview --port 8080 --open
```

---

## Upgrade Commands

### `punk upgrade`

Upgrade project tier or dependencies.

**Interactive Mode:**
```bash
punk upgrade
```

**Upgrade Tier:**
```bash
punk upgrade <punk|synthpunk|atompunk>
```

**Update Dependencies:**
```bash
punk upgrade deps
```

**Examples:**
```bash
# Interactive tier selection
punk upgrade

# Upgrade to Synthpunk
punk upgrade synthpunk

# Update all dependencies
punk upgrade deps
```

---

## Skill Commands

### `punk skills`

Manage skills (plugins).

**Subcommands:**

#### `punk skills list`

List installed and available skills.

```bash
punk skills list [options]
```

**Options:**
- `--installed` - Show only installed
- `--available` - Show only available
- `--json` - Output as JSON

#### `punk skills search`

Search for skills.

```bash
punk skills search <query>
```

**Examples:**
```bash
punk skills search supabase
punk skills search "pdf generator"
```

#### `punk skills install`

Install a skill.

```bash
punk skills install <skill-name>
```

**Options:**
- `--version <version>` - Specific version
- `--save-dev` - Install as dev dependency

**Examples:**
```bash
punk skills install shadcn-components
punk skills install supabase-backend@2.0.0
```

#### `punk skills uninstall`

Uninstall a skill.

```bash
punk skills uninstall <skill-name>
```

#### `punk skills info`

View skill details.

```bash
punk skills info <skill-name>
```

#### `punk skills update`

Update installed skills.

```bash
punk skills update [skill-name]
```

**Examples:**
```bash
# Update all skills
punk skills update

# Update specific skill
punk skills update shadcn-components
```

#### `punk skills create`

Create a new skill.

```bash
punk skills create [options]
```

**Options:**
- `--name <name>` - Skill name
- `--description <desc>` - Description
- `--extension-point <point>` - Extension point type
- `--template <template>` - Template to use

---

## Add Commands

### `punk add`

Add features to your project.

**Interactive Mode:**
```bash
punk add
```

**Add Specific Features:**

#### `punk add backend`

Add a backend adapter.

```bash
punk add backend <encore-ts|encore|trpc|glyphcase|manifest>
```

**Examples:**
```bash
punk add backend encore-ts
punk add backend glyphcase
```

#### `punk add skill`

Add a skill (alias for `punk skills install`).

```bash
punk add skill <skill-name>
```

#### `punk add auth`

Add authentication scaffolding.

```bash
punk add auth [options]
```

**Options:**
- `--provider <email|oauth>` - Auth provider
- `--features <features>` - Comma-separated features

**Examples:**
```bash
punk add auth --provider email
punk add auth --provider oauth --features google,github
```

#### `punk add database`

Add database integration.

```bash
punk add database <postgresql|mysql|sqlite>
```

**Examples:**
```bash
punk add database postgresql
```

#### `punk add deployment`

Add deployment configuration.

```bash
punk add deployment <vercel|netlify|aws|docker>
```

---

## Configuration Commands

### `punk config`

Manage configuration.

**View Config:**
```bash
punk config show
```

**Get Value:**
```bash
punk config get <key>
```

**Set Value:**
```bash
punk config set <key> <value>
```

**Examples:**
```bash
# View all config
punk config show

# Get tier
punk config get tier

# Set backend
punk config set backend encore-ts
```

---

## Theme Commands

### `punk theme`

Manage CLI theme.

**Interactive Selection:**
```bash
punk theme
```

**Set Theme:**
```bash
punk theme <punk|synthpunk|atompunk|solarpunk>
```

**Preview Theme:**
```bash
punk theme preview <theme-name>
```

**Examples:**
```bash
# Interactive selection
punk theme

# Set synthpunk theme
punk theme synthpunk

# Preview solarpunk
punk theme preview solarpunk
```

---

## Deployment Commands

### `punk deploy`

Deploy your application.

```bash
punk deploy [options]
```

**Options:**
- `--target <target>` - Deployment target
- `--env <environment>` - Environment (production, staging)
- `--dry-run` - Preview deployment

**Examples:**
```bash
# Interactive deployment
punk deploy

# Deploy to Vercel
punk deploy --target vercel

# Dry run
punk deploy --dry-run
```

---

## Utility Commands

### `punk check`

Check project health.

```bash
punk check [options]
```

**Options:**
- `--schemas` - Validate all schemas
- `--deps` - Check dependencies
- `--types` - Type check
- `--lint` - Run linter
- `--all` - Run all checks

**Examples:**
```bash
# Run all checks
punk check --all

# Validate schemas only
punk check --schemas
```

### `punk clean`

Clean build artifacts and caches.

```bash
punk clean [options]
```

**Options:**
- `--dist` - Clean dist folder
- `--node_modules` - Remove node_modules
- `--cache` - Clear caches
- `--all` - Clean everything

**Examples:**
```bash
# Clean dist
punk clean --dist

# Nuclear clean
punk clean --all
```

### `punk doctor`

Diagnose common issues.

```bash
punk doctor
```

Checks:
- Node.js version
- Package manager
- Dependencies
- Configuration files
- Port availability

---

## Environment Variables

Configure Punk CLI behavior with environment variables:

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-...           # Claude API key
OPENAI_API_KEY=sk-...                  # OpenAI API key (future)

# Configuration
PUNK_THEME=synthpunk                   # Default theme
PUNK_PACKAGE_MANAGER=pnpm              # Default package manager
PUNK_TELEMETRY=false                   # Disable telemetry

# Development
PUNK_DEV_PORT=3000                     # Dev server port
PUNK_BACKEND_PORT=4000                 # Backend port
PUNK_DEBUG=true                        # Enable debug mode
```

---

## Configuration File

### `punk.config.js`

```javascript
export default {
  // Tier configuration
  tier: 'synthpunk',  // punk | synthpunk | atompunk

  // Backend configuration
  backend: 'encore-ts',

  // Installed skills
  skills: [
    'shadcn-components',
    'supabase-backend'
  ],

  // CLI theme
  theme: 'synthpunk',

  // AI configuration (Synthpunk/Atompunk)
  ai: {
    model: 'claude-sonnet-4-20250514',
    temperature: 0.3,
    maxTokens: 4096,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true,
  },

  // Development configuration
  dev: {
    port: 3000,
    backendPort: 4000,
    open: true,
  },
}
```

---

## Tips & Tricks

### Keyboard Shortcuts

Global shortcuts:
- `Ctrl+C` - Cancel current operation
- `q` - Quit interactive prompts
- `↑↓` - Navigate menus
- `Space` - Toggle checkboxes
- `Enter` - Confirm selection

### Performance

```bash
# Use pnpm for faster installs
punk create my-app --package-manager pnpm

# Skip examples for smaller projects
punk create my-app --no-examples

# Use bun for even faster installs
punk create my-app --package-manager bun
```

### Debugging

```bash
# Enable debug mode
PUNK_DEBUG=true punk dev

# Verbose logging
punk dev --verbose

# Check for issues
punk doctor
```

---

[Back to README](README.md) • [Getting Started](GETTING_STARTED.md) • [Architecture](ARCHITECTURE.md)
