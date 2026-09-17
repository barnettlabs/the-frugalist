// Initialised before anything else - see the note in server.ts.
import { initSentry } from './observability/sentry.js';

initSentry();

import { Worker } from 'bullmq';

import { env } from './config/env.js';
import { closeDb } from './db/client.js';
import { checkPrices } from './jobs/check-prices.js';
import { assertNoEviction, closeRedis, redisConnection } from './jobs/connection.js';
import { withoutOverlapping } from './jobs/lock.js';
import { closeQueues, QUEUE_NAMES, type PriceCheckJob, registerRepeatableJobs } from './jobs/queues.js';
import { sendPendingAlerts } from './jobs/send-alerts.js';
import { logger } from './lib/logger.js';
import { withHeartbeat } from './observability/heartbeat.js';
import { shutdownAnalytics } from './observability/analytics.js';
import { captureJobError, flushSentry } from './observability/sentry.js';

/**
 * The background worker. Replaces Horizon and the Laravel scheduler.
 *
 * Runs as a separate process from the API - the same container image with a
 * different start command - so a long price-check run cannot compete with
 * request handling for the event loop.
 *
 * concurrency is 1 on the price-check queue. Combined with the Redis lock in
 * each handler, that gives the same guarantee Laravel's withoutOverlapping()
 * did: the lock covers multiple worker instances and rolling deploys, the
 * concurrency setting covers the common single-instance case cheaply.
 */

// Calling env() here (rather than lazily, later) makes a misconfigured worker
// fail at boot with a message naming the bad key, instead of throwing inside
// the first job it picks up.
env();

const log = logger();

await assertNoEviction(log);
await registerRepeatableJobs();

log.info('worker starting');

const priceCheckWorker = new Worker<PriceCheckJob>(
	QUEUE_NAMES.priceChecks,
	async (job) =>
		withHeartbeat('price-check', async () => {
			// A run that outlives its TTL is worse than a skipped tick, so the lock
			// is held for two hours - comfortably longer than any real run, short
			// enough that a hard crash does not wedge the schedule for a day.
			const result = await withoutOverlapping('price-check', 2 * 60 * 60, () =>
				checkPrices({ ...job.data, limit: job.data.limit ?? 50 }),
			);

			// A skipped run still pings success: the schedule is working, a previous
			// run is simply still going. Reporting it as a failure would page
			// someone for a long job doing its job.
			if (!result.ran) {
				return { skipped: true, reason: 'previous run still in progress' };
			}

			return result.value;
		}),
	{ connection: redisConnection(), concurrency: 1 },
);

const notificationWorker = new Worker(
	QUEUE_NAMES.notifications,
	async () =>
		withHeartbeat('send-alerts', async () => {
			const result = await withoutOverlapping('send-alerts', 15 * 60, () => sendPendingAlerts());

			if (!result.ran) {
				return { skipped: true, reason: 'previous run still in progress' };
			}

			return result.value;
		}),
	{ connection: redisConnection(), concurrency: 1 },
);

for (const worker of [priceCheckWorker, notificationWorker]) {
	worker.on('completed', (job, result) => {
		log.info({ queue: worker.name, jobId: job.id, result }, 'job completed');
	});

	worker.on('failed', (job, err) => {
		log.error(
			{ queue: worker.name, jobId: job?.id, attempts: job?.attemptsMade, err },
			'job failed',
		);

		captureJobError(err, { queue: worker.name, jobId: job?.id, jobName: job?.name });
	});

	worker.on('error', (err) => {
		log.error({ queue: worker.name, err }, 'worker error');
		captureJobError(err, { queue: worker.name });
	});
}

log.info(
	{ queues: [QUEUE_NAMES.priceChecks, QUEUE_NAMES.notifications] },
	'worker listening',
);

/**
 * Drain before exiting. `close()` waits for the in-flight job to finish rather
 * than killing it mid-run, which matters here: a price check interrupted
 * between writing price_history and raising the alert would leave the row
 * looking checked with no notification sent.
 */
async function shutdown(signal: string) {
	log.info({ signal }, 'worker shutting down');

	setTimeout(() => {
		log.error('forced exit after shutdown timeout');
		process.exit(1);
	}, 30_000).unref();

	await Promise.all([priceCheckWorker.close(), notificationWorker.close()]);
	await Promise.all([flushSentry(), shutdownAnalytics()]);
	await closeQueues();
	await closeRedis();
	await closeDb();

	process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
