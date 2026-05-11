<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiInvocation extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'agent_id',
        'agent_version',
        'provider_id',
        'model',
        'context_key',
        'request_hash',
        'request_payload',
        'response',
        'raw_response',
        'status',
        'error',
        'latency_ms',
        'prompt_tokens',
        'completion_tokens',
        'cached',
    ];

    protected $casts = [
        'request_payload' => AsArrayObject::class,
        'response' => AsArrayObject::class,
        'agent_version' => 'integer',
        'latency_ms' => 'integer',
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'cached' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'agent_id');
    }

    public function provider(): BelongsTo
    {
        return $this->belongsTo(AiProvider::class, 'provider_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
