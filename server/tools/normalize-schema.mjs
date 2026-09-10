#!/usr/bin/env node
/**
 * Post-processes the drizzle-kit introspection output.
 *
 * Two fixes, applied every time the schema is regenerated so they cannot be
 * lost on the next `db:pull`:
 *
 * 1. Timestamps become `mode: 'date'`.
 *
 *    drizzle-kit defaults introspected timestamps to `mode: 'string'`, which
 *    makes every read a string and, more importantly, makes every *write*
 *    reject a Date. Better Auth passes Date objects, so sign-in failed inside
 *    postgres.js with ERR_INVALID_ARG_TYPE - a Date where it wanted a string.
 *    Date is the natural JavaScript representation and is what the shared
 *    datetime helpers already accept, so the whole schema uses it.
 *
 * 2. bigserial primary keys become `mode: 'number'`.
 *
 *    drizzle-kit introspects them as `mode: 'bigint'`, so Drizzle returns a JS
 *    BigInt - which JSON.stringify cannot serialise at all ("Do not know how to
 *    serialize a BigInt"). That would have broken every response body that
 *    includes a record id. Laravel serialised these as plain JSON numbers and
 *    both clients read them that way; the ids are row counters nowhere near
 *    Number.MAX_SAFE_INTEGER, so number is both correct and compatible. Note
 *    the bigint *foreign key* columns are already introspected as numbers -
 *    only the serial primary keys differ.
 *
 * 3. Generated imports get an explicit .js extension.
 *
 *    drizzle-kit writes `from "./schema"` in relations.ts. TypeScript accepts
 *    that under moduleResolution: bundler, so type-check and tsx both pass -
 *    but compiled ESM requires the extension, so the built container failed at
 *    startup with ERR_MODULE_NOT_FOUND. It only shows up in a real build, which
 *    is why the image is built in CI rather than trusted.
 *
 * 4. The explanatory header is restored, since drizzle-kit overwrites the file
 *    wholesale and would otherwise drop it.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const target = 'src/db/schema.ts';

const HEADER = `/**
 * Database schema, introspected from Postgres with \`pnpm db:pull\`.
 *
 * Do not hand-edit. Laravel still owns the schema for the whole strangler-fig
 * period - both services run against one database and Laravel keeps migrating
 * it until Phase 6 - so this file is regenerated rather than authored. Two
 * migration tools writing the same schema would be a real hazard.
 *
 * Timestamps are normalised to { mode: 'date' } by tools/normalize-schema.mjs;
 * drizzle-kit introspects them as strings, which rejects the Date objects
 * Better Auth writes.
 *
 * The money columns are not uniform, and that is deliberate for now: the
 * vehicle sheets store \`double precision\` while the price-tracking tables store
 * \`numeric(10,2)\`, which Postgres returns as a *string*. Read those through
 * \`fromNumericColumn\` in @frugalist/contracts rather than relying on implicit
 * coercion - see src/db/money.ts.
 */

`;

let source = readFileSync(target, 'utf8');

const firstImport = source.indexOf('import {');
if (firstImport > 0) source = source.slice(firstImport);

const timestamps = (source.match(/mode: 'string'/g) ?? []).length;
source = source.replace(/mode: 'string'/g, "mode: 'date'");

const bigints = (source.match(/bigserial\(\{ mode: "bigint" \}\)/g) ?? []).length;
source = source.replace(/bigserial\(\{ mode: "bigint" \}\)/g, 'bigserial({ mode: "number" })');

writeFileSync(target, HEADER + source);

// relations.ts is generated alongside schema.ts and has the same problem.
const relations = 'src/db/relations.ts';
if (existsSync(relations)) {
	const patched = readFileSync(relations, 'utf8').replace(
		/from "\.\/schema"/g,
		'from "./schema.js"',
	);
	writeFileSync(relations, patched);
}

console.log(
	`normalised ${timestamps} timestamps to mode: 'date', ${bigints} bigserial ids to mode: 'number', and fixed ESM import extensions`,
);
