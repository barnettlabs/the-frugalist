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
                display: ["Fraunces", "Iowan Old Style", "Apple Garamond", "Baskerville", "Georgia", ...defaultTheme.fontFamily.serif],
                serif: ["Fraunces", "Iowan Old Style", "Apple Garamond", "Baskerville", "Georgia", ...defaultTheme.fontFamily.serif],
                mono: ["JetBrains Mono", "SF Mono", "Menlo", ...defaultTheme.fontFamily.mono],
            },
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
                "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",

                accent: "rgb(var(--color-accent) / <alpha-value>)",
                "accent-light": "rgb(var(--color-accent-light) / <alpha-value>)",
                "accent-dark": "rgb(var(--color-accent-dark) / <alpha-value>)",
                "accent-muted": "rgb(var(--color-accent-muted) / <alpha-value>)",

                signal: "rgb(var(--color-signal) / <alpha-value>)",
                "signal-light": "rgb(var(--color-signal-light) / <alpha-value>)",
                "signal-dark": "rgb(var(--color-signal-dark) / <alpha-value>)",

                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                "secondary-light": "rgb(var(--color-secondary-light) / <alpha-value>)",
                "secondary-dark": "rgb(var(--color-secondary-dark) / <alpha-value>)",

                background: "rgb(var(--color-background) / <alpha-value>)",
                surface: "rgb(var(--color-surface) / <alpha-value>)",
                "surface-dark": "rgb(var(--color-surface-dark) / <alpha-value>)",
                border: "rgb(var(--color-border) / <alpha-value>)",
                "border-strong": "rgb(var(--color-border-strong) / <alpha-value>)",
                "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
                "text-primary": "rgb(var(--color-text-primary) / <alpha-value>)",

                tan: "rgb(var(--color-tan) / <alpha-value>)",
                "tan-light": "rgb(var(--color-tan-light) / <alpha-value>)",
                "tan-dark": "rgb(var(--color-tan-dark) / <alpha-value>)",

                success: "rgb(var(--color-success) / <alpha-value>)",
                info: "rgb(var(--color-info) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",

                light: "rgb(var(--color-light) / <alpha-value>)",
                dark: "rgb(var(--color-dark) / <alpha-value>)",

                neutral: {
                    50: '#FAF7F0',
                    100: '#F4F0E8',
                    200: '#E8E2D6',
                    300: '#D7CFBE',
                    400: '#B5AB97',
                    500: '#857C6B',
                    600: '#5C5547',
                    700: '#3F3A2F',
                    800: '#231F18',
                    900: '#15120D',
                },
            },
            letterSpacing: {
                'eyebrow': '0.18em',
                'tightest': '-0.04em',
            },
        },
    },

    plugins: [forms],

    safelist: [
        {
            pattern:
                /bg-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|signal|signal-light|signal-dark|success|info|warning|danger|light|dark|background|surface|surface-dark|tan|tan-light|tan-dark)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /text-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|signal|signal-light|signal-dark|success|info|warning|danger|light|dark|text-muted|text-primary)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /border-(primary|primary-light|primary-dark|accent|accent-light|accent-dark|secondary|secondary-light|secondary-dark|signal|success|info|warning|danger|light|dark|border|border-strong)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /font-(sans|display|serif|mono)/,
        },
        {
            pattern: /rounded-(.*)/,
        },
    ],
};
