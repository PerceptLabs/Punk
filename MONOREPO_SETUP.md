# Punk Framework Monorepo

This is the Punk Framework monorepo, containing all packages, apps, and examples.

## Structure

```
Punk/
├── packages/              # Core packages
│   ├── core/             # @punk/core - Renderer and validation
│   ├── components/       # @punk/components - Radix UI wrappers
│   ├── tokens/           # @punk/tokens - TokiForge integration
│   ├── synthpunk/        # @punk/synthpunk - AI engine
│   ├── atompunk/         # @punk/atompunk - Backend templates
│   └── glyphcase/        # @punk/glyphcase - SQLite + Lua skills
├── apps/
│   ├── cli/              # Punk CLI (Go)
│   └── mohawk/           # Mohawk web builder (Next.js)
├── examples/
│   └── hello-world/      # Example app
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Go 1.21+ (for CLI development)

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start development mode for all packages
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## Packages

### @punk/core

Core functionality for Punk Framework:
- Puck renderer integration
- Zod schema validation
- Component registry

**Location:** `/home/user/Punk/packages/core`

### @punk/components

Puck-compatible components wrapping Radix UI:
- Form components
- Layout components
- Display components
- Overlay components

**Location:** `/home/user/Punk/packages/components`

### @punk/tokens

Design token management via TokiForge:
- Figma Tokens Studio integration
- Style Dictionary transformation
- CSS variable generation

**Location:** `/home/user/Punk/packages/tokens`

### @punk/synthpunk

AI-powered app generation:
- Claude API integration
- Schema generation from natural language
- Component matching

**Location:** `/home/user/Punk/packages/synthpunk`

### @punk/atompunk

Backend scaffolding templates:
- Express.js templates
- Hono templates
- Elysia templates

**Location:** `/home/user/Punk/packages/atompunk`

### @punk/glyphcase

Skills database and management:
- SQLite component storage
- Lua scripting runtime
- Skill installation

**Location:** `/home/user/Punk/packages/glyphcase`

## Apps

### Punk CLI

Go-based command-line interface for Punk Framework.

**Location:** `/home/user/Punk/apps/cli`

```bash
cd apps/cli
go run . --help
```

### Mohawk

Visual builder web application.

**Location:** `/home/user/Punk/apps/mohawk`

```bash
cd apps/mohawk
pnpm dev
```

## Examples

### Hello World

Simple example demonstrating Punk Framework basics.

**Location:** `/home/user/Punk/examples/hello-world`

```bash
cd examples/hello-world
pnpm dev
```

## Development Workflow

### Adding a New Package

1. Create directory: `mkdir -p packages/new-package/src`
2. Copy package.json template from existing package
3. Update package name and dependencies
4. Create `src/index.ts`
5. Add to workspace: Already configured in `pnpm-workspace.yaml`

### Building

The monorepo uses Turborepo for efficient builds:

```bash
# Build everything
pnpm build

# Build specific package
pnpm --filter @punk/core build

# Build with dependencies
turbo run build --filter=@punk/components...
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific package
pnpm --filter @punk/core test

# Watch mode
pnpm --filter @punk/core test --watch
```

### Publishing

```bash
# Version all packages
pnpm changeset

# Build for production
pnpm build

# Publish to npm
pnpm changeset publish
```

## Tools

- **Package Manager:** pnpm
- **Build System:** Turborepo
- **Bundler:** tsup (for packages), Vite (for examples), Next.js (for apps)
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Type Checking:** TypeScript 5.3+

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

See individual packages for license information.
