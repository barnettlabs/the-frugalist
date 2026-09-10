import { beforeAll, describe, expect, it } from 'vitest';

import { createApp } from '../http/app.js';

/**
 * Authentication against a real database.
 *
 * The case that matters is the first one: a password hashed by Laravel with
 * bcrypt must still sign in through Better Auth, which hashes with scrypt.
 * Without the bcrypt fallback in lib/auth.ts every existing user would be
 * locked out at cutover with no path back except a password reset - and with
 * only two accounts that would be survivable, but silently wrong.
 *
 * Requires the seeded fixture user:
 *   DB_DATABASE=frugalist_test php artisan migrate:fresh --force
 *   ...then insert legacy@example.com with a bcrypt hash (see the migration).
 */

const app = createApp();

const json = (path: string, body: unknown, headers: Record<string, string> = {}) =>
	app.request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});

describe('sign-in with a Laravel bcrypt password', () => {
	it('accepts the existing password', async () => {
		const res = await json('/api/auth/sign-in/email', {
			email: 'legacy@example.com',
			password: 'laravel-password-123',
		});

		expect(res.status, await res.text().catch(() => '')).toBe(200);
	});

	it('rejects a wrong password', async () => {
		const res = await json('/api/auth/sign-in/email', {
			email: 'legacy@example.com',
			password: 'not-the-password',
		});

		expect(res.status).toBeGreaterThanOrEqual(400);
	});

	it('returns a bearer token the Expo client can store', async () => {
		const res = await json('/api/auth/sign-in/email', {
			email: 'legacy@example.com',
			password: 'laravel-password-123',
		});

		// The bearer plugin surfaces the session token in this header, which is
		// what the React Native client reads and puts in expo-secure-store.
		expect(res.headers.get('set-auth-token')).toBeTruthy();
	});
});

describe('session resolution', () => {
	let token: string;

	beforeAll(async () => {
		const res = await json('/api/auth/sign-in/email', {
			email: 'legacy@example.com',
			password: 'laravel-password-123',
		});
		token = res.headers.get('set-auth-token') ?? '';
	});

	it('resolves a user from a bearer token', async () => {
		const res = await app.request('/api/auth/get-session', {
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { user?: { email?: string } } | null;
		expect(body?.user?.email).toBe('legacy@example.com');
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
