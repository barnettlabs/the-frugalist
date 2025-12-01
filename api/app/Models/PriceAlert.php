<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceAlert extends Model
{
    protected $fillable = [
        'tracked_product_id',
        'old_price',
        'new_price',
        'alert_type',
        'notification_sent',
        'triggered_at',
    ];

    protected $casts = [
        'old_price' => 'decimal:2',
        'new_price' => 'decimal:2',
        'notification_sent' => 'boolean',
        'triggered_at' => 'datetime',
    ];

    public function trackedProduct(): BelongsTo
    {
        return $this->belongsTo(TrackedProduct::class);
    }

    public function scopePending($query)
    {
        return $query->where('notification_sent', false);
    }
}
