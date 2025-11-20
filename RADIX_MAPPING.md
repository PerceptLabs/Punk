# Punk to Radix Primitive Mappings

**Version:** 1.0.0
**Last Updated:** November 19, 2025
**Purpose:** Complete reference for how Punk components map to Radix UI primitives

---

## Overview

Punk components are high-level, schema-based wrappers around Radix UI primitives. Each Punk component:

- Maps to one or more Radix primitives
- Includes accessibility (WCAG 2.1 AA) out of the box
- Supports styling through TokiForge and Pink design tokens
- Validates props through Zod schemas
- Works with Punk's DataContext and ActionBus systems

---

## Quick Reference Table

| Punk Component | Radix Primitive | Package | Use Case |
|---|---|---|---|
| **dialog** | Dialog | @radix-ui/react-dialog | Modal dialogs, confirmations |
| **popover** | Popover | @radix-ui/react-popover | Popup menus, popovers |
| **tooltip** | Tooltip | @radix-ui/react-tooltip | Hover tooltips |
| **accordion** | Accordion | @radix-ui/react-accordion | Collapsible sections |
| **tabs** | Tabs | @radix-ui/react-tabs | Tabbed interfaces |
| **checkbox** | Checkbox | @radix-ui/react-checkbox | Toggle checkboxes |
| **radio** | RadioGroup | @radix-ui/react-radio-group | Radio button groups |
| **select** | Select | @radix-ui/react-select | Dropdown selections |
| **slider** | Slider | @radix-ui/react-slider | Range sliders |
| **switch** | Switch | @radix-ui/react-switch | Toggle switches |
| **button** | Button | @radix-ui/react-primitive | Clickable buttons |
| **input** | Input | @radix-ui/react-primitive | Text inputs |
| **textarea** | Textarea | @radix-ui/react-primitive | Multi-line text |
| **form** | Form | @radix-ui/react-primitive | Form container |
| **table** | Table | @radix-ui/react-primitive | Data tables |

---

## Detailed Component Mappings

### 1. Dialog

**Purpose:** Modal dialogs for confirmations, alerts, and important interactions.

**Punk Schema:**
```typescript
{
  type: "dialog",
  props: {
    open: true,
    onClose: "handleClose",
    title: "Confirm Action",
    description: "Are you sure you want to delete this item?"
  },
  children: [
    {
      type: "button",
      props: {
        onClick: "handleConfirm",
        children: "Delete",
        "aria-label": "Confirm deletion"
      }
    }
  ]
}
```

**Radix Implementation:**
```typescript
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root open={open} onOpenChange={onClose}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96">
      <Dialog.Title className="text-xl font-bold">
        Confirm Action
      </Dialog.Title>
      <Dialog.Description className="text-sm text-gray-600 mt-2">
        Are you sure you want to delete this item?
      </Dialog.Description>

      {/* Children rendered here */}
      <div className="mt-6 flex gap-3 justify-end">
        <button onClick={handleConfirm}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>

      <Dialog.Close className="absolute top-4 right-4">
        <span>×</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `open` | `open` (Root) | boolean | Controls dialog visibility |
| `onClose` | `onOpenChange` | callback | Called when dialog should close |
| `title` | `<Dialog.Title>` | string | Dialog title (required for a11y) |
| `description` | `<Dialog.Description>` | string | Dialog description (required for a11y) |
| `children` | `<Dialog.Content>` | ReactNode | Dialog content |

**ARIA Implementation:**

- `role="alertdialog"` - Automatically applied by Radix
- `aria-labelledby="dialog-title"` - Links to Dialog.Title
- `aria-describedby="dialog-description"` - Links to Dialog.Description
- `aria-modal="true"` - Automatically set
- Focus trap - Radix automatically traps focus
- Escape key - Closes dialog automatically

**Customization Examples:**

```typescript
// With TokiForge tokens
<Dialog.Content
  className="bg-[token(colors.surface)] border-[token(colors.border)]"
>
  {/* Content */}
</Dialog.Content>

// With size variants
{
  type: "dialog",
  props: {
    size: "lg", // or "sm", "md", "lg", "xl"
    // Maps to width classes via TokiForge
  }
}

// Controlled vs uncontrolled
// Controlled (Punk style):
{ open: true, onClose: "handler" }

// Uncontrolled (via defaultOpen):
{ open: false, defaultOpen: false }
```

---

### 2. Popover

**Purpose:** Floating panels for menus, filters, and contextual information.

**Punk Schema:**
```typescript
{
  type: "popover",
  props: {
    trigger: {
      type: "button",
      props: {
        children: "Open Menu",
        "aria-label": "Open options menu"
      }
    },
    content: "Popover content here",
    align: "start",
    side: "bottom"
  }
}
```

**Radix Implementation:**
```typescript
import * as Popover from '@radix-ui/react-popover'

<Popover.Root>
  <Popover.Trigger asChild>
    <button aria-label="Open options menu">
      Open Menu
    </button>
  </Popover.Trigger>

  <Popover.Portal>
    <Popover.Content
      align="start"
      side="bottom"
      sideOffset={5}
      className="bg-white border border-gray-200 rounded-md shadow-lg p-4"
    >
      Popover content here

      <Popover.Arrow className="fill-white" />
    </Popover.Content>
  </Popover.Portal>
</Popover.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Options |
|-----------|-----------|------|---------|
| `trigger` | `<Popover.Trigger>` | schema | Button or icon that opens popover |
| `content` | `<Popover.Content>` | string/schema | Popover body content |
| `align` | `align` | enum | 'start', 'center', 'end' |
| `side` | `side` | enum | 'top', 'right', 'bottom', 'left' |
| `open` | `open` | boolean | Controlled open state |
| `onOpenChange` | `onOpenChange` | callback | Called when state changes |

**ARIA Implementation:**

- `role="dialog"` - Automatically applied
- `aria-expanded` - Set on trigger based on open state
- `aria-haspopup="menu"` or `"dialog"` - Auto-detected
- Focus management - Radix handles focus trap
- Escape key - Closes popover
- Click outside - Closes popover

**Customization Examples:**

```typescript
// With submenu
{
  type: "popover",
  props: {
    trigger: { /* ... */ },
    content: {
      type: "container",
      children: [
        { type: "button", props: { children: "Option 1" } },
        { type: "button", props: { children: "Option 2" } }
      ]
    }
  }
}

// Position control
{
  type: "popover",
  props: {
    side: "right",
    align: "center",
    sideOffset: 10,
    alignOffset: -5
  }
}
```

---

### 3. Tooltip

**Purpose:** Brief informational tooltips on hover.

**Punk Schema:**
```typescript
{
  type: "tooltip",
  props: {
    content: "Click to submit",
    side: "top",
    delayDuration: 200
  },
  children: [
    {
      type: "button",
      props: {
        children: "Submit",
        "aria-label": "Submit form"
      }
    }
  ]
}
```

**Radix Implementation:**
```typescript
import * as Tooltip from '@radix-ui/react-tooltip'

<Tooltip.Provider>
  <Tooltip.Root delayDuration={200}>
    <Tooltip.Trigger asChild>
      <button aria-label="Submit form">
        Submit
      </button>
    </Tooltip.Trigger>

    <Tooltip.Portal>
      <Tooltip.Content
        side="top"
        sideOffset={5}
        className="bg-gray-900 text-white text-sm px-3 py-2 rounded"
      >
        Click to submit
        <Tooltip.Arrow className="fill-gray-900" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `content` | `<Tooltip.Content>` | string | Tooltip text |
| `side` | `side` | enum | 'top', 'right', 'bottom', 'left' |
| `delayDuration` | `delayDuration` | number | ms before showing (default: 400) |
| `children` | `<Tooltip.Trigger>` | schema | Element that triggers tooltip |

**ARIA Implementation:**

- `aria-describedby` - Links trigger to tooltip content
- `role="tooltip"` - Auto-applied to content
- Keyboard accessible - Tooltip shows on focus
- Screen reader announces - Tooltip content read on focus

**Customization Examples:**

```typescript
// Controlled tooltip
{
  type: "tooltip",
  props: {
    open: true,
    onOpenChange: "handleTooltipChange",
    content: "Help text"
  }
}

// With rich content
{
  type: "tooltip",
  props: {
    content: {
      type: "container",
      children: [
        { type: "text", props: { children: "Pro tip:" } },
        { type: "text", props: { children: "Use Ctrl+S to save" } }
      ]
    }
  }
}
```

---

### 4. Accordion

**Purpose:** Collapsible sections for FAQs, settings, and grouped content.

**Punk Schema:**
```typescript
{
  type: "accordion",
  props: {
    type: "single",
    collapsible: true,
    defaultValue: "item-1",
    items: [
      {
        value: "item-1",
        title: "Section 1",
        content: "Content for section 1"
      },
      {
        value: "item-2",
        title: "Section 2",
        content: "Content for section 2"
      },
      {
        value: "item-3",
        title: "Section 3",
        content: "Content for section 3"
      }
    ]
  }
}
```

**Radix Implementation:**
```typescript
import * as Accordion from '@radix-ui/react-accordion'

<Accordion.Root
  type="single"
  collapsible={true}
  defaultValue="item-1"
>
  {items.map((item) => (
    <Accordion.Item value={item.value} key={item.value}>
      <Accordion.Header>
        <Accordion.Trigger className="flex items-center justify-between w-full p-4 font-bold">
          {item.title}
          <span>▼</span>
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className="overflow-hidden p-4 border-t">
        {item.content}
      </Accordion.Content>
    </Accordion.Item>
  ))}
</Accordion.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Options |
|-----------|-----------|------|---------|
| `type` | `type` | enum | 'single', 'multiple' |
| `collapsible` | `collapsible` | boolean | Can collapse all items (single mode) |
| `defaultValue` | `defaultValue` | string/string[] | Initially open item(s) |
| `value` | `value` | string/string[] | Controlled open state |
| `items` | (array) | object[] | Array of {value, title, content} |

**ARIA Implementation:**

- `role="button"` - Applied to Accordion.Trigger
- `aria-expanded` - Indicates if section is open
- `aria-controls` - Links trigger to content
- Keyboard navigation - Arrow keys, Home, End supported
- `role="region"` - Applied to content section

**Customization Examples:**

```typescript
// Multiple open sections
{
  type: "accordion",
  props: {
    type: "multiple",
    items: [...]
  }
}

// Controlled accordion
{
  type: "accordion",
  props: {
    type: "single",
    value: "{{activeSection}}",
    onChange: "handleSectionChange",
    items: [...]
  }
}

// With nested accordions
{
  type: "accordion",
  props: {
    items: [
      {
        value: "parent-1",
        title: "Parent Section",
        content: {
          type: "accordion",
          props: {
            type: "single",
            items: [
              {
                value: "child-1",
                title: "Child Section",
                content: "Nested content"
              }
            ]
          }
        }
      }
    ]
  }
}
```

---

### 5. Tabs

**Purpose:** Tabbed interfaces for organizing content into logical sections.

**Punk Schema:**
```typescript
{
  type: "tabs",
  props: {
    defaultValue: "tab1",
    tabs: [
      {
        value: "tab1",
        label: "Tab 1",
        content: "Content for tab 1"
      },
      {
        value: "tab2",
        label: "Tab 2",
        content: "Content for tab 2"
      },
      {
        value: "tab3",
        label: "Tab 3",
        content: "Content for tab 3"
      }
    ]
  }
}
```

**Radix Implementation:**
```typescript
import * as Tabs from '@radix-ui/react-tabs'

<Tabs.Root defaultValue="tab1">
  <Tabs.List
    className="flex border-b border-gray-200"
    aria-label="Content tabs"
  >
    {tabs.map((tab) => (
      <Tabs.Trigger
        value={tab.value}
        key={tab.value}
        className="px-4 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500"
      >
        {tab.label}
      </Tabs.Trigger>
    ))}
  </Tabs.List>

  {tabs.map((tab) => (
    <Tabs.Content value={tab.value} key={tab.value} className="p-4">
      {tab.content}
    </Tabs.Content>
  ))}
</Tabs.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `defaultValue` | `defaultValue` | string | Initially active tab |
| `value` | `value` | string | Controlled active tab |
| `onChange` | `onValueChange` | callback | Called when tab changes |
| `orientation` | `orientation` | enum | 'horizontal', 'vertical' |
| `tabs` | (array) | object[] | Array of {value, label, content} |

**ARIA Implementation:**

- `role="tablist"` - Applied to Tabs.List
- `role="tab"` - Applied to Tabs.Trigger
- `aria-selected` - Shows if tab is active
- `aria-controls` - Links tab to panel
- `role="tabpanel"` - Applied to Tabs.Content
- Keyboard navigation - Arrow keys, Home, End

**Customization Examples:**

```typescript
// Vertical tabs
{
  type: "tabs",
  props: {
    orientation: "vertical",
    tabs: [...]
  }
}

// With icons
{
  type: "tabs",
  props: {
    tabs: [
      {
        value: "tab1",
        label: {
          type: "container",
          children: [
            { type: "image", props: { src: "icon.svg", alt: "" } },
            { type: "text", props: { children: "Tab 1" } }
          ]
        },
        content: "..."
      }
    ]
  }
}

// Lazy loading content
{
  type: "tabs",
  props: {
    onChange: "loadTabContent",
    tabs: [...]
  }
}
```

---

### 6. Checkbox

**Purpose:** Single or multiple checkboxes for boolean selections.

**Punk Schema:**
```typescript
{
  type: "checkbox",
  props: {
    name: "agree",
    checked: false,
    onChange: "handleChange",
    label: "I agree to terms and conditions",
    "aria-label": "I agree to terms and conditions"
  }
}
```

**Radix Implementation:**
```typescript
import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

<div className="flex items-center gap-2">
  <Checkbox.Root
    checked={checked}
    onCheckedChange={onChange}
    name="agree"
    aria-label="I agree to terms and conditions"
    className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center"
  >
    <Checkbox.Indicator>
      <Check className="w-4 h-4" />
    </Checkbox.Indicator>
  </Checkbox.Root>

  <label htmlFor="agree" className="text-sm">
    I agree to terms and conditions
  </label>
</div>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `checked` | `checked` | boolean/string | Current checked state |
| `defaultChecked` | `defaultChecked` | boolean | Initial state |
| `onChange` | `onCheckedChange` | callback | Called when state changes |
| `disabled` | `disabled` | boolean | Disables interaction |
| `label` | (text) | string | Visible label next to checkbox |
| `aria-label` | `aria-label` | string | Accessibility label (required) |

**ARIA Implementation:**

- `role="checkbox"` - Applied automatically
- `aria-checked` - Shows current state
- `tabindex="0"` - Keyboard accessible
- Space key - Toggles state
- Indeterminate state - Supported via `checked="indeterminate"`

**Customization Examples:**

```typescript
// Indeterminate (parent checkbox)
{
  type: "checkbox",
  props: {
    checked: "indeterminate",
    label: "Select all"
  }
}

// Group of checkboxes
{
  type: "container",
  children: [
    {
      type: "checkbox",
      props: {
        name: "option1",
        label: "Option 1",
        onChange: "handleOption1"
      }
    },
    {
      type: "checkbox",
      props: {
        name: "option2",
        label: "Option 2",
        onChange: "handleOption2"
      }
    }
  ]
}

// Custom styling with TokiForge
{
  type: "checkbox",
  props: {
    className: "w-[token(sizes.checkbox)] border-[token(colors.border)]",
    label: "Custom styled"
  }
}
```

---

### 7. Radio

**Purpose:** Single-selection from multiple options.

**Punk Schema:**
```typescript
{
  type: "radio",
  props: {
    name: "plan",
    value: "pro",
    onChange: "handleChange",
    "aria-label": "Select pricing plan",
    options: [
      { value: "free", label: "Free Plan - $0/month" },
      { value: "pro", label: "Pro Plan - $9/month" },
      { value: "enterprise", label: "Enterprise - Custom" }
    ]
  }
}
```

**Radix Implementation:**
```typescript
import * as RadioGroup from '@radix-ui/react-radio-group'

<RadioGroup.Root
  value={value}
  onValueChange={onChange}
  name="plan"
  aria-label="Select pricing plan"
  className="space-y-3"
>
  {options.map((option) => (
    <div key={option.value} className="flex items-center gap-2">
      <RadioGroup.Item
        value={option.value}
        id={`option-${option.value}`}
        className="w-5 h-5 border-2 border-gray-300 rounded-full"
      >
        <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </RadioGroup.Indicator>
      </RadioGroup.Item>

      <label htmlFor={`option-${option.value}`}>
        {option.label}
      </label>
    </div>
  ))}
</RadioGroup.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `value` | `value` | string | Currently selected option |
| `defaultValue` | `defaultValue` | string | Initial selection |
| `onChange` | `onValueChange` | callback | Called on selection change |
| `options` | (array) | object[] | Array of {value, label} |
| `disabled` | `disabled` | boolean | Disables group |
| `aria-label` | `aria-label` | string | Group label (required) |

**ARIA Implementation:**

- `role="radiogroup"` - Applied to root
- `role="radio"` - Applied to each item
- `aria-checked` - Indicates selection
- Arrow keys - Navigate options
- Space/Enter - Select option
- Automatic tab stop - Only one item in tab order

**Customization Examples:**

```typescript
// Vertical layout (default)
{
  type: "radio",
  props: {
    options: [...]
  }
}

// Horizontal layout
{
  type: "radio",
  props: {
    className: "flex gap-4",
    options: [...]
  }
}

// With descriptions
{
  type: "radio",
  props: {
    options: [
      {
        value: "free",
        label: "Free Plan",
        description: "Perfect for getting started"
      }
    ]
  }
}

// Disabled option
{
  type: "radio",
  props: {
    options: [
      { value: "pro", label: "Pro Plan", disabled: true }
    ]
  }
}
```

---

### 8. Select

**Purpose:** Dropdown selection list.

**Punk Schema:**
```typescript
{
  type: "select",
  props: {
    name: "country",
    value: "US",
    onChange: "handleChange",
    placeholder: "Select a country",
    "aria-label": "Select country",
    options: [
      { value: "US", label: "United States" },
      { value: "UK", label: "United Kingdom" },
      { value: "CA", label: "Canada" },
      { value: "AU", label: "Australia" }
    ]
  }
}
```

**Radix Implementation:**
```typescript
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

<Select.Root value={value} onValueChange={onChange} name="country">
  <Select.Trigger
    className="w-full px-3 py-2 border border-gray-300 rounded flex items-center justify-between"
    aria-label="Select country"
  >
    <Select.Value placeholder="Select a country" />
    <Select.Icon asChild>
      <ChevronDown className="w-4 h-4" />
    </Select.Icon>
  </Select.Trigger>

  <Select.Portal>
    <Select.Content className="bg-white border border-gray-200 rounded shadow-lg">
      <Select.ScrollUpButton className="flex justify-center items-center h-8">
        ▲
      </Select.ScrollUpButton>

      <Select.Viewport className="p-1">
        {options.map((option) => (
          <Select.Item
            value={option.value}
            key={option.value}
            className="px-3 py-2 flex items-center justify-between"
          >
            <Select.ItemText>{option.label}</Select.ItemText>
            <Select.ItemIndicator asChild>
              <Check className="w-4 h-4" />
            </Select.ItemIndicator>
          </Select.Item>
        ))}
      </Select.Viewport>

      <Select.ScrollDownButton className="flex justify-center items-center h-8">
        ▼
      </Select.ScrollDownButton>

      <Select.Separator />
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `value` | `value` | string | Currently selected option |
| `defaultValue` | `defaultValue` | string | Initial selection |
| `onChange` | `onValueChange` | callback | Called on selection |
| `options` | (array) | object[] | Array of {value, label} |
| `placeholder` | (text) | string | Placeholder when no value |
| `disabled` | `disabled` | boolean | Disables select |
| `aria-label` | `aria-label` | string | Accessibility label (required) |

**ARIA Implementation:**

- `role="combobox"` - Applied to trigger
- `role="listbox"` - Applied to content
- `aria-expanded` - Shows if open
- `aria-controls` - Links trigger to listbox
- Arrow keys - Navigate options
- Type-ahead - Jump to options by typing
- Enter/Space - Select option

**Customization Examples:**

```typescript
// Grouped options
{
  type: "select",
  props: {
    options: [
      {
        label: "North America",
        items: [
          { value: "US", label: "United States" },
          { value: "CA", label: "Canada" }
        ]
      }
    ]
  }
}

// Searchable (custom)
{
  type: "select",
  props: {
    searchable: true,
    filterFn: "customFilter",
    options: [...]
  }
}

// Multi-select
{
  type: "container",
  children: [
    { type: "checkbox", props: { label: "Option 1" } },
    { type: "checkbox", props: { label: "Option 2" } }
  ]
}

// Native select fallback
{
  type: "select",
  props: {
    native: true,
    options: [...]
  }
}
```

---

### 9. Slider

**Purpose:** Range slider for numeric input.

**Punk Schema:**
```typescript
{
  type: "slider",
  props: {
    name: "volume",
    min: 0,
    max: 100,
    step: 5,
    value: 50,
    onChange: "handleChange",
    "aria-label": "Volume control"
  }
}
```

**Radix Implementation:**
```typescript
import * as Slider from '@radix-ui/react-slider'

<Slider.Root
  min={0}
  max={100}
  step={5}
  value={[value]}
  onValueChange={(val) => onChange(val[0])}
  className="relative flex items-center select-none touch-none w-full h-5"
  aria-label="Volume control"
>
  <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-full">
    <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
  </Slider.Track>

  <Slider.Thumb
    className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
    aria-label="Volume"
  />
</Slider.Root>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `value` | `value` | number/number[] | Current value(s) |
| `min` | `min` | number | Minimum value |
| `max` | `max` | number | Maximum value |
| `step` | `step` | number | Step increment |
| `onChange` | `onValueChange` | callback | Called when value changes |
| `disabled` | `disabled` | boolean | Disables slider |
| `aria-label` | `aria-label` | string | Accessibility label (required) |

**ARIA Implementation:**

- `role="slider"` - Applied to thumb
- `aria-valuemin` - Minimum value
- `aria-valuemax` - Maximum value
- `aria-valuenow` - Current value
- `aria-valuetext` - Text representation
- Arrow keys - Adjust value
- Page Up/Down - Large adjustments
- Home/End - Min/max values

**Customization Examples:**

```typescript
// Range slider (min and max)
{
  type: "slider",
  props: {
    value: [20, 80],
    onChange: "handleRangeChange"
  }
}

// With labels
{
  type: "container",
  children: [
    { type: "text", props: { children: "$0" } },
    {
      type: "slider",
      props: {
        value: 50,
        min: 0,
        max: 100
      }
    },
    { type: "text", props: { children: "$100" } }
  ]
}

// Vertical orientation
{
  type: "slider",
  props: {
    orientation: "vertical",
    className: "h-48",
    value: 50
  }
}
```

---

### 10. Switch

**Purpose:** Toggle switch for binary states.

**Punk Schema:**
```typescript
{
  type: "switch",
  props: {
    name: "notifications",
    checked: true,
    onChange: "handleChange",
    label: "Enable notifications",
    "aria-label": "Enable notifications"
  }
}
```

**Radix Implementation:**
```typescript
import * as Switch from '@radix-ui/react-switch'

<div className="flex items-center gap-3">
  <Switch.Root
    checked={checked}
    onCheckedChange={onChange}
    name="notifications"
    className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 transition"
    aria-label="Enable notifications"
  >
    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform data-[state=checked]:translate-x-5" />
  </Switch.Root>

  <label htmlFor="notifications" className="text-sm">
    Enable notifications
  </label>
</div>
```

**Prop Translation:**

| Punk Prop | Radix Prop | Type | Notes |
|-----------|-----------|------|-------|
| `checked` | `checked` | boolean | Current state |
| `defaultChecked` | `defaultChecked` | boolean | Initial state |
| `onChange` | `onCheckedChange` | callback | Called when toggled |
| `disabled` | `disabled` | boolean | Disables interaction |
| `label` | (text) | string | Visible label |
| `aria-label` | `aria-label` | string | Accessibility label (required) |

**ARIA Implementation:**

- `role="switch"` - Applied automatically
- `aria-checked` - Shows current state
- Space key - Toggles state
- Fully keyboard accessible

**Customization Examples:**

```typescript
// With description
{
  type: "container",
  children: [
    { type: "text", props: { children: "Dark Mode" } },
    { type: "text", props: { className: "text-sm text-gray-500", children: "Easier on the eyes" } },
    { type: "switch", props: { checked: false, onChange: "toggleDarkMode" } }
  ]
}

// Custom styling
{
  type: "switch",
  props: {
    checked: true,
    className: "w-[token(sizes.switch)] bg-[token(colors.primary)]"
  }
}
```

---

## Native HTML Components in Punk

The following Punk components wrap native HTML elements (not Radix UI):

### Button
```typescript
// Maps to <button>
// No Radix primitive, uses native HTML

// Punk schema
{
  type: "button",
  props: {
    variant: "primary",
    size: "md",
    onClick: "handleClick",
    "aria-label": "Click me",
    children: "Click Me"
  }
}

// Renders to
<button
  className="..."
  aria-label="Click me"
  onClick={handleClick}
>
  Click Me
</button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `type`: 'button' | 'submit' | 'reset'
- `onClick`: handler reference
- `aria-label`: required for accessibility

---

### Input
```typescript
// Maps to <input>
// Supports various HTML5 input types

// Punk schema
{
  type: "input",
  props: {
    type: "email",
    name: "email",
    placeholder: "Email address",
    required: true,
    "aria-label": "Email address"
  }
}

// Supports types
- text, email, password, tel, url, search
- number, date, time, datetime-local
- color, file, hidden
```

**Props:**
- `type`: HTML input type
- `name`: field name
- `placeholder`: placeholder text
- `value`: controlled value
- `defaultValue`: initial value
- `required`: boolean
- `disabled`: boolean
- `aria-label`: required

---

### Textarea
```typescript
// Maps to <textarea>

// Punk schema
{
  type: "textarea",
  props: {
    name: "description",
    placeholder: "Enter description...",
    rows: 4,
    "aria-label": "Description"
  }
}
```

**Props:**
- `name`: field name
- `placeholder`: placeholder text
- `rows`: number of rows
- `cols`: number of columns
- `value`: controlled value
- `defaultValue`: initial value
- `aria-label`: required

---

### Form
```typescript
// Maps to <form>

// Punk schema
{
  type: "form",
  props: {
    onSubmit: "handleSubmit",
    "aria-label": "Login form"
  },
  children: [
    // form fields
  ]
}
```

**Props:**
- `onSubmit`: form submission handler
- `className`: CSS classes
- `aria-label`: form description (required)

---

### Table
```typescript
// Maps to <table>, <thead>, <tbody>, <tr>, <td>

// Punk schema
{
  type: "table",
  props: {
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" }
    ],
    dataSource: "users"
  }
}
```

**Props:**
- `columns`: column definitions
- `dataSource`: context key for data
- `className`: CSS classes

---

## Integration with TokiForge and Pink Design System

All components integrate with TokiForge tokens and Pink design variables:

### Design Token Usage

```typescript
// Using TokiForge tokens in Punk schemas
{
  type: "button",
  props: {
    className: "bg-[token(colors.primary)] text-[token(colors.primary-foreground)]"
  }
}

// Token categories available via Pink
- colors: primary, secondary, accent, destructive, muted, etc.
- sizes: sm, md, lg, xl, 2xl
- spacing: 0, 1, 2, 4, 8, 16, etc.
- borderRadius: sm, md, lg, full
- shadows: sm, md, lg, xl
- typography: various font families and sizes
```

### Example with Complete Token Usage

```typescript
{
  type: "dialog",
  props: {
    className: "bg-[token(colors.surface)] border-[token(colors.border)]"
  },
  children: [
    {
      type: "heading",
      props: {
        level: 2,
        className: "text-[token(typography.heading-2)] text-[token(colors.foreground)]",
        children: "Confirm Action"
      }
    },
    {
      type: "button",
      props: {
        className: "px-[token(spacing.4)] py-[token(spacing.2)] rounded-[token(borderRadius.md)]",
        children: "Confirm"
      }
    }
  ]
}
```

---

## Prop Translation Strategy

### Common Patterns

**Event Handlers:**
```typescript
// Punk uses string references
{ onClick: "handleClick" }
{ onChange: "handleChange" }
{ onSubmit: "handleFormSubmit" }

// Resolved at render time
handlers: {
  handleClick: (e) => { /* ... */ },
  handleChange: (value) => { /* ... */ },
  handleFormSubmit: (e) => { /* ... */ }
}
```

**Data Binding:**
```typescript
// Template interpolation
{ children: "{{user.name}}" }
{ value: "{{selectedOption}}" }

// Resolved from DataContext
context: {
  user: { name: "John" },
  selectedOption: "option-1"
}
```

**ARIA Attributes:**
```typescript
// Required for all interactive elements
{ "aria-label": "Accessibility description" }
{ "aria-describedby": "help-text-id" }
{ "aria-expanded": "true" }
```

---

## Accessibility Guarantees

Every Punk component includes accessibility features:

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All controls keyboard accessible
   - Tab order logical
   - Focus visible
   - Escape closes modals

2. **Screen Reader Support**
   - All aria-labels present
   - Semantic roles applied
   - Changes announced
   - States communicated

3. **Visual Design**
   - Sufficient color contrast
   - Focus indicators visible
   - Text not color-only encoded
   - Sufficient touch targets (44x44px)

4. **Responsive Design**
   - Works at various zoom levels
   - Mobile-friendly touch targets
   - Text resizable
   - No horizontal scrolling at 200% zoom

---

## Customization Guide

### Styling Approach

1. **TokiForge Tokens (Recommended)**
   ```typescript
   className: "bg-[token(colors.primary)] border-[token(colors.border)]"
   ```

2. **Tailwind Classes**
   ```typescript
   className: "bg-blue-500 border border-gray-200 rounded-md"
   ```

3. **CSS Variables**
   ```typescript
   className: "bg-[var(--color-primary)] border-[var(--color-border)]"
   ```

### Component Override Examples

```typescript
// Override dialog styling
{
  type: "dialog",
  props: {
    className: "w-full max-w-2xl shadow-2xl",
    // Custom styling
  }
}

// Custom popover positioning
{
  type: "popover",
  props: {
    side: "right",
    align: "start",
    sideOffset: 8,
    alignOffset: -4
  }
}

// Custom accordion animation
{
  type: "accordion",
  props: {
    items: [
      {
        value: "item-1",
        title: "Custom Title",
        content: "Content with animation",
        className: "animate-slideDown"
      }
    ]
  }
}
```

---

## Best Practices

### 1. Accessibility First
- Always provide `aria-label` for interactive elements
- Use semantic component types
- Test with keyboard navigation
- Verify with screen readers

### 2. Props as Strings
- Keep event handler references as strings
- Use template interpolation for data binding
- Let PunkRenderer resolve at render time

### 3. Component Composition
- Use containers for layout
- Nest components for complex UIs
- Reuse common patterns

### 4. Data Context
- Keep state in context
- Use dataSource for lists
- Leverage template interpolation

### 5. Progressive Enhancement
- Start with basic components
- Add Radix features incrementally
- Override defaults only when needed

---

## Radix UI Packages Used

```json
{
  "@radix-ui/react-accordion": "^1.0.0",
  "@radix-ui/react-checkbox": "^1.0.0",
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-popover": "^1.0.0",
  "@radix-ui/react-radio-group": "^1.1.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-slider": "^1.1.0",
  "@radix-ui/react-switch": "^1.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  "@radix-ui/react-tooltip": "^1.0.0"
}
```

---

## Related Documentation

- [Component Reference](COMPONENT_REFERENCE.md) - Full component API
- [Architecture](ARCHITECTURE.md) - System design details
- [Foundation Spec](PUNK_FOUNDATION_SPEC.md) - Technical foundations
- [Getting Started](GETTING_STARTED.md) - Quick start guide
- [Philosophy](PHILOSOPHY.md) - Design principles

---

**Last Updated:** November 19, 2025
**Maintained by:** Punk Team
**License:** MIT
