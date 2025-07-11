<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Profile;
use App\Models\VehicleFinanceSheet;
use App\Models\VehicleLeaseSheet;
use App\Models\Announcement;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user
        $user = User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
        ]);

        // Create a profile for the user
        Profile::create([
            'user_id' => $user->id,
            'username' => 'johndoe',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            'website' => 'https://johndoe.com',
        ]);

        // Create sample finance sheets
        VehicleFinanceSheet::create([
            'user_id' => $user->id,
            'sheet_name' => 'Honda Civic Purchase',
            'sales_consultant' => 'Mike Johnson',
            'dealership_name' => 'Honda of Columbus',
            'vehicle_type' => 'CAR',
            'msrp' => 25000.00,
            'fees' => 500.00,
            'discounts' => 2000.00,
            'rebates' => 500.00,
            'down_payment' => 5000.00,
            'sales_tax_percent' => 7.5,
            'interest_rate' => 4.5,
            'finance_term' => 60,
            'contact_email' => 'john@example.com',
            'contact_phone' => '555-123-4567',
        ]);

        VehicleFinanceSheet::create([
            'user_id' => $user->id,
            'sheet_name' => 'Toyota Camry Purchase',
            'sales_consultant' => 'Sarah Wilson',
            'dealership_name' => 'Toyota of Columbus',
            'vehicle_type' => 'CAR',
            'msrp' => 28000.00,
            'fees' => 600.00,
            'discounts' => 1500.00,
            'rebates' => 750.00,
            'down_payment' => 6000.00,
            'sales_tax_percent' => 7.5,
            'interest_rate' => 3.9,
            'finance_term' => 72,
            'contact_email' => 'john@example.com',
            'contact_phone' => '555-123-4567',
        ]);

        // Create sample lease sheets
        VehicleLeaseSheet::create([
            'user_id' => $user->id,
            'sheet_name' => 'BMW 3 Series Lease',
            'sales_consultant' => 'David Smith',
            'dealership_name' => 'BMW of Columbus',
            'vehicle_type' => 'CAR',
            'msrp' => 45000.00,
            'dealer_contribution' => 2000.00,
            'trade_in' => 0.00,
            'doc_fee' => 250.00,
            'acquisition_fee' => 925.00,
            'misc_fees' => 0.00,
            'lease_cash' => 1000.00,
            'down_payment' => 2000.00,
            'money_factor' => 0.00125,
            'sales_tax_percent' => 7.5,
            'residual_percent' => 58.0,
            'lease_term' => 36,
            'contact_email' => 'john@example.com',
            'contact_phone' => '555-123-4567',
        ]);

        // Create sample announcements
        Announcement::create([
            'title' => 'Welcome to Sneaky Salesman!',
            'message' => 'We\'re excited to help you find the best vehicle deals. Start by creating your first estimate.',
        ]);

        Announcement::create([
            'title' => 'New Features Coming Soon',
            'message' => 'Stay tuned for dealer reviews, salesman reviews, and vehicle search functionality.',
        ]);
    }
}
