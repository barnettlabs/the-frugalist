<?php

namespace Database\Seeders;

use App\Models\PriceCheckSchedule;
use Illuminate\Database\Seeder;

class PriceCheckScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $schedules = [
            [
                'name' => 'global_hourly',
                'frequency' => 'hourly',
                'minute_offset' => 0,
                'is_active' => true,
                'user_id' => null,
            ],
            [
                'name' => 'global_twice_daily',
                'frequency' => 'daily',
                'minute_offset' => 0,
                'is_active' => true,
                'user_id' => null,
            ],
            [
                'name' => 'global_every_6_hours',
                'frequency' => 'every_6_hours',
                'minute_offset' => 30,
                'is_active' => false, // Disabled by default
                'user_id' => null,
            ],
        ];

        foreach ($schedules as $schedule) {
            PriceCheckSchedule::updateOrCreate(
                ['name' => $schedule['name']],
                $schedule
            );
        }
    }
}
