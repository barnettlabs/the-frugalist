import { beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../http/app.js';
import { createLegacyUser } from '../test/factories.js';

/**
 * Authentication against a real database.
 *
 * The case that matters is the first one: a password hashed by Laravel with
 * bcrypt must still sign in through Better Auth, which hashes with scrypt.
 * Without the bcrypt fallback in lib/auth.ts every existing user would be
 * locked out at cutover with no path back except a password reset - and with
 * only two accounts that would be survivable, but silently wrong.
 *
 * The fixture user is created by the test rather than seeded externally, so a
 * run does not depend on what a previous one left behind.
 */

const app = createApp();

let creds = { email: '', password: '' };

beforeAll(async () => {
	const user = await createLegacyUser();
	creds = { email: user.email, password: user.password };
});

const json = (path: string, body: unknown, headers: Record<string, string> = {}) =>
	app.request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});

describe('sign-in with a Laravel bcrypt password', () => {
	it('accepts the existing password', async () => {
		const res = await json('/api/auth/sign-in/email', creds);

		expect(res.status, await res.text().catch(() => '')).toBe(200);
	});

	it('rejects a wrong password', async () => {
		const res = await json('/api/auth/sign-in/email', {
			email: creds.email,
			password: 'not-the-password',
		});

		expect(res.status).toBeGreaterThanOrEqual(400);
	});

	it('returns a bearer token the Expo client can store', async () => {
		const res = await json('/api/auth/sign-in/email', creds);

		// The bearer plugin surfaces the session token in this header, which is
		// what the React Native client reads and puts in expo-secure-store.
		expect(res.headers.get('set-auth-token')).toBeTruthy();
	});
});

describe('session resolution', () => {
	let token: string;

	beforeAll(async () => {
		const res = await json('/api/auth/sign-in/email', creds);
		token = res.headers.get('set-auth-token') ?? '';
	});

	it('resolves a user from a bearer token', async () => {
		const res = await app.request('/api/auth/get-session', {
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { user?: { email?: string } } | null;
		expect(body?.user?.email).toBe(creds.email);
	});

	it('carries the Laravel columns through as additional fields', async () => {
		const res = await app.request('/api/auth/get-session', {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = (await res.json()) as { user?: Record<string, unknown> } | null;

		// Better Auth camelCases additional fields on the way out, whatever the
		// column is named.
		expect(body?.user?.firstName).toBe('Legacy');
		expect(body?.user?.lastName).toBe('User');
		expect(body?.user?.isAdmin).toBe(false);
	});

	it('serialises the bigint user id as a string, which the middleware coerces', async () => {
		const res = await app.request('/api/auth/get-session', {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = (await res.json()) as { user?: { id?: unknown } } | null;

		expect(typeof body?.user?.id).toBe('string');
		expect(Number(body?.user?.id)).toBeGreaterThan(0);
	});

	it('treats a garbage token as anonymous rather than erroring', async () => {
		const res = await app.request('/api/auth/get-session', {
			headers: { Authorization: 'Bearer not-a-real-token' },
		});

		expect(res.status).toBeLessThan(500);
	});
});
