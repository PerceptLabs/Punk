/**
 * Pink Token System - TokiForge Integration
 *
 * Complete design token definitions following Radix UI 12-step color scale convention.
 * Integrates with TokiForge for runtime token resolution and theme switching.
 *
 * @see TOKIFORGE_INTEGRATION.md
 * @see PUNK_FOUNDATION_SPEC.md
 */

export interface TokenDefinition {
  colors: ColorTokens
  space: SpaceTokens
  radii: RadiiTokens
  typography: TypographyTokens
  shadows: ShadowTokens
  animations: AnimationTokens
}

export interface ColorTokens {
  accent: ColorScale
  neutral: ColorScale
  critical: ColorScale
  success: ColorScale
  warning: ColorScale
  info: ColorScale
  background: BackgroundColors
  text: TextColors
}

export interface ColorScale {
  // 12-step Radix scale
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string

  // Semantic aliases
  subtle: string
  subtleHover: string
  surface: string
  border: string
  borderHover: string
  solid: string
  solidHover: string
  text: string
  textContrast: string
}

export interface BackgroundColors {
  base: string
  surface: string
  overlay: string
}

export interface TextColors {
  primary: string
  secondary: string
  tertiary: string
  disabled: string
  inverse: string
}

export interface SpaceTokens {
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
  8: string
  10: string
  12: string
  16: string
  20: string
  24: string
  32: string
  40: string
  48: string
  56: string
  64: string
  80: string
  96: string
}

export interface RadiiTokens {
  none: string
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

export interface TypographyTokens {
  fontSizes: FontSizeTokens
  fontWeights: FontWeightTokens
  lineHeights: LineHeightTokens
  letterSpacing: LetterSpacingTokens
  fontFamily: FontFamilyTokens
}

export interface FontSizeTokens {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
  '7xl': string
  '8xl': string
  '9xl': string
}

export interface FontWeightTokens {
  light: string
  regular: string
  medium: string
  semibold: string
  bold: string
  extrabold: string
}

export interface LineHeightTokens {
  tight: string
  normal: string
  relaxed: string
  loose: string
}

export interface LetterSpacingTokens {
  tight: string
  normal: string
  wide: string
}

export interface FontFamilyTokens {
  sans: string
  mono: string
  serif: string
}

export interface ShadowTokens {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface AnimationTokens {
  duration: {
    75: string
    100: string
    150: string
    200: string
    300: string
    500: string
    700: string
    1000: string
  }
  easing: {
    linear: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

/**
 * Creates the complete color scale with semantic aliases
 */
function createColorScale(
  step1: string,
  step2: string,
  step3: string,
  step4: string,
  step5: string,
  step6: string,
  step7: string,
  step8: string,
  step9: string,
  step10: string,
  step11: string,
  step12: string
): ColorScale {
  return {
    1: step1,
    2: step2,
    3: step3,
    4: step4,
    5: step5,
    6: step6,
    7: step7,
    8: step8,
    9: step9,
    10: step10,
    11: step11,
    12: step12,
    // Semantic aliases for easier usage
    subtle: step2,
    subtleHover: step3,
    surface: step4,
    border: step7,
    borderHover: step8,
    solid: step9,
    solidHover: step10,
    text: step11,
    textContrast: step12
  }
}

/**
 * Pink Token System - Light Theme
 */
export const pinkTokensLight: TokenDefinition = {
  colors: {
    // Accent - Punk Pink
    accent: createColorScale(
      '#FFF5FB', // 1 - Lightest background
      '#FFE5F5', // 2 - Subtle background
      '#FFD4EE', // 3 - Subtle hover
      '#FFC4E7', // 4 - Surface
      '#FFB3E0', // 5 - Border subtle
      '#FFA3D9', // 6 - Border
      '#FF8ACE', // 7 - Border hover
      '#FF70C3', // 8 - Solid subtle
      '#FF5AC4', // 9 - Solid (primary)
      '#E64DB0', // 10 - Solid hover
      '#CC3A9D', // 11 - Text
      '#99287A'  // 12 - High contrast text
    ),

    // Neutral - Gray scale
    neutral: createColorScale(
      '#FCFCFC', // 1
      '#F7F7F7', // 2
      '#F0F0F0', // 3
      '#E8E8E8', // 4
      '#E0E0E0', // 5
      '#D6D6D6', // 6
      '#CCCCCC', // 7
      '#B8B8B8', // 8
      '#8B8B8B', // 9
      '#6E6E6E', // 10
      '#545454', // 11
      '#1A1A1A'  // 12
    ),

    // Critical - Red
    critical: createColorScale(
      '#FFF5F5', // 1
      '#FFE5E5', // 2
      '#FFD4D4', // 3
      '#FFC4C4', // 4
      '#FFB3B3', // 5
      '#FFA3A3', // 6
      '#FF8A8A', // 7
      '#FF7070', // 8
      '#E53E3E', // 9
      '#CC2F2F', // 10
      '#B32020', // 11
      '#8A1111'  // 12
    ),

    // Success - Green
    success: createColorScale(
      '#F0FFF4', // 1
      '#C6F6D5', // 2
      '#9AE6B4', // 3
      '#68D391', // 4
      '#48BB78', // 5
      '#38A169', // 6
      '#2F855A', // 7
      '#276749', // 8
      '#22543D', // 9
      '#1C4532', // 10
      '#1A3D2E', // 11
      '#153627'  // 12
    ),

    // Warning - Orange
    warning: createColorScale(
      '#FFFAF0', // 1
      '#FEEBC8', // 2
      '#FBD38D', // 3
      '#F6AD55', // 4
      '#ED8936', // 5
      '#DD6B20', // 6
      '#C05621', // 7
      '#9C4221', // 8
      '#7C2D12', // 9
      '#6C2410', // 10
      '#5C1D0E', // 11
      '#4A150B'  // 12
    ),

    // Info - Blue
    info: createColorScale(
      '#EBF8FF', // 1
      '#BEE3F8', // 2
      '#90CDF4', // 3
      '#63B3ED', // 4
      '#4299E1', // 5
      '#3182CE', // 6
      '#2B6CB0', // 7
      '#2C5282', // 8
      '#2A4365', // 9
      '#1E3A5F', // 10
      '#1A3552', // 11
      '#142C45'  // 12
    ),

    // Background
    background: {
      base: '#FFFFFF',
      surface: '#FAFAFA',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },

    // Text
    text: {
      primary: '#1A1A1A',
      secondary: '#545454',
      tertiary: '#8B8B8B',
      disabled: '#B8B8B8',
      inverse: '#FFFFFF'
    }
  },

  space: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px',
    80: '320px',
    96: '384px'
  },

  radii: {
    none: '0px',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px'
  },

  typography: {
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px',
      '7xl': '72px',
      '8xl': '96px',
      '9xl': '128px'
    },

    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },

    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2'
    },

    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    },

    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif'
    }
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },

  animations: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },

    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
}

/**
 * Pink Token System - Dark Theme
 */
export const pinkTokensDark: TokenDefinition = {
  ...pinkTokensLight,

  colors: {
    // Accent - Dark Punk Pink
    accent: createColorScale(
      '#2A1821', // 1 - Darkest background
      '#3D2030', // 2 - Subtle background
      '#51283F', // 3 - Subtle hover
      '#65304E', // 4 - Surface
      '#79385D', // 5 - Border subtle
      '#8D406C', // 6 - Border
      '#A1487B', // 7 - Border hover
      '#B5508A', // 8 - Solid subtle
      '#FF5AC4', // 9 - Solid (primary) - Same as light
      '#FF70C3', // 10 - Solid hover
      '#FF8ACE', // 11 - Text
      '#FFE5F5'  // 12 - High contrast text
    ),

    // Neutral - Dark Gray scale
    neutral: createColorScale(
      '#161616', // 1
      '#1F1F1F', // 2
      '#292929', // 3
      '#333333', // 4
      '#3D3D3D', // 5
      '#474747', // 6
      '#525252', // 7
      '#5C5C5C', // 8
      '#8B8B8B', // 9
      '#A3A3A3', // 10
      '#D6D6D6', // 11
      '#F7F7F7'  // 12
    ),

    // Critical - Dark Red
    critical: createColorScale(
      '#2C1515', // 1
      '#3D1F1F', // 2
      '#4E2929', // 3
      '#5F3333', // 4
      '#703D3D', // 5
      '#814747', // 6
      '#925252', // 7
      '#A35C5C', // 8
      '#E53E3E', // 9
      '#FF7070', // 10
      '#FF8A8A', // 11
      '#FFD4D4'  // 12
    ),

    // Success - Dark Green
    success: createColorScale(
      '#0F2419', // 1
      '#153627', // 2
      '#1A3D2E', // 3
      '#1C4532', // 4
      '#22543D', // 5
      '#276749', // 6
      '#2F855A', // 7
      '#38A169', // 8
      '#48BB78', // 9
      '#68D391', // 10
      '#9AE6B4', // 11
      '#C6F6D5'  // 12
    ),

    // Warning - Dark Orange
    warning: createColorScale(
      '#1F1108', // 1
      '#2E1A0B', // 2
      '#3D230E', // 3
      '#4C2C11', // 4
      '#5B3514', // 5
      '#6A3E17', // 6
      '#79471A', // 7
      '#88501D', // 8
      '#DD6B20', // 9
      '#ED8936', // 10
      '#F6AD55', // 11
      '#FBD38D'  // 12
    ),

    // Info - Dark Blue
    info: createColorScale(
      '#0D1F2D', // 1
      '#142C45', // 2
      '#1A3552', // 3
      '#1E3A5F', // 4
      '#2A4365', // 5
      '#2C5282', // 6
      '#2B6CB0', // 7
      '#3182CE', // 8
      '#4299E1', // 9
      '#63B3ED', // 10
      '#90CDF4', // 11
      '#BEE3F8'  // 12
    ),

    // Background
    background: {
      base: '#0D0D0D',
      surface: '#161616',
      overlay: 'rgba(0, 0, 0, 0.7)'
    },

    // Text
    text: {
      primary: '#F7F7F7',
      secondary: '#D6D6D6',
      tertiary: '#A3A3A3',
      disabled: '#5C5C5C',
      inverse: '#1A1A1A'
    }
  }
}

/**
 * Default export - light theme tokens
 */
export const pinkTokens = pinkTokensLight
