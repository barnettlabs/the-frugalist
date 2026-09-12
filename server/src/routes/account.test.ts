import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { users, vehicleFinanceSheets } from '../db/schema.js';
import { createApp } from '../http/app.js';
import { createLegacyUser, signIn } from '../test/factories.js';

/**
 * Account deletion.
 *
 * Required by the App Store for any app with accounts, so it has to work before
 * the mobile client ships. The cases that matter are that it needs the correct
 * password, that it actually removes the user's data via the cascade, and that
 * both client paths are served.
 */

const app = createApp();

const del = (path: string, token: string, body?: unknown) =>
	app.request(path, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
	});

describe('DELETE /api/profile', () => {
	it('deletes the account and cascades the user data', async () => {
		const user = await createLegacyUser();
		const token = await signIn(app, user);

		// Give the account something that must go with it.
		await app.request('/api/vehicle-finance-sheets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ sheet_name: 'Should be deleted' }),
		});

		const res = await del('/api/profile', token, { password: user.password });

		expect(res.status, await res.clone().text()).toBe(200);
		expect((await res.json()) as { message: string }).toEqual({
			message: 'Account deleted successfully.',
		});

		expect(await db().select().from(users).where(eq(users.id, user.id))).toHaveLength(0);
		// ON DELETE CASCADE, so the sheets go with the row.
		expect(
			await db()
				.select()
				.from(vehicleFinanceSheets)
				.where(eq(vehicleFinanceSheets.userId, user.id)),
		).toHaveLength(0);
	});

	it('refuses a wrong password and leaves the account intact', async () => {
		const user = await createLegacyUser();
		const token = await signIn(app, user);

		const res = await del('/api/profile', token, { password: 'not-my-password' });

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.password).toEqual(['The provided password is incorrect.']);

		expect(await db().select().from(users).where(eq(users.id, user.id))).toHaveLength(1);
	});

	it('refuses a missing password', async () => {
		const user = await createLegacyUser();
		const token = await signIn(app, user);

		const res = await del('/api/profile', token, {});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.password).toEqual(['The password field is required.']);
	});

	it('accepts a bcrypt password carried over from Laravel', async () => {
		const user = await createLegacyUser({ password: 'legacy-bcrypt-secret' });
		const token = await signIn(app, user);

		const res = await del('/api/profile', token, { password: 'legacy-bcrypt-secret' });

		expect(res.status).toBe(200);
	});

	it('rejects an anonymous request', async () => {
		const res = await app.request('/api/profile', { method: 'DELETE' });
		expect(res.status).toBe(401);
	});
});

describe('DELETE /api/user', () => {
	it('serves the Expo client path too', async () => {
		// The two clients disagree on the path; both are honoured rather than
		// picking one and breaking a client.
		const user = await createLegacyUser();
		const token = await signIn(app, user);

		const res = await del('/api/user', token, { password: user.password });

		expect(res.status, await res.clone().text()).toBe(200);
		expect(await db().select().from(users).where(eq(users.id, user.id))).toHaveLength(0);
	});
});

describe('after deletion', () => {
	it('invalidates the session token', async () => {
		const user = await createLegacyUser();
		const token = await signIn(app, user);

		await del('/api/profile', token, { password: user.password });

		const res = await app.request('/api/user', {
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(res.status).toBe(401);
	});
});
