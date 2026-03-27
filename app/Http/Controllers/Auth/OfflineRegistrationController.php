<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Fortify\CreateNewUser;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfflineRegistrationController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        CreateNewUser $createNewUser,
    ): JsonResponse {
        $offlineSyncId = trim($request->string('offline_sync_id')->toString());

        if ($offlineSyncId !== '') {
            $existingUser = User::query()
                ->with('householdProfile')
                ->where('offline_sync_id', $offlineSyncId)
                ->first();

            if ($existingUser?->householdProfile?->reference_code !== null) {
                return response()->json([
                    'status' => 'already_synced',
                    'reference_code' => $existingUser->householdProfile->reference_code,
                    'email' => $existingUser->email,
                ]);
            }
        }

        $user = $createNewUser->create($request->all());
        $user->load('householdProfile');

        return response()->json([
            'status' => 'synced',
            'reference_code' => $user->householdProfile?->reference_code,
            'email' => $user->email,
        ], 201);
    }
}
