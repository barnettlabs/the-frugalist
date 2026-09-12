import * as Sentry from '@sentry/node';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';

/**
 * Error tracking.
 *
 * Initialised as the very first import in both entrypoints, before anything
 * else runs - Sentry's instrumentation patches modules on load, so anything
 * imported before it is not traced.
 *
 * No DSN means Sentry is simply off. That is deliberate: tests and local
 * development should not need credentials, and a missing DSN in production is
 * caught by the startup log line below rather than by silence.
 */

let initialised = false;

export function initSentry(): void {
	if (initialised) return;

	const config = env();
	initialised = true;

	if (!config.SENTRY_DSN) {
		// Worth saying out loud in production - the alternative is discovering
		// months later that nothing was ever being reported.
		if (config.NODE_ENV === 'production') {
			logger().warn('SENTRY_DSN is not set - errors are not being reported anywhere');
		}
		return;
	}

	Sentry.init({
		dsn: config.SENTRY_DSN,
		environment: config.APP_ENV,
		// Traces are sampled: full tracing on a two-user app is pure cost, but
		// zero means no latency data at all when something gets slow.
		tracesSampleRate: config.APP_ENV === 'production' ? 0.2 : 1.0,
		sendDefaultPii: false,

		/**
		 * Scrub anything that could carry a credential before it leaves the
		 * process. pino redacts its own output; this is the same job for Sentry,
		 * and it has to be done here because breadcrumbs and request bodies are
		 * captured independently of logging.
		 */
		beforeSend(event) {
			if (event.request?.headers) {
				for (const header of ['authorization', 'cookie', 'set-cookie']) {
					if (header in event.request.headers) {
						event.request.headers[header] = '[redacted]';
					}
				}
			}

			if (event.request?.data && typeof event.request.data === 'object') {
				const data = event.request.data as Record<string, unknown>;
				for (const key of [
					'password',
					'password_confirmation',
					'current_password',
					'newPassword',
					'currentPassword',
					'token',
					'api_key',
					'apiKey',
				]) {
					if (key in data) data[key] = '[redacted]';
				}
			}

			return event;
		},
	});

	logger().info({ environment: config.APP_ENV }, 'sentry initialised');
}

/**
 * Report an error with request context attached.
 *
 * Client errors are deliberately not reported - a 422 from a form is not a bug,
 * and reporting them would bury the real failures.
 */
export function captureError(
	error: unknown,
	context: { requestId?: string; userId?: number; path?: string; method?: string } = {},
): void {
	if (!env().SENTRY_DSN) return;

	Sentry.withScope((scope) => {
		if (context.requestId) scope.setTag('request_id', context.requestId);
		if (context.path) scope.setTag('path', context.path);
		if (context.method) scope.setTag('method', context.method);
		// An id only - never an email or name.
		if (context.userId) scope.setUser({ id: String(context.userId) });

		Sentry.captureException(error);
	});
}

/** Jobs report through here so a failed price check is visible, not just logged. */
export function captureJobError(
	error: unknown,
	context: { queue: string; jobId?: string; jobName?: string } = { queue: 'unknown' },
): void {
	if (!env().SENTRY_DSN) return;

	Sentry.withScope((scope) => {
		scope.setTag('queue', context.queue);
		if (context.jobId) scope.setTag('job_id', context.jobId);
		if (context.jobName) scope.setTag('job_name', context.jobName);
		scope.setLevel('error');

		Sentry.captureException(error);
	});
}

export async function flushSentry(timeoutMs = 2_000): Promise<void> {
	if (!env().SENTRY_DSN) return;

	try {
		// Without this, a process that exits immediately after an error loses the
		// report - which is exactly the crash you most want to see.
		await Sentry.flush(timeoutMs);
	} catch {
		/* shutdown must not fail because telemetry did */
	}
}

export { Sentry };
