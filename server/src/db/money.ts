import { fromNumericColumn, toNumericColumn } from '@frugalist/contracts';

/**
 * Money at the database boundary.
 *
 * The schema is inconsistent, inherited from the Laravel app:
 *
 *   - vehicle_finance_sheets, vehicle_lease_sheets, mortgage_sheets store money
 *     as `double precision`, and the calculators do float arithmetic on it.
 *   - tracked_products, price_history, price_alerts store `numeric(10,2)`,
 *     which Postgres serialises as a *string*.
 *
 * Both are handled here rather than at each call site, because the two failure
 * modes are quiet ones: a numeric column read as a number via implicit coercion
 * silently loses precision, and a float column formatted without rounding shows
 * a user something like $1,234.5600000000001.
 *
 * Converting the float columns to numeric is worth doing - but as its own
 * change, after the migration. Doing it now would mean Laravel and the Hono
 * service disagreed about the column type while both were live, and every
 * calculator parity failure would have two possible causes instead of one.
 */

/** A `numeric` column arriving from Postgres as a string. */
export const readMoney = fromNumericColumn;

/** A number going back into a `numeric` column. */
export const writeMoney = toNumericColumn;

/** A `double precision` column. Already a JS number; guard against null/NaN. */
export function readFloatMoney(value: number | null | undefined): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Map every listed key of a row through a reader, leaving other keys untouched. */
export function mapMoneyFields<T extends Record<string, unknown>, K extends keyof T>(
	row: T,
	keys: readonly K[],
	read: (v: never) => number = readMoney as never,
): T & Record<K, number> {
	const out = { ...row } as T & Record<K, number>;
	for (const key of keys) {
		out[key] = read(row[key] as never) as never;
	}
	return out;
}
