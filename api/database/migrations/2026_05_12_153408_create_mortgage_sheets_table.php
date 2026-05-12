<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mortgage_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Basic information
            $table->string('sheet_name')->nullable();
            $table->string('property_address')->nullable();
            $table->enum('property_type', ['HOUSE', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'LAND'])->default('HOUSE');
            $table->string('shareable_key')->nullable();

            // Property + loan core
            $table->float('property_value')->nullable();
            $table->float('down_payment')->nullable();
            $table->float('interest_rate')->nullable();
            $table->smallInteger('loan_term_years')->nullable();
            $table->timestamp('start_date')->nullable();

            // Recurring expenses (escrow-style add-ons)
            $table->float('monthly_hoa')->nullable();
            $table->float('annual_insurance')->nullable();
            $table->float('annual_property_tax')->nullable();

            // Free-form list of additional expenses (label + amount + frequency)
            $table->text('extra_expenses_json')->nullable();

            // Extra principal payments (start month / end month / amount)
            $table->text('extra_payments_json')->nullable();

            // Contact and notes
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mortgage_sheets');
    }
};
