<?php

namespace Database\Factories;

use App\Models\MortgageSheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MortgageSheetFactory extends Factory
{
    protected $model = MortgageSheet::class;

    public function definition(): array
    {
        $value = $this->faker->randomFloat(2, 150000, 1200000);

        return [
            'user_id' => User::factory(),
            'sheet_name' => $this->faker->streetAddress().' Estimate',
            'property_address' => $this->faker->address(),
            'property_type' => $this->faker->randomElement(['HOUSE', 'CONDO', 'TOWNHOUSE', 'MULTI_FAMILY', 'LAND']),
            'shareable_key' => $this->faker->uuid(),
            'property_value' => $value,
            'down_payment' => $this->faker->randomFloat(2, $value * 0.05, $value * 0.3),
            'interest_rate' => $this->faker->randomFloat(2, 3.0, 8.5),
            'loan_term_years' => $this->faker->randomElement([15, 20, 25, 30]),
            'start_date' => $this->faker->dateTimeBetween('now', '+30 days'),
            'monthly_hoa' => $this->faker->optional()->randomFloat(2, 0, 600),
            'annual_insurance' => $this->faker->randomFloat(2, 800, 4000),
            'annual_property_tax' => $this->faker->randomFloat(2, 1500, 12000),
            'extra_expenses_json' => null,
            'extra_payments_json' => null,
            'contact_email' => $this->faker->email(),
            'contact_phone' => $this->faker->phoneNumber(),
            'notes' => $this->faker->optional()->paragraph(),
        ];
    }

    public function withExtraPayments(): static
    {
        return $this->state(fn () => [
            'extra_payments_json' => json_encode([
                ['startMonth' => 1, 'endMonth' => 360, 'paymentAmount' => 200],
            ]),
        ]);
    }

    public function withExtraExpenses(): static
    {
        return $this->state(fn () => [
            'extra_expenses_json' => json_encode([
                ['label' => 'PMI', 'amount' => 80, 'frequency' => 'monthly'],
                ['label' => 'Flood insurance', 'amount' => 600, 'frequency' => 'annual'],
            ]),
        ]);
    }
}
