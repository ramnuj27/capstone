import { register } from '@/routes';
import { store as storeOfflineRegistration } from '@/routes/offline-registrations';

const QUEUE_STORAGE_KEY = 'evaqready.offline-household-registrations';
const META_STORAGE_KEY = 'evaqready.offline-household-registrations.meta';
export const OFFLINE_HOUSEHOLD_REGISTRATIONS_EVENT =
    'evaqready:offline-household-registrations:change';

let syncInitialized = false;
let syncInFlight = false;

type PersistedOfflineRegistrationMeta = {
    lastQueued?: {
        email: string;
        localReferenceCode: string;
        queuedAt: string;
    };
    lastSynced?: {
        email: string;
        localReferenceCode: string;
        referenceCode: string | null;
        syncedAt: string;
    };
};

export type OfflineHouseholdRegistrationMemberPayload = {
    full_name: string;
    age: number;
    sex: string;
    is_pwd: boolean;
    pwd_type: string | null;
    pwd_type_other: string | null;
};

export type OfflineHouseholdRegistrationPayload = {
    offline_sync_id: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    household_role: string;
    age: number;
    contact_number: string;
    sex: string;
    is_pwd: boolean;
    pwd_type: string | null;
    pwd_type_other: string | null;
    barangay: string;
    address: string;
    members: OfflineHouseholdRegistrationMemberPayload[];
};

type OfflineHouseholdRegistrationStatus = 'pending' | 'failed';

type PersistedOfflineHouseholdRegistration = {
    id: string;
    email: string;
    localReferenceCode: string;
    queuedAt: string;
    status: OfflineHouseholdRegistrationStatus;
    lastError: string | null;
    payload: OfflineHouseholdRegistrationPayload;
};

export type OfflineHouseholdRegistrationSummary = {
    id: string;
    email: string;
    localReferenceCode: string;
    queuedAt: string;
    status: OfflineHouseholdRegistrationStatus;
    lastError: string | null;
};

export type OfflineHouseholdRegistrationSnapshot = {
    isSyncing: boolean;
    pendingCount: number;
    failedCount: number;
    items: OfflineHouseholdRegistrationSummary[];
    lastQueued: PersistedOfflineRegistrationMeta['lastQueued'] | null;
    lastSynced: PersistedOfflineRegistrationMeta['lastSynced'] | null;
};

export function getOfflineHouseholdRegistrationSnapshot(): OfflineHouseholdRegistrationSnapshot {
    const queue = readQueue();
    const meta = readMeta();

    return {
        isSyncing: syncInFlight,
        pendingCount: queue.filter((item) => item.status === 'pending').length,
        failedCount: queue.filter((item) => item.status === 'failed').length,
        items: queue.map((item) => ({
            id: item.id,
            email: item.email,
            localReferenceCode: item.localReferenceCode,
            queuedAt: item.queuedAt,
            status: item.status,
            lastError: item.lastError,
        })),
        lastQueued: meta.lastQueued ?? null,
        lastSynced: meta.lastSynced ?? null,
    };
}

export function queueOfflineHouseholdRegistration(
    formData: FormData,
): OfflineHouseholdRegistrationSummary {
    const payload = buildPayload(formData);
    const queue = readQueue();

    if (queue.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) {
        throw new Error(
            'This email address already has a saved offline registration on this device.',
        );
    }

    const queuedRegistration: PersistedOfflineHouseholdRegistration = {
        id: payload.offline_sync_id,
        email: payload.email,
        localReferenceCode: createLocalReferenceCode(),
        queuedAt: new Date().toISOString(),
        status: 'pending',
        lastError: null,
        payload,
    };

    writeQueue([queuedRegistration, ...queue]);
    writeMeta({
        ...readMeta(),
        lastQueued: {
            email: queuedRegistration.email,
            localReferenceCode: queuedRegistration.localReferenceCode,
            queuedAt: queuedRegistration.queuedAt,
        },
    });

    emitSnapshot();

    return {
        id: queuedRegistration.id,
        email: queuedRegistration.email,
        localReferenceCode: queuedRegistration.localReferenceCode,
        queuedAt: queuedRegistration.queuedAt,
        status: queuedRegistration.status,
        lastError: queuedRegistration.lastError,
    };
}

export function removeOfflineHouseholdRegistration(id: string): void {
    const queue = readQueue().filter((item) => item.id !== id);

    writeQueue(queue);
    emitSnapshot();
}

export function initializeOfflineHouseholdRegistrationSync(): void {
    if (typeof window === 'undefined' || syncInitialized) {
        return;
    }

    syncInitialized = true;

    const refreshSnapshot = (): void => emitSnapshot();

    window.addEventListener('online', () => {
        refreshSnapshot();
        void syncOfflineHouseholdRegistrations();
        warmOfflineRegistrationExperience();
    });

    window.addEventListener('offline', refreshSnapshot);
    window.addEventListener('focus', () => {
        if (navigator.onLine) {
            void syncOfflineHouseholdRegistrations();
            warmOfflineRegistrationExperience();
        }
    });
    window.addEventListener('storage', (event) => {
        if (
            event.key === QUEUE_STORAGE_KEY
            || event.key === META_STORAGE_KEY
        ) {
            refreshSnapshot();
        }
    });

    warmOfflineRegistrationExperience();
    void syncOfflineHouseholdRegistrations();
    emitSnapshot();
}

function warmOfflineRegistrationExperience(): void {
    if (typeof window === 'undefined' || !navigator.onLine) {
        return;
    }

    void import('@/pages/auth/register');
    void fetch(register.url(), {
        credentials: 'same-origin',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    }).catch(() => undefined);
}

async function syncOfflineHouseholdRegistrations(): Promise<void> {
    if (
        typeof window === 'undefined'
        || !navigator.onLine
        || syncInFlight
    ) {
        return;
    }

    const queue = readQueue();

    if (queue.length === 0) {
        emitSnapshot();

        return;
    }

    syncInFlight = true;
    emitSnapshot();

    try {
        for (const queuedRegistration of readQueue()) {
            if (queuedRegistration.status !== 'pending') {
                continue;
            }

            const syncResult = await syncRegistration(queuedRegistration);

            if (syncResult.type === 'synced') {
                const nextQueue = readQueue().filter((item) => item.id !== queuedRegistration.id);

                writeQueue(nextQueue);
                writeMeta({
                    ...readMeta(),
                    lastSynced: {
                        email: queuedRegistration.email,
                        localReferenceCode: queuedRegistration.localReferenceCode,
                        referenceCode: syncResult.referenceCode,
                        syncedAt: new Date().toISOString(),
                    },
                });
                emitSnapshot();

                continue;
            }

            if (syncResult.type === 'failed') {
                updateQueueItem(queuedRegistration.id, {
                    status: 'failed',
                    lastError: syncResult.message,
                });
                emitSnapshot();
            } else {
                updateQueueItem(queuedRegistration.id, {
                    status: 'pending',
                    lastError: syncResult.message,
                });
                emitSnapshot();
                break;
            }
        }
    } finally {
        syncInFlight = false;
        emitSnapshot();
    }
}

async function syncRegistration(
    queuedRegistration: PersistedOfflineHouseholdRegistration,
): Promise<
    | { type: 'synced'; referenceCode: string | null }
    | { type: 'retry'; message: string }
    | { type: 'failed'; message: string }
> {
    const xsrfToken = readCookie('XSRF-TOKEN');

    if (xsrfToken === null) {
        return {
            type: 'retry',
            message: 'Waiting for a secure session before syncing this registration.',
        };
    }

    try {
        const response = await fetch(storeOfflineRegistration.url(), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': xsrfToken,
            },
            body: JSON.stringify(queuedRegistration.payload),
        });

        if (response.ok) {
            const data = (await response.json()) as { reference_code?: string | null };

            return {
                type: 'synced',
                referenceCode: data.reference_code ?? null,
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
            message: 'The server could not sync this registration yet. It will retry when the app is online again.',
        };
    } catch {
        return {
            type: 'retry',
            message: 'The connection dropped before this registration could sync. It will retry automatically.',
        };
    }
}

function buildPayload(formData: FormData): OfflineHouseholdRegistrationPayload {
    const membersByIndex = new Map<number, Partial<OfflineHouseholdRegistrationMemberPayload>>();

    for (const [key, value] of formData.entries()) {
        const memberKey = key.match(/^members\[(\d+)\]\[(.+)\]$/);

        if (memberKey === null) {
            continue;
        }

        const memberIndex = Number.parseInt(memberKey[1], 10);
        const field = memberKey[2];
        const currentMember = membersByIndex.get(memberIndex) ?? {};
        const normalizedValue = value.toString().trim();

        switch (field) {
            case 'full_name':
            case 'sex':
                Object.assign(currentMember, {
                    [field]: normalizedValue,
                });
                break;
            case 'age':
                Object.assign(currentMember, {
                    age: Number.parseInt(normalizedValue, 10),
                });
                break;
            case 'is_pwd':
                Object.assign(currentMember, {
                    is_pwd: normalizedValue === '1',
                });
                break;
            case 'pwd_type':
            case 'pwd_type_other':
                Object.assign(currentMember, {
                    [field]: blankToNull(normalizedValue),
                });
                break;
            default:
                break;
        }

        membersByIndex.set(memberIndex, currentMember);
    }

    const members = [...membersByIndex.entries()]
        .sort(([left], [right]) => left - right)
        .map(([, member]) => ({
            full_name: requiredMemberString(member.full_name),
            age: requiredMemberNumber(member.age),
            sex: requiredMemberString(member.sex),
            is_pwd: Boolean(member.is_pwd),
            pwd_type: optionalMemberString(member.pwd_type),
            pwd_type_other: optionalMemberString(member.pwd_type_other),
        }));

    const pwdType = blankToNull(readFormString(formData, 'pwd_type'));
    const pwdTypeOther = blankToNull(readFormString(formData, 'pwd_type_other'));

    return {
        offline_sync_id: createClientId(),
        name: readFormString(formData, 'name'),
        email: readFormString(formData, 'email'),
        password: readFormString(formData, 'password'),
        password_confirmation: readFormString(formData, 'password_confirmation'),
        household_role: readFormString(formData, 'household_role'),
        age: readFormNumber(formData, 'age'),
        contact_number: readFormString(formData, 'contact_number'),
        sex: readFormString(formData, 'sex'),
        is_pwd: readFormBoolean(formData, 'is_pwd'),
        pwd_type: pwdType,
        pwd_type_other: pwdTypeOther,
        barangay: readFormString(formData, 'barangay'),
        address: readFormString(formData, 'address'),
        members,
    };
}

function updateQueueItem(
    id: string,
    updates: Partial<PersistedOfflineHouseholdRegistration>,
): void {
    const queue = readQueue().map((item) =>
        item.id === id ? { ...item, ...updates } : item,
    );

    writeQueue(queue);
}

function emitSnapshot(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(
        new CustomEvent<OfflineHouseholdRegistrationSnapshot>(
            OFFLINE_HOUSEHOLD_REGISTRATIONS_EVENT,
            {
                detail: getOfflineHouseholdRegistrationSnapshot(),
            },
        ),
    );
}

function readQueue(): PersistedOfflineHouseholdRegistration[] {
    return parseJson<PersistedOfflineHouseholdRegistration[]>(QUEUE_STORAGE_KEY, []);
}

function writeQueue(queue: PersistedOfflineHouseholdRegistration[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function readMeta(): PersistedOfflineRegistrationMeta {
    return parseJson<PersistedOfflineRegistrationMeta>(META_STORAGE_KEY, {});
}

function writeMeta(meta: PersistedOfflineRegistrationMeta): void {
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

function readFormString(formData: FormData, field: string): string {
    const value = formData.get(field);

    return typeof value === 'string' ? value.trim() : '';
}

function readFormNumber(formData: FormData, field: string): number {
    return Number.parseInt(readFormString(formData, field), 10);
}

function readFormBoolean(formData: FormData, field: string): boolean {
    return readFormString(formData, field) === '1';
}

function requiredMemberString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function requiredMemberNumber(value: unknown): number {
    return typeof value === 'number' ? value : 0;
}

function optionalMemberString(value: unknown): string | null {
    return typeof value === 'string' && value !== '' ? value : null;
}

function blankToNull(value: string): string | null {
    return value === '' ? null : value;
}

function createLocalReferenceCode(): string {
    return `OFFLINE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createClientId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function formatValidationErrors(
    errors: Record<string, string[]> | undefined,
): string {
    if (errors === undefined) {
        return 'The saved registration could not be synced because the server rejected the data.';
    }

    const firstError = Object.values(errors)
        .flat()
        .find((message) => message.trim() !== '');

    return firstError ?? 'The saved registration could not be synced because the server rejected the data.';
}
