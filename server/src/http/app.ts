import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { calculatorRoutes } from '../routes/calculators.js';
import { healthRoutes } from '../routes/health.js';
import { errorHandler, notFoundHandler } from './errors.js';

export type AppEnv = {
	Variables: {
		logger: ReturnType<typeof logger>;
		requestId: string;
	};
};

export function createApp() {
	const config = env();
	const app = new Hono<AppEnv>();

	app.use('*', requestId());

	// One child logger per request, carrying the request id, so a single log
	// line can be traced back to the request that produced it.
	app.use('*', async (c, next) => {
		const child = logger().child({ requestId: c.get('requestId') });
		c.set('logger', child);
		const start = performance.now();

		await next();

		child.info(
			{
				method: c.req.method,
				path: c.req.path,
				status: c.res.status,
				durationMs: Math.round((performance.now() - start) * 100) / 100,
			},
			'request',
		);
	});

	app.use('*', secureHeaders());

	app.use(
		'*',
		cors({
			origin: config.CORS_ORIGINS,
			// Sanctum's SPA flow used cookies. Credentials stay on so the Vue app
			// keeps working unchanged while auth moves in Phase 3.
			credentials: true,
			allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			maxAge: 86_400,
		}),
	);

	app.onError(errorHandler);
	app.notFound(notFoundHandler);

	app.route('/', healthRoutes);
	app.route('/api/calculators', calculatorRoutes);

	return app;
}

export type App = ReturnType<typeof createApp>;
