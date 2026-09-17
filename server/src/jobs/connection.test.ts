import { Redis } from 'ioredis';
import { afterAll, describe, expect, it, vi } from 'vitest';

import { env } from '../config/env.js';
import { assertNoEviction, closeRedis } from './connection.js';

/**
 * The eviction guard, including the case that took production down.
 *
 * Render's Key Value denies `CONFIG GET` to the default user. The guard used to
 * let that rejection propagate, so the worker crashed on boot and restarted in
 * a loop - while the policy it could not read was already noeviction. Failing
 * to *read* the policy and reading a *bad* policy are different outcomes and
 * the difference is the whole point of this file.
 */

const restricted: Redis[] = [];

afterAll(async () => {
	await Promise.all(restricted.map((client) => client.quit()));
	await closeRedis();
});

/**
 * A connection whose ACL user is denied the given commands, which is how a
 * managed provider's restrictions actually present.
 */
async function connectWithout(commands: string[]): Promise<Redis> {
	const admin = new Redis(env().REDIS_URL, { maxRetriesPerRequest: null });
	const user = `test-noperm-${Math.random().toString(36).slice(2, 10)}`;

	await admin.acl(
		'SETUSER',
		user,
		'on',
		'>secret',
		'~*',
		'&*',
		'+@all',
		...commands.map((command) => `-${command}`),
	);
	await admin.quit();

	const url = new URL(env().REDIS_URL);
	url.username = user;
	url.password = 'secret';

	const client = new Redis(url.toString(), {
		maxRetriesPerRequest: null,
		// The ready check itself uses INFO, which one of these users cannot run.
		enableReadyCheck: false,
	});

	restricted.push(client);
	return client;
}

describe('assertNoEviction', () => {
	it('passes when the policy is noeviction', async () => {
		await expect(assertNoEviction()).resolves.toBeUndefined();
	});

	it('warns rather than throwing when CONFIG GET is denied', async () => {
		const client = await connectWithout(['config']);

		await expect(client.config('GET', 'maxmemory-policy')).rejects.toThrow(/NOPERM/);

		// INFO still answers, so the policy is readable by the other route and
		// the guard has nothing to warn about.
		const info = await client.info('memory');
		expect(info).toContain('maxmemory_policy:noeviction');
	});

	it('does not throw when the policy cannot be read at all', async () => {
		const warn = vi.fn();

		// Both routes denied. The guard cannot confirm anything, and an
		// unconfirmable policy must not stop the worker from starting.
		const client = await connectWithout(['config', 'info']);
		await expect(client.info('memory')).rejects.toThrow(/NOPERM/);

		await expect(assertNoEviction({ warn }, client)).resolves.toBeUndefined();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('could not read maxmemory-policy'));
	});
});
