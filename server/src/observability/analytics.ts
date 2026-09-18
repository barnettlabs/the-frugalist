import { PostHog } from 'posthog-node';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * Product and LLM analytics.
 *
 * Two things are captured server-side, and deliberately only two:
 *
 *   - Meaningful domain events (a sheet created, a watch added, an alert sent).
 *     Page views and UI interaction belong in the browser SDK, not here.
 *   - LLM generations. The ai_invocations table already records model, tokens,
 *     latency and cache hits, so forwarding it gives per-agent cost tracking
 *     with no new schema - which is the cheapest observability win available
 *     given the AI surface is the growth area.
 *
 * No key means analytics is off, same as Sentry.
 */

let client: PostHog | null = null;
let attempted = false;

function posthog(): PostHog | null {
	if (attempted) return client;
	attempted = true;

	const config = env();
	if (!config.POSTHOG_KEY) return null;

	client = new PostHog(config.POSTHOG_KEY, {
		host: config.POSTHOG_HOST,
		// Batch rather than sending per event; a server does not need immediacy
		// and this keeps analytics off the request path.
		flushAt: 20,
		flushInterval: 10_000,
	});

	logger().info({ host: config.POSTHOG_HOST }, 'posthog initialised');

	return client;
}

export function trackEvent(
	event: string,
	options: { userId?: number | null; properties?: Record<string, unknown> } = {},
): void {
	const ph = posthog();
	if (!ph) return;

	try {
		ph.capture({
			// An anonymous actor still gets an event, attributed to a stable
			// placeholder rather than being dropped.
			distinctId: options.userId ? String(options.userId) : 'anonymous',
			event,
			properties: options.properties ?? {},
		});
	} catch (err) {
		logger().warn({ err, event }, 'failed to capture analytics event');
	}
}

/**
 * One LLM generation, in PostHog's LLM analytics shape.
 *
 * Called from the invocation pipeline after it writes ai_invocations, so the
 * two always agree. Cache hits are included - a cached response costs nothing
 * and that is exactly what makes the cache hit rate worth seeing.
 */
export function trackGeneration(input: {
	userId?: number | null;
	agentSlug: string;
	agentVersion: number;
	model: string | null;
	provider: string;
	promptTokens: number | null;
	completionTokens: number | null;
	latencyMs: number | null;
	cached: boolean;
	status: string;
	error?: string | null;
}): void {
	const ph = posthog();
	if (!ph) return;

	try {
		ph.capture({
			distinctId: input.userId ? String(input.userId) : 'anonymous',
			event: '$ai_generation',
			properties: {
				$ai_model: input.model,
				$ai_provider: input.provider,
				$ai_input_tokens: input.promptTokens ?? 0,
				$ai_output_tokens: input.completionTokens ?? 0,
				$ai_latency: input.latencyMs === null ? null : input.latencyMs / 1000,
				$ai_cache_read_input_tokens: input.cached ? (input.promptTokens ?? 0) : 0,
				$ai_is_error: input.status !== 'success',
				$ai_error: input.error ?? null,
				agent_slug: input.agentSlug,
				agent_version: input.agentVersion,
				cached: input.cached,
				status: input.status,
			},
		});
	} catch (err) {
		logger().warn({ err }, 'failed to capture generation event');
	}
}

export async function shutdownAnalytics(): Promise<void> {
	if (!client) return;

	try {
		// Batched events are still in memory at this point; without the shutdown
		// they are lost on every deploy.
		await client.shutdown();
	} catch {
		/* shutdown must not fail because telemetry did */
	}
}
