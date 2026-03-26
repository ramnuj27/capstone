<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\HouseholdMember;
use App\Support\HouseholdQrCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationCompleteController extends Controller
{
    public function __construct(
        private readonly HouseholdQrCode $householdQrCode,
    ) {
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $authenticatedUser = $request->user();

        if ($authenticatedUser === null) {
            return redirect()->route('dashboard');
        }

        $user = $authenticatedUser->fresh();

        if ($user === null) {
            return redirect()->route('dashboard');
        }

        $user->load('householdProfile.members');

        $householdProfile = $user->householdProfile;

        if ($householdProfile === null || ! is_string($householdProfile->reference_code)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/registration-complete', [
            'summary' => [
                'referenceCode' => $householdProfile->reference_code,
                'qrSvg' => $this->householdQrCode->svg($householdProfile->reference_code),
                'registrant' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'householdRole' => Str::title($householdProfile->household_role),
                    'age' => $householdProfile->age,
                    'ageGroup' => Str::title($householdProfile->age_group->value),
                    'contactNumber' => $householdProfile->contact_number,
                    'sex' => Str::title($householdProfile->sex),
                    'barangay' => $householdProfile->barangay,
                    'address' => $householdProfile->address,
                    'pwdLabel' => $this->pwdLabel(
                        $householdProfile->is_pwd,
                        $householdProfile->pwd_type,
                    ),
                ],
                'members' => $householdProfile->members
                    ->map(fn (HouseholdMember $member): array => [
                        'id' => $member->id,
                        'position' => $member->position,
                        'fullName' => $member->full_name,
                        'age' => $member->age,
                        'ageGroup' => Str::title($member->age_group->value),
                        'sex' => Str::title($member->sex),
                        'pwdLabel' => $this->pwdLabel(
                            $member->is_pwd,
                            $member->pwd_type,
                        ),
                    ])
                    ->values()
                    ->all(),
            ],
        ]);
    }

    private function pwdLabel(bool $isPwd, ?string $pwdType): string
    {
        if (! $isPwd) {
            return 'No PWD declared';
        }

        if ($pwdType === null || $pwdType === '') {
            return 'PWD type pending';
        }

        return match ($pwdType) {
            'physical' => 'Physical disability',
            'visual' => 'Visual impairment',
            'hearing' => 'Hearing impairment',
            'speech' => 'Speech impairment',
            'intellectual' => 'Intellectual disability',
            'learning' => 'Learning disability',
            'psychosocial' => 'Psychosocial disability',
            default => $pwdType,
        };
    }
}
