<?php

namespace App;

enum UserRole: string
{
    case MainAdmin = 'main_admin';
    case BarangayAdmin = 'barangay_admin';
    case Responder = 'responder';
    case Resident = 'resident';

    public function label(): string
    {
        return match ($this) {
            self::MainAdmin => 'Main Admin',
            self::BarangayAdmin => 'Barangay Admin',
            self::Responder => 'Responder',
            self::Resident => 'Resident',
        };
    }
}
