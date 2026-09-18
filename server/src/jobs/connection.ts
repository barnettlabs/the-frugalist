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
 * Reads the eviction policy, or returns null if the server will not say.
 *
 * Two ways to ask, because managed providers disagree about which is allowed.
 * INFO is tried first: it is what BullMQ itself uses, and it is generally
 * permitted where the administrative CONFIG command is not. Render's Key Value
 * rejects `CONFIG GET` for the default user outright - `NOPERM ... 'config|get'`
 * - so a CONFIG-only check cannot run there at all.
 */
export async function readEvictionPolicy(client: Redis): Promise<string | null> {
	try {
		const info = await client.info('memory');
		const match = /^maxmemory_policy:(.+)$/m.exec(info);

		if (match?.[1]) return match[1].trim();
	} catch {
		// Fall through to CONFIG.
	}

	try {
		const result = (await client.config('GET', 'maxmemory-policy')) as string[];

		return result[1] ?? null;
	} catch {
		return null;
	}
}

/**
 * Fails fast if Redis would evict keys.
 *
 * A queue that silently drops jobs is much worse than one that refuses to
 * start, and this is a single config value that is easy to get wrong on a new
 * Redis instance.
 *
 * Being *unable to read* the policy is not the same as reading a bad one, and
 * must not be fatal. This previously threw whatever error the read produced,
 * which crash-looped the worker on Render: its Key Value instance denies
 * `CONFIG GET` to the default user, so every boot died on the permission error
 * - while the policy it was trying to verify was already noeviction, set by
 * render.yaml. The check now reports what it could not confirm and carries on.
 */
export async function assertNoEviction(
	log?: { warn: (msg: string) => void },
	client: Redis = redis(),
): Promise<void> {
	const policy = await readEvictionPolicy(client);

	if (policy === null) {
		log?.warn(
			'could not read maxmemory-policy - the provider does not permit it. ' +
				'Ensure the instance is configured noeviction: BullMQ loses jobs ' +
				'silently if Redis evicts keys.',
		);
		return;
	}

	if (policy !== 'noeviction') {
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
