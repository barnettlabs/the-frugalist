<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrackedProduct extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'retailer_id',
        'sku_upc',
        'product_name',
        'product_variant',
        'product_description',
        'product_image_url',
        'retail_price',
        'current_price',
        'target_price',
        'tracking_start_date',
        'tracking_end_date',
        'is_active',
        'notification_method',
        'product_metadata',
        'last_checked_at',
        'last_scraper_error',
        'last_error_at',
    ];

    protected $casts = [
        'retail_price' => 'float',
        'current_price' => 'float',
        'target_price' => 'float',
        'tracking_start_date' => 'datetime',
        'tracking_end_date' => 'datetime',
        'last_checked_at' => 'datetime',
        'last_error_at' => 'datetime',
        'is_active' => 'boolean',
        'product_metadata' => 'array',
        'notification_method' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function retailer(): BelongsTo
    {
        return $this->belongsTo(Retailer::class);
    }

    public function priceHistory(): HasMany
    {
        return $this->hasMany(PriceHistory::class);
    }

    public function priceAlerts(): HasMany
    {
        return $this->hasMany(PriceAlert::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeExpired($query)
    {
        return $query->where('tracking_end_date', '<', now());
    }

    public function scopeNeedsCheck($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('last_checked_at')
              ->orWhere('last_checked_at', '<', now()->subHour());
        });
    }

    public function isPriceAtTarget(): bool
    {
        return $this->current_price <= $this->target_price;
    }

    public function getPriceDropPercentageAttribute(): float
    {
        if ($this->retail_price == 0) {
            return 0;
        }

        return (($this->retail_price - $this->current_price) / $this->retail_price) * 100;
    }
}
