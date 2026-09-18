import { afterAll, describe, expect, it } from 'vitest';

import { closeRedis, redis } from './connection.js';
import { withoutOverlapping } from './lock.js';

/**
 * Overlap prevention, against a real Redis.
 *
 * This is the guarantee Laravel's withoutOverlapping() provided, and for
 * prices:check it is not cosmetic: the job calls retailer APIs and writes
 * price_alerts, so two concurrent runs send users duplicate alerts for one
 * price drop. Worth testing directly, and worth testing the slow-run case
 * specifically, since that is the only way it actually happens.
 */

const unique = (name: string) => `test-${name}-${Math.random().toString(36).slice(2, 10)}`;

afterAll(async () => {
	await closeRedis();
});

describe('withoutOverlapping', () => {
	it('runs the work and returns its value', async () => {
		const result = await withoutOverlapping(unique('runs'), 30, async () => 'done');

		expect(result).toEqual({ ran: true, value: 'done' });
	});

	it('releases the lock afterwards so the next run proceeds', async () => {
		const key = unique('release');

		await withoutOverlapping(key, 30, async () => 'first');
		const second = await withoutOverlapping(key, 30, async () => 'second');

		expect(second).toEqual({ ran: true, value: 'second' });
	});

	it('skips a concurrent run rather than queueing it', async () => {
		const key = unique('concurrent');
		let started = 0;

		// The slow-run case: the first call is still working when the second
		// arrives, which is exactly what an hourly job overrunning its hour does.
		const [first, second] = await Promise.all([
			withoutOverlapping(key, 30, async () => {
				started++;
				await new Promise((r) => setTimeout(r, 150));
				return 'first';
			}),
			new Promise((r) => setTimeout(r, 30)).then(() =>
				withoutOverlapping(key, 30, async () => {
					started++;
					return 'second';
				}),
			),
		]);

		expect(first).toEqual({ ran: true, value: 'first' });
		expect(second).toEqual({ ran: false, value: null });
		// The second body must not have executed at all - skipped, not deferred.
		expect(started).toBe(1);
	});

	it('releases the lock even when the work throws', async () => {
		const key = unique('throws');

		await expect(
			withoutOverlapping(key, 30, async () => {
				throw new Error('boom');
			}),
		).rejects.toThrow('boom');

		// A failed run must not wedge the schedule until the TTL expires.
		const after = await withoutOverlapping(key, 30, async () => 'recovered');
		expect(after).toEqual({ ran: true, value: 'recovered' });
	});

	it('does not delete a lock another run has since acquired', async () => {
		const key = unique('token');
		const lockKey = `lock:${key}`;
		const client = redis();

		// Simulate an overrun: the holder's TTL expires and a different run takes
		// the lock before the first one finishes. A naive DEL on release would
		// destroy the new holder's lock and allow a third concurrent run.
		await withoutOverlapping(key, 30, async () => {
			await client.set(lockKey, 'someone-elses-token', 'EX', 30);
		});

		expect(await client.get(lockKey)).toBe('someone-elses-token');

		await client.del(lockKey);
	});

	it('expires the lock so a crashed holder cannot block forever', async () => {
		const key = unique('ttl');
		const client = redis();

		await withoutOverlapping(key, 30, async () => {
			const ttl = await client.ttl(`lock:${key}`);
			expect(ttl).toBeGreaterThan(0);
			expect(ttl).toBeLessThanOrEqual(30);
		});
	});
});
