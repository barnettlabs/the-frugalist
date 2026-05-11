<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiAgentVersion extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'agent_id',
        'version',
        'snapshot',
        'created_by',
    ];

    protected $casts = [
        'snapshot' => AsArrayObject::class,
        'version' => 'integer',
        'created_at' => 'datetime',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'agent_id');
    }
}
