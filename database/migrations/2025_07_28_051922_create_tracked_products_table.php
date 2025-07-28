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
        Schema::create('tracked_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('retailer_id')->constrained()->onDelete('cascade');
            $table->string('sku_upc'); // The product SKU or UPC
            $table->string('product_name');
            $table->string('product_variant')->nullable();
            $table->text('product_description')->nullable();
            $table->string('product_image_url')->nullable();
            $table->decimal('original_price', 10, 2);
            $table->decimal('current_price', 10, 2);
            $table->decimal('target_price', 10, 2);
            $table->datetime('tracking_start_date');
            $table->datetime('tracking_end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('product_metadata')->nullable(); // Store additional product data
            $table->timestamp('last_checked_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['retailer_id', 'sku_upc']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracked_products');
    }
};
