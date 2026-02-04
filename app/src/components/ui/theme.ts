/**
 * Shared Theme Styles
 *
 * Use these constants to ensure consistent styling across the app.
 * Import and apply these class names to maintain design consistency.
 */

import colors from './colors';

/**
 * Tailwind class names for consistent theming
 */
export const tw = {
  /** Page/screen background - off-white in light, black in dark */
  pageBg: 'bg-neutral-50 dark:bg-charcoal-950',

  /** Card background - white in light, dark gray in dark */
  cardBg: 'bg-white dark:bg-charcoal-850',

  /** Card with border */
  card: 'rounded-xl bg-white dark:bg-charcoal-850 border border-neutral-200 dark:border-charcoal-700',

  /** Card with shadow (for elevated cards) */
  cardElevated:
    'rounded-xl bg-white dark:bg-charcoal-850 border border-neutral-200/60 dark:border-charcoal-700/60 shadow-card',

  /** Section/container background (slightly elevated from page) */
  sectionBg: 'bg-neutral-100 dark:bg-charcoal-900',

  /** Input/form field background */
  inputBg: 'bg-neutral-100 dark:bg-charcoal-800',

  /** Footer/action bar at bottom of screen */
  footerBar: 'border-t border-neutral-200 bg-white p-4 dark:border-charcoal-700 dark:bg-charcoal-850',
} as const;

/**
 * Raw color values for StyleSheet usage
 * Use these when you need inline styles (e.g., with Reanimated, or non-Tailwind components)
 */
export const themeColors = {
  light: {
    /** Page background */
    pageBg: colors.neutral[50],
    /** Card background */
    cardBg: colors.white,
    /** Card border */
    cardBorder: colors.neutral[200],
    /** Section background */
    sectionBg: colors.neutral[100],
    /** Input background */
    inputBg: colors.neutral[100],
    /** Primary text */
    textPrimary: colors.text.primary.light,
    /** Muted text */
    textMuted: colors.text.muted.light,
  },
  dark: {
    /** Page background */
    pageBg: colors.charcoal[950],
    /** Card background */
    cardBg: colors.charcoal[850],
    /** Card border */
    cardBorder: colors.charcoal[700],
    /** Section background */
    sectionBg: colors.charcoal[900],
    /** Input background */
    inputBg: colors.charcoal[800],
    /** Primary text */
    textPrimary: colors.text.primary.dark,
    /** Muted text */
    textMuted: colors.text.muted.dark,
  },
} as const;

/**
 * Hook-style helper to get theme colors based on color scheme
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? themeColors.dark : themeColors.light;
}
