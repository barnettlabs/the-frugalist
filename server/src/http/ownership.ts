import { HttpError } from '@frugalist/contracts';
import { and, eq, getTableColumns, isNull, type SQL } from 'drizzle-orm';
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
 * `onForeign` controls what a record owned by someone else returns. 404 is the
 * safer default - it does not confirm that an id exists - but several existing
 * controllers answer 403 and their tests assert it, so those routes pass
 * 'forbidden' to keep the contract they already have. Preserving observable
 * behaviour matters more here than tidying it; the 403-vs-404 question is worth
 * revisiting once nothing depends on the old answer.
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
		/** What to answer when the record exists but belongs to someone else. */
		onForeign?: 'notFound' | 'forbidden';
	},
): Promise<T['$inferSelect']> {
	const base: SQL[] = [eq(options.idColumn, options.id)];

	if (options.deletedAtColumn) {
		base.push(isNull(options.deletedAtColumn));
	}

	const [row] = await db()
		.select()
		.from(table as PgTable)
		.where(and(...base))
		.limit(1);

	if (!row) throw HttpError.notFound();

	// The row is keyed by Drizzle's property names (camelCase), not by the
	// underlying column names (snake_case), so resolve the property that maps to
	// the given column rather than assuming they match.
	const columns = getTableColumns(table as PgTable) as Record<string, PgColumn>;
	const ownerKey = Object.keys(columns).find((key) => columns[key] === options.userIdColumn);

	if (!ownerKey) {
		throw new Error('findOwned: userIdColumn does not belong to the given table');
	}

	const ownerId = (row as Record<string, unknown>)[ownerKey];

	if (Number(ownerId) !== options.user.id) {
		throw options.onForeign === 'forbidden'
			? new HttpError(403, 'Unauthorized')
			: HttpError.notFound();
	}

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
