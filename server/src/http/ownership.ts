import { HttpError } from '@frugalist/contracts';
import { and, eq, isNull, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { db } from '../db/client.js';
import type { AuthUser } from './auth-middleware.js';

/**
 * Fetch a record that belongs to the current user, or 404.
 *
 * This exists because Laravel's route model binding was quietly doing security
 * work. `Route::get('/watch/{trackedProduct}')` resolved the model and 404'd if
 * it did not exist, and the controller then checked ownership separately - so
 * the guarantee was split across two places, and a controller that forgot its
 * half would happily serve another user's record.
 *
 * In Hono nothing is implicit, which is an opportunity rather than a chore: the
 * lookup and the ownership check become one operation that cannot be
 * half-performed. Every route that resolves a user-owned record goes through
 * here.
 *
 * It returns 404 rather than 403 for a record owned by someone else, matching
 * Laravel's behaviour and avoiding a probe that confirms whether an id exists.
 */
export async function findOwned<T extends PgTable>(
	table: T,
	options: {
		id: number;
		user: AuthUser;
		idColumn: PgColumn;
		userIdColumn: PgColumn;
		/** Soft-deleted rows are invisible, as Laravel's SoftDeletes scope made them. */
		deletedAtColumn?: PgColumn;
	},
): Promise<T['$inferSelect']> {
	const conditions: SQL[] = [
		eq(options.idColumn, options.id),
		eq(options.userIdColumn, options.user.id),
	];

	if (options.deletedAtColumn) {
		conditions.push(isNull(options.deletedAtColumn));
	}

	const [row] = await db()
		.select()
		.from(table as PgTable)
		.where(and(...conditions))
		.limit(1);

	if (!row) throw HttpError.notFound();

	return row as T['$inferSelect'];
}

/**
 * Parse a path parameter that must be a positive integer id.
 *
 * Laravel's implicit binding rejected non-numeric ids with a 404 before the
 * controller ran. Without this, `/watch/abc` would reach the query layer and
 * fail as a database type error - a 500 where it should be a 404.
 */
export function parseId(raw: string | undefined): number {
	if (!raw || !/^\d+$/.test(raw)) throw HttpError.notFound();

	const id = Number(raw);
	if (!Number.isSafeInteger(id) || id <= 0) throw HttpError.notFound();

	return id;
}
