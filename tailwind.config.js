import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.vue",
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

                primary: "var(--color-primary)",
                "primary-shade-1": "var(--color-primary-shade-1)",
                "primary-shade-2": "var(--color-primary-shade-2)",
                "primary-shade-3": "var(--color-primary-shade-3)",
                "primary-shade-4": "var(--color-primary-shade-4)",
                "primary-shade-5": "var(--color-primary-shade-5)",
                "primary-shade-6": "var(--color-primary-shade-6)",
                "primary-tint-1": "var(--color-primary-tint-1)",
                "primary-tint-2": "var(--color-primary-tint-2)",
                "primary-tint-3": "var(--color-primary-tint-3)",
                "primary-tint-4": "var(--color-primary-tint-4)",
                "primary-tint-5": "var(--color-primary-tint-5)",
                "primary-tint-6": "var(--color-primary-tint-6)",
                secondary: "var(--color-secondary)",
                success: "var(--color-success)",
                info: "var(--color-info)",
                warning: "var(--color-warning)",
                danger: "var(--color-danger)",
                light: "var(--color-light)",
                dark: "var(--color-dark)",
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
            pattern: /rounded-(.*)/,
        },
    ],
};
