import { eq } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { auth } from '../lib/auth.js';
import { confirmPassword } from '../lib/password-confirmation.js';
import { trackEvent } from '../observability/analytics.js';

/**
 * Account deletion.
 *
 * Not optional: the App Store requires an in-app way to delete an account for
 * any app that lets you create one, so this has to exist before the mobile
 * client can ship against the new service.
 *
 * Mounted on two paths because the clients disagree - the Vue app sends
 * `DELETE /profile` with a password in the body, the Expo app sends
 * `DELETE /user`. Both are honoured rather than picking one and breaking a
 * client.
 *
 * Deletion is a hard delete, and it cascades. Every table holding the user's own
 * content - sheets, tracked products, price history and alerts through them,
 * devices, notifications, sessions, credentials - is ON DELETE CASCADE, so the
 * row going away takes the data with it. ai_invocations and bug_reports are ON
 * DELETE SET NULL instead, which keeps aggregate cost and defect history intact
 * while detaching it from a person. That is the behaviour a deletion request
 * should have, so it is left as it is.
 */

export const accountRoutes = new Hono<AppEnv>();

/*
 * requireAuth is applied per route, not as a wildcard on the router.
 *
 * This router mounts at the root rather than a prefix of its own, because the two
 * client paths (/profile and /user) sit under different owners. A
 * wildcard middleware here would therefore run for *every* unmatched /*
 * request and answer 401 instead of letting the 404 handler respond - which is
 * both wrong and confusing to debug from a client.
 */

const deleteSchema = z.object({
	password: z
		.union([z.string(), z.null()])
		.optional()
		.transform((v) => v ?? undefined),
});

async function deleteAccount(c: Context<AppEnv>) {
	const user = currentUser(c);

	let body: { password?: string } = {};
	try {
		body = (await c.req.json()) as typeof body;
	} catch {
		/* an empty body is allowed - see below */
	}

	const parsed = deleteSchema.safeParse(body);
	const password = parsed.success ? parsed.data.password : undefined;

	// Only when the account has a password to confirm - see confirmPassword.
	await confirmPassword(user.id, password, 'password');

	// Revoke sessions before the row goes, so a token in flight cannot be used
	// against a half-deleted account.
	try {
		await auth().api.revokeSessions({ headers: c.req.raw.headers });
	} catch {
		// The cascade removes auth_sessions anyway; this is belt and braces.
	}

	trackEvent('account_deleted', { userId: user.id });

	await db().delete(users).where(eq(users.id, user.id));

	return c.json({ message: 'Account deleted successfully.' });
}

accountRoutes.delete('/profile', requireAuth, (c) => deleteAccount(c));
accountRoutes.delete('/user', requireAuth, (c) => deleteAccount(c));
