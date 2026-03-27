<?php

use App\HouseholdEvacuationStatus;
use App\Models\HouseholdProfile;
use App\Models\HouseholdStatusUpdate;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('responder can open the victim status page with live responder data', function () {
    $responder = User::factory()->responder()->create([
        'name' => 'Responder Echo',
    ]);

    $safeResident = User::factory()->resident()->create([
        'name' => 'Safe Resident',
    ]);
    $safeProfile = HouseholdProfile::factory()->for($safeResident)->create([
        'barangay' => 'Central',
        'evacuation_status' => HouseholdEvacuationStatus::Safe,
        'evacuation_status_updated_at' => now()->subMinutes(15),
    ]);
    HouseholdStatusUpdate::query()->create([
        'household_profile_id' => $safeProfile->id,
        'recorded_by_id' => $responder->id,
        'reference_code' => $safeProfile->reference_code,
        'sync_id' => (string) Str::uuid(),
        'status' => HouseholdEvacuationStatus::Safe,
        'recorded_at' => now()->subMinutes(15),
        'captured_offline' => false,
    ]);

    $missingResident = User::factory()->resident()->create([
        'name' => 'Missing Resident',
    ]);
    $missingProfile = HouseholdProfile::factory()->for($missingResident)->create([
        'barangay' => 'Dahican',
        'evacuation_status' => HouseholdEvacuationStatus::Missing,
        'evacuation_status_updated_at' => now()->subMinutes(5),
    ]);
    HouseholdStatusUpdate::query()->create([
        'household_profile_id' => $missingProfile->id,
        'recorded_by_id' => $responder->id,
        'reference_code' => $missingProfile->reference_code,
        'sync_id' => (string) Str::uuid(),
        'status' => HouseholdEvacuationStatus::Missing,
        'recorded_at' => now()->subMinutes(5),
        'captured_offline' => true,
    ]);

    User::factory()->resident()->create([
        'name' => 'Registered Resident',
    ])->householdProfile()->create(
        HouseholdProfile::factory()->make([
            'barangay' => 'Matiao',
        ])->toArray(),
    );

    $this->actingAs($responder)
        ->get(route('portal.victim-status'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/victim-status')
            ->where('summary.trackedHouseholds', '3')
            ->where('summary.safeHouseholds', '1')
            ->where('summary.missingHouseholds', '1')
            ->where('summary.registeredHouseholds', '1')
            ->where('summary.updatesToday', '2')
            ->where('recentHouseholds.0.name', 'Missing Resident')
            ->where('recentUpdates.0.referenceCode', $missingProfile->reference_code)
            ->where('recentUpdates.0.capturedOffline', true)
            ->etc(),
        );
});

test('resident cannot open the victim status page', function () {
    $resident = User::factory()->resident()->create();

    $this->actingAs($resident)
        ->get(route('portal.victim-status'))
        ->assertForbidden();
});

test('responder can sync a household status update', function () {
    $responder = User::factory()->responder()->create([
        'name' => 'Responder Sierra',
    ]);
    $resident = User::factory()->resident()->create([
        'name' => 'Resident Tango',
    ]);
    $householdProfile = HouseholdProfile::factory()->for($resident)->create([
        'barangay' => 'Central',
    ]);

    $syncId = (string) Str::uuid();

    $this->actingAs($responder)
        ->postJson(route('portal.victim-status-updates.store'), [
            'sync_id' => $syncId,
            'reference_code' => $householdProfile->reference_code,
            'status' => HouseholdEvacuationStatus::Safe->value,
            'recorded_at' => now()->toIso8601String(),
            'captured_offline' => true,
        ])
        ->assertSuccessful()
        ->assertJsonPath('status', 'synced')
        ->assertJsonPath('household.referenceCode', $householdProfile->reference_code)
        ->assertJsonPath('household.status', HouseholdEvacuationStatus::Safe->value)
        ->assertJsonPath('update.capturedOffline', true);

    $householdProfile->refresh();

    expect($householdProfile->evacuation_status)->toBe(HouseholdEvacuationStatus::Safe);
    expect($householdProfile->evacuation_status_updated_at)->not->toBeNull();
    expect(HouseholdStatusUpdate::query()->count())->toBe(1);
});

test('household status sync is idempotent for repeated sync ids', function () {
    $responder = User::factory()->responder()->create();
    $resident = User::factory()->resident()->create();
    $householdProfile = HouseholdProfile::factory()->for($resident)->create();

    $payload = [
        'sync_id' => (string) Str::uuid(),
        'reference_code' => $householdProfile->reference_code,
        'status' => HouseholdEvacuationStatus::Missing->value,
        'recorded_at' => now()->toIso8601String(),
        'captured_offline' => false,
    ];

    $this->actingAs($responder)
        ->postJson(route('portal.victim-status-updates.store'), $payload)
        ->assertSuccessful()
        ->assertJsonPath('status', 'synced');

    $this->actingAs($responder)
        ->postJson(route('portal.victim-status-updates.store'), $payload)
        ->assertSuccessful()
        ->assertJsonPath('status', 'already_synced')
        ->assertJsonPath('household.referenceCode', $householdProfile->reference_code)
        ->assertJsonPath('update.status', HouseholdEvacuationStatus::Missing->value);

    expect(HouseholdStatusUpdate::query()->count())->toBe(1);
});
