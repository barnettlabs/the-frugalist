#!/usr/bin/env node
/** drizzle-kit writes into ./drizzle; the application reads from src/db. */
import { existsSync, renameSync } from 'node:fs';

for (const [from, to] of [
	['drizzle/schema.ts', 'src/db/schema.ts'],
	['drizzle/relations.ts', 'src/db/relations.ts'],
]) {
	if (existsSync(from)) renameSync(from, to);
}
console.log('schema moved into src/db');
