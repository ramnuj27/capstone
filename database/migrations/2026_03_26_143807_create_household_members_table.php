<?php

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
        if (Schema::hasTable('household_members')) {
            $columns = Schema::getColumnListing('household_members');

            if (in_array('household_profile_id', $columns, true)) {
                return;
            }

            if (DB::table('household_members')->count() > 0) {
                throw new RuntimeException(
                    'The legacy household_members table contains data and must be migrated manually before continuing.',
                );
            }

            Schema::drop('household_members');
        }

        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_profile_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('position');
            $table->string('full_name');
            $table->unsignedTinyInteger('age');
            $table->string('age_group');
            $table->string('sex', 10);
            $table->boolean('is_pwd')->default(false);
            $table->string('pwd_type')->nullable();
            $table->string('pwd_type_other')->nullable();
            $table->timestamps();

            $table->index(['household_profile_id', 'position']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};
