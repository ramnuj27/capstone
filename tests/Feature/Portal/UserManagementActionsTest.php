<?php

use App\Models\HouseholdProfile;
use App\Models\User;
use App\UserRole;

test('main admin can update another users role and barangay from users management', function () {
    $admin = User::factory()->mainAdmin()->create();

    $targetUser = User::factory()->responder()->create();
    HouseholdProfile::factory()->for($targetUser)->create([
        'barangay' => 'Central',
    ]);

    $this->actingAs($admin)
        ->patch(route('portal.users-management.update', $targetUser), [
            'role' => UserRole::BarangayAdmin->value,
            'barangay' => 'Dahican',
        ])
        ->assertRedirect(route('portal.users-management'));

    expect($targetUser->fresh()->role)->toBe(UserRole::BarangayAdmin);
    expect($targetUser->fresh()->householdProfile?->barangay)->toBe('Dahican');
});

test('main admin cannot assign a barangay to an account without a linked household profile', function () {
    $admin = User::factory()->mainAdmin()->create();
    $targetUser = User::factory()->mainAdmin()->create();

    $this->actingAs($admin)
        ->from(route('portal.users-management'))
        ->patch(route('portal.users-management.update', $targetUser), [
            'role' => UserRole::MainAdmin->value,
            'barangay' => 'Central',
        ])
        ->assertRedirect(route('portal.users-management'))
        ->assertSessionHasErrors(['barangay']);

    expect($targetUser->fresh()->householdProfile)->toBeNull();
});

test('main admin cannot delete their own account from users management', function () {
    $admin = User::factory()->mainAdmin()->create();

    $this->actingAs($admin)
        ->from(route('portal.users-management'))
        ->delete(route('portal.users-management.destroy', $admin))
        ->assertRedirect(route('portal.users-management'))
        ->assertSessionHasErrors(['user']);

    expect(User::query()->find($admin->id))->not->toBeNull();
});

test('main admin can delete another user and the linked household profile', function () {
    $admin = User::factory()->mainAdmin()->create();

    $targetUser = User::factory()->resident()->create();
    $householdProfile = HouseholdProfile::factory()->for($targetUser)->create();

    $this->actingAs($admin)
        ->delete(route('portal.users-management.destroy', $targetUser))
        ->assertRedirect(route('portal.users-management'));

    expect(User::query()->find($targetUser->id))->toBeNull();
    expect(HouseholdProfile::query()->find($householdProfile->id))->toBeNull();
});

test('responder cannot update users through the main admin management endpoint', function () {
    $responder = User::factory()->responder()->create();
    $targetUser = User::factory()->resident()->create();
    HouseholdProfile::factory()->for($targetUser)->create();

    $this->actingAs($responder)
        ->patch(route('portal.users-management.update', $targetUser), [
            'role' => UserRole::Responder->value,
            'barangay' => 'Central',
        ])
        ->assertForbidden();
});
