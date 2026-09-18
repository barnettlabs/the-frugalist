/**
 * Seeder.
 *
 * Replaces Laravel's five seeder classes, which were deleted with the rest of
 * the PHP and never ported - so a freshly migrated database had the schema and
 * none of the rows the application needs to function. Price checks resolve a
 * retailer by slug, the worker resolves its schedules by name, and the AI
 * surface resolves an agent by context key. Without these rows those features
 * do not fail loudly; they find nothing and quietly do nothing.
 *
 * Everything here is an upsert keyed on the natural key, so it is safe to run
 * against a database that already has data, and safe to run repeatedly. It
 * never updates a row's operational state: `is_active`, `enabled` and API keys
 * are settings an operator may have changed deliberately in production, and a
 * deploy-time seed that resets them would be a trap.
 *
 *   pnpm db:seed                        reference data only
 *   SEED_EMAIL=you@example.com \
 *   SEED_PASSWORD=... pnpm db:seed      reference data and a first user
 *
 * Set SEED_ADMIN=true to give that user the admin flag.
 */

import { eq } from 'drizzle-orm';

import { closeDb, db } from '../db/client.js';
import {
	aiAgentRoutes,
	aiAgents,
	aiProviders,
	priceCheckSchedules,
	retailers,
	users,
} from '../db/schema.js';
import { auth } from '../lib/auth.js';
import { logger } from '../lib/logger.js';

const log = logger();

/**
 * Insert when absent, leave alone when present.
 *
 * Takes closures rather than a table and a where clause: Drizzle's insert and
 * select types do not generalise across tables without casting every call to
 * `never`, which would throw away the column checking that makes this file
 * worth type-checking at all. The closures stay fully typed at each call site.
 *
 * Deliberately not an UPDATE: these rows carry operator-owned state (enabled
 * flags, API keys, rate limits) and re-running a seed must not revert a change
 * someone made on purpose.
 */
async function ensure(
	label: string,
	find: () => Promise<{ id: number } | undefined>,
	create: () => Promise<{ id: number } | undefined>,
): Promise<number> {
	const existing = await find();

	if (existing) {
		log.info({ label }, 'already present, left unchanged');
		return existing.id;
	}

	const created = await create();
	if (!created) throw new Error(`failed to create ${label}`);

	log.info({ label, id: created.id }, 'created');
	return created.id;
}

async function seedRetailers(): Promise<void> {
	// Only Best Buy, matching the Laravel seeder. The factory also registers a
	// Home Depot client, but its prices have always parsed to 0.00 (see
	// MIGRATION.md) - seeding it active would start firing price-drop alerts
	// for products that look free.
	await ensure(
		'retailer:bestbuy',
		async () =>
			(
				await db()
					.select({ id: retailers.id })
					.from(retailers)
					.where(eq(retailers.slug, 'bestbuy'))
					.limit(1)
			)[0],
		async () =>
			(
				await db()
					.insert(retailers)
					.values({
						name: 'Best Buy',
						slug: 'bestbuy',
						apiBaseUrl: 'https://api.bestbuy.com',
						apiKey: process.env.BESTBUY_API_KEY ?? null,
						apiConfig: { rate_limit: 5, supports_upc: true, supports_sku: true },
						isActive: true,
						rateLimitPerHour: 1000,
					})
					.returning({ id: retailers.id })
			)[0],
	);
}

async function seedSchedules(): Promise<void> {
	const schedules = [
		{ name: 'global_hourly', frequency: 'hourly', minuteOffset: 0, isActive: true },
		{ name: 'global_twice_daily', frequency: 'daily', minuteOffset: 0, isActive: true },
		// Off by default, as it was in Laravel.
		{ name: 'global_every_6_hours', frequency: 'every_6_hours', minuteOffset: 30, isActive: false },
	];

	for (const schedule of schedules) {
		await ensure(
			`schedule:${schedule.name}`,
			async () =>
				(
					await db()
						.select({ id: priceCheckSchedules.id })
						.from(priceCheckSchedules)
						.where(eq(priceCheckSchedules.name, schedule.name))
						.limit(1)
				)[0],
			async () =>
				(
					await db()
						.insert(priceCheckSchedules)
						.values({ ...schedule, userId: null })
						.returning({ id: priceCheckSchedules.id })
				)[0],
		);
	}
}

const DEAL_GRADE_SCHEMA = {
	type: 'object',
	required: ['grade', 'rating', 'summary', 'red_flags', 'tips'],
	properties: {
		grade: { type: 'string', enum: ['A+', 'A', 'B', 'C', 'D', 'F'] },
		rating: {
			type: 'string',
			enum: ['excellent', 'good', 'fair', 'poor', 'bad', 'needs_more_info'],
		},
		confidence: { type: 'number' },
		summary: { type: 'string' },
		red_flags: { type: 'array', items: { type: 'string' }, maxItems: 5 },
		tips: { type: 'array', items: { type: 'string' }, maxItems: 5 },
	},
};

const SYSTEM_PROMPT =
	'You are a car deal grading assistant. You help users understand whether a car finance or lease deal is good. The backend already performed the calculations. Do not invent numbers. Do not recalculate hidden values. Use only the provided inputs and computed values. Return strict JSON only.';

const RESPONSE_SHAPE = `Return JSON exactly matching this shape:
{
  "grade": "A+|A|B|C|D|F",
  "rating": "excellent|good|fair|poor|bad|needs_more_info",
  "confidence": 0.0,
  "summary": "one short paragraph",
  "red_flags": ["up to 5 short items"],
  "tips": ["up to 5 short items"]
}`;

const FINANCE_TEMPLATE = `Grade this car finance deal.

Inputs:
{{inputs_json}}

Computed values:
{{computed_json}}

${RESPONSE_SHAPE}

Guidelines:
- A/A+ = strong deal
- B = good/decent deal
- C = average or acceptable but not special
- D = weak deal
- F = avoid
- Use needs_more_info if required values are missing
- Be concise. No markdown. No extra fields.`;

const LEASE_TEMPLATE = `Grade this car lease deal.

Inputs:
{{inputs_json}}

Computed values:
{{computed_json}}

${RESPONSE_SHAPE}

Pay extra attention to: money factor (compare to base ~0.0008-0.0025 range), residual percentage, capitalized cost vs MSRP, fees stacked on lease cash. Be concise. No markdown. No extra fields.`;

async function seedAi(): Promise<void> {
	const providerId = await ensure(
		'ai-provider:local-llm',
		async () =>
			(
				await db()
					.select({ id: aiProviders.id })
					.from(aiProviders)
					.where(eq(aiProviders.slug, 'local-llm'))
					.limit(1)
			)[0],
		async () =>
			(
				await db()
					.insert(aiProviders)
					.values({
						slug: 'local-llm',
						name: 'Local LLM (OpenAI-compatible)',
						baseUrl: process.env.AI_BASE_URL ?? 'http://localhost:8080/v1',
						apiKey: process.env.AI_API_KEY ?? null,
						defaultModel: process.env.AI_DEFAULT_MODEL ?? 'qwen2.5-7b-instruct',
						enabled: true,
						isDefault: true,
						// The default provider is a local model, so nothing leaves the host.
						// A hosted provider would need this set true and reviewed.
						sendsDataExternally: false,
						timeoutSeconds: 20,
					})
					.returning({ id: aiProviders.id })
			)[0],
	);

	const agents = [
		{
			slug: 'deal-grade-finance',
			name: 'Finance Deal Grader',
			description: 'Grades a vehicle finance deal and offers tips.',
			template: FINANCE_TEMPLATE,
			contextKey: 'calculator.finance.deal-grade',
		},
		{
			slug: 'deal-grade-lease',
			name: 'Lease Deal Grader',
			description: 'Grades a vehicle lease deal and offers tips.',
			template: LEASE_TEMPLATE,
			contextKey: 'calculator.lease.deal-grade',
		},
	];

	for (const agent of agents) {
		const agentId = await ensure(
			`ai-agent:${agent.slug}`,
			async () =>
				(
					await db()
						.select({ id: aiAgents.id })
						.from(aiAgents)
						.where(eq(aiAgents.slug, agent.slug))
						.limit(1)
				)[0],
			async () =>
				(
					await db()
						.insert(aiAgents)
						.values({
							slug: agent.slug,
							name: agent.name,
							description: agent.description,
							providerId,
							model: null,
							systemPrompt: SYSTEM_PROMPT,
							userPromptTemplate: agent.template,
							responseFormat: 'json_object',
							outputSchema: DEAL_GRADE_SCHEMA,
							// numeric columns round-trip as strings - see db/money.ts.
							temperature: '0.2',
							topP: '0.9',
							maxTokens: 500,
							enabled: true,
							rateLimitPerUserDay: 50,
						})
						.returning({ id: aiAgents.id })
				)[0],
		);

		await ensure(
			`ai-route:${agent.contextKey}`,
			async () =>
				(
					await db()
						.select({ id: aiAgentRoutes.id })
						.from(aiAgentRoutes)
						.where(eq(aiAgentRoutes.contextKey, agent.contextKey))
						.limit(1)
				)[0],
			async () =>
				(
					await db()
						.insert(aiAgentRoutes)
						.values({ contextKey: agent.contextKey, agentId, priority: 0, enabled: true })
						.returning({ id: aiAgentRoutes.id })
				)[0],
		);
	}
}

/**
 * Created through Better Auth rather than by inserting rows.
 *
 * A user is two records - the profile and a credential account holding the
 * hash - and the hashing must match what sign-in verifies with. Going through
 * the same path registration uses is the only way to be sure a seeded user can
 * actually log in.
 */
async function seedUser(): Promise<void> {
	const email = process.env.SEED_EMAIL?.toLowerCase();
	const password = process.env.SEED_PASSWORD;

	if (!email || !password) {
		log.info('SEED_EMAIL and SEED_PASSWORD not set, skipping user creation');
		return;
	}

	const firstName = process.env.SEED_FIRST_NAME ?? 'Admin';
	const lastName = process.env.SEED_LAST_NAME ?? 'User';
	const wantsAdmin = process.env.SEED_ADMIN === 'true';

	const [existing] = await db().select().from(users).where(eq(users.email, email)).limit(1);

	if (existing) {
		log.info({ email }, 'user already exists, password left unchanged');

		if (wantsAdmin && !existing.isAdmin) {
			await db().update(users).set({ isAdmin: true }).where(eq(users.id, existing.id));
			log.info({ email }, 'granted admin');
		}
		return;
	}

	await auth().api.signUpEmail({
		body: {
			email,
			password,
			name: `${firstName} ${lastName}`.trim(),
			firstName,
			lastName,
		},
	});

	if (wantsAdmin) {
		await db().update(users).set({ isAdmin: true }).where(eq(users.email, email));
	}

	log.info({ email, admin: wantsAdmin }, 'user created');
}

async function main(): Promise<void> {
	log.info('seeding reference data');

	await seedRetailers();
	await seedSchedules();
	await seedAi();
	await seedUser();

	log.info('seed complete');
	await closeDb();
}

main().catch(async (err) => {
	log.error({ err }, 'seed failed');
	await closeDb();
	process.exit(1);
});
