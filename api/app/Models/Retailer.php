<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Retailer extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'logo_url',
        'api_base_url',
        'api_key',
        'api_config',
        'is_active',
        'coming_soon',
        'rate_limit_per_hour',
    ];

    protected $casts = [
        'api_config' => 'array',
        'is_active' => 'boolean',
        'coming_soon' => 'boolean',
    ];

    // Hide sensitive fields from JSON serialization
    protected $hidden = [
        'api_base_url',
        'api_key',
        'api_config',
        'rate_limit_per_hour',
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
