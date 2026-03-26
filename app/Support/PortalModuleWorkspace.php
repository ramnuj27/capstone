<?php

namespace App\Support;

use App\AgeGroup;
use App\Models\HouseholdMember;
use App\Models\HouseholdProfile;
use App\Models\User;
use App\UserRole;
use Laravel\Fortify\Features;

final class PortalModuleWorkspace
{
    /**
     * @return array{
     *     title: string,
     *     metrics: list<array{label: string, value: string, helper: string}>,
     *     sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     * }|null
     */
    public static function for(string $moduleKey): ?array
    {
        return match ($moduleKey) {
            'users-management' => self::usersManagement(),
            'barangay-management' => self::barangayManagement(),
            'analytics-reports' => self::analyticsReports(),
            'system-settings' => self::systemSettings(),
            default => null,
        };
    }

    /**
     * @return array{
     *     title: string,
     *     metrics: list<array{label: string, value: string, helper: string}>,
     *     sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     * }
     */
    private static function usersManagement(): array
    {
        $recentUsers = User::query()
            ->with('householdProfile:id,user_id,barangay')
            ->latest('id')
            ->limit(5)
            ->get(['id', 'name', 'email', 'role']);

        $roleRows = array_map(function (UserRole $role): array {
            $count = User::query()->where('role', $role->value)->count();

            return self::row(
                $role->label(),
                $count.' accounts',
                match ($role) {
                    UserRole::MainAdmin => 'Citywide administrative access',
                    UserRole::BarangayAdmin => 'Barangay-level administration',
                    UserRole::Responder => 'Operational response teams',
                    UserRole::Resident => 'Public-facing resident access',
                },
            );
        }, UserRole::cases());

        return [
            'title' => 'Users overview',
            'metrics' => [
                self::metric('Total users', User::query()->count(), 'All accounts in the portal'),
                self::metric('Residents', User::query()->where('role', UserRole::Resident->value)->count(), 'Resident-facing accounts'),
                self::metric('Responders', User::query()->where('role', UserRole::Responder->value)->count(), 'Field operation accounts'),
                self::metric('Linked profiles', HouseholdProfile::query()->count(), 'Users with household records'),
            ],
            'sections' => [
                self::section('Latest accounts', $recentUsers->map(function (User $user): array {
                    $barangay = $user->householdProfile?->barangay;

                    return self::row(
                        $user->name,
                        $user->email,
                        $user->role->label().($barangay === null ? '' : ' - '.$barangay),
                    );
                })->all(), 'No accounts yet', 'Create users to start building portal access.'),
                self::section('Role distribution', $roleRows),
            ],
        ];
    }

    /**
     * @return array{
     *     title: string,
     *     metrics: list<array{label: string, value: string, helper: string}>,
     *     sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     * }
     */
    private static function barangayManagement(): array
    {
        $householdsByBarangay = HouseholdProfile::query()
            ->select('barangay')
            ->selectRaw('count(*) as total_households')
            ->groupBy('barangay')
            ->orderByDesc('total_households')
            ->orderBy('barangay')
            ->limit(5)
            ->get();

        $activeBarangays = HouseholdProfile::query()
            ->select('barangay')
            ->distinct()
            ->pluck('barangay')
            ->all();

        $coverageGaps = collect(MatiBarangays::values())
            ->diff($activeBarangays)
            ->take(5)
            ->values()
            ->all();

        $roleSplit = HouseholdProfile::query()
            ->select('household_role')
            ->selectRaw('count(*) as total_households')
            ->groupBy('household_role')
            ->orderBy('household_role')
            ->get();

        return [
            'title' => 'Barangay coverage',
            'metrics' => [
                self::metric('Total barangays', count(MatiBarangays::values()), 'Barangays within Mati City'),
                self::metric('Active barangays', count($activeBarangays), 'Barangays with registrations'),
                self::metric('Households', HouseholdProfile::query()->count(), 'Registered household profiles'),
                self::metric('Household members', HouseholdMember::query()->count(), 'Registered member records'),
            ],
            'sections' => [
                self::section('Most active barangays', $householdsByBarangay->map(function (object $row): array {
                    return self::row(
                        $row->barangay,
                        $row->total_households.' households',
                        'Registered household coverage',
                    );
                })->all(), 'No barangay registrations yet', 'Once households register, coverage appears here.'),
                self::section('Coverage gaps', array_map(
                    fn (string $barangay): array => self::row($barangay, 'No registrations yet', 'Needs household registration activity'),
                    $coverageGaps,
                ), 'All barangays already have registrations', 'Citywide household coverage is present.'),
                self::section('Registrant split', $roleSplit->map(function (object $row): array {
                    return self::row(
                        ucfirst((string) $row->household_role),
                        $row->total_households.' households',
                        'Current household role mix',
                    );
                })->all(), 'No household roles recorded', 'Registration data will appear here.'),
            ],
        ];
    }

    /**
     * @return array{
     *     title: string,
     *     metrics: list<array{label: string, value: string, helper: string}>,
     *     sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     * }
     */
    private static function analyticsReports(): array
    {
        $profileAgeCounts = HouseholdProfile::query()
            ->select('age_group')
            ->selectRaw('count(*) as total_people')
            ->groupBy('age_group')
            ->pluck('total_people', 'age_group');

        $memberAgeCounts = HouseholdMember::query()
            ->select('age_group')
            ->selectRaw('count(*) as total_people')
            ->groupBy('age_group')
            ->pluck('total_people', 'age_group');

        $profileSexCounts = HouseholdProfile::query()
            ->select('sex')
            ->selectRaw('count(*) as total_people')
            ->groupBy('sex')
            ->pluck('total_people', 'sex');

        $memberSexCounts = HouseholdMember::query()
            ->select('sex')
            ->selectRaw('count(*) as total_people')
            ->groupBy('sex')
            ->pluck('total_people', 'sex');

        $householdsByBarangay = HouseholdProfile::query()
            ->select('barangay')
            ->selectRaw('count(*) as total_households')
            ->groupBy('barangay')
            ->orderByDesc('total_households')
            ->orderBy('barangay')
            ->limit(5)
            ->get();

        $totalHouseholds = HouseholdProfile::query()->count();
        $totalMembers = HouseholdMember::query()->count();
        $totalPeople = $totalHouseholds + $totalMembers;
        $pwdCount = HouseholdProfile::query()->where('is_pwd', true)->count() + HouseholdMember::query()->where('is_pwd', true)->count();
        $seniorCount = ((int) ($profileAgeCounts['senior'] ?? 0)) + ((int) ($memberAgeCounts['senior'] ?? 0));

        return [
            'title' => 'Analytics snapshot',
            'metrics' => [
                self::metric('Households', $totalHouseholds, 'Primary household registrations'),
                self::metric('People tracked', $totalPeople, 'Profiles plus household members'),
                self::metric('PWD records', $pwdCount, 'Profiles and members marked as PWD'),
                self::metric('Senior citizens', $seniorCount, 'Tracked senior records'),
            ],
            'sections' => [
                self::section('Age groups', array_map(function (AgeGroup $group) use ($profileAgeCounts, $memberAgeCounts): array {
                    $total = ((int) ($profileAgeCounts[$group->value] ?? 0)) + ((int) ($memberAgeCounts[$group->value] ?? 0));

                    return self::row(
                        ucfirst($group->value),
                        $total.' people',
                        'Profiles and household members combined',
                    );
                }, AgeGroup::cases())),
                self::section('Sex distribution', [
                    self::row(
                        'Male',
                        (((int) ($profileSexCounts['male'] ?? 0)) + ((int) ($memberSexCounts['male'] ?? 0))).' people',
                        'Combined male records',
                    ),
                    self::row(
                        'Female',
                        (((int) ($profileSexCounts['female'] ?? 0)) + ((int) ($memberSexCounts['female'] ?? 0))).' people',
                        'Combined female records',
                    ),
                ]),
                self::section('High-activity barangays', $householdsByBarangay->map(function (object $row): array {
                    return self::row(
                        $row->barangay,
                        $row->total_households.' households',
                        'Current household concentration',
                    );
                })->all(), 'No household analytics yet', 'Register households to populate this report.'),
            ],
        ];
    }

    /**
     * @return array{
     *     title: string,
     *     metrics: list<array{label: string, value: string, helper: string}>,
     *     sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     * }
     */
    private static function systemSettings(): array
    {
        return [
            'title' => 'System status',
            'metrics' => [
                self::metric('App', (string) config('app.name'), 'Current application name'),
                self::metric('Environment', app()->environment(), 'Active Laravel environment'),
                self::metric('Timezone', (string) config('app.timezone'), 'Application timezone'),
                self::metric('Database', (string) config('database.default'), 'Current default connection'),
            ],
            'sections' => [
                self::section('Authentication', [
                    self::row('Registration', self::status(Features::enabled(Features::registration())), 'Public sign-up availability'),
                    self::row('Password reset', self::status(Features::enabled(Features::resetPasswords())), 'Recovery flow status'),
                    self::row('Email verification', self::status(Features::enabled(Features::emailVerification())), 'Account verification requirement'),
                    self::row('Two-factor', self::status(Features::canManageTwoFactorAuthentication()), 'Extra sign-in protection'),
                ]),
                self::section('Platform services', [
                    self::row('Map token', self::status(filled((string) env('VITE_MAPBOX_ACCESS_TOKEN'))), 'Map rendering readiness'),
                    self::row('Queue connection', (string) config('queue.default'), 'Background job transport'),
                    self::row('Session driver', (string) config('session.driver'), 'Session storage backend'),
                    self::row('Mail from', (string) (config('mail.from.address') ?: 'Not set'), 'Outgoing notification sender'),
                ]),
            ],
        ];
    }

    /**
     * @return array{label: string, value: string, helper: string}
     */
    private static function metric(string $label, int|string $value, string $helper): array
    {
        return [
            'label' => $label,
            'value' => (string) $value,
            'helper' => $helper,
        ];
    }

    /**
     * @return array{primary: string, secondary: string, meta: string}
     */
    private static function row(string $primary, string $secondary, string $meta): array
    {
        return [
            'primary' => $primary,
            'secondary' => $secondary,
            'meta' => $meta,
        ];
    }

    /**
     * @param  list<array{primary: string, secondary: string, meta: string}>  $rows
     * @return array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}
     */
    private static function section(string $title, array $rows, string $emptyPrimary = 'Nothing to show yet', string $emptyMeta = 'No records available.'): array
    {
        return [
            'title' => $title,
            'rows' => $rows === []
                ? [self::row($emptyPrimary, 'No data yet', $emptyMeta)]
                : array_values($rows),
        ];
    }

    private static function status(bool $enabled): string
    {
        return $enabled ? 'Enabled' : 'Disabled';
    }
}