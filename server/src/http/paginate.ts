import { sql, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

import { db } from '../db/client.js';

/**
 * Laravel's paginator envelope.
 *
 * `->paginate(50)` returned a specific JSON shape, and the admin client types
 * against four of its keys (`data`, `current_page`, `last_page`, `total`) in
 * web/src/api/admin.ts. The remaining keys are included because they are part
 * of the shape the client received and nothing should silently disappear from a
 * response mid-migration.
 */

export type Paginated<T> = {
	current_page: number;
	data: T[];
	from: number | null;
	last_page: number;
	per_page: number;
	to: number | null;
	total: number;
};

export function pageFromQuery(raw: string | undefined): number {
	const page = Number(raw ?? 1);
	return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function paginate<T extends Record<string, unknown>>(options: {
	table: PgTable;
	where?: SQL | undefined;
	orderBy: SQL[];
	page: number;
	perPage?: number;
	/** Selected columns, when the response must not expose the whole row. */
	columns?: Record<string, PgColumn>;
}): Promise<Paginated<T>> {
	const perPage = options.perPage ?? 50;
	const offset = (options.page - 1) * perPage;

	const [countRow] = await db()
		.select({ count: sql<number>`count(*)::int` })
		.from(options.table)
		.where(options.where);

	const total = Number(countRow?.count ?? 0);

	const rows = await (options.columns
		? db().select(options.columns).from(options.table)
		: db().select().from(options.table)
	)
		.where(options.where)
		.orderBy(...options.orderBy)
		.limit(perPage)
		.offset(offset);

	const lastPage = Math.max(1, Math.ceil(total / perPage));

	return {
		current_page: options.page,
		data: rows as T[],
		from: rows.length > 0 ? offset + 1 : null,
		last_page: lastPage,
		per_page: perPage,
		to: rows.length > 0 ? offset + rows.length : null,
		total,
	};
}
