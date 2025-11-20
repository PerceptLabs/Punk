# @punk/component-richtext

Punk Framework wrapper for Lexical rich text editor.

## Installation

```bash
pnpm add @punk/component-richtext
```

## Features

- Powerful rich text editing with Lexical
- Auto-registers with Punk Framework on import
- Renderer-agnostic (works in DOM/GPU/XR modes)
- Data context integration
- Zod schema validation

## Usage

### Basic Usage

```typescript
import '@punk/component-richtext'
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'RichText',
  props: {
    content: 'Hello, world!',
    editable: true,
    placeholder: 'Enter your text here...'
  }
}

<PunkRenderer schema={schema} />
```

### With Data Context

```typescript
const schema = {
  type: 'RichText',
  props: {
    data: 'article.content',
    editable: false,
    placeholder: 'Loading...'
  }
}

const data = {
  article: {
    content: 'This content comes from the data context'
  }
}

<PunkRenderer schema={schema} data={data} />
```

### JSON Schema

```json
{
  "type": "RichText",
  "props": {
    "content": "Initial content",
    "editable": true,
    "placeholder": "Start typing..."
  }
}
```

## Props Schema

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `""` | Initial text content |
| `editable` | `boolean` | `true` | Whether the editor is editable |
| `placeholder` | `string` | `"Enter text..."` | Placeholder text when empty |
| `data` | `string` | - | Optional data context path (e.g., 'user.bio') |

## Component Metadata

- **Display Name**: Rich Text Editor
- **Category**: Content
- **Icon**: file-text (Lucide)
- **Complexity**: Advanced
- **Tags**: editor, text, richtext

## Integration with SynthPunk

The component exports a Zod schema that SynthPunk AI can use for code generation:

```typescript
import { RichTextSchemaMap } from '@punk/component-richtext'

// Available for AI-powered component generation
```

## Integration with Mohawk

The component metadata is automatically available to Mohawk UI builder:

```typescript
import { RichTextMeta } from '@punk/component-richtext'

// Used for component palette, drag-and-drop, etc.
```

## Styling

The component uses basic inline styles and CSS classes that can be customized:

- `.punk-richtext-wrapper` - Outer container
- `.punk-richtext-editor` - Content editable area
- `.punk-richtext-placeholder` - Placeholder text
- `.punk-richtext-paragraph` - Paragraph elements
- `.punk-richtext-bold` - Bold text
- `.punk-richtext-italic` - Italic text
- `.punk-richtext-underline` - Underlined text

## License

MIT
