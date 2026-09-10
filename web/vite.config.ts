import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import svgLoader from 'vite-svg-loader';

function htmlBasePlugin(base: string): Plugin {
	return {
		name: 'html-base-transform',
		transformIndexHtml(html) {
			return html.replace(/href="\/web\//g, `href="${base}`);
		},
	};
}

export default defineConfig(({ mode, isSsrBuild }) => {
	const base = mode === 'production' ? '/web/' : '/';

	/*
	 * The SSR build exists only to prerender public routes at build time
	 * (see scripts/prerender.mjs). It must not land in the client output
	 * directory, which Laravel serves.
	 */
	const outDir = isSsrBuild
		? path.resolve(__dirname, 'node_modules/.prerender')
		: path.resolve(__dirname, '../api/public/web');

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
			htmlBasePlugin(base),
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
			allowedHosts: ['localhost', '127.0.0.1', 'thefrugalist.local'],
		},
	};
});
