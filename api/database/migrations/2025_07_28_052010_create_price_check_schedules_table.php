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
        Schema::create('price_check_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'global', 'user_specific', etc.
            $table->enum('frequency', ['hourly', 'every_2_hours', 'every_6_hours', 'daily'])->default('daily');
            $table->integer('minute_offset')->default(0); // Minutes past the hour to run
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // null for global schedules
            $table->timestamps();

            $table->index(['is_active', 'frequency']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_check_schedules');
    }
};
