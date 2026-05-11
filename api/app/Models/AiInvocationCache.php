<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiInvocationCache extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'ai_invocation_cache';

    protected $fillable = [
        'cache_key',
        'agent_id',
        'agent_version',
        'provider_id',
        'model',
        'request_hash',
        'response',
        'hit_count',
        'last_hit_at',
    ];

    protected $casts = [
        'response' => AsArrayObject::class,
        'agent_version' => 'integer',
        'hit_count' => 'integer',
        'last_hit_at' => 'datetime',
        'created_at' => 'datetime',
    ];
}
