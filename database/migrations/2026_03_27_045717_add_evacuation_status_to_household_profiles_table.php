<?php

use App\HouseholdEvacuationStatus;
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

        Schema::table('household_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('household_profiles', 'evacuation_status')) {
                $table->string('evacuation_status')
                    ->default(HouseholdEvacuationStatus::Registered->value)
                    ->after('reference_code');
            }

            if (! Schema::hasColumn('household_profiles', 'evacuation_status_updated_at')) {
                $table->timestamp('evacuation_status_updated_at')
                    ->nullable()
                    ->after('evacuation_status');
            }
        });

        DB::table('household_profiles')
            ->whereNull('evacuation_status')
            ->update([
                'evacuation_status' => HouseholdEvacuationStatus::Registered->value,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('household_profiles')) {
            return;
        }

        Schema::table('household_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('household_profiles', 'evacuation_status_updated_at')) {
                $table->dropColumn('evacuation_status_updated_at');
            }

            if (Schema::hasColumn('household_profiles', 'evacuation_status')) {
                $table->dropColumn('evacuation_status');
            }
        });
    }
};
