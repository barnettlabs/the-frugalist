<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_agent_routes', function (Blueprint $table) {
            $table->id();
            $table->string('context_key');
            $table->foreignId('agent_id')->constrained('ai_agents')->cascadeOnDelete();
            $table->integer('priority')->default(0);
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->index(['context_key', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agent_routes');
    }
};
