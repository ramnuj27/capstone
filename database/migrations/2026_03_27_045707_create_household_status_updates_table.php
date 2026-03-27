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
        Schema::create('household_status_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recorded_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reference_code');
            $table->uuid('sync_id')->unique();
            $table->string('status');
            $table->timestamp('recorded_at');
            $table->boolean('captured_offline')->default(false);
            $table->timestamps();

            $table->index(['household_profile_id', 'recorded_at']);
            $table->index(['status', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('household_status_updates');
    }
};
