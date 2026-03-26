<?php

namespace Database\Seeders;

use App\Models\HouseholdMember;
use App\Models\HouseholdProfile;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;

class HouseholdMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (HouseholdProfile::query()->doesntExist()) {
            HouseholdProfile::factory()->count(3)->create();
        }

        HouseholdProfile::query()
            ->get()
            ->each(function (HouseholdProfile $householdProfile): void {
                if ($householdProfile->members()->exists()) {
                    return;
                }

                HouseholdMember::factory()
                    ->count(fake()->numberBetween(1, 3))
                    ->for($householdProfile)
                    ->sequence(
                        fn (Sequence $sequence): array => [
                            'position' => $sequence->index + 1,
                        ],
                    )
                    ->create();
            });
    }
}
