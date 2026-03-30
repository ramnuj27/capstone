<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\DeletePortalUserRequest;
use App\Http\Requests\Portal\UpdatePortalUserRequest;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PortalUserManagementController extends Controller
{
    public function update(UpdatePortalUserRequest $request, User $user): RedirectResponse
    {
        $this->ensureUserCanBeManaged($request->user(), $user);

        $validated = $request->validated();
        $targetRole = UserRole::from($validated['role']);
        $barangay = $validated['barangay'] ?? null;

        $this->ensureMainAdminCoverageIsKept($user, $targetRole);
        $this->ensureBarangayAssignmentCanBeUpdated($user, $barangay);

        DB::transaction(function () use ($user, $targetRole, $barangay): void {
            $user->forceFill([
                'role' => $targetRole,
            ])->save();

            if ($user->householdProfile !== null) {
                $user->householdProfile->forceFill([
                    'barangay' => $barangay,
                ])->save();
            }
        });

        return to_route('portal.users-management');
    }

    public function destroy(DeletePortalUserRequest $request, User $user): RedirectResponse
    {
        $this->ensureUserCanBeManaged($request->user(), $user);
        $this->ensureMainAdminCoverageIsKept($user, null);

        $user->delete();

        return to_route('portal.users-management');
    }

    private function ensureUserCanBeManaged(User $actingUser, User $targetUser): void
    {
        if ($actingUser->is($targetUser)) {
            throw ValidationException::withMessages([
                'user' => 'Use your profile settings if you need to manage your own account.',
            ]);
        }
    }

    private function ensureMainAdminCoverageIsKept(User $targetUser, ?UserRole $nextRole): void
    {
        if (! $targetUser->hasRole(UserRole::MainAdmin)) {
            return;
        }

        if ($nextRole === UserRole::MainAdmin) {
            return;
        }

        $mainAdminCount = User::query()
            ->where('role', UserRole::MainAdmin->value)
            ->count();

        if ($mainAdminCount <= 1) {
            throw ValidationException::withMessages([
                'role' => 'Keep at least one main admin account active in the system.',
            ]);
        }
    }

    private function ensureBarangayAssignmentCanBeUpdated(User $targetUser, ?string $barangay): void
    {
        if ($barangay === null || $targetUser->householdProfile !== null) {
            return;
        }

        throw ValidationException::withMessages([
            'barangay' => 'This account needs a linked household profile before a barangay can be assigned.',
        ]);
    }
}
