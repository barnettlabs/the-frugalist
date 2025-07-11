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
        Schema::create('vehicle_finance_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('sheet_name')->nullable();
            $table->string('sales_consultant')->nullable();
            $table->string('dealership_name')->nullable();
            $table->enum('vehicle_type', ['CAR', 'TRUCK', 'SUV'])->default('CAR');
            $table->string('shareable_key')->nullable();
            $table->decimal('msrp', 10, 2)->nullable();
            $table->decimal('fees', 10, 2)->nullable();
            $table->decimal('discounts', 10, 2)->nullable();
            $table->decimal('rebates', 10, 2)->nullable();
            $table->decimal('down_payment', 10, 2)->nullable();
            $table->decimal('sales_tax_percent', 5, 2)->nullable();
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->smallInteger('finance_term')->nullable();
            $table->timestamp('start_date')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('extra_payments_json')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_finance_sheets');
    }
};
