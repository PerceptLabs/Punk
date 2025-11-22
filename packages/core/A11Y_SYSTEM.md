# Punk Framework - Accessibility (A11y) System

## Overview

The Punk Framework includes a comprehensive accessibility system for Rig components that automatically applies ARIA attributes based on declarative profiles and schema metadata.

## Features

✅ **8 Rig Component Profiles** - Pre-defined accessibility profiles for all Rig components
✅ **Automatic ARIA Attributes** - Role, label, and description applied automatically
✅ **Dev-Mode Validation** - Warnings/errors for missing required metadata
✅ **Production Fallbacks** - Auto-generated labels when metadata is missing
✅ **Screen Reader Support** - Hidden description elements with sr-only styling

## Rig Component Profiles

### 1. Chart (ChartJS)
- **Role**: `img`
- **Required**: `label`, `description` (relaxed mode only requires `label`)
- **Purpose**: Data visualization using charts and graphs

### 2. Table (TanStack Table)
- **Role**: `table`
- **Required**: `caption` (relaxed mode only requires `caption`)
- **Purpose**: Tabular data display with sorting and pagination

### 3. RichText (Lexical)
- **Role**: `textbox`
- **Required**: `label`
- **Purpose**: Rich text content editor or viewer

### 4. Code (CodeMirror)
- **Role**: `code`
- **Required**: `label`
- **Purpose**: Code editor or syntax-highlighted viewer

### 5. Mermaid
- **Role**: `img`
- **Required**: `label` (relaxed mode)
- **Purpose**: Diagram and flowchart visualization

### 6. FileDrop (React Dropzone)
- **Role**: `button`
- **Required**: `label`
- **Purpose**: File upload drag-and-drop area

### 7. DatePicker (React Day Picker)
- **Role**: `combobox`
- **Required**: `label`
- **Purpose**: Interactive calendar for date selection

### 8. Command (cmdk)
- **Role**: `combobox`
- **Required**: `label`
- **Purpose**: Command palette for quick actions and navigation

## Usage

### Basic Example

```tsx
import { PunkRenderer } from '@punk/core'

const schema = {
  type: 'Chart',
  id: 'sales-chart',
  a11y: {
    label: 'Sales by Region',
    description: 'Bar chart showing sales performance across 5 regions. North region leads with $2.5M in Q4 2024.'
  },
  props: {
    type: 'bar',
    data: 'salesData',
  }
}

function App() {
  return (
    <PunkRenderer
      schema={schema}
      data={{ salesData: [...] }}
      a11yMode="relaxed"  // 'off' | 'relaxed' | 'strict'
    />
  )
}
```

### Rendered Output

```html
<div
  role="img"
  aria-label="Sales by Region"
  aria-describedby="desc-sales-chart"
>
  <!-- Chart component content -->
</div>
<span
  id="desc-sales-chart"
  class="sr-only"
  style="position: absolute; width: 1px; height: 1px; ..."
>
  Bar chart showing sales performance across 5 regions. North region leads with $2.5M in Q4 2024.
</span>
```

## A11y Modes

### `off`
- No accessibility validation
- No warnings or errors
- A11y attributes still applied if present in schema

### `relaxed` (default)
- Warnings for missing required metadata in development
- No errors - rendering continues
- Auto-generates fallback labels in production

### `strict`
- Errors for missing required metadata in development
- Rendering continues but logs are more prominent
- Helpful for accessibility-first development

## Schema Structure

```typescript
interface PunkNode {
  type: string
  id?: string
  a11y?: {
    label?: string        // Short accessible label (aria-label)
    description?: string  // Extended description (aria-describedby)
    caption?: string      // Table caption (for Table components)
  }
  props?: Record<string, unknown>
  children?: PunkNode[]
}
```

## Dev-Mode Warnings

When a Rig component is missing required metadata:

```
[Punk A11y] Rig "Chart" (id: sales-chart) is missing required a11y metadata: label, description
```

- **Relaxed mode**: `console.warn()`
- **Strict mode**: `console.error()`
- **Production**: No warnings, auto-generates fallback labels

## Production Behavior

In production (`NODE_ENV=production`):
- Missing labels auto-generated as `"${ComponentType} visualization"`
- No console warnings or errors
- A11y attributes still applied

Example:
```typescript
// Schema without a11y
{ type: 'Chart', props: {...} }

// Rendered with fallback
<div role="img" aria-label="Chart visualization">
```

## Implementation Details

### Automatic Attribute Derivation

The renderer automatically:

1. Looks up the `RigA11yProfile` for the component type
2. Applies the `role` from the profile
3. Reads `schema.a11y.label` → `aria-label`
4. Reads `schema.a11y.description` → creates hidden `<span>` with `aria-describedby`
5. Validates required fields in development
6. Generates fallbacks in production

### A11y Attributes Override

A11y attributes are merged AFTER base props to ensure they take precedence:

```typescript
const finalProps = {
  ...processedProps,      // Component props
  'data-testid': node.testId,
  className: node.className,
  style: node.style,
  ...a11yProps,          // A11y wins!
}
```

### Screen Reader Only (sr-only) Styling

Description elements use inline styles for maximum compatibility:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## API Reference

### Types

```typescript
import type { PunkNodeA11y, RigA11yProfile, A11yMode, A11yConfig } from '@punk/core'
```

### Functions

```typescript
import { getRigA11yProfile, getAllRigA11yProfiles, hasRigA11yProfile, useA11yConfig } from '@punk/core'

// Get profile for a component type
const profile = getRigA11yProfile('Chart')

// Check if a profile exists
const hasProfile = hasRigA11yProfile('Chart')

// Get all profiles
const allProfiles = getAllRigA11yProfiles()

// Use in a component
function MyComponent() {
  const a11yConfig = useA11yConfig()
  // a11yConfig.mode: 'off' | 'relaxed' | 'strict'
}
```

## Best Practices

### 1. Always Provide Labels

```typescript
// ✅ Good
{
  type: 'Chart',
  a11y: { label: 'Monthly Revenue Trend' }
}

// ❌ Bad - will warn in dev
{
  type: 'Chart',
  // No a11y metadata
}
```

### 2. Add Descriptions for Complex Visualizations

```typescript
// ✅ Good - helps screen reader users understand insights
{
  type: 'Chart',
  a11y: {
    label: 'Sales Funnel',
    description: 'Funnel chart showing conversion rates: 10,000 visitors → 5,000 leads → 1,000 customers (10% conversion)'
  }
}
```

### 3. Use Strict Mode During Development

```typescript
<PunkRenderer schema={schema} a11yMode="strict" />
```

### 4. Table Captions

```typescript
{
  type: 'Table',
  a11y: {
    caption: 'Q4 2024 Customer List',
    description: 'Sortable table with pagination. Use arrow keys to navigate.'
  }
}
```

## Testing

### Manual Testing
1. Enable VoiceOver (Mac) or NVDA (Windows)
2. Navigate through the UI using keyboard only
3. Verify all labels and descriptions are announced

### Automated Testing
```typescript
import { render } from '@testing-library/react'
import { PunkRenderer } from '@punk/core'

test('applies aria-label from a11y metadata', () => {
  const { container } = render(
    <PunkRenderer
      schema={{
        type: 'Chart',
        a11y: { label: 'Test Chart' }
      }}
    />
  )

  const element = container.querySelector('[role="img"]')
  expect(element).toHaveAttribute('aria-label', 'Test Chart')
})
```

## Future Enhancements

- [ ] Keyboard navigation support flags
- [ ] ARIA live regions for dynamic content
- [ ] High contrast mode detection
- [ ] Focus management utilities
- [ ] Screen reader announcements API

## References

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Accessibility Principles](https://webaim.org/articles/)
- [MDN: ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
