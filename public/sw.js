const CACHE_VERSION = 'evaqready-pwa-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = '/offline.html';
const PRECACHE_URLS = [
    OFFLINE_URL,
    '/manifest.webmanifest',
    '/favicon.ico',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => !key.startsWith(CACHE_VERSION))
                .map((key) => caches.delete(key)),
        )).then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(request.url);

    if (isMapboxRequest(requestUrl)) {
        event.respondWith(staleWhileRevalidate(request));

        return;
    }

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));

        return;
    }

    if (
        requestUrl.pathname.startsWith('/build/')
        || ['script', 'style', 'image', 'font'].includes(request.destination)
    ) {
        event.respondWith(staleWhileRevalidate(request));

        return;
    }

    event.respondWith(networkFirst(request));
});

async function handleNavigationRequest(request) {
    try {
        const freshResponse = await fetch(request);

        if (freshResponse && freshResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);

            await cache.put(request, freshResponse.clone());
        }

        return freshResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return caches.match(OFFLINE_URL);
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);

    const networkResponsePromise = fetch(request)
        .then(async (networkResponse) => {
            if (networkResponse && networkResponse.ok) {
                await cache.put(request, networkResponse.clone());
            }

            return networkResponse;
        })
        .catch(() => undefined);

    return cachedResponse || networkResponsePromise || Response.error();
}

async function networkFirst(request) {
    try {
        const freshResponse = await fetch(request);

        if (freshResponse && freshResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);

            await cache.put(request, freshResponse.clone());
        }

        return freshResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

function isMapboxRequest(requestUrl) {
    if (!requestUrl.hostname.endsWith('mapbox.com')) {
        return false;
    }

    return (
        requestUrl.pathname.includes('/mapbox-gl-js/')
        || requestUrl.pathname.includes('/styles/v1/')
        || requestUrl.pathname.includes('/v4/')
        || requestUrl.pathname.includes('/tiles/')
        || requestUrl.pathname.includes('/fonts/v1/')
    );
}
