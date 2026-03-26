<?php

use App\Models\HouseholdMember;
use App\Models\HouseholdProfile;
use App\Models\User;
use App\Support\PortalAccess;
use Inertia\Testing\AssertableInertia as Assert;

test('main admin dashboard exposes the admin access set and sidebar overview', function () {
    $user = User::factory()->mainAdmin()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/dashboard')
            ->where('roleLabel', 'Main Admin')
            ->has('quickLinks', 10)
            ->where('quickLinks.0.title', 'Map Monitoring')
            ->where('quickLinks.9.title', 'System Settings')
            ->where('mapPreview.title', 'Map Monitoring')
            ->where('mapPreview.mapFocus.city', 'Mati City, Davao Oriental')
            ->where('mapPreview.mapFocus.title', 'Mati City command map')
            ->where('portal.overview.title', 'Main Admin Control')
            ->where('portal.overview.scope', 'Mati City, Davao Oriental')
            ->has('portal.overview.chips', 3)
            ->etc(),
        );
});

test('main admin map monitoring module includes mati city map focus', function () {
    $user = User::factory()->mainAdmin()->create();

    $this->actingAs($user)
        ->get(route('portal.map-monitoring'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/module')
            ->where('module.title', 'Map Monitoring')
            ->where('module.mapFocus.city', 'Mati City, Davao Oriental')
            ->where('module.mapFocus.title', 'Mati City command map')
            ->where('module.mapFocus.styleId', 'mapbox/satellite-streets-v12')
            ->has('module.featuredCards', 3)
            ->has('module.checklist', 3)
            ->etc(),
        );
});

test('main admin users management module shows live account metrics', function () {
    $admin = User::factory()->mainAdmin()->create(['name' => 'City Admin']);

    $resident = User::factory()->resident()->create([
        'name' => 'Resident Alpha',
        'email' => 'resident-alpha@example.com',
    ]);
    HouseholdProfile::factory()->for($resident)->create(['barangay' => 'Central']);

    $responder = User::factory()->responder()->create([
        'name' => 'Responder Bravo',
        'email' => 'responder-bravo@example.com',
    ]);
    HouseholdProfile::factory()->for($responder)->create(['barangay' => 'Dahican']);

    $response = $this->actingAs($admin)
        ->get(route('portal.users-management'))
        ->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('portal/module');
    expect(data_get($page, 'props.module.workspace.title'))->toBe('Users overview');
    expect(data_get($page, 'props.module.workspace.metrics.0.label'))->toBe('Total users');
    expect(data_get($page, 'props.module.workspace.metrics.0.value'))->toBe('3');
    expect(data_get($page, 'props.module.workspace.metrics.3.value'))->toBe('2');
    expect(data_get($page, 'props.module.workspace.sections.0.title'))->toBe('Latest accounts');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.primary'))->toBe('Responder Bravo');
    expect(data_get($page, 'props.module.workspace.sections.1.title'))->toBe('Role distribution');
    expect(data_get($page, 'props.module.workspace.sections.1.rows.2.primary'))->toBe('Responder');
    expect(data_get($page, 'props.module.workspace.sections.1.rows.2.secondary'))->toBe('1 accounts');
});

test('main admin users management module can be json encoded for inertia payloads', function () {
    $admin = User::factory()->mainAdmin()->create();

    $resident = User::factory()->resident()->create();
    HouseholdProfile::factory()->for($resident)->create(['barangay' => 'Central']);

    expect(fn () => json_encode(
        PortalAccess::modulePageProps('users-management', $admin->role),
        JSON_THROW_ON_ERROR,
    ))->not->toThrow(JsonException::class);
});

test('main admin barangay management module shows coverage metrics', function () {
    $admin = User::factory()->mainAdmin()->create();

    $centralResidentA = User::factory()->resident()->create();
    HouseholdProfile::factory()->for($centralResidentA)->create([
        'barangay' => 'Central',
        'household_role' => 'resident',
    ]);

    $centralResidentB = User::factory()->resident()->create();
    HouseholdProfile::factory()->for($centralResidentB)->create([
        'barangay' => 'Central',
        'household_role' => 'respondent',
    ]);

    $dahicanResident = User::factory()->resident()->create();
    $dahicanProfile = HouseholdProfile::factory()->for($dahicanResident)->create([
        'barangay' => 'Dahican',
        'household_role' => 'resident',
    ]);

    HouseholdMember::factory()->for($dahicanProfile)->create(['position' => 1]);
    HouseholdMember::factory()->for($dahicanProfile)->create(['position' => 2]);

    $response = $this->actingAs($admin)
        ->get(route('portal.barangay-management'))
        ->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('portal/module');
    expect(data_get($page, 'props.module.workspace.title'))->toBe('Barangay coverage');
    expect(data_get($page, 'props.module.workspace.metrics.0.value'))->toBe('26');
    expect(data_get($page, 'props.module.workspace.metrics.1.value'))->toBe('2');
    expect(data_get($page, 'props.module.workspace.metrics.2.value'))->toBe('3');
    expect(data_get($page, 'props.module.workspace.metrics.3.value'))->toBe('2');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.primary'))->toBe('Central');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.secondary'))->toBe('2 households');
    expect(data_get($page, 'props.module.workspace.sections.2.rows.0.primary'))->toBe('Resident');
});

test('main admin analytics reports module shows aggregated registration stats', function () {
    $admin = User::factory()->mainAdmin()->create();

    $childResident = User::factory()->resident()->create();
    HouseholdProfile::factory()->for($childResident)->create([
        'age' => 12,
        'age_group' => 'child',
        'sex' => 'male',
        'is_pwd' => false,
        'barangay' => 'Central',
    ]);

    $adultResident = User::factory()->resident()->create();
    $adultProfile = HouseholdProfile::factory()->for($adultResident)->create([
        'age' => 34,
        'age_group' => 'adult',
        'sex' => 'female',
        'is_pwd' => true,
        'barangay' => 'Dahican',
    ]);

    HouseholdMember::factory()->for($adultProfile)->create([
        'position' => 1,
        'age' => 70,
        'age_group' => 'senior',
        'sex' => 'female',
        'is_pwd' => true,
    ]);

    HouseholdMember::factory()->for($adultProfile)->create([
        'position' => 2,
        'age' => 15,
        'age_group' => 'child',
        'sex' => 'male',
        'is_pwd' => false,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('portal.analytics-reports'))
        ->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('portal/module');
    expect(data_get($page, 'props.module.workspace.title'))->toBe('Analytics snapshot');
    expect(data_get($page, 'props.module.workspace.metrics.0.value'))->toBe('2');
    expect(data_get($page, 'props.module.workspace.metrics.1.value'))->toBe('4');
    expect(data_get($page, 'props.module.workspace.metrics.2.value'))->toBe('2');
    expect(data_get($page, 'props.module.workspace.metrics.3.value'))->toBe('1');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.primary'))->toBe('Child');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.secondary'))->toBe('2 people');
    expect(data_get($page, 'props.module.workspace.sections.1.rows.0.secondary'))->toBe('2 people');
    expect(data_get($page, 'props.module.workspace.sections.2.rows.0.primary'))->toBe('Central');
});

test('main admin system settings module shows current platform status', function () {
    $admin = User::factory()->mainAdmin()->create();

    $response = $this->actingAs($admin)
        ->get(route('portal.system-settings'))
        ->assertOk();

    $page = $response->viewData('page');

    expect($page['component'])->toBe('portal/module');
    expect(data_get($page, 'props.module.workspace.title'))->toBe('System status');
    expect(data_get($page, 'props.module.workspace.metrics.0.value'))->toBe(config('app.name'));
    expect(data_get($page, 'props.module.workspace.metrics.1.value'))->toBe(app()->environment());
    expect(data_get($page, 'props.module.workspace.sections.0.title'))->toBe('Authentication');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.primary'))->toBe('Registration');
    expect(data_get($page, 'props.module.workspace.sections.0.rows.0.secondary'))->toBe('Enabled');
    expect(data_get($page, 'props.module.workspace.sections.1.rows.0.primary'))->toBe('Map token');
});

test('barangay admin can open barangay dashboard module', function () {
    $user = User::factory()->barangayAdmin()->create();

    $this->actingAs($user)
        ->get(route('portal.barangay-dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/module')
            ->where('module.title', 'Barangay Dashboard')
            ->where('module.allowedRoles.0', 'Barangay Admin')
            ->where('module.summary', 'Focus on barangay-level monitoring so local households, incidents, and evacuee records stay easy to review.')
            ->has('module.featuredCards', 3)
            ->has('module.checklist', 3)
            ->etc(),
        );
});

test('resident dashboard only shares resident-facing navigation', function () {
    $user = User::factory()->resident()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/dashboard')
            ->where('roleLabel', 'Resident')
            ->has('quickLinks', 7)
            ->where('quickLinks.0.title', 'Alerts')
            ->where('quickLinks.6.title', 'Announcements')
            ->where('mapPreview.title', 'Check Disaster Map')
            ->where('portal.overview.title', 'Resident Access')
            ->etc(),
        );
});

test('responder cannot access main admin modules', function () {
    $user = User::factory()->responder()->create();

    $this->actingAs($user)
        ->get(route('portal.users-management'))
        ->assertForbidden();
});

test('resident can open alerts but not incident reports', function () {
    $user = User::factory()->resident()->create();

    $this->actingAs($user)
        ->get(route('portal.alerts'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portal/module')
            ->where('module.title', 'Alerts')
            ->has('module.featuredCards', 3)
            ->etc(),
        );

    $this->actingAs($user)
        ->get(route('portal.incident-reports'))
        ->assertForbidden();
});
