/**
 * Central SEO metadata for the SPA.
 *
 * The same resolved metadata drives three consumers, so they can never drift:
 *  - the browser, via `applySeoToDocument` on every route change
 *  - the build-time prerenderer, via `renderSeoTags` (see `scripts/prerender.mjs`)
 *  - `sitemap.xml`, generated from the router's route table
 */

import type { RouteLocationNormalized } from 'vue-router';

export const SITE_URL = (import.meta.env?.VITE_SITE_URL ?? 'https://thefrugalist.io').replace(/\/$/, '');
export const SITE_NAME = 'TheFrugalist';
export const TWITTER_HANDLE = '';

export const DEFAULT_SEO = {
	title: 'TheFrugalist — Track prices, run the numbers, stop overpaying',
	description:
		'Free vehicle finance, lease, and mortgage calculators plus plain-language guides to dealer pricing tactics. Track price drops and know what a deal should actually cost.',
	image: `${SITE_URL}/og-image.png`,
	imageAlt: 'TheFrugalist — spend with intent, not impulse',
	type: 'website' as const,
};

/** SEO metadata attached to a route via `meta.seo`. */
export interface SeoMeta {
	/** Page title. Rendered as `<title>` verbatim — include the brand suffix yourself. */
	title?: string;
	description?: string;
	/** Absolute or root-relative image URL for OG/Twitter cards. */
	image?: string;
	imageAlt?: string;
	/** Open Graph object type. `article` for guides, `website` for everything else. */
	type?: 'website' | 'article';
	/** Overrides the canonical URL, which otherwise derives from the path. */
	canonical?: string;
	/** `robots` directive. Defaults to `index, follow` for routes carrying SEO metadata. */
	robots?: string;
	/** JSON-LD blocks for this page. */
	jsonLd?: Record<string, unknown>[];
}

/** `meta.seo` may be a static object or a function of the matched route. */
export type SeoMetaInput = SeoMeta | ((route: RouteLocationNormalized) => SeoMeta);

export interface ResolvedSeo {
	title: string;
	description: string;
	canonical: string;
	image: string;
	imageAlt: string;
	type: string;
	robots: string;
	jsonLd: Record<string, unknown>[];
}

const absolute = (url: string): string =>
	/^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

/**
 * Fills a route's SEO metadata with site defaults.
 *
 * Routes with no `meta.seo` are private surfaces (dashboard, admin, saved
 * estimates), so they default to `noindex` rather than to the site description.
 */
export function resolveSeo(meta: SeoMeta | undefined, path: string): ResolvedSeo {
	const seo = meta ?? {};
	const indexable = meta !== undefined;

	return {
		title: seo.title ?? DEFAULT_SEO.title,
		description: seo.description ?? DEFAULT_SEO.description,
		canonical: absolute(seo.canonical ?? path),
		image: absolute(seo.image ?? DEFAULT_SEO.image),
		imageAlt: seo.imageAlt ?? DEFAULT_SEO.imageAlt,
		type: seo.type ?? DEFAULT_SEO.type,
		robots: seo.robots ?? (indexable ? 'index, follow' : 'noindex, nofollow'),
		jsonLd: seo.jsonLd ?? [],
	};
}

/** Resolves `meta.seo`, which may be a function of the route. */
export function seoForRoute(route: RouteLocationNormalized): ResolvedSeo {
	const input = route.meta?.seo as SeoMetaInput | undefined;
	const meta = typeof input === 'function' ? input(route) : input;
	return resolveSeo(meta, route.path);
}

interface MetaTag {
	/** `name` for standard/Twitter meta, `property` for Open Graph. */
	key: 'name' | 'property';
	value: string;
	content: string;
}

/** The full meta tag set for a page, shared by the DOM applier and the prerenderer. */
export function seoToMetaTags(seo: ResolvedSeo): MetaTag[] {
	const tags: MetaTag[] = [
		{ key: 'name', value: 'description', content: seo.description },
		{ key: 'name', value: 'robots', content: seo.robots },

		{ key: 'property', value: 'og:site_name', content: SITE_NAME },
		{ key: 'property', value: 'og:type', content: seo.type },
		{ key: 'property', value: 'og:title', content: seo.title },
		{ key: 'property', value: 'og:description', content: seo.description },
		{ key: 'property', value: 'og:url', content: seo.canonical },
		{ key: 'property', value: 'og:image', content: seo.image },
		{ key: 'property', value: 'og:image:alt', content: seo.imageAlt },
		{ key: 'property', value: 'og:image:width', content: '1200' },
		{ key: 'property', value: 'og:image:height', content: '630' },
		{ key: 'property', value: 'og:locale', content: 'en_US' },

		{ key: 'name', value: 'twitter:card', content: 'summary_large_image' },
		{ key: 'name', value: 'twitter:title', content: seo.title },
		{ key: 'name', value: 'twitter:description', content: seo.description },
		{ key: 'name', value: 'twitter:image', content: seo.image },
		{ key: 'name', value: 'twitter:image:alt', content: seo.imageAlt },
	];

	if (TWITTER_HANDLE) {
		tags.push({ key: 'name', value: 'twitter:site', content: TWITTER_HANDLE });
	}

	return tags;
}

/** Marks every tag this module owns, so a route change can replace them wholesale. */
const MANAGED_ATTR = 'data-seo';

/**
 * Applies resolved SEO metadata to the live document.
 *
 * Every tag written here carries `data-seo`, including the defaults baked into
 * `index.html`, so navigating away removes the previous page's tags instead of
 * accumulating duplicates.
 */
export function applySeoToDocument(seo: ResolvedSeo): void {
	if (typeof document === 'undefined') return;

	document.title = seo.title;

	document.head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach(node => node.remove());

	for (const tag of seoToMetaTags(seo)) {
		const el = document.createElement('meta');
		el.setAttribute(tag.key, tag.value);
		el.setAttribute('content', tag.content);
		el.setAttribute(MANAGED_ATTR, '');
		document.head.appendChild(el);
	}

	const canonical = document.createElement('link');
	canonical.setAttribute('rel', 'canonical');
	canonical.setAttribute('href', seo.canonical);
	canonical.setAttribute(MANAGED_ATTR, '');
	document.head.appendChild(canonical);

	for (const block of seo.jsonLd) {
		const script = document.createElement('script');
		script.setAttribute('type', 'application/ld+json');
		script.setAttribute(MANAGED_ATTR, '');
		script.textContent = JSON.stringify(block);
		document.head.appendChild(script);
	}
}

const escapeAttr = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Renders resolved SEO metadata as head HTML for the build-time prerenderer.
 *
 * Mirrors `applySeoToDocument` exactly — crawlers that never execute JavaScript
 * see the same tags a browser would build.
 */
export function renderSeoTags(seo: ResolvedSeo): string {
	const lines = [
		`<title>${escapeAttr(seo.title)}</title>`,
		`<link rel="canonical" href="${escapeAttr(seo.canonical)}" ${MANAGED_ATTR}>`,
		...seoToMetaTags(seo).map(
			tag => `<meta ${tag.key}="${escapeAttr(tag.value)}" content="${escapeAttr(tag.content)}" ${MANAGED_ATTR}>`
		),
		// `<` is escaped so a stray `</script>` in the data cannot close the block early.
		...seo.jsonLd.map(
			block =>
				`<script type="application/ld+json" ${MANAGED_ATTR}>${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`
		),
	];

	return lines.join('\n\t');
}
