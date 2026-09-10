/**
 * Build-time prerender entry.
 *
 * Renders public routes to static HTML with `@vue/server-renderer`, so crawlers
 * and social-card scrapers — neither of which reliably executes JavaScript —
 * get real content and correct metadata instead of an empty `<div id="app">`.
 *
 * This is *not* an SSR server. It runs once during `pnpm build` (see
 * `scripts/prerender.mjs`) and never at request time, so it needs no Node
 * server in production.
 *
 * The client deliberately does not hydrate this markup — `main.ts` does a clean
 * mount. Layout and navigation differ between a signed-out crawler and a
 * signed-in visitor, which would mismatch on hydration; a clean mount trades a
 * little redundant first-render work for not having to keep the two identical.
 */
import { createPinia } from 'pinia';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';

import App from '@/App.vue';
import { routes } from '@/router/routes';
import { renderSeoTags, seoForRoute } from '@/utils/seo';

export { publicRoutePaths } from '@/router/routes';
export { SITE_URL } from '@/utils/seo';

export interface RenderResult {
	/** Markup for `<div id="app">`. */
	html: string;
	/** Head tags: title, description, canonical, social cards, JSON-LD. */
	head: string;
}

export async function render(url: string): Promise<RenderResult> {
	const app = createSSRApp(App);

	app.use(createPinia());

	/*
	 * A bare router: memory history (there is no browser) and none of the
	 * navigation guards, which exist to redirect signed-out users. Only public
	 * routes are prerendered, so there is nothing for them to guard.
	 */
	const router = createRouter({ history: createMemoryHistory(), routes });
	app.use(router);

	await router.replace(url);
	await router.isReady();

	const resolved = router.currentRoute.value;

	if (resolved.matched.length === 0) {
		throw new Error(`No route matched "${url}"`);
	}

	return {
		html: await renderToString(app),
		head: renderSeoTags(seoForRoute(resolved)),
	};
}
