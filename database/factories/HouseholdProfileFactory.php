<?php

namespace Database\Factories;

use App\AgeGroup;
use App\Models\HouseholdProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseholdProfile>
 */
class HouseholdProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $age = fake()->numberBetween(19, 70);
        $isPwd = fake()->boolean(20);
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
            'user_id' => User::factory(),
            'household_role' => fake()->randomElement(['resident', 'respondent']),
            'age' => $age,
            'age_group' => AgeGroup::fromAge($age)->value,
            'contact_number' => '09'.fake()->numerify('#########'),
            'sex' => fake()->randomElement(['male', 'female']),
            'is_pwd' => $isPwd,
            'pwd_type' => $pwdType,
            'pwd_type_other' => $pwdType === 'other' ? fake()->words(2, true) : null,
            'barangay' => 'Barangay '.fake()->lastName(),
            'address' => fake()->streetAddress(),
        ];
    }
}
