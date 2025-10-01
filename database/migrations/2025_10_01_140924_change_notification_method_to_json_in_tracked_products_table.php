<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add a temporary column to store the JSON data
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->json('notification_methods_temp')->nullable()->after('notification_method');
        });

        // Convert existing data to JSON array format in the temp column
        DB::table('tracked_products')->get()->each(function ($product) {
            $methods = [];

            if ($product->notification_method === 'all') {
                $methods = ['email', 'sms'];
            } elseif ($product->notification_method) {
                $methods = [$product->notification_method];
            }

            DB::table('tracked_products')
                ->where('id', $product->id)
                ->update(['notification_methods_temp' => json_encode($methods)]);
        });

        // Drop the old column and rename the temp column
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->dropColumn('notification_method');
        });

        Schema::table('tracked_products', function (Blueprint $table) {
            $table->renameColumn('notification_methods_temp', 'notification_method');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add temporary column for string values
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->string('notification_method_temp')->nullable()->after('notification_method');
        });

        // Convert JSON arrays back to single string values
        DB::table('tracked_products')->get()->each(function ($product) {
            $methods = json_decode($product->notification_method, true) ?? [];

            if (count($methods) > 1) {
                $method = 'all';
            } elseif (count($methods) === 1) {
                $method = $methods[0];
            } else {
                $method = 'email';
            }

            DB::table('tracked_products')
                ->where('id', $product->id)
                ->update(['notification_method_temp' => $method]);
        });

        // Drop the JSON column and rename temp column back
        Schema::table('tracked_products', function (Blueprint $table) {
            $table->dropColumn('notification_method');
        });

        Schema::table('tracked_products', function (Blueprint $table) {
            $table->renameColumn('notification_method_temp', 'notification_method');
        });
    }
};
