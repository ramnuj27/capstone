import { type ReactElement, useEffect, useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type BeforeInstallPromptEvent = Event & {
    prompt(): Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
};

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

export function PwaInstallButton(): ReactElement | null {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isOffline, setIsOffline] = useState<boolean>(() => (
        typeof navigator === 'undefined'
            ? false
            : !navigator.onLine
    ));

    useEffect(() => {
        function handleBeforeInstallPrompt(event: BeforeInstallPromptEvent): void {
            event.preventDefault();
            setDeferredPrompt(event);
        }

        function handleAppInstalled(): void {
            setDeferredPrompt(null);
        }

        function handleConnectivityChange(): void {
            setIsOffline(!navigator.onLine);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('online', handleConnectivityChange);
        window.addEventListener('offline', handleConnectivityChange);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('online', handleConnectivityChange);
            window.removeEventListener('offline', handleConnectivityChange);
        };
    }, []);

    async function handleInstallClick(): Promise<void> {
        if (deferredPrompt === null) {
            return;
        }

        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    }

    if (!isOffline && deferredPrompt === null) {
        return null;
    }

    return (
        <div className="ml-auto flex items-center gap-2">
            {isOffline && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-200">
                    <WifiOff className="size-3.5" />
                    Offline mode
                </span>
            )}

            {deferredPrompt && (
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void handleInstallClick()}
                    className="rounded-full"
                >
                    <Download className="size-4" />
                    Install app
                </Button>
            )}
        </div>
    );
}
