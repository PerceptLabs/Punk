/**
 * Type Definitions for Token System
 *
 * Provides type-safe token path autocomplete and validation.
 */

/**
 * Color token paths
 */
export type ColorToken =
  // Accent
  | 'tokens.colors.accent.1'
  | 'tokens.colors.accent.2'
  | 'tokens.colors.accent.3'
  | 'tokens.colors.accent.4'
  | 'tokens.colors.accent.5'
  | 'tokens.colors.accent.6'
  | 'tokens.colors.accent.7'
  | 'tokens.colors.accent.8'
  | 'tokens.colors.accent.9'
  | 'tokens.colors.accent.10'
  | 'tokens.colors.accent.11'
  | 'tokens.colors.accent.12'
  | 'tokens.colors.accent.subtle'
  | 'tokens.colors.accent.subtleHover'
  | 'tokens.colors.accent.surface'
  | 'tokens.colors.accent.border'
  | 'tokens.colors.accent.borderHover'
  | 'tokens.colors.accent.solid'
  | 'tokens.colors.accent.solidHover'
  | 'tokens.colors.accent.text'
  | 'tokens.colors.accent.textContrast'
  // Neutral
  | 'tokens.colors.neutral.1'
  | 'tokens.colors.neutral.2'
  | 'tokens.colors.neutral.3'
  | 'tokens.colors.neutral.4'
  | 'tokens.colors.neutral.5'
  | 'tokens.colors.neutral.6'
  | 'tokens.colors.neutral.7'
  | 'tokens.colors.neutral.8'
  | 'tokens.colors.neutral.9'
  | 'tokens.colors.neutral.10'
  | 'tokens.colors.neutral.11'
  | 'tokens.colors.neutral.12'
  | 'tokens.colors.neutral.subtle'
  | 'tokens.colors.neutral.subtleHover'
  | 'tokens.colors.neutral.surface'
  | 'tokens.colors.neutral.border'
  | 'tokens.colors.neutral.borderHover'
  | 'tokens.colors.neutral.solid'
  | 'tokens.colors.neutral.solidHover'
  | 'tokens.colors.neutral.text'
  | 'tokens.colors.neutral.textContrast'
  // Critical
  | 'tokens.colors.critical.1'
  | 'tokens.colors.critical.2'
  | 'tokens.colors.critical.3'
  | 'tokens.colors.critical.4'
  | 'tokens.colors.critical.5'
  | 'tokens.colors.critical.6'
  | 'tokens.colors.critical.7'
  | 'tokens.colors.critical.8'
  | 'tokens.colors.critical.9'
  | 'tokens.colors.critical.10'
  | 'tokens.colors.critical.11'
  | 'tokens.colors.critical.12'
  | 'tokens.colors.critical.subtle'
  | 'tokens.colors.critical.subtleHover'
  | 'tokens.colors.critical.surface'
  | 'tokens.colors.critical.border'
  | 'tokens.colors.critical.borderHover'
  | 'tokens.colors.critical.solid'
  | 'tokens.colors.critical.solidHover'
  | 'tokens.colors.critical.text'
  | 'tokens.colors.critical.textContrast'
  // Success
  | 'tokens.colors.success.1'
  | 'tokens.colors.success.2'
  | 'tokens.colors.success.3'
  | 'tokens.colors.success.4'
  | 'tokens.colors.success.5'
  | 'tokens.colors.success.6'
  | 'tokens.colors.success.7'
  | 'tokens.colors.success.8'
  | 'tokens.colors.success.9'
  | 'tokens.colors.success.10'
  | 'tokens.colors.success.11'
  | 'tokens.colors.success.12'
  | 'tokens.colors.success.subtle'
  | 'tokens.colors.success.subtleHover'
  | 'tokens.colors.success.surface'
  | 'tokens.colors.success.border'
  | 'tokens.colors.success.borderHover'
  | 'tokens.colors.success.solid'
  | 'tokens.colors.success.solidHover'
  | 'tokens.colors.success.text'
  | 'tokens.colors.success.textContrast'
  // Warning
  | 'tokens.colors.warning.1'
  | 'tokens.colors.warning.2'
  | 'tokens.colors.warning.3'
  | 'tokens.colors.warning.4'
  | 'tokens.colors.warning.5'
  | 'tokens.colors.warning.6'
  | 'tokens.colors.warning.7'
  | 'tokens.colors.warning.8'
  | 'tokens.colors.warning.9'
  | 'tokens.colors.warning.10'
  | 'tokens.colors.warning.11'
  | 'tokens.colors.warning.12'
  | 'tokens.colors.warning.subtle'
  | 'tokens.colors.warning.subtleHover'
  | 'tokens.colors.warning.surface'
  | 'tokens.colors.warning.border'
  | 'tokens.colors.warning.borderHover'
  | 'tokens.colors.warning.solid'
  | 'tokens.colors.warning.solidHover'
  | 'tokens.colors.warning.text'
  | 'tokens.colors.warning.textContrast'
  // Info
  | 'tokens.colors.info.1'
  | 'tokens.colors.info.2'
  | 'tokens.colors.info.3'
  | 'tokens.colors.info.4'
  | 'tokens.colors.info.5'
  | 'tokens.colors.info.6'
  | 'tokens.colors.info.7'
  | 'tokens.colors.info.8'
  | 'tokens.colors.info.9'
  | 'tokens.colors.info.10'
  | 'tokens.colors.info.11'
  | 'tokens.colors.info.12'
  | 'tokens.colors.info.subtle'
  | 'tokens.colors.info.subtleHover'
  | 'tokens.colors.info.surface'
  | 'tokens.colors.info.border'
  | 'tokens.colors.info.borderHover'
  | 'tokens.colors.info.solid'
  | 'tokens.colors.info.solidHover'
  | 'tokens.colors.info.text'
  | 'tokens.colors.info.textContrast'
  // Background
  | 'tokens.colors.background.base'
  | 'tokens.colors.background.surface'
  | 'tokens.colors.background.overlay'
  // Text
  | 'tokens.colors.text.primary'
  | 'tokens.colors.text.secondary'
  | 'tokens.colors.text.tertiary'
  | 'tokens.colors.text.disabled'
  | 'tokens.colors.text.inverse'

/**
 * Space token paths
 */
export type SpaceToken =
  | 'tokens.space.0'
  | 'tokens.space.1'
  | 'tokens.space.2'
  | 'tokens.space.3'
  | 'tokens.space.4'
  | 'tokens.space.5'
  | 'tokens.space.6'
  | 'tokens.space.8'
  | 'tokens.space.10'
  | 'tokens.space.12'
  | 'tokens.space.16'
  | 'tokens.space.20'
  | 'tokens.space.24'
  | 'tokens.space.32'
  | 'tokens.space.40'
  | 'tokens.space.48'
  | 'tokens.space.56'
  | 'tokens.space.64'
  | 'tokens.space.80'
  | 'tokens.space.96'

/**
 * Radius token paths
 */
export type RadiusToken =
  | 'tokens.radii.none'
  | 'tokens.radii.xs'
  | 'tokens.radii.sm'
  | 'tokens.radii.md'
  | 'tokens.radii.lg'
  | 'tokens.radii.xl'
  | 'tokens.radii.2xl'
  | 'tokens.radii.3xl'
  | 'tokens.radii.full'

/**
 * Font size token paths
 */
export type FontSizeToken =
  | 'tokens.fontSize.xs'
  | 'tokens.fontSize.sm'
  | 'tokens.fontSize.md'
  | 'tokens.fontSize.lg'
  | 'tokens.fontSize.xl'
  | 'tokens.fontSize.2xl'
  | 'tokens.fontSize.3xl'
  | 'tokens.fontSize.4xl'
  | 'tokens.fontSize.5xl'
  | 'tokens.fontSize.6xl'
  | 'tokens.fontSize.7xl'
  | 'tokens.fontSize.8xl'
  | 'tokens.fontSize.9xl'

/**
 * Font weight token paths
 */
export type FontWeightToken =
  | 'tokens.fontWeight.light'
  | 'tokens.fontWeight.regular'
  | 'tokens.fontWeight.medium'
  | 'tokens.fontWeight.semibold'
  | 'tokens.fontWeight.bold'
  | 'tokens.fontWeight.extrabold'

/**
 * Line height token paths
 */
export type LineHeightToken =
  | 'tokens.lineHeight.tight'
  | 'tokens.lineHeight.normal'
  | 'tokens.lineHeight.relaxed'
  | 'tokens.lineHeight.loose'

/**
 * Letter spacing token paths
 */
export type LetterSpacingToken =
  | 'tokens.letterSpacing.tight'
  | 'tokens.letterSpacing.normal'
  | 'tokens.letterSpacing.wide'

/**
 * Font family token paths
 */
export type FontFamilyToken =
  | 'tokens.fontFamily.sans'
  | 'tokens.fontFamily.mono'
  | 'tokens.fontFamily.serif'

/**
 * Shadow token paths
 */
export type ShadowToken =
  | 'tokens.shadows.none'
  | 'tokens.shadows.sm'
  | 'tokens.shadows.md'
  | 'tokens.shadows.lg'
  | 'tokens.shadows.xl'
  | 'tokens.shadows.2xl'
  | 'tokens.shadows.inner'

/**
 * Duration token paths
 */
export type DurationToken =
  | 'tokens.duration.75'
  | 'tokens.duration.100'
  | 'tokens.duration.150'
  | 'tokens.duration.200'
  | 'tokens.duration.300'
  | 'tokens.duration.500'
  | 'tokens.duration.700'
  | 'tokens.duration.1000'

/**
 * Easing token paths
 */
export type EasingToken =
  | 'tokens.easing.linear'
  | 'tokens.easing.easeIn'
  | 'tokens.easing.easeOut'
  | 'tokens.easing.easeInOut'

/**
 * All valid token paths
 */
export type TokenPath =
  | ColorToken
  | SpaceToken
  | RadiusToken
  | FontSizeToken
  | FontWeightToken
  | LineHeightToken
  | LetterSpacingToken
  | FontFamilyToken
  | ShadowToken
  | DurationToken
  | EasingToken
