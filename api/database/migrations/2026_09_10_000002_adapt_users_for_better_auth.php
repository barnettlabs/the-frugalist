<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reconciles the users table with Better Auth's core user model.
 *
 * Three differences had to be resolved, and each is a real one rather than
 * ceremony:
 *
 *  1. `password` was NOT NULL. Better Auth keeps credentials on the account
 *     row, not the user row, so it never writes users.password - which means
 *     creating a user would violate the constraint. The column stays (Laravel
 *     still authenticates against it while it is serving traffic) but becomes
 *     nullable, and is dropped in Phase 6.
 *
 *  2. Better Auth's model has a single `name`. Laravel split it into
 *     first_name and last_name. Rather than force the app to pick one, `name`
 *     is added and backfilled from the two existing columns.
 *
 *  3. `email_verified` is a boolean in Better Auth and a nullable timestamp
 *     (email_verified_at) in Laravel. Both are kept: the boolean is what Better
 *     Auth reads and writes, the timestamp is what Laravel reads, and the
 *     backfill keeps them consistent for existing rows.
 *
 * `image` is not added - it maps onto the existing avatar_url column in the
 * Better Auth field configuration instead.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable()->after('email');
            $table->boolean('email_verified')->default(false)->after('email_verified_at');
        });

        // Postgres needs an explicit type change to drop NOT NULL; the Laravel
        // schema builder would require doctrine/dbal for ->nullable()->change().
        DB::statement('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');

        DB::statement(<<<'SQL'
            UPDATE users
            SET name = NULLIF(TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))), '')
        SQL);

        DB::statement('UPDATE users SET email_verified = (email_verified_at IS NOT NULL)');
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['name', 'email_verified']);
        });

        DB::statement("UPDATE users SET password = '' WHERE password IS NULL");
        DB::statement('ALTER TABLE users ALTER COLUMN password SET NOT NULL');
    }
};
