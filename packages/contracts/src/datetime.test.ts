import { describe, expect, it } from 'vitest';
import { isDueForCheck, isWithinTrackingWindow, parseUtc, toIsoUtc } from './datetime.js';

describe('parseUtc', () => {
	it('treats a zone-less timestamp as UTC', () => {
		// Postgres `timestamp` serialises without an offset; every stored value is
		// UTC because config/app.php sets the Laravel timezone to UTC.
		expect(toIsoUtc(parseUtc('2026-03-15 14:30:00'))).toBe('2026-03-15T14:30:00.000Z');
	});

	it('respects an explicit offset when one is present', () => {
		expect(toIsoUtc(parseUtc('2026-03-15T14:30:00Z'))).toBe('2026-03-15T14:30:00.000Z');
		expect(toIsoUtc(parseUtc('2026-03-15T10:30:00-04:00'))).toBe('2026-03-15T14:30:00.000Z');
	});
});

describe('isWithinTrackingWindow', () => {
	const now = new Date('2026-06-15T12:00:00Z');

	it('is closed before the start date', () => {
		expect(isWithinTrackingWindow('2026-07-01 00:00:00', null, now)).toBe(false);
	});

	it('is open with no end date once started', () => {
		expect(isWithinTrackingWindow('2026-01-01 00:00:00', null, now)).toBe(true);
	});

	it('is open up to and including the end date', () => {
		expect(isWithinTrackingWindow('2026-01-01 00:00:00', '2026-06-15T12:00:00Z', now)).toBe(true);
		expect(isWithinTrackingWindow('2026-01-01 00:00:00', '2026-06-14T12:00:00Z', now)).toBe(false);
	});
});

describe('isDueForCheck', () => {
	const now = new Date('2026-06-15T12:00:00Z');

	it('is due when never checked', () => {
		expect(isDueForCheck(null, 60, now)).toBe(true);
		expect(isDueForCheck(undefined, 60, now)).toBe(true);
	});

	it('is due only after the interval has fully elapsed', () => {
		expect(isDueForCheck('2026-06-15T10:59:00Z', 60, now)).toBe(true);
		expect(isDueForCheck('2026-06-15T11:01:00Z', 60, now)).toBe(false);
	});

	it('treats the exact boundary as not yet due, matching the strict < in SQL', () => {
		expect(isDueForCheck('2026-06-15T11:00:00Z', 60, now)).toBe(false);
	});
});
