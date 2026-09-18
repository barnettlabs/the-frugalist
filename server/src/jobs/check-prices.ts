import { formatMoney, isWithinTrackingWindow } from '@frugalist/contracts';
import { and, asc, eq, isNull, lte, or, sql } from 'drizzle-orm';

import { db } from '../db/client.js';
import { readMoney, writeMoney } from '../db/money.js';
import {
	notifications,
	priceAlerts,
	priceHistory,
	retailers,
	trackedProducts,
	userDevices,
	users,
} from '../db/schema.js';
import { logger } from '../lib/logger.js';
import { priceDropEmail } from '../services/notifications/price-drop-email.js';
import { sendMail } from '../services/notifications/mail.js';
import { sendPriceDropPush } from '../services/notifications/push.js';
import { createRetailerClient, UnsupportedRetailerError } from '../services/retailers/factory.js';
import type { PriceCheckJob } from './queues.js';

/**
 * Port of the prices:check Artisan command.
 *
 * Structural changes from the original, all deliberate:
 *
 *   - It no longer prints to a console. Progress goes to the structured log and
 *     the return value goes back to BullMQ, so a run is inspectable after the
 *     fact rather than only while watching a terminal.
 *   - A per-product failure is caught and counted rather than aborting the run,
 *     which the Laravel version also did. This is load-bearing: one retailer
 *     outage must not stop the other products from being checked.
 *   - Overlap prevention is explicit (see jobs/lock.ts) rather than a scheduler
 *     decorator.
 *
 * Behaviour that is preserved exactly, because it is user-visible:
 *   the alert-type rules, the auto-deactivate on target_reached, the 200ms
 *   inter-product delay for upstream rate limits, and the notification copy.
 */

/** Matches the original usleep(200000) between products. */
const RATE_LIMIT_DELAY_MS = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type PriceCheckSummary = {
	found: number;
	checked: number;
	alertsCreated: number;
	errors: number;
	durationMs: number;
};

type ProductRow = typeof trackedProducts.$inferSelect;
type RetailerRow = typeof retailers.$inferSelect;
type UserRow = typeof users.$inferSelect;

export async function checkPrices(job: PriceCheckJob): Promise<PriceCheckSummary> {
	const started = Date.now();
	const log = logger().child({ job: 'check-prices' });

	const candidates = await selectProducts(job);

	if (candidates.length === 0) {
		log.info('no products need price checking at this time');
		return { found: 0, checked: 0, alertsCreated: 0, errors: 0, durationMs: Date.now() - started };
	}

	log.info({ count: candidates.length }, 'starting price check');

	let checked = 0;
	let alertsCreated = 0;
	let errors = 0;

	for (const row of candidates) {
		try {
			const result = await checkOne(row.product, row.retailer, row.user);

			if (result.checked) {
				checked++;
				alertsCreated += result.alertsCreated;
			} else {
				errors++;
			}
		} catch (err) {
			errors++;
			log.error(
				{ productId: row.product.id, productName: row.product.productName, err },
				'error checking product price',
			);
		}

		await sleep(RATE_LIMIT_DELAY_MS);
	}

	const summary: PriceCheckSummary = {
		found: candidates.length,
		checked,
		alertsCreated,
		errors,
		durationMs: Date.now() - started,
	};

	log.info(summary, 'price check complete');

	return summary;
}

/**
 * The product selection query.
 *
 * Ports the filter chain from the command: active, tracking window open, plus
 * the optional retailer/user filters and the needs-check interval unless
 * --force was passed.
 */
async function selectProducts(job: PriceCheckJob) {
	const conditions = [
		eq(trackedProducts.isActive, true),
		isNull(trackedProducts.deletedAt),
		lte(trackedProducts.trackingStartDate, new Date()),
		or(
			isNull(trackedProducts.trackingEndDate),
			sql`${trackedProducts.trackingEndDate} >= now()`,
		),
	];

	if (job.userId !== undefined) {
		conditions.push(eq(trackedProducts.userId, job.userId));
	}

	if (!job.force) {
		// The Postgres form of the needs-check predicate. The interval is a
		// column, so it has to stay in SQL; see TrackedProduct::scopeNeedsCheck
		// for why MySQL and Postgres spell this differently.
		conditions.push(
			or(
				isNull(trackedProducts.lastCheckedAt),
				sql`${trackedProducts.lastCheckedAt} < now() - (${trackedProducts.checkInterval} * interval '1 minute')`,
			)!,
		);
	}

	if (job.retailerSlug !== undefined) {
		conditions.push(eq(retailers.slug, job.retailerSlug));
	}

	const rows = await db()
		.select({ product: trackedProducts, retailer: retailers, user: users })
		.from(trackedProducts)
		.innerJoin(retailers, eq(trackedProducts.retailerId, retailers.id))
		.innerJoin(users, eq(trackedProducts.userId, users.id))
		.where(and(...conditions))
		.orderBy(asc(trackedProducts.id))
		.limit(job.limit);

	return rows;
}

type CheckOutcome = { checked: boolean; alertsCreated: number };

async function checkOne(
	product: ProductRow,
	retailer: RetailerRow,
	user: UserRow,
): Promise<CheckOutcome> {
	const log = logger().child({ productId: product.id });

	let client;
	try {
		client = createRetailerClient({
			id: Number(retailer.id),
			name: retailer.name,
			slug: retailer.slug,
			apiBaseUrl: retailer.apiBaseUrl,
			apiKey: retailer.apiKey ?? null,
		});
	} catch (err) {
		if (err instanceof UnsupportedRetailerError) {
			// A retailer row exists with no client implementation. Not an error
			// worth failing the run over - the admin UI can add either side.
			log.warn({ retailer: retailer.slug }, 'no client for retailer; skipping');
			return { checked: false, alertsCreated: 0 };
		}
		throw err;
	}

	const data = await client.getProductDetails(product.skuUpc);

	if (!data) {
		log.warn({ skuUpc: product.skuUpc }, 'product not found at retailer');
		return { checked: false, alertsCreated: 0 };
	}

	const oldPrice = readMoney(product.currentPrice);
	const newPrice = data.current_price;
	const oldInStock = product.inStock ?? true;
	const newInStock = data.in_stock;
	const now = new Date();

	let alertsCreated = 0;

	await db()
		.update(trackedProducts)
		.set({
			currentPrice: writeMoney(newPrice),
			inStock: newInStock,
			lastCheckedAt: now,
			updatedAt: now,
		})
		.where(eq(trackedProducts.id, product.id));

	await db()
		.insert(priceHistory)
		.values({
			trackedProductId: product.id,
			price: writeMoney(newPrice),
			inStock: newInStock,
			apiResponse: { ...data, checked_via_command: true, command_run_at: now.toISOString() },
			checkedAt: now,
			createdAt: now,
			updatedAt: now,
		} as typeof priceHistory.$inferInsert);

	const methods = notificationMethods(product.notificationMethod);
	const watchesPrice = shouldCheckForPriceDrop(product.watchType);
	const watchesStock = shouldCheckForStock(product.watchType);

	if (watchesPrice && newPrice < oldPrice) {
		const targetPrice = readMoney(product.targetPrice);
		const alertType = targetPrice && newPrice <= targetPrice ? 'target_reached' : 'price_drop';

		await raiseAlert({ product, retailer, user, methods, alertType, oldPrice, newPrice, now });
		alertsCreated++;

		log.info(
			{ from: formatMoney(oldPrice), to: formatMoney(newPrice), alertType },
			'price drop detected',
		);

		if (alertType === 'target_reached') {
			await db()
				.update(trackedProducts)
				.set({ isActive: false, updatedAt: now })
				.where(eq(trackedProducts.id, product.id));

			log.info('target price reached; tracking auto-deactivated');
		}
	}

	if (watchesStock) {
		if (!oldInStock && newInStock) {
			await raiseAlert({
				product,
				retailer,
				user,
				methods,
				alertType: 'back_in_stock',
				oldPrice,
				newPrice,
				now,
			});
			alertsCreated++;
			log.info('back in stock');
		} else if (oldInStock && !newInStock) {
			// Logged only - the original raised no alert for going out of stock.
			log.info('went out of stock');
		}
	}

	return { checked: true, alertsCreated };
}

async function raiseAlert(input: {
	product: ProductRow;
	retailer: RetailerRow;
	user: UserRow;
	methods: string[];
	alertType: string;
	oldPrice: number;
	newPrice: number;
	now: Date;
}): Promise<void> {
	const { product, retailer, user, methods, alertType, oldPrice, newPrice, now } = input;

	const [alert] = await db()
		.insert(priceAlerts)
		.values({
			trackedProductId: product.id,
			oldPrice: writeMoney(oldPrice),
			newPrice: writeMoney(newPrice),
			alertType,
			triggeredAt: now,
			createdAt: now,
			updatedAt: now,
		} as typeof priceAlerts.$inferInsert)
		.returning();

	// Email, but only to a verified address - canReceiveEmailNotifications()
	// gated on hasVerifiedEmail().
	if (methods.includes('email') && user.emailVerifiedAt !== null) {
		/*
		 * retailerUrl is passed as null deliberately.
		 *
		 * The Blade template rendered a "View Product" button behind
		 * `@if($product->retailer_url)` - but there is no retailer_url column on
		 * tracked_products. Eloquent returns null for a missing attribute rather
		 * than erroring, so that button has never appeared in a sent email.
		 *
		 * The value does exist in product_metadata, which the retailer clients
		 * populate, so this is a genuine one-line improvement. It is left alone
		 * here because turning it on is a change to what users receive, not part
		 * of porting what they receive today. Tracked in MIGRATION.md.
		 */
		const metadata = (product.productMetadata ?? {}) as Record<string, unknown>;

		const mail = priceDropEmail({
			productName: product.productName,
			retailerName: retailer.name,
			alertType,
			oldPrice,
			newPrice,
			retailPrice: readMoney(product.retailPrice),
			targetPrice: readMoney(product.targetPrice),
			retailerUrl: null,
			availableRetailerUrl: typeof metadata.retailer_url === 'string' ? metadata.retailer_url : null,
		});

		await sendMail({ to: user.email, ...mail });
	}

	if (methods.includes('push')) {
		const tokens = await activePushTokens(Number(user.id));

		if (tokens.length > 0) {
			await sendPriceDropPush(
				tokens,
				product.productName,
				newPrice,
				oldPrice,
				alertType,
				Number(product.id),
			);
		}
	}

	/*
	 * SMS is intentionally absent.
	 *
	 * The Laravel command had the SMS branch commented out with "waiting for
	 * Twilio approval". It is left out rather than ported-and-disabled so the
	 * code does not imply a working path that has never run. The Twilio client
	 * itself is ported separately for phone verification, which does work.
	 */

	await createInAppNotification({ product, alertType, oldPrice, newPrice, now });

	if (alert) {
		await db()
			.update(priceAlerts)
			.set({ notificationSent: true, updatedAt: now })
			.where(eq(priceAlerts.id, alert.id));
	}
}

async function createInAppNotification(input: {
	product: ProductRow;
	alertType: string;
	oldPrice: number;
	newPrice: number;
	now: Date;
}): Promise<void> {
	const { product, alertType, oldPrice, newPrice, now } = input;

	// Copy preserved verbatim from createInAppNotification.
	const title =
		alertType === 'target_reached'
			? 'Target price reached'
			: alertType === 'price_drop'
				? 'Price drop'
				: alertType === 'back_in_stock'
					? 'Back in stock'
					: 'Price alert';

	const message =
		alertType === 'target_reached'
			? `${product.productName} hit your target at ${formatMoney(newPrice)}`
			: alertType === 'price_drop'
				? `${product.productName} dropped from ${formatMoney(oldPrice)} to ${formatMoney(newPrice)}`
				: alertType === 'back_in_stock'
					? `${product.productName} is back in stock at ${formatMoney(newPrice)}`
					: product.productName;

	await db()
		.insert(notifications)
		.values({
			userId: product.userId,
			title,
			message,
			createdAt: now,
			updatedAt: now,
		} as typeof notifications.$inferInsert);
}

async function activePushTokens(userId: number): Promise<string[]> {
	const rows = await db()
		.select({ token: userDevices.pushToken })
		.from(userDevices)
		.where(and(eq(userDevices.userId, userId), eq(userDevices.isActive, true)));

	return rows.map((r) => r.token).filter((t): t is string => Boolean(t));
}

/**
 * notification_method is a JSON column that has held two shapes over its life -
 * it was a string before the 2025_10_01 migration changed it to JSON - so this
 * tolerates both rather than assuming the current one.
 */
function notificationMethods(value: unknown): string[] {
	if (Array.isArray(value)) return value.map(String);
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed) ? parsed.map(String) : [value];
		} catch {
			return [value];
		}
	}
	return [];
}

function shouldCheckForPriceDrop(watchType: string | null): boolean {
	return watchType === 'price' || watchType === 'both';
}

function shouldCheckForStock(watchType: string | null): boolean {
	return watchType === 'stock' || watchType === 'both';
}

export { isWithinTrackingWindow };
