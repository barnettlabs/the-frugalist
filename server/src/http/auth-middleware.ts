import { HttpError } from '@frugalist/contracts';
import type { MiddlewareHandler } from 'hono';

import { auth } from '../lib/auth.js';

export type AuthUser = {
	id: number;
	email: string;
	is_admin: boolean;
	first_name: string | null;
	last_name: string | null;
};

export type AuthVariables = {
	user: AuthUser | null;
	sessionId: string | null;
};

/**
 * Resolves the session if one is present, without requiring it.
 *
 * Runs on every route so that handlers which behave differently for guests -
 * the public calculators, announcements, retailers - can see who is asking
 * without each one repeating the lookup.
 */
export const resolveSession: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
	c.set('user', null);
	c.set('sessionId', null);

	try {
		const session = await auth().api.getSession({ headers: c.req.raw.headers });

		if (session?.user) {
			// Better Auth returns the additional fields camelCased and serialises
			// the id as a string even though the column is bigint.
			const u = session.user as unknown as Record<string, unknown>;
			c.set('user', {
				id: Number(u.id),
				email: String(u.email),
				is_admin: Boolean(u.isAdmin),
				first_name: (u.firstName as string) ?? null,
				last_name: (u.lastName as string) ?? null,
			});
			c.set('sessionId', session.session?.id ?? null);
		}
	} catch {
		// A malformed or expired credential is not an error - it is an anonymous
		// request. Routes that require a user will reject it a moment later.
	}

	await next();
};

/**
 * Requires an authenticated user.
 *
 * 401 with `{"message":"Unauthenticated."}` because both clients key their
 * sign-out-and-redirect behaviour off exactly that status and body.
 */
export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
	if (!c.get('user')) throw HttpError.unauthenticated();
	await next();
};

/** Requires the `is_admin` flag, mirroring the EnsureUserIsAdmin middleware. */
export const requireAdmin: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();
	if (!user.is_admin) throw HttpError.forbidden();
	await next();
};

/** The current user, or throw. For handlers already behind requireAuth. */
export function currentUser(c: { get: (k: 'user') => AuthUser | null }): AuthUser {
	const user = c.get('user');
	if (!user) throw HttpError.unauthenticated();
	return user;
}
