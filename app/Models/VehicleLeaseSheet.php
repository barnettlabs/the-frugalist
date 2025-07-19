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
        'vehicle_year',
        'vehicle_make',
        'vehicle_model',
        'vehicle_trim',
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
        'notes',
    ];

    protected $casts = [
        'msrp' => 'float',
        'dealer_contribution' => 'float',
        'trade_in' => 'float',
        'doc_fee' => 'float',
        'acquisition_fee' => 'float',
        'misc_fees' => 'float',
        'lease_cash' => 'float',
        'down_payment' => 'float',
        'money_factor' => 'float',
        'sales_tax_percent' => 'float',
        'residual_percent' => 'float',
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
