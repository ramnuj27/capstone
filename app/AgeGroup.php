<?php

namespace App;

enum AgeGroup: string
{
    case Child = 'child';
    case Adult = 'adult';
    case Senior = 'senior';

    public static function fromAge(int $age): self
    {
        return match (true) {
            $age <= 17 => self::Child,
            $age >= 60 => self::Senior,
            default => self::Adult,
        };
    }
}
