/**
 * TheFrugalist Color Palette — Editorial fintech field notes
 *
 * Refined, warm, intentional. Mirrors the web tokens 1:1 so every
 * surface across web + mobile shares the same parchment + ink + signal language.
 */

module.exports = {
  white: '#FFFFFF',
  black: '#000000',

  // Primary — deep ink near-black (text + headings + ink chips + primary CTAs)
  primary: {
    DEFAULT: '#171B27',
    light: '#3C4254',
    dark: '#0C0E16',
  },

  // Brand navy — preserved load-bearing identity (links, accents, focus rings)
  accent: {
    DEFAULT: '#235892',
    light: '#5F84B2',
    dark: '#163C66',
    muted: '#BFCFE2',
  },

  // Signal — warm marigold for selective callouts (savings unlocked, key metric)
  signal: {
    DEFAULT: '#C48626',
    light: '#E6B25A',
    dark: '#996416',
    muted: '#F2DEB1',
  },

  // Secondary maps to accent for backwards compatibility with old code
  secondary: {
    DEFAULT: '#235892',
    light: '#5F84B2',
    dark: '#163C66',
    muted: '#BFCFE2',
  },

  // Tan/parchment family — warm surface tones
  tan: {
    DEFAULT: '#F0EDE6',
    light: '#F7F5F1',
    dark: '#E1DCD2',
  },

  // Slate scale — kept for backwards compatibility but no longer the primary background
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

  // Charcoal — dark mode surfaces
  charcoal: {
    50: '#F2F2F7',
    100: '#E5E5EA',
    200: '#D1D1D6',
    300: '#C7C7CC',
    400: '#8E8E93',
    500: '#636366',
    600: '#48484A',
    700: '#3A3A3C',
    800: '#2C2C2E',
    850: '#1C1C1E',
    900: '#1C1C1E',
    950: '#000000',
  },

  // Neutral — re-tuned to warm parchment scale (matches web)
  neutral: {
    50: '#FAF7F0',
    100: '#F4F0E8', // Parchment background
    200: '#E8E2D6', // Surface-dark / deeper parchment
    300: '#DCD4C4', // Border (warm sand)
    400: '#C3B8A5', // Border-strong
    500: '#857C6B', // Mid muted
    600: '#5C5547',
    700: '#3F3A2F',
    800: '#231F18',
    900: '#15120D',
  },

  // Success — forest savings green
  success: {
    DEFAULT: '#437A59',
    50: '#F2F7F4',
    100: '#E5EFE8',
    200: '#C7DED0',
    300: '#9CC5AA',
    400: '#6BA57E',
    500: '#437A59',
    600: '#3A6347',
    700: '#2F5039',
    800: '#27402F',
    900: '#1F3326',
  },

  // Warning — antique amber
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

  // Danger — clay red
  danger: {
    DEFAULT: '#A8403C',
    50: '#FAF2F2',
    100: '#F5E5E5',
    200: '#E8C7C7',
    300: '#D69A9A',
    400: '#BF6969',
    500: '#A8403C',
    600: '#7C3131',
    700: '#642828',
    800: '#502020',
    900: '#401A1A',
  },

  // Info — same as accent navy
  info: {
    DEFAULT: '#235892',
    50: '#F2F5F9',
    100: '#E5EBF3',
    200: '#C7D5E5',
    300: '#9CB5D0',
    400: '#6B90B8',
    500: '#235892',
    600: '#1A4675',
    700: '#163C66',
    800: '#102C4A',
    900: '#0A1C30',
  },

  systemGray: {
    1: '#8E8E93',
    2: '#636366',
    3: '#48484A',
    4: '#3A3A3C',
    5: '#2C2C2E',
    6: '#1C1C1E',
  },

  // Theme-aware UI colors — Editorial fintech
  background: {
    light: '#F4F0E8', // Parchment
    dark: '#151821', // Slightly warm dark ink
  },
  surface: {
    light: '#FCFAF5', // Warm cream card
    dark: '#1E222D',
  },
  'surface-dark': {
    light: '#E8E2D6',
    dark: '#292E3C',
  },
  border: {
    light: '#DCD4C4', // Warm sand
    dark: '#333949',
  },
  'border-strong': {
    light: '#C3B8A5',
    dark: '#4B5366',
  },
  text: {
    primary: {
      light: '#171B27',
      dark: '#F0EADE',
    },
    muted: {
      light: '#756E60',
      dark: '#9F9889',
    },
  },

  // Tab bar — calm, parchment-toned
  tabBar: {
    light: {
      background: '#FCFAF5',
      border: '#DCD4C4',
      active: '#171B27',
      inactive: '#857C6B',
    },
    dark: {
      background: '#1E222D',
      border: '#333949',
      active: '#F0EADE',
      inactive: '#9F9889',
    },
  },

  // Header — parchment matches the body
  header: {
    light: {
      background: '#F4F0E8',
      text: '#171B27',
      border: '#DCD4C4',
    },
    dark: {
      background: '#151821',
      text: '#F0EADE',
      border: '#333949',
    },
  },
};
