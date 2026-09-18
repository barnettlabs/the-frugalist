/**
 * Numeric coercion and money handling.
 *
 * `num` is a deliberate, exact port of the private `num()` helper that appears
 * in all three Laravel calculators:
 *
 *     private function num(string $key): float
 *     {
 *         $v = $this->data[$key] ?? 0;
 *         if (is_string($v)) {
 *             $v = preg_replace('/[^0-9.\-]/', '', $v);
 *             return $v === '' ? 0.0 : (float) $v;
 *         }
 *         return is_numeric($v) ? (float) $v : 0.0;
 *     }
 *
 * The behaviour is preserved bug-for-bug on purpose. The calculators are being
 * ported and cut over before anything about them is redesigned, so any output
 * difference during the migration is a porting mistake rather than an
 * intentional change - which is the only way to keep the parity tests meaningful.
 *
 * Two PHP behaviours worth calling out, both reproduced here:
 *
 *   - The regex strips everything except digits, `.` and `-`, so `"$1,200.50"`
 *     becomes `1200.50` and `"12-3"` becomes `12` (PHP casts the leading
 *     numeric prefix). `parseFloat` matches this.
 *   - `is_numeric` is false for booleans, so `true` coerces to 0, not 1.
 *     A bare `Number(true)` would return 1 and silently diverge.
 */

export function num(value: unknown): number {
	if (value === null || value === undefined) return 0;

	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === 'string') {
		const cleaned = value.replace(/[^0-9.\-]/g, '');
		if (cleaned === '') return 0;
		const parsed = Number.parseFloat(cleaned);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	// Booleans, objects, arrays. PHP's is_numeric() rejects all of these.
	return 0;
}

/** Read a key off a loosely-typed input bag with PHP-compatible coercion. */
export function field(data: Record<string, unknown>, key: string): number {
	return num(data[key]);
}

/**
 * Round to cents using half-up, which is what a person means by "round".
 *
 * JavaScript's Math.round is half-up for positives but half-*toward-zero* for
 * negatives (Math.round(-0.5) === -0), and naive `Math.round(v * 100) / 100`
 * also inherits float representation error: 1.005 * 100 is 100.49999999999999,
 * so it rounds down. Both are fixed here.
 */
export function roundToCents(value: number): number {
	if (!Number.isFinite(value)) return 0;
	const scaled = Number((Math.abs(value) * 100).toPrecision(15));
	const rounded = Math.round(scaled) / 100;
	return value < 0 ? -rounded : rounded;
}

/** Cents as an integer - the safe representation for storage and comparison. */
export function toCents(value: number): number {
	return Math.round(Number((Math.abs(value) * 100).toPrecision(15))) * (value < 0 ? -1 : 1);
}

export function fromCents(cents: number): number {
	return cents / 100;
}

/**
 * Postgres `numeric` arrives over the wire as a string, because it is arbitrary
 * precision and JavaScript numbers are not. Anything that reads a money column
 * goes through here rather than relying on implicit coercion.
 */
export function fromNumericColumn(value: string | number | null | undefined): number {
	if (value === null || value === undefined) return 0;
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

/** Money going back into a `numeric` column, as a fixed-precision string. */
export function toNumericColumn(value: number): string {
	return roundToCents(value).toFixed(2);
}

const USD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

const USD_WHOLE = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

export function formatMoney(value: number, { whole = false } = {}): string {
	const safe = Number.isFinite(value) ? value : 0;
	return whole ? USD_WHOLE.format(safe) : USD.format(safe);
}

const PERCENT = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatPercent(value: number): string {
	return `${PERCENT.format(Number.isFinite(value) ? value : 0)}%`;
}
