<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tables required by Better Auth, which handles authentication in the Hono
 * service from Phase 3 onward.
 *
 * These are created by a Laravel migration on purpose. Both services run
 * against one database for the whole strangler-fig period, and Laravel is the
 * single schema owner until Phase 6 - letting Better Auth's own CLI create
 * tables here would mean two tools writing the same schema. Drizzle introspects
 * what Laravel creates; nothing else writes DDL.
 *
 * Better Auth's default `user` model maps onto the existing `users` table
 * rather than creating a second one, so user ids stay bigint and every existing
 * foreign key (sheets, tracked products, devices, notifications) keeps working
 * untouched.
 *
 * `personal_access_tokens` is deliberately left in place. Sanctum keeps issuing
 * and verifying tokens while the Laravel app is still serving traffic; it is
 * dropped in Phase 6 once nothing reads it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auth_sessions', function (Blueprint $table) {
            // bigIncrements, not a string id. Better Auth is configured with
            // generateId: 'serial' so that users.id stays on its existing bigint
            // sequence and every foreign key from sheets, devices and
            // notifications keeps resolving. That setting is global, so the
            // auth tables have to let the database assign ids too.
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('expires_at');
        });

        Schema::create('auth_accounts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('account_id');
            $table->string('provider_id');
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->text('id_token')->nullable();
            $table->timestamp('access_token_expires_at')->nullable();
            $table->timestamp('refresh_token_expires_at')->nullable();
            $table->text('scope')->nullable();
            // Credential accounts store the password hash here rather than on
            // users.password. The existing bcrypt hashes are backfilled below so
            // nobody has to reset a password.
            $table->text('password')->nullable();
            $table->timestamps();

            $table->unique(['provider_id', 'account_id']);
            $table->index('user_id');
        });

        Schema::create('auth_verifications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('identifier');
            $table->string('value');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('identifier');
        });

        /*
         * Backfill a credential account per existing user.
         *
         * Better Auth looks for the password on the account row, not on the user
         * row. Copying the existing bcrypt hash across means current passwords
         * keep working - the Hono service is configured to verify bcrypt and
         * rehash to scrypt on next successful sign-in.
         */
        $now = now();
        $users = DB::table('users')->select('id', 'password')->get();

        foreach ($users as $user) {
            DB::table('auth_accounts')->insert([
                'user_id' => $user->id,
                'account_id' => (string) $user->id,
                'provider_id' => 'credential',
                'password' => $user->password,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('auth_verifications');
        Schema::dropIfExists('auth_accounts');
        Schema::dropIfExists('auth_sessions');
    }
};
