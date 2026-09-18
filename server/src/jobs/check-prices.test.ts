import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '../db/client.js';
import { writeMoney } from '../db/money.js';
import {
	notifications,
	priceAlerts,
	priceHistory,
	retailers,
	trackedProducts,
} from '../db/schema.js';
import { createLegacyUser } from '../test/factories.js';
import type { RetailerProduct } from '../services/retailers/types.js';

/**
 * The price-check job against a real database.
 *
 * The retailer HTTP client is stubbed - this is about the decision logic, which
 * is where the user-visible behaviour lives: which alert type fires, when
 * tracking auto-deactivates, and that nothing fires when it should not. Those
 * rules were spread across a 300-line Artisan command with no test coverage,
 * and getting one wrong means either silence or spam for real users.
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

// Imported after the mock is registered.
const { checkPrices } = await import('./check-prices.js');

function product(overrides: Partial<RetailerProduct> = {}): RetailerProduct {
	return {
		name: 'Test Product',
		variant: null,
		description: null,
		image_url: null,
		retail_price: 200,
		current_price: 150,
		in_stock: true,
		sku_upc: '123456789012',
		retailer_url: null,
		metadata: {},
		...overrides,
	};
}

let userId = 0;
let retailerId = 0;

beforeEach(async () => {
	stubProduct.mockReset();

	const user = await createLegacyUser();
	userId = user.id;

	// Both name and slug are unique columns, and the client factory is mocked, so
	// the slug does not need to be a real one.
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

afterEach(() => {
	vi.clearAllMocks();
});

/**
 * Runs the job scoped to this test's user.
 *
 * Test files run in separate processes against one database, so rows from other
 * tests are visible and a global `found` count is not deterministic. Passing the
 * user filter makes the summary counts mean what the assertions expect without
 * truncating tables another file might be using.
 */
async function run(options: { limit?: number; force?: boolean } = {}) {
	return checkPrices({ limit: options.limit ?? 10, force: options.force, userId });
}

async function track(overrides: Partial<typeof trackedProducts.$inferInsert> = {}) {
	const now = new Date();

	const [row] = await db()
		.insert(trackedProducts)
		.values({
			userId,
			retailerId,
			skuUpc: '123456789012',
			productName: 'Test Product',
			retailPrice: writeMoney(200),
			currentPrice: writeMoney(180),
			targetPrice: writeMoney(100),
			trackingStartDate: new Date(now.getTime() - 86_400_000),
			isActive: true,
			watchType: 'price',
			checkInterval: 60,
			inStock: true,
			notificationMethod: [],
			createdAt: now,
			updatedAt: now,
			...overrides,
		} as typeof trackedProducts.$inferInsert)
		.returning();

	return row!;
}

describe('selection', () => {
	it('skips a product checked within its interval', async () => {
		await track({ lastCheckedAt: new Date(Date.now() - 30 * 60_000) });

		const summary = await run();

		expect(summary.found).toBe(0);
		expect(stubProduct).not.toHaveBeenCalled();
	});

	it('includes a product whose interval has elapsed', async () => {
		stubProduct.mockResolvedValue(product());
		await track({ lastCheckedAt: new Date(Date.now() - 90 * 60_000) });

		const summary = await run();

		expect(summary.checked).toBe(1);
	});

	it('includes a never-checked product', async () => {
		stubProduct.mockResolvedValue(product());
		await track({ lastCheckedAt: null });

		expect((await run()).checked).toBe(1);
	});

	it('ignores the interval when forced', async () => {
		stubProduct.mockResolvedValue(product());
		await track({ lastCheckedAt: new Date() });

		expect((await run({ force: true })).checked).toBe(1);
	});

	it('skips an inactive product', async () => {
		await track({ isActive: false, lastCheckedAt: null });

		expect((await run()).found).toBe(0);
	});

	it('skips a soft-deleted product', async () => {
		await track({ deletedAt: new Date(), lastCheckedAt: null });

		expect((await run()).found).toBe(0);
	});

	it('skips a product whose tracking window has not opened', async () => {
		await track({
			trackingStartDate: new Date(Date.now() + 86_400_000),
			lastCheckedAt: null,
		});

		expect((await run()).found).toBe(0);
	});

	it('skips a product whose tracking window has closed', async () => {
		await track({
			trackingEndDate: new Date(Date.now() - 86_400_000),
			lastCheckedAt: null,
		});

		expect((await run()).found).toBe(0);
	});
});

describe('price recording', () => {
	it('updates the product and writes price history', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 150 }));
		const row = await track({ lastCheckedAt: null });

		await run();

		const [updated] = await db()
			.select()
			.from(trackedProducts)
			.where(eq(trackedProducts.id, row.id));

		expect(Number(updated!.currentPrice)).toBe(150);
		expect(updated!.lastCheckedAt).not.toBeNull();

		const history = await db()
			.select()
			.from(priceHistory)
			.where(eq(priceHistory.trackedProductId, row.id));

		expect(history).toHaveLength(1);
		expect(Number(history[0]!.price)).toBe(150);
	});

	it('counts a product the retailer cannot find as an error, not a check', async () => {
		stubProduct.mockResolvedValue(null);
		await track({ lastCheckedAt: null });

		const summary = await run();

		expect(summary.checked).toBe(0);
		expect(summary.errors).toBe(1);
	});
});

describe('alerting', () => {
	it('raises price_drop when the price falls above the target', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 150 }));
		const row = await track({ currentPrice: writeMoney(180), targetPrice: writeMoney(100) });

		const summary = await run({ force: true });

		expect(summary.alertsCreated).toBe(1);

		const alerts = await db()
			.select()
			.from(priceAlerts)
			.where(eq(priceAlerts.trackedProductId, row.id));

		expect(alerts).toHaveLength(1);
		expect(alerts[0]!.alertType).toBe('price_drop');
		expect(alerts[0]!.notificationSent).toBe(true);
	});

	it('raises target_reached and deactivates tracking when the target is hit', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 95 }));
		const row = await track({ currentPrice: writeMoney(180), targetPrice: writeMoney(100) });

		await run({ force: true });

		const alerts = await db()
			.select()
			.from(priceAlerts)
			.where(eq(priceAlerts.trackedProductId, row.id));

		expect(alerts[0]!.alertType).toBe('target_reached');

		const [updated] = await db()
			.select()
			.from(trackedProducts)
			.where(eq(trackedProducts.id, row.id));

		// Auto-deactivate on target, so the user is not alerted repeatedly.
		expect(updated!.isActive).toBe(false);
	});

	it('raises no alert when the price rises', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 220 }));
		const row = await track({ currentPrice: writeMoney(180) });

		const summary = await run({ force: true });

		expect(summary.alertsCreated).toBe(0);
		expect(
			await db().select().from(priceAlerts).where(eq(priceAlerts.trackedProductId, row.id)),
		).toHaveLength(0);
	});

	it('raises no alert when the price is unchanged', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 180 }));
		const row = await track({ currentPrice: writeMoney(180) });

		await run({ force: true });

		expect(
			await db().select().from(priceAlerts).where(eq(priceAlerts.trackedProductId, row.id)),
		).toHaveLength(0);
	});

	it('ignores a price drop when only watching stock', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 100 }));
		const row = await track({ currentPrice: writeMoney(180), watchType: 'stock' });

		await run({ force: true });

		expect(
			await db().select().from(priceAlerts).where(eq(priceAlerts.trackedProductId, row.id)),
		).toHaveLength(0);
	});

	it('raises back_in_stock when stock returns', async () => {
		stubProduct.mockResolvedValue(product({ in_stock: true, current_price: 180 }));
		const row = await track({
			currentPrice: writeMoney(180),
			inStock: false,
			watchType: 'stock',
		});

		await run({ force: true });

		const alerts = await db()
			.select()
			.from(priceAlerts)
			.where(eq(priceAlerts.trackedProductId, row.id));

		expect(alerts).toHaveLength(1);
		expect(alerts[0]!.alertType).toBe('back_in_stock');
	});

	it('raises no alert when stock runs out', async () => {
		stubProduct.mockResolvedValue(product({ in_stock: false, current_price: 180 }));
		const row = await track({ currentPrice: writeMoney(180), inStock: true, watchType: 'stock' });

		await run({ force: true });

		expect(
			await db().select().from(priceAlerts).where(eq(priceAlerts.trackedProductId, row.id)),
		).toHaveLength(0);
	});

	it('can alert on both price and stock when watchType is both', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 150, in_stock: true }));
		const row = await track({
			currentPrice: writeMoney(180),
			targetPrice: writeMoney(50),
			inStock: false,
			watchType: 'both',
		});

		const summary = await run({ force: true });

		expect(summary.alertsCreated).toBe(2);

		const types = (
			await db().select().from(priceAlerts).where(eq(priceAlerts.trackedProductId, row.id))
		).map((a) => a.alertType);

		expect(types.sort()).toEqual(['back_in_stock', 'price_drop']);
	});

	it('creates an in-app notification alongside the alert', async () => {
		stubProduct.mockResolvedValue(product({ current_price: 150 }));
		await track({ currentPrice: writeMoney(180) });

		await run({ force: true });

		const rows = await db().select().from(notifications).where(eq(notifications.userId, userId));

		expect(rows).toHaveLength(1);
		expect(rows[0]!.title).toBe('Price drop');
		expect(rows[0]!.message).toContain('dropped from');
	});
});

describe('filters', () => {
	it('honours the limit', async () => {
		stubProduct.mockResolvedValue(product());
		await track({ lastCheckedAt: null });
		await track({ lastCheckedAt: null });
		await track({ lastCheckedAt: null });

		expect((await run({ limit: 2 })).found).toBe(2);
	});

	it('honours a user filter', async () => {
		stubProduct.mockResolvedValue(product());
		await track({ lastCheckedAt: null });

		const other = await createLegacyUser();

		expect((await checkPrices({ limit: 10, userId: other.id })).found).toBe(0);
		expect((await checkPrices({ limit: 10, userId })).found).toBe(1);
	});
});
