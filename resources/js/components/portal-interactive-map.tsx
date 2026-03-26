//mao ni diri ang UI sa map




import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortalMapFocus } from '@/types';

const MAPBOX_GL_VERSION = '3.17.0';
const MAPBOX_GL_SCRIPT_URL = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.js`;
const MAPBOX_GL_STYLESHEET_URL = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_GL_VERSION}/mapbox-gl.css`;
const DEFAULT_ROAD_STYLE = 'mapbox://styles/mapbox/streets-v12';
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

type PortalInteractiveMapProps = {
    mapFocus: PortalMapFocus | null;
    alt: string;
    emptyMessage: string;
    className?: string;
};

type MapboxControlPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type MapboxNavigationControlOptions = {
    showCompass?: boolean;
    showZoom?: boolean;
    visualizePitch?: boolean;
};

type MapboxMapOptions = {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    attributionControl: boolean;
    dragRotate: boolean;
    pitchWithRotate: boolean;
    antialias?: boolean;
};

type MapboxMapInstance = {
    addControl(control: unknown, position?: MapboxControlPosition): void;
    on(event: 'load', listener: () => void): void;
    remove(): void;
    resize(): void;
    touchZoomRotate: {
        disableRotation(): void;
    };
};

type MapboxGlNamespace = {
    accessToken: string;
    Map: new (options: MapboxMapOptions) => MapboxMapInstance;
    NavigationControl: new (options?: MapboxNavigationControlOptions) => unknown;
};

declare global {
    interface Window {
        __portalMapboxGlLoader?: Promise<MapboxGlNamespace>;
        mapboxgl?: MapboxGlNamespace;
    }
}

export function PortalInteractiveMap({
    mapFocus,
    alt,
    emptyMessage,
    className,
}: PortalInteractiveMapProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

    useEffect(() => {
        setIsMapReady(false);
        setLoadError(null);

        if (!token || mapFocus === null || containerRef.current === null) {
            return;
        }

        let isCancelled = false;
        let map: MapboxMapInstance | null = null;
        let resizeObserver: ResizeObserver | null = null;
        const readyTimeout = window.setTimeout(() => {
            if (!isCancelled) {
                setLoadError('Unable to load the live map right now.');
            }
        }, 12000);

        loadMapboxGl()
            .then((mapboxgl) => {
                if (isCancelled || containerRef.current === null) {
                    return;
                }

                mapboxgl.accessToken = token;

                map = new mapboxgl.Map({
                    container: containerRef.current,
                    style: resolveRoadStyle(mapFocus.styleId),
                    center: [mapFocus.longitude, mapFocus.latitude],
                    zoom: clampZoom(mapFocus.zoom),
                    bearing: 0,
                    pitch: 0,
                    attributionControl: true,
                    dragRotate: false,
                    pitchWithRotate: false,
                    antialias: true,
                });

                map.touchZoomRotate.disableRotation();
                map.addControl(
                    new mapboxgl.NavigationControl({
                        showCompass: false,
                        showZoom: true,
                        visualizePitch: false,
                    }),
                    'top-right',
                );

                map.on('load', () => {
                    if (!isCancelled) {
                        window.clearTimeout(readyTimeout);
                        setIsMapReady(true);
                    }
                });

                if (typeof ResizeObserver !== 'undefined') {
                    resizeObserver = new ResizeObserver(() => {
                        map?.resize();
                    });

                    resizeObserver.observe(containerRef.current);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    window.clearTimeout(readyTimeout);
                    setLoadError('Unable to load the live map right now.');
                }
            });

        return () => {
            isCancelled = true;
            window.clearTimeout(readyTimeout);
            resizeObserver?.disconnect();
            map?.remove();
        };
    }, [mapFocus, token]);

    if (mapFocus === null) {
        return (
            <MapFallback className={className}>
                <ImageOff className="mx-auto mb-3 size-8 text-slate-400" />
                Map focus is unavailable right now.
            </MapFallback>
        );
    }

    if (!token) {
        return (
            <MapFallback className={className}>
                <ImageOff className="mx-auto mb-3 size-8 text-slate-400" />
                {emptyMessage}
            </MapFallback>
        );
    }

    if (loadError) {
        return (
            <MapFallback className={className}>
                <ImageOff className="mx-auto mb-3 size-8 text-slate-400" />
                {loadError}
            </MapFallback>
        );
    }

    return (
        <div
            className={cn(
                'relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-950',
                className,
            )}
            aria-label={alt}
        >
            <div
                ref={containerRef}
                className="h-full w-full"
            />

            {!isMapReady && (
                <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_rgba(226,232,240,0.92)_32%,_rgba(203,213,225,0.95)_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(51,65,85,0.7),_rgba(15,23,42,0.95)_38%,_rgba(2,6,23,1)_100%)]" />
            )}
        </div>
    );
}

function MapFallback({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex aspect-[16/9] items-center justify-center rounded-[1.75rem] bg-stone-100/80 p-6 dark:bg-slate-900/80',
                className,
            )}
        >
            <div className="max-w-sm text-center text-sm text-muted-foreground">
                {children}
            </div>
        </div>
    );
}

function clampZoom(zoom: number): number {
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

function resolveRoadStyle(styleId: string | undefined): string {
    const normalizedStyleId = (styleId ?? '').replace(/^mapbox:\/\/styles\//, '');

    if (normalizedStyleId.includes('satellite')) {
        return DEFAULT_ROAD_STYLE;
    }

    if (normalizedStyleId.length === 0) {
        return DEFAULT_ROAD_STYLE;
    }

    return `mapbox://styles/${normalizedStyleId}`;
}

async function loadMapboxGl(): Promise<MapboxGlNamespace> {
    ensureMapboxStylesheet();

    if (window.mapboxgl) {
        return window.mapboxgl;
    }

    if (!window.__portalMapboxGlLoader) {
        window.__portalMapboxGlLoader = new Promise<MapboxGlNamespace>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>('script[data-portal-mapbox-gl="true"]');

            if (existingScript) {
                existingScript.addEventListener('load', handleLoad, { once: true });
                existingScript.addEventListener('error', handleError, { once: true });

                return;
            }

            const script = document.createElement('script');

            script.src = MAPBOX_GL_SCRIPT_URL;
            script.async = true;
            script.defer = true;
            script.dataset.portalMapboxGl = 'true';
            script.addEventListener('load', handleLoad, { once: true });
            script.addEventListener('error', handleError, { once: true });
            document.head.appendChild(script);

            function handleLoad(): void {
                if (window.mapboxgl) {
                    resolve(window.mapboxgl);
                } else {
                    reject(new Error('Mapbox GL JS did not initialize.'));
                }
            }

            function handleError(): void {
                window.__portalMapboxGlLoader = undefined;
                reject(new Error('Unable to load Mapbox GL JS.'));
            }
        });
    }

    return window.__portalMapboxGlLoader;
}

function ensureMapboxStylesheet(): void {
    const existingStylesheet = document.querySelector<HTMLLinkElement>('link[data-portal-mapbox-gl="true"]');

    if (existingStylesheet) {
        return;
    }

    const stylesheet = document.createElement('link');

    stylesheet.rel = 'stylesheet';
    stylesheet.href = MAPBOX_GL_STYLESHEET_URL;
    stylesheet.dataset.portalMapboxGl = 'true';
    document.head.appendChild(stylesheet);
}
