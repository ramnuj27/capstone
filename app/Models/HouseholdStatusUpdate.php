<?php

namespace App\Models;

use App\HouseholdEvacuationStatus;
use Database\Factories\HouseholdStatusUpdateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'household_profile_id',
    'recorded_by_id',
    'reference_code',
    'sync_id',
    'status',
    'recorded_at',
    'captured_offline',
])]
class HouseholdStatusUpdate extends Model
{
    /** @use HasFactory<HouseholdStatusUpdateFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'captured_offline' => 'bool',
            'recorded_at' => 'datetime',
            'status' => HouseholdEvacuationStatus::class,
        ];
    }

    public function householdProfile(): BelongsTo
    {
        return $this->belongsTo(HouseholdProfile::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_id');
    }
}
