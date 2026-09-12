import { createHash } from 'node:crypto';

import { and, desc, eq, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import {
	aiAgentRoutes,
	aiAgents,
	aiInvocationCache,
	aiInvocations,
	aiProviders,
} from '../../db/schema.js';
import { trackGeneration } from '../../observability/analytics.js';
import { chat, type ProviderConfig } from './client.js';
import { renderPrompt } from './prompt.js';
import { validateAgainstSchema, type JsonSchema } from './schema-validator.js';

/**
 * Agent invocation pipeline.
 *
 * Ports App\Services\Ai\InvocationPipeline. The shape is preserved because
 * three things depend on it: the ai_invocations log the admin UI reads, the
 * ai_invocation_cache keyed on a deterministic hash, and the error codes the
 * clients branch on.
 *
 * The one-retry-on-invalid-JSON behaviour is kept. It is a real cost saver -
 * models frequently return a valid object wrapped in prose or fences, and the
 * retry with a stricter instruction usually succeeds - and removing it would
 * increase the user-visible failure rate.
 */

export type AgentRecord = typeof aiAgents.$inferSelect;

export type InvocationOk = {
	ok: true;
	data: Record<string, unknown>;
	cached: boolean;
	cacheKey: string;
	messages: { role: string; content: string }[];
	requestPayload?: Record<string, unknown>;
	rawBody?: string | null;
};

export type InvocationError = {
	ok: false;
	code: 'agent_disabled' | 'provider_unavailable' | 'provider_error' | 'invalid_json';
	message: string;
	messages?: { role: string; content: string }[];
	requestPayload?: Record<string, unknown>;
	rawBody?: string | null;
};

export type InvocationResult = InvocationOk | InvocationError;

export async function resolveAgentBySlug(slug: string): Promise<AgentRecord | null> {
	const [row] = await db().select().from(aiAgents).where(eq(aiAgents.slug, slug)).limit(1);
	return row ?? null;
}

/** Highest-priority enabled route for a context key. */
export async function resolveAgentByContextKey(contextKey: string): Promise<AgentRecord | null> {
	const [row] = await db()
		.select({ agent: aiAgents })
		.from(aiAgentRoutes)
		.innerJoin(aiAgents, eq(aiAgentRoutes.agentId, aiAgents.id))
		.where(and(eq(aiAgentRoutes.contextKey, contextKey), eq(aiAgentRoutes.enabled, true)))
		.orderBy(desc(aiAgentRoutes.priority))
		.limit(1);

	return row?.agent ?? null;
}

export async function runAgent(options: {
	agent: AgentRecord;
	context: Record<string, unknown>;
	userId?: number | null;
	contextKey?: string | null;
	useCache?: boolean;
}): Promise<InvocationResult> {
	const { agent, context } = options;
	const useCache = options.useCache ?? true;
	const userId = options.userId ?? null;
	const contextKey = options.contextKey ?? null;

	if (!agent.enabled) {
		return { ok: false, code: 'agent_disabled', message: 'Agent is disabled.' };
	}

	// provider_id is nullable - the foreign key is ON DELETE SET NULL, so
	// deleting a provider leaves its agents pointing at nothing. That is the same
	// "no enabled provider" case as a disabled one.
	const [providerRow] = agent.providerId
		? await db().select().from(aiProviders).where(eq(aiProviders.id, agent.providerId)).limit(1)
		: [];

	if (!providerRow || !providerRow.enabled) {
		return {
			ok: false,
			code: 'provider_unavailable',
			message: 'No enabled provider configured for this agent.',
		};
	}

	const provider: ProviderConfig = {
		id: Number(providerRow.id),
		name: providerRow.name,
		baseUrl: providerRow.baseUrl,
		apiKey: providerRow.apiKey ?? null,
		defaultModel: providerRow.defaultModel ?? null,
	};

	const model = agent.model ?? provider.defaultModel;
	const requestHash = hashInput(context);

	const cacheKey = sha256(
		[agent.id, agent.version, provider.id, model ?? '', requestHash].join('|'),
	);

	const messages = buildMessages(agent, context);

	if (useCache) {
		const [hit] = await db()
			.select()
			.from(aiInvocationCache)
			.where(eq(aiInvocationCache.cacheKey, cacheKey))
			.limit(1);

		if (hit) {
			await db()
				.update(aiInvocationCache)
				// No updated_at on this table - it tracks last_hit_at instead.
				.set({
					hitCount: sql`${aiInvocationCache.hitCount} + 1`,
					lastHitAt: new Date(),
				})
				.where(eq(aiInvocationCache.id, hit.id));

			const cachedResponse = (hit.response ?? {}) as Record<string, unknown>;

			await logInvocation({
				agent,
				providerId: provider.id,
				model,
				userId,
				contextKey,
				requestHash,
				context,
				response: cachedResponse,
				status: 'success',
				error: null,
				latencyMs: 0,
				promptTokens: null,
				completionTokens: null,
				cached: true,
				rawBody: null,
			});

			reportGeneration({
				agent,
				providerName: provider.name,
				model,
				userId,
				promptTokens: null,
				completionTokens: null,
				latencyMs: 0,
				cached: true,
				status: 'success',
				error: null,
			});

			return { ok: true, data: cachedResponse, cached: true, cacheKey, messages };
		}
	}

	const options_ = {
		model,
		temperature: agent.temperature === null ? null : Number(agent.temperature),
		topP: agent.topP === null ? null : Number(agent.topP),
		maxTokens: agent.maxTokens,
		responseFormat: agent.responseFormat === 'json_object' ? { type: 'json_object' } : null,
	};

	let result = await chat(provider, messages, options_);

	if (!result.success) {
		await logInvocation({
			agent,
			providerId: provider.id,
			model,
			userId,
			contextKey,
			requestHash,
			context,
			response: null,
			status: 'error',
			error: result.error,
			latencyMs: result.latencyMs,
			promptTokens: null,
			completionTokens: null,
			cached: false,
			rawBody: result.rawBody,
		});

		reportGeneration({
			agent,
			providerName: provider.name,
			model,
			userId,
			promptTokens: null,
			completionTokens: null,
			latencyMs: result.latencyMs,
			cached: false,
			status: 'error',
			error: result.error,
		});

		return {
			ok: false,
			code: 'provider_error',
			message: result.error ?? 'Unknown provider error',
			messages,
			requestPayload: result.requestPayload,
			rawBody: result.rawBody,
		};
	}

	let { parsed, error: parseError } = parseAndValidate(result.content, agent);

	if (parseError !== null) {
		/*
		 * One retry with a stricter instruction.
		 *
		 * Models routinely return a valid object wrapped in prose or fences, and
		 * this recovers most of those. Worth keeping: without it the user sees a
		 * failure for what is really a formatting slip, and the retry is far
		 * cheaper than the support cost of the failure.
		 */
		const retryMessages = [
			...messages,
			{ role: 'assistant', content: result.content ?? '' },
			{
				role: 'user',
				content: `Your previous response was not valid JSON for the required schema (${parseError}). Return ONLY the JSON object, no prose, no markdown, matching the schema exactly.`,
			},
		];

		const retry = await chat(provider, retryMessages, options_);

		if (retry.success) {
			const retried = parseAndValidate(retry.content, agent);
			parsed = retried.parsed;
			parseError = retried.error;
			result = retry;
		}
	}

	if (parseError !== null || parsed === null) {
		await logInvocation({
			agent,
			providerId: provider.id,
			model,
			userId,
			contextKey,
			requestHash,
			context,
			response: null,
			status: 'invalid_json',
			error: parseError,
			latencyMs: result.latencyMs,
			promptTokens: result.promptTokens,
			completionTokens: result.completionTokens,
			cached: false,
			rawBody: result.rawBody,
		});

		reportGeneration({
			agent,
			providerName: provider.name,
			model,
			userId,
			promptTokens: result.promptTokens,
			completionTokens: result.completionTokens,
			latencyMs: result.latencyMs,
			cached: false,
			status: 'invalid_json',
			error: parseError,
		});

		return {
			ok: false,
			code: 'invalid_json',
			message: parseError ?? 'response was not valid JSON',
			messages,
			requestPayload: result.requestPayload,
			rawBody: result.rawBody,
		};
	}

	if (useCache) {
		const now = new Date();

		await db()
			.insert(aiInvocationCache)
			.values({
				cacheKey,
				agentId: agent.id,
				agentVersion: agent.version,
				providerId: provider.id,
				model,
				requestHash,
				response: parsed,
				createdAt: now,
			} as typeof aiInvocationCache.$inferInsert)
			.onConflictDoUpdate({
				target: aiInvocationCache.cacheKey,
				set: { response: parsed },
			});
	}

	await logInvocation({
		agent,
		providerId: provider.id,
		model,
		userId,
		contextKey,
		requestHash,
		context,
		response: parsed,
		status: 'success',
		error: null,
		latencyMs: result.latencyMs,
		promptTokens: result.promptTokens,
		completionTokens: result.completionTokens,
		cached: false,
		rawBody: null,
	});

	reportGeneration({
		agent,
		providerName: provider.name,
		model,
		userId,
		promptTokens: result.promptTokens,
		completionTokens: result.completionTokens,
		latencyMs: result.latencyMs,
		cached: false,
		status: 'success',
		error: null,
	});

	return {
		ok: true,
		data: parsed,
		cached: false,
		cacheKey,
		messages,
		requestPayload: result.requestPayload,
		rawBody: result.rawBody,
	};
}

function buildMessages(
	agent: AgentRecord,
	context: Record<string, unknown>,
): { role: string; content: string }[] {
	// The template sees the raw context plus three convenience aliases the
	// existing stored prompts reference.
	const renderContext: Record<string, unknown> = {
		...context,
		inputs_json: context.inputs ?? {},
		computed_json: context.computed ?? {},
		context_json: context,
	};

	return [
		{ role: 'system', content: agent.systemPrompt ?? '' },
		{ role: 'user', content: renderPrompt(agent.userPromptTemplate ?? '', renderContext) },
	];
}

function parseAndValidate(
	content: string | null,
	agent: AgentRecord,
): { parsed: Record<string, unknown> | null; error: string | null } {
	if (agent.responseFormat === 'text') {
		return { parsed: { text: String(content ?? '') }, error: null };
	}

	// Markdown fences are stripped before parsing - models add them even when
	// told not to.
	const cleaned = String(content ?? '')
		.trim()
		.replace(/^```(?:json)?\s*|\s*```$/gm, '');

	let decoded: unknown;

	try {
		decoded = JSON.parse(cleaned);
	} catch {
		return { parsed: null, error: 'response was not valid JSON' };
	}

	if (typeof decoded !== 'object' || decoded === null) {
		return { parsed: null, error: 'response was not valid JSON' };
	}

	const errors = validateAgainstSchema(decoded, (agent.outputSchema ?? null) as JsonSchema | null);

	if (errors.length > 0) {
		return { parsed: null, error: errors.join('; ') };
	}

	return { parsed: decoded as Record<string, unknown>, error: null };
}

/**
 * Deterministic request hash.
 *
 * Object keys are sorted and floats rounded to four places so that two
 * semantically identical requests produce the same cache key regardless of key
 * order or float noise. Reproduced exactly - changing it would invalidate every
 * existing cache row.
 */
function hashInput(context: Record<string, unknown>): string {
	return sha256(JSON.stringify(normalize(context)));
}

function normalize(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(normalize);

	if (value !== null && typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => [k, normalize(v)] as const)
			.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

		return Object.fromEntries(entries);
	}

	if (typeof value === 'number' && !Number.isInteger(value)) {
		return Math.round(value * 10_000) / 10_000;
	}

	return value;
}

function sha256(input: string): string {
	return createHash('sha256').update(input).digest('hex');
}

/**
 * Forwarded to PostHog's LLM analytics alongside the database write, so the two
 * always agree. The ai_invocations row already carries model, tokens, latency
 * and cache state, which is why per-agent cost tracking needs no new schema.
 */
function reportGeneration(input: {
	agent: AgentRecord;
	providerName: string;
	model: string | null;
	userId: number | null;
	promptTokens: number | null;
	completionTokens: number | null;
	latencyMs: number | null;
	cached: boolean;
	status: string;
	error: string | null;
}): void {
	trackGeneration({
		userId: input.userId,
		agentSlug: input.agent.slug,
		agentVersion: input.agent.version ?? 1,
		model: input.model,
		provider: input.providerName,
		promptTokens: input.promptTokens,
		completionTokens: input.completionTokens,
		latencyMs: input.latencyMs,
		cached: input.cached,
		status: input.status,
		error: input.error,
	});
}

async function logInvocation(input: {
	agent: AgentRecord;
	providerId: number | null;
	model: string | null;
	userId: number | null;
	contextKey: string | null;
	requestHash: string;
	context: Record<string, unknown>;
	response: Record<string, unknown> | null;
	status: string;
	error: string | null;
	latencyMs: number | null;
	promptTokens: number | null;
	completionTokens: number | null;
	cached: boolean;
	rawBody: string | null;
}): Promise<void> {
	const now = new Date();

	await db()
		.insert(aiInvocations)
		.values({
			userId: input.userId,
			agentId: input.agent.id,
			agentVersion: input.agent.version,
			providerId: input.providerId,
			model: input.model,
			contextKey: input.contextKey,
			requestHash: input.requestHash,
			requestPayload: input.context,
			response: input.response,
			rawResponse: input.rawBody,
			status: input.status,
			error: input.error,
			latencyMs: input.latencyMs,
			promptTokens: input.promptTokens,
			completionTokens: input.completionTokens,
			cached: input.cached,
			createdAt: now,
			updatedAt: now,
		} as typeof aiInvocations.$inferInsert);
}
