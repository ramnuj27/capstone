import { Link } from '@inertiajs/react';
import { MapPinned, QrCode, ScanLine, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const platformHighlights = [
    {
        icon: QrCode,
        title: 'QR registration',
        description: 'Create cleaner evacuee records from the start.',
    },
    {
        icon: ScanLine,
        title: 'Faster check-in',
        description: 'Track arrivals at evacuation centers in real time.',
    },
    {
        icon: ShieldCheck,
        title: 'Safer visibility',
        description:
            'Help teams see who is safe, missing, or still in transit.',
    },
] as const;

export default function AuthSimpleLayout({
    children,
    title,
    description,
    contentWidth = 'default',
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-svh overflow-hidden bg-[linear-gradient(180deg,#fffaf3_0%,#f8efe2_54%,#f3e6d7_100%)] dark:bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(255,255,255,0)_36%),radial-gradient(circle_at_bottom_right,rgba(217,245,234,0.58),rgba(217,245,234,0)_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),rgba(16,185,129,0)_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.1),rgba(14,165,233,0)_28%)]" />
            <div className="pointer-events-none absolute top-12 left-6 h-36 w-36 rounded-full bg-amber-100/80 blur-3xl dark:bg-emerald-500/10" />
            <div className="pointer-events-none absolute right-10 bottom-10 h-44 w-44 rounded-full bg-emerald-100/70 blur-3xl dark:bg-sky-500/10" />

            <div className="relative mx-auto flex min-h-svh w-full max-w-7xl items-center px-6 py-8 sm:px-8 lg:px-10">
                <div className="grid w-full gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
                    <section className="hidden min-h-[720px] flex-col justify-between rounded-[2rem] border border-stone-200/80 bg-[linear-gradient(145deg,#fff8f1_0%,#f7ecdd_55%,#efddc9_100%)] p-8 shadow-2xl shadow-slate-900/5 lg:flex dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.92)_0%,rgba(17,24,39,0.95)_52%,rgba(15,23,42,0.98)_100%)]">
                        <div className="space-y-8">
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-3 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                    <AppLogoIcon className="size-5 fill-current" />
                                </div>
                                <div>
                                    <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-emerald-700 uppercase dark:text-emerald-300">
                                        Mati City
                                    </p>
                                    <p className="text-sm font-semibold">
                                        EvaqReady Platform
                                    </p>
                                </div>
                            </Link>

                            <div className="max-w-xl space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.26em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    <MapPinned className="size-3.5" />
                                    Disaster response access
                                </div>

                                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 xl:text-5xl dark:text-white">
                                    Better coordination starts with a calmer
                                    login experience.
                                </h1>

                                <p className="max-w-lg text-base leading-8 text-slate-700 dark:text-slate-300">
                                    Access the tools your team uses to register
                                    evacuees, scan arrivals, and monitor safety
                                    updates during critical response moments.
                                </p>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-3">
                                {platformHighlights.map((highlight) => {
                                    const Icon = highlight.icon;

                                    return (
                                        <div
                                            key={highlight.title}
                                            className="rounded-[1.5rem] border border-stone-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                                        >
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                                <Icon className="size-4" />
                                            </div>
                                            <h2 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">
                                                {highlight.title}
                                            </h2>
                                            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                                {highlight.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase dark:text-emerald-300">
                                Trusted access
                            </p>
                            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-700 dark:text-slate-300">
                                Built for evacuation workflows where speed,
                                visibility, and dependable user access all
                                matter.
                            </p>
                        </div>
                    </section>

                    <section className="flex items-center justify-center">
                        <div
                            className={cn(
                                'w-full',
                                contentWidth === 'wide'
                                    ? 'max-w-3xl'
                                    : 'max-w-xl',
                            )}
                        >
                            <div className="rounded-[2rem] border border-stone-200/80 bg-white/78 p-5 shadow-2xl shadow-slate-900/8 backdrop-blur-xl sm:p-7 lg:p-8 dark:border-white/10 dark:bg-slate-950/72">
                                <div className="mb-6 flex flex-col gap-5">
                                    <div className="flex items-center justify-between gap-4 lg:hidden">
                                        <Link
                                            href={home()}
                                            className="inline-flex items-center gap-3"
                                        >
                                            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
                                                <AppLogoIcon className="size-5 fill-current" />
                                            </div>
                                            <div>
                                                <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-emerald-700 uppercase dark:text-emerald-300">
                                                    EvaqReady
                                                </p>
                                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                    Response access
                                                </p>
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[0.68rem] font-semibold tracking-[0.3em] text-emerald-700 uppercase dark:text-emerald-300">
                                            Secure account portal
                                        </p>
                                        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                                            {title}
                                        </h2>
                                        <p className="max-w-md text-sm leading-7 text-muted-foreground">
                                            {description}
                                        </p>
                                    </div>
                                </div>

                                {children}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
