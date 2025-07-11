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
        'vehicle_year',
        'vehicle_make',
        'vehicle_model',
        'vehicle_trim',
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

    public function getDisplayTitleAttribute()
    {
        if ($this->sheet_name) {
            return $this->sheet_name;
        }

        $vehicleDetails = collect([$this->vehicle_year, $this->vehicle_make, $this->vehicle_model, $this->vehicle_trim])
            ->filter()
            ->implode(' ');

        if ($vehicleDetails && $this->dealership_name) {
            return $vehicleDetails.' - '.$this->dealership_name;
        }

        return $vehicleDetails ?: $this->dealership_name ?: 'Untitled Sheet';
    }
}
