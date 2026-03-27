<?php

namespace App\Http\Controllers\Portal;

use App\HouseholdEvacuationStatus;
use App\Http\Controllers\Controller;
use App\Models\HouseholdProfile;
use App\Models\HouseholdStatusUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class HouseholdStatusUpdateController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->merge([
            'reference_code' => Str::of((string) $request->input('reference_code'))
                ->trim()
                ->upper()
                ->value(),
        ]);

        $validated = $request->validate([
            'sync_id' => ['required', 'uuid'],
            'reference_code' => [
                'required',
                'string',
                'max:255',
                Rule::exists(HouseholdProfile::class, 'reference_code'),
            ],
            'status' => [
                'required',
                Rule::in(array_map(
                    fn (HouseholdEvacuationStatus $status): string => $status->value,
                    HouseholdEvacuationStatus::cases(),
                )),
            ],
            'recorded_at' => ['required', 'date'],
            'captured_offline' => ['sometimes', 'boolean'],
        ]);

        $existingStatusUpdate = HouseholdStatusUpdate::query()
            ->with([
                'householdProfile:id,user_id,barangay,reference_code,evacuation_status,evacuation_status_updated_at',
                'householdProfile.user:id,name',
                'recordedBy:id,name',
            ])
            ->where('sync_id', $validated['sync_id'])
            ->first();

        if ($existingStatusUpdate !== null) {
            return response()->json([
                'status' => 'already_synced',
                'household' => $this->householdPayload(
                    $existingStatusUpdate->householdProfile,
                ),
                'update' => $this->statusUpdatePayload($existingStatusUpdate),
            ]);
        }

        $householdProfile = HouseholdProfile::query()
            ->with('user:id,name')
            ->where('reference_code', $validated['reference_code'])
            ->first();

        if ($householdProfile === null) {
            throw ValidationException::withMessages([
                'reference_code' => 'The scanned household reference code could not be matched.',
            ]);
        }

        $status = HouseholdEvacuationStatus::from($validated['status']);
        $recordedAt = Carbon::parse($validated['recorded_at']);

        $statusUpdate = DB::transaction(function () use ($householdProfile, $recordedAt, $request, $status, $validated): HouseholdStatusUpdate {
            $createdStatusUpdate = HouseholdStatusUpdate::query()->create([
                'household_profile_id' => $householdProfile->id,
                'recorded_by_id' => $request->user()?->id,
                'reference_code' => $householdProfile->reference_code,
                'sync_id' => $validated['sync_id'],
                'status' => $status,
                'recorded_at' => $recordedAt,
                'captured_offline' => (bool) ($validated['captured_offline'] ?? false),
            ]);

            $householdProfile->forceFill([
                'evacuation_status' => $status,
                'evacuation_status_updated_at' => $recordedAt,
            ])->save();

            return $createdStatusUpdate->load([
                'householdProfile:id,user_id,barangay,reference_code,evacuation_status,evacuation_status_updated_at',
                'householdProfile.user:id,name',
                'recordedBy:id,name',
            ]);
        });

        return response()->json([
            'status' => 'synced',
            'household' => $this->householdPayload($statusUpdate->householdProfile),
            'update' => $this->statusUpdatePayload($statusUpdate),
        ]);
    }

    private function householdPayload(?HouseholdProfile $householdProfile): ?array
    {
        if ($householdProfile === null) {
            return null;
        }

        $status = $householdProfile->evacuation_status ?? HouseholdEvacuationStatus::Registered;

        return [
            'id' => $householdProfile->id,
            'name' => $householdProfile->user?->name ?? 'Unknown resident',
            'referenceCode' => $householdProfile->reference_code,
            'barangay' => $householdProfile->barangay,
            'status' => $status->value,
            'statusLabel' => $status->label(),
            'statusUpdatedAt' => $householdProfile->evacuation_status_updated_at?->toIso8601String(),
        ];
    }

    private function statusUpdatePayload(HouseholdStatusUpdate $statusUpdate): array
    {
        return [
            'id' => $statusUpdate->id,
            'name' => $statusUpdate->householdProfile?->user?->name ?? 'Unknown resident',
            'referenceCode' => $statusUpdate->reference_code,
            'barangay' => $statusUpdate->householdProfile?->barangay,
            'status' => $statusUpdate->status->value,
            'statusLabel' => $statusUpdate->status->label(),
            'recordedAt' => $statusUpdate->recorded_at?->toIso8601String(),
            'recordedBy' => $statusUpdate->recordedBy?->name,
            'capturedOffline' => $statusUpdate->captured_offline,
        ];
    }
}
