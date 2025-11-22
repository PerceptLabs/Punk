/**
 * @punk/extended - Accessibility Tests for All Rigs
 * Smoke tests to verify a11y profiles exist for all Rig components
 */

import { describe, test, expect } from 'vitest'
import { getRigA11yProfile, getAllRigA11yProfiles } from '@punk/core'
import '@punk/extended' // Import all components to register them

describe('Rig Accessibility Profile Tests', () => {
  const rigComponents = [
    'Chart',
    'Table',
    'Command',
    'RichText',
    'Code',
    'Mermaid',
    'FileDrop',
    'DatePicker',
  ]

  test('all 8 Rig components have accessibility profiles', () => {
    const profiles = getAllRigA11yProfiles()

    rigComponents.forEach((component) => {
      expect(profiles[component]).toBeDefined()
      expect(profiles[component].role).toBeDefined()
      expect(profiles[component].required).toBeDefined()
      expect(profiles[component].hint).toBeDefined()
    })
  })

  test('getRigA11yProfile returns correct profile for each component', () => {
    rigComponents.forEach((component) => {
      const profile = getRigA11yProfile(component)
      expect(profile).toBeDefined()
      expect(profile?.role).toBeDefined()
    })
  })

  test('getRigA11yProfile returns undefined for non-Rig components', () => {
    const profile = getRigA11yProfile('Button')
    expect(profile).toBeUndefined()
  })
})

describe('Specific Rig Profiles', () => {
  describe('Chart Component', () => {
    test('has img role', () => {
      const profile = getRigA11yProfile('Chart')
      expect(profile?.role).toBe('img')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('Chart')
      expect(profile?.required).toContain('label')
    })

    test('has optional description field', () => {
      const profile = getRigA11yProfile('Chart')
      expect(profile?.optional).toContain('description')
    })

    test('provides hint for AI generation', () => {
      const profile = getRigA11yProfile('Chart')
      expect(profile?.hint).toContain('chart')
    })
  })

  describe('Table Component', () => {
    test('has table role', () => {
      const profile = getRigA11yProfile('Table')
      expect(profile?.role).toBe('table')
    })

    test('requires caption field', () => {
      const profile = getRigA11yProfile('Table')
      expect(profile?.required).toContain('caption')
    })

    test('has optional summary field', () => {
      const profile = getRigA11yProfile('Table')
      expect(profile?.optional).toContain('summary')
    })
  })

  describe('Command Component', () => {
    test('has combobox role', () => {
      const profile = getRigA11yProfile('Command')
      expect(profile?.role).toBe('combobox')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('Command')
      expect(profile?.required).toContain('label')
    })
  })

  describe('RichText Component', () => {
    test('has textbox role', () => {
      const profile = getRigA11yProfile('RichText')
      expect(profile?.role).toBe('textbox')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('RichText')
      expect(profile?.required).toContain('label')
    })
  })

  describe('Code Component', () => {
    test('has code role', () => {
      const profile = getRigA11yProfile('Code')
      expect(profile?.role).toBe('code')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('Code')
      expect(profile?.required).toContain('label')
    })
  })

  describe('Mermaid Component', () => {
    test('has img role', () => {
      const profile = getRigA11yProfile('Mermaid')
      expect(profile?.role).toBe('img')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('Mermaid')
      expect(profile?.required).toContain('label')
    })
  })

  describe('FileDrop Component', () => {
    test('has button role', () => {
      const profile = getRigA11yProfile('FileDrop')
      expect(profile?.role).toBe('button')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('FileDrop')
      expect(profile?.required).toContain('label')
    })
  })

  describe('DatePicker Component', () => {
    test('has combobox role', () => {
      const profile = getRigA11yProfile('DatePicker')
      expect(profile?.role).toBe('combobox')
    })

    test('requires label field', () => {
      const profile = getRigA11yProfile('DatePicker')
      expect(profile?.required).toContain('label')
    })
  })
})
