import type { PortalMapFocus } from '@/types';

export function getMatiCityStaticMapUrl(
    mapFocus: PortalMapFocus | null,
    options: {
        width?: number;
        height?: number;
        bearing?: number;
    } = {},
): string | null {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();

    if (!token || mapFocus === null) {
        return null;
    }

    const width = options.width ?? 1280;
    const height = options.height ?? 720;
    const bearing = normalizeMapBearing(options.bearing ?? mapFocus.bearing ?? 0);
    const styleId = mapFocus.styleId.replace(/^mapbox:\/\/styles\//, '');
    const center = [
        mapFocus.longitude,
        mapFocus.latitude,
        mapFocus.zoom,
        bearing,
        0,
    ].join(',');

    return `https://api.mapbox.com/styles/v1/${styleId}/static/${center}/${width}x${height}@2x?access_token=${encodeURIComponent(token)}`;
}

export function normalizeMapBearing(bearing: number): number {
    const normalizedBearing = ((bearing % 360) + 360) % 360;

    return normalizedBearing > 180
        ? normalizedBearing - 360
        : normalizedBearing;
}
