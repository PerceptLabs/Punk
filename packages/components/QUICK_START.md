# @punk/components - Quick Start Guide

## Installation

```bash
cd /home/user/Punk/packages/components
npm install
```

## Build

```bash
npm run build        # Production build
npm run dev          # Development watch mode
npm run typecheck    # Type check only
```

## Test

```bash
npm test             # Run tests once
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Import Components

```tsx
// Named imports
import { Button, Dialog, Tabs, Checkbox } from '@punk/components';

// Or individual imports
import { Button } from '@punk/components/button';
import { Dialog } from '@punk/components/dialog';
```

## Quick Examples

### Button

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

### Dialog

```tsx
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Confirm Action"
  description="Are you sure?"
>
  <Button onClick={handleConfirm}>Confirm</Button>
</Dialog>
```

### Tabs

```tsx
<Tabs
  defaultValue="tab1"
  tabs={[
    { value: 'tab1', label: 'Overview', content: <div>Content 1</div> },
    { value: 'tab2', label: 'Details', content: <div>Content 2</div> },
  ]}
/>
```

### Checkbox

```tsx
<Checkbox
  label="I agree to terms"
  checked={agreed}
  onCheckedChange={setAgreed}
/>
```

### Radio

```tsx
<Radio
  aria-label="Select plan"
  value={plan}
  onValueChange={setPlan}
  options={[
    { value: 'free', label: 'Free Plan' },
    { value: 'pro', label: 'Pro Plan' },
  ]}
/>
```

### Select

```tsx
<Select
  placeholder="Select country"
  value={country}
  onValueChange={setCountry}
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

### Slider

```tsx
<Slider
  value={[volume]}
  onValueChange={(val) => setVolume(val[0])}
  min={0}
  max={100}
  step={5}
  aria-label="Volume"
/>
```

### Switch

```tsx
<Switch
  label="Enable notifications"
  checked={enabled}
  onCheckedChange={setEnabled}
/>
```

### Accordion

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

### Popover

```tsx
<Popover
  trigger={<Button>Open</Button>}
  content={<div>Popover content</div>}
  side="bottom"
  align="start"
/>
```

### Tooltip

```tsx
<Tooltip content="Helpful hint" side="top">
  <Button>Hover me</Button>
</Tooltip>
```

## Component List

All 10 components implemented:

1. Button - Native button with variants
2. Dialog - Modal dialogs
3. Popover - Floating panels
4. Tooltip - Hover tooltips
5. Accordion - Collapsible sections
6. Tabs - Tabbed interfaces
7. Checkbox - Toggle checkboxes
8. Radio - Radio button groups
9. Select - Dropdown select
10. Slider - Range sliders
11. Switch - Toggle switches

## Next Steps

1. Add CSS styles (use `punk-*` class names)
2. Integrate with `@punk/tokens` for theming
3. Create Storybook stories
4. Add more tests

## Documentation

- Full specs: `/home/user/Punk/RADIX_MAPPING.md`
- Component details: `/home/user/Punk/packages/components/COMPONENT_SUMMARY.md`
- Package README: `/home/user/Punk/packages/components/README.md`
