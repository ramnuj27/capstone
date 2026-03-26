<?php

use App\UserRole;
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
        if (! Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table
                    ->string('role')
                    ->default(UserRole::Resident->value)
                    ->after('email')
                    ->index();
            });
        }

        DB::table('users')
            ->where('role', 'admin')
            ->update(['role' => UserRole::MainAdmin->value]);

        DB::table('users')
            ->whereIn('role', ['evacuee', 'user'])
            ->update(['role' => UserRole::Resident->value]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('users', 'role')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
