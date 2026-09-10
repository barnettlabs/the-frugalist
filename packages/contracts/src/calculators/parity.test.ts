import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { computeFinance } from './finance.js';
import { computeLease } from './lease.js';
import { computeMortgage } from './mortgage.js';

/**
 * Parity against the Laravel calculators.
 *
 * fixtures/golden.json is produced by api/tools/dump-calculator-vectors.php from
 * the same fixtures/cases.json this test reads, so both implementations see
 * identical inputs. Any difference here is a porting bug - which is the entire
 * point of cutting the calculators over first: they are the one part of the
 * migration where correctness is provable rather than argued.
 *
 * Regenerate the reference after changing cases.json:
 *     php api/tools/dump-calculator-vectors.php
 */

const fixtures = (name: string) =>
	JSON.parse(readFileSync(fileURLToPath(new URL(`../../fixtures/${name}`, import.meta.url)), 'utf8'));

const cases = fixtures('cases.json') as {
	finance: { name: string; input: Record<string, unknown> }[];
	lease: { name: string; input: Record<string, unknown> }[];
	mortgage: { name: string; input: Record<string, unknown> }[];
};

const golden = fixtures('golden.json') as Record<
	string,
	{ name: string; with_schedule: unknown; without_schedule: unknown }[]
>;

/**
 * Both sides do the same float arithmetic in the same order, so results agree to
 * the last bit in almost every case. The tolerance exists only to absorb the
 * final ulp on long amortisation runs, where thousands of accumulated additions
 * can differ in the 15th significant digit purely from how each runtime rounds
 * intermediate register values. It is relative, so it stays meaningful whether
 * the number is a 0.004 interest slice or a 900,000 grand total.
 */
const RELATIVE_TOLERANCE = 1e-9;

function compare(actual: unknown, expected: unknown, path: string): void {
	if (expected === null || expected === undefined) {
		expect(actual ?? null, path).toBe(expected ?? null);
		return;
	}

	if (typeof expected === 'number') {
		expect(typeof actual, `${path} should be a number`).toBe('number');
		const a = actual as number;

		if (Number.isInteger(expected) && Number.isInteger(a)) {
			expect(a, path).toBe(expected);
			return;
		}

		const scale = Math.max(Math.abs(expected), Math.abs(a), 1);
		expect(Math.abs(a - expected) / scale, `${path} (php=${expected} ts=${a})`).toBeLessThan(
			RELATIVE_TOLERANCE,
		);
		return;
	}

	if (Array.isArray(expected)) {
		expect(Array.isArray(actual), `${path} should be an array`).toBe(true);
		const arr = actual as unknown[];
		expect(arr.length, `${path} length`).toBe(expected.length);
		expected.forEach((item, i) => compare(arr[i], item, `${path}[${i}]`));
		return;
	}

	if (typeof expected === 'object') {
		expect(typeof actual, `${path} should be an object`).toBe('object');
		const obj = actual as Record<string, unknown>;
		const exp = expected as Record<string, unknown>;

		// Key sets must match exactly. A missing key in the port would otherwise
		// slip through as undefined, and an extra one would go unnoticed - both
		// break clients that read the response shape.
		expect(Object.keys(obj).sort(), `${path} keys`).toEqual(Object.keys(exp).sort());

		for (const key of Object.keys(exp)) {
			compare(obj[key], exp[key], `${path}.${key}`);
		}
		return;
	}

	expect(actual, path).toBe(expected);
}

const suites = [
	{ label: 'finance', cases: cases.finance, compute: computeFinance },
	{ label: 'lease', cases: cases.lease, compute: computeLease },
	{ label: 'mortgage', cases: cases.mortgage, compute: computeMortgage },
] as const;

for (const suite of suites) {
	describe(`${suite.label} calculator matches Laravel`, () => {
		suite.cases.forEach((testCase, index) => {
			const reference = golden[suite.label]?.[index];

			it(`${testCase.name} - with schedule`, () => {
				expect(reference?.name, 'fixture and golden are out of order').toBe(testCase.name);
				compare(suite.compute(testCase.input, true), reference!.with_schedule, suite.label);
			});

			it(`${testCase.name} - without schedule`, () => {
				compare(suite.compute(testCase.input, false), reference!.without_schedule, suite.label);
			});
		});
	});
}
