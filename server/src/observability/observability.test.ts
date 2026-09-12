import { describe, expect, it, vi } from 'vitest';

import { withHeartbeat } from './heartbeat.js';

/**
 * Heartbeat behaviour.
 *
 * The contract that matters is that monitoring can never affect the job it
 * monitors. A slow or broken heartbeat endpoint must not delay, fail, or
 * swallow the outcome of a price check.
 */

describe('withHeartbeat', () => {
	it('returns the work result unchanged', async () => {
		const result = await withHeartbeat('price-check', async () => ({ checked: 3 }));
		expect(result).toEqual({ checked: 3 });
	});

	it('propagates a thrown error rather than swallowing it', async () => {
		await expect(
			withHeartbeat('price-check', async () => {
				throw new Error('job failed');
			}),
		).rejects.toThrow('job failed');
	});

	it('is a no-op when no monitor URL is configured', async () => {
		// The test env sets no heartbeat URLs, so nothing should be attempted -
		// local development and tests must not need monitoring credentials.
		const spy = vi.spyOn(globalThis, 'fetch');

		await withHeartbeat('send-alerts', async () => 'done');

		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('still returns the result when the heartbeat endpoint fails', async () => {
		// Configured but unreachable: the job must be unaffected.
		const spy = vi
			.spyOn(globalThis, 'fetch')
			.mockRejectedValue(new Error('monitoring is down'));

		const { loadEnv, setEnvForTesting } = await import('../config/env.js');
		const original = (await import('../config/env.js')).env();

		setEnvForTesting(
			loadEnv({
				NODE_ENV: 'test',
				APP_ENV: 'test',
				DATABASE_URL: original.DATABASE_URL,
				REDIS_URL: original.REDIS_URL,
				SESSION_SECRET: 'test-secret-that-is-at-least-32-characters',
				LOG_LEVEL: 'silent',
				HEARTBEAT_PRICE_CHECK_URL: 'https://uptime.example.test/hb/price',
			} as never),
		);

		const result = await withHeartbeat('price-check', async () => 'work completed');

		expect(result).toBe('work completed');
		spy.mockRestore();
		setEnvForTesting(original);
	});
});
