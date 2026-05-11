<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAgentRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'context_key',
        'agent_id',
        'priority',
        'enabled',
    ];

    protected $casts = [
        'priority' => 'integer',
        'enabled' => 'boolean',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'agent_id');
    }
}
