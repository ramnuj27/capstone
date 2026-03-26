<?php

use App\Models\User;
use App\Support\MatiBarangays;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyFeature(Features::registration());
});

test('registration screen can be rendered', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/register')
            ->has('barangays', count(MatiBarangays::values()))
            ->where('barangays.0', 'Badas')
            ->where('barangays.25', 'Tamisan')
            ->etc(),
        );
});

test('new households can register with members', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'household_role' => 'respondent',
        'age' => 17,
        'contact_number' => '09123456789',
        'sex' => 'female',
        'is_pwd' => '1',
        'pwd_type' => 'other',
        'pwd_type_other' => 'Autism support needs',
        'barangay' => 'Dahican',
        'address' => 'Purok 1, Dahican, Mati City',
        'password' => 'password',
        'password_confirmation' => 'password',
        'members' => [
            [
                'full_name' => 'Adult Member',
                'age' => 18,
                'sex' => 'male',
                'is_pwd' => '0',
            ],
            [
                'full_name' => 'Senior Member',
                'age' => 67,
                'sex' => 'female',
                'is_pwd' => '1',
                'pwd_type' => 'physical',
            ],
        ],
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('registration.complete', absolute: false));

    $this->assertDatabaseHas('users', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'role' => 'resident',
    ]);

    $this->assertDatabaseHas('household_profiles', [
        'household_role' => 'respondent',
        'age' => 17,
        'age_group' => 'child',
        'contact_number' => '09123456789',
        'sex' => 'female',
        'is_pwd' => true,
        'pwd_type' => 'Autism support needs',
        'pwd_type_other' => 'Autism support needs',
        'barangay' => 'Dahican',
    ]);

    $this->assertDatabaseHas('household_members', [
        'position' => 1,
        'full_name' => 'Adult Member',
        'age' => 18,
        'age_group' => 'adult',
        'sex' => 'male',
        'is_pwd' => false,
        'pwd_type' => null,
    ]);

    $this->assertDatabaseHas('household_members', [
        'position' => 2,
        'full_name' => 'Senior Member',
        'age' => 67,
        'age_group' => 'senior',
        'sex' => 'female',
        'is_pwd' => true,
        'pwd_type' => 'physical',
    ]);

    $user = User::query()
        ->with('householdProfile.members')
        ->where('email', 'test@example.com')
        ->firstOrFail();

    expect($user->householdProfile)->not->toBeNull();
    expect($user->householdProfile?->reference_code)->toMatch('/^EVQ-MATI-[A-Z0-9]{6}$/');

    $this->get(route('registration.complete'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/registration-complete')
            ->where('summary.referenceCode', $user->householdProfile?->reference_code)
            ->where('summary.registrant.name', 'Test User')
            ->where('summary.registrant.email', 'test@example.com')
            ->where('summary.registrant.householdRole', 'Respondent')
            ->where('summary.registrant.ageGroup', 'Child')
            ->where('summary.registrant.barangay', 'Dahican')
            ->where('summary.registrant.address', 'Purok 1, Dahican, Mati City')
            ->where('summary.qrSvg', fn (string $svg): bool => str_contains($svg, '<svg'))
            ->has('summary.members', 2)
            ->where('summary.members.0.fullName', 'Adult Member')
            ->where('summary.members.0.ageGroup', 'Adult')
            ->where('summary.members.1.fullName', 'Senior Member')
            ->where('summary.members.1.ageGroup', 'Senior')
            ->etc(),
        );
});

test('barangay must belong to mati city list', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Barangay Check',
        'email' => 'barangay-check@example.com',
        'household_role' => 'resident',
        'age' => 24,
        'contact_number' => '09123456781',
        'sex' => 'male',
        'is_pwd' => '0',
        'barangay' => 'Outside Mati',
        'address' => 'Purok 2',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['barangay']);
    $this->assertGuest();
});

test('pwd type is required when pwd is enabled', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Validation User',
        'email' => 'validation@example.com',
        'household_role' => 'resident',
        'age' => 23,
        'contact_number' => '09123456780',
        'sex' => 'male',
        'is_pwd' => '1',
        'barangay' => 'Central',
        'address' => 'Sitio Uno',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['pwd_type']);
    $this->assertGuest();
});
