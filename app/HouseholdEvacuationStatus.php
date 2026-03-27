<?php

namespace App;

enum HouseholdEvacuationStatus: string
{
    case Registered = 'registered';
    case Safe = 'safe';
    case Missing = 'missing';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Registered',
            self::Safe => 'Safe',
            self::Missing => 'Missing',
        };
    }
}
