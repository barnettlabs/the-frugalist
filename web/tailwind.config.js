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

                primary: 'rgb(var(--color-primary) / <alpha-value>)',
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
                secondary: "rgb(var(--color-secondary) / <alpha-value>)",
                success: "rgb(var(--color-success) / <alpha-value>)",
                info: "rgb(var(--color-info) / <alpha-value>)",
                warning: "rgb(var(--color-warning) / <alpha-value>)",
                danger: "rgb(var(--color-danger) / <alpha-value>)",
                light: "rgb(var(--color-light) / <alpha-value>)",
                dark: "rgb(var(--color-dark) / <alpha-value>)",
            },
        },
    },

    plugins: [forms],

    safelist: [
        {
            pattern:
                /bg-(primary|secondary|success|info|warning|danger|light|dark)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /text-(primary|secondary|success|info|warning|danger|light|dark)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /border-(primary|secondary|success|info|warning|danger|light|dark)/,
            variants: ["hover", "focus", "active"],
        },
        {
            pattern: /from-(primary|secondary|success|info|warning|danger)\/\d+/,
        },
        {
            pattern: /to-(primary|secondary|success|info|warning|danger)\/\d+/,
        },
        {
            pattern: /rounded-(.*)/,
        },
    ],
};
