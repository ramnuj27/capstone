import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

export function isNativeEvaqReadyApp(): boolean {
    return Capacitor.isNativePlatform();
}

export async function isCurrentlyOnline(): Promise<boolean> {
    if (typeof navigator === 'undefined') {
        return true;
    }

    if (!isNativeEvaqReadyApp()) {
        return navigator.onLine;
    }

    try {
        const status = await Network.getStatus();

        return status.connected;
    } catch {
        return navigator.onLine;
    }
}

export async function addNativeConnectivityListener(
    callback: (isOnline: boolean) => void,
): Promise<void> {
    if (!isNativeEvaqReadyApp()) {
        return;
    }

    await Network.addListener('networkStatusChange', (status) => {
        callback(status.connected);
    });
}

export async function addNativeResumeListener(
    callback: () => void,
): Promise<void> {
    if (!isNativeEvaqReadyApp()) {
        return;
    }

    await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            callback();
        }
    });
}
