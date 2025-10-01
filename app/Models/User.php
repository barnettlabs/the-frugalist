<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'username',
        'avatar_url',
        'website',
        'first_name',
        'last_name',
        'phone_number',
        'phone_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's full name by combining first and last name.
     */
    public function getNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function vehicleFinanceSheets()
    {
        return $this->hasMany(VehicleFinanceSheet::class);
    }

    public function vehicleLeaseSheets()
    {
        return $this->hasMany(VehicleLeaseSheet::class);
    }

    public function phoneVerificationCodes()
    {
        return $this->hasMany(PhoneVerificationCode::class);
    }

    public function hasVerifiedPhone(): bool
    {
        return $this->phone_verified_at !== null;
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function canReceiveSmsNotifications(): bool
    {
        return $this->hasVerifiedPhone();
    }

    public function canReceiveEmailNotifications(): bool
    {
        return $this->hasVerifiedEmail();
    }
}
