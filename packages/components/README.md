# @punk/components

React component library built on Radix UI primitives for the Punk framework.

## Overview

`@punk/components` provides a set of accessible, composable UI components that wrap Radix UI primitives. Each component is:

- **Accessible by default** - Full WCAG 2.1 AA compliance with proper ARIA attributes
- **Highly composable** - Use simplified props or compound components for advanced use cases
- **Styled with classes** - Uses className props for styling with `@punk/tokens`
- **TypeScript-first** - Full type safety with comprehensive prop types

## Installation

```bash
npm install @punk/components
# or
yarn add @punk/components
# or
pnpm add @punk/components
```

## Components

### Interactive

- **Button** - Clickable buttons with variants and sizes
- **Checkbox** - Single or multiple checkboxes for boolean selections
- **Radio** - Single-selection from multiple options
- **Select** - Dropdown selection list with grouping support
- **Slider** - Range slider for numeric input (single or range)
- **Switch** - Toggle switch for binary states

### Overlay

- **Dialog** - Modal dialogs for confirmations and alerts
- **Popover** - Floating panels for menus and contextual information
- **Tooltip** - Brief informational tooltips on hover

### Layout

- **Accordion** - Collapsible sections for FAQs and grouped content
- **Tabs** - Tabbed interfaces for organizing content

## Quick Start

```tsx
import { Button, Dialog, Checkbox, Tabs } from '@punk/components';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      {/* Simple button */}
      <Button variant="primary" size="md" onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>

      {/* Dialog with title and description */}
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
      >
        <Checkbox
          label="I understand the consequences"
          checked={agreed}
          onCheckedChange={setAgreed}
        />
        <Button disabled={!agreed}>Confirm</Button>
      </Dialog>

      {/* Tabs for content organization */}
      <Tabs
        defaultValue="tab1"
        tabs={[
          { value: 'tab1', label: 'Overview', content: <div>Overview content</div> },
          { value: 'tab2', label: 'Details', content: <div>Details content</div> },
        ]}
      />
    </div>
  );
}
```

## Component Patterns

### Simple Props Pattern

For quick usage with sensible defaults:

```tsx
<Accordion
  type="single"
  collapsible
  items={[
    { value: 'item-1', title: 'Section 1', content: 'Content 1' },
    { value: 'item-2', title: 'Section 2', content: 'Content 2' },
  ]}
/>
```

### Compound Components Pattern

For advanced customization:

```tsx
<AccordionRoot type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionHeader>
      <AccordionTrigger>Custom Section 1</AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      <div className="custom-content">Content 1</div>
    </AccordionContent>
  </AccordionItem>
</AccordionRoot>
```

## Styling

Components use className props for styling. Use with `@punk/tokens` for design system integration:

```tsx
<Button
  className="punk-button-primary"
  onClick={handleClick}
>
  Click me
</Button>

<Dialog
  className="punk-dialog-content"
  overlayClassName="punk-dialog-overlay"
  title="Custom Dialog"
>
  {/* content */}
</Dialog>
```

### CSS Class Convention

All components use the `punk-*` prefix for their CSS classes:

- `punk-button` - Button root
- `punk-dialog-overlay` - Dialog overlay
- `punk-dialog-content` - Dialog content
- `punk-tooltip-content` - Tooltip content
- `punk-accordion-trigger` - Accordion trigger
- etc.

## Accessibility

All components are built with accessibility in mind:

- **Keyboard Navigation** - Full keyboard support for all interactive elements
- **Screen Reader Support** - Proper ARIA attributes and semantic HTML
- **Focus Management** - Logical focus order and visible focus indicators
- **WCAG 2.1 AA** - Compliant with accessibility standards

### Required ARIA Labels

Interactive components require accessibility labels:

```tsx
// Using visible label
<Checkbox label="I agree to terms" />

// Using aria-label
<Checkbox aria-label="I agree to terms" />

// Radio group
<Radio
  aria-label="Select pricing plan"
  options={[
    { value: 'free', label: 'Free Plan' },
    { value: 'pro', label: 'Pro Plan' },
  ]}
/>
```

## TypeScript Support

All components are fully typed with comprehensive prop interfaces:

```tsx
import type { ButtonProps, DialogProps, CheckboxProps } from '@punk/components';

const customButton: ButtonProps = {
  variant: 'primary',
  size: 'md',
  onClick: () => console.log('clicked'),
  children: 'Click me',
};
```

## Testing

Components are tested with Vitest and React Testing Library:

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Related Packages

- `@punk/tokens` - Design tokens for styling
- `@punk/schema` - Schema validation for components
- `@punk/renderer` - Renders components from schemas

## License

MIT
