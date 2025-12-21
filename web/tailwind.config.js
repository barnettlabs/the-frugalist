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
                brand: {
                    red: "#FF2D20",
                },

                // Primary: Deep Blue (#235892)
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                "primary-light": "rgb(var(--color-primary-light) / <alpha-value>)",
                "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",
                "primary-shade-1": "rgb(var(--color-primary-shade-1) / <alpha-value>)",
                "primary-shade-2": "rgb(var(--color-primary-shade-2) / <alpha-value>)",
                "primary-shade-3": "rgb(var(--color-primary-shade-3) / <alpha-value>)",
                "primary-shade-4": "rgb(var(--color-primary-shade-4) / <alpha-value>)",
                "primary-shade-5": "rgb(var(--color-primary-shade-5) / <alpha-value>)",
                "primary-shade-6": "rgb(var(--color-primary-shade-6) / <alpha-value>)",
                "primary-tint-1": "rgb(var(--color-primary-tint-1) / <alpha-value>)",
                "primary-tint-2": "rgb(var(--color-primary-tint-2) / <alpha-value>)",
                "primary-tint-3": "rgb(var(--color-primary-tint-3) / <alpha-value>)",
                "primary-tint-4": "rgb(var(--color-primary-tint-4) / <alpha-value>)",
                "primary-tint-5": "rgb(var(--color-primary-tint-5) / <alpha-value>)",
                "primary-tint-6": "rgb(var(--color-primary-tint-6) / <alpha-value>)",

                // Secondary: Teal (#2FA4A9)
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                "secondary-light": "rgb(var(--color-secondary-light) / <alpha-value>)",
                "secondary-dark": "rgb(var(--color-secondary-dark) / <alpha-value>)",

                // Accent: Warm Amber (#F2A541)
                accent: "rgb(var(--color-accent) / <alpha-value>)",
                "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
                "accent-dark": "rgb(var(--color-accent-dark) / <alpha-value>)",

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
            },
        },
    },

    plugins: [forms],

    safelist: [
        {
            pattern:
                /bg-(primary|primary-light|primary-dark|secondary|secondary-light|secondary-dark|accent|accent-soft|accent-dark|success|info|warning|danger|light|dark|background|surface)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /text-(primary|primary-light|primary-dark|secondary|secondary-light|secondary-dark|accent|accent-soft|accent-dark|success|info|warning|danger|light|dark|text-muted|text-primary)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /border-(primary|primary-light|primary-dark|secondary|secondary-light|secondary-dark|accent|accent-soft|accent-dark|success|info|warning|danger|light|dark|border)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /from-(primary|primary-light|primary-dark|secondary|accent|success|info|warning|danger)\/\d+/,
        },
        {
            pattern: /to-(primary|primary-light|primary-dark|secondary|accent|success|info|warning|danger)\/\d+/,
        },
        {
            pattern: /rounded-(.*)/,
        },
    ],
};
