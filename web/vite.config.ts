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

export default defineConfig(({ mode }) => {
	const base = mode === 'production' ? '/web/' : '/';

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
			outDir: path.resolve(__dirname, '../api/public/web'),
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
