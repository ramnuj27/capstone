<?php

namespace App\Support;

final class MatiCityMap
{
    /**
     * @return array{
     *     city: string,
     *     longitude: float,
     *     latitude: float,
     *     zoom: float,
     *     styleId: string,
     *     title: string,
     *     description: string,
     *     note: string
     * }|null
     */
    public static function focusFor(string $moduleKey): ?array
    {
        return match ($moduleKey) {
            'map-monitoring' => self::definition(
                title: 'Mati City command map',
                description: 'A city-level preview centered on Mati City for command visibility, barangay coverage, and building clusters near the urban core.',
                note: 'Building-focused preview for main admin monitoring across Mati City.',
                longitude: 126.2142,
                latitude: 6.9551,
                zoom: 13.7,
            ),
            'live-map-location' => self::definition(
                title: 'Responder live location focus',
                description: 'A tighter Mati City view for field teams that keeps roads, dense structures, and operational landmarks easier to read.',
                note: 'Zoomed farther in to make building footprints and route context easier to inspect.',
                longitude: 126.2174,
                latitude: 6.9564,
                zoom: 15.1,
            ),
            'check-disaster-map' => self::definition(
                title: 'Public Mati City awareness map',
                description: 'A wider public-facing map preview for Mati City so residents can quickly orient around populated areas and visible building zones.',
                note: 'Configured around Mati City with a clear building-and-road map style for resident awareness.',
                longitude: 126.2142,
                latitude: 6.9551,
                zoom: 12.8,
            ),
            default => null,
        };
    }

    /**
     * @return array{
     *     city: string,
     *     longitude: float,
     *     latitude: float,
     *     zoom: float,
     *     styleId: string,
     *     title: string,
     *     description: string,
     *     note: string
     * }
     */
    private static function definition(
        string $title,
        string $description,
        string $note,
        float $longitude,
        float $latitude,
        float $zoom,
    ): array {
        return [
            'city' => 'Mati City, Davao Oriental',
            'longitude' => $longitude,
            'latitude' => $latitude,
            'zoom' => $zoom,
            'styleId' => 'mapbox/satellite-streets-v12',
            'title' => $title,
            'description' => $description,
            'note' => $note,
        ];
    }
}
