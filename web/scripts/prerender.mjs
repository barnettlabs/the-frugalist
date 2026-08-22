/**
 * Build-time prerenderer and sitemap generator.
 *
 * Runs after the client and SSR builds (see the `build` script in
 * package.json). For every public route it writes a complete HTML document —
 * real markup plus the route's own title, description, canonical, social cards,
 * and JSON-LD — into `api/public/web/prerendered/`.
 *
 * Laravel serves those files ahead of the SPA shell; see the `$serveSpa`
 * closure in `api/routes/web.php`. Anything without a prerendered file falls
 * back to the shell exactly as before.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.resolve(webRoot, '../api/public/web');
const prerenderDir = path.join(clientDir, 'prerendered');
const ssrEntry = path.join(webRoot, 'node_modules/.prerender/entry-server.js');
const sitemapPath = path.resolve(webRoot, '../api/public/sitemap.xml');

const fail = message => {
	console.error(`\n  prerender: ${message}\n`);
	process.exit(1);
};

if (!fs.existsSync(ssrEntry)) fail(`missing SSR bundle at ${ssrEntry} — did "vite build --ssr" run?`);

const templatePath = path.join(clientDir, 'index.html');
if (!fs.existsSync(templatePath)) fail(`missing client build at ${templatePath} — did "vite build" run?`);

const { render, publicRoutePaths, SITE_URL } = await import(pathToFileURL(ssrEntry).href);
const template = fs.readFileSync(templatePath, 'utf8');

/**
 * Strips the placeholder head tags from the shell so the route's own can
 * replace them. These are exactly the tags marked `data-seo` in index.html.
 */
const stripDefaultSeoTags = html =>
	html
		.replace(/[ \t]*<title\b[^>]*\bdata-seo\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
		.replace(/[ \t]*<(?:meta|link)\b[^>]*\bdata-seo\b[^>]*>\s*/gi, '');

/** `/` -> `index.html`, `/learning/financing` -> `learning/financing.html`. */
const outputFileFor = routePath => {
	const trimmed = routePath.replace(/^\/+|\/+$/g, '');
	return path.join(prerenderDir, trimmed === '' ? 'index.html' : `${trimmed}.html`);
};

const routePaths = publicRoutePaths();
if (routePaths.length === 0) fail('no routes carry meta.seo — nothing to prerender');

fs.rmSync(prerenderDir, { recursive: true, force: true });

const rendered = [];

for (const routePath of routePaths) {
	let result;

	try {
		result = await render(routePath);
	} catch (error) {
		// Falling back to the SPA shell would leave the page indexable but
		// empty, which is the exact failure this script exists to prevent.
		fail(`failed to render ${routePath}\n  ${error?.stack ?? error}`);
	}

	const document = stripDefaultSeoTags(template)
		.replace('</head>', `\t${result.head}\n</head>`)
		.replace('<div id="app"></div>', `<div id="app">${result.html}</div>`);

	const outputFile = outputFileFor(routePath);
	fs.mkdirSync(path.dirname(outputFile), { recursive: true });
	fs.writeFileSync(outputFile, document);

	rendered.push(routePath);
	console.log(`  prerendered  ${routePath.padEnd(32)} ${(document.length / 1024).toFixed(1)} kB`);
}

const escapeXml = value =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/*
 * `lastmod` is deliberately omitted: every page would carry the build
 * timestamp, which claims content changed when only the bundle did. Search
 * engines discount sitemaps whose dates are not trustworthy.
 */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rendered.map(routePath => `\t<url>\n\t\t<loc>${escapeXml(`${SITE_URL}${routePath}`)}</loc>\n\t</url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap);

console.log(`\n  prerendered ${rendered.length} routes -> ${path.relative(webRoot, prerenderDir)}`);
console.log(`  sitemap     ${rendered.length} urls   -> ${path.relative(webRoot, sitemapPath)}\n`);
