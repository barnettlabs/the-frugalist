<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceHistory extends Model
{
    protected $table = 'price_history';

    protected $fillable = [
        'tracked_product_id',
        'price',
        'in_stock',
        'api_response',
        'checked_at',
    ];

    protected $casts = [
        'price' => 'float',
        'in_stock' => 'boolean',
        'api_response' => 'array',
        'checked_at' => 'datetime',
    ];

    public function trackedProduct(): BelongsTo
    {
        return $this->belongsTo(TrackedProduct::class);
    }
}
