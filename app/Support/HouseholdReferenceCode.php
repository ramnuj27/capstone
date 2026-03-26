<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class HouseholdReferenceCode
{
    /**
     * Generate a unique household reference code.
     */
    public static function generate(): string
    {
        do {
            $candidate = self::makeCandidate();
        } while (
            DB::table('household_profiles')
                ->where('reference_code', $candidate)
                ->exists()
        );

        return $candidate;
    }

    private static function makeCandidate(): string
    {
        return 'EVQ-MATI-'.Str::upper(Str::random(6));
    }
}
