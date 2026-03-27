import HouseholdStatusUpdateController from '@/actions/App/Http/Controllers/Portal/HouseholdStatusUpdateController';

const QUEUE_STORAGE_KEY = 'evaqready.offline-victim-status-updates';
const META_STORAGE_KEY = 'evaqready.offline-victim-status-updates.meta';
export const OFFLINE_VICTIM_STATUS_UPDATES_EVENT =
    'evaqready:offline-victim-status-updates:change';

let syncInitialized = false;
let syncInFlight = false;

export type VictimStatusValue = 'safe' | 'missing';

export type SyncedVictimStatusHousehold = {
    id: number;
    name: string;
    referenceCode: string;
    barangay: string | null;
    status: VictimStatusValue | 'registered';
    statusLabel: string;
    statusUpdatedAt: string | null;
};

export type SyncedVictimStatusUpdate = {
    id: number;
    name: string;
    referenceCode: string;
    barangay: string | null;
    status: VictimStatusValue;
    statusLabel: string;
    recordedAt: string | null;
    recordedBy: string | null;
    capturedOffline: boolean;
};

type OfflineVictimStatusUpdatePayload = {
    sync_id: string;
    reference_code: string;
    status: VictimStatusValue;
    recorded_at: string;
    captured_offline: boolean;
};

type OfflineVictimStatusUpdateStatus = 'pending' | 'failed';

type PersistedOfflineVictimStatusUpdate = {
    id: string;
    referenceCode: string;
    status: VictimStatusValue;
    queuedAt: string;
    lastError: string | null;
    syncStatus: OfflineVictimStatusUpdateStatus;
    payload: OfflineVictimStatusUpdatePayload;
};

type PersistedOfflineVictimStatusMeta = {
    lastQueued?: {
        referenceCode: string;
        status: VictimStatusValue;
        queuedAt: string;
    };
    lastSynced?: {
        referenceCode: string;
        name: string;
        status: VictimStatusValue;
        statusLabel: string;
        syncedAt: string;
        capturedOffline: boolean;
    };
};

type SyncApiResponse = {
    status: 'synced' | 'already_synced';
    household: SyncedVictimStatusHousehold | null;
    update: SyncedVictimStatusUpdate;
};

export type OfflineVictimStatusUpdateSummary = {
    id: string;
    referenceCode: string;
    status: VictimStatusValue;
    queuedAt: string;
    lastError: string | null;
    syncStatus: OfflineVictimStatusUpdateStatus;
};

export type OfflineVictimStatusUpdateSnapshot = {
    isSyncing: boolean;
    pendingCount: number;
    failedCount: number;
    items: OfflineVictimStatusUpdateSummary[];
    lastQueued: PersistedOfflineVictimStatusMeta['lastQueued'] | null;
    lastSynced: PersistedOfflineVictimStatusMeta['lastSynced'] | null;
};

export type RecordVictimStatusUpdateInput = {
    referenceCode: string;
    status: VictimStatusValue;
    capturedOffline: boolean;
};

export type RecordVictimStatusUpdateResult =
    | {
          type: 'synced';
          household: SyncedVictimStatusHousehold | null;
          update: SyncedVictimStatusUpdate;
      }
    | {
          type: 'queued';
          item: OfflineVictimStatusUpdateSummary;
          message: string;
      }
    | {
          type: 'failed';
          message: string;
      };

export type OfflineVictimStatusSyncSummary = {
    syncedCount: number;
    failedCount: number;
    retryCount: number;
};

export function getOfflineVictimStatusUpdateSnapshot(): OfflineVictimStatusUpdateSnapshot {
    const queue = readQueue();
    const meta = readMeta();

    return {
        isSyncing: syncInFlight,
        pendingCount: queue.filter((item) => item.syncStatus === 'pending').length,
        failedCount: queue.filter((item) => item.syncStatus === 'failed').length,
        items: queue.map((item) => ({
            id: item.id,
            referenceCode: item.referenceCode,
            status: item.status,
            queuedAt: item.queuedAt,
            lastError: item.lastError,
            syncStatus: item.syncStatus,
        })),
        lastQueued: meta.lastQueued ?? null,
        lastSynced: meta.lastSynced ?? null,
    };
}

export async function recordVictimStatusUpdate(
    input: RecordVictimStatusUpdateInput,
): Promise<RecordVictimStatusUpdateResult> {
    const payload = buildPayload(input);

    if (typeof window === 'undefined' || !window.navigator.onLine) {
        const queuedUpdate = enqueueVictimStatusUpdate(payload);

        return {
            type: 'queued',
            item: queuedUpdate,
            message: `${queuedUpdate.referenceCode} was saved on this device and will sync automatically when the connection returns.`,
        };
    }

    const syncResult = await syncPayload(payload);

    if (syncResult.type === 'synced') {
        writeMeta({
            ...readMeta(),
            lastSynced: {
                referenceCode: syncResult.response.update.referenceCode,
                name: syncResult.response.update.name,
                status: syncResult.response.update.status,
                statusLabel: syncResult.response.update.statusLabel,
                syncedAt: new Date().toISOString(),
                capturedOffline: syncResult.response.update.capturedOffline,
            },
        });
        emitSnapshot();

        return {
            type: 'synced',
            household: syncResult.response.household,
            update: syncResult.response.update,
        };
    }

    if (syncResult.type === 'failed') {
        return {
            type: 'failed',
            message: syncResult.message,
        };
    }

    const queuedUpdate = enqueueVictimStatusUpdate(payload);

    return {
        type: 'queued',
        item: queuedUpdate,
        message: syncResult.message,
    };
}

export function removeOfflineVictimStatusUpdate(id: string): void {
    const nextQueue = readQueue().filter((item) => item.id !== id);

    writeQueue(nextQueue);
    emitSnapshot();
}

export function initializeOfflineVictimStatusUpdateSync(): void {
    if (typeof window === 'undefined' || syncInitialized) {
        return;
    }

    syncInitialized = true;

    const refreshSnapshot = (): void => emitSnapshot();

    window.addEventListener('online', () => {
        refreshSnapshot();
        void syncOfflineVictimStatusUpdates();
    });

    window.addEventListener('offline', refreshSnapshot);
    window.addEventListener('focus', () => {
        if (window.navigator.onLine) {
            void syncOfflineVictimStatusUpdates();
        }
    });
    window.addEventListener('storage', (event) => {
        if (event.key === QUEUE_STORAGE_KEY || event.key === META_STORAGE_KEY) {
            refreshSnapshot();
        }
    });

    void syncOfflineVictimStatusUpdates();
    emitSnapshot();
}

export async function syncOfflineVictimStatusUpdates(): Promise<OfflineVictimStatusSyncSummary> {
    if (typeof window === 'undefined' || !window.navigator.onLine || syncInFlight) {
        return {
            syncedCount: 0,
            failedCount: 0,
            retryCount: 0,
        };
    }

    const queue = readQueue();

    if (queue.length === 0) {
        emitSnapshot();

        return {
            syncedCount: 0,
            failedCount: 0,
            retryCount: 0,
        };
    }

    syncInFlight = true;
    emitSnapshot();

    let syncedCount = 0;
    let failedCount = 0;
    let retryCount = 0;

    try {
        for (const queuedUpdate of readQueue()) {
            if (queuedUpdate.syncStatus !== 'pending') {
                continue;
            }

            const syncResult = await syncPayload(queuedUpdate.payload);

            if (syncResult.type === 'synced') {
                syncedCount += 1;

                writeQueue(
                    readQueue().filter((item) => item.id !== queuedUpdate.id),
                );
                writeMeta({
                    ...readMeta(),
                    lastSynced: {
                        referenceCode: syncResult.response.update.referenceCode,
                        name: syncResult.response.update.name,
                        status: syncResult.response.update.status,
                        statusLabel: syncResult.response.update.statusLabel,
                        syncedAt: new Date().toISOString(),
                        capturedOffline: syncResult.response.update.capturedOffline,
                    },
                });
                emitSnapshot();

                continue;
            }

            if (syncResult.type === 'failed') {
                failedCount += 1;

                updateQueueItem(queuedUpdate.id, {
                    lastError: syncResult.message,
                    syncStatus: 'failed',
                });
                emitSnapshot();

                continue;
            }

            retryCount += 1;

            updateQueueItem(queuedUpdate.id, {
                lastError: syncResult.message,
                syncStatus: 'pending',
            });
            emitSnapshot();
            break;
        }
    } finally {
        syncInFlight = false;
        emitSnapshot();
    }

    return {
        syncedCount,
        failedCount,
        retryCount,
    };
}

type SyncResult =
    | {
          type: 'synced';
          response: SyncApiResponse;
      }
    | {
          type: 'failed';
          message: string;
      }
    | {
          type: 'retry';
          message: string;
      };

async function syncPayload(
    payload: OfflineVictimStatusUpdatePayload,
): Promise<SyncResult> {
    const xsrfToken = readCookie('XSRF-TOKEN');

    if (xsrfToken === null) {
        return {
            type: 'retry',
            message: 'Waiting for a secure session before syncing this household status update.',
        };
    }

    try {
        const response = await fetch(HouseholdStatusUpdateController.url(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrfToken,
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return {
                type: 'synced',
                response: (await response.json()) as SyncApiResponse,
            };
        }

        if (response.status === 422) {
            const data = (await response.json()) as {
                errors?: Record<string, string[]>;
            };

            return {
                type: 'failed',
                message: formatValidationErrors(data.errors),
            };
        }

        return {
            type: 'retry',
            message: 'The server could not confirm this household status yet. It will retry automatically when the app is online again.',
        };
    } catch {
        return {
            type: 'retry',
            message: 'The connection dropped before this household status could sync. It will retry automatically.',
        };
    }
}

function enqueueVictimStatusUpdate(
    payload: OfflineVictimStatusUpdatePayload,
): OfflineVictimStatusUpdateSummary {
    const queuedUpdate: PersistedOfflineVictimStatusUpdate = {
        id: payload.sync_id,
        referenceCode: payload.reference_code,
        status: payload.status,
        queuedAt: new Date().toISOString(),
        lastError: null,
        syncStatus: 'pending',
        payload,
    };

    writeQueue([queuedUpdate, ...readQueue()]);
    writeMeta({
        ...readMeta(),
        lastQueued: {
            referenceCode: queuedUpdate.referenceCode,
            status: queuedUpdate.status,
            queuedAt: queuedUpdate.queuedAt,
        },
    });
    emitSnapshot();

    return {
        id: queuedUpdate.id,
        referenceCode: queuedUpdate.referenceCode,
        status: queuedUpdate.status,
        queuedAt: queuedUpdate.queuedAt,
        lastError: queuedUpdate.lastError,
        syncStatus: queuedUpdate.syncStatus,
    };
}

function buildPayload(
    input: RecordVictimStatusUpdateInput,
): OfflineVictimStatusUpdatePayload {
    return {
        sync_id: createClientId(),
        reference_code: normalizeReferenceCode(input.referenceCode),
        status: input.status,
        recorded_at: new Date().toISOString(),
        captured_offline: input.capturedOffline,
    };
}

function updateQueueItem(
    id: string,
    updates: Partial<PersistedOfflineVictimStatusUpdate>,
): void {
    writeQueue(
        readQueue().map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
}

function emitSnapshot(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<OfflineVictimStatusUpdateSnapshot>(
            OFFLINE_VICTIM_STATUS_UPDATES_EVENT,
            {
                detail: getOfflineVictimStatusUpdateSnapshot(),
            },
        ),
    );
}

function readQueue(): PersistedOfflineVictimStatusUpdate[] {
    return parseJson<PersistedOfflineVictimStatusUpdate[]>(QUEUE_STORAGE_KEY, []);
}

function writeQueue(queue: PersistedOfflineVictimStatusUpdate[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function readMeta(): PersistedOfflineVictimStatusMeta {
    return parseJson<PersistedOfflineVictimStatusMeta>(META_STORAGE_KEY, {});
}

function writeMeta(meta: PersistedOfflineVictimStatusMeta): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
}

function parseJson<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
        return fallback;
    }

    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
        return fallback;
    }

    try {
        return JSON.parse(rawValue) as T;
    } catch {
        return fallback;
    }
}

function createClientId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `status-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`));

    if (cookie === undefined) {
        return null;
    }

    return decodeURIComponent(cookie.slice(name.length + 1));
}

function formatValidationErrors(errors: Record<string, string[]> | undefined): string {
    if (errors === undefined) {
        return 'The household status update could not be synced because the server rejected the payload.';
    }

    const firstError = Object.values(errors)
        .flat()
        .find((message) => message.trim() !== '');

    return firstError
        ?? 'The household status update could not be synced because the server rejected the payload.';
}

function normalizeReferenceCode(referenceCode: string): string {
    return referenceCode.trim().toUpperCase();
}
