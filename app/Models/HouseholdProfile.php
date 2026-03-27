<?php

namespace App\Models;

use App\AgeGroup;
use App\HouseholdEvacuationStatus;
use App\Support\HouseholdReferenceCode;
use Database\Factories\HouseholdProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'user_id',
    'reference_code',
    'evacuation_status',
    'evacuation_status_updated_at',
    'household_role',
    'age',
    'age_group',
    'contact_number',
    'sex',
    'is_pwd',
    'pwd_type',
    'pwd_type_other',
    'barangay',
    'address',
])]
class HouseholdProfile extends Model
{
    /** @use HasFactory<HouseholdProfileFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (self $householdProfile): void {
            if (blank($householdProfile->reference_code)) {
                $householdProfile->reference_code = HouseholdReferenceCode::generate();
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'age_group' => AgeGroup::class,
            'evacuation_status' => HouseholdEvacuationStatus::class,
            'evacuation_status_updated_at' => 'datetime',
            'is_pwd' => 'bool',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(HouseholdMember::class)->orderBy('position');
    }

    public function statusUpdates(): HasMany
    {
        return $this->hasMany(HouseholdStatusUpdate::class)
            ->orderByDesc('recorded_at')
            ->orderByDesc('id');
    }

    public function latestStatusUpdate(): HasOne
    {
        return $this->hasOne(HouseholdStatusUpdate::class)->latestOfMany('recorded_at');
    }
}
