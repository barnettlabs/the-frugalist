import { describe, expect, it } from 'vitest';

import { camelToSnake, serializeRow, serializeRows, toLaravelDate } from './serialize.js';

describe('camelToSnake', () => {
	it('converts Drizzle property names to the column names clients expect', () => {
		expect(camelToSnake('userId')).toBe('user_id');
		expect(camelToSnake('salesTaxPercent')).toBe('sales_tax_percent');
		expect(camelToSnake('id')).toBe('id');
		expect(camelToSnake('extraPaymentsJson')).toBe('extra_payments_json');
	});
});

describe('toLaravelDate', () => {
	it('emits six fractional digits, as Laravel does', () => {
		// Laravel: 2026-09-10T08:43:58.000000Z - JavaScript would give three.
		expect(toLaravelDate(new Date('2026-09-10T08:43:58.000Z'))).toBe(
			'2026-09-10T08:43:58.000000Z',
		);
	});

	it('preserves milliseconds within the microsecond field', () => {
		expect(toLaravelDate(new Date('2026-03-15T12:30:45.123Z'))).toBe(
			'2026-03-15T12:30:45.123000Z',
		);
	});
});

describe('serializeRow', () => {
	it('produces the Laravel record shape', () => {
		const row = {
			id: 23,
			userId: 70,
			sheetName: 'Shape Probe',
			salesConsultant: null,
			msrp: 52000,
			interestRate: 6.25,
			startDate: new Date('2026-03-15T00:00:00.000Z'),
			createdAt: new Date('2026-09-10T08:43:58.000Z'),
		};

		expect(serializeRow(row)).toEqual({
			id: 23,
			user_id: 70,
			sheet_name: 'Shape Probe',
			sales_consultant: null,
			msrp: 52000,
			interest_rate: 6.25,
			start_date: '2026-03-15T00:00:00.000000Z',
			created_at: '2026-09-10T08:43:58.000000Z',
		});
	});

	it('normalises undefined to null, since JSON has no undefined', () => {
		expect(serializeRow({ a: undefined })).toEqual({ a: null });
	});

	it('maps arrays of rows', () => {
		expect(serializeRows([{ userId: 1 }, { userId: 2 }])).toEqual([
			{ user_id: 1 },
			{ user_id: 2 },
		]);
	});
});
