import { describe, expect, it } from 'vitest';

import { createApp } from '../http/app.js';
import { createLegacyUser } from '../test/factories.js';

/**
 * The Sanctum-shaped compatibility endpoints.
 *
 * These exist so the already-shipped mobile build keeps working after cutover.
 * Its auth paths and response expectations are compiled in, so if these drift
 * the app breaks for every installed copy and the fix requires an App Store
 * review. Worth real coverage.
 */

const app = createApp();

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
	app.request(path, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...headers },
		body: JSON.stringify(body),
	});

describe('POST /api/login', () => {
	it('returns { user, token } as the clients expect', async () => {
		const user = await createLegacyUser();

		const res = await post('/api/login', { email: user.email, password: user.password });

		expect(res.status, await res.clone().text()).toBe(200);
		const body = (await res.json()) as { user: Record<string, unknown>; token: string };

		expect(typeof body.token).toBe('string');
		expect(body.token.length).toBeGreaterThan(10);
		expect(body.user.email).toBe(user.email);
		// snake_case, as every other record response is.
		expect(body.user).toHaveProperty('first_name');
	});

	it('never returns the password hash', async () => {
		const user = await createLegacyUser();
		const res = await post('/api/login', { email: user.email, password: user.password });
		const body = (await res.json()) as { user: Record<string, unknown> };

		expect(body.user).not.toHaveProperty('password');
		expect(body.user).not.toHaveProperty('remember_token');
	});

	it('accepts a password hashed by Laravel with bcrypt', async () => {
		// The whole point: existing credentials keep working.
		const user = await createLegacyUser({ password: 'legacy-bcrypt-password' });

		const res = await post('/api/login', {
			email: user.email,
			password: 'legacy-bcrypt-password',
		});

		expect(res.status).toBe(200);
	});

	it('reports bad credentials on the email field, as Laravel did', async () => {
		const user = await createLegacyUser();

		const res = await post('/api/login', { email: user.email, password: 'wrong' });

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.email).toEqual(['The provided credentials are incorrect.']);
	});

	it('validates required fields', async () => {
		const res = await post('/api/login', {});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(Object.keys(body.errors).sort()).toEqual(['email', 'password']);
	});

	it('issues a token that authenticates subsequent requests', async () => {
		const user = await createLegacyUser();
		const login = await post('/api/login', { email: user.email, password: user.password });
		const { token } = (await login.json()) as { token: string };

		const me = await app.request('/api/user', { headers: { Authorization: `Bearer ${token}` } });

		expect(me.status).toBe(200);
		expect(((await me.json()) as { email: string }).email).toBe(user.email);
	});
});

describe('POST /api/register', () => {
	it('creates a user and returns { user, token } with 201', async () => {
		const email = `new-${Math.random().toString(36).slice(2, 10)}@example.com`;

		const res = await post('/api/register', {
			first_name: 'New',
			last_name: 'User',
			email,
			password: 'a-good-password',
			password_confirmation: 'a-good-password',
		});

		expect(res.status, await res.clone().text()).toBe(201);
		const body = (await res.json()) as { user: Record<string, unknown>; token: string };

		expect(body.user.email).toBe(email);
		expect(body.user.first_name).toBe('New');
		expect(typeof body.token).toBe('string');
	});

	it('rejects a mismatched confirmation on the password field', async () => {
		const res = await post('/api/register', {
			first_name: 'A',
			last_name: 'B',
			email: `x-${Math.random().toString(36).slice(2, 8)}@example.com`,
			password: 'a-good-password',
			password_confirmation: 'something-else',
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.password).toEqual(['The password field confirmation does not match.']);
	});

	it('rejects a duplicate email', async () => {
		const existing = await createLegacyUser();

		const res = await post('/api/register', {
			first_name: 'A',
			last_name: 'B',
			email: existing.email,
			password: 'a-good-password',
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.email).toEqual(['The email has already been taken.']);
	});

	it('enforces the 8-character minimum', async () => {
		const res = await post('/api/register', {
			first_name: 'A',
			last_name: 'B',
			email: `short-${Math.random().toString(36).slice(2, 8)}@example.com`,
			password: 'short',
		});

		expect(res.status).toBe(422);
	});
});

describe('POST /api/logout', () => {
	it('responds with the message the clients expect', async () => {
		const user = await createLegacyUser();
		const login = await post('/api/login', { email: user.email, password: user.password });
		const { token } = (await login.json()) as { token: string };

		const res = await post('/api/logout', {}, { Authorization: `Bearer ${token}` });

		expect(res.status).toBe(200);
		expect((await res.json()) as { message: string }).toEqual({
			message: 'Logged out successfully.',
		});
	});
});

describe('POST /api/forgot-password', () => {
	it('gives the same answer whether or not the address exists', async () => {
		// Anything else is an account enumeration oracle.
		const known = await createLegacyUser();

		const a = await post('/api/forgot-password', { email: known.email });
		const b = await post('/api/forgot-password', { email: 'nobody-here@example.com' });

		expect(a.status).toBe(200);
		expect(b.status).toBe(200);
		expect(await a.json()).toEqual(await b.json());
	});

	it('validates the email format', async () => {
		const res = await post('/api/forgot-password', { email: 'not-an-email' });
		expect(res.status).toBe(422);
	});
});

describe('GET /api/user', () => {
	it('rejects an anonymous request with Unauthenticated', async () => {
		const res = await app.request('/api/user');

		expect(res.status).toBe(401);
		expect((await res.json()) as { message: string }).toEqual({ message: 'Unauthenticated.' });
	});
});

describe('PUT /api/password', () => {
	it('changes the password and lets the new one sign in', async () => {
		const user = await createLegacyUser();
		const login = await post('/api/login', { email: user.email, password: user.password });
		const { token } = (await login.json()) as { token: string };

		const res = await app.request('/api/password', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({
				current_password: user.password,
				password: 'a-brand-new-password',
				password_confirmation: 'a-brand-new-password',
			}),
		});

		expect(res.status, await res.clone().text()).toBe(200);

		const relogin = await post('/api/login', {
			email: user.email,
			password: 'a-brand-new-password',
		});
		expect(relogin.status).toBe(200);
	});

	it('reports a wrong current password on that field', async () => {
		const user = await createLegacyUser();
		const login = await post('/api/login', { email: user.email, password: user.password });
		const { token } = (await login.json()) as { token: string };

		const res = await app.request('/api/password', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ current_password: 'wrong', password: 'a-brand-new-password' }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.current_password).toEqual(['The provided password is incorrect.']);
	});
});
