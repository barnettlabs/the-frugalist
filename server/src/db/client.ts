import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '../config/env.js';
import * as relations from './relations.js';
import * as schema from './schema.js';

/**
 * Postgres connection and Drizzle instance.
 *
 * The pool is deliberately small and explicit. Two Node processes (api and
 * worker) share one database, and a Render Postgres instance under 8GB allows
 * 100 connections total - so an unbounded default pool per process is a real
 * way to exhaust it.
 */

let sqlClient: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof buildDb> | null = null;

function buildDb(client: ReturnType<typeof postgres>) {
	return drizzle(client, { schema: { ...schema, ...relations }, casing: 'snake_case' });
}

export function sql() {
	if (sqlClient) return sqlClient;

	const config = env();

	sqlClient = postgres(config.DATABASE_URL, {
		max: config.DATABASE_POOL_MAX,
		idle_timeout: 20,
		connect_timeout: 10,
		// Every timestamp in this database is UTC - config/app.php has always set
		// the Laravel timezone to UTC - so say so explicitly rather than inheriting
		// whatever zone the host happens to be in. A local Postgres defaulting to
		// America/New_York would otherwise shift every comparison by hours.
		connection: { TimeZone: 'UTC' },
		onnotice: () => {},
	});

	return sqlClient;
}

export function db() {
	return (dbInstance ??= buildDb(sql()));
}

export async function closeDb(): Promise<void> {
	if (sqlClient) {
		await sqlClient.end({ timeout: 5 });
		sqlClient = null;
		dbInstance = null;
	}
}

export type Database = ReturnType<typeof db>;
export { schema };
