import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import { env } from '../config/env.js';
import { auth } from '../lib/auth.js';
import { logger } from '../lib/logger.js';
import { adminAiRoutes } from '../routes/admin-ai.js';
import { adminRoutes } from '../routes/admin.js';
import { aiRoutes } from '../routes/ai.js';
import { authCompatRoutes } from '../routes/auth-compat.js';
import { calculatorRoutes } from '../routes/calculators.js';
import { dashboardRoutes } from '../routes/dashboard.js';
import { deviceRoutes } from '../routes/devices.js';
import { healthRoutes } from '../routes/health.js';
import { notificationRoutes } from '../routes/notifications.js';
import { profileRoutes } from '../routes/profile.js';
import { publicRoutes } from '../routes/public.js';
import { financeSheetRoutes, leaseSheetRoutes, mortgageSheetRoutes } from '../routes/sheets.js';
import { watchRoutes } from '../routes/watch.js';
import { type AuthVariables, resolveSession } from './auth-middleware.js';
import { errorHandler, notFoundHandler } from './errors.js';

export type AppEnv = {
	Variables: AuthVariables & {
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

	// Better Auth owns everything under /api/auth: sign-in, sign-up, sign-out,
	// session, password reset, email verification.
	app.on(['GET', 'POST'], '/api/auth/*', (c) => auth().handler(c.req.raw));

	// Resolve the session for every other route. Handlers that require a user
	// add requireAuth; handlers that merely behave differently for guests can
	// read c.get('user') without repeating the lookup.
	app.use('*', resolveSession);

	app.route('/', healthRoutes);

	// Public
	app.route('/api/calculators', calculatorRoutes);
	app.route('/api', publicRoutes);

	// Sanctum-shaped auth, translated onto Better Auth. Both clients call these
	// paths, and the shipped mobile build cannot be changed on demand - see
	// routes/auth-compat.ts. Mounted before the authenticated routers so /api/user
	// and /api/logout resolve here.
	app.route('/api', authCompatRoutes);

	// Authenticated
	app.route('/api/profile', profileRoutes);
	app.route('/api/dashboard', dashboardRoutes);
	app.route('/api/vehicle-finance-sheets', financeSheetRoutes);
	app.route('/api/vehicle-lease-sheets', leaseSheetRoutes);
	app.route('/api/mortgage-sheets', mortgageSheetRoutes);
	app.route('/api/watch', watchRoutes);
	app.route('/api/notifications', notificationRoutes);
	app.route('/api/devices', deviceRoutes);
	app.route('/api/ai', aiRoutes);

	// Admin. The AI routes mount first so /api/admin/ai/* is matched before the
	// general admin router sees it.
	app.route('/api/admin/ai', adminAiRoutes);
	app.route('/api/admin', adminRoutes);

	return app;
}

export type App = ReturnType<typeof createApp>;
