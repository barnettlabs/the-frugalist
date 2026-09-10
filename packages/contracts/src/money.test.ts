import { describe, expect, it } from 'vitest';
import { formatMoney, fromNumericColumn, num, roundToCents, toCents, toNumericColumn } from './money.js';

/**
 * `num` reproduces PHP's coercion, so these cases are written against what PHP
 * actually returns rather than what JavaScript would do naturally. The three
 * that would silently differ under a naive `Number()` are called out.
 */
describe('num - PHP coercion parity', () => {
	it('passes finite numbers through', () => {
		expect(num(42)).toBe(42);
		expect(num(-3.5)).toBe(-3.5);
		expect(num(0)).toBe(0);
	});

	it('strips currency formatting from strings', () => {
		expect(num('$42,000.00')).toBe(42000);
		expect(num('1,500')).toBe(1500);
		expect(num('7.25%')).toBe(7.25);
		expect(num('-250')).toBe(-250);
	});

	it('takes the leading numeric prefix, as PHP casts do', () => {
		expect(num('1.2.3')).toBe(1.2);
		expect(num('12-3')).toBe(12);
	});

	it('returns 0 for strings with no digits', () => {
		expect(num('')).toBe(0);
		expect(num('abc')).toBe(0);
		expect(num('-')).toBe(0);
		expect(num('$')).toBe(0);
	});

	it('treats booleans as 0 because PHP is_numeric rejects them', () => {
		// Number(true) would be 1 here and silently diverge from Laravel.
		expect(num(true)).toBe(0);
		expect(num(false)).toBe(0);
	});

	it('returns 0 for null, undefined and non-scalars', () => {
		expect(num(null)).toBe(0);
		expect(num(undefined)).toBe(0);
		expect(num({})).toBe(0);
		expect(num([])).toBe(0);
	});

	it('returns 0 for NaN and Infinity rather than propagating them', () => {
		expect(num(Number.NaN)).toBe(0);
		expect(num(Number.POSITIVE_INFINITY)).toBe(0);
	});
});

describe('roundToCents', () => {
	it('rounds half away from zero', () => {
		expect(roundToCents(1.005)).toBe(1.01);
		expect(roundToCents(2.675)).toBe(2.68);
		expect(roundToCents(-0.005)).toBe(-0.01);
	});

	it('handles the float representation cases naive rounding gets wrong', () => {
		// 1.005 * 100 is 100.49999999999999 in binary float.
		expect(roundToCents(1.005)).not.toBe(1.0);
		expect(roundToCents(1.015)).toBe(1.02);
	});

	it('leaves already-rounded values alone', () => {
		expect(roundToCents(10)).toBe(10);
		expect(roundToCents(0)).toBe(0);
	});
});

describe('cents round trip', () => {
	it('converts to integer cents without drift', () => {
		expect(toCents(19.99)).toBe(1999);
		expect(toCents(0.1 + 0.2)).toBe(30);
		expect(toCents(-5.55)).toBe(-555);
	});
});

describe('numeric column handling', () => {
	it('reads Postgres numeric strings', () => {
		expect(fromNumericColumn('1234.56')).toBe(1234.56);
		expect(fromNumericColumn(null)).toBe(0);
		expect(fromNumericColumn(undefined)).toBe(0);
	});

	it('writes fixed-precision strings', () => {
		expect(toNumericColumn(1234.5)).toBe('1234.50');
		expect(toNumericColumn(0.1 + 0.2)).toBe('0.30');
	});
});

describe('formatMoney', () => {
	it('formats USD', () => {
		expect(formatMoney(1234.5)).toBe('$1,234.50');
		expect(formatMoney(1234.5, { whole: true })).toBe('$1,235');
	});

	it('does not emit NaN to the UI', () => {
		expect(formatMoney(Number.NaN)).toBe('$0.00');
	});
});
