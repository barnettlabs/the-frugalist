<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleLeaseSheet extends Model
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
        'dealer_contribution',
        'trade_in',
        'doc_fee',
        'acquisition_fee',
        'misc_fees',
        'lease_cash',
        'down_payment',
        'money_factor',
        'sales_tax_percent',
        'residual_percent',
        'lease_term',
        'start_date',
        'contact_email',
        'contact_phone',
    ];

    protected $casts = [
        'msrp' => 'decimal:2',
        'dealer_contribution' => 'decimal:2',
        'trade_in' => 'decimal:2',
        'doc_fee' => 'decimal:2',
        'acquisition_fee' => 'decimal:2',
        'misc_fees' => 'decimal:2',
        'lease_cash' => 'decimal:2',
        'down_payment' => 'decimal:2',
        'money_factor' => 'decimal:6',
        'sales_tax_percent' => 'decimal:2',
        'residual_percent' => 'decimal:2',
        'start_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
