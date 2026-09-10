import {
	type CalendarDate,
	fromDate,
	getLocalTimeZone,
	parseAbsolute,
	toCalendarDate,
	toTimeZone,
	type ZonedDateTime,
} from '@internationalized/date';

/**
 * Time handling, shared by the API and both clients.
 *
 * The Laravel app runs with `'timezone' => 'UTC'` in config/app.php, so `now()`
 * has always returned UTC and every timestamp in the database is UTC. That is
 * the good case: the PHP/JavaScript divergence that usually bites a migration
 * like this does not apply, because there is no application timezone offset to
 * reproduce.
 *
 * The rule this module enforces is therefore simple and worth stating once:
 *
 *   Store and compare in UTC. Convert to a local zone only for display.
 *
 * `@internationalized/date` is the shared library because it works unchanged in
 * Node, the browser and React Native, its types are immutable, and it makes the
 * zone explicit at every conversion instead of leaving it implicit the way
 * `Date` does.
 */

export const APP_TIME_ZONE = 'UTC';

/** Current instant, in the application zone. */
export function nowUtc(): ZonedDateTime {
	return fromDate(new Date(), APP_TIME_ZONE);
}

/** Parse an ISO-8601 timestamp from the API or database into the app zone. */
export function parseUtc(iso: string): ZonedDateTime {
	// Postgres `timestamp` (no zone) serialises without an offset. It is UTC by
	// construction here, so say so rather than letting the parser guess.
	const normalised = /(?:Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso.replace(' ', 'T')}Z`;
	return parseAbsolute(normalised, APP_TIME_ZONE);
}

export function toIsoUtc(value: ZonedDateTime | Date): string {
	const date = value instanceof Date ? value : value.toDate();
	return date.toISOString();
}

/** Same instant, expressed in the viewer's zone, for display only. */
export function toViewerZone(value: ZonedDateTime, timeZone: string = getLocalTimeZone()) {
	return toTimeZone(value, timeZone);
}

export function toCalendarDateInZone(
	value: ZonedDateTime,
	timeZone: string = getLocalTimeZone(),
): CalendarDate {
	return toCalendarDate(toTimeZone(value, timeZone));
}

export function isBefore(a: ZonedDateTime | Date, b: ZonedDateTime | Date): boolean {
	const left = a instanceof Date ? a.getTime() : a.toDate().getTime();
	const right = b instanceof Date ? b.getTime() : b.toDate().getTime();
	return left < right;
}

export function isAfter(a: ZonedDateTime | Date, b: ZonedDateTime | Date): boolean {
	return isBefore(b, a);
}

export function addMinutes(value: ZonedDateTime, minutes: number): ZonedDateTime {
	return value.add({ minutes });
}

/**
 * Whether a tracking window is currently open.
 *
 * Ports the pair of conditions in CheckProductPrices: start date reached, and
 * either no end date or an end date not yet passed.
 */
export function isWithinTrackingWindow(
	start: Date | string,
	end: Date | string | null | undefined,
	at: Date = new Date(),
): boolean {
	const startMs = typeof start === 'string' ? parseUtc(start).toDate().getTime() : start.getTime();
	if (startMs > at.getTime()) return false;

	if (end === null || end === undefined) return true;

	const endMs = typeof end === 'string' ? parseUtc(end).toDate().getTime() : end.getTime();
	return endMs >= at.getTime();
}

/**
 * Whether a product is due for a price check.
 *
 * The Laravel scope expressed this as MySQL-specific raw SQL:
 *
 *     last_checked_at IS NULL
 *     OR last_checked_at < DATE_SUB(NOW(), INTERVAL check_interval MINUTE)
 *
 * `DATE_SUB(..., INTERVAL n MINUTE)` does not exist in Postgres, so the query
 * builder version is rewritten in the repository layer. This is the same
 * predicate in application code, used for tests and for any in-memory filtering.
 */
export function isDueForCheck(
	lastCheckedAt: Date | string | null | undefined,
	checkIntervalMinutes: number,
	at: Date = new Date(),
): boolean {
	if (lastCheckedAt === null || lastCheckedAt === undefined) return true;

	const lastMs =
		typeof lastCheckedAt === 'string'
			? parseUtc(lastCheckedAt).toDate().getTime()
			: lastCheckedAt.getTime();

	return lastMs < at.getTime() - checkIntervalMinutes * 60_000;
}

const DATE_TIME = new Intl.DateTimeFormat('en-US', {
	dateStyle: 'medium',
	timeStyle: 'short',
});

const DATE_ONLY = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });

export function formatDateTime(value: Date | string, timeZone: string = getLocalTimeZone()): string {
	const date = typeof value === 'string' ? parseUtc(value).toDate() : value;
	return new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone,
	}).format(date);
}

export function formatDate(value: Date | string, timeZone: string = getLocalTimeZone()): string {
	const date = typeof value === 'string' ? parseUtc(value).toDate() : value;
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone }).format(date);
}

export { DATE_ONLY, DATE_TIME, getLocalTimeZone };
export type { CalendarDate, ZonedDateTime };
