import { and, desc, eq, isNull } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { readMoney, writeMoney } from '../db/money.js';
import {
	priceAlerts,
	priceHistory,
	retailers,
	trackedProducts,
} from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { HttpError } from '../http/errors.js';
import { findOwned, parseId } from '../http/ownership.js';
import { laravelRules as r } from '../http/rules.js';
import { validate, validated } from '../http/validate.js';
import { createRetailerClient } from '../services/retailers/factory.js';
import type { RetailerProduct } from '../services/retailers/types.js';

/**
 * Price tracking ("watch").
 *
 * Ports App\Http\Controllers\PriceTrackerController - the largest controller in
 * the app. Cross-user access answers 403 here because the original called
 * abort(403).
 *
 * The relation loading is preserved precisely because the client renders it:
 * show/update return the retailer, the 50 most recent price-history rows, and
 * the 10 most recent alerts.
 *
 * One behavioural difference, deliberate. The original wrapped its whole store
 * and refresh bodies in `catch (\Exception $e)` and rethrew everything as a
 * validation error on `sku_upc` - so a database failure surfaced to the user as
 * "Error setting up product tracking: SQLSTATE[...]", leaking internals into a
 * form field. Genuine user errors keep their 422s here; unexpected failures are
 * left to the error handler, which logs them and returns a 500 without detail.
 */

const NOTIFICATION_METHODS = ['email', 'push'] as const;
const WATCH_TYPES = ['price', 'stock', 'both'] as const;

/**
 * Retailer columns safe to return to a signed-in user.
 *
 * api_key, api_base_url, api_config and rate_limit_per_hour were in the model's
 * $hidden and must not reach a non-admin caller. Drizzle has no $hidden, so the
 * safe set is named here rather than relying on select().
 */
const retailerPublicColumns = {
	id: retailers.id,
	name: retailers.name,
	slug: retailers.slug,
	logo_url: retailers.logoUrl,
	is_active: retailers.isActive,
	coming_soon: retailers.comingSoon,
	created_at: retailers.createdAt,
	updated_at: retailers.updatedAt,
};

const notificationMethodsField = z
	.array(z.enum(NOTIFICATION_METHODS, { message: 'The selected notification methods is invalid.' }), {
		message: 'The notification methods field is required.',
	})
	.min(1, 'The notification methods field must have at least 1 item.');

const storeSchema = z.object({
	retailer_id: z.union([z.number(), z.string()], {
		message: 'The retailer id field is required.',
	}),
	sku_upc: z
		.string({ message: 'The sku upc field is required.' })
		.min(1, 'The sku upc field is required.'),
	target_price: r.nullableNumeric('target price', { min: 0.01 }),
	notification_methods: notificationMethodsField,
	tracking_start_date: z.string({ message: 'The tracking start date field is required.' }),
	tracking_end_date: r.nullableDate('tracking end date'),
	watch_type: r.nullableEnum('watch type', WATCH_TYPES),
	check_interval: r.nullableInteger('check interval', { min: 1, max: 1440 }),
});

const updateSchema = z.object({
	target_price: r.nullableNumeric('target price', { min: 0.01 }),
	tracking_end_date: r.nullableDate('tracking end date'),
	is_active: z.boolean().optional(),
	watch_type: r.nullableEnum('watch type', WATCH_TYPES),
	check_interval: r.nullableInteger('check interval', { min: 1, max: 1440 }),
	notification_method: z.array(z.enum(NOTIFICATION_METHODS)).nullable().optional(),
});

const validateSchema = z.object({
	sku_upc: z
		.string({ message: 'The sku upc field is required.' })
		.min(1, 'The sku upc field is required.'),
	retailer_id: z.union([z.number(), z.string()], {
		message: 'The retailer id field is required.',
	}),
});

export const watchRoutes = new Hono<AppEnv>();

watchRoutes.use('*', requireAuth);

/** Loads a retailer, or 422s the way `exists:retailers,id` did. */
async function requireRetailer(retailerId: number) {
	const [retailer] = await db()
		.select()
		.from(retailers)
		.where(eq(retailers.id, retailerId))
		.limit(1);

	if (!retailer) {
		throw HttpError.field('retailer_id', 'The selected retailer id is invalid.');
	}

	return retailer;
}

/** The retailer + history + alerts payload the client renders. */
async function loadRelations(productId: number) {
	const [product] = await db()
		.select({ product: trackedProducts, retailer: retailerPublicColumns })
		.from(trackedProducts)
		.innerJoin(retailers, eq(trackedProducts.retailerId, retailers.id))
		.where(eq(trackedProducts.id, productId))
		.limit(1);

	if (!product) throw HttpError.notFound();

	const [history, alerts] = await Promise.all([
		db()
			.select()
			.from(priceHistory)
			.where(eq(priceHistory.trackedProductId, productId))
			.orderBy(desc(priceHistory.checkedAt), desc(priceHistory.id))
			.limit(50),
		db()
			.select()
			.from(priceAlerts)
			.where(eq(priceAlerts.trackedProductId, productId))
			.orderBy(desc(priceAlerts.triggeredAt))
			.limit(10),
	]);

	return {
		...serializeRow(product.product),
		retailer: serializeRow(product.retailer),
		price_history: serializeRows(history),
		price_alerts: serializeRows(alerts),
	};
}

watchRoutes.get('/', async (c) => {
	const user = currentUser(c);

	const rows = await db()
		.select({ product: trackedProducts, retailer: retailerPublicColumns })
		.from(trackedProducts)
		.innerJoin(retailers, eq(trackedProducts.retailerId, retailers.id))
		.where(and(eq(trackedProducts.userId, user.id), isNull(trackedProducts.deletedAt)))
		.orderBy(desc(trackedProducts.createdAt), desc(trackedProducts.id));

	// Same credential boundary as the public endpoint - this is a user-facing
	// route, so it must not carry api_key or api_base_url.
	const activeRetailers = await db()
		.select({
			id: retailers.id,
			name: retailers.name,
			slug: retailers.slug,
			logo_url: retailers.logoUrl,
			is_active: retailers.isActive,
			coming_soon: retailers.comingSoon,
			created_at: retailers.createdAt,
			updated_at: retailers.updatedAt,
		})
		.from(retailers)
		.where(eq(retailers.isActive, true));

	return c.json({
		tracked_products: rows.map((row) => ({
			...serializeRow(row.product),
			retailer: serializeRow(row.retailer),
		})),
		retailers: serializeRows(activeRetailers),
	});
});

watchRoutes.post('/validate-product', validate('json', validateSchema), async (c) => {
	const data = validated<z.infer<typeof validateSchema>>(c, 'json');
	const retailer = await requireRetailer(Number(data.retailer_id));

	const client = createRetailerClient({
		id: Number(retailer.id),
		name: retailer.name,
		slug: retailer.slug,
		apiBaseUrl: retailer.apiBaseUrl,
		apiKey: retailer.apiKey ?? null,
	});

	const product = await client.getProductDetails(data.sku_upc);

	if (!product) {
		return c.json({ valid: false, message: 'Product not found or invalid SKU/UPC' }, 404);
	}

	return c.json({ valid: true, product });
});

watchRoutes.post('/', validate('json', storeSchema), async (c) => {
	const user = currentUser(c);
	const data = validated<z.infer<typeof storeSchema>>(c, 'json');
	const retailerId = Number(data.retailer_id);

	const retailer = await requireRetailer(retailerId);
	const watchType = data.watch_type ?? 'price';

	// tracking_start_date carried `after_or_equal:today`.
	assertStartDateNotPast(data.tracking_start_date);

	const startDate = new Date(data.tracking_start_date);

	if (data.tracking_end_date && data.tracking_end_date <= startDate) {
		throw HttpError.field(
			'tracking_end_date',
			'The tracking end date field must be a date after tracking start date.',
		);
	}

	const [existing] = await db()
		.select({ id: trackedProducts.id })
		.from(trackedProducts)
		.where(
			and(
				eq(trackedProducts.userId, user.id),
				eq(trackedProducts.retailerId, retailerId),
				eq(trackedProducts.skuUpc, data.sku_upc),
				eq(trackedProducts.isActive, true),
				isNull(trackedProducts.deletedAt),
			),
		)
		.limit(1);

	if (existing) {
		throw HttpError.field('sku_upc', 'You are already tracking this product.');
	}

	const client = createRetailerClient({
		id: Number(retailer.id),
		name: retailer.name,
		slug: retailer.slug,
		apiBaseUrl: retailer.apiBaseUrl,
		apiKey: retailer.apiKey ?? null,
	});

	const product = await client.getProductDetails(data.sku_upc);

	if (!product) {
		throw HttpError.field('sku_upc', 'Product not found or invalid SKU/UPC');
	}

	const needsTargetPrice = watchType === 'price' || watchType === 'both';
	const targetPrice = data.target_price === null ? undefined : data.target_price;

	if (needsTargetPrice) {
		if (targetPrice === undefined) {
			throw HttpError.field(
				'target_price',
				'Target price is required when watching for price drops',
			);
		}

		if (targetPrice >= product.current_price) {
			throw HttpError.field(
				'target_price',
				`Target price must be lower than current price ($${product.current_price.toFixed(2)})`,
			);
		}
	}

	const now = new Date();

	const [created] = await db()
		.insert(trackedProducts)
		.values({
			// Ownership from the session only.
			userId: user.id,
			retailerId,
			skuUpc: data.sku_upc,
			productName: product.name,
			productVariant: product.variant,
			productDescription: product.description,
			productImageUrl: product.image_url,
			retailPrice: writeMoney(product.retail_price),
			currentPrice: writeMoney(product.current_price),
			targetPrice: needsTargetPrice ? writeMoney(targetPrice!) : null,
			watchType,
			checkInterval: data.check_interval ?? 60,
			inStock: product.in_stock,
			notificationMethod: data.notification_methods,
			trackingStartDate: startDate,
			trackingEndDate: data.tracking_end_date ?? null,
			productMetadata: product.metadata,
			lastCheckedAt: now,
			isActive: true,
			createdAt: now,
			updatedAt: now,
		} as typeof trackedProducts.$inferInsert)
		.returning();

	await insertHistory(Number(created!.id), product, now);

	return c.json(
		{
			message: 'Product tracking started successfully!',
			tracked_product: await loadRelations(Number(created!.id)),
		},
		201,
	);
});

watchRoutes.get('/:id', async (c) => {
	const row = await loadOwned(c as unknown as Context<AppEnv>);
	return c.json({ tracked_product: await loadRelations(row.id) });
});

watchRoutes.patch('/:id', validate('json', updateSchema), async (c) => {
	const row = await loadOwned(c as unknown as Context<AppEnv>);
	const data = validated<z.infer<typeof updateSchema>>(c, 'json');

	const watchType = data.watch_type ?? row.watchType ?? 'price';
	const needsTargetPrice = watchType === 'price' || watchType === 'both';

	if (needsTargetPrice && data.target_price !== undefined && data.target_price !== null) {
		const currentPrice = readMoney(row.currentPrice);

		if (data.target_price >= currentPrice) {
			throw HttpError.field(
				'target_price',
				`Target price must be lower than current price ($${currentPrice.toFixed(2)})`,
			);
		}
	}

	// Only the six keys the original's $request->only() allowed.
	const patch: Record<string, unknown> = { updatedAt: new Date() };

	if (data.target_price !== undefined) {
		patch.targetPrice = data.target_price === null ? null : writeMoney(data.target_price);
	}
	if (data.tracking_end_date !== undefined) patch.trackingEndDate = data.tracking_end_date;
	if (data.is_active !== undefined) patch.isActive = data.is_active;
	if (data.watch_type !== undefined && data.watch_type !== null) patch.watchType = data.watch_type;
	if (data.check_interval !== undefined && data.check_interval !== null) {
		patch.checkInterval = data.check_interval;
	}
	if (data.notification_method !== undefined) {
		patch.notificationMethod = data.notification_method;
	}

	await db().update(trackedProducts).set(patch).where(eq(trackedProducts.id, row.id));

	return c.json({
		message: 'Tracking settings updated successfully!',
		tracked_product: await loadRelations(row.id),
	});
});

watchRoutes.delete('/:id', async (c) => {
	const row = await loadOwned(c as unknown as Context<AppEnv>);

	// The model uses SoftDeletes, so this sets deleted_at rather than removing
	// the row - price history and alerts stay intact.
	await db()
		.update(trackedProducts)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(eq(trackedProducts.id, row.id));

	return c.json({ message: 'Product tracking stopped successfully!' });
});

watchRoutes.post('/:id/refresh', async (c) => {
	const row = await loadOwned(c as unknown as Context<AppEnv>);

	const [retailer] = await db()
		.select()
		.from(retailers)
		.where(eq(retailers.id, row.retailerId))
		.limit(1);

	if (!retailer) throw HttpError.notFound();

	const client = createRetailerClient({
		id: Number(retailer.id),
		name: retailer.name,
		slug: retailer.slug,
		apiBaseUrl: retailer.apiBaseUrl,
		apiKey: retailer.apiKey ?? null,
	});

	const product = await client.getProductDetails(row.skuUpc);
	const now = new Date();

	if (!product) {
		// The scraper error is persisted so the UI can explain a stale price.
		await db()
			.update(trackedProducts)
			.set({
				lastScraperError: 'Unable to fetch current product data',
				lastErrorAt: now,
				updatedAt: now,
			})
			.where(eq(trackedProducts.id, row.id));

		return c.json({ error: 'Unable to fetch current product data' }, 400);
	}

	const oldPrice = readMoney(row.currentPrice);
	const newPrice = product.current_price;
	const oldInStock = row.inStock ?? true;
	const newInStock = product.in_stock;

	await db()
		.update(trackedProducts)
		.set({
			currentPrice: writeMoney(newPrice),
			inStock: newInStock,
			productMetadata: product.metadata,
			lastCheckedAt: now,
			lastScraperError: null,
			lastErrorAt: null,
			updatedAt: now,
		})
		.where(eq(trackedProducts.id, row.id));

	await insertHistory(row.id, product, now);

	const watchesPrice = row.watchType === 'price' || row.watchType === 'both';
	const watchesStock = row.watchType === 'stock' || row.watchType === 'both';

	/*
	 * Note this raises the alert row but sends nothing.
	 *
	 * That is the original behaviour: a manual refresh records the alert and
	 * leaves notification_sent false, so the send-alerts job picks it up within
	 * fifteen minutes. The scheduled price check notifies inline instead. Both
	 * paths set notification_sent, so nobody is emailed twice.
	 */
	if (watchesPrice && newPrice < oldPrice) {
		const targetPrice = readMoney(row.targetPrice);
		const alertType = targetPrice && newPrice <= targetPrice ? 'target_reached' : 'price_drop';

		await insertAlert(row.id, oldPrice, newPrice, alertType, now);
	}

	if (watchesStock && !oldInStock && newInStock) {
		await insertAlert(row.id, oldPrice, newPrice, 'back_in_stock', now);
	}

	return c.json({
		message: 'Price updated successfully!',
		tracked_product: await loadRelations(row.id),
	});
});

async function loadOwned(c: Context<AppEnv>) {
	return findOwned(trackedProducts, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: trackedProducts.id,
		userIdColumn: trackedProducts.userId,
		deletedAtColumn: trackedProducts.deletedAt,
		onForeign: 'forbidden',
	});
}

async function insertHistory(productId: number, product: RetailerProduct, at: Date) {
	await db()
		.insert(priceHistory)
		.values({
			trackedProductId: productId,
			price: writeMoney(product.current_price),
			inStock: product.in_stock,
			apiResponse: product,
			checkedAt: at,
			createdAt: at,
			updatedAt: at,
		} as typeof priceHistory.$inferInsert);
}

async function insertAlert(
	productId: number,
	oldPrice: number,
	newPrice: number,
	alertType: string,
	at: Date,
) {
	await db()
		.insert(priceAlerts)
		.values({
			trackedProductId: productId,
			oldPrice: writeMoney(oldPrice),
			newPrice: writeMoney(newPrice),
			alertType,
			triggeredAt: at,
			createdAt: at,
			updatedAt: at,
		} as typeof priceAlerts.$inferInsert);
}

/** `after_or_equal:today`, compared by calendar day rather than instant. */
function assertStartDateNotPast(value: string): void {
	const parsed = new Date(value);

	if (Number.isNaN(parsed.getTime())) {
		throw HttpError.field('tracking_start_date', 'The tracking start date field must be a valid date.');
	}

	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);

	const day = new Date(parsed);
	day.setUTCHours(0, 0, 0, 0);

	if (day < today) {
		throw HttpError.field(
			'tracking_start_date',
			'The tracking start date field must be a date after or equal to today.',
		);
	}
}
