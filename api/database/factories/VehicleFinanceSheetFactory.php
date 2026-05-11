<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleFinanceSheet;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFinanceSheetFactory extends Factory
{
    protected $model = VehicleFinanceSheet::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'sheet_name' => $this->faker->words(3, true).' Finance Sheet',
            'sales_consultant' => $this->faker->name(),
            'dealership_name' => $this->faker->company().' Motors',
            'vehicle_type' => $this->faker->randomElement(['CAR', 'TRUCK', 'SUV']),
            'shareable_key' => $this->faker->uuid(),
            'vehicle_year' => $this->faker->numberBetween(2018, 2024),
            'vehicle_make' => $this->faker->randomElement(['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes']),
            'vehicle_model' => $this->faker->randomElement(['Camry', 'Accord', 'F-150', 'Silverado', 'X3', 'C-Class']),
            'vehicle_trim' => $this->faker->randomElement(['Base', 'LE', 'EX', 'LX', 'Sport', 'Premium']),
            'msrp' => $this->faker->randomFloat(2, 15000, 80000),
            'fees' => $this->faker->randomFloat(2, 500, 3000),
            'discounts' => $this->faker->randomFloat(2, 0, 5000),
            'rebates' => $this->faker->randomFloat(2, 0, 3000),
            'down_payment' => $this->faker->randomFloat(2, 0, 10000),
            'sales_tax_percent' => $this->faker->randomFloat(2, 6.0, 10.5),
            'interest_rate' => $this->faker->randomFloat(2, 2.5, 8.5),
            'finance_term' => $this->faker->randomElement([36, 48, 60, 72, 84]),
            'start_date' => $this->faker->dateTimeBetween('now', '+30 days'),
            'contact_email' => $this->faker->email(),
            'contact_phone' => $this->faker->phoneNumber(),
            'extra_payments_json' => null,
            'notes' => $this->faker->optional()->paragraph(),
        ];
    }

    public function withExtraPayments(): static
    {
        return $this->state(function (array $attributes) {
            $extraPayments = [];
            for ($i = 0; $i < rand(1, 3); $i++) {
                $extraPayments[] = [
                    'month' => $this->faker->numberBetween(6, 60),
                    'amount' => $this->faker->randomFloat(2, 500, 3000),
                ];
            }

            return [
                'extra_payments_json' => json_encode($extraPayments),
            ];
        });
    }
}
