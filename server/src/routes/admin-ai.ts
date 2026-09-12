import { and, desc, eq, gte, inArray, ne } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import {
	aiAgentRoutes,
	aiAgentVersions,
	aiAgents,
	aiInvocations,
	aiProviders,
	users,
} from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAdmin } from '../http/auth-middleware.js';
import { HttpError } from '../http/errors.js';
import { parseId } from '../http/ownership.js';
import { pageFromQuery, paginate } from '../http/paginate.js';
import { validate, validated } from '../http/validate.js';
import { listModels, ping, type ProviderConfig } from '../services/ai/client.js';
import { runAgent } from '../services/ai/pipeline.js';

/**
 * Admin AI surface: providers, agents, routes and the invocation log.
 *
 * Ports the four controllers under App\Http\Controllers\Admin. Two behaviours
 * carry over deliberately:
 *
 *   - A provider is presented with `has_api_key` rather than the key itself.
 *     The admin UI needs to know whether one is configured, never what it is,
 *     and this is the only place the key could leak.
 *   - Saving an agent snapshots the previous version into ai_agent_versions and
 *     bumps `version`, which is what makes the rollback endpoint possible. The
 *     version also participates in the invocation cache key, so a prompt edit
 *     invalidates cached responses automatically rather than serving output from
 *     the old prompt.
 */

export const adminAiRoutes = new Hono<AppEnv>();

adminAiRoutes.use('*', requireAdmin);

// ---------------------------------------------------------------- providers

/** Never includes api_key - only whether one is set. */
function presentProvider(row: typeof aiProviders.$inferSelect) {
	return {
		id: Number(row.id),
		slug: row.slug,
		name: row.name,
		base_url: row.baseUrl,
		has_api_key: Boolean(row.apiKey && row.apiKey.length > 0),
		default_model: row.defaultModel,
		enabled: row.enabled,
		is_default: row.isDefault,
		sends_data_externally: row.sendsDataExternally,
		timeout_seconds: row.timeoutSeconds,
		settings: row.settings,
		created_at: row.createdAt ? row.createdAt.toISOString().replace(/\.(\d{3})Z$/, '.$1000Z') : null,
		updated_at: row.updatedAt ? row.updatedAt.toISOString().replace(/\.(\d{3})Z$/, '.$1000Z') : null,
	};
}

const providerSchema = z.object({
	slug: z
		.string()
		.max(64)
		.regex(/^[A-Za-z0-9_-]+$/, 'The slug field must only contain letters, numbers, dashes and underscores.')
		.optional(),
	name: z.string().max(255).optional(),
	base_url: z.string().max(1000).optional(),
	api_key: z.union([z.string().max(1000), z.null()]).optional(),
	default_model: z.union([z.string().max(255), z.null()]).optional(),
	enabled: z.boolean().optional(),
	is_default: z.boolean().optional(),
	sends_data_externally: z.boolean().optional(),
	timeout_seconds: z.number().int().min(1).max(120).optional(),
	settings: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
});

adminAiRoutes.get('/providers', async (c) => {
	const rows = await db().select().from(aiProviders).orderBy(desc(aiProviders.isDefault), aiProviders.name);
	return c.json({ providers: rows.map(presentProvider) });
});

adminAiRoutes.get('/providers/:id', async (c) => {
	const row = await loadProvider(parseId(c.req.param('id')));
	return c.json({ provider: presentProvider(row) });
});

adminAiRoutes.post('/providers', validate('json', providerSchema), async (c) => {
	const data = validated<z.infer<typeof providerSchema>>(c, 'json');

	for (const field of ['name', 'base_url'] as const) {
		if (!data[field]) throw HttpError.field(field, `The ${field.replace('_', ' ')} field is required.`);
	}

	const slug = data.slug ?? slugify(data.name!);
	await assertProviderSlugFree(slug, null);

	const now = new Date();

	const [created] = await db()
		.insert(aiProviders)
		.values({
			slug,
			name: data.name!,
			baseUrl: data.base_url!,
			apiKey: data.api_key ?? null,
			defaultModel: data.default_model ?? null,
			enabled: data.enabled ?? true,
			isDefault: data.is_default ?? false,
			sendsDataExternally: data.sends_data_externally ?? true,
			timeoutSeconds: data.timeout_seconds ?? 30,
			settings: data.settings ?? null,
			createdAt: now,
			updatedAt: now,
		} as typeof aiProviders.$inferInsert)
		.returning();

	if (created?.isDefault) await clearOtherDefaults(Number(created.id));

	return c.json({ provider: presentProvider(created!) }, 201);
});

adminAiRoutes.put('/providers/:id', validate('json', providerSchema), async (c) => {
	const id = parseId(c.req.param('id'));
	await loadProvider(id);

	const data = validated<z.infer<typeof providerSchema>>(c, 'json');

	if (data.slug !== undefined) await assertProviderSlugFree(data.slug, id);

	const patch: Record<string, unknown> = { updatedAt: new Date() };
	const map = {
		slug: 'slug',
		name: 'name',
		base_url: 'baseUrl',
		default_model: 'defaultModel',
		enabled: 'enabled',
		is_default: 'isDefault',
		sends_data_externally: 'sendsDataExternally',
		timeout_seconds: 'timeoutSeconds',
		settings: 'settings',
	} as const;

	for (const [key, column] of Object.entries(map)) {
		const value = (data as Record<string, unknown>)[key];
		if (value !== undefined) patch[column] = value;
	}

	/*
	 * An omitted api_key leaves the stored one alone; an explicit null clears it.
	 *
	 * This matters because the admin UI never receives the key - it cannot send
	 * it back on save, so treating "absent" as "clear" would wipe the credential
	 * every time someone edited the provider's name.
	 */
	if (data.api_key !== undefined) patch.apiKey = data.api_key;

	const [updated] = await db()
		.update(aiProviders)
		.set(patch)
		.where(eq(aiProviders.id, id))
		.returning();

	if (updated?.isDefault) await clearOtherDefaults(id);

	return c.json({ provider: presentProvider(updated!) });
});

adminAiRoutes.delete('/providers/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	const deleted = await db().delete(aiProviders).where(eq(aiProviders.id, id)).returning({ id: aiProviders.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Provider deleted.' });
});

adminAiRoutes.post('/providers/:id/test', async (c) => {
	const row = await loadProvider(parseId(c.req.param('id')));
	const result = await ping(toProviderConfig(row));

	return c.json({
		ok: result.success,
		latency_ms: result.latencyMs,
		error: result.error,
		content: result.content,
	});
});

adminAiRoutes.get('/providers/:id/models', async (c) => {
	const row = await loadProvider(parseId(c.req.param('id')));
	return c.json(await listModels(toProviderConfig(row)));
});

async function loadProvider(id: number) {
	const [row] = await db().select().from(aiProviders).where(eq(aiProviders.id, id)).limit(1);
	if (!row) throw HttpError.notFound();
	return row;
}

function toProviderConfig(row: typeof aiProviders.$inferSelect): ProviderConfig {
	return {
		id: Number(row.id),
		name: row.name,
		baseUrl: row.baseUrl,
		apiKey: row.apiKey ?? null,
		defaultModel: row.defaultModel ?? null,
	};
}

/** Only one provider may be the default. */
async function clearOtherDefaults(keepId: number): Promise<void> {
	await db()
		.update(aiProviders)
		.set({ isDefault: false, updatedAt: new Date() })
		.where(and(eq(aiProviders.isDefault, true), ne(aiProviders.id, keepId)));
}

async function assertProviderSlugFree(slug: string, ignoreId: number | null): Promise<void> {
	const [clash] = await db()
		.select({ id: aiProviders.id })
		.from(aiProviders)
		.where(ignoreId === null ? eq(aiProviders.slug, slug) : and(eq(aiProviders.slug, slug), ne(aiProviders.id, ignoreId)))
		.limit(1);

	if (clash) throw HttpError.field('slug', 'The slug has already been taken.');
}

function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 64);
}

// ------------------------------------------------------------------- agents

const agentSchema = z.object({
	slug: z
		.string()
		.max(64)
		.regex(/^[A-Za-z0-9_-]+$/, 'The slug field must only contain letters, numbers, dashes and underscores.')
		.optional(),
	name: z.string().max(255).optional(),
	description: z.union([z.string().max(2000), z.null()]).optional(),
	provider_id: z.union([z.number(), z.null()]).optional(),
	model: z.union([z.string().max(255), z.null()]).optional(),
	system_prompt: z.string().optional(),
	user_prompt_template: z.string().optional(),
	response_format: z.enum(['json_object', 'json_schema', 'text']).optional(),
	output_schema: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
	temperature: z.number().min(0).max(2).optional(),
	top_p: z.number().min(0).max(1).optional(),
	max_tokens: z.number().int().min(1).max(8192).optional(),
	enabled: z.boolean().optional(),
	rate_limit_per_user_day: z.number().int().min(0).optional(),
	settings: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
});

adminAiRoutes.get('/agents', async (c) => {
	const rows = await db().select().from(aiAgents).orderBy(aiAgents.name);
	return c.json({ agents: serializeRows(rows) });
});

adminAiRoutes.get('/agents/:id', async (c) => {
	const row = await loadAgent(parseId(c.req.param('id')));
	return c.json({ agent: serializeRow(row) });
});

adminAiRoutes.post('/agents', validate('json', agentSchema), async (c) => {
	const data = validated<z.infer<typeof agentSchema>>(c, 'json');

	for (const field of ['name', 'system_prompt', 'user_prompt_template'] as const) {
		if (!data[field]) {
			throw HttpError.field(field, `The ${field.replace(/_/g, ' ')} field is required.`);
		}
	}

	const slug = data.slug ?? slugify(data.name!);
	await assertAgentSlugFree(slug, null);

	const now = new Date();

	const [created] = await db()
		.insert(aiAgents)
		.values({
			slug,
			name: data.name!,
			description: data.description ?? null,
			providerId: data.provider_id ?? null,
			model: data.model ?? null,
			systemPrompt: data.system_prompt!,
			userPromptTemplate: data.user_prompt_template!,
			responseFormat: data.response_format ?? 'json_object',
			outputSchema: data.output_schema ?? null,
			temperature: String(data.temperature ?? 0.2),
			topP: String(data.top_p ?? 1),
			maxTokens: data.max_tokens ?? 1024,
			enabled: data.enabled ?? true,
			rateLimitPerUserDay: data.rate_limit_per_user_day ?? 0,
			settings: data.settings ?? null,
			version: 1,
			createdAt: now,
			updatedAt: now,
		} as typeof aiAgents.$inferInsert)
		.returning();

	return c.json({ agent: serializeRow(created!) }, 201);
});

adminAiRoutes.put('/agents/:id', validate('json', agentSchema), async (c) => {
	const id = parseId(c.req.param('id'));
	const existing = await loadAgent(id);
	const data = validated<z.infer<typeof agentSchema>>(c, 'json');

	if (data.slug !== undefined) await assertAgentSlugFree(data.slug, id);

	// Snapshot before mutating, so rollback has something to restore.
	await snapshotAgent(existing, currentUser(c).id);

	const patch: Record<string, unknown> = {
		updatedAt: new Date(),
		// Bumping the version also invalidates the invocation cache, since the
		// version is part of the cache key - a prompt edit must not keep serving
		// responses generated by the old prompt.
		version: (existing.version ?? 1) + 1,
	};

	const map = {
		slug: 'slug',
		name: 'name',
		description: 'description',
		provider_id: 'providerId',
		model: 'model',
		system_prompt: 'systemPrompt',
		user_prompt_template: 'userPromptTemplate',
		response_format: 'responseFormat',
		output_schema: 'outputSchema',
		max_tokens: 'maxTokens',
		enabled: 'enabled',
		rate_limit_per_user_day: 'rateLimitPerUserDay',
		settings: 'settings',
	} as const;

	for (const [key, column] of Object.entries(map)) {
		const value = (data as Record<string, unknown>)[key];
		if (value !== undefined) patch[column] = value;
	}

	// numeric(3,2) columns - written as strings so Postgres keeps the precision.
	if (data.temperature !== undefined) patch.temperature = String(data.temperature);
	if (data.top_p !== undefined) patch.topP = String(data.top_p);

	const [updated] = await db().update(aiAgents).set(patch).where(eq(aiAgents.id, id)).returning();

	return c.json({ agent: serializeRow(updated!) });
});

adminAiRoutes.delete('/agents/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	const deleted = await db().delete(aiAgents).where(eq(aiAgents.id, id)).returning({ id: aiAgents.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Agent deleted.' });
});

adminAiRoutes.get('/agents/:id/versions', async (c) => {
	const id = parseId(c.req.param('id'));
	await loadAgent(id);

	const rows = await db()
		.select()
		.from(aiAgentVersions)
		.where(eq(aiAgentVersions.agentId, id))
		.orderBy(desc(aiAgentVersions.version));

	return c.json({ versions: serializeRows(rows) });
});

adminAiRoutes.post('/agents/:id/rollback/:version', async (c) => {
	const id = parseId(c.req.param('id'));
	const version = parseId(c.req.param('version'));
	const existing = await loadAgent(id);

	const [snapshot] = await db()
		.select()
		.from(aiAgentVersions)
		.where(and(eq(aiAgentVersions.agentId, id), eq(aiAgentVersions.version, version)))
		.limit(1);

	if (!snapshot) throw HttpError.notFound();

	// The current state is snapshotted first, so a rollback is itself undoable.
	await snapshotAgent(existing, currentUser(c).id);

	const restored = (snapshot.snapshot ?? {}) as Record<string, unknown>;

	const [updated] = await db()
		.update(aiAgents)
		.set({
			systemPrompt: (restored.system_prompt as string) ?? existing.systemPrompt,
			userPromptTemplate: (restored.user_prompt_template as string) ?? existing.userPromptTemplate,
			responseFormat: (restored.response_format as string) ?? existing.responseFormat,
			outputSchema: (restored.output_schema ?? existing.outputSchema) as never,
			model: (restored.model as string) ?? existing.model,
			temperature: String(restored.temperature ?? existing.temperature),
			topP: String(restored.top_p ?? existing.topP),
			maxTokens: (restored.max_tokens as number) ?? existing.maxTokens,
			version: (existing.version ?? 1) + 1,
			updatedAt: new Date(),
		})
		.where(eq(aiAgents.id, id))
		.returning();

	return c.json({ agent: serializeRow(updated!), rolled_back_to: version });
});

adminAiRoutes.post('/agents/:id/preview', async (c) => {
	const agent = await loadAgent(parseId(c.req.param('id')));

	let body: { context?: Record<string, unknown>; use_cache?: boolean } = {};
	try {
		body = (await c.req.json()) as typeof body;
	} catch {
		/* empty body is an empty context */
	}

	if (!body.context || typeof body.context !== 'object') {
		throw HttpError.field('context', 'The context field is required.');
	}

	// Preview defaults to *not* caching, so an operator iterating on a prompt
	// sees fresh output rather than their first attempt.
	const result = await runAgent({
		agent,
		context: body.context,
		userId: currentUser(c).id,
		contextKey: 'admin.preview',
		useCache: body.use_cache ?? false,
	});

	return c.json({
		ok: result.ok,
		response: result.ok ? result.data : null,
		cached: result.ok ? result.cached : false,
		error: result.ok ? null : result.code,
		message: result.ok ? null : result.message,
		messages: result.messages ?? null,
		request_payload: result.requestPayload ?? null,
		raw_response: result.rawBody ?? null,
	});
});

async function loadAgent(id: number) {
	const [row] = await db().select().from(aiAgents).where(eq(aiAgents.id, id)).limit(1);
	if (!row) throw HttpError.notFound();
	return row;
}

async function assertAgentSlugFree(slug: string, ignoreId: number | null): Promise<void> {
	const [clash] = await db()
		.select({ id: aiAgents.id })
		.from(aiAgents)
		.where(ignoreId === null ? eq(aiAgents.slug, slug) : and(eq(aiAgents.slug, slug), ne(aiAgents.id, ignoreId)))
		.limit(1);

	if (clash) throw HttpError.field('slug', 'The slug has already been taken.');
}

async function snapshotAgent(agent: typeof aiAgents.$inferSelect, createdBy: number): Promise<void> {
	const now = new Date();

	await db()
		.insert(aiAgentVersions)
		.values({
			agentId: agent.id,
			version: agent.version ?? 1,
			snapshot: {
				system_prompt: agent.systemPrompt,
				user_prompt_template: agent.userPromptTemplate,
				response_format: agent.responseFormat,
				output_schema: agent.outputSchema,
				model: agent.model,
				temperature: agent.temperature,
				top_p: agent.topP,
				max_tokens: agent.maxTokens,
			},
			createdBy,
			createdAt: now,
			updatedAt: now,
		} as typeof aiAgentVersions.$inferInsert);
}

// ------------------------------------------------------------------- routes

const routeSchema = z.object({
	context_key: z.string().max(128),
	agent_id: z.number(),
	priority: z.number().int().optional(),
	enabled: z.boolean().optional(),
});

adminAiRoutes.get('/routes', async (c) => {
	const rows = await db()
		.select()
		.from(aiAgentRoutes)
		.orderBy(aiAgentRoutes.contextKey, desc(aiAgentRoutes.priority));

	return c.json({ routes: serializeRows(rows) });
});

adminAiRoutes.post('/routes', validate('json', routeSchema), async (c) => {
	const data = validated<z.infer<typeof routeSchema>>(c, 'json');
	const now = new Date();

	const [created] = await db()
		.insert(aiAgentRoutes)
		.values({
			contextKey: data.context_key,
			agentId: data.agent_id,
			priority: data.priority ?? 0,
			enabled: data.enabled ?? true,
			createdAt: now,
			updatedAt: now,
		} as typeof aiAgentRoutes.$inferInsert)
		.returning();

	return c.json({ route: serializeRow(created!) }, 201);
});

adminAiRoutes.put('/routes/:id', validate('json', routeSchema.partial()), async (c) => {
	const id = parseId(c.req.param('id'));
	const data = validated<Partial<z.infer<typeof routeSchema>>>(c, 'json');

	const patch: Record<string, unknown> = { updatedAt: new Date() };
	if (data.context_key !== undefined) patch.contextKey = data.context_key;
	if (data.agent_id !== undefined) patch.agentId = data.agent_id;
	if (data.priority !== undefined) patch.priority = data.priority;
	if (data.enabled !== undefined) patch.enabled = data.enabled;

	const [updated] = await db()
		.update(aiAgentRoutes)
		.set(patch)
		.where(eq(aiAgentRoutes.id, id))
		.returning();

	if (!updated) throw HttpError.notFound();

	return c.json({ route: serializeRow(updated) });
});

adminAiRoutes.delete('/routes/:id', async (c) => {
	const id = parseId(c.req.param('id'));
	const deleted = await db().delete(aiAgentRoutes).where(eq(aiAgentRoutes.id, id)).returning({ id: aiAgentRoutes.id });

	if (deleted.length === 0) throw HttpError.notFound();

	return c.json({ message: 'Route deleted.' });
});

// -------------------------------------------------------------- invocations

const ERROR_STATUSES = ['error', 'invalid_json', 'timeout'];

adminAiRoutes.get('/invocations', async (c) => {
	const filters = [];

	const agentId = c.req.query('agent_id');
	if (agentId) filters.push(eq(aiInvocations.agentId, Number(agentId)));

	const status = c.req.query('status');
	if (status) filters.push(eq(aiInvocations.status, status));

	const since = c.req.query('since');
	if (since) {
		const parsed = new Date(since);
		if (!Number.isNaN(parsed.getTime())) filters.push(gte(aiInvocations.createdAt, parsed));
	}

	if (c.req.query('errors_only') === 'true' || c.req.query('errors_only') === '1') {
		filters.push(inArray(aiInvocations.status, ERROR_STATUSES));
	}

	const perPage = Number(c.req.query('per_page') ?? 50);

	const page = await paginate({
		table: aiInvocations,
		where: filters.length > 0 ? and(...filters) : undefined,
		orderBy: [desc(aiInvocations.id)],
		page: pageFromQuery(c.req.query('page')),
		perPage: Number.isSafeInteger(perPage) && perPage > 0 && perPage <= 200 ? perPage : 50,
	});

	return c.json({ ...page, data: serializeRows(page.data) });
});

adminAiRoutes.get('/invocations/:id', async (c) => {
	const id = parseId(c.req.param('id'));

	const [row] = await db()
		.select({
			invocation: aiInvocations,
			agent: { id: aiAgents.id, slug: aiAgents.slug, name: aiAgents.name },
			user: {
				id: users.id,
				email: users.email,
				first_name: users.firstName,
				last_name: users.lastName,
			},
		})
		.from(aiInvocations)
		.leftJoin(aiAgents, eq(aiInvocations.agentId, aiAgents.id))
		.leftJoin(users, eq(aiInvocations.userId, users.id))
		.where(eq(aiInvocations.id, id))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return c.json({
		invocation: {
			...serializeRow(row.invocation),
			agent: row.agent ? serializeRow(row.agent) : null,
			user: row.user ? serializeRow(row.user) : null,
		},
	});
});
