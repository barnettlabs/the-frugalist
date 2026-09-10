<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if profiles table exists before migrating data
        if (Schema::hasTable('profiles')) {
            // Migrate profile data to users table.
            //
            // The correlated-subquery form below is standard SQL and runs on
            // SQLite and Postgres alike. MySQL keeps its own branch because
            // `UPDATE ... INNER JOIN ... SET` is a MySQL extension - it is not
            // valid Postgres, which is what broke the first migrate run against
            // pgsql. Both branches produce the same result.
            if (in_array(config('database.default'), ['sqlite', 'pgsql'], true)) {
                DB::statement('
                    UPDATE users
                    SET
                        username = (SELECT username FROM profiles WHERE profiles.user_id = users.id),
                        avatar_url = (SELECT avatar_url FROM profiles WHERE profiles.user_id = users.id),
                        website = (SELECT website FROM profiles WHERE profiles.user_id = users.id),
                        first_name = (SELECT first_name FROM profiles WHERE profiles.user_id = users.id),
                        last_name = (SELECT last_name FROM profiles WHERE profiles.user_id = users.id)
                    WHERE EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = users.id)
                ');
            } else {
                DB::statement('
                    UPDATE users
                    INNER JOIN profiles ON users.id = profiles.user_id
                    SET
                        users.username = profiles.username,
                        users.avatar_url = profiles.avatar_url,
                        users.website = profiles.website,
                        users.first_name = profiles.first_name,
                        users.last_name = profiles.last_name
                ');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as it would require
        // recreating the profiles table and moving data back
        // If you need to rollback, you'll need to do it manually
    }
};
