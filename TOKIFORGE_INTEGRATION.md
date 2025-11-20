# TokiForge Integration Guide

Complete integration guide for TokiForge design token system with Punk Framework.

---

## Table of Contents

1. [TokiForge Overview](#tokiforge-overview)
2. [Punk Token Schema](#punk-token-schema)
3. [Integration Points](#integration-points)
4. [API Usage](#api-usage)
5. [Theme Configuration](#theme-configuration)
6. [Performance Considerations](#performance-considerations)
7. [Token Resolution Examples](#token-resolution-examples)
8. [Troubleshooting](#troubleshooting)

---

## TokiForge Overview

### What is TokiForge?

TokiForge is a **design token resolution system** that transforms semantic token references into actual CSS values at runtime. It provides:

- **Token Path Resolution**: Converts `tokens.colors.accent.solid` → `#FF5AC4` (or CSS variables)
- **Theme Switching**: Seamlessly switches between light/dark themes
- **CSS Variable Generation**: Emits CSS custom properties for dynamic theming
- **Type Safety**: Full TypeScript support for token access
- **Performance Optimization**: Memoization and caching of resolved values
- **Runtime Resolution**: Tokens resolve dynamically based on active theme

### Version

**TokiForge v1.2.0+**

```json
{
  "dependencies": {
    "@tokiforge/core": "^1.2.0",
    "@tokiforge/plugins": "^1.2.0"
  }
}
```

### Installation

```bash
npm install @tokiforge/core @tokiforge/plugins
```

Or with Punk CLI:

```bash
punk add dependency tokiforge
```

---

## Punk Token Schema

### Token Taxonomy

Punk's **Pink token system** organizes tokens into five categories:

| Category | Purpose | Token Format |
|----------|---------|--------------|
| **Colors** | Semantic color scales | `tokens.colors.{scale}.{step}` |
| **Spacing** | Layout and padding | `tokens.space.{size}` |
| **Radii** | Border radius values | `tokens.radii.{size}` |
| **Typography** | Font sizes, weights, families | `tokens.fontSize.{size}` |
| **Effects** | Shadows, animations, z-index | `tokens.shadows.{name}` |

### Color Tokens

Colors follow a **12-step scale** based on Radix UI convention:

```typescript
// Token Reference
tokens.colors.accent.1    // Background (lightest)
tokens.colors.accent.9    // Solid background
tokens.colors.accent.12   // Text (highest contrast)

// Semantic Aliases (recommended)
tokens.colors.accent.subtle      // Light background
tokens.colors.accent.surface     // Hover surface
tokens.colors.accent.border      // Border color
tokens.colors.accent.solid       // Primary solid
tokens.colors.accent.text        // Primary text
```

#### Color Scales Available

```typescript
{
  // Accent - Primary brand color
  colors: {
    accent: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Neutral - Grayscale
    neutral: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Critical - Errors/destructive actions
    critical: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Success - Positive confirmations
    success: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Warning - Caution/alerts
    warning: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Info - Informational messages
    info: { 1-12, subtle, subtleHover, surface, border, borderHover, solid, solidHover, text, textContrast },

    // Background - Page and surface backgrounds
    background: { base, surface, overlay },

    // Text - Text color utilities
    text: { primary, secondary, tertiary, disabled, inverse }
  }
}
```

### Spacing Tokens

```typescript
tokens.space.0      // 0px
tokens.space.2      // 8px (0.5rem)
tokens.space.4      // 16px (1rem)
tokens.space.8      // 32px (2rem)
tokens.space.12     // 48px (3rem)
tokens.space.16     // 64px (4rem)
tokens.space.20     // 80px (5rem)
// ... up to tokens.space.96 (384px)
```

### Radius Tokens

```typescript
tokens.radii.none      // 0px (square)
tokens.radii.xs        // 2px
tokens.radii.sm        // 4px
tokens.radii.md        // 6px (default)
tokens.radii.lg        // 8px
tokens.radii.xl        // 12px
tokens.radii.2xl       // 16px
tokens.radii.3xl       // 24px
tokens.radii.full      // 9999px (pill)
```

### Typography Tokens

```typescript
// Font Sizes
tokens.fontSize.xs     // 12px
tokens.fontSize.sm     // 14px
tokens.fontSize.md     // 16px (default)
tokens.fontSize.lg     // 18px
tokens.fontSize.xl     // 20px
tokens.fontSize.2xl    // 24px
// ... up to tokens.fontSize.9xl (128px)

// Font Weights
tokens.fontWeight.light        // 300
tokens.fontWeight.regular      // 400
tokens.fontWeight.medium       // 500
tokens.fontWeight.semibold     // 600
tokens.fontWeight.bold         // 700

// Line Heights
tokens.lineHeight.tight        // 1.25
tokens.lineHeight.normal       // 1.5
tokens.lineHeight.loose        // 2

// Letter Spacing
tokens.letterSpacing.tight     // -0.025em
tokens.letterSpacing.normal    // 0
tokens.letterSpacing.wide      // 0.025em

// Font Family
tokens.fontFamily.sans         // "Inter", system fonts
tokens.fontFamily.mono         // "Fira Code", monospace
```

---

## Integration Points

### 1. Puck Renderer Token Consumption

The **Puck renderer** consumes tokens through the TokiForge runtime:

```typescript
// @punk/core/renderer.tsx
import { TokiForge } from '@tokiforge/core'

interface RenderContext {
  tokiforge: TokiForge
  theme: 'light' | 'dark'
  tokens: typeof PinkTokens
}

export function PunkRenderer({
  schema,
  context,
  theme = 'light'
}: {
  schema: any
  context: RenderContext
  theme?: 'light' | 'dark'
}) {
  const tokiforge = new TokiForge({ theme })

  // Components access tokens via resolver
  return (
    <ThemeProvider theme={theme} tokiforge={tokiforge}>
      <SchemaRenderer schema={schema} />
    </ThemeProvider>
  )
}
```

### 2. Runtime Token Resolution

Tokens are resolved at component render time:

```typescript
// Token resolution flow
const buttonStyle = {
  backgroundColor: tokiforge.resolve('tokens.colors.accent.solid'),      // → "#FF5AC4" (light) or "#AA0055" (dark)
  padding: tokiforge.resolve('tokens.space.4'),                          // → "16px"
  borderRadius: tokiforge.resolve('tokens.radii.md'),                    // → "6px"
  fontSize: tokiforge.resolve('tokens.fontSize.md'),                     // → "16px"
  fontWeight: tokiforge.resolve('tokens.fontWeight.semibold'),           // → "600"
}
```

### 3. Theme Switching (Light/Dark)

TokiForge handles theme switching dynamically:

```typescript
// Dynamic theme switching
const tokiforge = new TokiForge()

function switchTheme(theme: 'light' | 'dark') {
  tokiforge.setTheme(theme)
  tokiforge.clearCache() // Invalidate cached values

  // Update CSS variables
  document.documentElement.setAttribute('data-theme', theme)

  // Notify subscribed components
  themeStore.emit('theme:change', { theme })
}
```

---

## API Usage

### Basic Token Resolution

```typescript
import { TokiForge } from '@tokiforge/core'

// Create resolver for light theme
const tokiforge = new TokiForge({ theme: 'light' })

// Resolve individual tokens
const accentColor = tokiforge.resolve('tokens.colors.accent.solid')
const spacingValue = tokiforge.resolve('tokens.space.4')
const radiusValue = tokiforge.resolve('tokens.radii.md')

console.log(accentColor)  // "#FF5AC4"
console.log(spacingValue) // "16px"
console.log(radiusValue)  // "6px"
```

### Using Tokens in Components

```typescript
import { useTheme } from '@punk/core'

function Button({ children, variant = 'primary' }) {
  const { tokiforge } = useTheme()

  const styles = {
    backgroundColor: tokiforge.resolve(`tokens.colors.${variant}.solid`),
    padding: `${tokiforge.resolve('tokens.space.2')} ${tokiforge.resolve('tokens.space.4')}`,
    borderRadius: tokiforge.resolve('tokens.radii.md'),
    fontSize: tokiforge.resolve('tokens.fontSize.md'),
    fontWeight: tokiforge.resolve('tokens.fontWeight.semibold'),
    border: `1px solid ${tokiforge.resolve('tokens.colors.neutral.border')}`,
    cursor: 'pointer',
    transition: `background-color ${tokiforge.resolve('tokens.duration.150')} ${tokiforge.resolve('tokens.easing.easeInOut')}`
  }

  return <button style={styles}>{children}</button>
}
```

### CSS Variable Approach

For better performance, TokiForge can emit CSS variables:

```typescript
import { TokiForge } from '@tokiforge/core'

const tokiforge = new TokiForge({ theme: 'light' })

// Generate CSS variable declarations
const cssVariables = tokiforge.generateCSSVariables()
// Output:
// --accent-1: #FAF1F5;
// --accent-2: #F3E8EE;
// --accent-3: #EDD4E3;
// --accent-solid: #FF5AC4;
// --space-4: 1rem;
// --radii-md: 0.375rem;
// ...

// Apply to root element
const style = document.documentElement.style
Object.entries(cssVariables).forEach(([key, value]) => {
  style.setProperty(`--${key}`, value)
})
```

### Type-Safe Token Access

```typescript
import type { ColorToken, SpaceToken, RadiiToken } from '@punk/tokens'

// TypeScript will validate token paths at compile time
const validColor: ColorToken = 'tokens.colors.accent.solid'     // ✅
const validSpace: SpaceToken = 'tokens.space.4'                 // ✅

// These would be caught by TypeScript:
// const invalidColor: ColorToken = 'tokens.colors.accent.invalid' // ❌
// const invalidSpace: SpaceToken = 'tokens.space.invalid'         // ❌
```

---

## Theme Configuration

### Default Theme Setup

```typescript
// config/themes.ts
import { TokiForge } from '@tokiforge/core'

export const themeConfig = {
  light: {
    name: 'light',
    colors: {
      accent: '#FF5AC4',      // Punk pink
      neutral: '#2D3748',     // Dark gray
      critical: '#E53E3E',    // Red
      success: '#38A169',     // Green
      warning: '#D69E2E',     // Orange
      info: '#3182CE',        // Blue
    }
  },
  dark: {
    name: 'dark',
    colors: {
      accent: '#AA0055',      // Dark pink
      neutral: '#E2E8F0',     // Light gray
      critical: '#FC8181',    // Light red
      success: '#68D391',     // Light green
      warning: '#F6AD55',     // Light orange
      info: '#63B3ED',        // Light blue
    }
  }
}

// Initialize resolver with theme
export function createThemeResolver(themeName: 'light' | 'dark') {
  const theme = themeConfig[themeName]
  return new TokiForge({
    theme: themeName,
    customTokens: theme
  })
}
```

### User Token Customization

```typescript
// Enable users to customize tokens
import { TokiForge } from '@tokiforge/core'

interface UserTokenOverrides {
  colors?: Record<string, string>
  space?: Record<string, string>
  radii?: Record<string, string>
  fontSize?: Record<string, string>
}

export function createCustomResolver(
  theme: 'light' | 'dark',
  overrides: UserTokenOverrides
) {
  const tokiforge = new TokiForge({ theme })

  // Apply user overrides
  if (overrides.colors) {
    Object.entries(overrides.colors).forEach(([key, value]) => {
      tokiforge.setToken(`tokens.colors.${key}`, value)
    })
  }

  return tokiforge
}

// Usage
const userPrefs = {
  colors: {
    'accent.solid': '#00FF00', // Custom green
    'accent.text': '#00AA00'
  }
}

const customResolver = createCustomResolver('light', userPrefs)
const color = customResolver.resolve('tokens.colors.accent.solid') // → "#00FF00"
```

### CSS Variable Generation

```typescript
// Auto-generate CSS variables for all tokens
export function injectThemeVariables(theme: 'light' | 'dark') {
  const tokiforge = new TokiForge({ theme })
  const cssVars = tokiforge.generateCSSVariables()

  // Create style tag
  const style = document.createElement('style')
  style.id = 'punk-theme-variables'

  let css = ':root {'
  Object.entries(cssVars).forEach(([key, value]) => {
    css += `\n  --${key}: ${value};`
  })
  css += '\n}'

  style.textContent = css
  document.head.appendChild(style)

  // Now all components can use: var(--accent-solid)
}

// In CSS/styled components
const buttonStyles = `
  button {
    background-color: var(--accent-solid);
    padding: var(--space-4);
    border-radius: var(--radii-md);
    font-size: var(--fontSize-md);
    font-weight: var(--fontWeight-semibold);
  }
`
```

---

## Performance Considerations

### 1. Token Caching Strategy

TokiForge implements automatic caching:

```typescript
class TokiForge {
  private tokenCache: Map<string, string> = new Map()

  resolve(tokenPath: string): string {
    const cacheKey = `${this.theme}:${tokenPath}`

    // Return cached value if exists
    if (this.tokenCache.has(cacheKey)) {
      return this.tokenCache.get(cacheKey)!
    }

    // Resolve and cache
    const value = this._resolveToken(tokenPath)
    this.tokenCache.set(cacheKey, value)
    return value
  }

  // Clear cache on theme switch
  setTheme(theme: 'light' | 'dark') {
    this.theme = theme
    this.tokenCache.clear() // Invalidate all cached values
  }
}
```

**Cache limits:**
- Maximum cached tokens: 1,000
- Maximum token path depth: 6
- Automatic invalidation on theme change

### 2. Bundle Size Impact

```
@tokiforge/core: ~12 KB (gzipped)
Token definitions: ~8 KB (gzipped)
CSS variable injection: ~2 KB (gzipped)

Total: ~22 KB overhead
```

Reduce footprint by:
- Using CSS variables instead of resolved values
- Tree-shaking unused token categories
- Lazy-loading custom token sets

### 3. Runtime Overhead

**Resolution Performance:**
- Single token resolution: < 0.1ms (cached)
- Theme switch: ~5ms (includes CSS variable injection)
- Batch resolution (100 tokens): < 1ms

**Optimization Tips:**

```typescript
// ❌ DON'T: Resolve tokens on every render
function BadButton() {
  return (
    <button style={{
      color: tokiforge.resolve('tokens.colors.accent.text'), // Resolves every render
      backgroundColor: tokiforge.resolve('tokens.colors.accent.solid')
    }}>
      Click me
    </button>
  )
}

// ✅ DO: Memoize resolved tokens
import { useMemo } from 'react'

function GoodButton() {
  const buttonStyles = useMemo(() => ({
    color: tokiforge.resolve('tokens.colors.accent.text'),
    backgroundColor: tokiforge.resolve('tokens.colors.accent.solid')
  }), []) // Cached

  return <button style={buttonStyles}>Click me</button>
}

// ✅ BEST: Use CSS variables directly
function BestButton() {
  return (
    <button style={{
      color: 'var(--accent-text)',      // No JS resolution needed
      backgroundColor: 'var(--accent-solid)'
    }}>
      Click me
    </button>
  )
}
```

---

## Token Resolution Examples

### Example 1: Button Component

```typescript
import { useTheme } from '@punk/core'
import { useCallback, useMemo } from 'react'

function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}: ButtonProps) {
  const { tokiforge, theme } = useTheme()

  const styles = useMemo(() => {
    const sizeMap = {
      sm: { padding: 'tokens.space.2', fontSize: 'tokens.fontSize.sm' },
      md: { padding: 'tokens.space.4', fontSize: 'tokens.fontSize.md' },
      lg: { padding: 'tokens.space.6', fontSize: 'tokens.fontSize.lg' }
    }

    const variantMap = {
      primary: {
        bg: `tokens.colors.accent.solid`,
        text: `tokens.colors.accent.text`,
        border: `tokens.colors.accent.border`
      },
      secondary: {
        bg: `tokens.colors.neutral.surface`,
        text: `tokens.colors.neutral.text`,
        border: `tokens.colors.neutral.border`
      }
    }

    const sizeConfig = sizeMap[size]
    const variantConfig = variantMap[variant]

    return {
      backgroundColor: tokiforge.resolve(variantConfig.bg),
      color: tokiforge.resolve(variantConfig.text),
      border: `1px solid ${tokiforge.resolve(variantConfig.border)}`,
      padding: tokiforge.resolve(sizeConfig.padding),
      fontSize: tokiforge.resolve(sizeConfig.fontSize),
      fontWeight: tokiforge.resolve('tokens.fontWeight.semibold'),
      borderRadius: tokiforge.resolve('tokens.radii.md'),
      cursor: 'pointer',
      transition: `all 150ms var(--easing-easeInOut)`
    }
  }, [variant, size, tokiforge])

  return (
    <button style={styles} onClick={onClick}>
      {children}
    </button>
  )
}
```

### Example 2: Responsive Card

```typescript
function Card({ title, children }) {
  const { tokiforge } = useTheme()

  const cardStyle = {
    backgroundColor: tokiforge.resolve('tokens.colors.background.surface'),
    border: `1px solid ${tokiforge.resolve('tokens.colors.neutral.border')}`,
    borderRadius: tokiforge.resolve('tokens.radii.lg'),
    padding: tokiforge.resolve('tokens.space.6'),
    boxShadow: tokiforge.resolve('tokens.shadows.md'),
  }

  const titleStyle = {
    fontSize: tokiforge.resolve('tokens.fontSize.lg'),
    fontWeight: tokiforge.resolve('tokens.fontWeight.bold'),
    color: tokiforge.resolve('tokens.colors.neutral.text'),
    marginBottom: tokiforge.resolve('tokens.space.4'),
  }

  const contentStyle = {
    lineHeight: tokiforge.resolve('tokens.lineHeight.relaxed'),
    color: tokiforge.resolve('tokens.colors.text.primary'),
  }

  return (
    <div style={cardStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div style={contentStyle}>{children}</div>
    </div>
  )
}
```

### Example 3: Theme Switcher

```typescript
function ThemeSwitcher() {
  const { theme, setTheme, tokiforge } = useTheme()

  const handleToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    // Update system theme attribute
    document.documentElement.setAttribute('data-theme', newTheme)

    // Persist user preference
    localStorage.setItem('punk-theme', newTheme)
  }, [theme, setTheme])

  const toggleStyle = {
    backgroundColor: tokiforge.resolve('tokens.colors.neutral.surface'),
    border: `1px solid ${tokiforge.resolve('tokens.colors.neutral.border')}`,
    padding: `${tokiforge.resolve('tokens.space.2')} ${tokiforge.resolve('tokens.space.4')}`,
    borderRadius: tokiforge.resolve('tokens.radii.md'),
    cursor: 'pointer',
    fontWeight: tokiforge.resolve('tokens.fontWeight.semibold')
  }

  return (
    <button style={toggleStyle} onClick={handleToggle}>
      {theme === 'light' ? '🌙' : '☀️'} {theme}
    </button>
  )
}
```

---

## Troubleshooting

### Issue: Token Not Resolving

**Error:** `Error: Invalid token path: tokens.foo.bar`

**Solution:** Verify token path format:
```typescript
// ❌ Wrong
tokiforge.resolve('accent.solid')
tokiforge.resolve('tokens.accent')

// ✅ Correct
tokiforge.resolve('tokens.colors.accent.solid')
tokiforge.resolve('tokens.space.4')
```

### Issue: Theme Not Switching

**Problem:** Theme changes but UI doesn't update

**Solution:** Clear cache and notify components:
```typescript
function switchTheme(newTheme: 'light' | 'dark') {
  tokiforge.setTheme(newTheme)
  tokiforge.clearCache() // Required!

  // Emit theme change event
  themeStore.emit('theme:changed', { theme: newTheme })

  // Force re-render components
  forceUpdate()
}
```

### Issue: Stale Cached Values

**Problem:** Token changes aren't reflected

**Solution:** Clear cache when updating tokens:
```typescript
function updateToken(tokenPath: string, newValue: string) {
  tokiforge.setToken(tokenPath, newValue)
  tokiforge.clearCache() // Invalidate cache
}
```

### Issue: Performance Degradation

**Problem:** App slows down with many components

**Solution:** Use CSS variables instead of JS resolution:
```typescript
// Instead of resolving in JS
const color = tokiforge.resolve('tokens.colors.accent.solid') // Slows down

// Use CSS variables
<div style={{ color: 'var(--accent-solid)' }} /> // Fast
```

### Issue: Type Errors with Tokens

**Problem:** TypeScript errors on invalid token paths

**Solution:** Use provided token type definitions:
```typescript
import type {
  ColorToken,
  SpaceToken,
  RadiiToken,
  FontSizeToken,
  FontWeightToken
} from '@punk/tokens'

// These are type-safe:
const color: ColorToken = 'tokens.colors.accent.solid'
const space: SpaceToken = 'tokens.space.4'

// TypeScript will error on invalid paths
```

---

## See Also

- [PUNK_FOUNDATION_SPEC.md](PUNK_FOUNDATION_SPEC.md) - Complete Pink token taxonomy
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and rendering pipeline
- [TokiForge Documentation](https://tokiforge.github.io/tokiforge/) - Official TokiForge docs
- [COMPONENT_REFERENCE.md](COMPONENT_REFERENCE.md) - Available components and their tokens

