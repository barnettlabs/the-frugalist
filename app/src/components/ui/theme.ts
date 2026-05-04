/**
 * Shared Theme Styles — Editorial fintech field notes
 *
 * Mirrors the web app's design tokens. Use these constants to keep every
 * surface tonally aligned with the parchment + ink + signal palette.
 */

import colors from './colors';

/**
 * Tailwind class names for consistent theming
 */
export const tw = {
  /** Page/screen background — warm parchment in light, deep ink in dark */
  pageBg: 'bg-background-light dark:bg-background-dark',

  /** Card background — warm cream */
  cardBg: 'bg-surface-light dark:bg-surface-dark',

  /** Card with hairline border (editorial paper card) */
  card: 'rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark',

  /** Card with subtle elevation */
  cardElevated:
    'rounded-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-paper',

  /** Section background (deeper parchment, slightly recessed) */
  sectionBg: 'bg-surface-dark-light dark:bg-surface-dark-dark',

  /** Input/form field background — same warm cream as cards */
  inputBg: 'bg-surface-light dark:bg-surface-dark',

  /** Footer/action bar at bottom of screen */
  footerBar:
    'border-t border-border-light bg-surface-light px-4 py-4 dark:border-border-dark dark:bg-surface-dark',

  /** Eyebrow label (small caps, tracked) — uppercase via custom prop */
  eyebrow: 'text-[11px] font-semibold tracking-[0.18em] text-text-muted-light dark:text-text-muted-dark uppercase',

  /** Numeral text (tabular numerals) */
  numeral: 'font-mono tracking-tight',

  /** Hairline rule */
  hairline: 'h-px bg-border-light dark:bg-border-dark',

  /** Strong hairline */
  hairlineStrong: 'h-px bg-border-strong-light dark:bg-border-strong-dark',
} as const;

/**
 * Raw color values for StyleSheet usage
 */
export const themeColors = {
  light: {
    pageBg: colors.background.light,
    cardBg: colors.surface.light,
    cardBorder: colors.border.light,
    cardBorderStrong: colors['border-strong'].light,
    sectionBg: colors['surface-dark'].light,
    inputBg: colors.surface.light,
    textPrimary: colors.text.primary.light,
    textMuted: colors.text.muted.light,
    accent: colors.accent.DEFAULT,
    accentDark: colors.accent.dark,
    signal: colors.signal.DEFAULT,
    signalLight: colors.signal.light,
    primary: colors.primary.DEFAULT,
    surface: colors.surface.light,
    tan: colors.tan.DEFAULT,
  },
  dark: {
    pageBg: colors.background.dark,
    cardBg: colors.surface.dark,
    cardBorder: colors.border.dark,
    cardBorderStrong: colors['border-strong'].dark,
    sectionBg: colors['surface-dark'].dark,
    inputBg: colors.surface.dark,
    textPrimary: colors.text.primary.dark,
    textMuted: colors.text.muted.dark,
    accent: colors.accent.light,
    accentDark: colors.accent.DEFAULT,
    signal: colors.signal.light,
    signalLight: colors.signal.muted,
    primary: colors.text.primary.dark,
    surface: colors.surface.dark,
    tan: colors.charcoal[800],
  },
} as const;

/**
 * Hook-style helper to get theme colors based on color scheme
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? themeColors.dark : themeColors.light;
}

/**
 * Typography helpers — matches the web design system
 *
 * Display = Fraunces serif (falls back to system serif if not loaded)
 * Sans    = Rubik (default body)
 * Mono    = JetBrains Mono (falls back to system monospace)
 */
export const typography = {
  /** Editorial display headline (Fraunces serif) */
  display: 'font-display',
  /** Italic display variant */
  displayItalic: 'font-display italic',
  /** Body sans (Rubik) */
  sans: 'font-rubik',
  /** Tabular monospace (JetBrains Mono) */
  mono: 'font-mono',
  /** Tabular figure for big numerals */
  figure: 'font-mono tracking-tight',
} as const;
