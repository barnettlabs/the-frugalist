import { sql as rawSql } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/client.js';
import type { AppEnv } from '../http/app.js';

export const healthRoutes = new Hono<AppEnv>();

/**
 * Liveness. Deliberately does not touch the database - a platform health check
 * that fails on a slow query causes the platform to restart a process that was
 * fine, turning a database blip into an outage.
 */
healthRoutes.get('/up', (c) => c.json({ status: 'ok' }));

/** Readiness. Checks the dependencies the process actually needs to serve. */
healthRoutes.get('/health', async (c) => {
	const checks: Record<string, 'ok' | 'error'> = {};

	try {
		await db().execute(rawSql`select 1`);
		checks.database = 'ok';
	} catch (err) {
		c.get('logger')?.error({ err }, 'health: database check failed');
		checks.database = 'error';
	}

	const healthy = Object.values(checks).every((v) => v === 'ok');

	return c.json({ status: healthy ? 'ok' : 'degraded', checks }, healthy ? 200 : 503);
});
