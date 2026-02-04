/**
 * TheFrugalist Color Palette
 * A calm, analytical, and trustworthy color system
 */

module.exports = {
  white: '#FFFFFF',
  black: '#000000',

  // Primary: Text color (swaps based on theme)
  primary: {
    DEFAULT: '#1F1F1F',
    light: '#3D3D3D',
    dark: '#0A0A0A',
  },

  // Accent: Classic Blue (links, active states, highlights)
  accent: {
    DEFAULT: '#235892',
    light: '#5A7DAB',
    dark: '#1A4675',
    muted: '#A3B5CC',
  },

  // Secondary: Teal (leases, secondary actions)
  secondary: {
    DEFAULT: '#0D9488',
    light: '#2DD4BF',
    dark: '#0F766E',
    muted: '#99F6E4',
  },

  // Slate scale for backgrounds
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },

  // Charcoal scale (Apple-inspired dark mode colors)
  charcoal: {
    50: '#F2F2F7',   // Apple systemGroupedBackground light
    100: '#E5E5EA',  // Apple separator light
    200: '#D1D1D6',  // Apple systemGray5 light
    300: '#C7C7CC',  // Apple systemGray4 light
    400: '#8E8E93',  // Apple systemGray
    500: '#636366',  // Apple systemGray2
    600: '#48484A',  // Apple systemGray3
    700: '#3A3A3C',  // Apple systemGray4 dark (borders)
    800: '#2C2C2E',  // Apple systemGray5 dark (elevated)
    850: '#1C1C1E',  // Apple systemGray6 dark (cards)
    900: '#1C1C1E',  // Apple systemGray6 dark (cards)
    950: '#000000',  // Pure black (background)
  },

  // Neutral grays (Apple-inspired)
  neutral: {
    50: '#F2F2F7',   // Apple systemGroupedBackground
    100: '#FFFFFF',  // White (cards)
    200: '#E5E5EA',  // Apple separator
    300: '#D1D1D6',  // Apple systemGray5
    400: '#8E8E93',  // Apple systemGray
    500: '#636366',  // Apple systemGray2
    600: '#48484A',  // Apple systemGray3
    700: '#3A3A3C',  // Apple systemGray4
    800: '#2C2C2E',  // Apple systemGray5
    900: '#1C1C1E',  // Apple systemGray6
  },

  // Success - muted green
  success: {
    DEFAULT: '#4A7C59',
    50: '#F2F7F4',
    100: '#E5EFE8',
    200: '#C7DED0',
    300: '#9CC5AA',
    400: '#6BA57E',
    500: '#4A7C59',
    600: '#3A6347',
    700: '#2F5039',
    800: '#27402F',
    900: '#1F3326',
  },

  // Warning - muted amber
  warning: {
    DEFAULT: '#B8860B',
    50: '#FBF8F0',
    100: '#F6EDD8',
    200: '#EDD9AF',
    300: '#DFBE7A',
    400: '#CFA445',
    500: '#B8860B',
    600: '#996E09',
    700: '#7A5807',
    800: '#614606',
    900: '#4D3805',
  },

  // Danger - muted red
  danger: {
    DEFAULT: '#9B3D3D',
    50: '#FAF2F2',
    100: '#F5E5E5',
    200: '#E8C7C7',
    300: '#D69A9A',
    400: '#BF6969',
    500: '#9B3D3D',
    600: '#7C3131',
    700: '#642828',
    800: '#502020',
    900: '#401A1A',
  },

  // Info - muted blue
  info: {
    DEFAULT: '#4A6FA5',
    50: '#F2F5F9',
    100: '#E5EBF3',
    200: '#C7D5E5',
    300: '#9CB5D0',
    400: '#6B90B8',
    500: '#4A6FA5',
    600: '#3A5984',
    700: '#2F476A',
    800: '#273A56',
    900: '#1F2F45',
  },

  // Apple-inspired dark mode colors
  // These follow Apple's Human Interface Guidelines
  systemGray: {
    1: '#8E8E93', // systemGray
    2: '#636366', // systemGray2
    3: '#48484A', // systemGray3
    4: '#3A3A3C', // systemGray4
    5: '#2C2C2E', // systemGray5
    6: '#1C1C1E', // systemGray6 (cards in dark mode)
  },

  // Theme-aware UI colors (Apple-style)
  background: {
    light: '#F2F2F7', // Apple systemGroupedBackground
    dark: '#000000', // Pure black for dark mode
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1C1C1E', // Apple systemGray6
  },
  border: {
    light: '#E5E5EA', // Apple separator
    dark: '#38383A', // Apple separator dark
  },
  text: {
    primary: {
      light: '#000000',
      dark: '#FFFFFF',
    },
    muted: {
      light: '#8E8E93', // Apple systemGray
      dark: '#8E8E93',
    },
  },

  // Tab bar colors - theme aware (Apple-style)
  tabBar: {
    light: {
      background: '#FFFFFF',
      border: '#E5E5EA',
      active: '#235892',
      inactive: '#8E8E93',
    },
    dark: {
      background: '#1C1C1E',
      border: '#38383A',
      active: '#5A7DAB',
      inactive: '#8E8E93',
    },
  },

  // Header colors - theme aware (Apple-style)
  header: {
    light: {
      background: '#F2F2F7',
      text: '#000000',
      border: '#E5E5EA',
    },
    dark: {
      background: '#000000',
      text: '#FFFFFF',
      border: '#38383A',
    },
  },
};
