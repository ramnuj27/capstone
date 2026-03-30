import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthMinimalLayout({
    children,
    title,
    description,
    contentWidth = 'default',
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-svh overflow-hidden bg-[linear-gradient(180deg,#fffdf8_0%,#f7efe3_100%)] px-6 py-10 md:px-10 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]">
            <div className="pointer-events-none absolute top-0 left-0 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl dark:bg-emerald-500/10" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-sky-100/60 blur-3xl dark:bg-sky-500/10" />

            <div
                className={cn(
                    'relative mx-auto flex min-h-[calc(100svh-5rem)] w-full flex-col justify-center',
                    contentWidth === 'wide' ? 'max-w-5xl' : 'max-w-md',
                )}
            >
                <div className="rounded-[2rem] border border-stone-200/80 bg-white/86 p-5 shadow-[0_30px_90px_-54px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-slate-950/78">
                    <Link
                        href={home()}
                        className="mb-8 inline-flex items-center gap-3"
                    >
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                            <AppLogoIcon className="size-5 fill-current" />
                        </div>
                        <div className="text-left">
                            <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-emerald-700 uppercase dark:text-emerald-300">
                                EvaqReady
                            </p>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                Secure access
                            </p>
                        </div>
                    </Link>

                    {(title || description) && (
                        <div className="mb-6">
                            {title && (
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
