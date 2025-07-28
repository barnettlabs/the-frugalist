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
        Schema::create('price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_product_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 10, 2);
            $table->boolean('in_stock')->default(true);
            $table->json('api_response')->nullable(); // Store raw API response for debugging
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['tracked_product_id', 'checked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_history');
    }
};
