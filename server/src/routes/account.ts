import { verify as verifyBcrypt } from '@node-rs/bcrypt';
import { and, eq } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { authAccounts, users } from '../db/schema.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { HttpError } from '../http/errors.js';
import { auth } from '../lib/auth.js';
import { trackEvent } from '../observability/analytics.js';

/**
 * Account deletion.
 *
 * Not optional: the App Store requires an in-app way to delete an account for
 * any app that lets you create one, so this has to exist before the mobile
 * client can ship against the new service.
 *
 * Mounted on two paths because the clients disagree - the Vue app sends
 * `DELETE /api/profile` with a password in the body, the Expo app sends
 * `DELETE /api/user`. Both are honoured rather than picking one and breaking a
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
 * This router mounts at /api rather than a prefix of its own, because the two
 * client paths (/api/profile and /api/user) sit under different owners. A
 * wildcard middleware here would therefore run for *every* unmatched /api/*
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

	/*
	 * Password confirmation, when the account has a password to confirm.
	 *
	 * Laravel's ProfileController required it unconditionally via the
	 * `current_password` rule. That cannot be unconditional here: Better Auth
	 * supports social sign-in, and an account created that way has no credential
	 * password to check. So the rule is "confirm it if there is one" - which is
	 * strictly the same requirement for every account that exists today, and
	 * correct rather than broken for any social account added later.
	 */
	const [credential] = await db()
		.select({ id: authAccounts.id, password: authAccounts.password })
		.from(authAccounts)
		.where(and(eq(authAccounts.userId, user.id), eq(authAccounts.providerId, 'credential')))
		.limit(1);

	if (credential?.password) {
		if (!password) {
			throw HttpError.field('password', 'The password field is required.');
		}

		const valid = await verifyPassword(credential.password, password);

		if (!valid) {
			// Reported on `password`, where Laravel's current_password rule put it.
			throw HttpError.field('password', 'The provided password is incorrect.');
		}
	}

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

async function verifyPassword(hash: string, password: string): Promise<boolean> {
	// A hash carried over from Laravel, or one Better Auth has since written.
	if (['$2a$', '$2b$', '$2y$'].some((p) => hash.startsWith(p))) {
		return verifyBcrypt(password, hash);
	}

	const { verifyPassword: verify } = await import('better-auth/crypto');
	return verify({ hash, password });
}

accountRoutes.delete('/profile', requireAuth, (c) => deleteAccount(c));
accountRoutes.delete('/user', requireAuth, (c) => deleteAccount(c));
