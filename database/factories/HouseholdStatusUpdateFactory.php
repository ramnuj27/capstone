<?php

namespace Database\Factories;

use App\HouseholdEvacuationStatus;
use App\Models\HouseholdProfile;
use App\Models\HouseholdStatusUpdate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<HouseholdStatusUpdate>
 */
class HouseholdStatusUpdateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'household_profile_id' => HouseholdProfile::factory(),
            'recorded_by_id' => User::factory()->responder(),
            'reference_code' => 'EVQ-MATI-'.Str::upper(Str::random(6)),
            'sync_id' => (string) Str::uuid(),
            'status' => fake()->randomElement([
                HouseholdEvacuationStatus::Safe->value,
                HouseholdEvacuationStatus::Missing->value,
            ]),
            'recorded_at' => now()->subMinutes(fake()->numberBetween(1, 120)),
            'captured_offline' => fake()->boolean(35),
        ];
    }
}
