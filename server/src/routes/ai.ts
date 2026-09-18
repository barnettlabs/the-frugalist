import { and, eq, gte, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { aiInvocations } from '../db/schema.js';
import type { AppEnv } from '../http/app.js';
import { requireAuth } from '../http/auth-middleware.js';
import { resolveAgentBySlug, runAgent } from '../services/ai/pipeline.js';

/**
 * User-facing agent invocation.
 *
 * Ports App\Http\Controllers\AiAgentController. The status codes are part of
 * the contract the clients branch on, and they are unusual enough to be worth
 * stating: a disabled agent is 503 (temporarily unavailable), any other
 * pipeline failure is 502 (the upstream provider failed), an oversized request
 * is 413, and exceeding the per-agent daily limit is 429.
 */

export const aiRoutes = new Hono<AppEnv>();

aiRoutes.use('*', requireAuth);

const runSchema = z.object({
	context: z.record(z.string(), z.unknown()),
	context_key: z.union([z.string().max(128), z.null()]).optional(),
	use_cache: z.union([z.boolean(), z.null()]).optional(),
});

/** 32KB, as the original's strlen(json_encode($data)) check. */
const MAX_REQUEST_BYTES = 32 * 1024;

aiRoutes.post('/agents/:slug/run', async (c) => {
	let body: unknown;

	try {
		body = await c.req.json();
	} catch {
		body = {};
	}

	const parsed = runSchema.safeParse(body);

	if (!parsed.success) {
		// This endpoint reports a bare `error` rather than the 422 envelope - the
		// original validated then returned its own codes, and the deal-grade card
		// in both clients switches on `error`.
		return c.json({ error: 'invalid_request' }, 422);
	}

	if (Buffer.byteLength(JSON.stringify(parsed.data), 'utf8') > MAX_REQUEST_BYTES) {
		return c.json({ error: 'request_too_large' }, 413);
	}

	const agent = await resolveAgentBySlug(c.req.param('slug'));

	if (!agent) {
		return c.json({ error: 'agent_not_found' }, 404);
	}

	const user = c.get('user')!;

	if (await isOverDailyLimit(user.id, agent.id, agent.rateLimitPerUserDay ?? 0)) {
		return c.json({ error: 'rate_limit_exceeded' }, 429);
	}

	const result = await runAgent({
		agent,
		context: parsed.data.context,
		userId: user.id,
		contextKey: parsed.data.context_key ?? null,
		useCache: parsed.data.use_cache ?? true,
	});

	if (!result.ok) {
		// A disabled agent is a configuration state, not an upstream failure.
		return c.json(
			{ error: result.code, message: result.message },
			result.code === 'agent_disabled' ? 503 : 502,
		);
	}

	return c.json({
		agent: { slug: agent.slug, version: agent.version },
		response: result.data,
		cached: result.cached,
	});
});

/**
 * Per-user, per-agent daily cap.
 *
 * Counts from the start of the current UTC day, matching now()->startOfDay()
 * under the app's UTC timezone. A limit of 0 or less means unlimited, which is
 * the default for agents that have never had one set.
 */
async function isOverDailyLimit(userId: number, agentId: number, limit: number): Promise<boolean> {
	if (limit <= 0) return false;

	const startOfDay = new Date();
	startOfDay.setUTCHours(0, 0, 0, 0);

	const [row] = await db()
		.select({ count: sql<number>`count(*)::int` })
		.from(aiInvocations)
		.where(
			and(
				eq(aiInvocations.userId, userId),
				eq(aiInvocations.agentId, agentId),
				gte(aiInvocations.createdAt, startOfDay),
			),
		);

	return Number(row?.count ?? 0) >= limit;
}
