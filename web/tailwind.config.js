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
                border: "rgb(var(--color-border) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",

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
            },
        },
    },

    plugins: [forms],

    safelist: [
        {
            pattern:
                /bg-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|success|info|warning|danger|light|dark|background|surface)/,
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
