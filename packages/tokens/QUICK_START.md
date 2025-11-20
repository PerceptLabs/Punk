# Quick Start Guide - @punk/tokens

## Installation

```bash
npm install @punk/tokens
# or
yarn add @punk/tokens
```

## Basic Usage (3 Steps)

### 1. Wrap your app with PunkThemeProvider

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

### 2. Use tokens in your components

**Option A: CSS Variables (Recommended)**

```tsx
function Button() {
  return (
    <button style={{
      backgroundColor: 'var(--accent-solid)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radii-md)',
      color: 'var(--accent-textContrast)'
    }}>
      Click me
    </button>
  )
}
```

**Option B: useToken Hook**

```tsx
import { useToken } from '@punk/tokens'

function Button() {
  const bg = useToken('tokens.colors.accent.solid')
  const padding = useToken('tokens.space.4')

  return (
    <button style={{ backgroundColor: bg, padding }}>
      Click me
    </button>
  )
}
```

### 3. Add theme switching

```tsx
import { useTheme } from '@punk/tokens'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

## Common Token Paths

### Colors

```typescript
// Primary accent (pink)
'tokens.colors.accent.solid'       // #FF5AC4
'tokens.colors.accent.text'        // High contrast text
'tokens.colors.accent.border'      // Border color

// Neutral (gray)
'tokens.colors.neutral.solid'      // Gray
'tokens.colors.neutral.border'     // Border

// Semantic colors
'tokens.colors.critical.solid'     // Red
'tokens.colors.success.solid'      // Green
'tokens.colors.warning.solid'      // Orange
'tokens.colors.info.solid'         // Blue
```

### Spacing

```typescript
'tokens.space.2'    // 8px
'tokens.space.4'    // 16px
'tokens.space.6'    // 24px
'tokens.space.8'    // 32px
```

### Border Radius

```typescript
'tokens.radii.sm'   // 4px
'tokens.radii.md'   // 6px
'tokens.radii.lg'   // 8px
'tokens.radii.full' // 9999px (pill)
```

### Typography

```typescript
'tokens.fontSize.sm'           // 14px
'tokens.fontSize.md'           // 16px
'tokens.fontSize.lg'           // 18px
'tokens.fontWeight.semibold'   // 600
'tokens.fontWeight.bold'       // 700
```

## CSS Variables Reference

All tokens are available as CSS variables:

```css
/* Colors */
--accent-solid: #FF5AC4;
--neutral-border: #CCCCCC;

/* Spacing */
--space-4: 16px;
--space-8: 32px;

/* Radii */
--radii-md: 6px;

/* Typography */
--fontSize-md: 16px;
--fontWeight-semibold: 600;

/* Shadows */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

## Complete Example

```tsx
import { PunkThemeProvider, useTheme, useToken } from '@punk/tokens'

// 1. Wrap your app
export function App() {
  return (
    <PunkThemeProvider theme="light" persistTheme>
      <MyApp />
    </PunkThemeProvider>
  )
}

// 2. Create components using tokens
function Card({ title, children }) {
  return (
    <div style={{
      backgroundColor: 'var(--background-surface)',
      border: '1px solid var(--neutral-border)',
      borderRadius: 'var(--radii-lg)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <h2 style={{
        fontSize: 'var(--fontSize-lg)',
        fontWeight: 'var(--fontWeight-bold)',
        marginBottom: 'var(--space-4)'
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// 3. Add theme toggle
function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header style={{
      padding: 'var(--space-4)',
      borderBottom: '1px solid var(--neutral-border)'
    }}>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  )
}

// 4. Put it all together
function MyApp() {
  return (
    <>
      <Header />
      <Card title="Welcome">
        <p>Your app content here</p>
      </Card>
    </>
  )
}
```

## Tips

1. **Use CSS variables** for better performance
2. **Theme persists** to localStorage automatically
3. **Type safety** - Invalid token paths will error
4. **All tokens** are in the format `tokens.{category}.{name}`

## Next Steps

- Read [README.md](./README.md) for complete documentation
- Check [examples/basic-usage.tsx](./examples/basic-usage.tsx) for more examples
- See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details

## File Locations

All files are in `/home/user/Punk/packages/tokens/`:

- `/src/` - Source code
- `/__tests__/` - Test suites
- `/examples/` - Usage examples
- `README.md` - Full documentation
- `IMPLEMENTATION.md` - Technical details
