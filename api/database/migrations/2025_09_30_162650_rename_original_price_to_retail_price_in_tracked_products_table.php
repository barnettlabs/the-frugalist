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
            $table->renameColumn('original_price', 'retail_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->renameColumn('retail_price', 'original_price');
        });
    }
};
