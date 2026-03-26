<?php

namespace App\Support;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

final class HouseholdQrCode
{
    /**
     * Render the household reference code as an SVG QR code.
     */
    public function svg(string $content): string
    {
        $writer = new Writer(new ImageRenderer(
            new RendererStyle(220, 2),
            new SvgImageBackEnd(),
        ));

        return $writer->writeString($content);
    }
}
