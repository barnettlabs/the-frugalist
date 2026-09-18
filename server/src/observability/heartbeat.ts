import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * Cron heartbeats.
 *
 * The most valuable monitor this app can have, because the failure it catches
 * is the one nothing else would: the scheduler silently stopping. A dead worker
 * produces no errors for Sentry to report and no traffic for uptime checks to
 * miss - price alerts simply stop arriving, and nobody finds out until a user
 * mentions it.
 *
 * The contract is the standard one BetterStack, Cronitor and Healthchecks.io all
 * implement: ping a URL on success, and the monitor alerts when a ping does not
 * arrive within the expected window. `/start` and `/fail` suffixes give run
 * duration and explicit failure, which BetterStack and Healthchecks both accept.
 *
 * Configured per job so each schedule has its own monitor - a working
 * price check and a broken notification run must not look the same.
 */

export type HeartbeatJob = 'price-check' | 'send-alerts';

function urlFor(job: HeartbeatJob): string | null {
	const config = env();

	switch (job) {
		case 'price-check':
			return config.HEARTBEAT_PRICE_CHECK_URL ?? null;
		case 'send-alerts':
			return config.HEARTBEAT_SEND_ALERTS_URL ?? null;
		default:
			return null;
	}
}

async function ping(job: HeartbeatJob, suffix: '' | '/start' | '/fail'): Promise<void> {
	const base = urlFor(job);
	if (!base) return;

	try {
		await fetch(`${base}${suffix}`, {
			method: 'POST',
			// Short timeout: a monitoring endpoint being slow must never delay or
			// fail the job it is monitoring.
			signal: AbortSignal.timeout(5_000),
		});
	} catch (err) {
		logger().warn({ job, suffix, err }, 'heartbeat ping failed');
	}
}

/**
 * Wraps a job so its outcome is reported.
 *
 * A skipped run - one that found the overlap lock already held - pings success
 * rather than failure. The schedule is working correctly in that case; treating
 * it as a failure would page someone for a long-running job doing its job.
 */
export async function withHeartbeat<T>(job: HeartbeatJob, work: () => Promise<T>): Promise<T> {
	await ping(job, '/start');

	try {
		const result = await work();
		await ping(job, '');
		return result;
	} catch (err) {
		await ping(job, '/fail');
		throw err;
	}
}
