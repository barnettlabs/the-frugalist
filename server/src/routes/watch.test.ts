import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/client.js';
import { retailers } from '../db/schema.js';
import { createApp } from '../http/app.js';
import type { RetailerProduct } from '../services/retailers/types.js';
import { createLegacyUser, signIn } from '../test/factories.js';

/**
 * Creating and updating watches through the route.
 *
 * The retailer HTTP client is stubbed, as in jobs/check-prices.test.ts, so these
 * exercise the route's own rules and what it writes to the database.
 */

const stubProduct = vi.fn<(sku: string) => Promise<RetailerProduct | null>>();

vi.mock('../services/retailers/factory.js', async () => {
	const actual = await vi.importActual<typeof import('../services/retailers/factory.js')>(
		'../services/retailers/factory.js',
	);

	return {
		...actual,
		createRetailerClient: () => ({
			slug: 'bestbuy',
			getProductDetails: (sku: string) => stubProduct(sku),
			searchProduct: (sku: string) => stubProduct(sku),
			validateProduct: async () => true,
			setDebugMode() {
				return this;
			},
			getLastRawResponse: () => null,
		}),
	};
});

const app = createApp();

// The route rejects a start date in the past, and compares in UTC.
const today = () => new Date().toISOString().slice(0, 10);

let token = '';
let retailerId = 0;

const authed = (path: string, init: RequestInit = {}) =>
	app.request(path, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...(init.headers ?? {}),
		},
	});

function product(overrides: Partial<RetailerProduct> = {}): RetailerProduct {
	return {
		name: 'Test Product',
		variant: null,
		description: null,
		image_url: null,
		retail_price: 200,
		current_price: 150,
		in_stock: false,
		sku_upc: '123456789012',
		retailer_url: null,
		metadata: {},
		...overrides,
	};
}

beforeAll(async () => {
	const user = await createLegacyUser();
	token = await signIn(app, user);

	const suffix = Math.random().toString(36).slice(2, 10);
	const [retailer] = await db()
		.insert(retailers)
		.values({
			name: `Best Buy ${suffix}`,
			slug: `bestbuy-${suffix}`,
			apiBaseUrl: 'https://example.test',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as typeof retailers.$inferInsert)
		.returning();

	retailerId = Number(retailer!.id);
});

beforeEach(() => {
	stubProduct.mockReset();
});

describe('stock-only watches', () => {
	it('creates a stock watch with no target price', async () => {
		stubProduct.mockResolvedValue(product({ sku_upc: 'STOCK-1' }));

		const res = await authed('/api/watch', {
			method: 'POST',
			body: JSON.stringify({
				retailer_id: retailerId,
				sku_upc: 'STOCK-1',
				watch_type: 'stock',
				notification_methods: ['email'],
				tracking_start_date: today(),
			}),
		});

		expect(res.status).toBe(201);
		const body = (await res.json()) as { tracked_product: { target_price: unknown; watch_type: string } };
		expect(body.tracked_product.watch_type).toBe('stock');
		expect(body.tracked_product.target_price).toBeNull();
	});

	it('clears the target price on update', async () => {
		stubProduct.mockResolvedValue(product({ sku_upc: 'STOCK-2' }));

		const created = await authed('/api/watch', {
			method: 'POST',
			body: JSON.stringify({
				retailer_id: retailerId,
				sku_upc: 'STOCK-2',
				target_price: 100,
				notification_methods: ['email'],
				tracking_start_date: today(),
			}),
		});
		expect(created.status).toBe(201);
		const id = ((await created.json()) as { tracked_product: { id: number } }).tracked_product.id;

		const res = await authed(`/api/watch/${id}`, {
			method: 'PATCH',
			body: JSON.stringify({ watch_type: 'stock', target_price: null }),
		});

		expect(res.status).toBe(200);
	});
});
