import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl =
    process.env.CAPACITOR_SERVER_URL
    ?? 'https://capstone-production-54b4.up.railway.app';

const config: CapacitorConfig = {
    appId: 'com.evaqready.app',
    appName: 'EvaqReady',
    webDir: 'public/capacitor',
    server: {
        url: serverUrl,
        cleartext: serverUrl.startsWith('http://'),
        errorPath: 'offline.html',
    },
    android: {
        allowMixedContent: false,
        captureInput: true,
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: true,
            launchShowDuration: 800,
            backgroundColor: '#0f172a',
            showSpinner: false,
        },
        StatusBar: {
            style: 'DARK',
            backgroundColor: '#0f172a',
        },
    },
};

export default config;
