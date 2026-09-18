import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { announcements, notifications, retailers, users } from '../db/schema.js';
import { createApp } from '../http/app.js';
import { createLegacyUser, createPlainUser, signIn } from '../test/factories.js';

/**
 * Coverage for the rest of the ported surface.
 *
 * Two things are worth testing here above all: that the admin gate actually
 * gates (it protects the retailer API keys and every user record), and that
 * per-user resources stay invisible across accounts. The response *envelopes*
 * are also asserted, because they are inconsistent by inheritance - some
 * endpoints return a bare array, some wrap in a singular key, some in a plural
 * one - and the clients depend on each one as it is.
 */

const app = createApp();

let token = '';
let adminToken = '';
let userId = 0;
let otherUserId = 0;

const authed = (path: string, token_: string, init: RequestInit = {}) =>
	app.request(path, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token_}`,
			...(init.headers ?? {}),
		},
	});

const asUser = (path: string, init?: RequestInit) => authed(path, token, init);
const asAdmin = (path: string, init?: RequestInit) => authed(path, adminToken, init);

beforeAll(async () => {
	const user = await createLegacyUser();
	userId = user.id;
	token = await signIn(app, user);

	const admin = await createLegacyUser({ isAdmin: true });
	adminToken = await signIn(app, admin);

	otherUserId = (await createPlainUser()).id;
});

describe('profile', () => {
	it('returns only the six whitelisted fields', async () => {
		const res = await asUser('/api/profile');

		expect(res.status).toBe(200);
		const body = (await res.json()) as Record<string, unknown>;

		// Never the password hash, is_admin, or the verification timestamps.
		expect(Object.keys(body).sort()).toEqual([
			'avatar_url',
			'email',
			'first_name',
			'last_name',
			'username',
			'website',
		]);
	});

	it('requires an email on update', async () => {
		const res = await asUser('/api/profile', {
			method: 'PUT',
			body: JSON.stringify({ first_name: 'No email' }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.email).toBeTruthy();
	});

	it('rejects an email already taken by another user', async () => {
		const [other] = await db()
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, otherUserId));

		const res = await asUser('/api/profile', {
			method: 'PUT',
			body: JSON.stringify({ email: other!.email }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.email).toEqual(['The email has already been taken.']);
	});

	it('clears verification when the email actually changes', async () => {
		const fresh = `changed-${Math.random().toString(36).slice(2, 10)}@example.com`;

		await db()
			.update(users)
			.set({ emailVerifiedAt: new Date(), emailVerified: true })
			.where(eq(users.id, userId));

		const res = await asUser('/api/profile', {
			method: 'PUT',
			body: JSON.stringify({ email: fresh }),
		});

		expect(res.status).toBe(200);

		const [row] = await db()
			.select({ verifiedAt: users.emailVerifiedAt })
			.from(users)
			.where(eq(users.id, userId));

		expect(row!.verifiedAt).toBeNull();
	});

	it('keeps verification when the email is resubmitted unchanged', async () => {
		const [before] = await db()
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, userId));

		await db()
			.update(users)
			.set({ emailVerifiedAt: new Date(), emailVerified: true })
			.where(eq(users.id, userId));

		await asUser('/api/profile', {
			method: 'PUT',
			body: JSON.stringify({ email: before!.email, first_name: 'Same email' }),
		});

		const [row] = await db()
			.select({ verifiedAt: users.emailVerifiedAt })
			.from(users)
			.where(eq(users.id, userId));

		// Re-submitting the same address must not silently unverify the account.
		expect(row!.verifiedAt).not.toBeNull();
	});
});

describe('notifications', () => {
	let mine = 0;
	let theirs = 0;

	beforeAll(async () => {
		const now = new Date();

		const [a] = await db()
			.insert(notifications)
			.values({ userId, title: 'Mine', message: 'x', createdAt: now, updatedAt: now } as never)
			.returning();
		mine = Number(a!.id);

		const [b] = await db()
			.insert(notifications)
			.values({
				userId: otherUserId,
				title: 'Theirs',
				message: 'x',
				createdAt: now,
				updatedAt: now,
			} as never)
			.returning();
		theirs = Number(b!.id);
	});

	it('lists only the current user notifications', async () => {
		const res = await asUser('/api/notifications');
		const rows = (await res.json()) as { id: number }[];

		expect(rows.map((r) => r.id)).toContain(mine);
		expect(rows.map((r) => r.id)).not.toContain(theirs);
	});

	it('does not leak another user notification', async () => {
		expect((await asUser(`/api/notifications/${theirs}`)).status).toBe(403);
	});

	it('marks one as read', async () => {
		const res = await asUser(`/api/notifications/${mine}/read`, { method: 'POST' });

		expect(res.status).toBe(200);
		expect(((await res.json()) as { read_at: string | null }).read_at).not.toBeNull();
	});

	it('resolves read-all as a literal path, not an id', async () => {
		// Registration order matters: /read-all must be matched before /:id.
		const res = await asUser('/api/notifications/read-all', { method: 'POST' });

		expect(res.status).toBe(200);
		expect((await res.json()) as { message: string }).toEqual({
			message: 'All notifications marked as read.',
		});
	});
});

describe('devices', () => {
	const pushToken = `ExponentPushToken[${Math.random().toString(36).slice(2, 12)}]`;

	it('registers a device and wraps it in { device }', async () => {
		const res = await asUser('/api/devices', {
			method: 'POST',
			body: JSON.stringify({ push_token: pushToken, device_type: 'ios', device_name: 'Phone' }),
		});

		expect(res.status, await res.clone().text()).toBe(201);
		const body = (await res.json()) as { device: Record<string, unknown>; message: string };

		expect(body.device.push_token).toBe(pushToken);
		expect(body.message).toBe('Device registered successfully.');
	});

	it('updates rather than duplicating a token the caller already owns', async () => {
		const res = await asUser('/api/devices', {
			method: 'POST',
			body: JSON.stringify({ push_token: pushToken, device_type: 'android' }),
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as { device: Record<string, unknown>; message: string };

		expect(body.device.device_type).toBe('android');
		// Distinct from the registration message; the client shows it.
		expect(body.message).toBe('Device updated successfully.');
	});

	it('rejects an invalid device type', async () => {
		const res = await asUser('/api/devices', {
			method: 'POST',
			body: JSON.stringify({ push_token: 'ExponentPushToken[x]', device_type: 'blackberry' }),
		});

		expect(res.status).toBe(422);
	});

	it('lists devices wrapped in { devices }', async () => {
		const res = await asUser('/api/devices');
		const body = (await res.json()) as { devices: unknown[] };

		expect(Array.isArray(body.devices)).toBe(true);
	});
});

describe('public endpoints', () => {
	it('serves announcements without authentication', async () => {
		const now = new Date();
		await db()
			.insert(announcements)
			.values({ title: 'Public', message: 'Hello', createdAt: now, updatedAt: now } as never);

		const res = await app.request('/api/announcements');

		expect(res.status).toBe(200);
		expect(Array.isArray(await res.json())).toBe(true);
	});

	it('serves retailers wrapped in { retailers } without authentication', async () => {
		const res = await app.request('/api/retailers');

		expect(res.status).toBe(200);
		expect(Array.isArray(((await res.json()) as { retailers: unknown[] }).retailers)).toBe(true);
	});

	it('accepts an anonymous bug report', async () => {
		const res = await app.request('/api/bug-reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				subject: 'Anonymous',
				description: 'Something broke',
				page_url: '/estimates',
			}),
		});

		expect(res.status, await res.clone().text()).toBe(201);
		const body = (await res.json()) as { bug_report: { user_id: number | null } };
		expect(body.bug_report.user_id).toBeNull();
	});

	it('attributes a bug report to the signed-in user', async () => {
		const res = await asUser('/api/bug-reports', {
			method: 'POST',
			body: JSON.stringify({ subject: 'Signed in', description: 'x', page_url: '/watch' }),
		});

		const body = (await res.json()) as { bug_report: { user_id: number | null } };
		expect(body.bug_report.user_id).toBe(userId);
	});

	it('rejects a bug report missing required fields', async () => {
		const res = await app.request('/api/bug-reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ subject: 'Only a subject' }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(Object.keys(body.errors).sort()).toEqual(['description', 'page_url']);
	});
});

describe('dashboard', () => {
	it('returns counts and recent records in the expected shape', async () => {
		const res = await asUser('/api/dashboard/stats');

		expect(res.status).toBe(200);
		const body = (await res.json()) as Record<string, unknown>;

		expect(Object.keys(body).sort()).toEqual([
			'finance_sheets_count',
			'lease_sheets_count',
			'mortgage_sheets_count',
			'recent_finance_sheets',
			'recent_lease_sheets',
			'recent_mortgage_sheets',
			'recent_tracked_products',
			'tracked_products_count',
		]);
		expect(typeof body.finance_sheets_count).toBe('number');
	});

	it('caps the recent lists at three', async () => {
		for (let i = 0; i < 5; i++) {
			await asUser('/api/vehicle-finance-sheets', {
				method: 'POST',
				body: JSON.stringify({ sheet_name: `Sheet ${i}` }),
			});
		}

		const body = (await (await asUser('/api/dashboard/stats')).json()) as {
			finance_sheets_count: number;
			recent_finance_sheets: unknown[];
		};

		expect(body.finance_sheets_count).toBeGreaterThanOrEqual(5);
		expect(body.recent_finance_sheets).toHaveLength(3);
	});
});

describe('routing', () => {
	it('answers 404 for an unknown /api path, not 401', async () => {
		// Regression: mounting a router at /api with a wildcard requireAuth made
		// every unmatched /api/* request answer 401 before the 404 handler ran.
		// Wrong, and confusing to debug from a client.
		const res = await app.request('/api/does-not-exist');

		expect(res.status).toBe(404);
		expect((await res.json()) as { message: string }).toHaveProperty('message');
	});

	it('still answers 401 for a real authenticated route', async () => {
		expect((await app.request('/api/dashboard/stats')).status).toBe(401);
	});
});

describe('admin gate', () => {
	it('refuses a non-admin user', async () => {
		for (const path of ['/api/admin/retailers', '/api/admin/users', '/api/admin/bug-reports']) {
			const res = await asUser(path);
			expect(res.status, path).toBe(403);
		}
	});

	it('refuses an anonymous request', async () => {
		expect((await app.request('/api/admin/retailers')).status).toBe(401);
	});

	it('allows an admin', async () => {
		const res = await asAdmin('/api/admin/retailers');

		expect(res.status).toBe(200);
		expect(Array.isArray(((await res.json()) as { retailers: unknown[] }).retailers)).toBe(true);
	});
});

describe('admin retailers', () => {
	it('exposes credentials to admins but never to unauthenticated or ordinary callers', async () => {
		const suffix = Math.random().toString(36).slice(2, 10);
		const now = new Date();

		await db()
			.insert(retailers)
			.values({
				name: `Secret Retailer ${suffix}`,
				slug: `secret-${suffix}`,
				apiBaseUrl: 'https://example.test',
				apiKey: 'super-secret-key',
				createdAt: now,
				updatedAt: now,
			} as never);

		const adminBody = (await (await asAdmin('/api/admin/retailers')).json()) as {
			retailers: Record<string, unknown>[];
		};
		const adminRow = adminBody.retailers.find((r) => r.slug === `secret-${suffix}`);
		expect(adminRow?.api_key).toBe('super-secret-key');

		const publicBody = (await (await app.request('/api/retailers')).json()) as {
			retailers: Record<string, unknown>[];
		};
		const publicRow = publicBody.retailers.find((r) => r.slug === `secret-${suffix}`);

		// The row is returned - the client needs the name and logo - but the
		// columns the model kept in $hidden must not be.
		expect(publicRow).toBeTruthy();
		for (const secret of ['api_key', 'api_base_url', 'api_config', 'rate_limit_per_hour']) {
			expect(publicRow, secret).not.toHaveProperty(secret);
		}
	});

	it('does not leak retailer credentials through the watch list', async () => {
		// The watch index and the dashboard both embed a retailer, and both are
		// reachable by any signed-in user.
		const body = (await (await asUser('/api/watch')).json()) as {
			retailers: Record<string, unknown>[];
		};

		for (const row of body.retailers) {
			expect(row).not.toHaveProperty('api_key');
			expect(row).not.toHaveProperty('api_base_url');
		}
	});

	it('rejects a slug with no registered client', async () => {
		const res = await asAdmin('/api/admin/retailers', {
			method: 'POST',
			body: JSON.stringify({
				name: `Nope ${Math.random()}`,
				slug: 'walmart',
				api_base_url: 'https://example.test',
			}),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.slug?.[0]).toContain('No service class is registered');
	});

	it('lists registered and available slugs', async () => {
		const res = await asAdmin('/api/admin/retailers/available-slugs');
		const body = (await res.json()) as { registered: string[]; available: string[] };

		expect(body.registered).toContain('bestbuy');
		expect(body.registered).toContain('homedepot');
	});
});

describe('admin users', () => {
	it('paginates in the Laravel envelope and never returns a password hash', async () => {
		const res = await asAdmin('/api/admin/users');

		expect(res.status).toBe(200);
		const body = (await res.json()) as { users: Record<string, unknown> };

		expect(body.users).toHaveProperty('current_page');
		expect(body.users).toHaveProperty('last_page');
		expect(body.users).toHaveProperty('total');
		expect(Array.isArray(body.users.data)).toBe(true);

		for (const row of body.users.data as Record<string, unknown>[]) {
			expect(row).not.toHaveProperty('password');
		}
	});

	it('refuses to let an admin remove their own admin access', async () => {
		const me = (await (await asAdmin('/api/admin/users')).json()) as {
			users: { data: { id: number; is_admin: boolean }[] };
		};
		const self = me.users.data.find((u) => u.is_admin);

		const res = await asAdmin(`/api/admin/users/${self!.id}`, {
			method: 'PATCH',
			body: JSON.stringify({ is_admin: false }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.is_admin).toEqual(['You cannot remove your own admin access.']);
	});

	it('can promote another user', async () => {
		const res = await asAdmin(`/api/admin/users/${otherUserId}`, {
			method: 'PATCH',
			body: JSON.stringify({ is_admin: true }),
		});

		expect(res.status).toBe(200);
		expect(((await res.json()) as { user: { is_admin: boolean } }).user.is_admin).toBe(true);
	});
});
