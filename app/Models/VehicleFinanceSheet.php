<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleFinanceSheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sheet_name',
        'sales_consultant',
        'dealership_name',
        'vehicle_type',
        'shareable_key',
        'msrp',
        'fees',
        'discounts',
        'rebates',
        'down_payment',
        'sales_tax_percent',
        'interest_rate',
        'finance_term',
        'start_date',
        'contact_email',
        'contact_phone',
        'extra_payments_json',
    ];

    protected $casts = [
        'msrp' => 'decimal:2',
        'fees' => 'decimal:2',
        'discounts' => 'decimal:2',
        'rebates' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'sales_tax_percent' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'start_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
