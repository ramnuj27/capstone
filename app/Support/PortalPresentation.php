<?php

namespace App\Support;

use App\Models\User;
use App\UserRole;

final class PortalPresentation
{
    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     scope: string,
     *     chips: list<string>
     * }
     */
    public static function overviewFor(User $user): array
    {
        $roleContent = match ($user->role) {
            UserRole::MainAdmin => [
                'title' => 'Main Admin Control',
                'description' => 'Citywide access to monitoring, users, dispatch, resources, and system oversight.',
                'chips' => ['City command', 'Operational oversight'],
            ],
            UserRole::BarangayAdmin => [
                'title' => 'Barangay Operations',
                'description' => 'Localized access for resident tracking, incident coordination, and barangay response visibility.',
                'chips' => ['Barangay scope', 'Community monitoring'],
            ],
            UserRole::Responder => [
                'title' => 'Field Operations',
                'description' => 'Focused access for active incidents, rescue tasks, live updates, and ground reporting.',
                'chips' => ['Field response', 'Live updates'],
            ],
            UserRole::Resident => [
                'title' => 'Resident Access',
                'description' => 'Simple access to alerts, evacuation info, family records, and public announcements.',
                'chips' => ['Household portal', 'Public alerts'],
            ],
        };

        $scope = $user->householdProfile?->barangay === null
            ? 'Mati City, Davao Oriental'
            : $user->householdProfile->barangay.', Mati City';

        return [
            'title' => $roleContent['title'],
            'description' => $roleContent['description'],
            'scope' => $scope,
            'chips' => [
                ...$roleContent['chips'],
                count(PortalAccess::navigationFor($user->role)).' sections',
            ],
        ];
    }

    /**
     * @param  array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     path: string,
     *     route_name: string,
     *     group: string,
     *     icon: string,
     *     roles: list<string>,
     *     focus: array<string, string>
     * }  $module
     * @return array{
     *     summary: string,
     *     featuredCards: list<array{title: string, description: string}>,
     *     checklist: list<string>,
     *     mapFocus: array{
     *         city: string,
     *         longitude: float,
     *         latitude: float,
     *         zoom: float,
     *         styleId: string,
     *         title: string,
     *         description: string,
     *         note: string
     *     }|null,
     *     workspace: array{
     *         title: string,
     *         metrics: list<array{label: string, value: string, helper: string}>,
     *         sections: list<array{title: string, rows: list<array{primary: string, secondary: string, meta: string}>}>
     *     }|null
     * }
     */
    public static function moduleContent(array $module, string $roleValue): array
    {
        $groupContent = self::groupContent($module['group']);
        $roleFocus = $module['focus'][$roleValue] ?? $module['description'];
        $mapFocus = MatiCityMap::focusFor($module['key']);

        return [
            'summary' => $groupContent['summary'],
            'featuredCards' => [
                [
                    'title' => 'Current access',
                    'description' => $roleFocus,
                ],
                [
                    'title' => $groupContent['scopeTitle'],
                    'description' => $groupContent['scopeDescription'],
                ],
                [
                    'title' => $mapFocus['title'] ?? 'Operational direction',
                    'description' => $mapFocus['description'] ?? $module['description'],
                ],
            ],
            'checklist' => $groupContent['checklist'],
            'mapFocus' => $mapFocus,
            'workspace' => PortalModuleWorkspace::for($module['key']),
        ];
    }

    /**
     * @return array{
     *     summary: string,
     *     scopeTitle: string,
     *     scopeDescription: string,
     *     checklist: list<string>
     * }
     */
    private static function groupContent(string $group): array
    {
        return match ($group) {
            'Command Center' => [
                'summary' => 'Keep the city-level response picture aligned around Mati City command coverage and real-time operational visibility.',
                'scopeTitle' => 'Citywide scope',
                'scopeDescription' => 'This command-center area is meant for wide operational visibility across Mati City, with attention on hotspots, movement, and strategic coordination.',
                'checklist' => [
                    'Review the latest citywide picture before taking action.',
                    'Confirm barangay-level visibility and command priorities.',
                    'Keep shared operational context clear for the next handoff.',
                ],
            ],
            'Administration' => [
                'summary' => 'Use this space to maintain platform structure, enforce clean records, and keep administrative controls consistent.',
                'scopeTitle' => 'Administrative scope',
                'scopeDescription' => 'This section supports structured system management so platform records, access settings, and reporting flows stay reliable.',
                'checklist' => [
                    'Review the latest records before saving administrative changes.',
                    'Keep role access and data ownership aligned with policy.',
                    'Document key adjustments that affect daily operations.',
                ],
            ],
            'Communication' => [
                'summary' => 'Use this communication space to keep warnings, notices, and public updates consistent across the right audience.',
                'scopeTitle' => 'Message coverage',
                'scopeDescription' => 'This module centers on visibility for alerts and updates so notices reach the right people with clear timing and intent.',
                'checklist' => [
                    'Confirm the intended audience before posting or reviewing updates.',
                    'Keep emergency language short, clear, and action-oriented.',
                    'Watch for follow-up notices that need to be escalated or repeated.',
                ],
            ],
            'Coordination' => [
                'summary' => 'Coordinate incidents, workloads, and response alignment from one operational picture that supports faster decisions.',
                'scopeTitle' => 'Coordination flow',
                'scopeDescription' => 'This area helps organize what needs attention next, who should act, and how the response sequence stays aligned.',
                'checklist' => [
                    'Verify incoming reports before assigning the next action.',
                    'Track who owns the next step and who still needs updates.',
                    'Keep city and barangay coordination notes aligned.',
                ],
            ],
            'Logistics' => [
                'summary' => 'Support readiness with clean visibility into centers, supplies, movement, and resource availability.',
                'scopeTitle' => 'Logistics scope',
                'scopeDescription' => 'This section is built for readiness monitoring so teams can check center conditions, stock visibility, and support capacity quickly.',
                'checklist' => [
                    'Review capacity or stock conditions before issuing requests.',
                    'Keep location and readiness data current for shared visibility.',
                    'Flag shortages or constraints that affect response timing.',
                ],
            ],
            'Barangay Operations' => [
                'summary' => 'Focus on barangay-level monitoring so local households, incidents, and evacuee records stay easy to review.',
                'scopeTitle' => 'Barangay scope',
                'scopeDescription' => 'This module is tuned for local operations where barangay staff need clean visibility on residents, movement, and urgent community updates.',
                'checklist' => [
                    'Review local records and update the latest barangay picture.',
                    'Keep community-level requests and local activity visible.',
                    'Coordinate local follow-up before issues grow wider in scope.',
                ],
            ],
            'Field Operations' => [
                'summary' => 'Use this field view to keep assignments, rescue actions, and on-ground status updates organized while operations are active.',
                'scopeTitle' => 'Field scope',
                'scopeDescription' => 'This area helps responders stay focused on active work, route context, and progress updates without leaving the operational view.',
                'checklist' => [
                    'Confirm the active assignment before moving to the next task.',
                    'Keep timestamps, field findings, and status updates fresh.',
                    'Close out completed actions so command has an accurate picture.',
                ],
            ],
            'Resident Services' => [
                'summary' => 'This resident-facing space keeps public awareness, household information, and essential emergency details easy to find.',
                'scopeTitle' => 'Resident scope',
                'scopeDescription' => 'This area is meant for simple community access so residents can check updates, report incidents, and stay prepared.',
                'checklist' => [
                    'Review the latest public information before an emergency escalates.',
                    'Keep household and contact details updated when needed.',
                    'Use official pages here for reports, centers, and notices.',
                ],
            ],
            default => [
                'summary' => 'This module is ready for real EvaqReady content and operational workflows.',
                'scopeTitle' => 'Working scope',
                'scopeDescription' => 'Use this area for the next operational step tied to the selected module.',
                'checklist' => [
                    'Review current information.',
                    'Take the next required action.',
                    'Keep shared visibility updated.',
                ],
            ],
        };
    }
}