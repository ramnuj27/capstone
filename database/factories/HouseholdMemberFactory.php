<?php

namespace Database\Factories;

use App\AgeGroup;
use App\Models\HouseholdMember;
use App\Models\HouseholdProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseholdMember>
 */
class HouseholdMemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $age = fake()->numberBetween(1, 85);
        $isPwd = fake()->boolean(10);
        $pwdType = $isPwd
            ? fake()->randomElement([
                'physical',
                'visual',
                'hearing',
                'speech',
                'intellectual',
                'learning',
                'psychosocial',
                'other',
            ])
            : null;

        return [
            'household_profile_id' => HouseholdProfile::factory(),
            'position' => 1,
            'full_name' => fake()->name(),
            'age' => $age,
            'age_group' => AgeGroup::fromAge($age)->value,
            'sex' => fake()->randomElement(['male', 'female']),
            'is_pwd' => $isPwd,
            'pwd_type' => $pwdType,
            'pwd_type_other' => $pwdType === 'other' ? fake()->words(2, true) : null,
        ];
    }
}
