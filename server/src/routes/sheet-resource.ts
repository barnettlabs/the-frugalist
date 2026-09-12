import { HttpError } from '@frugalist/contracts';
import { desc, eq } from 'drizzle-orm';
import { Hono, type Context } from 'hono';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { z, type ZodRawShape } from 'zod';

import { db } from '../db/client.js';
import { serializeRow, serializeRows } from '../db/serialize.js';
import type { AppEnv } from '../http/app.js';
import { currentUser, requireAuth } from '../http/auth-middleware.js';
import { findOwned, parseId } from '../http/ownership.js';
import { validate, validated } from '../http/validate.js';

/**
 * The shared CRUD resource for the three estimate sheets.
 *
 * Finance, lease and mortgage were three near-identical Laravel controllers
 * differing only in their validation rules, so they are one factory here rather
 * than three transcriptions - the ownership handling and response shaping are
 * the parts most worth having in exactly one place.
 *
 * Every id-addressed route resolves through findOwned(), which makes the lookup
 * and the ownership check a single operation. Cross-user access answers 403,
 * matching the Laravel controllers and their tests.
 *
 * `user_id` is never read from the request body. That was a live
 * mass-assignment hole in the Laravel version - fill($request->all()) ran after
 * ownership was assigned, so a supplied user_id overwrote it and let callers
 * create records in other accounts. Ownership here comes only from the session.
 */

const IMMUTABLE_KEYS = new Set(['user_id', 'id', 'created_at', 'updated_at']);

export type SheetResourceOptions<T extends PgTable> = {
	table: T;
	idColumn: PgColumn;
	userIdColumn: PgColumn;
	createdAtColumn: PgColumn;
	/** Rules transcribed from the Laravel controller. */
	shape: ZodRawShape;
	/**
	 * Fields in $fillable that carried no validation rule.
	 *
	 * Laravel's fill() accepted anything fillable, so these were settable but
	 * unchecked - vehicle_year, vehicle_make, notes and friends. They are
	 * accepted here too, as loose strings, because the clients do send them. This
	 * is why the schema cannot simply be the rule list.
	 */
	passthroughStringFields?: readonly string[];
};

function snakeToCamel(key: string): string {
	return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function createSheetResource<T extends PgTable>(options: SheetResourceOptions<T>) {
	const passthrough = Object.fromEntries(
		(options.passthroughStringFields ?? []).map((field) => [
			field,
			z.union([z.string(), z.number(), z.null()]).optional(),
		]),
	);

	const schema = z.object({ ...options.shape, ...passthrough });
	type SheetInput = z.infer<typeof schema>;

	/** Only the keys the request sent, so a PUT does not blank omitted columns. */
	function presentFields(data: SheetInput): Record<string, unknown> {
		const out: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
			if (value === undefined) continue;
			if (IMMUTABLE_KEYS.has(key)) continue;
			out[snakeToCamel(key)] = value;
		}

		return out;
	}

	const routes = new Hono<AppEnv>();

	routes.use('*', requireAuth);

	routes.get('/', async (c) => {
		const user = currentUser(c);

		const rows = await db()
			.select()
			.from(options.table as PgTable)
			.where(eq(options.userIdColumn, user.id))
			.orderBy(desc(options.createdAtColumn), desc(options.idColumn));

		return c.json(serializeRows(rows as Record<string, unknown>[]));
	});

	routes.post('/', validate('json', schema), async (c) => {
		const user = currentUser(c);
		const data = validated<SheetInput>(c, 'json');
		const now = new Date();

		const [row] = await db()
			.insert(options.table as PgTable)
			.values({
				...presentFields(data),
				// Ownership from the session, never from the payload.
				[options.userIdColumn.name === 'user_id' ? 'userId' : options.userIdColumn.name]: user.id,
				createdAt: now,
				updatedAt: now,
			} as never)
			.returning();

		return c.json(serializeRow(row as Record<string, unknown>), 201);
	});

	const load = (c: Context<AppEnv>) =>
		findOwned(options.table, {
			id: parseId(c.req.param('id')),
			user: currentUser(c),
			idColumn: options.idColumn,
			userIdColumn: options.userIdColumn,
			onForeign: 'forbidden',
		});

	routes.get('/:id', async (c) =>
		c.json(serializeRow((await load(c as Context<AppEnv>)) as Record<string, unknown>)),
	);

	routes.put('/:id', validate('json', schema), async (c) => {
		const existing = (await load(c as unknown as Context<AppEnv>)) as Record<string, unknown>;
		const data = validated<SheetInput>(c, 'json');

		const [row] = await db()
			.update(options.table as PgTable)
			.set({ ...presentFields(data), updatedAt: new Date() } as never)
			.where(eq(options.idColumn, existing.id as number))
			.returning();

		if (!row) throw HttpError.notFound();

		return c.json(serializeRow(row as Record<string, unknown>));
	});

	routes.delete('/:id', async (c) => {
		const existing = (await load(c as Context<AppEnv>)) as Record<string, unknown>;

		await db()
			.delete(options.table as PgTable)
			.where(eq(options.idColumn, existing.id as number));

		return c.json({ message: 'Sheet deleted successfully' });
	});

	return routes;
}
