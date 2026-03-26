<?php

namespace App\Support;

final class PwdTypeOptions
{
    /**
     * Get the supported PWD type values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return [
            'physical',
            'visual',
            'hearing',
            'speech',
            'intellectual',
            'learning',
            'psychosocial',
            'other',
        ];
    }
}
