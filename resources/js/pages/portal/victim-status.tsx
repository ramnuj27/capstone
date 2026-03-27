import { Head, router } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    CircleOff,
    CloudOff,
    HeartPulse,
    History,
    LoaderCircle,
    QrCode,
    RotateCw,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    TriangleAlert,
    Users,
} from 'lucide-react';
import { startTransition, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    OFFLINE_VICTIM_STATUS_UPDATES_EVENT,
    getOfflineVictimStatusUpdateSnapshot,
    recordVictimStatusUpdate,
    removeOfflineVictimStatusUpdate,
    syncOfflineVictimStatusUpdates,
    type OfflineVictimStatusUpdateSnapshot,
    type VictimStatusValue,
} from '@/lib/offline-victim-status-updates';
import { dashboard } from '@/routes';
import { victimStatus } from '@/routes/portal';

type SummaryProps = {
    trackedHouseholds: string;
    safeHouseholds: string;
    missingHouseholds: string;
    registeredHouseholds: string;
    updatesToday: string;
};

type HouseholdCardProps = {
    id: number;
    name: string;
    referenceCode: string;
    barangay: string | null;
    status: 'registered' | VictimStatusValue;
    statusLabel: string;
    statusUpdatedAt: string | null;
    statusUpdatedBy: string | null;
};

type RecentUpdateProps = {
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

type Props = {
    summary: SummaryProps;
    recentHouseholds: HouseholdCardProps[];
    recentUpdates: RecentUpdateProps[];
};

type BarcodeDetectorResult = {
    rawValue?: string;
};

type BarcodeDetectorShape = {
    detect(source: ImageBitmapSource): Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorConstructor = new (options?: {
    formats?: string[];
}) => BarcodeDetectorShape;

export default function VictimStatusPage({
    summary,
    recentHouseholds,
    recentUpdates,
}: Props) {
    const [referenceCode, setReferenceCode] = useState('');
    const [selectedStatus, setSelectedStatus] =
        useState<VictimStatusValue>('safe');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(() =>
        typeof window === 'undefined' ? true : window.navigator.onLine,
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [queueSnapshot, setQueueSnapshot] =
        useState<OfflineVictimStatusUpdateSnapshot>(() =>
            getOfflineVictimStatusUpdateSnapshot(),
        );
    const [scannerSupported, setScannerSupported] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<number | null>(null);
    const scanBusyRef = useRef(false);
    const lastSyncedAtRef = useRef<string | null>(
        getOfflineVictimStatusUpdateSnapshot().lastSynced?.syncedAt ?? null,
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const BarcodeDetectorClass = (
            window as Window & {
                BarcodeDetector?: BarcodeDetectorConstructor;
            }
        ).BarcodeDetector;

        setScannerSupported(
            BarcodeDetectorClass !== undefined
                && window.navigator.mediaDevices?.getUserMedia !== undefined,
        );
    }, []);

    useEffect(() => {
        const updateConnectionState = (): void => {
            setIsOnline(window.navigator.onLine);
        };

        const updateOfflineSnapshot = (event: Event): void => {
            const customEvent =
                event as CustomEvent<OfflineVictimStatusUpdateSnapshot>;
            const nextSnapshot = customEvent.detail;
            const nextSyncedAt = nextSnapshot.lastSynced?.syncedAt ?? null;

            if (
                nextSyncedAt !== null
                && nextSyncedAt !== lastSyncedAtRef.current
            ) {
                lastSyncedAtRef.current = nextSyncedAt;

                router.reload({
                    only: ['summary', 'recentHouseholds', 'recentUpdates'],
                });
            } else {
                lastSyncedAtRef.current = nextSyncedAt;
            }

            setQueueSnapshot(nextSnapshot);
        };

        updateConnectionState();
        setQueueSnapshot(getOfflineVictimStatusUpdateSnapshot());

        window.addEventListener('online', updateConnectionState);
        window.addEventListener('offline', updateConnectionState);
        window.addEventListener(
            OFFLINE_VICTIM_STATUS_UPDATES_EVENT,
            updateOfflineSnapshot as EventListener,
        );

        return () => {
            window.removeEventListener('online', updateConnectionState);
            window.removeEventListener('offline', updateConnectionState);
            window.removeEventListener(
                OFFLINE_VICTIM_STATUS_UPDATES_EVENT,
                updateOfflineSnapshot as EventListener,
            );
        };
    }, []);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        await recordStatus({
            referenceCode,
            status: selectedStatus,
        });
    }

    async function recordStatus({
        referenceCode: code,
        status,
    }: {
        referenceCode: string;
        status: VictimStatusValue;
    }): Promise<void> {
        const normalizedReferenceCode = normalizeReferenceCode(code);

        if (normalizedReferenceCode === '') {
            setFeedback('Enter or scan a household reference code first.');

            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const result = await recordVictimStatusUpdate({
                referenceCode: normalizedReferenceCode,
                status,
                capturedOffline: !isOnline,
            });

            if (result.type === 'synced') {
                startTransition(() => {
                    setReferenceCode('');
                    setFeedback(
                        `${result.update.referenceCode} is now marked as ${result.update.statusLabel.toLowerCase()}.`,
                    );
                    setQueueSnapshot(getOfflineVictimStatusUpdateSnapshot());
                });

                router.reload({
                    only: ['summary', 'recentHouseholds', 'recentUpdates'],
                });

                return;
            }

            if (result.type === 'queued') {
                startTransition(() => {
                    setReferenceCode('');
                    setFeedback(result.message);
                    setQueueSnapshot(getOfflineVictimStatusUpdateSnapshot());
                });

                if (isOnline) {
                    const syncSummary = await syncOfflineVictimStatusUpdates();

                    if (syncSummary.syncedCount > 0) {
                        setFeedback(
                            `${normalizedReferenceCode} synced after the connection recovered.`,
                        );
                    }
                }

                return;
            }

            setFeedback(result.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function startScanner(): Promise<void> {
        if (scannerSupported === false || videoRef.current === null) {
            setScannerError(
                'This browser does not support camera-based QR scanning yet. Enter the household code manually instead.',
            );

            return;
        }

        stopScanner();
        setScannerError(null);
        setScannerFeedback('Point the camera at the household QR code.');

        try {
            const stream = await window.navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: {
                        ideal: 'environment',
                    },
                },
            });

            streamRef.current = stream;

            if (videoRef.current === null) {
                stopScanner();

                return;
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            const BarcodeDetectorClass = (
                window as Window & {
                    BarcodeDetector?: BarcodeDetectorConstructor;
                }
            ).BarcodeDetector;

            if (BarcodeDetectorClass === undefined) {
                setScannerError(
                    'The camera opened, but QR detection is not available on this device. Enter the code manually instead.',
                );
                stopScanner();

                return;
            }

            const detector = new BarcodeDetectorClass({
                formats: ['qr_code'],
            });

            setScannerActive(true);

            const scheduleNextScan = (): void => {
                scanTimerRef.current = window.setTimeout(() => {
                    void scanFrame();
                }, 350);
            };

            const scanFrame = async (): Promise<void> => {
                if (videoRef.current === null || streamRef.current === null) {
                    return;
                }

                if (
                    videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
                    || scanBusyRef.current
                ) {
                    scheduleNextScan();

                    return;
                }

                scanBusyRef.current = true;

                try {
                    const detectedCodes = await detector.detect(videoRef.current);
                    const matchedCode = detectedCodes.find(
                        (detectedCode) =>
                            typeof detectedCode.rawValue === 'string'
                            && detectedCode.rawValue.trim() !== '',
                    );

                    if (matchedCode?.rawValue !== undefined) {
                        const normalizedDetectedCode = normalizeReferenceCode(
                            matchedCode.rawValue,
                        );

                        setReferenceCode(normalizedDetectedCode);
                        setScannerFeedback(
                            'QR code captured. Choose a status and save the update.',
                        );
                        stopScanner();

                        return;
                    }
                } catch {
                    setScannerError(
                        'The camera opened, but QR scanning could not continue on this device. Enter the code manually instead.',
                    );
                    stopScanner();

                    return;
                } finally {
                    scanBusyRef.current = false;
                }

                scheduleNextScan();
            };

            scheduleNextScan();
        } catch {
            setScannerError(
                'Camera access was unavailable. Enter the household code manually instead.',
            );
            stopScanner();
        }
    }

    function stopScanner(): void {
        if (scanTimerRef.current !== null) {
            window.clearTimeout(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        scanBusyRef.current = false;
        setScannerActive(false);

        if (streamRef.current !== null) {
            for (const track of streamRef.current.getTracks()) {
                track.stop();
            }

            streamRef.current = null;
        }

        if (videoRef.current !== null) {
            videoRef.current.srcObject = null;
        }
    }

    return (
        <>
            <Head title="Victim Status" />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <section className="rounded-[1.65rem] border border-stone-200/80 bg-[linear-gradient(180deg,#fffdf8_0%,#f4efe5_100%)] p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.26em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                <HeartPulse className="size-4" />
                                Responder status workflow
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                Scan arrivals and sync them when the signal comes back
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-300">
                                Responders can mark a household as safe or missing
                                while online, or save the update on this device
                                during outages and let the app sync it later.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusPill
                                online={isOnline}
                                pendingCount={queueSnapshot.pendingCount}
                            />
                            <Badge
                                variant="outline"
                                className="rounded-full border-stone-200/80 bg-white/80 px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                            >
                                {queueSnapshot.failedCount} failed sync
                                {queueSnapshot.failedCount === 1 ? '' : 's'}
                            </Badge>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        icon={Users}
                        label="Tracked households"
                        value={summary.trackedHouseholds}
                        helper="Household codes ready for evacuation monitoring"
                    />
                    <SummaryCard
                        icon={ShieldCheck}
                        label="Marked safe"
                        value={summary.safeHouseholds}
                        helper="Households confirmed at an evacuation center"
                        tone="safe"
                    />
                    <SummaryCard
                        icon={ShieldAlert}
                        label="Marked missing"
                        value={summary.missingHouseholds}
                        helper="Households that still need responder follow-up"
                        tone="missing"
                    />
                    <SummaryCard
                        icon={CircleOff}
                        label="Registered only"
                        value={summary.registeredHouseholds}
                        helper="Households without a responder status update yet"
                    />
                    <SummaryCard
                        icon={History}
                        label="Updates today"
                        value={summary.updatesToday}
                        helper="Responder status events synced since midnight"
                    />
                </section>

                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    Scan or enter a household code
                                </p>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Use the QR camera on supported browsers, or
                                    type the printed household reference code
                                    manually. Offline saves will sync the next
                                    time this device is online.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                        void syncOfflineVictimStatusUpdates();
                                    }}
                                    disabled={queueSnapshot.pendingCount === 0 || isOnline === false}
                                >
                                    <RotateCw className="size-4" />
                                    Retry sync
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                        if (scannerActive) {
                                            stopScanner();
                                            setScannerFeedback(null);

                                            return;
                                        }

                                        void startScanner();
                                    }}
                                >
                                    <Camera className="size-4" />
                                    {scannerActive ? 'Stop camera' : 'Use camera'}
                                </Button>
                            </div>
                        </div>

                        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="space-y-3">
                                    <label
                                        htmlFor="reference-code"
                                        className="text-sm font-medium text-slate-950 dark:text-white"
                                    >
                                        Household reference code
                                    </label>
                                    <Input
                                        id="reference-code"
                                        value={referenceCode}
                                        onChange={(event) => {
                                            setReferenceCode(
                                                normalizeReferenceCode(
                                                    event.target.value,
                                                ),
                                            );
                                        }}
                                        autoComplete="off"
                                        spellCheck={false}
                                        placeholder="EVQ-MATI-XXXXXX"
                                        className="h-12 rounded-2xl border-stone-200/60 bg-white/95 px-4 font-mono tracking-[0.18em] uppercase shadow-[0_12px_30px_-26px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/70"
                                    />

                                    <div className="flex flex-wrap gap-2">
                                        <StatusSelectButton
                                            active={selectedStatus === 'safe'}
                                            label="Mark safe"
                                            onClick={() => {
                                                setSelectedStatus('safe');
                                            }}
                                            tone="safe"
                                        />
                                        <StatusSelectButton
                                            active={selectedStatus === 'missing'}
                                            label="Mark missing"
                                            onClick={() => {
                                                setSelectedStatus('missing');
                                            }}
                                            tone="missing"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className={cn(
                                            'h-11 rounded-2xl px-5 text-white shadow-lg shadow-slate-900/15',
                                            selectedStatus === 'safe'
                                                ? 'bg-[linear-gradient(135deg,#047857_0%,#10b981_100%)] hover:opacity-95'
                                                : 'bg-[linear-gradient(135deg,#991b1b_0%,#ef4444_100%)] hover:opacity-95',
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && (
                                            <LoaderCircle className="size-4 animate-spin" />
                                        )}
                                        {isOnline
                                            ? `Save ${selectedStatus === 'safe' ? 'safe' : 'missing'} status`
                                            : 'Save offline for sync'}
                                    </Button>
                                </div>

                                <div className="rounded-[1.4rem] border border-dashed border-stone-300/80 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-white">
                                        <QrCode className="size-4 text-emerald-700 dark:text-emerald-300" />
                                        QR camera preview
                                    </div>

                                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-stone-200/80 bg-slate-950/96">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className={cn(
                                                'aspect-[4/3] w-full object-cover',
                                                scannerActive ? 'block' : 'hidden',
                                            )}
                                        />
                                        {!scannerActive && (
                                            <div className="flex aspect-[4/3] items-center justify-center px-4 text-center text-sm text-slate-300">
                                                {scannerSupported
                                                    ? 'Start the camera to scan a printed household QR code.'
                                                    : 'This browser will use manual code entry instead of live camera scanning.'}
                                            </div>
                                        )}
                                    </div>

                                    {(scannerFeedback ?? scannerError) && (
                                        <p
                                            className={cn(
                                                'mt-3 text-sm leading-6',
                                                scannerError === null
                                                    ? 'text-emerald-700 dark:text-emerald-300'
                                                    : 'text-amber-700 dark:text-amber-300',
                                            )}
                                        >
                                            {scannerError ?? scannerFeedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>

                        {feedback && (
                            <Alert className="mt-5 rounded-2xl border-stone-200/80 bg-stone-50/85 dark:border-white/10 dark:bg-white/5">
                                <TriangleAlert className="size-4" />
                                <AlertTitle>Victim status update</AlertTitle>
                                <AlertDescription>{feedback}</AlertDescription>
                            </Alert>
                        )}
                    </section>

                    <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    Offline sync queue
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Pending and failed updates saved on this
                                    device appear here until they sync or are removed.
                                </p>
                            </div>

                            {queueSnapshot.isSyncing && (
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-emerald-300/70 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
                                >
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                    Syncing
                                </Badge>
                            )}
                        </div>

                        <div className="mt-4 space-y-3">
                            {queueSnapshot.items.length === 0 ? (
                                <div className="rounded-[1.3rem] border border-dashed border-stone-300/80 bg-stone-50/70 px-4 py-5 text-sm leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/5">
                                    No local status updates are waiting on this device.
                                </div>
                            ) : (
                                queueSnapshot.items.map((item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-mono text-sm font-semibold tracking-[0.18em] text-slate-950 uppercase dark:text-white">
                                                    {item.referenceCode}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Queued {formatTimestamp(item.queuedAt)}
                                                </p>
                                            </div>

                                            <Badge
                                                className={cn(
                                                    'rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold uppercase',
                                                    item.syncStatus === 'failed'
                                                        ? 'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200'
                                                        : item.status === 'safe'
                                                            ? 'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                                                            : 'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200',
                                                )}
                                            >
                                                {item.syncStatus === 'failed'
                                                    ? 'Failed'
                                                    : item.status}
                                            </Badge>
                                        </div>

                                        {item.lastError && (
                                            <p className="mt-3 text-sm leading-6 text-amber-700 dark:text-amber-300">
                                                {item.lastError}
                                            </p>
                                        )}

                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="rounded-full text-slate-700 hover:text-rose-700 dark:text-slate-200 dark:hover:text-rose-300"
                                                onClick={() => {
                                                    removeOfflineVictimStatusUpdate(item.id);
                                                    setQueueSnapshot(
                                                        getOfflineVictimStatusUpdateSnapshot(),
                                                    );
                                                }}
                                            >
                                                <Trash2 className="size-4" />
                                                Remove
                                            </Button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                        {queueSnapshot.lastSynced && (
                            <div className="mt-5 rounded-[1.25rem] border border-emerald-300/50 bg-emerald-50/80 p-4 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                                <p className="font-semibold">
                                    Last synced household
                                </p>
                                <p className="mt-2 leading-6">
                                    {queueSnapshot.lastSynced.name} (
                                    {queueSnapshot.lastSynced.referenceCode}) was
                                    marked {queueSnapshot.lastSynced.statusLabel.toLowerCase()}
                                    {' '}on {formatTimestamp(queueSnapshot.lastSynced.syncedAt)}.
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    Recent households
                                </p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Use these quick actions when the household is
                                    already visible in your latest operations view.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {recentHouseholds.length === 0 ? (
                                <div className="rounded-[1.3rem] border border-dashed border-stone-300/80 bg-stone-50/70 px-4 py-5 text-sm leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/5">
                                    No households have been registered yet.
                                </div>
                            ) : (
                                recentHouseholds.map((household) => (
                                    <article
                                        key={household.id}
                                        className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-base font-semibold text-slate-950 dark:text-white">
                                                    {household.name}
                                                </p>
                                                <p className="mt-2 font-mono text-xs tracking-[0.18em] text-slate-500 uppercase dark:text-slate-300">
                                                    {household.referenceCode}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {household.barangay ?? 'Barangay not set'}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {household.statusUpdatedAt
                                                        ? `Updated ${formatTimestamp(household.statusUpdatedAt)}${household.statusUpdatedBy ? ` by ${household.statusUpdatedBy}` : ''}`
                                                        : 'No responder status update yet'}
                                                </p>
                                            </div>

                                            <StatusBadge
                                                status={household.status}
                                                label={household.statusLabel}
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <QuickActionButton
                                                label="Mark safe"
                                                tone="safe"
                                                disabled={isSubmitting}
                                                onClick={() => {
                                                    void recordStatus({
                                                        referenceCode: household.referenceCode,
                                                        status: 'safe',
                                                    });
                                                }}
                                            />
                                            <QuickActionButton
                                                label="Mark missing"
                                                tone="missing"
                                                disabled={isSubmitting}
                                                onClick={() => {
                                                    void recordStatus({
                                                        referenceCode: household.referenceCode,
                                                        status: 'missing',
                                                    });
                                                }}
                                            />
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                        <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                Recent responder updates
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                The latest synced responder events stay visible here
                                even after the app reconnects.
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {recentUpdates.length === 0 ? (
                                <div className="rounded-[1.3rem] border border-dashed border-stone-300/80 bg-stone-50/70 px-4 py-5 text-sm leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/5">
                                    No synced responder updates yet.
                                </div>
                            ) : (
                                recentUpdates.map((update) => (
                                    <article
                                        key={update.id}
                                        className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                    {update.name}
                                                </p>
                                                <p className="mt-2 font-mono text-xs tracking-[0.18em] text-slate-500 uppercase dark:text-slate-300">
                                                    {update.referenceCode}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {update.barangay ?? 'Barangay not set'}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {formatTimestamp(update.recordedAt)}
                                                    {update.recordedBy ? ` by ${update.recordedBy}` : ''}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge
                                                    status={update.status}
                                                    label={update.statusLabel}
                                                />
                                                {update.capturedOffline && (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full border-amber-300/70 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
                                                    >
                                                        <CloudOff className="size-3.5" />
                                                        Captured offline
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    helper,
    tone = 'default',
}: {
    icon: typeof Users;
    label: string;
    value: string;
    helper: string;
    tone?: 'default' | 'safe' | 'missing';
}) {
    return (
        <div className="rounded-[1.35rem] border border-stone-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/76">
            <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-stone-100 text-slate-950 dark:bg-slate-900 dark:text-white">
                <Icon
                    className={cn(
                        'size-4.5',
                        tone === 'safe'
                            && 'text-emerald-700 dark:text-emerald-300',
                        tone === 'missing'
                            && 'text-rose-700 dark:text-rose-300',
                    )}
                />
            </div>
            <p className="mt-3 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {value}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {helper}
            </p>
        </div>
    );
}

function StatusPill({
    online,
    pendingCount,
}: {
    online: boolean;
    pendingCount: number;
}) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                online
                    ? 'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                    : 'border-amber-300/80 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
            )}
        >
            {online ? (
                <CheckCircle2 className="size-3.5" />
            ) : (
                <CloudOff className="size-3.5" />
            )}
            {online
                ? `Online${pendingCount > 0 ? `, ${pendingCount} waiting to sync` : ''}`
                : 'Offline saving enabled'}
        </Badge>
    );
}

function StatusSelectButton({
    active,
    label,
    tone,
    onClick,
}: {
    active: boolean;
    label: string;
    tone: VictimStatusValue;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active
                    ? tone === 'safe'
                        ? 'border-emerald-400/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                        : 'border-rose-400/80 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200'
                    : 'border-stone-200/80 bg-white text-slate-700 hover:border-stone-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20',
            )}
        >
            {tone === 'safe' ? (
                <ShieldCheck className="size-4" />
            ) : (
                <ShieldAlert className="size-4" />
            )}
            {label}
        </button>
    );
}

function StatusBadge({
    status,
    label,
}: {
    status: 'registered' | VictimStatusValue;
    label: string;
}) {
    return (
        <Badge
            className={cn(
                'rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold uppercase',
                status === 'safe'
                    ? 'border-emerald-300/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                    : status === 'missing'
                        ? 'border-rose-300/80 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200'
                        : 'border-stone-300/80 bg-stone-50 text-slate-700 dark:border-white/15 dark:bg-white/8 dark:text-slate-200',
            )}
        >
            {label}
        </Badge>
    );
}

function QuickActionButton({
    label,
    tone,
    disabled,
    onClick,
}: {
    label: string;
    tone: VictimStatusValue;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'h-9 rounded-full px-4 text-white shadow-sm',
                tone === 'safe'
                    ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                    : 'bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500',
            )}
        >
            {tone === 'safe' ? (
                <ShieldCheck className="size-4" />
            ) : (
                <ShieldAlert className="size-4" />
            )}
            {label}
        </Button>
    );
}

function formatTimestamp(value: string | null): string {
    if (value === null) {
        return 'Time not available';
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function normalizeReferenceCode(referenceCode: string): string {
    return referenceCode.trim().toUpperCase();
}

VictimStatusPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Victim Status',
            href: victimStatus(),
        },
    ],
};
