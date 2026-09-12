import { serve } from '@hono/node-server';

import { env } from './config/env.js';
import { closeDb } from './db/client.js';
import { createApp } from './http/app.js';
import { logger } from './lib/logger.js';

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
