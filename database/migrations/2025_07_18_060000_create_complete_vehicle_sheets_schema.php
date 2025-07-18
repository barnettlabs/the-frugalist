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
        // Drop existing tables to start fresh
        Schema::dropIfExists('vehicle_finance_sheets');
        Schema::dropIfExists('vehicle_lease_sheets');

        // Create vehicle_finance_sheets table
        Schema::create('vehicle_finance_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('sheet_name')->nullable();
            $table->string('sales_consultant')->nullable();
            $table->string('dealership_name')->nullable();
            $table->enum('vehicle_type', ['CAR', 'TRUCK', 'SUV'])->default('CAR');
            $table->string('shareable_key')->nullable();
            
            // Vehicle details
            $table->string('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_trim')->nullable();
            
            // Financial fields - using float to match Supabase real type
            $table->float('msrp')->nullable();
            $table->float('fees')->nullable();
            $table->float('discounts')->nullable();
            $table->float('rebates')->nullable();
            $table->float('down_payment')->nullable();
            $table->float('sales_tax_percent')->nullable();
            $table->float('interest_rate')->nullable();
            $table->smallInteger('finance_term')->nullable();
            
            // Contact and additional info
            $table->timestamp('start_date')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('extra_payments_json')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });

        // Create vehicle_lease_sheets table
        Schema::create('vehicle_lease_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('sheet_name')->nullable();
            $table->string('sales_consultant')->nullable();
            $table->string('dealership_name')->nullable();
            $table->enum('vehicle_type', ['CAR', 'TRUCK', 'SUV'])->default('CAR');
            $table->string('shareable_key')->nullable();
            
            // Vehicle details
            $table->string('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_trim')->nullable();
            
            // Financial fields - using float to match Supabase real type
            $table->float('msrp')->nullable();
            $table->float('dealer_contribution')->nullable();
            $table->float('trade_in')->nullable();
            $table->float('doc_fee')->nullable();
            $table->float('acquisition_fee')->nullable();
            $table->float('misc_fees')->nullable();
            $table->float('lease_cash')->nullable();
            $table->float('down_payment')->nullable();
            $table->float('money_factor')->nullable();
            $table->float('sales_tax_percent')->nullable();
            $table->float('residual_percent')->nullable();
            $table->smallInteger('lease_term')->nullable();
            
            // Contact and additional info
            $table->timestamp('start_date')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_finance_sheets');
        Schema::dropIfExists('vehicle_lease_sheets');
    }
};