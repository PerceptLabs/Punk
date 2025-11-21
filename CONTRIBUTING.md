# Contributing to Punk Framework

Thank you for your interest in contributing to Punk! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Submitting Changes](#submitting-changes)
10. [Review Process](#review-process)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in Punk Framework a harassment-free experience for everyone, regardless of:
- Age, body size, disability
- Ethnicity, gender identity and expression
- Level of experience, nationality
- Personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors:**
- ✅ Using welcoming and inclusive language
- ✅ Being respectful of differing viewpoints
- ✅ Accepting constructive criticism gracefully
- ✅ Focusing on what's best for the community
- ✅ Showing empathy towards others

**Unacceptable behaviors:**
- ❌ Trolling, insulting/derogatory comments
- ❌ Public or private harassment
- ❌ Publishing others' private information
- ❌ Conduct which could be considered inappropriate

### Enforcement

Violations can be reported to conduct@punk.dev. All complaints will be reviewed and investigated promptly and fairly.

---

## How Can I Contribute?

### Reporting Bugs

Found a bug? Please create an issue with:

1. **Clear title** - Summarize the problem
2. **Description** - What happened vs. what you expected
3. **Steps to reproduce** - Minimal reproduction steps
4. **Environment** - OS, Node version, Punk version
5. **Screenshots** - If applicable
6. **Logs** - Error messages, stack traces

**Template:**
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Run `punk create`
2. Select ...
3. See error

## Expected Behavior
What should have happened

## Actual Behavior
What actually happened

## Environment
- OS: macOS 14.0
- Node: v20.0.0
- Punk: v1.0.0
- Package Manager: npm 10.0.0

## Logs
```
[Paste error logs here]
```
```

### Suggesting Features

Have an idea? Create a feature request with:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives** - What other options did you consider?
4. **Examples** - Show how it would be used
5. **Impact** - Who benefits from this?

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos, grammar, clarity
- Add examples
- Update outdated info
- Improve explanations
- Add diagrams

### Creating Mods

Build and publish mods to extend Punk:
- See [Mods Guide](SKILLS_GUIDE.md)
- Follow mod best practices
- Submit to the Depot (https://depot.punk.dev)

### Answering Questions

Help others in:
- GitHub Discussions
- Discord server
- Stack Overflow (tag: `punk-framework`)

---

## Development Setup

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm 8+** - `npm install -g pnpm`
- **Go 1.21+** - [Download](https://go.dev/dl/) (for CLI development)
- **Git** - Version control
- **Docker** - For integration tests

### Clone the Repository

```bash
git clone https://github.com/punk-framework/punk.git
cd punk
```

### Install Dependencies

```bash
# Install Node dependencies
pnpm install

# Install Go dependencies (for CLI)
cd tools/cli
go mod download
cd ../..
```

### Build the Project

```bash
# Build all packages
pnpm build

# Build CLI
cd tools/cli
go build -o punk
cd ../..
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test --filter @punk/core

# Watch mode
pnpm test:watch
```

### Start Development

```bash
# Watch mode for all packages
pnpm dev

# Or specific package
pnpm dev --filter @punk/core
```

---

## Project Structure

```
punk/
├── packages/                 # NPM packages
│   ├── core/                # @punk/core
│   ├── synthpunk/           # @punk/synthpunk
│   ├── atompunk/            # @punk/atompunk
│   ├── adapters/            # @punk/adapters
│   └── glyphcase/           # @punk/glyphcase
│
├── apps/                    # Applications
│   ├── atompunk-web/        # Web builder
│   └── docs/                # Documentation site
│
├── tools/                   # Development tools
│   ├── cli/                 # Punk CLI (Go)
│   └── scripts/             # Build scripts
│
├── templates/               # Project templates
│   ├── base/                # Base template
│   ├── layers/              # Tier layers
│   ├── backends/            # Backend templates
│   └── mods/              # Mod templates
│
├── docs/                    # Documentation
│   └── examples/            # Example projects
│
└── tests/                   # Integration tests
    ├── e2e/                 # End-to-end tests
    └── fixtures/            # Test fixtures
```

---

## Development Workflow

### 1. Create a Branch

```bash
# Feature branch
git checkout -b feature/my-feature

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/improvement
```

### 2. Make Changes

Follow our coding standards (see below).

### 3. Add Tests

All changes should include tests:

```typescript
// packages/core/src/renderer.test.ts
import { describe, it, expect } from 'vitest'
import { PunkRenderer } from './renderer'

describe('PunkRenderer', () => {
  it('renders a button schema', () => {
    const schema = {
      type: 'button',
      props: { children: 'Click me' }
    }

    const result = render(<PunkRenderer schema={schema} />)
    expect(result.container).toHaveTextContent('Click me')
  })

  it('throws on invalid schema', () => {
    const invalidSchema = { invalid: true }

    expect(() => {
      render(<PunkRenderer schema={invalidSchema} />)
    }).toThrow('Invalid schema')
  })
})
```

### 4. Run Tests

```bash
# All tests
pnpm test

# Specific package
pnpm test --filter @punk/core

# With coverage
pnpm test:coverage
```

### 5. Commit Changes

We use **Conventional Commits**:

```bash
# Format: <type>(<scope>): <description>

# Examples:
git commit -m "feat(core): add new button variant"
git commit -m "fix(cli): resolve template composition issue"
git commit -m "docs: update getting started guide"
git commit -m "test(synthpunk): add epoch engine tests"
git commit -m "chore: update dependencies"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `test` - Adding/fixing tests
- `chore` - Build process, dependencies

---

## Coding Standards

### TypeScript

**ESLint Configuration:**
```json
{
  "extends": [
    "@punk/eslint-config",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Style Guidelines:**
```typescript
// ✅ Good
export interface ButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function Button({ variant, size, onClick }: ButtonProps): JSX.Element {
  return <button className={getClassNames(variant, size)} onClick={onClick} />
}

// ❌ Bad
export function Button(props: any) {
  return <button className={props.class} onClick={props.click} />
}
```

### Go (CLI)

**Style Guidelines:**
```go
// ✅ Good
func CreateProject(name string, options ProjectOptions) error {
  if name == "" {
    return errors.New("project name is required")
  }

  project := &Project{
    Name:    name,
    Tier:    options.Tier,
    Backend: options.Backend,
  }

  return project.Generate()
}

// ❌ Bad
func create_project(n string, o map[string]interface{}) {
  // Creates project
  p := map[string]string{"name": n}
  generate(p)
}
```

**Run gofmt:**
```bash
cd tools/cli
go fmt ./...
```

### File Organization

```typescript
// 1. Imports (external, then internal)
import React from 'react'
import { z } from 'zod'

import { PunkRenderer } from './renderer'
import { validateSchema } from './validator'

// 2. Types/Interfaces
export interface Props {
  schema: PunkSchema
}

// 3. Constants
const DEFAULT_OPTIONS = { /* ... */ }

// 4. Functions/Components
export function Component({ schema }: Props) {
  // Implementation
}

// 5. Exports (if not inline)
export { Component }
```

---

## Testing

### Unit Tests

```typescript
// packages/core/src/validator.test.ts
import { describe, it, expect } from 'vitest'
import { validateSchema } from './validator'

describe('validateSchema', () => {
  it('validates a correct schema', () => {
    const schema = {
      type: 'button',
      props: { children: 'Click' }
    }

    expect(() => validateSchema(schema)).not.toThrow()
  })

  it('rejects invalid type', () => {
    const schema = {
      type: 123, // Invalid: should be string
      props: {}
    }

    expect(() => validateSchema(schema)).toThrow()
  })
})
```

### Integration Tests

```typescript
// tests/e2e/create-project.test.ts
import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'

test('creates a Punk project', async () => {
  // Run CLI
  execSync('punk create test-project --tier punk --backend none', {
    cwd: '/tmp'
  })

  // Check files exist
  const files = [
    '/tmp/test-project/package.json',
    '/tmp/test-project/punk.config.js',
    '/tmp/test-project/frontend/src/App.tsx'
  ]

  for (const file of files) {
    expect(existsSync(file)).toBe(true)
  }
})
```

### Test Coverage

We aim for **>80% coverage**:

```bash
# Generate coverage report
pnpm test:coverage

# View in browser
open coverage/index.html
```

---

## Documentation

### Code Comments

```typescript
/**
 * Validates a Punk schema against the Zod schema definition.
 *
 * @param schema - The schema to validate
 * @returns The validated schema
 * @throws {ValidationError} If schema is invalid
 *
 * @example
 * ```ts
 * const schema = { type: 'button', props: { children: 'Click' } }
 * const validated = validateSchema(schema)
 * ```
 */
export function validateSchema(schema: unknown): PunkSchema {
  // Implementation
}
```

### Markdown Documentation

- Use **clear headings** (##, ###)
- Include **code examples**
- Add **diagrams** where helpful (Mermaid, ASCII)
- Link to related docs
- Keep paragraphs short

### Updating Docs

When adding features, update:
- [ ] README.md (if user-facing)
- [ ] Relevant guide (GETTING_STARTED, CLI_REFERENCE, etc.)
- [ ] API documentation
- [ ] CHANGELOG.md

---

## Submitting Changes

### 1. Push Your Branch

```bash
git push origin feature/my-feature
```

### 2. Create Pull Request

On GitHub, click "New Pull Request" and fill out the template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Added unit tests
- [ ] Added integration tests
- [ ] All tests pass
- [ ] Tested manually

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

### 3. Wait for Review

- CI checks must pass
- At least one approval required
- Address review feedback
- Keep PR up to date with main

---

## Review Process

### What We Look For

**Code Quality:**
- ✅ Follows coding standards
- ✅ Well-structured and readable
- ✅ Appropriate comments
- ✅ No unnecessary complexity

**Functionality:**
- ✅ Solves the stated problem
- ✅ Doesn't break existing features
- ✅ Handles edge cases
- ✅ Good error handling

**Testing:**
- ✅ Has unit tests
- ✅ Has integration tests (if applicable)
- ✅ Tests cover edge cases
- ✅ All tests pass

**Documentation:**
- ✅ Code is documented
- ✅ User-facing docs updated
- ✅ CHANGELOG updated
- ✅ Examples provided

### Review Turnaround

- **Simple PRs:** 1-2 days
- **Complex PRs:** 3-5 days
- **Breaking changes:** 5-7 days

### After Approval

1. Squash and merge (or rebase)
2. Delete branch
3. Update related issues
4. Announce in Discord (for major changes)

---

## Getting Help

### Questions?

- **Discord:** [discord.gg/punk](https://discord.gg/punk)
- **Discussions:** [GitHub Discussions](https://github.com/punk-framework/punk/discussions)
- **Email:** contributors@punk.dev

### Stuck?

Don't hesitate to ask for help:
- Comment on your PR
- Ask in Discord #contributors channel
- Schedule a pairing session

---

## Recognition

Contributors are recognized in:
- README.md contributors section
- CHANGELOG.md for their contributions
- Twitter shoutouts for significant contributions
- Swag for 10+ merged PRs

---

Thank you for contributing to Punk! 🎸

**Build Fast. Break Norms. Ship Code.**

[Back to README](README.md) • [Code of Conduct](CODE_OF_CONDUCT.md)
