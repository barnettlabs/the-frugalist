<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_invocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('ai_agents')->nullOnDelete();
            $table->unsignedInteger('agent_version')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained('ai_providers')->nullOnDelete();
            $table->string('model')->nullable();
            $table->string('context_key')->nullable();
            $table->char('request_hash', 64)->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response')->nullable();
            $table->text('raw_response')->nullable();
            $table->string('status')->default('pending'); // pending|success|invalid_json|error|timeout
            $table->text('error')->nullable();
            $table->integer('latency_ms')->nullable();
            $table->integer('prompt_tokens')->nullable();
            $table->integer('completion_tokens')->nullable();
            $table->boolean('cached')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index(['agent_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('request_hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_invocations');
    }
};
