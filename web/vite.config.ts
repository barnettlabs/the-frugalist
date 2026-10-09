import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import svgLoader from 'vite-svg-loader';

export default defineConfig(({ isSsrBuild }) => {
	/*
	 * The app is served from the domain root as a static site, so the base is
	 * simply '/'.
	 *
	 * It used to build to `api/public/web` with a '/web/' base, because Laravel
	 * served the SPA out of a subdirectory behind a catch-all route - which also
	 * required an html-base-transform plugin to rewrite asset hrefs. With Laravel
	 * gone the subdirectory, the base prefix and the plugin all go with it.
	 */
	const base = '/';

	/*
	 * The SSR build exists only to prerender public routes at build time
	 * (see scripts/prerender.mjs). It must not land in the client output.
	 */
	const outDir = isSsrBuild ? path.resolve(__dirname, 'node_modules/.prerender') : path.resolve(__dirname, 'dist');

	return {
		plugins: [
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
				'@': path.resolve(__dirname, 'src'),
				'@shared': path.resolve(__dirname, '../shared'),
			},
		},
		base,
		build: {
			outDir,
			emptyOutDir: true,
			rollupOptions: {
				output: {
					manualChunks: undefined,
				},
			},
		},
		server: {
			// Pinned off Vite's default 5173, which other local stacks claim. Without
			// strictPort Vite drifts to the next free port, which is not in the API's
			// CORS_ORIGINS, so sign-in fails with a CORS error instead of a clear one.
			port: 55173,
			strictPort: true,
			allowedHosts: ['localhost', '127.0.0.1', 'thefrugalist.local'],
		},
	};
});
