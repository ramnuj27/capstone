<?php

namespace Database\Seeders;

use App\AgeGroup;
use App\Models\HouseholdProfile;
use App\Models\User;
use App\UserRole;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $demoUsers = [
            [
                'name' => 'Main Admin',
                'email' => 'admin@evaqready.test',
                'role' => UserRole::MainAdmin,
                'profile' => null,
            ],
            [
                'name' => 'Barangay Admin',
                'email' => 'barangay.admin@evaqready.test',
                'role' => UserRole::BarangayAdmin,
                'profile' => [
                    'household_role' => 'respondent',
                    'age' => 34,
                    'age_group' => AgeGroup::fromAge(34)->value,
                    'contact_number' => '09123456780',
                    'sex' => 'female',
                    'is_pwd' => false,
                    'pwd_type' => null,
                    'pwd_type_other' => null,
                    'barangay' => 'Dahican',
                    'address' => 'Purok 1, Dahican, Mati City',
                ],
            ],
            [
                'name' => 'Responder User',
                'email' => 'responder@evaqready.test',
                'role' => UserRole::Responder,
                'profile' => [
                    'household_role' => 'resident',
                    'age' => 29,
                    'age_group' => AgeGroup::fromAge(29)->value,
                    'contact_number' => '09123456781',
                    'sex' => 'male',
                    'is_pwd' => false,
                    'pwd_type' => null,
                    'pwd_type_other' => null,
                    'barangay' => 'Central',
                    'address' => 'Rizal Extension, Mati City',
                ],
            ],
            [
                'name' => 'Resident User',
                'email' => 'resident@evaqready.test',
                'role' => UserRole::Resident,
                'profile' => [
                    'household_role' => 'resident',
                    'age' => 24,
                    'age_group' => AgeGroup::fromAge(24)->value,
                    'contact_number' => '09123456782',
                    'sex' => 'female',
                    'is_pwd' => false,
                    'pwd_type' => null,
                    'pwd_type_other' => null,
                    'barangay' => 'Central',
                    'address' => 'Mabini Street, Mati City',
                ],
            ],
        ];

        foreach ($demoUsers as $demoUser) {
            $user = User::query()->firstOrNew([
                'email' => $demoUser['email'],
            ]);

            $user->fill([
                'name' => $demoUser['name'],
                'role' => $demoUser['role'],
                'email_verified_at' => $user->email_verified_at ?? now(),
            ]);

            if (! $user->exists) {
                $user->password = 'password';
            }

            $user->save();

            if ($demoUser['profile'] === null) {
                continue;
            }

            HouseholdProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                $demoUser['profile'],
            );
        }
    }
}
