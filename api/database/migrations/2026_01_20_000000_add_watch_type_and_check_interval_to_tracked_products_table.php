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
            $table->enum('watch_type', ['price', 'stock', 'both'])
                  ->default('price')
                  ->after('is_active')
                  ->comment('What to watch for: price drops, stock availability, or both');

            $table->unsignedInteger('check_interval')
                  ->default(60)
                  ->after('watch_type')
                  ->comment('Minutes between price/stock checks');

            $table->boolean('in_stock')
                  ->default(true)
                  ->after('check_interval')
                  ->comment('Current stock status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->dropColumn(['watch_type', 'check_interval', 'in_stock']);
        });
    }
};
