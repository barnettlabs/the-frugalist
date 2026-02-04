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

  // Charcoal scale (legacy, maps to slate)
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
    50: '#FAFAF9',
    100: '#F7F6F3',
    200: '#EFEEEB',
    300: '#E5E4E1',
    400: '#A8A7A4',
    500: '#6B6B6B',
    600: '#4A4A4A',
    700: '#3D3D3D',
    800: '#2A2A2A',
    900: '#1F1F1F',
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

  // Theme-aware UI colors
  background: {
    light: '#F8FAFC',
    dark: '#1E293B',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#334155',
  },
  border: {
    light: '#E2E8F0',
    dark: '#475569',
  },
  text: {
    primary: {
      light: '#1F1F1F',
      dark: '#F8FAFC',
    },
    muted: {
      light: '#64748B',
      dark: '#94A3B8',
    },
  },

  // Tab bar colors - theme aware
  tabBar: {
    light: {
      background: '#FFFFFF',
      border: '#E2E8F0',
      active: '#235892',
      inactive: '#94A3B8',
    },
    dark: {
      background: '#334155',
      border: '#475569',
      active: '#5A7DAB',
      inactive: '#64748B',
    },
  },

  // Header colors - theme aware
  header: {
    light: {
      background: '#FFFFFF',
      text: '#1F1F1F',
      border: '#E2E8F0',
    },
    dark: {
      background: '#334155',
      text: '#F8FAFC',
      border: '#475569',
    },
  },
};
