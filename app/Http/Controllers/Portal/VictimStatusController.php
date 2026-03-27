<?php

namespace App\Http\Controllers\Portal;

use App\HouseholdEvacuationStatus;
use App\Http\Controllers\Controller;
use App\Models\HouseholdProfile;
use App\Models\HouseholdStatusUpdate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VictimStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        $recentHouseholds = HouseholdProfile::query()
            ->with([
                'user:id,name',
                'latestStatusUpdate.recordedBy:id,name',
            ])
            ->orderByRaw('case when evacuation_status_updated_at is null then 1 else 0 end')
            ->orderByDesc('evacuation_status_updated_at')
            ->orderByDesc('id')
            ->limit(8)
            ->get([
                'id',
                'user_id',
                'reference_code',
                'barangay',
                'evacuation_status',
                'evacuation_status_updated_at',
            ]);

        $recentUpdates = HouseholdStatusUpdate::query()
            ->with([
                'householdProfile:id,user_id,barangay,reference_code',
                'householdProfile.user:id,name',
                'recordedBy:id,name',
            ])
            ->orderByDesc('recorded_at')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('portal/victim-status', [
            'summary' => [
                'trackedHouseholds' => (string) HouseholdProfile::query()->count(),
                'safeHouseholds' => (string) HouseholdProfile::query()
                    ->where('evacuation_status', HouseholdEvacuationStatus::Safe->value)
                    ->count(),
                'missingHouseholds' => (string) HouseholdProfile::query()
                    ->where('evacuation_status', HouseholdEvacuationStatus::Missing->value)
                    ->count(),
                'registeredHouseholds' => (string) HouseholdProfile::query()
                    ->where('evacuation_status', HouseholdEvacuationStatus::Registered->value)
                    ->count(),
                'updatesToday' => (string) HouseholdStatusUpdate::query()
                    ->where('recorded_at', '>=', now()->startOfDay())
                    ->count(),
            ],
            'recentHouseholds' => $recentHouseholds->map(
                fn (HouseholdProfile $householdProfile): array => [
                    'id' => $householdProfile->id,
                    'name' => $householdProfile->user?->name ?? 'Unknown resident',
                    'referenceCode' => $householdProfile->reference_code,
                    'barangay' => $householdProfile->barangay,
                    'status' => ($householdProfile->evacuation_status ?? HouseholdEvacuationStatus::Registered)->value,
                    'statusLabel' => ($householdProfile->evacuation_status ?? HouseholdEvacuationStatus::Registered)->label(),
                    'statusUpdatedAt' => $householdProfile->evacuation_status_updated_at?->toIso8601String(),
                    'statusUpdatedBy' => $householdProfile->latestStatusUpdate?->recordedBy?->name,
                ],
            )->values()->all(),
            'recentUpdates' => $recentUpdates->map(
                fn (HouseholdStatusUpdate $statusUpdate): array => [
                    'id' => $statusUpdate->id,
                    'name' => $statusUpdate->householdProfile?->user?->name ?? 'Unknown resident',
                    'referenceCode' => $statusUpdate->reference_code,
                    'barangay' => $statusUpdate->householdProfile?->barangay,
                    'status' => $statusUpdate->status->value,
                    'statusLabel' => $statusUpdate->status->label(),
                    'recordedAt' => $statusUpdate->recorded_at?->toIso8601String(),
                    'recordedBy' => $statusUpdate->recordedBy?->name,
                    'capturedOffline' => $statusUpdate->captured_offline,
                ],
            )->values()->all(),
        ]);
    }
}
