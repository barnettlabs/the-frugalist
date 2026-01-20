import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.vue",
        "./src/**/*.ts",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Rubik", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Primary: Charcoal (text and headings)
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
                "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",

                // Accent: Olive Gray (links, active states, highlights)
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                "accent-light": "rgb(var(--color-accent-light) / <alpha-value>)",
                "accent-dark": "rgb(var(--color-accent-dark) / <alpha-value>)",
                "accent-muted": "rgb(var(--color-accent-muted) / <alpha-value>)",

                // Secondary (alias to accent for backward compatibility)
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                "secondary-light": "rgb(var(--color-secondary-light) / <alpha-value>)",
                "secondary-dark": "rgb(var(--color-secondary-dark) / <alpha-value>)",

                // Neutrals
                background: "rgb(var(--color-background) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                "surface-dark": "rgb(var(--color-surface-dark) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",

                // Tan accent colors
                tan: "rgb(var(--color-tan) / <alpha-value>)",
                "tan-light": "rgb(var(--color-tan-light) / <alpha-value>)",
                "tan-dark": "rgb(var(--color-tan-dark) / <alpha-value>)",

                // Semantic
                success: "rgb(var(--color-success) / <alpha-value>)",
                info: "rgb(var(--color-info) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",

                // Legacy
                light: "rgb(var(--color-light) / <alpha-value>)",
                dark: "rgb(var(--color-dark) / <alpha-value>)",

                // Neutral scale
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
            },
        },
    },

    plugins: [forms],

    safelist: [
        {
            pattern:
                /bg-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|success|info|warning|danger|light|dark|background|surface|surface-dark|tan|tan-light|tan-dark)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /text-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|success|info|warning|danger|light|dark|text-muted|text-primary)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /border-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|success|info|warning|danger|light|dark|border)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /rounded-(.*)/,
        },
    ],
};
