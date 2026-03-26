<?php

namespace App\Support;

use App\Models\User;
use App\UserRole;
use InvalidArgumentException;

final class PortalAccess
{
    /**
     * @return array<string, array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     path: string,
     *     route_name: string,
     *     group: string,
     *     icon: string,
     *     roles: list<string>,
     *     focus: array<string, string>
     * }>
     */
    public static function modules(): array
    {
        return [
            'map-monitoring' => [
                'key' => 'map-monitoring',
                'title' => 'Map Monitoring',
                'description' => 'Track citywide hazard activity, incident pins, and response movement across Mati City.',
                'path' => 'map-monitoring',
                'route_name' => 'portal.map-monitoring',
                'group' => 'Command Center',
                'icon' => 'map',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Monitor the full operational map and keep every barangay in view from one command center.',
                ],
            ],
            'users-management' => [
                'key' => 'users-management',
                'title' => 'Users Management',
                'description' => 'Manage staff accounts, role assignments, and platform access.',
                'path' => 'users-management',
                'route_name' => 'portal.users-management',
                'group' => 'Administration',
                'icon' => 'users',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Create, review, and maintain user accounts for admins, responders, and residents.',
                ],
            ],
            'barangay-management' => [
                'key' => 'barangay-management',
                'title' => 'Barangay Management',
                'description' => 'Maintain barangay-level records and local administrative setup.',
                'path' => 'barangay-management',
                'route_name' => 'portal.barangay-management',
                'group' => 'Administration',
                'icon' => 'map-pinned',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Review barangay coverage, assignments, and area-level administration settings.',
                ],
            ],
            'alerts' => [
                'key' => 'alerts',
                'title' => 'Alerts',
                'description' => 'Handle emergency alerts and public warning updates.',
                'path' => 'alerts',
                'route_name' => 'portal.alerts',
                'group' => 'Communication',
                'icon' => 'bell-ring',
                'roles' => [
                    UserRole::MainAdmin->value,
                    UserRole::BarangayAdmin->value,
                    UserRole::Resident->value,
                ],
                'focus' => [
                    UserRole::MainAdmin->value => 'Oversee citywide alert distribution and confirm official warning coverage.',
                    UserRole::BarangayAdmin->value => 'Receive and post barangay-level alerts for your local area when needed.',
                    UserRole::Resident->value => 'Receive official emergency alerts and stay updated on public announcements.',
                ],
            ],
            'incident-reports' => [
                'key' => 'incident-reports',
                'title' => 'Incident Reports',
                'description' => 'Review and coordinate reported incidents within the system.',
                'path' => 'incident-reports',
                'route_name' => 'portal.incident-reports',
                'group' => 'Coordination',
                'icon' => 'file-warning',
                'roles' => [
                    UserRole::MainAdmin->value,
                    UserRole::BarangayAdmin->value,
                ],
                'focus' => [
                    UserRole::MainAdmin->value => 'Review all reported incidents and coordinate escalation across the city.',
                    UserRole::BarangayAdmin->value => 'Track incident reports that affect your barangay and follow up locally.',
                ],
            ],
            'evacuation-centers' => [
                'key' => 'evacuation-centers',
                'title' => 'Evacuation Centers',
                'description' => 'Manage evacuation center status, capacity, and citywide readiness.',
                'path' => 'evacuation-centers',
                'route_name' => 'portal.evacuation-centers',
                'group' => 'Logistics',
                'icon' => 'house',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Track center readiness, occupancy, and operational availability across Mati City.',
                ],
            ],
            'relief-resources' => [
                'key' => 'relief-resources',
                'title' => 'Relief / Resources',
                'description' => 'Coordinate supplies, relief stock, and citywide resource availability.',
                'path' => 'relief-resources',
                'route_name' => 'portal.relief-resources',
                'group' => 'Logistics',
                'icon' => 'package',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Manage relief planning, supply visibility, and resource support for active operations.',
                ],
            ],
            'responder-dispatch' => [
                'key' => 'responder-dispatch',
                'title' => 'Responder Dispatch',
                'description' => 'Assign response teams and coordinate operational dispatching.',
                'path' => 'responder-dispatch',
                'route_name' => 'portal.responder-dispatch',
                'group' => 'Coordination',
                'icon' => 'radio',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Dispatch teams, coordinate assignments, and keep response workload balanced.',
                ],
            ],
            'analytics-reports' => [
                'key' => 'analytics-reports',
                'title' => 'Analytics / Reports',
                'description' => 'Review operational metrics, reporting trends, and system-wide summaries.',
                'path' => 'analytics-reports',
                'route_name' => 'portal.analytics-reports',
                'group' => 'Administration',
                'icon' => 'chart-column',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'See performance trends, export operational reports, and monitor platform activity.',
                ],
            ],
            'system-settings' => [
                'key' => 'system-settings',
                'title' => 'System Settings',
                'description' => 'Configure platform-wide behavior, defaults, and administrative settings.',
                'path' => 'system-settings',
                'route_name' => 'portal.system-settings',
                'group' => 'Administration',
                'icon' => 'settings-2',
                'roles' => [UserRole::MainAdmin->value],
                'focus' => [
                    UserRole::MainAdmin->value => 'Control system-wide settings, policy defaults, and administrative preferences.',
                ],
            ],
            'barangay-dashboard' => [
                'key' => 'barangay-dashboard',
                'title' => 'Barangay Dashboard',
                'description' => 'View local response information scoped to your barangay.',
                'path' => 'barangay-dashboard',
                'route_name' => 'portal.barangay-dashboard',
                'group' => 'Barangay Operations',
                'icon' => 'layout-grid',
                'roles' => [UserRole::BarangayAdmin->value],
                'focus' => [
                    UserRole::BarangayAdmin->value => 'Work from a barangay-only dashboard focused on local residents, incidents, and evacuees.',
                ],
            ],
            'residents-list' => [
                'key' => 'residents-list',
                'title' => 'Residents List',
                'description' => 'Review household registrations and residents within your barangay.',
                'path' => 'residents-list',
                'route_name' => 'portal.residents-list',
                'group' => 'Barangay Operations',
                'icon' => 'list',
                'roles' => [UserRole::BarangayAdmin->value],
                'focus' => [
                    UserRole::BarangayAdmin->value => 'Review registered residents under your barangay and verify local household records.',
                ],
            ],
            'evacuation-center-monitoring' => [
                'key' => 'evacuation-center-monitoring',
                'title' => 'Evacuation Center Monitoring',
                'description' => 'Monitor local evacuation centers and their current activity.',
                'path' => 'evacuation-center-monitoring',
                'route_name' => 'portal.evacuation-center-monitoring',
                'group' => 'Barangay Operations',
                'icon' => 'house',
                'roles' => [UserRole::BarangayAdmin->value],
                'focus' => [
                    UserRole::BarangayAdmin->value => 'Track centers that serve your barangay and keep visibility on local evacuee movement.',
                ],
            ],
            'relief-requests' => [
                'key' => 'relief-requests',
                'title' => 'Relief Requests',
                'description' => 'Submit and monitor local relief requests for barangay needs.',
                'path' => 'relief-requests',
                'route_name' => 'portal.relief-requests',
                'group' => 'Barangay Operations',
                'icon' => 'hand-heart',
                'roles' => [UserRole::BarangayAdmin->value],
                'focus' => [
                    UserRole::BarangayAdmin->value => 'Raise supply needs from the field and monitor incoming support for your barangay.',
                ],
            ],
            'evacuee-list' => [
                'key' => 'evacuee-list',
                'title' => 'Evacuee List',
                'description' => 'Track evacuees associated with your barangay.',
                'path' => 'evacuee-list',
                'route_name' => 'portal.evacuee-list',
                'group' => 'Barangay Operations',
                'icon' => 'clipboard-list',
                'roles' => [UserRole::BarangayAdmin->value],
                'focus' => [
                    UserRole::BarangayAdmin->value => 'Review evacuees from your barangay and keep local evacuation records aligned.',
                ],
            ],
            'assigned-incidents' => [
                'key' => 'assigned-incidents',
                'title' => 'Assigned Incidents',
                'description' => 'See the incidents currently assigned to your response team.',
                'path' => 'assigned-incidents',
                'route_name' => 'portal.assigned-incidents',
                'group' => 'Field Operations',
                'icon' => 'siren',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Work from the incident queue that has already been assigned to your team.',
                ],
            ],
            'live-map-location' => [
                'key' => 'live-map-location',
                'title' => 'Live Map / Location',
                'description' => 'Follow active locations, hazard pins, and assigned response areas.',
                'path' => 'live-map-location',
                'route_name' => 'portal.live-map-location',
                'group' => 'Field Operations',
                'icon' => 'map-pinned',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Use live location cues to stay oriented during assigned field operations.',
                ],
            ],
            'dispatch-tasks' => [
                'key' => 'dispatch-tasks',
                'title' => 'Dispatch Tasks',
                'description' => 'Review tasks issued through dispatch and track operational steps.',
                'path' => 'dispatch-tasks',
                'route_name' => 'portal.dispatch-tasks',
                'group' => 'Field Operations',
                'icon' => 'clipboard-check',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Follow task assignments from dispatch and keep response actions organized.',
                ],
            ],
            'report-update' => [
                'key' => 'report-update',
                'title' => 'Report Update',
                'description' => 'Submit operational updates from the field as situations evolve.',
                'path' => 'report-update',
                'route_name' => 'portal.report-update',
                'group' => 'Field Operations',
                'icon' => 'file-pen',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Send fresh field updates so command staff can make faster response decisions.',
                ],
            ],
            'victim-status' => [
                'key' => 'victim-status',
                'title' => 'Victim Status',
                'description' => 'Track the latest status of affected individuals during response operations.',
                'path' => 'victim-status',
                'route_name' => 'portal.victim-status',
                'group' => 'Field Operations',
                'icon' => 'heart-pulse',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Update victim conditions and keep case status visible during rescue operations.',
                ],
            ],
            'rescue-logs' => [
                'key' => 'rescue-logs',
                'title' => 'Rescue Logs',
                'description' => 'Maintain field logs for rescue activity and operational history.',
                'path' => 'rescue-logs',
                'route_name' => 'portal.rescue-logs',
                'group' => 'Field Operations',
                'icon' => 'notebook-text',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Record rescue actions, milestones, and notable findings from the field.',
                ],
            ],
            'task-completion' => [
                'key' => 'task-completion',
                'title' => 'Task Completion',
                'description' => 'Close out assigned work and confirm finished response tasks.',
                'path' => 'task-completion',
                'route_name' => 'portal.task-completion',
                'group' => 'Field Operations',
                'icon' => 'badge-check',
                'roles' => [UserRole::Responder->value],
                'focus' => [
                    UserRole::Responder->value => 'Mark completed tasks and communicate what is already resolved on the ground.',
                ],
            ],
            'submit-incident-report' => [
                'key' => 'submit-incident-report',
                'title' => 'Submit Incident Report',
                'description' => 'Report a local emergency or hazard concern through the resident portal.',
                'path' => 'submit-incident-report',
                'route_name' => 'portal.submit-incident-report',
                'group' => 'Resident Services',
                'icon' => 'triangle-alert',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Send incident details quickly so responders and local admins can review them.',
                ],
            ],
            'view-evacuation-centers' => [
                'key' => 'view-evacuation-centers',
                'title' => 'View Evacuation Centers',
                'description' => 'Check evacuation center information available to the public.',
                'path' => 'view-evacuation-centers',
                'route_name' => 'portal.view-evacuation-centers',
                'group' => 'Resident Services',
                'icon' => 'house',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Review available centers and prepare for movement during emergencies.',
                ],
            ],
            'check-disaster-map' => [
                'key' => 'check-disaster-map',
                'title' => 'Check Disaster Map',
                'description' => 'See disaster-related map information meant for public awareness.',
                'path' => 'check-disaster-map',
                'route_name' => 'portal.check-disaster-map',
                'group' => 'Resident Services',
                'icon' => 'map',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Use the public map to follow hazards, warnings, and important location updates.',
                ],
            ],
            'family-info' => [
                'key' => 'family-info',
                'title' => 'Family Info',
                'description' => 'Review and maintain family-related information for emergency coordination.',
                'path' => 'family-info',
                'route_name' => 'portal.family-info',
                'group' => 'Resident Services',
                'icon' => 'users-round',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Keep family records ready for evacuation tracking and follow-up coordination.',
                ],
            ],
            'emergency-contacts' => [
                'key' => 'emergency-contacts',
                'title' => 'Emergency Contacts',
                'description' => 'Store and review the contact details needed during emergencies.',
                'path' => 'emergency-contacts',
                'route_name' => 'portal.emergency-contacts',
                'group' => 'Resident Services',
                'icon' => 'phone',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Keep emergency contact details visible and ready when incidents happen.',
                ],
            ],
            'announcements' => [
                'key' => 'announcements',
                'title' => 'Announcements',
                'description' => 'Read official public updates and community notices.',
                'path' => 'announcements',
                'route_name' => 'portal.announcements',
                'group' => 'Resident Services',
                'icon' => 'megaphone',
                'roles' => [UserRole::Resident->value],
                'focus' => [
                    UserRole::Resident->value => 'Review public advisories, updates, and non-urgent community announcements.',
                ],
            ],
        ];
    }

    /**
     * @return list<array{
     *     title: string,
     *     description: string,
     *     href: string,
     *     icon: string,
     *     group: string
     * }>
     */
    public static function navigationFor(UserRole|string $role): array
    {
        $roleValue = self::roleValue($role);
        $items = [];

        foreach (self::modules() as $module) {
            if (! in_array($roleValue, $module['roles'], true)) {
                continue;
            }

            $items[] = [
                'title' => $module['title'],
                'description' => $module['description'],
                'href' => '/'.$module['path'],
                'icon' => $module['icon'],
                'group' => $module['group'],
            ];
        }

        return $items;
    }

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     roleLabel: string,
     *     barangay: string|null,
     *     highlights: list<string>,
     *     quickLinks: list<array{
     *         title: string,
     *         description: string,
     *         href: string,
     *         icon: string,
     *         group: string
     *     }>,
     *     mapPreview: array{
     *         title: string,
     *         href: string,
     *         mapFocus: array{
     *             city: string,
     *             longitude: float,
     *             latitude: float,
     *             zoom: float,
     *             styleId: string,
     *             title: string,
     *             description: string,
     *             note: string
     *         }|null
     *     }|null
     * }
     */
    public static function dashboardPropsFor(User $user): array
    {
        $role = $user->role;
        $content = match ($role) {
            UserRole::MainAdmin => [
                'title' => 'Dashboard',
                'description' => 'Full access to citywide monitoring, management, and coordination tools.',
                'highlights' => [
                    'Monitor the dashboard, map activity, and system-wide alerts.',
                    'Manage users, barangays, dispatch, evacuation centers, and resources.',
                    'Review analytics, reports, and administrative system settings.',
                ],
            ],
            UserRole::BarangayAdmin => [
                'title' => 'Barangay Dashboard',
                'description' => 'Focused access for monitoring people, incidents, and evacuees inside your barangay scope.',
                'highlights' => [
                    'Track residents, evacuees, and local incident reports in your barangay.',
                    'Receive or publish barangay-level alerts and monitor evacuation centers.',
                    'Coordinate local relief requests and watch community-level movement.',
                ],
            ],
            UserRole::Responder => [
                'title' => 'Responder Overview',
                'description' => 'Operational access for assigned incidents, field reporting, and rescue progress updates.',
                'highlights' => [
                    'Review assigned incidents, dispatch tasks, and live operational locations.',
                    'Update field reports, victim status, rescue logs, and completion progress.',
                    'Work from a focused operations view built for active response teams.',
                ],
            ],
            UserRole::Resident => [
                'title' => 'Resident Overview',
                'description' => 'Simple access to alerts, evacuation information, family records, and public updates.',
                'highlights' => [
                    'Receive alerts, announcements, and emergency contact information.',
                    'Submit incident reports and check evacuation center availability.',
                    'Review family information and public disaster map updates.',
                ],
            ],
        };

        return [
            'title' => $content['title'],
            'description' => $content['description'],
            'roleLabel' => $role->label(),
            'barangay' => $user->householdProfile?->barangay,
            'highlights' => $content['highlights'],
            'quickLinks' => self::navigationFor($role),
            'mapPreview' => self::dashboardMapPreviewFor($role),
        ];
    }

    /**
     * @return array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     href: string,
     *     group: string,
     *     icon: string,
     *     roleFocus: string,
     *     allowedRoles: list<string>,
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
     *     }|null
     * }
     */
    public static function modulePageProps(string $key, UserRole|string $role): array
    {
        $module = self::module($key);
        $roleValue = self::roleValue($role);

        return [
            'key' => $module['key'],
            'title' => $module['title'],
            'description' => $module['description'],
            'href' => '/'.$module['path'],
            'group' => $module['group'],
            'icon' => $module['icon'],
            'roleFocus' => $module['focus'][$roleValue] ?? $module['description'],
            'allowedRoles' => array_map(
                fn (string $allowedRole): string => UserRole::from($allowedRole)->label(),
                $module['roles'],
            ),
            ...PortalPresentation::moduleContent(
                $module,
                $roleValue,
            ),
        ];
    }

    /**
     * @return list<array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     path: string,
     *     route_name: string,
     *     group: string,
     *     icon: string,
     *     roles: list<string>,
     *     focus: array<string, string>
     * }>
     */
    public static function routeModules(): array
    {
        return array_values(self::modules());
    }

    /**
     * @return array{
     *     key: string,
     *     title: string,
     *     description: string,
     *     path: string,
     *     route_name: string,
     *     group: string,
     *     icon: string,
     *     roles: list<string>,
     *     focus: array<string, string>
     * }
     */
    public static function module(string $key): array
    {
        $module = self::modules()[$key] ?? null;

        if ($module === null) {
            throw new InvalidArgumentException("Unknown portal module [{$key}].");
        }

        return $module;
    }

    /**
     * @return array{
     *     title: string,
     *     href: string,
     *     mapFocus: array{
     *         city: string,
     *         longitude: float,
     *         latitude: float,
     *         zoom: float,
     *         styleId: string,
     *         title: string,
     *         description: string,
     *         note: string
     *     }|null
     * }|null
     */
    private static function dashboardMapPreviewFor(UserRole $role): ?array
    {
        $moduleKey = match ($role) {
            UserRole::MainAdmin => 'map-monitoring',
            UserRole::Responder => 'live-map-location',
            UserRole::Resident => 'check-disaster-map',
            default => null,
        };

        if ($moduleKey === null) {
            return null;
        }

        $module = self::module($moduleKey);

        return [
            'title' => $module['title'],
            'href' => '/'.$module['path'],
            'mapFocus' => MatiCityMap::focusFor($module['key']),
        ];
    }

    private static function roleValue(UserRole|string $role): string
    {
        return $role instanceof UserRole
            ? $role->value
            : UserRole::from($role)->value;
    }
}
