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
        'notes',
    ];

    protected $casts = [
        'msrp' => 'float',
        'fees' => 'float',
        'discounts' => 'float',
        'rebates' => 'float',
        'down_payment' => 'float',
        'sales_tax_percent' => 'float',
        'interest_rate' => 'float',
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
