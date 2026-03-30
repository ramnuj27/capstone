import { Head } from '@inertiajs/react';
import { PortalUserManagementDrawer } from '@/components/portal-user-management-drawer';
import type { LucideIcon } from 'lucide-react';
import {
    MapPinned,
    Radio,
    Search,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type {
    PortalModuleMetric,
    PortalModuleWorkspace,
    PortalUserDirectory,
    PortalUserDirectoryRecord,
} from '@/types';

const ALL_ROLES_VALUE = '__all_roles__';
const ALL_BARANGAYS_VALUE = '__all_barangays__';
const UNASSIGNED_BARANGAY_VALUE = '__unassigned_barangay__';

type UsersManagementWorkspace = Exclude<PortalModuleWorkspace, null> & {
    userDirectory: PortalUserDirectory;
};

export type UsersManagementModuleProps = {
    key: string;
    title: string;
    group: string;
    roleFocus: string;
    workspace: UsersManagementWorkspace;
};

type Props = {
    module: UsersManagementModuleProps;
    Icon: LucideIcon;
};

export function PortalUsersManagementWorkspace({ module, Icon }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState(ALL_ROLES_VALUE);
    const [selectedBarangay, setSelectedBarangay] =
        useState(ALL_BARANGAYS_VALUE);
    const [selectedRecord, setSelectedRecord] =
        useState<PortalUserDirectoryRecord | null>(null);
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const directory = module.workspace.userDirectory;
    const normalizedSearchTerm = deferredSearchTerm.trim().toLowerCase();
    const hasUnassignedUsers = directory.records.some(
        (record) => record.barangay === null,
    );
    const hasActiveFilters =
        normalizedSearchTerm.length > 0 ||
        selectedRole !== ALL_ROLES_VALUE ||
        selectedBarangay !== ALL_BARANGAYS_VALUE;
    const filteredUsers = [...directory.records]
        .filter((record) => {
            const matchesRole =
                selectedRole === ALL_ROLES_VALUE ||
                record.role === selectedRole;
            const matchesBarangay = matchesBarangayFilter(
                record,
                selectedBarangay,
            );
            const matchesSearch =
                normalizedSearchTerm.length === 0 ||
                [
                    record.name,
                    record.email,
                    record.roleLabel,
                    record.barangay ?? 'unassigned barangay',
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearchTerm);

            return matchesRole && matchesBarangay && matchesSearch;
        })
        .sort((left, right) => {
            const roleOrder =
                rolePriority(left.role) - rolePriority(right.role);

            if (roleOrder !== 0) {
                return roleOrder;
            }

            const barangayOrder = (left.barangay ?? 'zzzz').localeCompare(
                right.barangay ?? 'zzzz',
            );

            if (
                selectedBarangay === ALL_BARANGAYS_VALUE &&
                barangayOrder !== 0
            ) {
                return barangayOrder;
            }

            return left.name.localeCompare(right.name);
        });
    const barangayFocusUsers =
        selectedBarangay === ALL_BARANGAYS_VALUE
            ? []
            : directory.records.filter((record) =>
                  matchesBarangayFilter(record, selectedBarangay),
              );
    const barangayAdmins = barangayFocusUsers.filter(
        (record) => record.role === 'barangay_admin',
    );
    const responderCount = barangayFocusUsers.filter(
        (record) => record.role === 'responder',
    ).length;
    const residentCount = barangayFocusUsers.filter(
        (record) => record.role === 'resident',
    ).length;
    const roleCards = directory.roleOptions.map((roleOption) => {
        const count = directory.records.filter((record) => {
            const matchesSearch =
                normalizedSearchTerm.length === 0 ||
                [
                    record.name,
                    record.email,
                    record.roleLabel,
                    record.barangay ?? 'unassigned barangay',
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearchTerm);

            return (
                matchesSearch &&
                matchesBarangayFilter(record, selectedBarangay) &&
                record.role === roleOption.value
            );
        }).length;

        return {
            ...roleOption,
            count,
        };
    });
    const groupedUsers = directory.roleOptions
        .map((roleOption) => ({
            role: roleOption,
            records: filteredUsers.filter(
                (record) => record.role === roleOption.value,
            ),
        }))
        .filter((group) => group.records.length > 0);

    return (
        <>
            <Head title={module.title} />

            <div className="flex h-full flex-1 flex-col gap-3.5 overflow-x-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_32%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(248,250,252,1)_36%)] p-3.5 md:p-4 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_26%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(2,6,23,0.98)_38%,_rgba(15,23,42,1)_100%)]">
                <section className="relative overflow-hidden rounded-[1.35rem] border border-emerald-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(236,253,245,0.9)_48%,_rgba(224,242,254,0.86)_100%)] p-4 shadow-[0_35px_90px_-58px_rgba(16,185,129,0.55)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(6,78,59,0.34)_52%,_rgba(12,74,110,0.42)_100%)]">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_52%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.18),_transparent_54%)]" />

                    <div className="relative flex flex-col gap-3.5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-white/75 px-2.5 py-1 text-[11px] font-semibold tracking-[0.22em] text-emerald-700 uppercase dark:border-emerald-300/20 dark:bg-white/8 dark:text-emerald-200">
                                <Sparkles className="size-3.5" />
                                User command center
                            </div>

                            <div className="mt-2.5 flex items-start gap-2.5">
                                <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-slate-950 text-white shadow-[0_20px_40px_-25px_rgba(15,23,42,0.7)] dark:bg-white dark:text-slate-950">
                                    <Icon className="size-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-200">
                                        {module.group}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 md:text-[1.7rem] dark:text-white">
                                        {module.title}
                                    </h1>
                                    <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-slate-700 dark:text-slate-300">
                                        {module.roleFocus}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 xl:max-w-[25rem] xl:min-w-[22rem]">
                            <HeroStatCard
                                label="Directory"
                                value={
                                    module.workspace.metrics[0]?.value ??
                                    String(directory.records.length)
                                }
                                helper="Total managed accounts"
                            />
                            <HeroStatCard
                                label="Barangays"
                                value={String(directory.barangays.length)}
                                helper="Covered in linked profiles"
                            />
                            <HeroStatCard
                                label="Visible now"
                                value={String(filteredUsers.length)}
                                helper="Accounts after filters"
                            />
                        </div>
                    </div>
                </section>

                <section className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {module.workspace.metrics.map((metric, index) => (
                        <MetricCard
                            key={metric.label}
                            metric={metric}
                            accent={metricAccent(index)}
                        />
                    ))}
                </section>

                <section className="rounded-[1.3rem] border border-stone-200/80 bg-white/96 p-3.5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] backdrop-blur dark:border-white/10 dark:bg-slate-950/82">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-[13px] font-semibold text-slate-950 dark:text-white">
                                Filter and scan users faster
                            </p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                Search by name or email, then narrow the list by
                                role and barangay so the right admin, responder,
                                or resident appears immediately.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-500">
                                {filteredUsers.length} matching accounts
                            </Badge>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-stone-200/80 bg-white/90 dark:border-white/10 dark:bg-white/5"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedRole(ALL_ROLES_VALUE);
                                        setSelectedBarangay(
                                            ALL_BARANGAYS_VALUE,
                                        );
                                    }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-3.5 grid gap-2 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)]">
                        <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Search users
                            </span>
                            <div className="relative overflow-hidden rounded-[1rem] border border-stone-200/80 bg-stone-50 shadow-inner dark:border-white/10 dark:bg-white/5">
                                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    placeholder="Search by name, email, or barangay"
                                    className="h-9 border-0 bg-transparent pl-10 text-sm shadow-none focus-visible:ring-0"
                                />
                            </div>
                        </label>

                        <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Role
                            </span>
                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole}
                            >
                                <SelectTrigger className="h-9 w-full rounded-[1rem] border-stone-200/80 bg-stone-50 text-sm dark:border-white/10 dark:bg-white/5">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_ROLES_VALUE}>
                                        All roles
                                    </SelectItem>
                                    {directory.roleOptions.map((roleOption) => (
                                        <SelectItem
                                            key={roleOption.value}
                                            value={roleOption.value}
                                        >
                                            {roleOption.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>

                        <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Barangay
                            </span>
                            <Select
                                value={selectedBarangay}
                                onValueChange={setSelectedBarangay}
                            >
                                <SelectTrigger className="h-9 w-full rounded-[1rem] border-stone-200/80 bg-stone-50 text-sm dark:border-white/10 dark:bg-white/5">
                                    <SelectValue placeholder="All barangays" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL_BARANGAYS_VALUE}>
                                        All barangays
                                    </SelectItem>
                                    {directory.barangays.map((barangay) => (
                                        <SelectItem
                                            key={barangay}
                                            value={barangay}
                                        >
                                            {barangay}
                                        </SelectItem>
                                    ))}
                                    {hasUnassignedUsers && (
                                        <SelectItem
                                            value={UNASSIGNED_BARANGAY_VALUE}
                                        >
                                            Unassigned barangay
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </label>
                    </div>

                    <div className="mt-3.5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                        {roleCards.map((roleCard) => (
                            <button
                                key={roleCard.value}
                                type="button"
                                onClick={() => setSelectedRole(roleCard.value)}
                                className={cn(
                                    'rounded-[1rem] border p-2.5 text-left transition-all hover:-translate-y-0.5',
                                    selectedRole === roleCard.value
                                        ? 'border-emerald-300 bg-emerald-50 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.5)] dark:border-emerald-400/30 dark:bg-emerald-400/10'
                                        : 'border-stone-200/80 bg-stone-50/80 hover:border-emerald-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/20 dark:hover:bg-white/8',
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <Badge
                                        className={cn(
                                            'shadow-none',
                                            roleBadgeClassName(roleCard.value),
                                        )}
                                    >
                                        {roleCard.label}
                                    </Badge>
                                    <span className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                                        {roleCard.count}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                                    {roleCardDescription(roleCard.value)}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {selectedBarangay !== ALL_BARANGAYS_VALUE && (
                    <section className="overflow-hidden rounded-[1.3rem] border border-emerald-200/80 bg-[linear-gradient(135deg,_rgba(236,253,245,0.94),_rgba(255,255,255,0.92)_44%,_rgba(240,249,255,0.9)_100%)] p-3.5 shadow-[0_32px_80px_-55px_rgba(16,185,129,0.45)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,_rgba(6,78,59,0.3),_rgba(15,23,42,0.92)_46%,_rgba(12,74,110,0.38)_100%)]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-[13px] font-semibold text-emerald-900 dark:text-emerald-100">
                                    Barangay focus board
                                </p>
                                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                                    {selectedBarangayLabel(selectedBarangay)}
                                </h2>
                                <p className="mt-1.5 text-[13px] leading-5 text-emerald-900/80 dark:text-emerald-100/80">
                                    This panel surfaces the linked barangay
                                    admin first, then shows how many responders
                                    and residents are connected to the selected
                                    area.
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-emerald-300 bg-white/80 text-emerald-700 dark:border-emerald-300/30 dark:bg-slate-950/40 dark:text-emerald-100"
                            >
                                {barangayFocusUsers.length} linked accounts
                            </Badge>
                        </div>

                        <div className="mt-3.5 grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                            <div className="rounded-[1rem] border border-white/70 bg-white/90 p-3.5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/45">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-300" />
                                    Assigned barangay admin
                                </div>
                                {barangayAdmins.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                        {barangayAdmins.map((record) => (
                                            <div
                                                key={record.id}
                                                className="rounded-[1rem] border border-emerald-200/70 bg-emerald-50/75 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 items-center justify-center rounded-[0.9rem] bg-emerald-600 text-xs font-semibold text-white dark:bg-emerald-500 dark:text-slate-950">
                                                        {initialsFor(
                                                            record.name,
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                                                            {record.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {record.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                        No barangay admin account is linked here
                                        yet.
                                    </p>
                                )}
                            </div>

                            <FocusCountCard
                                icon={ShieldCheck}
                                label="Admins"
                                value={barangayAdmins.length}
                                tone="emerald"
                            />
                            <FocusCountCard
                                icon={Radio}
                                label="Responders"
                                value={responderCount}
                                tone="amber"
                            />
                            <FocusCountCard
                                icon={Users}
                                label="Residents"
                                value={residentCount}
                                tone="sky"
                            />
                        </div>
                    </section>
                )}

                <section className="rounded-[1.3rem] border border-stone-200/80 bg-white/96 p-3.5 shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/82">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[13px] font-semibold text-slate-950 dark:text-white">
                                Directory results
                            </p>
                            <p className="mt-1 text-[13px] text-muted-foreground">
                                Accounts are grouped by role so you can scan
                                admins, responders, and residents without losing
                                context.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedRole !== ALL_ROLES_VALUE && (
                                <Badge
                                    variant="outline"
                                    className="border-stone-200/80 bg-stone-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                                >
                                    {
                                        directory.roleOptions.find(
                                            (roleOption) =>
                                                roleOption.value ===
                                                selectedRole,
                                        )?.label
                                    }
                                </Badge>
                            )}
                            {selectedBarangay !== ALL_BARANGAYS_VALUE && (
                                <Badge
                                    variant="outline"
                                    className="border-stone-200/80 bg-stone-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                                >
                                    {selectedBarangayLabel(selectedBarangay)}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {filteredUsers.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {groupedUsers.map((group) => (
                                <section
                                    key={group.role.value}
                                    className="space-y-2.5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                className={cn(
                                                    'shadow-none',
                                                    roleBadgeClassName(
                                                        group.role.value,
                                                    ),
                                                )}
                                            >
                                                {group.role.label}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {roleCardDescription(
                                                    group.role.value,
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                            {group.records.length} account
                                            {group.records.length === 1
                                                ? ''
                                                : 's'}
                                        </p>
                                    </div>

                                    <div className="grid gap-2 xl:grid-cols-2">
                                        {group.records.map((record) => {
                                            const isFocusedBarangayAdmin =
                                                selectedBarangay !==
                                                    ALL_BARANGAYS_VALUE &&
                                                record.role ===
                                                    'barangay_admin' &&
                                                matchesBarangayFilter(
                                                    record,
                                                    selectedBarangay,
                                                );

                                            return (
                                                <button
                                                    key={record.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRecord(
                                                            record,
                                                        )
                                                    }
                                                    className={cn(
                                                        'group relative overflow-hidden rounded-[1rem] border p-3 text-left shadow-[0_18px_45px_-38px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5',
                                                        roleSurfaceClassName(
                                                            record.role,
                                                        ),
                                                        isFocusedBarangayAdmin &&
                                                            'border-emerald-300 ring-2 ring-emerald-200/70 dark:border-emerald-400/30 dark:ring-emerald-400/20',
                                                    )}
                                                >
                                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.7),_transparent_58%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_58%)]" />

                                                    <div className="relative flex items-start gap-2.5">
                                                        <div
                                                            className={cn(
                                                                'flex size-9 shrink-0 items-center justify-center rounded-[0.8rem] text-[11px] font-semibold shadow-sm',
                                                                avatarClassName(
                                                                    record.role,
                                                                ),
                                                            )}
                                                        >
                                                            {initialsFor(
                                                                record.name,
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="truncate text-[13px] font-semibold text-slate-950 dark:text-white">
                                                                    {
                                                                        record.name
                                                                    }
                                                                </p>
                                                                {isFocusedBarangayAdmin && (
                                                                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-500">
                                                                        Barangay
                                                                        lead
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                                                {record.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="relative mt-2.5 flex flex-wrap gap-1.5">
                                                        <Badge
                                                            className={cn(
                                                                'shadow-none',
                                                                roleBadgeClassName(
                                                                    record.role,
                                                                ),
                                                            )}
                                                        >
                                                            {record.roleLabel}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="border-white/70 bg-white/70 text-slate-700 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-200"
                                                        >
                                                            <MapPinned className="size-3.5" />
                                                            {record.barangay ??
                                                                'Unassigned barangay'}
                                                        </Badge>
                                                    </div>

                                                    <p className="relative mt-2 text-[11px] leading-5 text-slate-700 dark:text-slate-300">
                                                        {accountScopeLabel(
                                                            record,
                                                        )}
                                                    </p>
                                                    <div className="relative mt-2.5 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                                                        Open details
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-[1rem] border border-dashed border-stone-300/80 bg-stone-50/80 p-5 text-center dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                No users match the current filters.
                            </p>
                            <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
                                Try clearing the role, barangay, or search field
                                so the right account becomes visible again.
                            </p>
                        </div>
                    )}
                </section>

                <Sheet
                    open={selectedRecord !== null}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSelectedRecord(null);
                        }
                    }}
                >
                    <SheetContent className="w-full border-l border-stone-200/80 bg-white sm:max-w-lg dark:border-white/10 dark:bg-slate-950">
                        {selectedRecord && (
                            <PortalUserManagementDrawer
                                key={selectedRecord.id}
                                directory={directory}
                                filteredUsers={filteredUsers}
                                selectedRecord={selectedRecord}
                                onClose={() => setSelectedRecord(null)}
                                onFocusRole={(role) => {
                                    setSelectedRole(role);
                                    setSelectedRecord(null);
                                }}
                                onFocusBarangay={(barangay) => {
                                    setSelectedBarangay(barangay);
                                    setSelectedRecord(null);
                                }}
                                onSelectedRecordChange={setSelectedRecord}
                            />
                        )}
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}

function HeroStatCard({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-[0.95rem] border border-white/70 bg-white/78 p-3 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.28)] backdrop-blur dark:border-white/10 dark:bg-white/8">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {value}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                {helper}
            </p>
        </div>
    );
}

function MetricCard({
    metric,
    accent,
}: {
    metric: PortalModuleMetric;
    accent: string;
}) {
    return (
        <div className="overflow-hidden rounded-[1rem] border border-stone-200/80 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/76">
            <div className={cn('h-1.5 w-full', accent)} />
            <div className="p-3">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                    {metric.label}
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                    {metric.value}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {metric.helper}
                </p>
            </div>
        </div>
    );
}

function FocusCountCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    tone: 'amber' | 'emerald' | 'sky';
}) {
    return (
        <div className="rounded-[1rem] border border-white/70 bg-white/88 p-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950/45">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-950 dark:text-white">
                <Icon className={cn('size-3.5', focusToneClassName(tone))} />
                {label}
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {value}
            </p>
            <p className="mt-1 text-[11px] tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                Selected barangay
            </p>
        </div>
    );
}

function matchesBarangayFilter(
    record: PortalUserDirectoryRecord,
    selectedBarangay: string,
): boolean {
    if (selectedBarangay === ALL_BARANGAYS_VALUE) {
        return true;
    }

    if (selectedBarangay === UNASSIGNED_BARANGAY_VALUE) {
        return record.barangay === null;
    }

    return record.barangay === selectedBarangay;
}

function selectedBarangayLabel(selectedBarangay: string): string {
    return selectedBarangay === UNASSIGNED_BARANGAY_VALUE
        ? 'Unassigned barangay'
        : selectedBarangay;
}

function rolePriority(role: string): number {
    return (
        {
            main_admin: 0,
            barangay_admin: 1,
            responder: 2,
            resident: 3,
        }[role] ?? 4
    );
}

function roleBadgeClassName(role: string): string {
    return cn('border-transparent text-white', {
        'bg-slate-900 hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-100':
            role === 'main_admin',
        'bg-emerald-600 hover:bg-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-500':
            role === 'barangay_admin',
        'bg-amber-500 hover:bg-amber-500 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-400':
            role === 'responder',
        'bg-sky-600 hover:bg-sky-600 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-500':
            role === 'resident',
    });
}

function roleSurfaceClassName(role: string): string {
    return (
        {
            main_admin:
                'border-slate-200 bg-[linear-gradient(135deg,_rgba(248,250,252,1),_rgba(226,232,240,0.82)_100%)] dark:border-slate-700/60 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.94),_rgba(30,41,59,0.9)_100%)]',
            barangay_admin:
                'border-emerald-200 bg-[linear-gradient(135deg,_rgba(236,253,245,1),_rgba(220,252,231,0.75)_100%)] dark:border-emerald-400/20 dark:bg-[linear-gradient(135deg,_rgba(6,78,59,0.28),_rgba(15,23,42,0.92)_100%)]',
            responder:
                'border-amber-200 bg-[linear-gradient(135deg,_rgba(255,251,235,1),_rgba(254,243,199,0.72)_100%)] dark:border-amber-400/20 dark:bg-[linear-gradient(135deg,_rgba(120,53,15,0.26),_rgba(15,23,42,0.92)_100%)]',
            resident:
                'border-sky-200 bg-[linear-gradient(135deg,_rgba(240,249,255,1),_rgba(224,242,254,0.74)_100%)] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,_rgba(12,74,110,0.28),_rgba(15,23,42,0.92)_100%)]',
        }[role] ??
        'border-stone-200 bg-white dark:border-white/10 dark:bg-white/5'
    );
}

function avatarClassName(role: string): string {
    return (
        {
            main_admin:
                'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950',
            barangay_admin:
                'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950',
            responder:
                'bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950',
            resident:
                'bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950',
        }[role] ??
        'bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white'
    );
}

function metricAccent(index: number): string {
    return (
        [
            'bg-[linear-gradient(90deg,_#0f172a,_#1e293b)] dark:bg-[linear-gradient(90deg,_#f8fafc,_#cbd5e1)]',
            'bg-[linear-gradient(90deg,_#0284c7,_#38bdf8)]',
            'bg-[linear-gradient(90deg,_#f59e0b,_#fbbf24)]',
            'bg-[linear-gradient(90deg,_#059669,_#34d399)]',
        ][index] ?? 'bg-[linear-gradient(90deg,_#0f172a,_#334155)]'
    );
}

function roleCardDescription(role: string): string {
    return (
        {
            main_admin: 'Citywide control accounts with the widest access.',
            barangay_admin:
                'Local leaders responsible for barangay coordination.',
            responder: 'Field operation accounts handling response updates.',
            resident: 'Resident-facing accounts linked to community records.',
        }[role] ?? 'Portal access accounts.'
    );
}

function focusToneClassName(tone: 'amber' | 'emerald' | 'sky'): string {
    return {
        amber: 'text-amber-500 dark:text-amber-300',
        emerald: 'text-emerald-600 dark:text-emerald-300',
        sky: 'text-sky-600 dark:text-sky-300',
    }[tone];
}

function accountScopeLabel(record: PortalUserDirectoryRecord): string {
    if (record.role === 'main_admin') {
        return 'Citywide administrative access across all barangays.';
    }

    if (record.barangay === null) {
        return `${record.roleLabel} account without a linked barangay yet.`;
    }

    if (record.role === 'barangay_admin') {
        return `Primary barangay administrator for ${record.barangay}.`;
    }

    if (record.role === 'responder') {
        return `Field responder profile linked to ${record.barangay}.`;
    }

    return `Resident record linked to ${record.barangay}.`;
}

function initialsFor(name: string): string {
    return name
        .split(' ')
        .filter((part) => part.length > 0)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}
