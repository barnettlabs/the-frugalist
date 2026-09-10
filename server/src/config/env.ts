import { z } from 'zod';

/**
 * Environment parsed and validated once, at boot.
 *
 * Laravel's config() returned null for a missing key and let the failure surface
 * somewhere unrelated later - a missing RESEND_KEY only showed up when the first
 * price alert failed to send. Parsing here means a misconfigured deploy fails
 * immediately and says which key is wrong.
 */

const bool = (defaultValue: boolean) =>
	z
		.union([z.boolean(), z.string()])
		.optional()
		.transform((v) => {
			if (v === undefined) return defaultValue;
			if (typeof v === 'boolean') return v;
			return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
		});

const port = z.coerce.number().int().min(1).max(65535);

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	APP_ENV: z.enum(['local', 'staging', 'production', 'test']).default('local'),
	APP_URL: z.string().url().default('http://localhost:8787'),
	PORT: port.default(8787),
	LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

	DATABASE_URL: z.string().url(),
	DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

	REDIS_URL: z.string().url(),

	// Comma-separated. The Vue SPA and, in development, the Expo dev client.
	CORS_ORIGINS: z
		.string()
		.default('http://localhost:5173')
		.transform((v) =>
			v
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
		),

	// Kept identical to Laravel's so existing password hashes verify unchanged.
	BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

	SESSION_SECRET: z.string().min(32),

	RESEND_KEY: z.string().optional(),
	MAIL_FROM_ADDRESS: z.string().default('noreply@thefrugalist.io'),
	MAIL_FROM_NAME: z.string().default('TheFrugalist'),
	MAIL_TRANSPORT: z.enum(['resend', 'smtp', 'log']).default('log'),
	SMTP_HOST: z.string().default('127.0.0.1'),
	SMTP_PORT: port.default(51025),

	TWILIO_SID: z.string().optional(),
	TWILIO_TOKEN: z.string().optional(),
	TWILIO_FROM: z.string().optional(),

	SENTRY_DSN: z.string().optional(),
	POSTHOG_KEY: z.string().optional(),
	POSTHOG_HOST: z.string().default('https://us.i.posthog.com'),

	// Lets the worker be disabled in the API process during local development,
	// so a single `pnpm dev` can run both without double-processing jobs.
	RUN_WORKER_IN_PROCESS: bool(false),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
	const parsed = envSchema.safeParse(source);

	if (!parsed.success) {
		const detail = parsed.error.issues
			.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
			.join('\n');
		throw new Error(`Invalid environment configuration:\n${detail}`);
	}

	return parsed.data;
}

export function env(): Env {
	return (cached ??= loadEnv());
}

/** Tests build an isolated config rather than mutating process.env. */
export function setEnvForTesting(value: Env | null): void {
	cached = value;
}

export const isProduction = () => env().NODE_ENV === 'production';
export const isTest = () => env().NODE_ENV === 'test';
