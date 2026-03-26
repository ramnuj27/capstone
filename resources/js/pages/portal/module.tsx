import { Head } from '@inertiajs/react';
import { MapPinned } from 'lucide-react';
import { PortalInteractiveMap } from '@/components/portal-interactive-map';
import { getPortalIcon } from '@/lib/portal-icons';
import { dashboard } from '@/routes';
import type {
    PortalContentCard,
    PortalMapFocus,
    PortalModuleMetric,
    PortalModuleSection,
    PortalModuleWorkspace,
} from '@/types';

type ModuleProps = {
    key: string;
    title: string;
    description: string;
    href: string;
    group: string;
    icon: string;
    roleFocus: string;
    allowedRoles: string[];
    summary: string;
    featuredCards: PortalContentCard[];
    checklist: string[];
    mapFocus: PortalMapFocus | null;
    workspace: PortalModuleWorkspace;
};

type Props = {
    module: ModuleProps;
};

export default function PortalModule({ module }: Props) {
    const Icon = getPortalIcon(module.icon);

    if (module.mapFocus) {
        const mapModule: ModuleProps & { mapFocus: PortalMapFocus } = {
            ...module,
            mapFocus: module.mapFocus,
        };

        return (
            <MapModuleView
                module={mapModule}
                Icon={Icon}
            />
        );
    }

    if (module.workspace) {
        return <WorkspaceModuleView module={module} workspace={module.workspace} Icon={Icon} />;
    }

    return <SimpleModuleView module={module} Icon={Icon} />;
}

function MapModuleView({
    module,
    Icon,
}: {
    module: ModuleProps & { mapFocus: PortalMapFocus };
    Icon: ReturnType<typeof getPortalIcon>;
}) {
    return (
        <>
            <Head title={module.title} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-stone-100 text-slate-950 dark:bg-slate-900 dark:text-white">
                                <Icon className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="inline-flex items-center rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                    {module.group}
                                </div>
                                <h1 className="mt-3 truncate text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    {module.title}
                                </h1>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            <MapPinned className="size-3.5" />
                            Mati City
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-white shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-5 py-4 dark:border-white/10">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                            {module.mapFocus?.title ?? 'Mati City map'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {module.mapFocus?.city}
                        </p>
                    </div>

                    <PortalInteractiveMap
                        mapFocus={module.mapFocus}
                        alt={`${module.mapFocus.city} map preview`}
                        emptyMessage="Set `VITE_MAPBOX_ACCESS_TOKEN` in your `.env` and Railway environment variables, then restart Vite so the Mati City map can render here."
                    />

                    <div className="flex flex-wrap gap-3 border-t border-stone-200/80 px-5 py-3 text-xs text-muted-foreground dark:border-white/10">
                        <span>{module.mapFocus?.city}</span>
                        <span>Zoom {module.mapFocus?.zoom ?? 0}</span>
                        <span>Drag and rotation enabled</span>
                    </div>
                </section>
            </div>
        </>
    );
}

function WorkspaceModuleView({
    module,
    workspace,
    Icon,
}: {
    module: ModuleProps;
    workspace: Exclude<PortalModuleWorkspace, null>;
    Icon: ReturnType<typeof getPortalIcon>;
}) {
    return (
        <>
            <Head title={module.title} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="flex items-start gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-stone-100 text-slate-950 dark:bg-slate-900 dark:text-white">
                            <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="inline-flex items-center rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                {module.group}
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                {module.title}
                            </h1>
                            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                                {module.roleFocus}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {workspace.metrics.map((metric) => (
                        <MetricCard key={metric.label} metric={metric} />
                    ))}
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    {workspace.sections.map((section) => (
                        <SectionCard key={section.title} section={section} />
                    ))}
                </section>
            </div>
        </>
    );
}

function SimpleModuleView({
    module,
    Icon,
}: {
    module: ModuleProps;
    Icon: ReturnType<typeof getPortalIcon>;
}) {
    return (
        <>
            <Head title={module.title} />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4 md:p-6">
                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-stone-100 text-slate-950 dark:bg-slate-900 dark:text-white">
                            <Icon className="size-5" />
                        </div>
                        <div>
                            <div className="inline-flex items-center rounded-full border border-stone-200/80 bg-stone-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-slate-700 uppercase dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                                {module.group}
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                {module.title}
                            </h1>
                        </div>
                    </div>
                </section>

                <section className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
                    <p className="text-sm font-medium leading-7 text-slate-700 dark:text-slate-300">
                        {module.roleFocus}
                    </p>
                </section>
            </div>
        </>
    );
}

function MetricCard({ metric }: { metric: PortalModuleMetric }) {
    return (
        <div className="rounded-[1.35rem] border border-stone-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/76">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                {metric.label}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {metric.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {metric.helper}
            </p>
        </div>
    );
}

function SectionCard({ section }: { section: PortalModuleSection }) {
    return (
        <div className="rounded-[1.5rem] border border-stone-200/80 bg-white p-5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {section.title}
            </p>

            <div className="mt-4 space-y-3">
                {section.rows.map((row) => (
                    <div
                        key={`${section.title}-${row.primary}-${row.secondary}`}
                        className="rounded-2xl border border-stone-200/75 bg-stone-50/70 p-4 dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    {row.primary}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {row.meta}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                {row.secondary}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

PortalModule.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Access Module',
            href: dashboard(),
        },
    ],
};
