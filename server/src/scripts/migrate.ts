/**
 * Schema migrator.
 *
 * This replaces the schema *check* that stood here while Laravel owned the
 * schema. Laravel is gone, so Drizzle is now the single owner: `drizzle/`
 * holds the migrations, `drizzle/meta` the journal, and this script applies
 * whatever has not run yet.
 *
 * Run as Render's pre-deploy command rather than on boot, so it executes once
 * per deploy instead of racing between instances.
 *
 * `0000_baseline.sql` is the full schema as it stood at the point Laravel was
 * removed - 23 tables, generated from the live database rather than
 * hand-written, so it reproduces exactly what 40 Laravel migrations had
 * produced. Everything after it is an ordinary forward migration.
 */

import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';

import { closeDb, db } from '../db/client.js';
import { logger } from '../lib/logger.js';

async function main() {
	const log = logger();
	const folder = fileURLToPath(new URL('../../drizzle', import.meta.url));

	log.info({ folder }, 'applying migrations');

	await migrate(db(), { migrationsFolder: folder });

	log.info('migrations applied');
	await closeDb();
}

main().catch(async (err) => {
	logger().error({ err }, 'migration failed');
	await closeDb();
	// A non-zero exit fails the deploy, which is the point - a service running
	// against a half-migrated schema is far harder to diagnose.
	process.exit(1);
});
