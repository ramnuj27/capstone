import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    LayoutDashboard,
    Mail,
    MapPinned,
    Phone,
    QrCode,
    ShieldCheck,
    UserRound,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type Props = {
    summary: {
        referenceCode: string;
        qrSvg: string;
        registrant: {
            name: string;
            email: string;
            householdRole: string;
            age: number;
            ageGroup: string;
            contactNumber: string;
            sex: string;
            barangay: string;
            address: string;
            pwdLabel: string;
        };
        members: Array<{
            id: number;
            position: number;
            fullName: string;
            age: number;
            ageGroup: string;
            sex: string;
            pwdLabel: string;
        }>;
    };
};

export default function RegistrationComplete({ summary }: Props) {
    return (
        <>
            <Head title="Registration complete" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,#fffdf8_0%,#f5efe4_100%)] p-6 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)]">
                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.28em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                <CheckCircle2 className="size-4" />
                                Registration complete
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                                    Your household code is ready
                                </h2>
                                <p className="max-w-2xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
                                    Save this code and review the household
                                    details below. You can use this household
                                    record for future evacuation check-ins and
                                    monitoring.
                                </p>
                            </div>

                            <div className="rounded-[1.6rem] border border-slate-950/8 bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-900/15 dark:border-white/10">
                                <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-slate-300 uppercase">
                                    Household reference code
                                </p>
                                <p className="mt-3 break-all font-mono text-xl font-semibold tracking-[0.28em] sm:text-2xl">
                                    {summary.referenceCode}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <SummaryPill
                                    icon={MapPinned}
                                    label={summary.registrant.barangay}
                                />
                                <SummaryPill
                                    icon={Users}
                                    label={`${summary.members.length} household members`}
                                />
                                <SummaryPill
                                    icon={ShieldCheck}
                                    label={summary.registrant.ageGroup}
                                />
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/84 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                                <QrCode className="size-4 text-emerald-700 dark:text-emerald-300" />
                                QR preview
                            </div>

                            <div className="mt-4 rounded-[1.5rem] border border-dashed border-stone-300/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
                                <div
                                    className="mx-auto flex max-w-[220px] items-center justify-center rounded-2xl bg-white p-4 shadow-sm"
                                    dangerouslySetInnerHTML={{
                                        __html: summary.qrSvg,
                                    }}
                                />
                            </div>

                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                The QR preview contains the same household
                                reference code shown above.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                    <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/78 sm:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <UserRound className="size-4" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-slate-500 uppercase dark:text-slate-400">
                                    Main registrant
                                </p>
                                <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    Household information
                                </h3>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    These are the main account details saved
                                    during registration.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <DetailCard
                                label="Full name"
                                value={summary.registrant.name}
                            />
                            <DetailCard
                                label="Household role"
                                value={summary.registrant.householdRole}
                            />
                            <DetailCard
                                label="Email"
                                value={summary.registrant.email}
                                icon={Mail}
                            />
                            <DetailCard
                                label="Contact number"
                                value={summary.registrant.contactNumber}
                                icon={Phone}
                            />
                            <DetailCard
                                label="Age"
                                value={`${summary.registrant.age} years old`}
                            />
                            <DetailCard
                                label="Age group"
                                value={summary.registrant.ageGroup}
                                tone={summary.registrant.ageGroup}
                            />
                            <DetailCard
                                label="Sex"
                                value={summary.registrant.sex}
                            />
                            <DetailCard
                                label="PWD"
                                value={summary.registrant.pwdLabel}
                            />
                            <DetailCard
                                label="Barangay"
                                value={summary.registrant.barangay}
                            />
                            <DetailCard
                                label="Address"
                                value={summary.registrant.address}
                                className="sm:col-span-2"
                            />
                        </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-stone-200/80 bg-white/90 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/78 sm:p-6">
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <Users className="size-4" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-slate-500 uppercase dark:text-slate-400">
                                    Household members
                                </p>
                                <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    Registered members
                                </h3>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Every added member is listed here under the
                                    same household address.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {summary.members.length === 0 ? (
                                <div className="rounded-[1.5rem] border border-dashed border-stone-300/80 bg-stone-50/80 px-4 py-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-slate-900/60">
                                    No additional household members were added
                                    during registration.
                                </div>
                            ) : (
                                summary.members.map((member) => (
                                    <article
                                        key={member.id}
                                        className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-slate-500 uppercase dark:text-slate-400">
                                                    Member {member.position}
                                                </p>
                                                <h4 className="mt-2 text-base font-semibold text-slate-950 dark:text-white">
                                                    {member.fullName}
                                                </h4>
                                            </div>

                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                                                    member.ageGroup ===
                                                        'Child' &&
                                                        'bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200',
                                                    member.ageGroup ===
                                                        'Adult' &&
                                                        'bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200',
                                                    member.ageGroup ===
                                                        'Senior' &&
                                                        'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200',
                                                )}
                                            >
                                                {member.ageGroup}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <DetailCard
                                                label="Age"
                                                value={`${member.age} years old`}
                                                compact
                                            />
                                            <DetailCard
                                                label="Sex"
                                                value={member.sex}
                                                compact
                                            />
                                            <DetailCard
                                                label="PWD"
                                                value={member.pwdLabel}
                                                compact
                                            />
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="flex justify-end">
                    <Button
                        asChild
                        className="h-11 rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] px-5 text-white shadow-lg shadow-slate-900/15 hover:opacity-95 dark:bg-[linear-gradient(135deg,#ffffff_0%,#e5e7eb_100%)] dark:text-slate-950"
                    >
                        <Link href={dashboard()}>
                            <LayoutDashboard className="size-4" />
                            Continue to dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function SummaryPill({
    icon: Icon,
    label,
}: {
    icon: typeof MapPinned;
    label: string;
}) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/84 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-slate-200">
            <Icon className="size-4 text-emerald-700 dark:text-emerald-300" />
            <span>{label}</span>
        </div>
    );
}

function DetailCard({
    label,
    value,
    icon: Icon,
    tone,
    compact = false,
    className,
}: {
    label: string;
    value: string;
    icon?: typeof Mail;
    tone?: string;
    compact?: boolean;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-[1.25rem] border border-stone-200/80 bg-white/82 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70',
                compact && 'p-3',
                className,
            )}
        >
            <div className="flex items-center gap-2">
                {Icon && (
                    <Icon className="size-4 text-emerald-700 dark:text-emerald-300" />
                )}
                <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase dark:text-slate-400">
                    {label}
                </p>
            </div>
            <p
                className={cn(
                    'mt-2 text-sm font-medium leading-6 text-slate-950 dark:text-white',
                    tone === 'Child' &&
                        'text-sky-800 dark:text-sky-200',
                    tone === 'Adult' &&
                        'text-emerald-800 dark:text-emerald-200',
                    tone === 'Senior' &&
                        'text-amber-800 dark:text-amber-200',
                )}
            >
                {value}
            </p>
        </div>
    );
}

RegistrationComplete.layout = {
    title: 'Registration complete',
    description:
        'Review the generated household code, the main registrant details, and the saved household members.',
    contentWidth: 'wide',
    variant: 'card',
};
