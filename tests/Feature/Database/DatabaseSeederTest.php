<?php

use App\Models\User;
use App\UserRole;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('database seeder creates the four demo portal accounts', function () {
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->where('email', 'admin@evaqready.test')->first();
    $barangayAdmin = User::query()->where('email', 'barangay.admin@evaqready.test')->first();
    $responder = User::query()->where('email', 'responder@evaqready.test')->first();
    $resident = User::query()->where('email', 'resident@evaqready.test')->first();

    expect($admin)->not->toBeNull();
    expect($barangayAdmin)->not->toBeNull();
    expect($responder)->not->toBeNull();
    expect($resident)->not->toBeNull();

    expect($admin?->role)->toBe(UserRole::MainAdmin);
    expect($barangayAdmin?->role)->toBe(UserRole::BarangayAdmin);
    expect($responder?->role)->toBe(UserRole::Responder);
    expect($resident?->role)->toBe(UserRole::Resident);

    expect(Hash::check('password', $admin?->password ?? ''))->toBeTrue();
    expect(Hash::check('password', $resident?->password ?? ''))->toBeTrue();

    expect($barangayAdmin?->householdProfile?->barangay)->toBe('Dahican');
    expect($resident?->householdProfile?->barangay)->toBe('Central');
});

test('database seeder preserves an existing demo account password when rerun', function () {
    $admin = User::factory()->mainAdmin()->create([
        'email' => 'admin@evaqready.test',
        'password' => 'custom-password',
    ]);

    $this->seed(DatabaseSeeder::class);

    expect(Hash::check('custom-password', $admin->refresh()->password))->toBeTrue();
    expect($admin->role)->toBe(UserRole::MainAdmin);
});
