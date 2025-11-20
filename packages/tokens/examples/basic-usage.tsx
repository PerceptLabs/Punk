/**
 * Basic Usage Examples for @punk/tokens
 *
 * Demonstrates token resolution, theme switching, and CSS variable usage.
 */

import React from 'react'
import {
  PunkThemeProvider,
  useTheme,
  useToken,
  useTokens,
  resolver,
  cn
} from '../src'

// Example 1: Basic Theme Provider Setup
export function App() {
  return (
    <PunkThemeProvider
      theme="light"
      persistTheme={true}
      onThemeChange={(theme) => console.log('Theme changed to:', theme)}
    >
      <Examples />
    </PunkThemeProvider>
  )
}

// Example 2: Using the useTheme hook
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
        cursor: 'pointer',
        fontWeight: 'var(--fontWeight-semibold)'
      }}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}

// Example 3: Using the useToken hook
function Button({ variant = 'accent', children }: { variant?: string; children: React.ReactNode }) {
  const backgroundColor = useToken(`tokens.colors.${variant}.solid`)
  const textColor = useToken(`tokens.colors.${variant}.textContrast`)
  const padding = useToken('tokens.space.4')

  return (
    <button
      style={{
        backgroundColor,
        color: textColor,
        padding,
        borderRadius: 'var(--radii-md)',
        border: 'none',
        fontSize: 'var(--fontSize-md)',
        fontWeight: 'var(--fontWeight-semibold)',
        cursor: 'pointer',
        transition: 'all var(--duration-150) var(--easing-easeInOut)'
      }}
    >
      {children}
    </button>
  )
}

// Example 4: Using CSS variables directly (recommended for performance)
function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
      <h2
        style={{
          fontSize: 'var(--fontSize-lg)',
          fontWeight: 'var(--fontWeight-bold)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)'
        }}
      >
        {title}
      </h2>
      <div
        style={{
          color: 'var(--text-secondary)',
          lineHeight: 'var(--lineHeight-normal)'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Example 5: Using batch token resolution
function ColorPalette() {
  const colors = useTokens([
    'tokens.colors.accent.solid',
    'tokens.colors.neutral.solid',
    'tokens.colors.critical.solid',
    'tokens.colors.success.solid',
    'tokens.colors.warning.solid',
    'tokens.colors.info.solid'
  ])

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      {Object.entries(colors).map(([token, color]) => (
        <div
          key={token}
          style={{
            width: 'var(--space-16)',
            height: 'var(--space-16)',
            backgroundColor: color,
            borderRadius: 'var(--radii-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={token}
        />
      ))}
    </div>
  )
}

// Example 6: Using the resolver directly (low-level API)
function DirectResolverExample() {
  // You can use the global resolver instance
  const accentColor = resolver.resolve('tokens.colors.accent.solid')
  const spacing = resolver.resolve('tokens.space.8')

  return (
    <div style={{ color: accentColor, padding: spacing }}>
      Using direct resolver: {accentColor}
    </div>
  )
}

// Example 7: Using the cn() utility for class names
function ClassNameExample() {
  const [isActive, setActive] = React.useState(false)
  const [isDisabled, setDisabled] = React.useState(false)

  const className = cn(
    'button',
    'button--primary',
    isActive && 'button--active',
    isDisabled && 'button--disabled',
    { 'button--focused': true }
  )

  return (
    <button className={className} onClick={() => setActive(!isActive)}>
      className: {className}
    </button>
  )
}

// Example 8: Responsive component with tokens
function ResponsiveBox() {
  return (
    <div
      style={{
        backgroundColor: 'var(--background-surface)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radii-md)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--duration-200) var(--easing-easeOut)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      Hover over me!
    </div>
  )
}

// Example 9: Alert component using semantic colors
function Alert({ type = 'info', message }: { type: 'info' | 'success' | 'warning' | 'critical'; message: string }) {
  const { resolver } = useTheme()

  const colors = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    critical: 'critical'
  }

  const colorScale = colors[type]

  return (
    <div
      style={{
        backgroundColor: `var(--${colorScale}-subtle)`,
        border: `1px solid var(--${colorScale}-border)`,
        borderRadius: 'var(--radii-md)',
        padding: 'var(--space-4)',
        color: `var(--${colorScale}-text)`
      }}
    >
      {message}
    </div>
  )
}

// Example 10: Typography scale example
function TypographyScale() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const

  return (
    <div>
      {sizes.map((size) => (
        <div
          key={size}
          style={{
            fontSize: `var(--fontSize-${size})`,
            marginBottom: 'var(--space-2)',
            color: 'var(--text-primary)'
          }}
        >
          Font size: {size}
        </div>
      ))}
    </div>
  )
}

// Main Examples Component
function Examples() {
  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--fontSize-4xl)', fontWeight: 'var(--fontWeight-bold)', marginBottom: 'var(--space-8)' }}>
        @punk/tokens Examples
      </h1>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Theme Switching</h2>
        <ThemeSwitcher />
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="accent">Accent</Button>
          <Button variant="critical">Critical</Button>
          <Button variant="success">Success</Button>
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Card</h2>
        <Card title="Example Card">
          This is a card component using CSS variables from the Pink token system.
        </Card>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Color Palette</h2>
        <ColorPalette />
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Alerts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <Alert type="info" message="This is an info alert" />
          <Alert type="success" message="This is a success alert" />
          <Alert type="warning" message="This is a warning alert" />
          <Alert type="critical" message="This is a critical alert" />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Typography Scale</h2>
        <TypographyScale />
      </section>

      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--fontSize-2xl)', marginBottom: 'var(--space-4)' }}>Interactive Box</h2>
        <ResponsiveBox />
      </section>
    </div>
  )
}
