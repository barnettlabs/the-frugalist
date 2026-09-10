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
 * 2. The explanatory header is restored, since drizzle-kit overwrites the file
 *    wholesale and would otherwise drop it.
 */

import { readFileSync, writeFileSync } from 'node:fs';

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

const count = (source.match(/mode: 'string'/g) ?? []).length;
source = source.replace(/mode: 'string'/g, "mode: 'date'");

writeFileSync(target, HEADER + source);
console.log(`normalised ${count} timestamp columns to mode: 'date'`);
