<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_invocation_cache', function (Blueprint $table) {
            $table->id();
            $table->char('cache_key', 64)->unique();
            $table->foreignId('agent_id')->constrained('ai_agents')->cascadeOnDelete();
            $table->unsignedInteger('agent_version');
            $table->foreignId('provider_id')->nullable()->constrained('ai_providers')->nullOnDelete();
            $table->string('model')->nullable();
            $table->char('request_hash', 64);
            $table->json('response');
            $table->unsignedInteger('hit_count')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['agent_id', 'agent_version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_invocation_cache');
    }
};
