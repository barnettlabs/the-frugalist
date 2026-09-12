import { randomUUID } from 'node:crypto';

import { hash as hashBcrypt } from '@node-rs/bcrypt';

import { db } from '../db/client.js';
import { authAccounts, users } from '../db/schema.js';

/**
 * Test fixtures.
 *
 * Tests create the rows they need rather than relying on a seeded database, so
 * a run is reproducible and does not depend on what a previous run left behind.
 *
 * `createLegacyUser` deliberately writes a *bcrypt* hash onto the credential
 * account - the shape Laravel produced - because the case worth protecting is
 * that those credentials still work through Better Auth, which hashes with
 * scrypt. The hash goes only on auth_accounts now; users.password was dropped
 * along with Laravel.
 */

/**
 * Vitest runs each test file in its own forked process, so a per-module counter
 * plus Date.now() is not unique across files - two files starting in the same
 * millisecond collide on the users_email_unique constraint. A UUID is.
 */
const unique = () => randomUUID().slice(0, 12);

export async function createLegacyUser(options: { password?: string; isAdmin?: boolean } = {}) {
	const password = options.password ?? 'laravel-password-123';
	const email = `legacy-${unique()}@example.com`;
	const now = new Date();

	// Cost 12, matching Laravel's BCRYPT_ROUNDS.
	const bcryptHash = await hashBcrypt(password, 12);

	const [user] = await db()
		.insert(users)
		.values({
			email,
			name: 'Legacy User',
			firstName: 'Legacy',
			lastName: 'User',
			isAdmin: options.isAdmin ?? false,
			createdAt: now,
			updatedAt: now,
		} as typeof users.$inferInsert)
		.returning();

	// Better Auth looks for credentials on the account row, which is what the
	// Laravel backfill migration populates for real users.
	await db()
		.insert(authAccounts)
		.values({
			userId: Number(user!.id),
			accountId: String(user!.id),
			providerId: 'credential',
			password: bcryptHash,
			createdAt: now,
			updatedAt: now,
		} as typeof authAccounts.$inferInsert);

	return { id: Number(user!.id), email, password };
}

export async function createPlainUser() {
	const now = new Date();
	const [user] = await db()
		.insert(users)
		.values({
			email: `other-${unique()}@example.com`,
			name: 'Other User',
			createdAt: now,
			updatedAt: now,
		} as typeof users.$inferInsert)
		.returning();

	return { id: Number(user!.id) };
}

/** Signs in and returns the bearer token the Expo client would store. */
export async function signIn(
	app: { request: (path: string, init?: RequestInit) => Response | Promise<Response> },
	credentials: { email: string; password: string },
): Promise<string> {
	const res = await app.request('/api/auth/sign-in/email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});

	const token = res.headers.get('set-auth-token');
	if (!token) throw new Error(`sign-in failed (${res.status}): ${await res.text()}`);

	return token;
}
