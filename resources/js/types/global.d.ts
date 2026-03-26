import type { Auth } from '@/types/auth';
import type { PortalSharedData } from '@/types/portal';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            portal: PortalSharedData;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
