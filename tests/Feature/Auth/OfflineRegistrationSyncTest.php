<?php

use App\Models\User;

test('offline registrations can sync into resident accounts without authenticating the device', function () {
    $payload = offlineRegistrationPayload();

    $response = $this->postJson(route('offline-registrations.store'), $payload);

    $response
        ->assertCreated()
        ->assertJsonPath('status', 'synced')
        ->assertJsonPath('email', $payload['email']);

    $this->assertGuest();

    $user = User::query()
        ->with('householdProfile.members')
        ->where('email', $payload['email'])
        ->firstOrFail();

    expect($user->offline_sync_id)->toBe($payload['offline_sync_id']);
    expect($user->householdProfile?->reference_code)->toMatch('/^EVQ-MATI-[A-Z0-9]{6}$/');
    expect($user->householdProfile?->members)->toHaveCount(1);
});

test('offline registration sync is idempotent for repeated retries', function () {
    $payload = offlineRegistrationPayload([
        'email' => 'retry@example.com',
    ]);

    $this->postJson(route('offline-registrations.store'), $payload)
        ->assertCreated()
        ->assertJsonPath('status', 'synced');

    $retryResponse = $this->postJson(route('offline-registrations.store'), $payload);

    $retryResponse
        ->assertOk()
        ->assertJsonPath('status', 'already_synced')
        ->assertJsonPath('email', $payload['email']);

    expect(
        User::query()->where('email', $payload['email'])->count(),
    )->toBe(1);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function offlineRegistrationPayload(array $overrides = []): array
{
    return array_replace_recursive([
        'offline_sync_id' => '58d3152f-42b4-4e6b-8e9a-b7301cf341ec',
        'name' => 'Offline Registrant',
        'email' => 'offline@example.com',
        'household_role' => 'respondent',
        'age' => 34,
        'contact_number' => '09123456789',
        'sex' => 'female',
        'is_pwd' => false,
        'pwd_type' => null,
        'pwd_type_other' => null,
        'barangay' => 'Dahican',
        'address' => 'Purok 1, Dahican, Mati City',
        'password' => 'password',
        'password_confirmation' => 'password',
        'members' => [
            [
                'full_name' => 'Household Member',
                'age' => 12,
                'sex' => 'male',
                'is_pwd' => false,
                'pwd_type' => null,
                'pwd_type_other' => null,
            ],
        ],
    ], $overrides);
}
