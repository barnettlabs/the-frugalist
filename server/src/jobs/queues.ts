import { Queue } from 'bullmq';

import { redis } from './connection.js';

/**
 * Queue definitions and the repeatable jobs that replace the Laravel scheduler.
 *
 * routes/console.php had four entries:
 *
 *   prices:check                      hourly,           withoutOverlapping
 *   prices:check --limit=100          twice daily 9/21, withoutOverlapping
 *   notifications:send-price-alerts   every 15 min,     withoutOverlapping
 *   horizon:snapshot                  every 5 min
 *
 * These become BullMQ repeatable jobs rather than platform cron so that
 * scheduling, retries, overlap prevention and observability stay in one system.
 * horizon:snapshot has no equivalent - it fed Horizon's dashboard, and Bull
 * Board reads live queue state instead.
 */

export const QUEUE_NAMES = {
	priceChecks: 'price-checks',
	notifications: 'notifications',
} as const;

export type PriceCheckJob = {
	/** Maximum products to check in this run. Mirrors the --limit option. */
	limit: number;
	retailerSlug?: string;
	userId?: number;
	/** Ignore the per-product check interval. Mirrors --force. */
	force?: boolean;
};

export type SendAlertsJob = Record<string, never>;

let priceChecks: Queue<PriceCheckJob> | null = null;
let notifications: Queue<SendAlertsJob> | null = null;

/**
 * Retries with exponential backoff, since every failure mode here is a
 * transient upstream one - a retailer timing out, a provider 503.
 */
const defaultJobOptions = {
	attempts: 3,
	backoff: { type: 'exponential' as const, delay: 30_000 },
	removeOnComplete: { age: 7 * 24 * 60 * 60, count: 500 },
	// Failures are kept far longer than successes: they are the ones worth
	// looking at, and they are what a "why did alerts stop" investigation needs.
	removeOnFail: { age: 30 * 24 * 60 * 60 },
};

export function priceCheckQueue(): Queue<PriceCheckJob> {
	return (priceChecks ??= new Queue<PriceCheckJob>(QUEUE_NAMES.priceChecks, {
		connection: redis(),
		defaultJobOptions,
	}));
}

export function notificationQueue(): Queue<SendAlertsJob> {
	return (notifications ??= new Queue<SendAlertsJob>(QUEUE_NAMES.notifications, {
		connection: redis(),
		defaultJobOptions,
	}));
}

/**
 * Registers the repeatable schedule. Idempotent - upserting by key replaces any
 * existing definition rather than stacking duplicates, so it is safe to call on
 * every worker boot.
 *
 * Overlap prevention is NOT handled here. A job scheduler emits one job per
 * interval and generates its own ids, so it cannot express "skip this tick if
 * the last one is still running" - and prices:check can genuinely outrun its
 * hourly interval when many products are due. See withoutOverlapping() in
 * ./lock.ts, which the handlers wrap themselves around. This matters: a double
 * run means duplicate alerts to real users.
 */
export async function registerRepeatableJobs(): Promise<void> {
	const prices = priceCheckQueue();
	const alerts = notificationQueue();

	await prices.upsertJobScheduler(
		'hourly-price-check',
		{ pattern: '0 * * * *' },
		{ name: 'check-prices', data: { limit: 50 } },
	);

	await prices.upsertJobScheduler(
		'twice-daily-price-check',
		{ pattern: '0 9,21 * * *' },
		{ name: 'check-prices', data: { limit: 100 } },
	);

	await alerts.upsertJobScheduler(
		'send-price-alerts',
		{ pattern: '*/15 * * * *' },
		{ name: 'send-alerts', data: {} },
	);
}

export async function closeQueues(): Promise<void> {
	await Promise.all([priceChecks?.close(), notifications?.close()]);
	priceChecks = null;
	notifications = null;
}
