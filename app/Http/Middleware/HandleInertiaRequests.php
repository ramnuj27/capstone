<?php

namespace App\Http\Middleware;

use App\Support\PortalAccess;
use App\Support\PortalPresentation;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing('householdProfile:id,user_id,barangay');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user === null ? null : [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'email_verified_at' => $user->email_verified_at?->toJSON(),
                    'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
                    'created_at' => $user->created_at?->toJSON(),
                    'updated_at' => $user->updated_at?->toJSON(),
                    'role' => $user->role->value,
                    'role_label' => $user->role->label(),
                    'barangay' => $user->householdProfile?->barangay,
                ],
            ],
            'portal' => $user === null ? null : [
                'navigation' => PortalAccess::navigationFor($user->role),
                'overview' => PortalPresentation::overviewFor($user),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
