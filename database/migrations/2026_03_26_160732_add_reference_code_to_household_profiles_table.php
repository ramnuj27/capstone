<?php

use App\Support\HouseholdReferenceCode;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('household_profiles')) {
            return;
        }

        if (! Schema::hasColumn('household_profiles', 'reference_code')) {
            Schema::table('household_profiles', function (Blueprint $table): void {
                $table->string('reference_code')->nullable()->after('user_id');
            });
        }

        DB::table('household_profiles')
            ->whereNull('reference_code')
            ->orderBy('id')
            ->get(['id'])
            ->each(function (object $householdProfile): void {
                DB::table('household_profiles')
                    ->where('id', $householdProfile->id)
                    ->update([
                        'reference_code' => HouseholdReferenceCode::generate(),
                    ]);
            });

        if (! Schema::hasIndex('household_profiles', 'household_profiles_reference_code_unique')) {
            Schema::table('household_profiles', function (Blueprint $table): void {
                $table->unique('reference_code');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('household_profiles') || ! Schema::hasColumn('household_profiles', 'reference_code')) {
            return;
        }

        if (Schema::hasIndex('household_profiles', 'household_profiles_reference_code_unique')) {
            Schema::table('household_profiles', function (Blueprint $table): void {
                $table->dropUnique('household_profiles_reference_code_unique');
            });
        }

        Schema::table('household_profiles', function (Blueprint $table): void {
            $table->dropColumn('reference_code');
        });
    }
};
