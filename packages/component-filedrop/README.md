# @punk/component-filedrop

Punk Framework wrapper for react-dropzone file upload component.

## Installation

```bash
pnpm add @punk/component-filedrop
```

## Features

- Drag and drop file uploads with react-dropzone
- File type and size validation
- Single or multiple file support
- Auto-registers with Punk Framework on import
- Renderer-agnostic (works in DOM/GPU/XR modes)
- Action bus integration for upload handlers
- Zod schema validation
- Visual feedback for drag states and errors

## Usage

### Basic Usage

```typescript
import '@punk/component-filedrop'
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'FileDrop',
  props: {
    accept: 'image/*',
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    multiple: false
  }
}

<PunkRenderer schema={schema} />
```

### With Action Handler

```typescript
const schema = {
  type: 'FileDrop',
  props: {
    accept: 'application/pdf',
    maxFiles: 3,
    multiple: true,
    onUpload: 'handleFileUpload'
  }
}

const actions = {
  handleFileUpload: (files: File[]) => {
    console.log('Uploaded files:', files)
    // Process files (e.g., upload to server)
  }
}

<PunkRenderer schema={schema} actions={actions} />
```

### Multiple Files

```typescript
const schema = {
  type: 'FileDrop',
  props: {
    accept: 'image/png,image/jpeg',
    maxFiles: 5,
    maxSize: 10485760, // 10MB
    multiple: true,
    onUpload: 'processImages'
  }
}

<PunkRenderer schema={schema} />
```

### JSON Schema

```json
{
  "type": "FileDrop",
  "props": {
    "accept": "image/*",
    "maxFiles": 1,
    "maxSize": 5242880,
    "multiple": false,
    "onUpload": "handleUpload"
  }
}
```

## Props Schema

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `"*/*"` | MIME type(s) to accept (e.g., 'image/*', 'application/pdf') |
| `maxFiles` | `number` | `1` | Maximum number of files allowed |
| `maxSize` | `number` | `10485760` | Maximum file size in bytes (default 10MB) |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `onUpload` | `string` | - | Action handler name to call on successful upload |

## Component Metadata

- **Display Name**: File Upload
- **Category**: Input
- **Icon**: upload (Lucide)
- **Complexity**: Simple
- **Tags**: upload, file, drop

## Integration with SynthPunk

The component exports a Zod schema that SynthPunk AI can use for code generation:

```typescript
import { FileDropSchemaMap } from '@punk/component-filedrop'

// Available for AI-powered component generation
```

## Integration with Mohawk

The component metadata is automatically available to Mohawk UI builder:

```typescript
import { FileDropMeta } from '@punk/component-filedrop'

// Used for component palette, drag-and-drop, etc.
```

## Action Bus Integration

The component integrates with Punk's action bus system for handling file uploads:

```typescript
const actions = {
  handleFileUpload: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    console.log('Upload result:', result)
  }
}
```

## File Type Examples

```typescript
// Images only
accept: 'image/*'

// Specific image types
accept: 'image/png,image/jpeg'

// PDFs only
accept: 'application/pdf'

// Documents
accept: '.doc,.docx,.pdf'

// All files
accept: '*/*'
```

## Styling

The component uses inline styles and CSS classes that can be customized:

- `.punk-filedrop-wrapper` - Outer container
- `.punk-filedrop-zone` - Dropzone area (changes on drag)
- `.punk-filedrop-error` - Error message container
- `.punk-filedrop-files` - Uploaded files list

## Examples

### Image Upload with Preview

```typescript
const schema = {
  type: 'FileDrop',
  props: {
    accept: 'image/png,image/jpeg,image/gif',
    maxFiles: 1,
    maxSize: 2097152, // 2MB
    multiple: false,
    onUpload: 'previewImage'
  }
}

const actions = {
  previewImage: (files: File[]) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Show preview
      console.log('Image data:', e.target?.result)
    }
    reader.readAsDataURL(files[0])
  }
}
```

### Bulk File Upload

```typescript
const schema = {
  type: 'FileDrop',
  props: {
    accept: '*/*',
    maxFiles: 20,
    maxSize: 52428800, // 50MB per file
    multiple: true,
    onUpload: 'bulkUpload'
  }
}
```

## Error Handling

The component automatically displays errors for:
- Files exceeding max size
- Too many files
- Invalid file types
- Other dropzone validation failures

Errors are displayed in a styled error box below the dropzone.

## License

MIT
