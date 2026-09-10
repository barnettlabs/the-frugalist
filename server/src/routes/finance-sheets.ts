import { HttpError } from '@frugalist/contracts';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/client.js';
import { vehicleFinanceSheets } from '../db/schema.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { findOwned, parseId } from '../http/ownership.js';
import { laravelRules as r } from '../http/rules.js';
import { validate, validated } from '../http/validate.js';

/**
 * Vehicle finance sheets - the reference implementation for the CRUD surface.
 *
 * Every user-owned resource follows this shape, so the remaining controllers
 * are a transcription of their validation rules rather than a design exercise:
 *
 *   - requireAuth on the group, never per-handler, so a new route cannot be
 *     added without authentication by omission.
 *   - findOwned() for anything addressed by id. The lookup and the ownership
 *     check are one operation; see http/ownership.ts for why that matters.
 *   - Validation rules transcribed from the Laravel controller, including the
 *     bounds, so the 422 bodies stay identical.
 *
 * Cross-user access answers 403 here rather than 404 because that is what the
 * Laravel controller did and what its test asserts.
 *
 * Responses go through serializeRow so the body keeps Laravel's snake_case
 * shape. Drizzle's properties are camelCase and both clients type against
 * snake_case, so returning rows directly would break every consumer.
 */

const VEHICLE_TYPES = ['CAR', 'TRUCK', 'SUV'] as const;

// Transcribed from VehicleFinanceSheetController. The bounds are part of the
// contract - min:0 on money, 0-100 on percentages, 1-120 on the term.
const sheetSchema = z.object({
	sheet_name: r.nullableString('sheet name', 255),
	sales_consultant: r.nullableString('sales consultant', 255),
	dealership_name: r.nullableString('dealership name', 255),
	vehicle_type: r.nullableEnum('vehicle type', VEHICLE_TYPES),
	shareable_key: r.nullableString('shareable key', 255),
	msrp: r.nullableNumeric('msrp', { min: 0 }),
	fees: r.nullableNumeric('fees', { min: 0 }),
	discounts: r.nullableNumeric('discounts', { min: 0 }),
	rebates: r.nullableNumeric('rebates', { min: 0 }),
	down_payment: r.nullableNumeric('down payment', { min: 0 }),
	sales_tax_percent: r.nullableNumeric('sales tax percent', { min: 0, max: 100 }),
	interest_rate: r.nullableNumeric('interest rate', { min: 0, max: 100 }),
	finance_term: r.nullableInteger('finance term', { min: 1, max: 120 }),
	start_date: r.nullableDate('start date'),
	contact_email: r.nullableEmail('contact email', 255),
	contact_phone: r.nullableString('contact phone', 255),
	extra_payments_json: r.nullableString('extra payments json'),
});

type SheetInput = z.infer<typeof sheetSchema>;

/**
 * Only the keys the request actually sent, so a PUT does not blank omitted
 * columns - Laravel's `fill($request->all())` had the same property.
 *
 * The API speaks snake_case (it is Laravel's contract, and both clients depend
 * on it) while Drizzle's model properties are camelCase, so the keys are
 * translated here rather than duplicating the field list.
 */
function presentFields(data: SheetInput): Partial<typeof vehicleFinanceSheets.$inferInsert> {
	const out: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(data)) {
		if (value === undefined) continue;
		out[snakeToCamel(key)] = value;
	}

	return out as Partial<typeof vehicleFinanceSheets.$inferInsert>;
}

function snakeToCamel(key: string): string {
	return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export const financeSheetRoutes = new Hono<AppEnv>();

financeSheetRoutes.use('*', requireAuth);

financeSheetRoutes.get('/', async (c) => {
	const user = currentUser(c);

	const rows = await db()
		.select()
		.from(vehicleFinanceSheets)
		.where(eq(vehicleFinanceSheets.userId, user.id))
		.orderBy(desc(vehicleFinanceSheets.createdAt), desc(vehicleFinanceSheets.id));

	return c.json(serializeRows(rows));
});

financeSheetRoutes.post('/', validate('json', sheetSchema), async (c) => {
	const user = currentUser(c);
	const data = validated<SheetInput>(c, 'json');

	const [row] = await db()
		.insert(vehicleFinanceSheets)
		.values({
			...presentFields(data),
			userId: user.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as typeof vehicleFinanceSheets.$inferInsert)
		.returning();

	return c.json(serializeRow(row!), 201);
});

financeSheetRoutes.get('/:id', async (c) => {
	const row = await findOwned(vehicleFinanceSheets, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: vehicleFinanceSheets.id,
		userIdColumn: vehicleFinanceSheets.userId,
		onForeign: 'forbidden',
	});

	return c.json(serializeRow(row));
});

financeSheetRoutes.put('/:id', validate('json', sheetSchema), async (c) => {
	const existing = await findOwned(vehicleFinanceSheets, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: vehicleFinanceSheets.id,
		userIdColumn: vehicleFinanceSheets.userId,
		onForeign: 'forbidden',
	});

	const data = validated<SheetInput>(c, 'json');

	const [row] = await db()
		.update(vehicleFinanceSheets)
		.set({ ...presentFields(data), updatedAt: new Date() })
		.where(eq(vehicleFinanceSheets.id, existing.id))
		.returning();

	if (!row) throw HttpError.notFound();

	return c.json(serializeRow(row));
});

financeSheetRoutes.delete('/:id', async (c) => {
	const existing = await findOwned(vehicleFinanceSheets, {
		id: parseId(c.req.param('id')),
		user: currentUser(c),
		idColumn: vehicleFinanceSheets.id,
		userIdColumn: vehicleFinanceSheets.userId,
		onForeign: 'forbidden',
	});

	await db().delete(vehicleFinanceSheets).where(eq(vehicleFinanceSheets.id, existing.id));

	return c.json({ message: 'Sheet deleted successfully' });
});
