<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'base_url',
        'api_key',
        'default_model',
        'enabled',
        'is_default',
        'sends_data_externally',
        'timeout_seconds',
        'settings',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'enabled' => 'boolean',
        'is_default' => 'boolean',
        'sends_data_externally' => 'boolean',
        'timeout_seconds' => 'integer',
        'settings' => AsArrayObject::class,
    ];

    protected $hidden = [
        'api_key',
    ];

    public function agents(): HasMany
    {
        return $this->hasMany(AiAgent::class, 'provider_id');
    }

    public function hasApiKey(): bool
    {
        return ! empty($this->getAttributes()['api_key']);
    }
}
