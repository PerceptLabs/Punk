# @punk/component-date

Punk wrapper for [react-day-picker](https://react-day-picker.js.org/) - a flexible date picker component.

## Installation

```bash
pnpm add @punk/component-date
```

## Features

- **Single, Multiple, and Range Selection**: Support for different selection modes
- **Date Constraints**: Set minimum/maximum dates and disable specific dates
- **Renderer-Agnostic**: Works in DOM, GPU, and XR rendering modes
- **Auto-Registration**: Registers with Punk ComponentRegistry on import
- **Schema-Driven**: Full Zod schema for AI-powered generation (SynthPunk)
- **Metadata Rich**: Component metadata for visual builders (Mohawk)

## Usage

### Direct Component Usage

```tsx
import { DatePicker } from '@punk/component-date'

function MyApp() {
  return (
    <DatePicker
      mode="single"
      value="2025-11-20"
      fromDate="2025-01-01"
      toDate="2025-12-31"
    />
  )
}
```

### JSON Schema Usage (with PunkRenderer)

```json
{
  "type": "DatePicker",
  "props": {
    "mode": "single",
    "value": "2025-11-20",
    "placeholder": "Select a date",
    "fromDate": "2025-01-01",
    "toDate": "2025-12-31"
  }
}
```

### Range Selection

```json
{
  "type": "DatePicker",
  "props": {
    "mode": "range",
    "placeholder": "Select date range"
  }
}
```

### Multiple Selection with Disabled Dates

```json
{
  "type": "DatePicker",
  "props": {
    "mode": "multiple",
    "disabled": ["2025-11-25", "2025-12-25"],
    "showWeekNumber": true
  }
}
```

### With Action Handling

```json
{
  "type": "DatePicker",
  "props": {
    "mode": "single",
    "onSelect": "handleDateChange"
  }
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Selected date (ISO string) |
| `mode` | `'single' \| 'multiple' \| 'range'` | `'single'` | Selection mode |
| `disabled` | `string[]` | `undefined` | Array of disabled dates (ISO strings) |
| `fromDate` | `string` | `undefined` | Minimum selectable date (ISO string) |
| `toDate` | `string` | `undefined` | Maximum selectable date (ISO string) |
| `placeholder` | `string` | `undefined` | Placeholder text |
| `showWeekNumber` | `boolean` | `false` | Show week numbers |
| `onSelect` | `string` | `undefined` | Action to trigger on selection |
| `className` | `string` | `undefined` | Custom CSS class |

## Component Metadata

```typescript
{
  displayName: 'Date Picker',
  description: 'Flexible date selection with single, multiple, and range modes',
  icon: 'calendar',
  category: 'Input',
  tags: ['date', 'calendar', 'picker', 'input', 'time'],
  complexity: 'simple'
}
```

## Schema Export

The component exports its Zod schema for use with SynthPunk AI:

```typescript
import { DatePickerPropsSchema, DatePickerSchemaMap } from '@punk/component-date'

// Use in validation
const result = DatePickerPropsSchema.parse(props)

// Use in schema map
const schemas = DatePickerSchemaMap
```

## Auto-Registration

This component automatically registers itself with the Punk ComponentRegistry when imported:

```typescript
import '@punk/component-date' // Component is now registered

import { getComponent } from '@punk/core'
const DatePickerComponent = getComponent('DatePicker')
```

## Styling

The component includes the default `react-day-picker` styles. You can override them with custom CSS:

```css
.rdp {
  /* Custom styles */
}
```

## Integration with DataContext

Use with Punk's DataContext for reactive data:

```json
{
  "type": "DatePicker",
  "props": {
    "value": "{{selectedDate}}",
    "mode": "single"
  }
}
```

## License

MIT
