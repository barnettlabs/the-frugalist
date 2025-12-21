/**
 * App Color Palette
 * Based on the web portal's brand colors for consistency
 */

module.exports = {
  white: '#FFFFFF',
  black: '#000000',

  // Primary: Deep Blue (brand color)
  primary: {
    DEFAULT: '#235892',
    light: '#3B75B8',
    dark: '#193E66',
    'shade-1': '#1F4F83',
    'shade-2': '#1C4675',
    'shade-3': '#193E66',
    'shade-4': '#153558',
    'shade-5': '#122C49',
    'shade-6': '#0E233A',
    'tint-1': '#3B75B8',
    'tint-2': '#5D88B2',
    'tint-3': '#7AA0C2',
    'tint-4': '#97B8D2',
    'tint-5': '#B4D0E2',
    'tint-6': '#D1E8F2',
  },

  // Secondary: Teal (brand color)
  secondary: {
    DEFAULT: '#2FA4A9',
    light: '#40BABF',
    dark: '#268387',
  },

  // Accent: Warm Amber (brand color)
  accent: {
    DEFAULT: '#F2A541',
    soft: '#F7C97A',
    dark: '#D98B29',
  },

  // Charcoal - slate-tinted for depth (dark mode backgrounds)
  charcoal: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    850: '#172033',
    900: '#0F172A',
    950: '#020617',
  },

  // Neutral grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Success - green tones
  success: {
    DEFAULT: '#2EAD7D',
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#2EAD7D',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning - amber tones
  warning: {
    DEFAULT: '#E6A23C',
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#E6A23C',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Danger - red tones
  danger: {
    DEFAULT: '#D64545',
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#D64545',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info - blue tones
  info: {
    DEFAULT: '#4A90E2',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#4A90E2',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Theme-aware UI colors
  background: {
    light: '#EFF2F7',
    dark: '#0F1C2E',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#162A44',
  },
  border: {
    light: '#D6DEE8',
    dark: '#2C405C',
  },
  text: {
    primary: {
      light: '#1F2933',
      dark: '#E6ECF3',
    },
    muted: {
      light: '#6B7C93',
      dark: '#9FB2C8',
    },
  },

  // Tab bar colors - theme aware
  tabBar: {
    light: {
      background: '#FFFFFF',
      border: '#E5E5E5',
      active: '#235892',
      inactive: '#64748B',
    },
    dark: {
      background: '#0F172A',
      border: '#1E293B',
      active: '#3B75B8',
      inactive: '#64748B',
    },
  },

  // Header colors - theme aware
  header: {
    light: {
      background: '#FFFFFF',
      text: '#0F172A',
      border: '#E5E5E5',
    },
    dark: {
      background: '#0F172A',
      text: '#F8FAFC',
      border: '#1E293B',
    },
  },
};
