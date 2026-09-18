import { and, asc, eq } from 'drizzle-orm';

import { db } from '../db/client.js';
import { readMoney } from '../db/money.js';
import { priceAlerts, retailers, trackedProducts, users } from '../db/schema.js';
import { logger } from '../lib/logger.js';
import { sendMail } from '../services/notifications/mail.js';
import { priceDropEmail } from '../services/notifications/price-drop-email.js';

/**
 * Port of the notifications:send-price-alerts Artisan command.
 *
 * This is the catch-up path, not the primary one. prices:check already notifies
 * inline when it raises an alert and sets notification_sent, so this job exists
 * to pick up alerts whose notification failed - a provider outage, a crash
 * mid-run - and it runs every 15 minutes.
 *
 * That relationship matters for correctness: both writers set
 * notification_sent, and this job only ever selects rows where it is false, so
 * a user cannot be emailed twice for the same alert.
 */

/** Matches the original usleep(100000) between sends. */
const SEND_DELAY_MS = 100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type SendAlertsOptions = {
	limit?: number;
	dryRun?: boolean;
};

export type SendAlertsSummary = {
	found: number;
	sent: number;
	errors: number;
	dryRun: boolean;
	durationMs: number;
};

export async function sendPendingAlerts(
	options: SendAlertsOptions = {},
): Promise<SendAlertsSummary> {
	const started = Date.now();
	const limit = options.limit ?? 100;
	const dryRun = options.dryRun ?? false;
	const log = logger().child({ job: 'send-alerts' });

	const pending = await db()
		.select({
			alert: priceAlerts,
			product: trackedProducts,
			retailer: retailers,
			user: users,
		})
		.from(priceAlerts)
		.innerJoin(trackedProducts, eq(priceAlerts.trackedProductId, trackedProducts.id))
		.innerJoin(retailers, eq(trackedProducts.retailerId, retailers.id))
		.innerJoin(users, eq(trackedProducts.userId, users.id))
		.where(eq(priceAlerts.notificationSent, false))
		.orderBy(asc(priceAlerts.triggeredAt))
		.limit(limit);

	if (pending.length === 0) {
		log.info('no pending price alerts to send');
		return { found: 0, sent: 0, errors: 0, dryRun, durationMs: Date.now() - started };
	}

	log.info({ count: pending.length, dryRun }, 'sending pending price alerts');

	let sent = 0;
	let errors = 0;

	for (const row of pending) {
		try {
			if (dryRun) {
				log.info(
					{
						alertId: row.alert.id,
						alertType: row.alert.alertType,
						to: row.user.email,
						product: row.product.productName,
					},
					'would send notification',
				);
				sent++;
				continue;
			}

			// Only a verified address, matching canReceiveEmailNotifications().
			if (row.user.emailVerifiedAt === null) {
				log.warn({ alertId: row.alert.id }, 'skipping - email not verified');
				// Marked sent regardless, otherwise an unverifiable user's alerts
				// accumulate forever and are retried every fifteen minutes.
				await markSent(row.alert.id);
				continue;
			}

			const mail = priceDropEmail({
				productName: row.product.productName,
				retailerName: row.retailer.name,
				alertType: row.alert.alertType,
				oldPrice: readMoney(row.alert.oldPrice),
				newPrice: readMoney(row.alert.newPrice),
				retailPrice: readMoney(row.product.retailPrice),
				targetPrice: readMoney(row.product.targetPrice),
				retailerUrl: null,
			});

			const result = await sendMail({ to: row.user.email, ...mail });

			if (!result.sent) {
				errors++;
				log.error({ alertId: row.alert.id, error: result.error }, 'failed to send alert email');
				// Deliberately not marked sent, so the next run retries it. That is
				// the entire purpose of this job.
				continue;
			}

			await markSent(row.alert.id);
			sent++;

			log.info(
				{ alertId: row.alert.id, alertType: row.alert.alertType, to: row.user.email },
				'sent alert notification',
			);
		} catch (err) {
			errors++;
			log.error({ alertId: row.alert.id, err }, 'error sending alert notification');
		}

		if (!dryRun) await sleep(SEND_DELAY_MS);
	}

	const summary: SendAlertsSummary = {
		found: pending.length,
		sent,
		errors,
		dryRun,
		durationMs: Date.now() - started,
	};

	log.info(summary, 'alert notification run complete');

	return summary;
}

async function markSent(alertId: number): Promise<void> {
	await db()
		.update(priceAlerts)
		.set({ notificationSent: true, updatedAt: new Date() })
		.where(and(eq(priceAlerts.id, alertId)));
}
