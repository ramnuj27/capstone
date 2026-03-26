import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PortalInteractiveMap } from '@/components/portal-interactive-map';
import { getPortalIcon } from '@/lib/portal-icons';
import { dashboard } from '@/routes';
import type { PortalMapFocus, PortalNavigationItem } from '@/types';

type DashboardMapPreview = {
    title: string;
    href: string;
    mapFocus: PortalMapFocus | null;
} | null;

type Props = {
    title: string;
    description: string;
    roleLabel: string;
    barangay: string | null;
    highlights: string[];
    quickLinks: PortalNavigationItem[];
    mapPreview: DashboardMapPreview;
};

export default function PortalDashboard({
    title,
    roleLabel,
    barangay,
    quickLinks,
    mapPreview,
}: Props) {
    return (
        <>
            <Head title={title} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                            <ShieldCheck className="size-3.5" />
                            {roleLabel}
                        </div>
                        {barangay && (
                            <div className="rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                {barangay}
                            </div>
                        )}
                    </div>

                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {title}
                    </h1>
                </section>

                {mapPreview && (
                    <section className="overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-5 py-4 dark:border-white/10">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    Mati City Map
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {mapPreview.title}
                                </p>
                            </div>

                            <Link
                                href={mapPreview.href}
                                prefetch
                                className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/30 dark:hover:text-emerald-300"
                            >
                                Open map
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>

                        <PortalInteractiveMap
                            mapFocus={mapPreview.mapFocus}
                            alt="Mati City map preview"
                            emptyMessage="Set `VITE_MAPBOX_ACCESS_TOKEN` in your `.env`, then restart Vite so the Mati City map can render here."
                        />
                    </section>
                )}

                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            Quick Access
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {quickLinks.length} sections
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {quickLinks.map((item) => {
                            const Icon = getPortalIcon(item.icon);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    className="group flex items-center justify-between gap-3 rounded-[1.15rem] border border-stone-200/80 bg-stone-50/80 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-emerald-300/70 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-white/7"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white">
                                            <Icon className="size-4.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                                                {item.title}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {item.group}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </>
    );
}

PortalDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
