import { Redis } from 'ioredis';

import { env } from '../config/env.js';

/**
 * Redis connection for BullMQ.
 *
 * Two settings are not optional here:
 *
 *   maxRetriesPerRequest: null
 *     BullMQ's Worker and QueueEvents hold blocking connections (BZPOPMIN), and
 *     ioredis's default retry limit aborts a blocking command that is doing
 *     exactly what it is supposed to do. BullMQ refuses to start without this.
 *
 *   noeviction
 *     Not set here, but asserted at startup. BullMQ cannot behave correctly if
 *     Redis evicts keys - it loses jobs silently rather than erroring - so the
 *     policy is verified rather than assumed. compose.yaml and render.yaml both
 *     configure it.
 */

let connection: Redis | null = null;

export function redis(): Redis {
	if (connection) return connection;

	connection = new Redis(env().REDIS_URL, {
		maxRetriesPerRequest: null,
		enableReadyCheck: true,
	});

	return connection;
}

/** A dedicated connection - Workers must not share with the Queue client. */
export function redisConnection(): Redis {
	return new Redis(env().REDIS_URL, {
		maxRetriesPerRequest: null,
		enableReadyCheck: true,
	});
}

/**
 * Fails fast if Redis would evict keys.
 *
 * A queue that silently drops jobs is much worse than one that refuses to
 * start, and this is a single config value that is easy to get wrong on a new
 * Redis instance.
 */
export async function assertNoEviction(): Promise<void> {
	const client = redis();
	const result = (await client.config('GET', 'maxmemory-policy')) as string[];
	const policy = result[1];

	if (policy && policy !== 'noeviction') {
		throw new Error(
			`Redis maxmemory-policy is "${policy}" but BullMQ requires "noeviction" - ` +
				'an evicted key loses jobs without an error. Set it on the instance ' +
				'(render.yaml sets maxmemoryPolicy, compose.yaml passes --maxmemory-policy).',
		);
	}
}

export async function closeRedis(): Promise<void> {
	if (connection) {
		await connection.quit();
		connection = null;
	}
}
