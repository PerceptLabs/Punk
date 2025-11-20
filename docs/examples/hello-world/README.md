# Hello World Example

The simplest possible Punk application.

---

## What This Demonstrates

- ✅ Basic schema structure
- ✅ Container and heading components
- ✅ Button with click handler
- ✅ Text interpolation
- ✅ Accessibility attributes

---

## Files

- `schema.json` - The Punk schema
- `App.tsx` - React component that renders the schema
- `index.html` - HTML entry point

---

## Schema

```json
{
  "type": "container",
  "props": {
    "className": "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500"
  },
  "children": [
    {
      "type": "container",
      "props": {
        "className": "bg-white rounded-lg shadow-2xl p-12 max-w-md text-center"
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
            "children": "Welcome to schema-based development."
          }
        },
        {
          "type": "button",
          "props": {
            "variant": "primary",
            "onClick": "handleClick",
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

---

## Usage

### 1. Create Project

```bash
punk create hello-world --tier punk --backend none
cd hello-world
```

### 2. Replace Schema

Replace `frontend/src/schemas/example.json` with the schema above.

### 3. Update App.tsx

```typescript
import { PunkRenderer } from '@punk/core'
import schema from './schemas/example.json'

function App() {
  const handlers = {
    handleClick: () => {
      alert('Hello from Punk!')
    }
  }

  return <PunkRenderer schema={schema} handlers={handlers} />
}

export default App
```

### 4. Run

```bash
npm install
punk dev
```

Visit `http://localhost:3000`

---

## What You'll See

A beautiful card with:
- Purple-to-pink gradient background
- White card with shadow
- "Hello, Punk! 🎸" heading
- Welcome text
- "Say Hello" button

Click the button → Alert appears!

---

## Customization Ideas

### Change Colors

```json
{
  "props": {
    "className": "bg-gradient-to-br from-blue-500 to-green-500"
  }
}
```

### Add More Text

```json
{
  "type": "text",
  "props": {
    "className": "text-sm text-gray-500 mt-4",
    "children": "Built with Punk Framework"
  }
}
```

### Add Input

```json
{
  "type": "input",
  "props": {
    "name": "name",
    "type": "text",
    "placeholder": "Your name",
    "aria-label": "Enter your name",
    "className": "mb-4"
  }
}
```

---

## Key Concepts

### 1. Schemas are JSON

Everything is data, not code:
```json
{ "type": "button", "props": { "children": "Click" } }
```

### 2. Handlers are References

Not functions, but string names:
```json
{ "onClick": "handleClick" }
```

Defined separately:
```typescript
const handlers = {
  handleClick: () => { /* ... */ }
}
```

### 3. Accessibility Required

Every interactive element needs `aria-label`:
```json
{ "aria-label": "Say hello" }
```

### 4. Tailwind for Styling

Use utility classes:
```json
{ "className": "bg-blue-500 text-white px-4 py-2" }
```

---

## Next Steps

- [Todo App Example](../todo-app) - Add state management
- [Dashboard Example](../dashboard) - Data visualization
- [Component Reference](../../../COMPONENT_REFERENCE.md) - All components

---

[Back to Examples](../) • [Main README](../../../README.md)
