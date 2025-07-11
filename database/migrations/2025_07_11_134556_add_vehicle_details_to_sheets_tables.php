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
        Schema::table('vehicle_finance_sheets', function (Blueprint $table) {
            $table->string('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_trim')->nullable();
        });

        Schema::table('vehicle_lease_sheets', function (Blueprint $table) {
            $table->string('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_trim')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_finance_sheets', function (Blueprint $table) {
            $table->dropColumn(['vehicle_year', 'vehicle_make', 'vehicle_model', 'vehicle_trim']);
        });

        Schema::table('vehicle_lease_sheets', function (Blueprint $table) {
            $table->dropColumn(['vehicle_year', 'vehicle_make', 'vehicle_model', 'vehicle_trim']);
        });
    }
};
