const colors = require('./src/components/ui/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        rubik: ['Rubik-Regular'],
        'rubik-medium': ['Rubik-Medium'],
        'rubik-semibold': ['Rubik-SemiBold'],
        'rubik-bold': ['Rubik-Bold'],
      },
      colors,
      // Smooth but subtle border radius
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
      // Modern shadows for depth and glassy effects
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        // Glass shadow - subtle primary tint
        glass: '0 8px 32px 0 rgba(35, 88, 146, 0.08)',
        // Card shadow - clean and minimal
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        // Elevated card
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        // Inner glow for glassy effect
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        // Primary accent shadow
        'primary-glow': '0 4px 14px 0 rgba(35, 88, 146, 0.25)',
        // Secondary accent shadow
        'secondary-glow': '0 4px 14px 0 rgba(47, 164, 169, 0.25)',
        // Accent glow
        'accent-glow': '0 4px 14px 0 rgba(242, 165, 65, 0.25)',
      },
      // Background opacity for glassmorphism
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
      },
      // Letter spacing
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        button: '0.06em',
      },
      // Spacing
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
      },
      // Opacity levels
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
