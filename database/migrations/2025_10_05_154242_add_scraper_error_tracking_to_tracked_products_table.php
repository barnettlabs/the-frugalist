<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->text('last_scraper_error')->nullable()->after('last_checked_at');
            $table->timestamp('last_error_at')->nullable()->after('last_scraper_error');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->dropColumn(['last_scraper_error', 'last_error_at']);
        });
    }
};
