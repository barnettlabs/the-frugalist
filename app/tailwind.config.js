const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Body sans — kept as Rubik
        inter: ['Inter'],
        rubik: ['Rubik-Regular'],
        'rubik-medium': ['Rubik-Medium'],
        'rubik-semibold': ['Rubik-SemiBold'],
        'rubik-bold': ['Rubik-Bold'],
        // Editorial display — Fraunces (serif). Falls back to platform serif if font not yet bundled.
        display: ['Fraunces_500Medium', 'Fraunces-Medium', 'Georgia', 'serif'],
        'display-italic': ['Fraunces_500Medium_Italic', 'Fraunces-MediumItalic', 'Georgia', 'serif'],
        // Tabular numerals — JetBrains Mono. Falls back to platform monospace.
        mono: ['JetBrainsMono_500Medium', 'JetBrainsMono-Medium', 'Menlo', 'monospace'],
      },
      colors,
      borderRadius: {
        none: '0',
        sm: '3px',
        DEFAULT: '5px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(23, 27, 39, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(23, 27, 39, 0.1), 0 1px 2px -1px rgba(23, 27, 39, 0.1)',
        md: '0 4px 6px -1px rgba(23, 27, 39, 0.1), 0 2px 4px -2px rgba(23, 27, 39, 0.1)',
        lg: '0 10px 15px -3px rgba(23, 27, 39, 0.1), 0 4px 6px -4px rgba(23, 27, 39, 0.1)',
        xl: '0 20px 25px -5px rgba(23, 27, 39, 0.1), 0 8px 10px -6px rgba(23, 27, 39, 0.1)',
        // Editorial paper card shadow — soft, warm
        card: '0 1px 0 0 rgba(23, 27, 39, 0.04), 0 1px 3px 0 rgba(23, 27, 39, 0.06)',
        'card-hover': '0 12px 30px -16px rgba(23, 27, 39, 0.18)',
        paper: '0 1px 0 0 rgba(23, 27, 39, 0.04), 0 14px 38px -22px rgba(23, 27, 39, 0.22)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'accent-glow': '0 4px 14px 0 rgba(35, 88, 146, 0.18)',
        signal: '0 4px 14px 0 rgba(196, 134, 38, 0.22)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tightest: '-0.04em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        button: '0.06em',
        eyebrow: '0.18em',
      },
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        // Tab-bar safe scroll padding
        'tab-safe': '6.5rem',
        'tab-safe-lg': '8rem',
      },
      opacity: {
        2: '0.02',
        3: '0.03',
        4: '0.04',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        85: '0.85',
        95: '0.95',
        98: '0.98',
      },
    },
  },
  plugins: [],
};
