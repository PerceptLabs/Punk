# @punk/component-code

Punk Framework wrapper for CodeMirror code editor with syntax highlighting.

## Installation

```bash
pnpm add @punk/component-code
```

## Features

- Syntax-highlighted code editing with CodeMirror
- Support for multiple languages (JavaScript, TypeScript, Python, Go, Rust, HTML, CSS)
- Auto-registers with Punk Framework on import
- Renderer-agnostic (works in DOM/GPU/XR modes)
- Data context integration
- Zod schema validation
- Read-only mode support

## Usage

### Basic Usage

```typescript
import '@punk/component-code'
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'Code',
  props: {
    code: 'const greeting = "Hello, world!";',
    language: 'javascript',
    theme: 'light',
    readOnly: false,
    lineNumbers: true
  }
}

<PunkRenderer schema={schema} />
```

### With Data Context

```typescript
const schema = {
  type: 'Code',
  props: {
    data: 'snippet.code',
    language: 'python',
    readOnly: true
  }
}

const data = {
  snippet: {
    code: 'def hello():\n    print("Hello, world!")'
  }
}

<PunkRenderer schema={schema} data={data} />
```

### Read-Only Code Display

```typescript
const schema = {
  type: 'Code',
  props: {
    code: 'package main\n\nfunc main() {\n    println("Hello, world!")\n}',
    language: 'go',
    readOnly: true,
    lineNumbers: true
  }
}

<PunkRenderer schema={schema} />
```

### JSON Schema

```json
{
  "type": "Code",
  "props": {
    "code": "console.log('Hello');",
    "language": "javascript",
    "theme": "light",
    "readOnly": false,
    "lineNumbers": true
  }
}
```

## Props Schema

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | `""` | Source code to display/edit |
| `language` | `enum` | `"javascript"` | Programming language (javascript, typescript, python, go, rust, html, css) |
| `theme` | `string` | `"light"` | Editor theme |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `lineNumbers` | `boolean` | `true` | Show line numbers |
| `data` | `string` | - | Optional data context path (e.g., 'code.snippet') |

## Supported Languages

- JavaScript (`javascript`)
- TypeScript (`typescript`)
- Python (`python`)
- Go (`go`)
- Rust (`rust`)
- HTML (`html`)
- CSS (`css`)

## Component Metadata

- **Display Name**: Code Editor
- **Category**: Content
- **Icon**: code (Lucide)
- **Complexity**: Medium
- **Tags**: code, editor, syntax

## Integration with SynthPunk

The component exports a Zod schema that SynthPunk AI can use for code generation:

```typescript
import { CodeSchemaMap } from '@punk/component-code'

// Available for AI-powered component generation
```

## Integration with Mohawk

The component metadata is automatically available to Mohawk UI builder:

```typescript
import { CodeMeta } from '@punk/component-code'

// Used for component palette, drag-and-drop, etc.
```

## Styling

The component uses basic inline styles and CSS classes that can be customized:

- `.punk-code-wrapper` - Outer container with border

## Examples

### Multi-language Support

```typescript
const examples = [
  {
    type: 'Code',
    props: {
      code: 'console.log("JavaScript")',
      language: 'javascript'
    }
  },
  {
    type: 'Code',
    props: {
      code: 'print("Python")',
      language: 'python'
    }
  },
  {
    type: 'Code',
    props: {
      code: '<h1>HTML</h1>',
      language: 'html'
    }
  }
]
```

## License

MIT
