# Punk Framework: Foundation Specification

**Version:** 1.0.0
**Last Updated:** November 19, 2025
**Status:** Final
**Purpose:** Complete technical foundation for Punk Pragmatism - deterministic, verifiable, safe AI code generation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Complete Zod Schemas](#2-complete-zod-schemas)
3. [Complexity Budgets](#3-complexity-budgets)
4. [Pink Token Taxonomy](#4-pink-token-taxonomy)
5. [TokiForge Resolution Specification](#5-tokiforge-resolution-specification)
6. [DataContext Resolution Algorithm](#6-datacontext-resolution-algorithm)
7. [Performance & Security Budgets](#7-performance--security-budgets)
8. [Validation Pipeline](#8-validation-pipeline)
9. [Error Recovery Strategies](#9-error-recovery-strategies)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete technical foundation for the Punk Framework, ensuring:

- **Determinism**: Same schema always produces same output
- **Verifiability**: All outputs can be validated against schemas
- **Safety**: No arbitrary code execution, all operations sandboxed
- **Accessibility**: WCAG 2.1 Level AA compliance guaranteed
- **Performance**: Predictable, bounded rendering times

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   AI Model (Claude Sonnet 4.5)          │
│                   Generates JSON Schema                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Zod Validation Layer                       │
│   • Structural validation                               │
│   • Type checking                                       │
│   • Enum validation                                     │
│   • Complexity budgets                                  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Semantic Validation                        │
│   • Accessibility checks                                │
│   • Data binding validation                             │
│   • Token reference validation                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              TokiForge + DataContext                    │
│   • Resolve design tokens                               │
│   • Bind data paths                                     │
│   • Apply theme context                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Puck Renderer                              │
│   • React components (Radix UI)                         │
│   • ARIA attributes                                     │
│   • Keyboard navigation                                 │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Framework Components Recap

- **Puck**: Deterministic renderer (React + Radix UI)
- **Radix**: Accessible primitive components
- **Pink**: Design system with semantic tokens
- **Zod**: Runtime validation library
- **TokiForge**: Styling runtime for token resolution

---

## 2. Complete Zod Schemas

### 2.1 Base Schema Types

#### 2.1.1 Core Types

```typescript
import { z } from 'zod'

// Base node type that all components extend
const PunkBaseNodeSchema = z.object({
  type: z.string(),
  id: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/), // Valid identifier
  key: z.string().optional(), // React key for lists
  testId: z.string().optional(), // data-testid for testing
  className: z.string().optional(), // Additional CSS classes
  style: z.record(z.string()).optional(), // Inline styles (discouraged)
})

// Common props shared across components
const AccessibilityPropsSchema = z.object({
  ariaLabel: z.string().optional(),
  ariaDescribedBy: z.string().optional(),
  ariaLabelledBy: z.string().optional(),
  role: z.string().optional(),
  tabIndex: z.number().optional(),
})

// Event handler reference (key in ActionBus)
const EventHandlerSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)

// Data binding path (e.g., "user.profile.name")
const DataPathSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.[\]]*$/)

// Token reference (e.g., "tokens.colors.accentSolid")
const TokenRefSchema = z.string().regex(/^tokens\.[a-zA-Z][a-zA-Z0-9_.]*$/)

// Size variants (standardized across components)
const SizeSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

// Tone variants (semantic color mapping)
const ToneSchema = z.enum([
  'accent',     // Primary brand color
  'neutral',    // Gray/neutral
  'critical',   // Error/danger
  'success',    // Success/positive
  'warning',    // Warning/caution
  'info',       // Informational
])

// Variant types (visual style)
const VariantSchema = z.enum([
  'solid',      // Filled background
  'soft',       // Subtle background
  'outline',    // Border only
  'ghost',      // No background, minimal style
])
```

### 2.2 Foundation Components

#### 2.2.1 Text Component

```typescript
const TextSchema = PunkBaseNodeSchema.extend({
  type: z.literal('text'),
  props: z.object({
    children: z.union([z.string(), DataPathSchema]),
    size: SizeSchema.default('md'),
    weight: z.enum(['regular', 'medium', 'semibold', 'bold']).default('regular'),
    align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
    color: z.union([TokenRefSchema, z.string()]).optional(),
    truncate: z.boolean().default(false),
    italic: z.boolean().default(false),
    underline: z.boolean().default(false),
    strikethrough: z.boolean().default(false),
    transform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
    lineClamp: z.number().int().positive().optional(), // Max lines before truncation
    ...AccessibilityPropsSchema.shape,
  }),
})
```

#### 2.2.2 Heading Component

```typescript
const HeadingSchema = PunkBaseNodeSchema.extend({
  type: z.literal('heading'),
  props: z.object({
    children: z.union([z.string(), DataPathSchema]),
    level: z.enum(['1', '2', '3', '4', '5', '6']).default('2'), // Semantic level
    size: SizeSchema.default('lg'), // Visual size (can differ from semantic level)
    weight: z.enum(['regular', 'medium', 'semibold', 'bold']).default('bold'),
    align: z.enum(['left', 'center', 'right']).default('left'),
    color: z.union([TokenRefSchema, z.string()]).optional(),
    ...AccessibilityPropsSchema.shape,
  }),
})
```

#### 2.2.3 Icon Component

```typescript
const IconSchema = PunkBaseNodeSchema.extend({
  type: z.literal('icon'),
  props: z.object({
    name: z.string(), // Icon name from icon library
    library: z.enum(['lucide', 'heroicons', 'radix']).default('lucide'),
    size: SizeSchema.default('md'),
    color: z.union([TokenRefSchema, z.string()]).optional(),
    strokeWidth: z.number().min(1).max(3).optional(),
    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string(), // Required for accessibility
  }),
})
```

#### 2.2.4 Divider Component

```typescript
const DividerSchema = PunkBaseNodeSchema.extend({
  type: z.literal('divider'),
  props: z.object({
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    size: z.enum(['sm', 'md', 'lg']).default('md'), // Thickness
    color: z.union([TokenRefSchema, z.string()]).optional(),
    decorative: z.boolean().default(true), // If true, aria-hidden
    label: z.string().optional(), // Text label for semantic divider
    ...AccessibilityPropsSchema.shape,
  }),
})
```

#### 2.2.5 Row Component

```typescript
const RowSchema = PunkBaseNodeSchema.extend({
  type: z.literal('row'),
  props: z.object({
    gap: z.union([z.number(), TokenRefSchema]).default(0), // Spacing between children
    align: z.enum(['start', 'center', 'end', 'stretch', 'baseline']).default('start'),
    justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).default('start'),
    wrap: z.boolean().default(false),
    ...AccessibilityPropsSchema.shape,
  }),
  children: z.array(z.lazy(() => PunkNodeSchema)).min(1),
})
```

#### 2.2.6 Col Component

```typescript
const ColSchema = PunkBaseNodeSchema.extend({
  type: z.literal('col'),
  props: z.object({
    gap: z.union([z.number(), TokenRefSchema]).default(0),
    align: z.enum(['start', 'center', 'end', 'stretch']).default('start'),
    justify: z.enum(['start', 'center', 'end', 'between', 'around', 'evenly']).default('start'),
    ...AccessibilityPropsSchema.shape,
  }),
  children: z.array(z.lazy(() => PunkNodeSchema)).min(1),
})
```

#### 2.2.7 Spacer Component

```typescript
const SpacerSchema = PunkBaseNodeSchema.extend({
  type: z.literal('spacer'),
  props: z.object({
    size: z.union([z.number(), TokenRefSchema]), // Space in pixels or token reference
    axis: z.enum(['horizontal', 'vertical']).default('vertical'),
  }),
})
```

### 2.3 Form Components

#### 2.3.1 Form Component

```typescript
const FormSchema = PunkBaseNodeSchema.extend({
  type: z.literal('form'),
  props: z.object({
    onSubmit: EventHandlerSchema, // Handler in ActionBus
    onReset: EventHandlerSchema.optional(),
    onValidate: EventHandlerSchema.optional(),
    validationMode: z.enum(['onSubmit', 'onChange', 'onBlur']).default('onSubmit'),
    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string(), // Required for forms
  }),
  children: z.array(z.lazy(() => PunkNodeSchema)).min(1),
})
```

#### 2.3.2 Input Component

```typescript
const InputSchema = PunkBaseNodeSchema.extend({
  type: z.literal('input'),
  props: z.object({
    name: z.string(), // Form field name
    label: z.string().optional(), // Visual label
    placeholder: z.string().optional(),
    helperText: z.string().optional(),
    errorText: z.string().optional(),

    // Input type
    inputType: z.enum([
      'text', 'email', 'password', 'tel', 'url', 'number',
      'date', 'datetime-local', 'time', 'search'
    ]).default('text'),

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),
    readOnly: z.boolean().default(false),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(), // Regex pattern
    min: z.number().optional(), // For number inputs
    max: z.number().optional(),
    step: z.number().optional(),

    // Data binding
    valueFrom: DataPathSchema.optional(), // Bind to data context

    // Events
    onChange: EventHandlerSchema.optional(),
    onBlur: EventHandlerSchema.optional(),
    onFocus: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),
    variant: VariantSchema.default('outline'),

    // Icons
    leftIcon: z.string().optional(), // Icon name
    rightIcon: z.string().optional(),

    ...AccessibilityPropsSchema.shape,
    ariaRequired: z.boolean().optional(),
    ariaInvalid: z.boolean().optional(),
  }),
})
```

#### 2.3.3 Textarea Component

```typescript
const TextareaSchema = PunkBaseNodeSchema.extend({
  type: z.literal('textarea'),
  props: z.object({
    name: z.string(),
    label: z.string().optional(),
    placeholder: z.string().optional(),
    helperText: z.string().optional(),
    errorText: z.string().optional(),

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),
    readOnly: z.boolean().default(false),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),

    // Layout
    rows: z.number().int().min(2).default(4),
    cols: z.number().int().optional(),
    resize: z.enum(['none', 'vertical', 'horizontal', 'both']).default('vertical'),

    // Data binding
    valueFrom: DataPathSchema.optional(),

    // Events
    onChange: EventHandlerSchema.optional(),
    onBlur: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),
    variant: VariantSchema.default('outline'),

    ...AccessibilityPropsSchema.shape,
    ariaRequired: z.boolean().optional(),
    ariaInvalid: z.boolean().optional(),
  }),
})
```

#### 2.3.4 Select Component

```typescript
const SelectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
  icon: z.string().optional(),
})

const SelectSchema = PunkBaseNodeSchema.extend({
  type: z.literal('select'),
  props: z.object({
    name: z.string(),
    label: z.string().optional(),
    placeholder: z.string().default('Select an option'),
    helperText: z.string().optional(),
    errorText: z.string().optional(),

    // Options
    options: z.array(SelectOptionSchema).min(1), // Static options
    optionsFrom: DataPathSchema.optional(), // Or bind from data

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),

    // Behavior
    multiple: z.boolean().default(false),
    searchable: z.boolean().default(false),
    clearable: z.boolean().default(false),

    // Data binding
    valueFrom: DataPathSchema.optional(),

    // Events
    onChange: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),
    variant: VariantSchema.default('outline'),

    ...AccessibilityPropsSchema.shape,
    ariaRequired: z.boolean().optional(),
  }),
})
```

#### 2.3.5 Checkbox Component

```typescript
const CheckboxSchema = PunkBaseNodeSchema.extend({
  type: z.literal('checkbox'),
  props: z.object({
    name: z.string(),
    label: z.string(), // Required for accessibility
    helperText: z.string().optional(),

    // State
    checkedFrom: DataPathSchema.optional(),
    defaultChecked: z.boolean().default(false),

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),

    // Events
    onChange: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),

    ...AccessibilityPropsSchema.shape,
    ariaRequired: z.boolean().optional(),
  }),
})
```

#### 2.3.6 Radio Component

```typescript
const RadioOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional(),
  helperText: z.string().optional(),
})

const RadioSchema = PunkBaseNodeSchema.extend({
  type: z.literal('radio'),
  props: z.object({
    name: z.string(),
    label: z.string().optional(), // Label for the group

    // Options
    options: z.array(RadioOptionSchema).min(2),
    optionsFrom: DataPathSchema.optional(),

    // Layout
    orientation: z.enum(['horizontal', 'vertical']).default('vertical'),
    gap: z.union([z.number(), TokenRefSchema]).default(2),

    // State
    valueFrom: DataPathSchema.optional(),
    defaultValue: z.string().optional(),

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),

    // Events
    onChange: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),

    ...AccessibilityPropsSchema.shape,
    ariaRequired: z.boolean().optional(),
  }),
})
```

#### 2.3.7 Switch Component

```typescript
const SwitchSchema = PunkBaseNodeSchema.extend({
  type: z.literal('switch'),
  props: z.object({
    name: z.string(),
    label: z.string(), // Required
    helperText: z.string().optional(),

    // State
    checkedFrom: DataPathSchema.optional(),
    defaultChecked: z.boolean().default(false),

    // Validation
    required: z.boolean().default(false),
    disabled: z.boolean().default(false),

    // Events
    onChange: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),

    ...AccessibilityPropsSchema.shape,
  }),
})
```

### 2.4 Navigation Components

#### 2.4.1 Tabs Component

```typescript
const TabItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  disabled: z.boolean().optional(),
  badge: z.string().optional(), // Badge text/count
})

const TabsSchema = PunkBaseNodeSchema.extend({
  type: z.literal('tabs'),
  props: z.object({
    // Tab items
    tabs: z.array(TabItemSchema).min(2),

    // State
    activeTabFrom: DataPathSchema.optional(),
    defaultActiveTab: z.string().optional(),

    // Layout
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    variant: z.enum(['line', 'enclosed', 'soft']).default('line'),

    // Events
    onChange: EventHandlerSchema.optional(),

    // Visual
    size: SizeSchema.default('md'),

    ...AccessibilityPropsSchema.shape,
  }),
  children: z.array(z.object({
    tabId: z.string(), // References tab.id
    content: z.lazy(() => PunkNodeSchema),
  })).min(2),
})
```

#### 2.4.2 Navbar Component

```typescript
const NavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  icon: z.string().optional(),
  onClick: EventHandlerSchema.optional(),
  active: z.boolean().optional(),
  disabled: z.boolean().optional(),
  children: z.array(z.lazy(() => NavItemSchema)).optional(), // Nested nav
})

const NavbarSchema = PunkBaseNodeSchema.extend({
  type: z.literal('navbar'),
  props: z.object({
    // Brand
    brandText: z.string().optional(),
    brandLogo: z.string().optional(), // URL or icon name
    brandHref: z.string().optional(),

    // Navigation items
    items: z.array(NavItemSchema),
    itemsFrom: DataPathSchema.optional(),

    // Layout
    position: z.enum(['static', 'sticky', 'fixed']).default('static'),
    variant: VariantSchema.default('solid'),

    // Actions slot (right side)
    actions: z.array(z.lazy(() => PunkNodeSchema)).optional(),

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().default('Main navigation'),
  }),
})
```

#### 2.4.3 Sidebar Component

```typescript
const SidebarSchema = PunkBaseNodeSchema.extend({
  type: z.literal('sidebar'),
  props: z.object({
    // Items
    items: z.array(NavItemSchema),
    itemsFrom: DataPathSchema.optional(),

    // Layout
    position: z.enum(['left', 'right']).default('left'),
    width: z.number().default(280),
    collapsible: z.boolean().default(false),
    collapsed: z.boolean().default(false),

    // Visual
    variant: VariantSchema.default('soft'),

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().default('Sidebar navigation'),
  }),
})
```

#### 2.4.4 Breadcrumb Component

```typescript
const BreadcrumbItemSchema = z.object({
  label: z.string(),
  href: z.string().optional(),
  onClick: EventHandlerSchema.optional(),
  icon: z.string().optional(),
})

const BreadcrumbSchema = PunkBaseNodeSchema.extend({
  type: z.literal('breadcrumb'),
  props: z.object({
    items: z.array(BreadcrumbItemSchema).min(1),
    itemsFrom: DataPathSchema.optional(),
    separator: z.string().default('/'), // Can be icon name
    showHome: z.boolean().default(true),
    homeIcon: z.string().default('home'),

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().default('Breadcrumb navigation'),
  }),
})
```

### 2.5 Data Display Components

#### 2.5.1 Card Component

```typescript
const CardSchema = PunkBaseNodeSchema.extend({
  type: z.literal('card'),
  props: z.object({
    // Header
    title: z.string().optional(),
    subtitle: z.string().optional(),
    headerIcon: z.string().optional(),
    headerActions: z.array(z.lazy(() => PunkNodeSchema)).optional(),

    // Footer
    footer: z.array(z.lazy(() => PunkNodeSchema)).optional(),

    // Visual
    variant: VariantSchema.default('outline'),
    padding: z.union([z.number(), TokenRefSchema]).default('tokens.space.4'),
    shadow: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('sm'),

    // Interaction
    hoverable: z.boolean().default(false),
    clickable: z.boolean().default(false),
    onClick: EventHandlerSchema.optional(),

    ...AccessibilityPropsSchema.shape,
  }),
  children: z.array(z.lazy(() => PunkNodeSchema)).optional(),
})
```

#### 2.5.2 List Component

```typescript
const ListSchema = PunkBaseNodeSchema.extend({
  type: z.literal('list'),
  props: z.object({
    // Data source
    items: z.array(z.any()).optional(), // Static items
    itemsFrom: DataPathSchema.optional(), // Or bind from context

    // Layout
    variant: z.enum(['plain', 'divided', 'bordered']).default('plain'),
    spacing: z.union([z.number(), TokenRefSchema]).default(0),

    // Empty state
    emptyText: z.string().default('No items'),
    emptyIcon: z.string().optional(),

    ...AccessibilityPropsSchema.shape,
    role: z.string().default('list'),
  }),
  itemTemplate: z.lazy(() => PunkNodeSchema), // Template for each item
})
```

#### 2.5.3 Description List Component

```typescript
const DescriptionItemSchema = z.object({
  term: z.string(),
  description: z.union([z.string(), z.array(z.string())]),
  icon: z.string().optional(),
})

const DescriptionListSchema = PunkBaseNodeSchema.extend({
  type: z.literal('descriptionList'),
  props: z.object({
    items: z.array(DescriptionItemSchema),
    itemsFrom: DataPathSchema.optional(),

    // Layout
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    spacing: z.union([z.number(), TokenRefSchema]).default(2),

    // Visual
    variant: z.enum(['plain', 'divided']).default('plain'),

    ...AccessibilityPropsSchema.shape,
  }),
})
```

#### 2.5.4 Stat Component

```typescript
const StatSchema = PunkBaseNodeSchema.extend({
  type: z.literal('stat'),
  props: z.object({
    label: z.string(),
    value: z.union([z.string(), z.number(), DataPathSchema]),

    // Optional elements
    icon: z.string().optional(),
    helpText: z.string().optional(),
    change: z.object({
      value: z.number(),
      type: z.enum(['increase', 'decrease', 'neutral']),
      label: z.string().optional(),
    }).optional(),

    // Visual
    size: SizeSchema.default('md'),
    tone: ToneSchema.optional(),

    ...AccessibilityPropsSchema.shape,
  }),
})
```

### 2.6 Overlay Components

#### 2.6.1 Dialog Component

```typescript
const DialogSchema = PunkBaseNodeSchema.extend({
  type: z.literal('dialog'),
  props: z.object({
    // Content
    title: z.string(),
    description: z.string().optional(),

    // State
    openFrom: DataPathSchema.optional(),
    defaultOpen: z.boolean().default(false),

    // Behavior
    closeOnEsc: z.boolean().default(true),
    closeOnOutsideClick: z.boolean().default(true),
    preventScroll: z.boolean().default(true),

    // Events
    onOpen: EventHandlerSchema.optional(),
    onClose: EventHandlerSchema.optional(),

    // Visual
    size: z.enum(['sm', 'md', 'lg', 'xl', 'full']).default('md'),

    // Actions
    actions: z.array(z.lazy(() => PunkNodeSchema)).optional(), // Footer buttons

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().optional(),
  }),
  children: z.array(z.lazy(() => PunkNodeSchema)),
})
```

#### 2.6.2 Popover Component

```typescript
const PopoverSchema = PunkBaseNodeSchema.extend({
  type: z.literal('popover'),
  props: z.object({
    // State
    openFrom: DataPathSchema.optional(),
    defaultOpen: z.boolean().default(false),

    // Position
    side: z.enum(['top', 'right', 'bottom', 'left']).default('bottom'),
    align: z.enum(['start', 'center', 'end']).default('center'),
    sideOffset: z.number().default(4),

    // Behavior
    closeOnEsc: z.boolean().default(true),
    closeOnOutsideClick: z.boolean().default(true),

    // Events
    onOpen: EventHandlerSchema.optional(),
    onClose: EventHandlerSchema.optional(),

    ...AccessibilityPropsSchema.shape,
  }),
  trigger: z.lazy(() => PunkNodeSchema), // Element that triggers popover
  children: z.array(z.lazy(() => PunkNodeSchema)), // Popover content
})
```

#### 2.6.3 Tooltip Component

```typescript
const TooltipSchema = PunkBaseNodeSchema.extend({
  type: z.literal('tooltip'),
  props: z.object({
    content: z.string(), // Tooltip text

    // Position
    side: z.enum(['top', 'right', 'bottom', 'left']).default('top'),
    align: z.enum(['start', 'center', 'end']).default('center'),

    // Timing
    delayDuration: z.number().default(400), // ms before showing

    ...AccessibilityPropsSchema.shape,
  }),
  children: z.lazy(() => PunkNodeSchema), // Element to attach tooltip to
})
```

#### 2.6.4 Dropdown Component

```typescript
const DropdownItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  shortcut: z.string().optional(),
  disabled: z.boolean().optional(),
  destructive: z.boolean().optional(),
  onClick: EventHandlerSchema.optional(),
})

const DropdownSchema = PunkBaseNodeSchema.extend({
  type: z.literal('dropdown'),
  props: z.object({
    items: z.array(DropdownItemSchema),
    itemsFrom: DataPathSchema.optional(),

    // Position
    side: z.enum(['top', 'right', 'bottom', 'left']).default('bottom'),
    align: z.enum(['start', 'center', 'end']).default('start'),

    // Behavior
    closeOnSelect: z.boolean().default(true),

    // Events
    onItemSelect: EventHandlerSchema.optional(),

    ...AccessibilityPropsSchema.shape,
  }),
  trigger: z.lazy(() => PunkNodeSchema), // Trigger element (usually button)
})
```

#### 2.6.5 Toast Component

```typescript
const ToastSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tone: ToneSchema.default('neutral'),
  duration: z.number().default(5000), // ms, 0 for persistent
  dismissible: z.boolean().default(true),
  action: z.object({
    label: z.string(),
    onClick: EventHandlerSchema,
  }).optional(),
})

// Note: Toasts are managed imperatively, not in schema tree
// This schema is for validation when creating toasts via ActionBus
```

### 2.7 Action Components

#### 2.7.1 Button Component

```typescript
const ButtonSchema = PunkBaseNodeSchema.extend({
  type: z.literal('button'),
  props: z.object({
    // Content
    label: z.string(),
    leftIcon: z.string().optional(),
    rightIcon: z.string().optional(),

    // Type
    buttonType: z.enum(['button', 'submit', 'reset']).default('button'),

    // State
    disabled: z.boolean().default(false),
    loading: z.boolean().default(false),
    loadingFrom: DataPathSchema.optional(),

    // Events
    onClick: EventHandlerSchema.optional(),

    // Visual
    variant: VariantSchema.default('solid'),
    size: SizeSchema.default('md'),
    tone: ToneSchema.default('accent'),
    fullWidth: z.boolean().default(false),

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().optional(),
  }),
})
```

#### 2.7.2 Button Group Component

```typescript
const ButtonGroupSchema = PunkBaseNodeSchema.extend({
  type: z.literal('buttonGroup'),
  props: z.object({
    // Layout
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
    attached: z.boolean().default(true), // If true, buttons are visually connected

    // Visual (inherited by children)
    variant: VariantSchema.default('solid'),
    size: SizeSchema.default('md'),

    ...AccessibilityPropsSchema.shape,
    role: z.string().default('group'),
  }),
  children: z.array(ButtonSchema).min(2),
})
```

#### 2.7.3 Menu Component

```typescript
const MenuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  shortcut: z.string().optional(),
  disabled: z.boolean().optional(),
  destructive: z.boolean().optional(),
  href: z.string().optional(),
  onClick: EventHandlerSchema.optional(),
  children: z.array(z.lazy(() => MenuItemSchema)).optional(), // Submenu
})

const MenuSchema = PunkBaseNodeSchema.extend({
  type: z.literal('menu'),
  props: z.object({
    items: z.array(MenuItemSchema),
    itemsFrom: DataPathSchema.optional(),

    // Layout
    orientation: z.enum(['horizontal', 'vertical']).default('vertical'),

    // Events
    onItemSelect: EventHandlerSchema.optional(),

    ...AccessibilityPropsSchema.shape,
    ariaLabel: z.string().default('Menu'),
  }),
})
```

### 2.8 Unified Schema Export

```typescript
// Union of all component schemas
export const PunkNodeSchema: z.ZodType<PunkNode> = z.discriminatedUnion('type', [
  // Foundations
  TextSchema,
  HeadingSchema,
  IconSchema,
  DividerSchema,
  RowSchema,
  ColSchema,
  SpacerSchema,

  // Forms
  FormSchema,
  InputSchema,
  TextareaSchema,
  SelectSchema,
  CheckboxSchema,
  RadioSchema,
  SwitchSchema,

  // Navigation
  TabsSchema,
  NavbarSchema,
  SidebarSchema,
  BreadcrumbSchema,

  // Data Display
  CardSchema,
  ListSchema,
  DescriptionListSchema,
  StatSchema,

  // Overlays
  DialogSchema,
  PopoverSchema,
  TooltipSchema,
  DropdownSchema,

  // Actions
  ButtonSchema,
  ButtonGroupSchema,
  MenuSchema,
])

// Root schema for full page
export const PunkPageSchema = z.object({
  version: z.literal('1.0.0'),
  meta: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  root: PunkNodeSchema,
})

// Type inference
export type PunkNode = z.infer<typeof PunkNodeSchema>
export type PunkPage = z.infer<typeof PunkPageSchema>
```

---

## 3. Complexity Budgets

### 3.1 Schema Complexity Constraints

```typescript
export const COMPLEXITY_BUDGET = {
  // Node count limits
  maxNodeCount: 500,              // Maximum total nodes in schema
  maxDepth: 12,                   // Maximum nesting depth
  maxChildrenPerNode: 50,         // Maximum children for any single node

  // Property limits
  maxPropsPerNode: 30,            // Maximum properties per component
  maxStringLength: 10000,         // Maximum string prop length
  maxArrayLength: 1000,           // Maximum array prop length

  // Size limits
  maxSchemaSizeBytes: 512000,     // 500KB max JSON size
  maxDataContextSizeBytes: 1048576, // 1MB max data context

  // Rendering limits
  maxListItems: 10000,            // Maximum items in virtualized list
  maxTableRows: 10000,            // Maximum rows in table

  // Event handler limits
  maxEventHandlers: 200,          // Maximum unique event handlers
  maxEventHandlerNameLength: 64,  // Maximum handler name length

  // Data binding limits
  maxDataPaths: 500,              // Maximum unique data paths
  maxDataPathDepth: 10,           // Maximum depth (e.g., "a.b.c.d.e.f.g.h.i.j")

  // Token reference limits
  maxTokenReferences: 1000,       // Maximum token references
  maxTokenPathDepth: 6,           // Maximum token path depth
}
```

### 3.2 Budget Justifications

#### 3.2.1 Node Count (500)

**Rationale:**
- A typical complex dashboard has 200-300 nodes
- 500 allows for very rich UIs while preventing performance issues
- React can efficiently render 500 components with proper optimization
- Exceeding 500 suggests need for code splitting or pagination

**Performance Impact:**
- Initial render: ~50-100ms on modern hardware
- Re-render: ~10-30ms with React.memo optimizations
- Memory: ~2-5MB including reconciliation overhead

#### 3.2.2 Depth (12)

**Rationale:**
- Typical UI depth: 4-6 levels
- 12 allows for complex nested structures (modals > cards > forms > fieldsets > inputs)
- Deeper nesting hurts accessibility and usability
- Prevents infinite recursion in lazy schemas

**Example Valid Depth:**
```
Page (1)
  └── Layout (2)
      └── Section (3)
          └── Card (4)
              └── Form (5)
                  └── Fieldset (6)
                      └── Row (7)
                          └── Input (8)
                              └── IconWrapper (9)
                                  └── Icon (10)
```

#### 3.2.3 Children Per Node (50)

**Rationale:**
- Most containers have 2-10 children
- Large forms might have 20-30 fields
- 50 covers edge cases like large menus
- Exceeding 50 suggests need for List component with pagination

**Performance Impact:**
- React reconciliation: O(n) where n = children count
- 50 children reconcile in <5ms
- DOM rendering: ~10-20ms for 50 elements

#### 3.2.4 Props Per Node (30)

**Rationale:**
- Most components have 5-10 props
- Complex components (inputs, selects) might have 20 props
- 30 provides headroom for edge cases
- More props suggest component should be split

#### 3.2.5 Schema Size (500KB)

**Rationale:**
- Average schema: 50-100KB
- Complex apps: 200-300KB
- 500KB allows for rich apps while ensuring fast parsing
- JSON.parse on 500KB: ~5-10ms

**Size Breakdown:**
```
Component overhead:    ~100 bytes/node
Props:                 ~50-200 bytes/node
Strings:               Variable (constrained separately)
Arrays:                Variable (constrained separately)

500 nodes × 200 bytes avg = ~100KB base
+ Data content (400KB) = 500KB total
```

#### 3.2.6 Data Context Size (1MB)

**Rationale:**
- Schemas are structure, data is content
- 1MB allows for substantial datasets
- Larger datasets should use pagination/virtualization
- Keeps client-side memory reasonable

**Examples:**
```
Small dataset:    ~10KB  (100 user records)
Medium dataset:   ~100KB (1000 product listings)
Large dataset:    ~500KB (10,000 rows)
Max dataset:      1MB    (complex nested data)
```

### 3.3 Validation Implementation

```typescript
export function validateComplexity(schema: PunkNode): ValidationResult {
  const errors: string[] = []

  // Track metrics
  let nodeCount = 0
  let maxDepth = 0
  let maxChildren = 0
  let totalProps = 0

  function traverse(node: PunkNode, depth: number) {
    nodeCount++
    maxDepth = Math.max(maxDepth, depth)

    // Check depth
    if (depth > COMPLEXITY_BUDGET.maxDepth) {
      errors.push(`Max depth exceeded at node ${node.id}: ${depth} > ${COMPLEXITY_BUDGET.maxDepth}`)
    }

    // Check props count
    const propsCount = Object.keys(node.props || {}).length
    totalProps += propsCount
    if (propsCount > COMPLEXITY_BUDGET.maxPropsPerNode) {
      errors.push(`Max props exceeded at node ${node.id}: ${propsCount} > ${COMPLEXITY_BUDGET.maxPropsPerNode}`)
    }

    // Check children count
    const children = (node as any).children || []
    maxChildren = Math.max(maxChildren, children.length)
    if (children.length > COMPLEXITY_BUDGET.maxChildrenPerNode) {
      errors.push(`Max children exceeded at node ${node.id}: ${children.length} > ${COMPLEXITY_BUDGET.maxChildrenPerNode}`)
    }

    // Recurse
    children.forEach((child: PunkNode) => traverse(child, depth + 1))
  }

  traverse(schema, 1)

  // Check total node count
  if (nodeCount > COMPLEXITY_BUDGET.maxNodeCount) {
    errors.push(`Max node count exceeded: ${nodeCount} > ${COMPLEXITY_BUDGET.maxNodeCount}`)
  }

  // Check schema size
  const schemaSize = JSON.stringify(schema).length
  if (schemaSize > COMPLEXITY_BUDGET.maxSchemaSizeBytes) {
    errors.push(`Max schema size exceeded: ${schemaSize} > ${COMPLEXITY_BUDGET.maxSchemaSizeBytes}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    metrics: {
      nodeCount,
      maxDepth,
      maxChildren,
      totalProps,
      schemaSize,
    }
  }
}
```

---

## 4. Pink Token Taxonomy

### 4.1 Token Philosophy

Pink is a semantic token system that:
- Provides meaningful names (not just values)
- Supports light/dark themes automatically
- Maps to Radix UI color scales
- Uses CSS variables for runtime theming
- Enables TokiForge resolution

### 4.2 Color Tokens

#### 4.2.1 Semantic Color Scale

Each semantic color has 12 steps following Radix UI convention:

```typescript
export const ColorTokens = {
  // Accent (primary brand color)
  colors: {
    accent: {
      1: 'var(--accent-1)',   // Background (lightest)
      2: 'var(--accent-2)',   // Hover background
      3: 'var(--accent-3)',   // Active background
      4: 'var(--accent-4)',   // Border
      5: 'var(--accent-5)',   // Border (hover)
      6: 'var(--accent-6)',   // Border (solid)
      7: 'var(--accent-7)',   // Border (strong)
      8: 'var(--accent-8)',   // Solid background
      9: 'var(--accent-9)',   // Solid background (hover)
      10: 'var(--accent-10)', // Text (low contrast)
      11: 'var(--accent-11)', // Text (high contrast)
      12: 'var(--accent-12)', // Text (highest contrast)

      // Semantic aliases
      subtle: 'var(--accent-3)',
      subtleHover: 'var(--accent-4)',
      surface: 'var(--accent-2)',
      border: 'var(--accent-6)',
      borderHover: 'var(--accent-7)',
      solid: 'var(--accent-9)',
      solidHover: 'var(--accent-10)',
      text: 'var(--accent-11)',
      textContrast: 'var(--accent-12)',
    },

    // Neutral (gray scale)
    neutral: {
      1: 'var(--neutral-1)',
      2: 'var(--neutral-2)',
      3: 'var(--neutral-3)',
      4: 'var(--neutral-4)',
      5: 'var(--neutral-5)',
      6: 'var(--neutral-6)',
      7: 'var(--neutral-7)',
      8: 'var(--neutral-8)',
      9: 'var(--neutral-9)',
      10: 'var(--neutral-10)',
      11: 'var(--neutral-11)',
      12: 'var(--neutral-12)',

      subtle: 'var(--neutral-3)',
      subtleHover: 'var(--neutral-4)',
      surface: 'var(--neutral-2)',
      border: 'var(--neutral-6)',
      borderHover: 'var(--neutral-7)',
      solid: 'var(--neutral-9)',
      solidHover: 'var(--neutral-10)',
      text: 'var(--neutral-11)',
      textContrast: 'var(--neutral-12)',
    },

    // Critical (error/danger)
    critical: {
      1: 'var(--critical-1)',
      2: 'var(--critical-2)',
      3: 'var(--critical-3)',
      4: 'var(--critical-4)',
      5: 'var(--critical-5)',
      6: 'var(--critical-6)',
      7: 'var(--critical-7)',
      8: 'var(--critical-8)',
      9: 'var(--critical-9)',
      10: 'var(--critical-10)',
      11: 'var(--critical-11)',
      12: 'var(--critical-12)',

      subtle: 'var(--critical-3)',
      subtleHover: 'var(--critical-4)',
      surface: 'var(--critical-2)',
      border: 'var(--critical-6)',
      borderHover: 'var(--critical-7)',
      solid: 'var(--critical-9)',
      solidHover: 'var(--critical-10)',
      text: 'var(--critical-11)',
      textContrast: 'var(--critical-12)',
    },

    // Success (positive actions)
    success: {
      1: 'var(--success-1)',
      2: 'var(--success-2)',
      3: 'var(--success-3)',
      4: 'var(--success-4)',
      5: 'var(--success-5)',
      6: 'var(--success-6)',
      7: 'var(--success-7)',
      8: 'var(--success-8)',
      9: 'var(--success-9)',
      10: 'var(--success-10)',
      11: 'var(--success-11)',
      12: 'var(--success-12)',

      subtle: 'var(--success-3)',
      subtleHover: 'var(--success-4)',
      surface: 'var(--success-2)',
      border: 'var(--success-6)',
      borderHover: 'var(--success-7)',
      solid: 'var(--success-9)',
      solidHover: 'var(--success-10)',
      text: 'var(--success-11)',
      textContrast: 'var(--success-12)',
    },

    // Warning (caution)
    warning: {
      1: 'var(--warning-1)',
      2: 'var(--warning-2)',
      3: 'var(--warning-3)',
      4: 'var(--warning-4)',
      5: 'var(--warning-5)',
      6: 'var(--warning-6)',
      7: 'var(--warning-7)',
      8: 'var(--warning-8)',
      9: 'var(--warning-9)',
      10: 'var(--warning-10)',
      11: 'var(--warning-11)',
      12: 'var(--warning-12)',

      subtle: 'var(--warning-3)',
      subtleHover: 'var(--warning-4)',
      surface: 'var(--warning-2)',
      border: 'var(--warning-6)',
      borderHover: 'var(--warning-7)',
      solid: 'var(--warning-9)',
      solidHover: 'var(--warning-10)',
      text: 'var(--warning-11)',
      textContrast: 'var(--warning-12)',
    },

    // Info (informational)
    info: {
      1: 'var(--info-1)',
      2: 'var(--info-2)',
      3: 'var(--info-3)',
      4: 'var(--info-4)',
      5: 'var(--info-5)',
      6: 'var(--info-6)',
      7: 'var(--info-7)',
      8: 'var(--info-8)',
      9: 'var(--info-9)',
      10: 'var(--info-10)',
      11: 'var(--info-11)',
      12: 'var(--info-12)',

      subtle: 'var(--info-3)',
      subtleHover: 'var(--info-4)',
      surface: 'var(--info-2)',
      border: 'var(--info-6)',
      borderHover: 'var(--info-7)',
      solid: 'var(--info-9)',
      solidHover: 'var(--info-10)',
      text: 'var(--info-11)',
      textContrast: 'var(--info-12)',
    },

    // Background colors
    background: {
      base: 'var(--background-base)',       // App background
      surface: 'var(--background-surface)', // Card/panel background
      overlay: 'var(--background-overlay)', // Modal backdrop
    },

    // Text colors
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
      disabled: 'var(--text-disabled)',
      inverse: 'var(--text-inverse)',
    },
  },
}

// TypeScript type
export type ColorToken =
  | `tokens.colors.accent.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.neutral.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.critical.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.success.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.warning.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.info.${1|2|3|4|5|6|7|8|9|10|11|12|'subtle'|'subtleHover'|'surface'|'border'|'borderHover'|'solid'|'solidHover'|'text'|'textContrast'}`
  | `tokens.colors.background.${'base'|'surface'|'overlay'}`
  | `tokens.colors.text.${'primary'|'secondary'|'tertiary'|'disabled'|'inverse'}`
```

### 4.3 Spacing Tokens

```typescript
export const SpaceTokens = {
  space: {
    0: '0px',
    1: '4px',    // 0.25rem
    2: '8px',    // 0.5rem
    3: '12px',   // 0.75rem
    4: '16px',   // 1rem
    5: '20px',   // 1.25rem
    6: '24px',   // 1.5rem
    7: '28px',   // 1.75rem
    8: '32px',   // 2rem
    9: '36px',   // 2.25rem
    10: '40px',  // 2.5rem
    11: '44px',  // 2.75rem
    12: '48px',  // 3rem
    14: '56px',  // 3.5rem
    16: '64px',  // 4rem
    20: '80px',  // 5rem
    24: '96px',  // 6rem
    28: '112px', // 7rem
    32: '128px', // 8rem
    36: '144px', // 9rem
    40: '160px', // 10rem
    44: '176px', // 11rem
    48: '192px', // 12rem
    52: '208px', // 13rem
    56: '224px', // 14rem
    60: '240px', // 15rem
    64: '256px', // 16rem
    72: '288px', // 18rem
    80: '320px', // 20rem
    96: '384px', // 24rem
  }
}

export type SpaceToken = `tokens.space.${keyof typeof SpaceTokens.space}`
```

### 4.4 Radii Tokens

```typescript
export const RadiiTokens = {
  radii: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  }
}

export type RadiiToken = `tokens.radii.${keyof typeof RadiiTokens.radii}`
```

### 4.5 Typography Tokens

```typescript
export const TypographyTokens = {
  fontSize: {
    xs: '12px',     // 0.75rem
    sm: '14px',     // 0.875rem
    md: '16px',     // 1rem
    lg: '18px',     // 1.125rem
    xl: '20px',     // 1.25rem
    '2xl': '24px',  // 1.5rem
    '3xl': '30px',  // 1.875rem
    '4xl': '36px',  // 2.25rem
    '5xl': '48px',  // 3rem
    '6xl': '60px',  // 3.75rem
    '7xl': '72px',  // 4.5rem
    '8xl': '96px',  // 6rem
    '9xl': '128px', // 8rem
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  fontFamily: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
  },
}

export type FontSizeToken = `tokens.fontSize.${keyof typeof TypographyTokens.fontSize}`
export type FontWeightToken = `tokens.fontWeight.${keyof typeof TypographyTokens.fontWeight}`
export type LineHeightToken = `tokens.lineHeight.${keyof typeof TypographyTokens.lineHeight}`
export type LetterSpacingToken = `tokens.letterSpacing.${keyof typeof TypographyTokens.letterSpacing}`
export type FontFamilyToken = `tokens.fontFamily.${keyof typeof TypographyTokens.fontFamily}`
```

### 4.6 Shadow Tokens

```typescript
export const ShadowTokens = {
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  }
}

export type ShadowToken = `tokens.shadows.${keyof typeof ShadowTokens.shadows}`
```

### 4.7 Z-Index Tokens

```typescript
export const ZIndexTokens = {
  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1100',
    fixed: '1200',
    modalBackdrop: '1300',
    modal: '1400',
    popover: '1500',
    tooltip: '1600',
    toast: '1700',
  }
}

export type ZIndexToken = `tokens.zIndex.${keyof typeof ZIndexTokens.zIndex}`
```

### 4.8 Animation Tokens

```typescript
export const AnimationTokens = {
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}

export type DurationToken = `tokens.duration.${keyof typeof AnimationTokens.duration}`
export type EasingToken = `tokens.easing.${keyof typeof AnimationTokens.easing}`
```

### 4.9 Complete Token Type

```typescript
export type TokenReference =
  | ColorToken
  | SpaceToken
  | RadiiToken
  | FontSizeToken
  | FontWeightToken
  | LineHeightToken
  | LetterSpacingToken
  | FontFamilyToken
  | ShadowToken
  | ZIndexToken
  | DurationToken
  | EasingToken
```

---

## 5. TokiForge Resolution Specification

### 5.1 Overview

TokiForge is the styling runtime that resolves token references to actual CSS values at render time, supporting:

- Token path resolution
- Theme switching (light/dark)
- CSS variable fallbacks
- Type-safe token access
- Performance optimization via memoization

### 5.2 Resolution Algorithm

#### 5.2.1 Input/Output

```typescript
// Input: Token reference string
input: "tokens.colors.accent.solid"

// Output: Resolved CSS value
output: "var(--accent-9)" // or actual value in light theme: "#FF5AC4"
```

#### 5.2.2 Resolution Steps

```typescript
class TokiForge {
  private theme: 'light' | 'dark'
  private tokenCache: Map<string, string>

  constructor(theme: 'light' | 'dark' = 'light') {
    this.theme = theme
    this.tokenCache = new Map()
  }

  /**
   * Resolve token reference to CSS value
   */
  resolve(tokenPath: string): string {
    // 1. Validate format
    if (!tokenPath.startsWith('tokens.')) {
      throw new Error(`Invalid token path: ${tokenPath}`)
    }

    // 2. Check cache
    const cacheKey = `${this.theme}:${tokenPath}`
    if (this.tokenCache.has(cacheKey)) {
      return this.tokenCache.get(cacheKey)!
    }

    // 3. Parse path
    const parts = tokenPath.split('.')
    // parts = ['tokens', 'colors', 'accent', 'solid']

    if (parts.length < 3) {
      throw new Error(`Token path too short: ${tokenPath}`)
    }

    // 4. Navigate token tree
    const category = parts[1] // 'colors'
    const remaining = parts.slice(2) // ['accent', 'solid']

    let value: any

    switch (category) {
      case 'colors':
        value = this.resolveColor(remaining)
        break
      case 'space':
        value = this.resolveSpace(remaining)
        break
      case 'radii':
        value = this.resolveRadii(remaining)
        break
      case 'fontSize':
        value = this.resolveFontSize(remaining)
        break
      case 'fontWeight':
        value = this.resolveFontWeight(remaining)
        break
      case 'lineHeight':
        value = this.resolveLineHeight(remaining)
        break
      case 'letterSpacing':
        value = this.resolveLetterSpacing(remaining)
        break
      case 'fontFamily':
        value = this.resolveFontFamily(remaining)
        break
      case 'shadows':
        value = this.resolveShadow(remaining)
        break
      case 'zIndex':
        value = this.resolveZIndex(remaining)
        break
      case 'duration':
        value = this.resolveDuration(remaining)
        break
      case 'easing':
        value = this.resolveEasing(remaining)
        break
      default:
        throw new Error(`Unknown token category: ${category}`)
    }

    // 5. Cache result
    this.tokenCache.set(cacheKey, value)

    return value
  }

  /**
   * Resolve color token
   */
  private resolveColor(path: string[]): string {
    // path = ['accent', 'solid']
    const [scale, step] = path

    if (!scale || !step) {
      throw new Error(`Invalid color path: ${path.join('.')}`)
    }

    // Return CSS variable reference
    // The actual value is defined in theme CSS
    if (step === 'solid') {
      return `var(--${scale}-9)` // semantic alias
    }

    if (step === 'text') {
      return `var(--${scale}-11)`
    }

    // Direct step reference
    return `var(--${scale}-${step})`
  }

  /**
   * Resolve space token
   */
  private resolveSpace(path: string[]): string {
    const [step] = path

    if (!step || !(step in SpaceTokens.space)) {
      throw new Error(`Invalid space token: ${step}`)
    }

    return SpaceTokens.space[step as keyof typeof SpaceTokens.space]
  }

  /**
   * Resolve radii token
   */
  private resolveRadii(path: string[]): string {
    const [step] = path

    if (!step || !(step in RadiiTokens.radii)) {
      throw new Error(`Invalid radii token: ${step}`)
    }

    return RadiiTokens.radii[step as keyof typeof RadiiTokens.radii]
  }

  // ... similar methods for other token categories

  /**
   * Switch theme and clear cache
   */
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme
    this.tokenCache.clear()
  }

  /**
   * Preload all tokens (optimization)
   */
  preload() {
    // Resolve all common tokens to populate cache
    const commonTokens = [
      'tokens.colors.accent.solid',
      'tokens.colors.neutral.border',
      'tokens.space.4',
      'tokens.radii.md',
      // ... etc
    ]

    commonTokens.forEach(token => this.resolve(token))
  }
}
```

### 5.3 Theme Switching

#### 5.3.1 CSS Variable Definition

```css
/* Light theme */
:root {
  /* Accent (Pink) */
  --accent-1: #fff5fb;
  --accent-2: #ffe8f5;
  --accent-3: #ffd6ec;
  --accent-4: #ffc2e2;
  --accent-5: #ffabd6;
  --accent-6: #ff8fc8;
  --accent-7: #ff6bb8;
  --accent-8: #ff3da3;
  --accent-9: #ff5ac4; /* solid */
  --accent-10: #e0009d;
  --accent-11: #c5008a; /* text */
  --accent-12: #5c0042;

  /* Neutral (Gray) */
  --neutral-1: #fcfcfc;
  --neutral-2: #f9f9f9;
  --neutral-3: #f0f0f0;
  --neutral-4: #e8e8e8;
  --neutral-5: #e0e0e0;
  --neutral-6: #d9d9d9;
  --neutral-7: #cecece;
  --neutral-8: #bbbbbb;
  --neutral-9: #8d8d8d;
  --neutral-10: #838383;
  --neutral-11: #646464;
  --neutral-12: #202020;

  /* ... other scales */
}

/* Dark theme */
[data-theme="dark"] {
  /* Accent (Pink) */
  --accent-1: #1f1219;
  --accent-2: #2b1420;
  --accent-3: #3d1829;
  --accent-4: #4d1c32;
  --accent-5: #5c203c;
  --accent-6: #6e2549;
  --accent-7: #852c5a;
  --accent-8: #a93873;
  --accent-9: #ff5ac4; /* solid - same in dark */
  --accent-10: #ff79ce;
  --accent-11: #ff9dd9; /* text */
  --accent-12: #ffe8f5;

  /* Neutral (Gray) */
  --neutral-1: #111111;
  --neutral-2: #191919;
  --neutral-3: #222222;
  --neutral-4: #2a2a2a;
  --neutral-5: #313131;
  --neutral-6: #3a3a3a;
  --neutral-7: #484848;
  --neutral-8: #606060;
  --neutral-9: #6e6e6e;
  --neutral-10: #7b7b7b;
  --neutral-11: #b4b4b4;
  --neutral-12: #eeeeee;

  /* ... other scales */
}
```

#### 5.3.2 Theme Switching Implementation

```typescript
class ThemeManager {
  private currentTheme: 'light' | 'dark'
  private tokiForge: TokiForge

  constructor() {
    // Detect system preference
    this.currentTheme = this.detectSystemTheme()
    this.tokiForge = new TokiForge(this.currentTheme)
    this.applyTheme(this.currentTheme)
  }

  /**
   * Detect system color scheme preference
   */
  private detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  /**
   * Switch to theme
   */
  switchTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme
    this.applyTheme(theme)
    this.tokiForge.setTheme(theme)

    // Persist preference
    localStorage.setItem('punk-theme', theme)

    // Emit event
    window.dispatchEvent(new CustomEvent('punk:theme-change', {
      detail: { theme }
    }))
  }

  /**
   * Toggle between light and dark
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.switchTheme(newTheme)
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme)
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.currentTheme
  }

  /**
   * Get TokiForge instance
   */
  getTokiForge(): TokiForge {
    return this.tokiForge
  }
}

// Singleton instance
export const themeManager = new ThemeManager()
```

### 5.4 Performance Optimizations

```typescript
class OptimizedTokiForge extends TokiForge {
  private cssVariableCache: Map<string, string>

  constructor(theme: 'light' | 'dark') {
    super(theme)
    this.cssVariableCache = new Map()
    this.extractCSSVariables()
  }

  /**
   * Extract all CSS variables from computed styles
   * This allows direct value access without var() references
   */
  private extractCSSVariables() {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    // Extract all CSS variables
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i]
      if (prop.startsWith('--')) {
        const value = computedStyle.getPropertyValue(prop).trim()
        this.cssVariableCache.set(prop, value)
      }
    }
  }

  /**
   * Resolve with option for direct value or CSS variable
   */
  resolveDirect(tokenPath: string, preferDirect: boolean = false): string {
    const cssVar = super.resolve(tokenPath)

    if (!preferDirect) {
      return cssVar
    }

    // Extract variable name from var(--name)
    const match = cssVar.match(/var\((--[^)]+)\)/)
    if (!match) {
      return cssVar
    }

    const varName = match[1]
    return this.cssVariableCache.get(varName) || cssVar
  }

  /**
   * Batch resolve multiple tokens
   */
  resolveMany(tokenPaths: string[]): Map<string, string> {
    const results = new Map<string, string>()

    for (const path of tokenPaths) {
      results.set(path, this.resolve(path))
    }

    return results
  }
}
```

---

## 6. DataContext Resolution Algorithm

### 6.1 Overview

DataContext enables binding UI components to data sources through path expressions:

- Path syntax: `"user.profile.name"`
- GraphQL query generation
- Loading/error states
- Caching strategy
- Reactive updates

### 6.2 Data Path Syntax

```typescript
// Simple path
"user.name"              // Access object property

// Nested path
"user.profile.address.city"  // Deep access

// Array access
"users[0].name"          // Access array element
"users[].name"           // Map over array

// Conditional access
"user?.profile?.name"    // Optional chaining

// Special variables
"$item.name"             // In list item template
"$index"                 // Current index in list
"$root.user.id"          // Access from root context
```

### 6.3 DataContext Implementation

```typescript
interface DataContextValue {
  data: any
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

class DataContext {
  private cache: Map<string, DataContextValue>
  private subscriptions: Map<string, Set<Function>>
  private queryEngine: QueryEngine

  constructor(queryEngine: QueryEngine) {
    this.cache = new Map()
    this.subscriptions = new Map()
    this.queryEngine = queryEngine
  }

  /**
   * Resolve data path to value
   */
  async resolve(path: string, context: any = {}): Promise<any> {
    // 1. Check if path is a special variable
    if (path.startsWith('$')) {
      return this.resolveSpecialVar(path, context)
    }

    // 2. Parse path
    const segments = this.parsePath(path)

    // 3. Check cache
    const cacheKey = path
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (!cached.loading && !cached.error) {
        return this.navigatePath(cached.data, segments)
      }
    }

    // 4. Determine if we need to fetch
    const rootSegment = segments[0]
    if (this.requiresFetch(rootSegment, context)) {
      return this.fetchAndResolve(path, segments, context)
    }

    // 5. Navigate existing context
    return this.navigatePath(context, segments)
  }

  /**
   * Parse data path into segments
   */
  private parsePath(path: string): PathSegment[] {
    const segments: PathSegment[] = []
    const parts = path.split('.')

    for (const part of parts) {
      // Handle array access: users[0] or users[]
      const arrayMatch = part.match(/^(\w+)\[(\d+|\]?)$/)
      if (arrayMatch) {
        segments.push({
          type: 'property',
          key: arrayMatch[1]
        })
        if (arrayMatch[2] !== '') {
          segments.push({
            type: 'index',
            index: parseInt(arrayMatch[2])
          })
        } else {
          segments.push({
            type: 'map'
          })
        }
      } else {
        segments.push({
          type: 'property',
          key: part
        })
      }
    }

    return segments
  }

  /**
   * Navigate object using path segments
   */
  private navigatePath(obj: any, segments: PathSegment[]): any {
    let current = obj

    for (const segment of segments) {
      if (current == null) {
        return undefined
      }

      switch (segment.type) {
        case 'property':
          current = current[segment.key]
          break

        case 'index':
          if (!Array.isArray(current)) {
            throw new Error(`Cannot index non-array at ${segment}`)
          }
          current = current[segment.index!]
          break

        case 'map':
          if (!Array.isArray(current)) {
            throw new Error(`Cannot map over non-array`)
          }
          // Return array as-is, caller will handle mapping
          return current
      }
    }

    return current
  }

  /**
   * Check if path requires data fetching
   */
  private requiresFetch(rootKey: string, context: any): boolean {
    // If not in context, we need to fetch
    return !(rootKey in context)
  }

  /**
   * Fetch data and resolve path
   */
  private async fetchAndResolve(
    path: string,
    segments: PathSegment[],
    context: any
  ): Promise<any> {
    const cacheKey = path

    // Set loading state
    this.cache.set(cacheKey, {
      data: null,
      loading: true,
      error: null,
      refetch: () => this.refetch(path)
    })

    this.notify(cacheKey)

    try {
      // Generate GraphQL query
      const query = this.generateQuery(segments)

      // Execute query
      const data = await this.queryEngine.execute(query)

      // Cache result
      this.cache.set(cacheKey, {
        data,
        loading: false,
        error: null,
        refetch: () => this.refetch(path)
      })

      this.notify(cacheKey)

      // Navigate to final value
      return this.navigatePath(data, segments)

    } catch (error) {
      this.cache.set(cacheKey, {
        data: null,
        loading: false,
        error: error as Error,
        refetch: () => this.refetch(path)
      })

      this.notify(cacheKey)
      throw error
    }
  }

  /**
   * Generate GraphQL query from path
   */
  private generateQuery(segments: PathSegment[]): string {
    const rootKey = (segments[0] as PropertySegment).key
    const fields = this.buildFieldSelection(segments.slice(1))

    return `
      query {
        ${rootKey} {
          ${fields}
        }
      }
    `
  }

  /**
   * Build GraphQL field selection from path segments
   */
  private buildFieldSelection(segments: PathSegment[]): string {
    if (segments.length === 0) {
      return `
        id
        __typename
      `
    }

    const fields: string[] = []
    let i = 0

    while (i < segments.length) {
      const segment = segments[i]

      if (segment.type === 'property') {
        const nested = this.buildFieldSelection(segments.slice(i + 1))
        if (nested) {
          fields.push(`${segment.key} { ${nested} }`)
        } else {
          fields.push(segment.key)
        }
        break
      } else {
        i++
      }
    }

    return fields.join('\n')
  }

  /**
   * Resolve special variables ($item, $index, $root)
   */
  private resolveSpecialVar(path: string, context: any): any {
    if (path === '$item') {
      return context.$item
    }

    if (path === '$index') {
      return context.$index
    }

    if (path.startsWith('$root.')) {
      const rootPath = path.substring(6) // Remove '$root.'
      return this.resolve(rootPath, context.$root)
    }

    throw new Error(`Unknown special variable: ${path}`)
  }

  /**
   * Subscribe to data updates
   */
  subscribe(path: string, callback: Function) {
    if (!this.subscriptions.has(path)) {
      this.subscriptions.set(path, new Set())
    }

    this.subscriptions.get(path)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscriptions.get(path)?.delete(callback)
    }
  }

  /**
   * Notify subscribers of changes
   */
  private notify(path: string) {
    const subscribers = this.subscriptions.get(path)
    if (subscribers) {
      const value = this.cache.get(path)
      subscribers.forEach(callback => callback(value))
    }
  }

  /**
   * Refetch data for path
   */
  private async refetch(path: string): Promise<void> {
    this.cache.delete(path)
    const segments = this.parsePath(path)
    await this.fetchAndResolve(path, segments, {})
  }

  /**
   * Invalidate cache
   */
  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // Remove matching entries
    for (const [key] of this.cache) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

// Types
interface PathSegment {
  type: 'property' | 'index' | 'map'
}

interface PropertySegment extends PathSegment {
  type: 'property'
  key: string
}

interface IndexSegment extends PathSegment {
  type: 'index'
  index: number
}

interface MapSegment extends PathSegment {
  type: 'map'
}
```

### 6.4 React Integration

```typescript
/**
 * Hook to use data context in components
 */
function useDataPath<T = any>(path: string): DataContextValue & { data: T } {
  const dataContext = useContext(DataContextContext)
  const [value, setValue] = useState<DataContextValue>(() => ({
    data: null,
    loading: true,
    error: null,
    refetch: async () => {}
  }))

  useEffect(() => {
    let cancelled = false

    // Resolve path
    dataContext.resolve(path).then(data => {
      if (!cancelled) {
        setValue({
          data,
          loading: false,
          error: null,
          refetch: () => dataContext.refetch(path)
        })
      }
    }).catch(error => {
      if (!cancelled) {
        setValue({
          data: null,
          loading: false,
          error,
          refetch: () => dataContext.refetch(path)
        })
      }
    })

    // Subscribe to updates
    const unsubscribe = dataContext.subscribe(path, (updated: DataContextValue) => {
      if (!cancelled) {
        setValue(updated)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [path, dataContext])

  return value as DataContextValue & { data: T }
}

/**
 * Example usage in renderer
 */
function renderInput(schema: InputSchema) {
  const { valueFrom } = schema.props

  const { data, loading, error } = useDataPath(valueFrom || '')

  if (loading) {
    return <Skeleton />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <input
      value={data}
      onChange={(e) => {
        // Update data context
        dataContext.update(valueFrom!, e.target.value)
      }}
    />
  )
}
```

### 6.5 Caching Strategy

```typescript
class CacheManager {
  private cache: Map<string, CacheEntry>
  private maxSize: number = 1000
  private ttl: number = 5 * 60 * 1000 // 5 minutes

  set(key: string, value: any) {
    // Enforce size limit
    if (this.cache.size >= this.maxSize) {
      this.evict()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count
    entry.hits++

    return entry.value
  }

  /**
   * Evict least recently used entries
   */
  private evict() {
    // Sort by hits and timestamp
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => {
        // Prioritize by hits
        if (a[1].hits !== b[1].hits) {
          return a[1].hits - b[1].hits
        }
        // Then by age
        return a[1].timestamp - b[1].timestamp
      })

    // Remove bottom 20%
    const removeCount = Math.floor(this.maxSize * 0.2)
    for (let i = 0; i < removeCount; i++) {
      this.cache.delete(entries[i][0])
    }
  }
}

interface CacheEntry {
  value: any
  timestamp: number
  hits: number
}
```

---

## 7. Performance & Security Budgets

### 7.1 Performance Budgets

```typescript
export const PERFORMANCE_BUDGET = {
  // Render timings (milliseconds)
  maxInitialRender: 100,        // Time to first paint
  maxInteractionDelay: 16,      // 60fps = 16ms per frame
  maxSchemaValidation: 50,      // Zod validation time
  maxTokenResolution: 5,        // TokiForge resolution time
  maxDataContextResolve: 200,   // Data fetching time

  // Bundle sizes (kilobytes)
  maxCoreBundleSize: 150,       // @punk/core bundle
  maxRendererBundleSize: 200,   // Puck renderer
  maxTotalBundleSize: 500,      // Total JS bundle
  maxCSSBundleSize: 100,        // CSS bundle

  // Memory (megabytes)
  maxMemoryUsage: 50,           // Heap size
  maxCacheSize: 10,             // Cache memory

  // Network (kilobytes)
  maxSchemaSize: 500,           // Schema JSON size
  maxDataPayload: 1024,         // API response size

  // Concurrent operations
  maxConcurrentRequests: 6,     // Parallel HTTP requests
  maxConcurrentRenders: 1,      // Only one render at a time
}
```

#### 7.1.1 Monitoring Implementation

```typescript
class PerformanceMonitor {
  private metrics: Map<string, number[]>

  constructor() {
    this.metrics = new Map()
  }

  /**
   * Measure operation duration
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    budget: number
  ): Promise<T> {
    const start = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - start

      // Record metric
      this.recordMetric(operation, duration)

      // Check budget
      if (duration > budget) {
        console.warn(
          `Performance budget exceeded: ${operation} took ${duration.toFixed(2)}ms (budget: ${budget}ms)`
        )
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      this.recordMetric(operation, duration)
      throw error
    }
  }

  /**
   * Record metric
   */
  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }

    const metrics = this.metrics.get(operation)!
    metrics.push(duration)

    // Keep last 100 measurements
    if (metrics.length > 100) {
      metrics.shift()
    }
  }

  /**
   * Get metric statistics
   */
  getStats(operation: string) {
    const metrics = this.metrics.get(operation)

    if (!metrics || metrics.length === 0) {
      return null
    }

    const sorted = [...metrics].sort((a, b) => a - b)

    return {
      count: metrics.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: metrics.reduce((a, b) => a + b, 0) / metrics.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }
}

// Usage
const perfMonitor = new PerformanceMonitor()

await perfMonitor.measure(
  'schema-validation',
  () => PunkPageSchema.parseAsync(schema),
  PERFORMANCE_BUDGET.maxSchemaValidation
)
```

### 7.2 Security Budgets

```typescript
export const SECURITY_CONSTRAINTS = {
  // Input validation
  maxInputLength: 10000,           // Prevent DOS via large inputs
  maxNestingDepth: 12,             // Prevent stack overflow
  allowedProtocols: ['https', 'http'], // URL protocols

  // XSS prevention
  sanitizeHTML: true,              // Always sanitize HTML
  allowedHTMLTags: [],             // No raw HTML in schemas
  escapeUserContent: true,         // Escape all user content

  // Injection prevention
  preventSQLInjection: true,       // Use parameterized queries only
  preventCommandInjection: true,   // No shell command execution
  preventCodeInjection: true,      // No eval() or Function()

  // Resource limits
  maxFileSize: 10485760,           // 10MB file upload limit
  maxConcurrentConnections: 100,   // Per user
  rateLimitRequests: 100,          // Per minute

  // Authentication
  minPasswordLength: 12,           // Password requirements
  requireMFA: false,               // Optional MFA
  sessionTimeout: 3600000,         // 1 hour (ms)

  // CORS
  allowedOrigins: [],              // Whitelist (empty = same-origin only)
  allowCredentials: false,         // No credentials in CORS

  // CSP (Content Security Policy)
  scriptSrc: ["'self'"],           // Only same-origin scripts
  styleSrc: ["'self'", "'unsafe-inline'"], // Styles (inline needed for CSS-in-JS)
  imgSrc: ["'self'", "data:", "https:"], // Images
  connectSrc: ["'self'"],          // API connections

  // Headers
  enableHSTS: true,                // HTTP Strict Transport Security
  enableXFrameOptions: true,       // Clickjacking protection
  enableXContentTypeOptions: true, // MIME sniffing protection
  enableReferrerPolicy: true,      // Referrer control
}
```

#### 7.2.1 Validation Implementation

```typescript
class SecurityValidator {
  /**
   * Validate and sanitize user input
   */
  validateInput(input: string, maxLength: number = SECURITY_CONSTRAINTS.maxInputLength): string {
    // Check length
    if (input.length > maxLength) {
      throw new SecurityError(`Input exceeds maximum length: ${maxLength}`)
    }

    // Sanitize HTML
    if (SECURITY_CONSTRAINTS.sanitizeHTML) {
      input = this.sanitizeHTML(input)
    }

    // Escape special characters
    if (SECURITY_CONSTRAINTS.escapeUserContent) {
      input = this.escapeHTML(input)
    }

    return input
  }

  /**
   * Sanitize HTML (remove all tags)
   */
  private sanitizeHTML(html: string): string {
    // Remove all HTML tags
    return html.replace(/<[^>]*>/g, '')
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    }

    return str.replace(/[&<>"'/]/g, (char) => map[char])
  }

  /**
   * Validate URL
   */
  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url)

      // Check protocol
      if (!SECURITY_CONSTRAINTS.allowedProtocols.includes(parsed.protocol.slice(0, -1))) {
        throw new SecurityError(`Invalid protocol: ${parsed.protocol}`)
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Validate event handler name (prevent code injection)
   */
  validateEventHandler(handlerName: string): boolean {
    // Only allow alphanumeric and underscore
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/

    if (!pattern.test(handlerName)) {
      throw new SecurityError(`Invalid event handler name: ${handlerName}`)
    }

    // Check length
    if (handlerName.length > COMPLEXITY_BUDGET.maxEventHandlerNameLength) {
      throw new SecurityError(`Event handler name too long: ${handlerName}`)
    }

    return true
  }

  /**
   * Validate data path (prevent injection)
   */
  validateDataPath(path: string): boolean {
    // Only allow safe characters in paths
    const pattern = /^[a-zA-Z0-9_.[\]$]+$/

    if (!pattern.test(path)) {
      throw new SecurityError(`Invalid data path: ${path}`)
    }

    // Check depth
    const depth = path.split('.').length
    if (depth > COMPLEXITY_BUDGET.maxDataPathDepth) {
      throw new SecurityError(`Data path too deep: ${depth}`)
    }

    return true
  }
}

class SecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecurityError'
  }
}
```

#### 7.2.2 Rate Limiting

```typescript
class RateLimiter {
  private requests: Map<string, number[]>
  private limit: number
  private window: number

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.requests = new Map()
    this.limit = limit
    this.window = windowMs
  }

  /**
   * Check if request is allowed
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []

    // Remove old requests outside window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.window
    )

    // Check limit
    if (validRequests.length >= this.limit) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return true
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []

    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.window
    )

    return Math.max(0, this.limit - validRequests.length)
  }
}
```

### 7.3 Forbidden Patterns

```typescript
export const FORBIDDEN_PATTERNS = {
  // Dangerous functions
  dangerousFunctions: [
    'eval',
    'Function',
    'setTimeout',
    'setInterval',
    'execScript',
  ],

  // Dangerous properties
  dangerousProps: [
    'innerHTML',
    'outerHTML',
    'dangerouslySetInnerHTML',
    '__proto__',
    'constructor',
    'prototype',
  ],

  // Dangerous patterns in strings
  dangerousPatterns: [
    /javascript:/i,           // javascript: protocol
    /on\w+\s*=/i,            // Inline event handlers (onclick=, etc.)
    /<script/i,              // Script tags
    /<iframe/i,              // Iframe tags
    /eval\(/i,               // eval calls
    /expression\(/i,         // CSS expressions (IE)
    /import\(/i,             // Dynamic imports
    /require\(/i,            // CommonJS requires
  ],
}

/**
 * Check schema for forbidden patterns
 */
function checkForbiddenPatterns(schema: any): void {
  const errors: string[] = []

  function traverse(obj: any, path: string = 'root') {
    if (obj == null) return

    // Check object properties
    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = `${path}.${key}`

        // Check for dangerous props
        if (FORBIDDEN_PATTERNS.dangerousProps.includes(key)) {
          errors.push(`Forbidden property at ${currentPath}: ${key}`)
        }

        // Recurse
        traverse(value, currentPath)
      }
    }

    // Check string values
    if (typeof obj === 'string') {
      for (const pattern of FORBIDDEN_PATTERNS.dangerousPatterns) {
        if (pattern.test(obj)) {
          errors.push(`Forbidden pattern in ${path}: ${pattern}`)
        }
      }
    }
  }

  traverse(schema)

  if (errors.length > 0) {
    throw new SecurityError(
      `Schema contains forbidden patterns:\n${errors.join('\n')}`
    )
  }
}
```

---

## 8. Validation Pipeline

### 8.1 Complete Validation Flow

```typescript
class PunkValidator {
  private zod: typeof PunkPageSchema
  private complexity: ComplexityValidator
  private security: SecurityValidator
  private accessibility: AccessibilityValidator

  constructor() {
    this.zod = PunkPageSchema
    this.complexity = new ComplexityValidator()
    this.security = new SecurityValidator()
    this.accessibility = new AccessibilityValidator()
  }

  /**
   * Validate schema through complete pipeline
   */
  async validate(schema: unknown): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      // 1. Zod structural validation
      const zodResult = await this.validateStructure(schema)
      if (!zodResult.success) {
        return zodResult
      }

      const validSchema = zodResult.data

      // 2. Complexity validation
      const complexityResult = this.complexity.validate(validSchema)
      errors.push(...complexityResult.errors)
      warnings.push(...complexityResult.warnings)

      // 3. Security validation
      const securityResult = this.security.validate(validSchema)
      errors.push(...securityResult.errors)
      warnings.push(...securityResult.warnings)

      // 4. Accessibility validation
      const a11yResult = this.accessibility.validate(validSchema)
      errors.push(...a11yResult.errors)
      warnings.push(...a11yResult.warnings)

      // 5. Semantic validation
      const semanticResult = this.validateSemantics(validSchema)
      errors.push(...semanticResult.errors)
      warnings.push(...semanticResult.warnings)

      return {
        success: errors.length === 0,
        data: validSchema,
        errors,
        warnings,
      }

    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'fatal',
          message: error instanceof Error ? error.message : 'Unknown error',
          path: 'root',
        }],
        warnings: [],
      }
    }
  }

  /**
   * Zod structural validation
   */
  private async validateStructure(schema: unknown) {
    try {
      const validated = await this.zod.parseAsync(schema)
      return {
        success: true,
        data: validated,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => ({
            type: 'structural' as const,
            message: err.message,
            path: err.path.join('.'),
          })),
        }
      }
      throw error
    }
  }

  /**
   * Semantic validation (business rules)
   */
  private validateSemantics(schema: PunkPage): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check form validation
    this.validateForms(schema.root, errors, warnings)

    // Check data bindings
    this.validateDataBindings(schema.root, errors, warnings)

    // Check event handlers
    this.validateEventHandlers(schema.root, errors, warnings)

    return { errors, warnings }
  }

  /**
   * Validate form components
   */
  private validateForms(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    if (node.type === 'form') {
      // Check for submit handler
      if (!node.props.onSubmit) {
        warnings.push({
          type: 'semantic',
          message: 'Form missing onSubmit handler',
          path: node.id,
        })
      }

      // Check for at least one input
      const hasInputs = this.hasChildOfType(node, ['input', 'textarea', 'select'])
      if (!hasInputs) {
        warnings.push({
          type: 'semantic',
          message: 'Form has no input elements',
          path: node.id,
        })
      }
    }

    // Recurse
    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach(child =>
        this.validateForms(child as PunkNode, errors, warnings)
      )
    }
  }

  /**
   * Check if node has child of specific type
   */
  private hasChildOfType(node: PunkNode, types: string[]): boolean {
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (types.includes((child as PunkNode).type)) {
          return true
        }
        if (this.hasChildOfType(child as PunkNode, types)) {
          return true
        }
      }
    }
    return false
  }
}
```

### 8.2 Accessibility Validator

```typescript
class AccessibilityValidator {
  /**
   * Validate accessibility compliance
   */
  validate(schema: PunkPage): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    this.traverse(schema.root, errors, warnings)

    return { errors, warnings }
  }

  /**
   * Traverse and validate each node
   */
  private traverse(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    // Check component-specific rules
    switch (node.type) {
      case 'button':
        this.validateButton(node, errors, warnings)
        break
      case 'input':
        this.validateInput(node, errors, warnings)
        break
      case 'form':
        this.validateForm(node, errors, warnings)
        break
      case 'icon':
        this.validateIcon(node, errors, warnings)
        break
      // ... other components
    }

    // Check general accessibility
    this.validateGeneral(node, errors, warnings)

    // Recurse
    if ('children' in node && Array.isArray(node.children)) {
      node.children.forEach(child =>
        this.traverse(child as PunkNode, errors, warnings)
      )
    }
  }

  /**
   * Validate button accessibility
   */
  private validateButton(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    const props = node.props as any

    // Button must have label or ariaLabel
    if (!props.label && !props.ariaLabel) {
      errors.push({
        type: 'accessibility',
        message: 'Button must have label or ariaLabel',
        path: node.id,
      })
    }

    // Loading state should have aria-busy
    if (props.loading && !props.ariaBusy) {
      warnings.push({
        type: 'accessibility',
        message: 'Loading button should have ariaBusy attribute',
        path: node.id,
      })
    }
  }

  /**
   * Validate input accessibility
   */
  private validateInput(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    const props = node.props as any

    // Input must have label or ariaLabel
    if (!props.label && !props.ariaLabel) {
      errors.push({
        type: 'accessibility',
        message: 'Input must have label or ariaLabel',
        path: node.id,
      })
    }

    // Required inputs should have ariaRequired
    if (props.required && !props.ariaRequired) {
      warnings.push({
        type: 'accessibility',
        message: 'Required input should have ariaRequired',
        path: node.id,
      })
    }

    // Error state should have ariaInvalid and errorText
    if (props.ariaInvalid && !props.errorText) {
      warnings.push({
        type: 'accessibility',
        message: 'Invalid input should have errorText',
        path: node.id,
      })
    }
  }

  /**
   * Validate form accessibility
   */
  private validateForm(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    const props = node.props as any

    // Form should have ariaLabel
    if (!props.ariaLabel) {
      warnings.push({
        type: 'accessibility',
        message: 'Form should have ariaLabel',
        path: node.id,
      })
    }
  }

  /**
   * Validate icon accessibility
   */
  private validateIcon(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    const props = node.props as any

    // Decorative icons should have aria-hidden
    // Semantic icons must have ariaLabel
    if (!props.ariaHidden && !props.ariaLabel) {
      errors.push({
        type: 'accessibility',
        message: 'Icon must have ariaLabel or ariaHidden',
        path: node.id,
      })
    }
  }

  /**
   * Validate general accessibility rules
   */
  private validateGeneral(
    node: PunkNode,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ) {
    // Check for valid IDs (no spaces, special chars)
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(node.id)) {
      errors.push({
        type: 'accessibility',
        message: 'Invalid ID format (must start with letter, alphanumeric + - _ only)',
        path: node.id,
      })
    }
  }
}
```

---

## 9. Error Recovery Strategies

### 9.1 Graceful Degradation

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    console.error('Punk rendering error:', error, errorInfo)

    // Report to monitoring service
    this.reportError(error, errorInfo)

    // Attempt recovery
    this.attemptRecovery(error)
  }

  /**
   * Attempt to recover from error
   */
  private attemptRecovery(error: Error) {
    // Strategy 1: Clear cache and retry
    if (error.message.includes('cache')) {
      this.clearCacheAndRetry()
      return
    }

    // Strategy 2: Reload data context
    if (error.message.includes('data')) {
      this.reloadDataContext()
      return
    }

    // Strategy 3: Use fallback schema
    if (error.message.includes('schema')) {
      this.useFallbackSchema()
      return
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          retry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
```

### 9.2 Validation Error Recovery

```typescript
class SchemaRecovery {
  /**
   * Attempt to fix common schema errors
   */
  attemptFix(schema: any, errors: ValidationError[]): any {
    let fixed = { ...schema }

    for (const error of errors) {
      switch (error.type) {
        case 'missing-id':
          fixed = this.addMissingIds(fixed)
          break

        case 'invalid-type':
          fixed = this.fixInvalidTypes(fixed, error)
          break

        case 'missing-aria':
          fixed = this.addAriaLabels(fixed)
          break

        default:
          // Cannot auto-fix
          break
      }
    }

    return fixed
  }

  /**
   * Add missing IDs to nodes
   */
  private addMissingIds(schema: any): any {
    let counter = 0

    function traverse(node: any) {
      if (!node.id) {
        node.id = `auto-id-${counter++}`
      }

      if (node.children) {
        node.children.forEach(traverse)
      }

      return node
    }

    return traverse(schema)
  }

  /**
   * Add missing ARIA labels
   */
  private addAriaLabels(schema: any): any {
    function traverse(node: any) {
      // Add labels based on component type
      if (node.type === 'button' && !node.props.ariaLabel && node.props.label) {
        node.props.ariaLabel = node.props.label
      }

      if (node.type === 'form' && !node.props.ariaLabel) {
        node.props.ariaLabel = 'Form'
      }

      if (node.children) {
        node.children.forEach(traverse)
      }

      return node
    }

    return traverse(schema)
  }
}
```

---

## Appendix A: Complete Type Definitions

```typescript
// Export all types for external use
export * from './schemas'
export * from './tokens'
export * from './validation'
export * from './tokiforge'
export * from './datacontext'

// Version
export const PUNK_VERSION = '1.0.0'

// Feature flags
export const FEATURES = {
  strictMode: true,              // Enforce strict validation
  performanceMonitoring: true,   // Track performance metrics
  securityAuditing: true,        // Log security events
  accessibilityWarnings: true,   // Show a11y warnings
  experimentalFeatures: false,   // Enable experimental features
}
```

---

## Appendix B: Migration Guide

```typescript
/**
 * Migrate from v0.x schema to v1.0 schema
 */
export function migrateSchema(oldSchema: any): PunkPage {
  // Add version
  const migrated = {
    version: '1.0.0',
    meta: {
      title: oldSchema.title || 'Untitled',
      description: oldSchema.description,
    },
    root: migrateNode(oldSchema.root),
  }

  return PunkPageSchema.parse(migrated)
}

function migrateNode(node: any): any {
  // Migrate prop names
  if (node.props) {
    // onClick -> on
    if (node.props.onClick) {
      node.on = node.props.onClick
      delete node.props.onClick
    }

    // value -> valueFrom
    if (node.props.value && typeof node.props.value === 'string') {
      node.props.valueFrom = node.props.value
      delete node.props.value
    }
  }

  // Recurse
  if (node.children) {
    node.children = node.children.map(migrateNode)
  }

  return node
}
```

---

## Conclusion

This specification provides the complete foundation for the Punk Framework, ensuring:

1. **Complete Validation**: All components have well-defined Zod schemas
2. **Performance Guarantees**: Complexity budgets prevent performance issues
3. **Design System**: Pink tokens provide consistent, themeable design
4. **Runtime Resolution**: TokiForge resolves tokens efficiently
5. **Data Binding**: DataContext provides powerful data integration
6. **Security**: Multi-layered security constraints protect against vulnerabilities
7. **Accessibility**: Built-in WCAG 2.1 Level AA compliance

The framework achieves **Punk Pragmatism**: deterministic, verifiable, safe AI code generation through rigorous constraints and validation.
