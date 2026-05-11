<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_agents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained('ai_providers')->nullOnDelete();
            $table->string('model')->nullable();
            $table->text('system_prompt');
            $table->text('user_prompt_template');
            $table->string('response_format')->default('json_object'); // json_object | json_schema | text
            $table->json('output_schema')->nullable();
            $table->decimal('temperature', 4, 2)->default(0.2);
            $table->decimal('top_p', 4, 2)->default(0.9);
            $table->integer('max_tokens')->default(500);
            $table->unsignedInteger('version')->default(1);
            $table->boolean('enabled')->default(true);
            $table->integer('rate_limit_per_user_day')->default(50);
            $table->json('settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agents');
    }
};
