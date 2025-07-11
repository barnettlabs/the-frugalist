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
            // Migrate profile data to users table
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
