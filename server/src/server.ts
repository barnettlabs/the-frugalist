/*
 * Sentry is initialised before anything else is imported.
 *
 * Its instrumentation patches modules as they load, so anything imported before
 * this call is not traced. That makes import order load-bearing here rather than
 * stylistic.
 */
import { initSentry } from './observability/sentry.js';

initSentry();

import { serve } from '@hono/node-server';

import { env } from './config/env.js';
import { closeDb } from './db/client.js';
import { createApp } from './http/app.js';
import { logger } from './lib/logger.js';
import { shutdownAnalytics } from './observability/analytics.js';
import { flushSentry } from './observability/sentry.js';

const config = env();
const log = logger();
const app = createApp();

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
	// env is stamped on every line by pino's `base`, so it is not repeated here -
	// a duplicate JSON key is invalid and some parsers drop the record.
	log.info({ port: info.port }, 'api listening');
});

/**
 * Drain in-flight requests before exiting. Render sends SIGTERM and waits before
 * SIGKILL; closing the pool after the server stops accepting means a deploy does
 * not sever a request mid-transaction.
 */
async function shutdown(signal: string) {
	log.info({ signal }, 'shutting down');
	server.close(async () => {
		// Telemetry is flushed before the process exits, otherwise the reports
		// from the crash you most want to see are the ones that get lost.
		await Promise.all([flushSentry(), shutdownAnalytics()]);
		await closeDb();
		process.exit(0);
	});
	setTimeout(() => {
		log.error('forced exit after shutdown timeout');
		process.exit(1);
	}, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
