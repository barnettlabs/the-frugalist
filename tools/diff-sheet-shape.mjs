#!/usr/bin/env node
/**
 * Checks a record response against the shape the clients type against.
 *
 * The expected shape below was captured from the Laravel app before it was
 * removed, so it is a frozen contract rather than a live comparison. It stays
 * useful precisely because it is independent of the implementation: Drizzle
 * returns camelCase properties while every client types against snake_case
 * columns, and the endpoint tests missed that break because they had been
 * written to match the implementation rather than the contract.
 *
 * Run against a live server when changing anything about serialisation:
 *
 *   cd server && pnpm dev
 *   PROBE_EMAIL=... PROBE_PASSWORD=... node tools/diff-sheet-shape.mjs
 *
 * The companion tool that compared calculator responses against a running
 * Laravel is gone with Laravel; that guarantee now lives in the frozen parity
 * suite at packages/contracts/src/calculators/parity.test.ts.
 */
const LARAVEL_SHAPE = {
	id: 'number', user_id: 'number', sheet_name: 'string|null',
	sales_consultant: 'string|null', dealership_name: 'string|null',
	vehicle_type: 'string|null', shareable_key: 'string|null',
	vehicle_year: 'string|null', vehicle_make: 'string|null',
	vehicle_model: 'string|null', vehicle_trim: 'string|null',
	msrp: 'number|null', fees: 'number|null', discounts: 'number|null',
	rebates: 'number|null', down_payment: 'number|null',
	sales_tax_percent: 'number|null', interest_rate: 'number|null',
	finance_term: 'number|null', start_date: 'string|null',
	contact_email: 'string|null', contact_phone: 'string|null',
	extra_payments_json: 'string|null', notes: 'string|null',
	created_at: 'string|null', updated_at: 'string|null',
};

const HONO = 'http://127.0.0.1:8787';

// Node's fetch sends `Origin: null`, which Better Auth rejects. The real Expo
// client sends the app scheme via @better-auth/expo, so the probe does the same
// rather than pretending to be an originless request.
const ORIGIN = 'thefrugalist://';

const signIn = await fetch(`${HONO}/api/auth/sign-in/email`, {
	method: 'POST', headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
	body: JSON.stringify({ email: process.env.PROBE_EMAIL, password: process.env.PROBE_PASSWORD }),
});
const token = signIn.headers.get('set-auth-token');
if (!token) { console.error('sign-in failed:', signIn.status, await signIn.text()); process.exit(1); }

const created = await fetch(`${HONO}/api/vehicle-finance-sheets`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, Origin: ORIGIN },
	body: JSON.stringify({ sheet_name: 'Shape Probe', vehicle_type: 'TRUCK', msrp: 52000, finance_term: 72, interest_rate: 6.25, start_date: '2026-03-15' }),
});
const body = await created.json();

let bad = 0;
for (const [key, expected] of Object.entries(LARAVEL_SHAPE)) {
	if (!(key in body)) { console.log(`✗ missing key: ${key}`); bad++; continue; }
	const actual = body[key] === null ? 'null' : typeof body[key];
	if (!expected.split('|').includes(actual)) {
		console.log(`✗ ${key}: expected ${expected}, got ${actual} (${JSON.stringify(body[key])})`);
		bad++;
	}
}
for (const key of Object.keys(body)) {
	if (!(key in LARAVEL_SHAPE)) { console.log(`✗ unexpected key: ${key}`); bad++; }
}

console.log(bad === 0
	? `\n✓ shape matches Laravel exactly (${Object.keys(LARAVEL_SHAPE).length} keys)\n`
	: `\n${bad} shape differences\n`);
process.exit(bad === 0 ? 0 : 1);
