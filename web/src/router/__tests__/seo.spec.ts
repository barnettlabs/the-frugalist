import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';

import { publicRoutePaths, routes } from '@/router/routes';
import { resolveSeo, seoForRoute, SITE_URL } from '@/utils/seo';

const router = () => createRouter({ history: createMemoryHistory(), routes });

const seoFor = (path: string) => seoForRoute(router().resolve(path) as never);

const requiresAuth = (path: string) =>
	router()
		.resolve(path)
		.matched.some(record => record.meta.requiresAuth);

describe('public route surface', () => {
	it('prerenders and lists exactly the indexable routes', () => {
		expect(publicRoutePaths()).toEqual([
			'/',
			'/estimates',
			'/estimates/financing/create',
			'/estimates/leasing/create',
			'/estimates/mortgage/create',
			'/learning',
			'/learning/financing',
			'/learning/leasing',
			'/privacy',
			'/terms',
		]);
	});

	// The guides and calculators are the entire organic search surface. If they
	// slip back behind the auth guard, crawlers get a login redirect and the
	// site silently loses every indexable page but the homepage.
	it.each(publicRoutePaths())('%s is reachable without an account', path => {
		expect(requiresAuth(path)).toBe(false);
	});

	it.each([
		'/dashboard',
		'/watch',
		'/profile',
		'/estimates/financing',
		'/estimates/leasing',
		'/estimates/mortgage',
		'/admin',
	])('%s still requires an account', path => {
		expect(requiresAuth(path)).toBe(true);
	});
});

describe('per-route metadata', () => {
	it('gives every public route a unique title and description', () => {
		const titles = publicRoutePaths().map(path => seoFor(path).title);
		const descriptions = publicRoutePaths().map(path => seoFor(path).description);

		expect(new Set(titles).size).toBe(titles.length);
		expect(new Set(descriptions).size).toBe(descriptions.length);
	});

	it('marks public routes indexable with a self-referencing canonical', () => {
		for (const path of publicRoutePaths()) {
			const seo = seoFor(path);

			expect(seo.robots).toBe('index, follow');
			expect(seo.canonical).toBe(`${SITE_URL}${path}`);
		}
	});

	// Routes opt in to indexing by carrying meta.seo, so anything private is
	// noindex by omission rather than by remembering to add a tag.
	it.each(['/dashboard', '/watch', '/admin', '/login', '/__ui'])('%s is noindex by default', path => {
		expect(seoFor(path).robots).toBe('noindex, nofollow');
	});

	it('defaults an absent meta.seo to noindex', () => {
		expect(resolveSeo(undefined, '/anything').robots).toBe('noindex, nofollow');
	});
});

describe('guide metadata', () => {
	it('describes each guide distinctly and as an article', () => {
		const financing = seoFor('/learning/financing');
		const leasing = seoFor('/learning/leasing');

		expect(financing.type).toBe('article');
		expect(financing.title).toContain('Financing');
		expect(leasing.title).toContain('Leasing');
	});

	it('emits a glossary, an FAQ, and breadcrumbs for each guide', () => {
		const types = seoFor('/learning/financing').jsonLd.map(block => block['@type']);

		expect(types).toEqual(expect.arrayContaining(['DefinedTermSet', 'FAQPage', 'BreadcrumbList']));
	});

	it('keeps unknown guide slugs out of the index', () => {
		expect(seoFor('/learning/not-a-guide').robots).toBe('noindex, follow');
	});
});

describe('calculator metadata', () => {
	it.each(['/estimates/financing/create', '/estimates/leasing/create', '/estimates/mortgage/create'])(
		'%s is marked up as a free WebApplication',
		path => {
			const app = seoFor(path).jsonLd.find(block => block['@type'] === 'WebApplication');

			expect(app).toBeDefined();
			expect(app?.isAccessibleForFree).toBe(true);
			expect(app?.url).toBe(`${SITE_URL}${path}`);
		}
	);
});
