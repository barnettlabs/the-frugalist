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
        Schema::create('retailers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Best Buy, Home Depot, etc.
            $table->string('slug')->unique(); // bestbuy, homedepot
            $table->string('api_base_url');
            $table->string('api_key')->nullable();
            $table->json('api_config')->nullable(); // Additional API configuration
            $table->boolean('is_active')->default(true);
            $table->integer('rate_limit_per_hour')->default(1000);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retailers');
    }
};
