import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { requestId } from 'hono/request-id';
import { secureHeaders } from 'hono/secure-headers';

import { env } from '../config/env.js';
import { auth } from '../lib/auth.js';
import { logger } from '../lib/logger.js';
import { adminAiRoutes } from '../routes/admin-ai.js';
import { accountRoutes } from '../routes/account.js';
import { adminRoutes } from '../routes/admin.js';
import { aiRoutes } from '../routes/ai.js';
import { authRoutes } from '../routes/auth.js';
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

	// No route takes uploads; the largest legitimate body is a sheet with its
	// extra-payment JSON. Capped before anything parses it, so an anonymous
	// request cannot make the server buffer an arbitrarily large payload. After
	// cors, so a rejected browser request still gets a readable response.
	app.use(
		'*',
		bodyLimit({
			maxSize: 256 * 1024,
			onError: (c) => c.json({ message: 'The request body is too large.' }, 413),
		}),
	);

	app.onError(errorHandler);
	app.notFound(notFoundHandler);

	// Better Auth owns everything under /auth: sign-in, sign-up, sign-out,
	// session, password reset, email verification.
	app.on(['GET', 'POST'], '/auth/*', (c) => auth().handler(c.req.raw));

	// Resolve the session for every other route. Handlers that require a user
	// add requireAuth; handlers that merely behave differently for guests can
	// read c.get('user') without repeating the lookup.
	app.use('*', resolveSession);

	app.route('/', healthRoutes);

	// Public
	app.route('/calculators', calculatorRoutes);
	app.route('/', publicRoutes);

	// The clients' auth endpoints, in the API's shape, over Better Auth - see
	// routes/auth.ts. Mounted before the authenticated routers so /user and
	// /logout resolve here.
	app.route('/', authRoutes);

	// Authenticated
	// Account deletion is mounted before the profile router so DELETE /profile
	// resolves here; the profile router owns GET and PUT.
	app.route('/', accountRoutes);
	app.route('/profile', profileRoutes);
	app.route('/dashboard', dashboardRoutes);
	app.route('/vehicle-finance-sheets', financeSheetRoutes);
	app.route('/vehicle-lease-sheets', leaseSheetRoutes);
	app.route('/mortgage-sheets', mortgageSheetRoutes);
	app.route('/watch', watchRoutes);
	app.route('/notifications', notificationRoutes);
	app.route('/devices', deviceRoutes);
	app.route('/ai', aiRoutes);

	// Admin. The AI routes mount first so /admin/ai/* is matched before the
	// general admin router sees it.
	app.route('/admin/ai', adminAiRoutes);
	app.route('/admin', adminRoutes);

	return app;
}

export type App = ReturnType<typeof createApp>;
