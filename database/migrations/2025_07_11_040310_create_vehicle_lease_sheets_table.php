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
        Schema::create('vehicle_lease_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('sheet_name')->nullable();
            $table->string('sales_consultant')->nullable();
            $table->string('dealership_name')->nullable();
            $table->enum('vehicle_type', ['CAR', 'TRUCK', 'SUV'])->default('CAR');
            $table->string('shareable_key')->nullable();
            $table->decimal('msrp', 10, 2)->nullable();
            $table->decimal('dealer_contribution', 10, 2)->nullable();
            $table->decimal('trade_in', 10, 2)->nullable();
            $table->decimal('doc_fee', 10, 2)->nullable();
            $table->decimal('acquisition_fee', 10, 2)->nullable();
            $table->decimal('misc_fees', 10, 2)->nullable();
            $table->decimal('lease_cash', 10, 2)->nullable();
            $table->decimal('down_payment', 10, 2)->nullable();
            $table->decimal('money_factor', 10, 6)->nullable();
            $table->decimal('sales_tax_percent', 5, 2)->nullable();
            $table->decimal('residual_percent', 5, 2)->nullable();
            $table->smallInteger('lease_term')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_lease_sheets');
    }
};
