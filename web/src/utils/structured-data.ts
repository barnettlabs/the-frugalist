/**
 * JSON-LD builders.
 *
 * Attached to routes through `meta.seo.jsonLd`, so the same blocks are emitted
 * by the client on navigation and by the prerenderer at build time.
 */

import type { LearningContent } from '@/data/learningContent';
import { SITE_NAME, SITE_URL } from '@/utils/seo';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': ORGANIZATION_ID,
		name: SITE_NAME,
		legalName: 'JayTech LLC',
		url: `${SITE_URL}/`,
		logo: `${SITE_URL}/images/logo-black.png`,
		description:
			'TheFrugalist builds free tools for tracking price movement and understanding the true cost of financing, leasing, and mortgage offers.',
		email: 'jason.barnett@jaytech.io',
	};
}

export function websiteSchema(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		name: SITE_NAME,
		url: `${SITE_URL}/`,
		publisher: { '@id': ORGANIZATION_ID },
		inLanguage: 'en-US',
	};
}

/**
 * Marks a calculator page as a free web application.
 *
 * `offers` at price 0 is what makes the "Free" annotation eligible in results;
 * omitting it leaves the app untyped commercially.
 */
export function webApplicationSchema(options: {
	name: string;
	description: string;
	path: string;
	features: string[];
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: options.name,
		description: options.description,
		url: `${SITE_URL}${options.path}`,
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		publisher: { '@id': ORGANIZATION_ID },
		featureList: options.features,
		isAccessibleForFree: true,
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
		},
	};
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: `${SITE_URL}${item.path}`,
		})),
	};
}

/**
 * Turns a guide's glossary into a `DefinedTermSet`.
 *
 * The guides are already structured as term/definition pairs, which is exactly
 * what this type expects — it is the closest schema.org has to a glossary and
 * gives each term a chance to surface on its own.
 */
export function definedTermSetSchema(content: LearningContent, path: string): Record<string, unknown> {
	const setId = `${SITE_URL}${path}#glossary`;

	return {
		'@context': 'https://schema.org',
		'@type': 'DefinedTermSet',
		'@id': setId,
		name: `${content.title} Glossary`,
		description: content.description,
		url: `${SITE_URL}${path}`,
		hasDefinedTerm: content.terms.map(term => ({
			'@type': 'DefinedTerm',
			name: term.term,
			description: term.definition,
			inDefinedTermSet: { '@id': setId },
		})),
	};
}

/**
 * Renders a guide's terms as an FAQ.
 *
 * Definitions read naturally as answers to "What is X?", which is how these
 * pages are actually searched for.
 */
export function faqSchema(content: LearningContent, path: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		url: `${SITE_URL}${path}`,
		mainEntity: content.terms.map(term => ({
			'@type': 'Question',
			name: `What is ${term.term}?`,
			acceptedAnswer: {
				'@type': 'Answer',
				text: term.example ? `${term.definition} For example: ${term.example}` : term.definition,
			},
		})),
	};
}
