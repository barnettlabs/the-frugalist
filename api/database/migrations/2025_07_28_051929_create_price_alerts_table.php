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
        Schema::create('price_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tracked_product_id')->constrained()->onDelete('cascade');
            $table->decimal('old_price', 10, 2);
            $table->decimal('new_price', 10, 2);
            $table->enum('alert_type', ['price_drop', 'target_reached', 'back_in_stock']);
            $table->boolean('notification_sent')->default(false);
            $table->timestamp('triggered_at');
            $table->timestamps();

            $table->index(['tracked_product_id', 'triggered_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_alerts');
    }
};
