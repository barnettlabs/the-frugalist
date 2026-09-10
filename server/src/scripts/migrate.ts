/**
 * Pre-deploy schema check.
 *
 * This is deliberately *not* a migration runner yet. Laravel owns the schema
 * for the whole strangler-fig period - both services run against one database
 * and `php artisan migrate` keeps applying changes until Phase 6 - so having
 * Drizzle also write to it would mean two tools racing on the same schema.
 *
 * What it does instead is fail the deploy if the database is not the shape this
 * build expects. A service that boots against a half-migrated database and then
 * 500s on its first request is much harder to diagnose than one that refuses to
 * start and says which table is missing.
 *
 * At Phase 6, when Laravel is decommissioned, this becomes the real migrator:
 * replace the body with drizzle-orm/postgres-js/migrator's `migrate()`.
 */

import { sql } from 'drizzle-orm';

import { closeDb, db } from '../db/client.js';
import { logger } from '../lib/logger.js';

/** Tables the running service reads or writes. Extend as endpoints move over. */
const REQUIRED_TABLES = [
	'users',
	'personal_access_tokens',
	'vehicle_finance_sheets',
	'vehicle_lease_sheets',
	'mortgage_sheets',
	'tracked_products',
	'price_history',
	'price_alerts',
	'retailers',
	'notifications',
	'user_devices',
	'announcements',
	'bug_reports',
	'ai_agents',
	'ai_providers',
	'ai_invocations',
] as const;

async function main() {
	const log = logger();

	const rows = await db().execute<{ table_name: string }>(sql`
		select table_name
		from information_schema.tables
		where table_schema = 'public'
	`);

	const present = new Set(rows.map((r) => r.table_name));
	const missing = REQUIRED_TABLES.filter((t) => !present.has(t));

	if (missing.length > 0) {
		log.error(
			{ missing },
			'schema check failed - the database is missing tables this build requires',
		);
		await closeDb();
		process.exit(1);
	}

	log.info({ tables: present.size }, 'schema check passed');
	await closeDb();
}

main().catch(async (err) => {
	logger().error({ err }, 'schema check errored');
	await closeDb();
	process.exit(1);
});
