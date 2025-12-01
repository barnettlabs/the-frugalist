import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";
import path from "path";
import svgLoader from 'vite-svg-loader'

export default defineConfig({
    server: {

    },
    plugins: [
        laravel({
            input: "resources/js/app.ts",
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        svgLoader(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
            "~": path.resolve(__dirname),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
});
