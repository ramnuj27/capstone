const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export function registerPwaServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    if (!isSecureContext && !LOCALHOST_HOSTNAMES.has(window.location.hostname)) {
        return;
    }

    window.addEventListener('load', () => {
        void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
            console.warn('PWA service worker registration failed.', error);
        });
    });
}
