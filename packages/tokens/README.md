# @punk/tokens

TokiForge integration for design tokens - Pink token system with theme switching.

## Overview

`@punk/tokens` provides a complete design token system with:

- **TokiForge Integration**: Runtime token resolution with caching
- **Pink Token System**: 12-step color scales following Radix UI convention
- **Light/Dark Themes**: Seamless theme switching
- **CSS Variables**: Dynamic runtime theming
- **TypeScript**: Full type safety for token paths
- **React Integration**: Theme provider and hooks

## Installation

```bash
npm install @punk/tokens
# or
yarn add @punk/tokens
# or
pnpm add @punk/tokens
```

## Quick Start

### 1. Wrap Your App with Theme Provider

```tsx
import { PunkThemeProvider } from '@punk/tokens'

function App() {
  return (
    <PunkThemeProvider theme="light">
      <YourApp />
    </PunkThemeProvider>
  )
}
```

### 2. Use Tokens in Components

```tsx
import { useTheme, useToken } from '@punk/tokens'

function Button() {
  const { theme, toggleTheme } = useTheme()
  const accentColor = useToken('tokens.colors.accent.solid')
  const spacing = useToken('tokens.space.4')

  return (
    <button
      style={{
        backgroundColor: accentColor,
        padding: spacing,
        borderRadius: 'var(--radii-md)'
      }}
      onClick={toggleTheme}
    >
      Current theme: {theme}
    </button>
  )
}
```

### 3. Using CSS Variables (Recommended)

For better performance, use CSS variables directly:

```tsx
function Card() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background-surface)',
        border: '1px solid var(--neutral-border)',
        borderRadius: 'var(--radii-lg)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      Card content
    </div>
  )
}
```

## Token System

### Colors

The Pink token system provides 12-step color scales for:

- **accent** - Punk pink primary color
- **neutral** - Grayscale
- **critical** - Error/destructive actions
- **success** - Positive confirmations
- **warning** - Caution/alerts
- **info** - Informational messages

Each scale includes semantic aliases:

```typescript
tokens.colors.accent.subtle       // Light background
tokens.colors.accent.surface      // Hover surface
tokens.colors.accent.border       // Border color
tokens.colors.accent.solid        // Primary solid (recommended)
tokens.colors.accent.text         // Text color
```

### Spacing

```typescript
tokens.space.0      // 0px
tokens.space.2      // 8px
tokens.space.4      // 16px
tokens.space.8      // 32px
// ... up to tokens.space.96 (384px)
```

### Radii

```typescript
tokens.radii.none   // 0px
tokens.radii.sm     // 4px
tokens.radii.md     // 6px (default)
tokens.radii.lg     // 8px
tokens.radii.full   // 9999px (pill)
```

### Typography

```typescript
// Font Sizes
tokens.fontSize.xs     // 12px
tokens.fontSize.md     // 16px (default)
tokens.fontSize.2xl    // 24px

// Font Weights
tokens.fontWeight.regular   // 400
tokens.fontWeight.semibold  // 600
tokens.fontWeight.bold      // 700

// Line Heights
tokens.lineHeight.tight    // 1.25
tokens.lineHeight.normal   // 1.5
```

## API Reference

### `<PunkThemeProvider>`

Theme provider component that injects CSS variables and provides theme context.

```tsx
<PunkThemeProvider
  theme="light"           // Initial theme
  persistTheme={true}     // Persist to localStorage
  injectCSS={true}        // Inject CSS variables
  onThemeChange={(theme) => console.log(theme)}
>
  <App />
</PunkThemeProvider>
```

### `useTheme()`

Hook to access theme context.

```tsx
const { theme, setTheme, toggleTheme, resolver, tokens } = useTheme()
```

### `useToken(path)`

Hook to resolve a single token value with memoization.

```tsx
const accentColor = useToken('tokens.colors.accent.solid')
// → '#FF5AC4'
```

### `useTokens(paths)`

Hook to resolve multiple token values.

```tsx
const values = useTokens([
  'tokens.colors.accent.solid',
  'tokens.space.4',
  'tokens.radii.md'
])
// → { 'tokens.colors.accent.solid': '#FF5AC4', ... }
```

### `TokenResolver`

Low-level token resolver class.

```typescript
import { TokenResolver } from '@punk/tokens'

const resolver = new TokenResolver({ theme: 'light' })
const color = resolver.resolve('tokens.colors.accent.solid')
```

### `cn(...classes)`

Utility for combining class names.

```typescript
import { cn } from '@punk/tokens'

cn('base', isActive && 'active', 'end')
// → 'base active end'

cn(['foo', 'bar'], { baz: true })
// → 'foo bar baz'
```

## CSS Variable Reference

All tokens are automatically injected as CSS custom properties:

```css
/* Colors */
--accent-solid: #FF5AC4;
--neutral-border: #CCCCCC;

/* Spacing */
--space-4: 16px;
--space-8: 32px;

/* Radii */
--radii-md: 6px;
--radii-full: 9999px;

/* Typography */
--fontSize-md: 16px;
--fontWeight-semibold: 600;

/* Shadows */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Animations */
--duration-150: 150ms;
--easing-easeInOut: cubic-bezier(0.4, 0, 0.2, 1);
```

## Performance

### Caching Strategy

The token resolver implements LRU caching:

- Maximum cached tokens: 1,000
- Automatic invalidation on theme change
- < 0.1ms resolution time (cached)

### Bundle Size

- Core package: ~22 KB (gzipped)
- Tree-shakeable exports
- Zero runtime dependencies (except React for provider)

### Optimization Tips

```tsx
// ❌ DON'T: Resolve on every render
function Bad() {
  return <div style={{ color: resolver.resolve('tokens.colors.accent.text') }} />
}

// ✅ DO: Use CSS variables
function Good() {
  return <div style={{ color: 'var(--accent-text)' }} />
}

// ✅ ALSO GOOD: Use memoized hook
function AlsoGood() {
  const color = useToken('tokens.colors.accent.text')
  return <div style={{ color }} />
}
```

## TypeScript

Full type safety for token paths:

```typescript
import type { ColorToken, SpaceToken } from '@punk/tokens'

const validColor: ColorToken = 'tokens.colors.accent.solid' // ✅
const validSpace: SpaceToken = 'tokens.space.4' // ✅

// TypeScript will error on invalid paths:
// const invalid: ColorToken = 'tokens.colors.invalid' // ❌
```

## Examples

### Button Component

```tsx
import { useToken } from '@punk/tokens'

function Button({ variant = 'primary', size = 'md', children }) {
  const color = useToken(`tokens.colors.${variant}.solid`)
  const padding = useToken(`tokens.space.${size === 'sm' ? 2 : 4}`)

  return (
    <button
      style={{
        backgroundColor: color,
        padding,
        borderRadius: 'var(--radii-md)',
        fontSize: 'var(--fontSize-md)',
        fontWeight: 'var(--fontWeight-semibold)'
      }}
    >
      {children}
    </button>
  )
}
```

### Theme Switcher

```tsx
import { useTheme } from '@punk/tokens'

function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        backgroundColor: 'var(--neutral-surface)',
        border: '1px solid var(--neutral-border)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radii-md)',
        cursor: 'pointer'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'} Toggle theme
    </button>
  )
}
```

## License

MIT

## See Also

- [TOKIFORGE_INTEGRATION.md](/home/user/Punk/TOKIFORGE_INTEGRATION.md) - Complete integration guide
- [PUNK_FOUNDATION_SPEC.md](/home/user/Punk/PUNK_FOUNDATION_SPEC.md) - Pink token taxonomy
