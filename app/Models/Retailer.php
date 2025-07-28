<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Retailer extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'api_base_url',
        'api_key',
        'api_config',
        'is_active',
        'rate_limit_per_hour',
    ];

    protected $casts = [
        'api_config' => 'array',
        'is_active' => 'boolean',
    ];

    public function trackedProducts(): HasMany
    {
        return $this->hasMany(TrackedProduct::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
