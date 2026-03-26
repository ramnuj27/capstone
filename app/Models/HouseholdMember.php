<?php

namespace App\Models;

use App\AgeGroup;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'household_profile_id',
    'position',
    'full_name',
    'age',
    'age_group',
    'sex',
    'is_pwd',
    'pwd_type',
    'pwd_type_other',
])]
class HouseholdMember extends Model
{
    /** @use HasFactory<\Database\Factories\HouseholdMemberFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'age_group' => AgeGroup::class,
            'is_pwd' => 'bool',
        ];
    }

    public function householdProfile(): BelongsTo
    {
        return $this->belongsTo(HouseholdProfile::class);
    }
}
