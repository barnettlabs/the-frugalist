<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MortgageSheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sheet_name',
        'property_address',
        'property_type',
        'shareable_key',
        'property_value',
        'down_payment',
        'interest_rate',
        'loan_term_years',
        'start_date',
        'monthly_hoa',
        'annual_insurance',
        'annual_property_tax',
        'extra_expenses_json',
        'extra_payments_json',
        'contact_email',
        'contact_phone',
        'notes',
    ];

    protected $casts = [
        'property_value' => 'float',
        'down_payment' => 'float',
        'interest_rate' => 'float',
        'monthly_hoa' => 'float',
        'annual_insurance' => 'float',
        'annual_property_tax' => 'float',
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

        if ($this->property_address) {
            return $this->property_address;
        }

        return 'Untitled Mortgage';
    }
}
