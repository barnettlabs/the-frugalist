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
            $table->text('notes')->nullable()->after('extra_payments_json');
        });

        Schema::table('vehicle_lease_sheets', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('contact_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicle_finance_sheets', function (Blueprint $table) {
            $table->dropColumn(['notes']);
        });

        Schema::table('vehicle_lease_sheets', function (Blueprint $table) {
            $table->dropColumn(['notes']);
        });
    }
};
