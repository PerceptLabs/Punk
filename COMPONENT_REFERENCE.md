# Component Reference

Complete reference for all Punk components.

---

## Overview

Punk provides a comprehensive set of accessible, type-safe components built on Radix UI primitives. Every component:

- ✅ **Meets WCAG 2.1 AA** accessibility standards
- ✅ **Fully type-safe** with TypeScript
- ✅ **Keyboard navigable** out of the box
- ✅ **Screen reader compatible**
- ✅ **Consistently styled** with Tailwind CSS

---

## Layout Components

### Container

Generic container for layout.

**Schema:**
```json
{
  "type": "container",
  "props": {
    "className": "flex flex-col gap-4 p-6"
  },
  "children": [...]
}
```

**Props:**
- `className` (string) - Tailwind classes
- `role` (string) - ARIA role
- `aria-label` (string) - Accessibility label

---

## Typography Components

### Heading

Semantic headings (h1-h6).

**Schema:**
```json
{
  "type": "heading",
  "props": {
    "level": 1,
    "className": "text-4xl font-bold",
    "children": "Page Title"
  }
}
```

**Props:**
- `level` (1-6) - Heading level (required)
- `className` (string) - Tailwind classes
- `children` (string) - Heading text (required)

### Text

Paragraph text.

**Schema:**
```json
{
  "type": "text",
  "props": {
    "className": "text-gray-600",
    "children": "This is a paragraph."
  }
}
```

**Props:**
- `className` (string) - Tailwind classes
- `children` (string) - Text content (required)

---

## Form Components

### Form

Form container with submission handling.

**Schema:**
```json
{
  "type": "form",
  "props": {
    "onSubmit": "handleSubmit",
    "aria-label": "Login form"
  },
  "children": [...]
}
```

**Props:**
- `onSubmit` (string) - Submit handler reference (required)
- `className` (string) - Tailwind classes
- `aria-label` (string) - Form description (required)

### Input

Text input field.

**Schema:**
```json
{
  "type": "input",
  "props": {
    "name": "email",
    "type": "email",
    "placeholder": "Email address",
    "required": true,
    "aria-label": "Email address"
  }
}
```

**Props:**
- `name` (string) - Input name (required)
- `type` (string) - Input type (text, email, password, etc.)
- `placeholder` (string) - Placeholder text
- `value` (string) - Controlled value
- `defaultValue` (string) - Uncontrolled default
- `required` (boolean) - Required field
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Accessibility label (required)
- `className` (string) - Tailwind classes

**Types:**
- `text`, `email`, `password`, `tel`, `url`, `search`
- `number`, `date`, `time`, `datetime-local`
- `color`, `file`, `hidden`

### Textarea

Multi-line text input.

**Schema:**
```json
{
  "type": "textarea",
  "props": {
    "name": "description",
    "placeholder": "Enter description...",
    "rows": 4,
    "aria-label": "Description"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `placeholder` (string) - Placeholder text
- `rows` (number) - Number of rows (default: 3)
- `value` (string) - Controlled value
- `aria-label` (string) - Accessibility label (required)
- `className` (string) - Tailwind classes

### Button

Clickable button.

**Schema:**
```json
{
  "type": "button",
  "props": {
    "variant": "primary",
    "size": "md",
    "onClick": "handleClick",
    "aria-label": "Submit form",
    "children": "Submit"
  }
}
```

**Props:**
- `variant` ('primary' | 'secondary' | 'outline' | 'ghost') - Button style
- `size` ('sm' | 'md' | 'lg') - Button size
- `type` ('button' | 'submit' | 'reset') - Button type
- `onClick` (string) - Click handler reference
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Accessibility label (required)
- `children` (string) - Button text (required)
- `className` (string) - Tailwind classes

### Checkbox

Toggle checkbox.

**Schema:**
```json
{
  "type": "checkbox",
  "props": {
    "name": "agree",
    "checked": false,
    "onChange": "handleChange",
    "aria-label": "I agree to terms",
    "label": "I agree to terms and conditions"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `checked` (boolean) - Checked state
- `defaultChecked` (boolean) - Default state
- `onChange` (string) - Change handler
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Accessibility label (required)
- `label` (string) - Visible label
- `className` (string) - Tailwind classes

### Radio

Radio button group.

**Schema:**
```json
{
  "type": "radio",
  "props": {
    "name": "plan",
    "value": "pro",
    "options": [
      { "value": "free", "label": "Free Plan" },
      { "value": "pro", "label": "Pro Plan" },
      { "value": "enterprise", "label": "Enterprise Plan" }
    ],
    "onChange": "handleChange",
    "aria-label": "Select plan"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `value` (string) - Selected value
- `options` (array) - Radio options (required)
- `onChange` (string) - Change handler
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Group label (required)

### Select

Dropdown select.

**Schema:**
```json
{
  "type": "select",
  "props": {
    "name": "country",
    "value": "US",
    "options": [
      { "value": "US", "label": "United States" },
      { "value": "UK", "label": "United Kingdom" },
      { "value": "CA", "label": "Canada" }
    ],
    "onChange": "handleChange",
    "aria-label": "Select country"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `value` (string) - Selected value
- `options` (array) - Select options (required)
- `onChange` (string) - Change handler
- `placeholder` (string) - Placeholder text
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Accessibility label (required)

### Slider

Range slider.

**Schema:**
```json
{
  "type": "slider",
  "props": {
    "name": "volume",
    "value": 50,
    "min": 0,
    "max": 100,
    "step": 1,
    "onChange": "handleChange",
    "aria-label": "Volume control"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `value` (number) - Current value
- `min` (number) - Minimum value (default: 0)
- `max` (number) - Maximum value (default: 100)
- `step` (number) - Step increment (default: 1)
- `onChange` (string) - Change handler
- `aria-label` (string) - Accessibility label (required)

### Switch

Toggle switch.

**Schema:**
```json
{
  "type": "switch",
  "props": {
    "name": "notifications",
    "checked": true,
    "onChange": "handleChange",
    "aria-label": "Enable notifications",
    "label": "Enable notifications"
  }
}
```

**Props:**
- `name` (string) - Field name (required)
- `checked` (boolean) - Checked state
- `onChange` (string) - Change handler
- `disabled` (boolean) - Disabled state
- `aria-label` (string) - Accessibility label (required)
- `label` (string) - Visible label

---

## Interactive Components

### Dialog

Modal dialog.

**Schema:**
```json
{
  "type": "dialog",
  "props": {
    "open": true,
    "onClose": "handleClose",
    "title": "Confirm Action",
    "description": "Are you sure you want to delete this item?"
  },
  "children": [...]
}
```

**Props:**
- `open` (boolean) - Open state (required)
- `onClose` (string) - Close handler (required)
- `title` (string) - Dialog title (required)
- `description` (string) - Dialog description
- `className` (string) - Tailwind classes

### Popover

Popup menu or tooltip.

**Schema:**
```json
{
  "type": "popover",
  "props": {
    "trigger": { "type": "button", "props": { "children": "Open" } },
    "content": "Popover content"
  }
}
```

**Props:**
- `trigger` (schema) - Trigger element (required)
- `content` (string | schema) - Popover content (required)
- `align` ('start' | 'center' | 'end') - Alignment
- `side` ('top' | 'right' | 'bottom' | 'left') - Side

### Tooltip

Hover tooltip.

**Schema:**
```json
{
  "type": "tooltip",
  "props": {
    "content": "Click to submit",
    "children": { "type": "button", "props": { "children": "Submit" } }
  }
}
```

**Props:**
- `content` (string) - Tooltip text (required)
- `side` ('top' | 'right' | 'bottom' | 'left') - Tooltip side
- `children` (schema) - Wrapped element (required)

---

## Display Components

### Accordion

Collapsible sections.

**Schema:**
```json
{
  "type": "accordion",
  "props": {
    "type": "single",
    "items": [
      {
        "value": "item-1",
        "title": "Section 1",
        "content": "Content for section 1"
      },
      {
        "value": "item-2",
        "title": "Section 2",
        "content": "Content for section 2"
      }
    ]
  }
}
```

**Props:**
- `type` ('single' | 'multiple') - Expansion mode (required)
- `items` (array) - Accordion items (required)
- `defaultValue` (string | string[]) - Default opened

### Tabs

Tabbed interface.

**Schema:**
```json
{
  "type": "tabs",
  "props": {
    "defaultValue": "tab1",
    "tabs": [
      { "value": "tab1", "label": "Tab 1", "content": "Content 1" },
      { "value": "tab2", "label": "Tab 2", "content": "Content 2" }
    ]
  }
}
```

**Props:**
- `tabs` (array) - Tab definitions (required)
- `defaultValue` (string) - Default active tab
- `onChange` (string) - Change handler

### Table

Data table.

**Schema:**
```json
{
  "type": "table",
  "props": {
    "columns": [
      { "key": "name", "header": "Name" },
      { "key": "email", "header": "Email" },
      { "key": "role", "header": "Role" }
    ],
    "dataSource": "users"
  }
}
```

**Props:**
- `columns` (array) - Column definitions (required)
- `dataSource` (string) - Data context key (required)
- `className` (string) - Tailwind classes

---

## Data Components

### List

Repeating list.

**Schema:**
```json
{
  "type": "list",
  "props": {
    "role": "list",
    "aria-label": "Task list"
  },
  "dataSource": "tasks",
  "itemTemplate": {
    "type": "listItem",
    "props": { "role": "listitem" },
    "children": [
      {
        "type": "text",
        "props": { "children": "{{item.title}}" }
      }
    ]
  }
}
```

**Props:**
- `dataSource` (string) - Data context key (required)
- `itemTemplate` (schema) - Template for each item (required)
- `role` (string) - ARIA role
- `aria-label` (string) - List description

**Template Variables:**
- `{{item}}` - Current item
- `{{index}}` - Current index

---

## Media Components

### Image

Image display.

**Schema:**
```json
{
  "type": "image",
  "props": {
    "src": "/path/to/image.jpg",
    "alt": "Description of image",
    "width": 400,
    "height": 300
  }
}
```

**Props:**
- `src` (string) - Image source (required)
- `alt` (string) - Alt text (required for accessibility)
- `width` (number) - Image width
- `height` (number) - Image height
- `className` (string) - Tailwind classes

### Link

Hyperlink.

**Schema:**
```json
{
  "type": "link",
  "props": {
    "href": "/about",
    "children": "Learn more",
    "aria-label": "Learn more about our company"
  }
}
```

**Props:**
- `href` (string) - Link destination (required)
- `target` ('_self' | '_blank') - Link target
- `children` (string) - Link text (required)
- `aria-label` (string) - Accessibility label
- `className` (string) - Tailwind classes

---

## Example: Complete Form

```json
{
  "type": "container",
  "props": {
    "className": "max-w-md mx-auto p-6"
  },
  "children": [
    {
      "type": "heading",
      "props": {
        "level": 2,
        "children": "Contact Us"
      }
    },
    {
      "type": "form",
      "props": {
        "onSubmit": "handleSubmit",
        "aria-label": "Contact form",
        "className": "space-y-4 mt-6"
      },
      "children": [
        {
          "type": "input",
          "props": {
            "name": "name",
            "type": "text",
            "placeholder": "Your name",
            "required": true,
            "aria-label": "Your name"
          }
        },
        {
          "type": "input",
          "props": {
            "name": "email",
            "type": "email",
            "placeholder": "Email address",
            "required": true,
            "aria-label": "Email address"
          }
        },
        {
          "type": "textarea",
          "props": {
            "name": "message",
            "placeholder": "Your message",
            "rows": 4,
            "required": true,
            "aria-label": "Your message"
          }
        },
        {
          "type": "button",
          "props": {
            "type": "submit",
            "variant": "primary",
            "children": "Send Message",
            "aria-label": "Send your message"
          }
        }
      ]
    }
  ]
}
```

---

[Back to README](README.md) • [Getting Started](GETTING_STARTED.md) • [Architecture](ARCHITECTURE.md)
