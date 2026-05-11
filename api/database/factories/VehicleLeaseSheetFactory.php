<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleLeaseSheet;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleLeaseSheetFactory extends Factory
{
    protected $model = VehicleLeaseSheet::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'sheet_name' => $this->faker->words(3, true).' Lease Sheet',
            'sales_consultant' => $this->faker->name(),
            'dealership_name' => $this->faker->company().' Leasing',
            'vehicle_type' => $this->faker->randomElement(['CAR', 'TRUCK', 'SUV']),
            'shareable_key' => $this->faker->uuid(),
            'vehicle_year' => $this->faker->numberBetween(2020, 2024),
            'vehicle_make' => $this->faker->randomElement(['BMW', 'Mercedes', 'Audi', 'Lexus', 'Acura', 'Infiniti']),
            'vehicle_model' => $this->faker->randomElement(['X3', 'C-Class', 'A4', 'RX', 'MDX', 'QX60']),
            'vehicle_trim' => $this->faker->randomElement(['Base', 'Premium', 'Sport', 'Luxury', 'Technology']),
            'msrp' => $this->faker->randomFloat(2, 25000, 90000),
            'dealer_contribution' => $this->faker->randomFloat(2, 0, 3000),
            'trade_in' => $this->faker->randomFloat(2, 0, 15000),
            'doc_fee' => $this->faker->randomFloat(2, 200, 800),
            'acquisition_fee' => $this->faker->randomFloat(2, 400, 1200),
            'misc_fees' => $this->faker->randomFloat(2, 0, 500),
            'lease_cash' => $this->faker->randomFloat(2, 0, 4000),
            'down_payment' => $this->faker->randomFloat(2, 0, 8000),
            'money_factor' => $this->faker->randomFloat(5, 0.00050, 0.00300),
            'sales_tax_percent' => $this->faker->randomFloat(2, 6.0, 10.5),
            'residual_percent' => $this->faker->randomFloat(1, 45.0, 70.0),
            'lease_term' => $this->faker->randomElement([24, 36, 39, 48]),
            'start_date' => $this->faker->dateTimeBetween('now', '+30 days'),
            'contact_email' => $this->faker->email(),
            'contact_phone' => $this->faker->phoneNumber(),
            'notes' => $this->faker->optional()->paragraph(),
        ];
    }

    public function luxury(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'vehicle_make' => $this->faker->randomElement(['BMW', 'Mercedes', 'Audi']),
                'msrp' => $this->faker->randomFloat(2, 45000, 120000),
                'residual_percent' => $this->faker->randomFloat(1, 55.0, 70.0),
            ];
        });
    }

    public function economy(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'vehicle_make' => $this->faker->randomElement(['Toyota', 'Honda', 'Nissan']),
                'msrp' => $this->faker->randomFloat(2, 20000, 35000),
                'residual_percent' => $this->faker->randomFloat(1, 45.0, 60.0),
            ];
        });
    }
}
