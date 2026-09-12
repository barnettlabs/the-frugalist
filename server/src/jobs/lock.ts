import { randomUUID } from 'node:crypto';

import { logger } from '../lib/logger.js';
import { redis } from './connection.js';

/**
 * Laravel's `withoutOverlapping()`, ported.
 *
 * All three scheduled commands relied on it, and for prices:check it is not a
 * nicety: the job calls external retailer APIs and writes price_alerts, so two
 * concurrent runs send users duplicate alerts for the same price drop. The
 * hourly schedule can genuinely be outrun when many products are due at once.
 *
 * Implemented as a Redis lock rather than by worker concurrency alone, because
 * concurrency only serialises within a single process - two worker instances,
 * or a rolling deploy where old and new overlap, would both run.
 *
 * The lock is released by the holder only. Each acquisition stores a unique
 * token and the release compares it, so a run that overshoots its TTL cannot
 * delete the lock a *different* run has since taken - the classic way a naive
 * DEL turns a lock into no lock at all.
 */

const RELEASE_IF_MINE = `
	if redis.call("get", KEYS[1]) == ARGV[1] then
		return redis.call("del", KEYS[1])
	else
		return 0
	end
`;

export type LockResult<T> = { ran: true; value: T } | { ran: false; value: null };

export async function withoutOverlapping<T>(
	key: string,
	ttlSeconds: number,
	work: () => Promise<T>,
): Promise<LockResult<T>> {
	const client = redis();
	const lockKey = `lock:${key}`;
	const token = randomUUID();

	// NX so only the first caller wins; EX so a crashed holder cannot wedge the
	// schedule permanently.
	const acquired = await client.set(lockKey, token, 'EX', ttlSeconds, 'NX');

	if (acquired !== 'OK') {
		logger().warn({ key }, 'skipping run - previous run still holds the lock');
		return { ran: false, value: null };
	}

	try {
		return { ran: true, value: await work() };
	} finally {
		try {
			await client.eval(RELEASE_IF_MINE, 1, lockKey, token);
		} catch (err) {
			// Losing the release is survivable - the TTL will clear it - so it must
			// not mask the error from the work itself.
			logger().error({ key, err }, 'failed to release lock; TTL will expire it');
		}
	}
}
