import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';

import { db } from '../db/client.js';
import { vehicleFinanceSheets } from '../db/schema.js';
import { createApp } from '../http/app.js';
import { createLegacyUser, createPlainUser, signIn } from '../test/factories.js';

/**
 * CRUD and, more importantly, ownership.
 *
 * The access-control cases are the point of this file. Laravel enforced them
 * across two places - route model binding resolved the record, the controller
 * checked the owner - so a controller that forgot its half would serve another
 * user's row. These assert the guarantee directly.
 */

const app = createApp();

let token = '';
let userId = 0;
let otherUserId = 0;
let foreignSheetId = 0;

const authed = (path: string, init: RequestInit = {}) =>
	app.request(path, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...(init.headers ?? {}),
		},
	});

beforeAll(async () => {
	const user = await createLegacyUser();
	userId = user.id;
	token = await signIn(app, user);

	// A second user with a sheet, to prove it stays invisible.
	const other = await createPlainUser();
	otherUserId = other.id;

	const [foreign] = await db()
		.insert(vehicleFinanceSheets)
		.values({
			userId: otherUserId,
			sheetName: 'Not yours',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as typeof vehicleFinanceSheets.$inferInsert)
		.returning();

	foreignSheetId = Number(foreign!.id);
});

describe('authentication', () => {
	it('rejects an anonymous request with Unauthenticated', async () => {
		const res = await app.request('/api/vehicle-finance-sheets');

		expect(res.status).toBe(401);
		expect((await res.json()) as { message: string }).toEqual({ message: 'Unauthenticated.' });
	});
});

describe('create and read', () => {
	let createdId = 0;

	it('serialises timestamps the way Laravel did', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({ sheet_name: 'Timestamps', start_date: '2026-03-15' }),
		});
		const body = (await res.json()) as Record<string, string>;

		// Laravel emits six fractional digits; JavaScript's toISOString gives three.
		expect(body.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/);
		// A date-only input is anchored at UTC midnight, not the host's midnight.
		expect(body.start_date).toBe('2026-03-15T00:00:00.000000Z');
	});

	it('creates a sheet and returns 201', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({
				sheet_name: 'My Truck',
				vehicle_type: 'TRUCK',
				msrp: 52000,
				finance_term: 72,
				interest_rate: 6.25,
			}),
		});

		expect(res.status, await res.clone().text()).toBe(201);
		const body = (await res.json()) as Record<string, unknown>;
		createdId = Number(body.id);

		// snake_case, matching what web/src/types/models.ts declares.
		expect(body.sheet_name).toBe('My Truck');
		expect(body.user_id).toBe(userId);
		expect(Number(body.msrp)).toBe(52000);
		expect(body).not.toHaveProperty('sheetName');
	});

	it('lists only the current user sheets', async () => {
		const res = await authed('/api/vehicle-finance-sheets');
		const rows = (await res.json()) as { id: unknown }[];

		expect(res.status).toBe(200);
		expect(rows.map((r) => Number(r.id))).toContain(createdId);
		expect(rows.map((r) => Number(r.id))).not.toContain(foreignSheetId);
	});

	it('reads its own sheet', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${createdId}`);
		expect(res.status).toBe(200);
	});

	it('updates only the fields provided', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${createdId}`, {
			method: 'PUT',
			body: JSON.stringify({ sheet_name: 'Renamed' }),
		});

		expect(res.status).toBe(200);
		const body = (await res.json()) as Record<string, unknown>;

		expect(body.sheet_name).toBe('Renamed');
		// msrp was not sent, so it must survive rather than being blanked.
		expect(Number(body.msrp)).toBe(52000);
	});

	it('deletes its own sheet', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${createdId}`, { method: 'DELETE' });

		expect(res.status).toBe(200);
		expect((await res.json()) as { message: string }).toEqual({
			message: 'Sheet deleted successfully',
		});

		const rows = await db()
			.select()
			.from(vehicleFinanceSheets)
			.where(eq(vehicleFinanceSheets.id, createdId));
		expect(rows).toHaveLength(0);
	});
});

describe('ownership', () => {
	it('cannot read another user sheet', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${foreignSheetId}`);
		expect(res.status).toBe(403);
	});

	it('cannot update another user sheet', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${foreignSheetId}`, {
			method: 'PUT',
			body: JSON.stringify({ sheet_name: 'Hijacked' }),
		});

		expect(res.status).toBe(403);

		const [row] = await db()
			.select()
			.from(vehicleFinanceSheets)
			.where(eq(vehicleFinanceSheets.id, foreignSheetId));
		expect(row?.sheetName).toBe('Not yours');
	});

	it('cannot delete another user sheet', async () => {
		const res = await authed(`/api/vehicle-finance-sheets/${foreignSheetId}`, {
			method: 'DELETE',
		});

		expect(res.status).toBe(403);

		const rows = await db()
			.select()
			.from(vehicleFinanceSheets)
			.where(eq(vehicleFinanceSheets.id, foreignSheetId));
		expect(rows).toHaveLength(1);
	});

	it('returns 404 for an id that does not exist', async () => {
		const res = await authed('/api/vehicle-finance-sheets/99999999');
		expect(res.status).toBe(404);
	});

	it('returns 404 for a non-numeric id instead of a database error', async () => {
		// Laravel's implicit binding rejected these before the controller ran.
		const res = await authed('/api/vehicle-finance-sheets/abc');
		expect(res.status).toBe(404);
	});
});

describe('validation', () => {
	it('rejects an out-of-range term with Laravel wording', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({ finance_term: 500 }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.finance_term).toEqual([
			'The finance term field must not be greater than 120.',
		]);
	});

	it('rejects a negative amount', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({ msrp: -100 }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.msrp).toEqual(['The msrp field must be at least 0.']);
	});

	it('rejects an invalid vehicle type', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({ vehicle_type: 'BOAT' }),
		});

		expect(res.status).toBe(422);
		const body = (await res.json()) as { errors: Record<string, string[]> };
		expect(body.errors.vehicle_type).toEqual(['The selected vehicle type is invalid.']);
	});

	it('rejects a malformed email', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({ contact_email: 'nope' }),
		});

		expect(res.status).toBe(422);
	});

	it('accepts an empty payload, as the Laravel rules were all nullable', async () => {
		const res = await authed('/api/vehicle-finance-sheets', {
			method: 'POST',
			body: JSON.stringify({}),
		});

		expect(res.status).toBe(201);
	});
});
