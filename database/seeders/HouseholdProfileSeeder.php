<?php

namespace Database\Seeders;

use App\Models\HouseholdMember;
use App\Models\HouseholdProfile;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Sequence;

class HouseholdProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        HouseholdProfile::factory()
            ->count(5)
            ->create()
            ->each(function (HouseholdProfile $householdProfile): void {
                HouseholdMember::factory()
                    ->count(fake()->numberBetween(1, 4))
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
