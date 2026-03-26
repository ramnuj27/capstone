<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('household_profiles')) {
            return;
        }

        Schema::create('household_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('household_role');
            $table->unsignedTinyInteger('age');
            $table->string('age_group');
            $table->string('contact_number', 20);
            $table->string('sex', 10);
            $table->boolean('is_pwd')->default(false);
            $table->string('pwd_type')->nullable();
            $table->string('pwd_type_other')->nullable();
            $table->string('barangay');
            $table->text('address');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_profiles');
    }
};
