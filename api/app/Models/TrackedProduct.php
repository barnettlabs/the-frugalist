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
        'watch_type',
        'check_interval',
        'in_stock',
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
        'in_stock' => 'boolean',
        'check_interval' => 'integer',
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
        return $this->hasMany(PriceHistory::class)->orderBy('checked_at', 'desc');
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

    /**
     * Products whose check interval has fully elapsed since the last check.
     *
     * The interval lives in a column rather than being a constant, so the
     * comparison has to stay in SQL - and there is no single expression both
     * engines accept, because each spells a dynamic interval differently:
     *
     *   MySQL     DATE_SUB(NOW(), INTERVAL check_interval MINUTE)
     *             INTERVAL takes a keyword unit, so the unit cannot be quoted.
     *
     *   Postgres  NOW() - (check_interval * INTERVAL '1 minute')
     *             No DATE_SUB, and the unit must be inside a quoted literal
     *             that is then multiplied by the column.
     *
     * Both branches are kept because production is still MySQL while the
     * migration is in progress; Postgres is used locally, in tests and by the
     * Hono service. Dropping the MySQL branch before the production database
     * moves would silently stop every scheduled price check.
     */
    public function scopeNeedsCheck($query)
    {
        $driver = $query->getConnection()->getDriverName();

        $elapsed = $driver === 'mysql' || $driver === 'mariadb'
            ? 'last_checked_at < DATE_SUB(NOW(), INTERVAL check_interval MINUTE)'
            : "last_checked_at < NOW() - (check_interval * INTERVAL '1 minute')";

        return $query->where(function ($q) use ($elapsed) {
            $q->whereNull('last_checked_at')
                ->orWhereRaw($elapsed);
        });
    }

    /**
     * Check if this product should be monitored for price drops
     */
    public function shouldCheckForPriceDrop(): bool
    {
        return in_array($this->watch_type, ['price', 'both']);
    }

    /**
     * Check if this product should be monitored for stock availability
     */
    public function shouldCheckForStock(): bool
    {
        return in_array($this->watch_type, ['stock', 'both']);
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
