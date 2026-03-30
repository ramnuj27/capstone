import { useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import PortalUserManagementController from '@/actions/App/Http/Controllers/Portal/PortalUserManagementController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type {
    Auth,
    PortalUserDirectory,
    PortalUserDirectoryRecord,
} from '@/types';

const UNASSIGNED_BARANGAY_VALUE = '__unassigned_barangay__';

type Props = {
    directory: PortalUserDirectory;
    filteredUsers: PortalUserDirectoryRecord[];
    selectedRecord: PortalUserDirectoryRecord;
    onClose: () => void;
    onFocusRole: (role: string) => void;
    onFocusBarangay: (barangay: string) => void;
    onSelectedRecordChange: (record: PortalUserDirectoryRecord | null) => void;
};

type DrawerPageProps = {
    auth: Auth;
};

export function PortalUserManagementDrawer({
    directory,
    filteredUsers,
    selectedRecord,
    onClose,
    onFocusRole,
    onFocusBarangay,
    onSelectedRecordChange,
}: Props) {
    const { auth } = usePage<DrawerPageProps>().props;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const currentUserId = auth.user?.id ?? null;
    const isCurrentUser = currentUserId === selectedRecord.id;
    const canAssignBarangay = selectedRecord.hasHouseholdProfile;
    const selectedBarangay = normalizeBarangayValue(selectedRecord.barangay);
    const selectedBarangayUsers = selectedRecord.barangay
        ? directory.records.filter(
              (record) => record.barangay === selectedRecord.barangay,
          )
        : [];
    const updateForm = useForm({
        role: selectedRecord.role,
        barangay: selectedBarangay,
        user: null as string | null,
    });
    const deleteForm = useForm({
        user: null as string | null,
        role: null as string | null,
    });
    const formId = `user-management-form-${selectedRecord.id}`;

    const hasPendingChanges =
        updateForm.data.role !== selectedRecord.role ||
        updateForm.data.barangay !== selectedBarangay;

    const handleUpdate = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (isCurrentUser || !hasPendingChanges) {
            return;
        }

        updateForm.transform((data) => ({
            ...data,
            barangay:
                data.barangay === UNASSIGNED_BARANGAY_VALUE
                    ? null
                    : data.barangay,
        }));

        updateForm.patch(
            PortalUserManagementController.update.url(selectedRecord.id),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    const nextBarangay = canAssignBarangay
                        ? updateForm.data.barangay === UNASSIGNED_BARANGAY_VALUE
                            ? null
                            : updateForm.data.barangay
                        : selectedRecord.barangay;

                    const nextRecord: PortalUserDirectoryRecord = {
                        ...selectedRecord,
                        role: updateForm.data.role,
                        roleLabel: roleLabelForValue(
                            directory,
                            updateForm.data.role,
                        ),
                        barangay: nextBarangay,
                        hasHouseholdProfile: selectedRecord.hasHouseholdProfile,
                    };

                    onSelectedRecordChange(nextRecord);
                    updateForm.setDefaults({
                        role: nextRecord.role,
                        barangay: normalizeBarangayValue(nextRecord.barangay),
                        user: null,
                    });
                    updateForm.clearErrors();
                },
                onFinish: () => {
                    updateForm.transform((data) => data);
                },
            },
        );
    };

    const handleDelete = (): void => {
        if (isCurrentUser) {
            return;
        }

        deleteForm.delete(
            PortalUserManagementController.destroy.url(selectedRecord.id),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    onSelectedRecordChange(null);
                    onClose();
                },
            },
        );
    };

    return (
        <>
            <SheetHeader className="border-b border-stone-200/80 px-4 py-4 dark:border-white/10">
                <div className="flex items-start gap-2.5 pr-7">
                    <div
                        className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-[0.9rem] text-xs font-semibold shadow-sm',
                            avatarClassName(selectedRecord.role),
                        )}
                    >
                        {initialsFor(selectedRecord.name)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <SheetTitle className="text-lg tracking-tight text-slate-950 dark:text-white">
                                {selectedRecord.name}
                            </SheetTitle>
                            <Badge
                                className={cn(
                                    'shadow-none',
                                    roleBadgeClassName(selectedRecord.role),
                                )}
                            >
                                {selectedRecord.roleLabel}
                            </Badge>
                        </div>
                        <SheetDescription className="mt-1 text-[13px] leading-5">
                            {accountScopeLabel(selectedRecord)}
                        </SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            <div className="space-y-3.5 overflow-y-auto px-4 py-4">
                <section className="grid gap-2 sm:grid-cols-2">
                    <DetailCard
                        label="Email"
                        value={selectedRecord.email}
                        helper="Primary account login"
                    />
                    <DetailCard
                        label="Barangay"
                        value={selectedRecord.barangay ?? 'Unassigned barangay'}
                        helper={
                            selectedRecord.hasHouseholdProfile
                                ? 'Linked community scope'
                                : 'No linked household profile yet'
                        }
                    />
                </section>

                <section className="rounded-[1rem] border border-stone-200/80 bg-stone-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Access controls
                            </p>
                            <p className="mt-1 text-[13px] leading-5 text-slate-700 dark:text-slate-300">
                                Update the portal role or re-assign the linked
                                barangay for this account.
                            </p>
                        </div>
                        {isCurrentUser && (
                            <Badge
                                variant="outline"
                                className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
                            >
                                Protected account
                            </Badge>
                        )}
                    </div>

                    <form
                        id={formId}
                        className="mt-3.5 space-y-3"
                        onSubmit={handleUpdate}
                    >
                        <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Role
                            </span>
                            <Select
                                value={updateForm.data.role}
                                onValueChange={(value) =>
                                    updateForm.setData('role', value)
                                }
                                disabled={
                                    updateForm.processing || isCurrentUser
                                }
                            >
                                <SelectTrigger className="h-9 rounded-[0.95rem] border-stone-200/80 bg-white text-sm dark:border-white/10 dark:bg-slate-900/80">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
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
                            <InputError message={updateForm.errors.role} />
                        </label>

                        <label className="space-y-1.5">
                            <span className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                                Barangay
                            </span>
                            <Select
                                value={updateForm.data.barangay}
                                onValueChange={(value) =>
                                    updateForm.setData('barangay', value)
                                }
                                disabled={
                                    updateForm.processing ||
                                    isCurrentUser ||
                                    !canAssignBarangay
                                }
                            >
                                <SelectTrigger className="h-9 rounded-[0.95rem] border-stone-200/80 bg-white text-sm dark:border-white/10 dark:bg-slate-900/80">
                                    <SelectValue placeholder="Select barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value={UNASSIGNED_BARANGAY_VALUE}
                                    >
                                        Unassigned barangay
                                    </SelectItem>
                                    {directory.barangays.map((barangay) => (
                                        <SelectItem
                                            key={barangay}
                                            value={barangay}
                                        >
                                            {barangay}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] leading-5 text-muted-foreground">
                                {canAssignBarangay
                                    ? 'Barangay assignment updates the linked household profile for this account.'
                                    : 'Barangay assignment becomes available once this account has a linked household profile.'}
                            </p>
                            <InputError message={updateForm.errors.barangay} />
                        </label>

                        <InputError message={updateForm.errors.user} />
                        <InputError message={deleteForm.errors.role} />
                        <InputError message={deleteForm.errors.user} />
                    </form>
                </section>

                <section className="grid gap-2 sm:grid-cols-3">
                    <DetailStatCard
                        label="Same role"
                        value={String(
                            directory.records.filter(
                                (record) => record.role === selectedRecord.role,
                            ).length,
                        )}
                    />
                    <DetailStatCard
                        label="Same barangay"
                        value={String(selectedBarangayUsers.length)}
                    />
                    <DetailStatCard
                        label="Filtered view"
                        value={String(filteredUsers.length)}
                    />
                </section>

                <section className="rounded-[1rem] border border-red-200/80 bg-red-50/80 p-3.5 dark:border-red-400/20 dark:bg-red-500/10">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-red-700 uppercase dark:text-red-200">
                        Danger zone
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-red-800/90 dark:text-red-100/85">
                        Deleting this account permanently removes its access.
                        Linked household profile data will follow the existing
                        cascade delete rules.
                    </p>
                </section>
            </div>

            <SheetFooter className="border-t border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="grid w-full gap-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => onFocusRole(selectedRecord.role)}
                        >
                            Focus {selectedRecord.roleLabel}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                                onFocusBarangay(
                                    selectedRecord.barangay ??
                                        UNASSIGNED_BARANGAY_VALUE,
                                )
                            }
                        >
                            Focus{' '}
                            {selectedRecord.barangay ?? 'Unassigned barangay'}
                        </Button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        <Button
                            type="submit"
                            form={formId}
                            className="w-full"
                            disabled={
                                updateForm.processing ||
                                isCurrentUser ||
                                !hasPendingChanges
                            }
                        >
                            {updateForm.processing
                                ? 'Saving...'
                                : 'Save changes'}
                        </Button>

                        <Dialog
                            open={deleteDialogOpen}
                            onOpenChange={setDeleteDialogOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full"
                                    disabled={
                                        deleteForm.processing || isCurrentUser
                                    }
                                >
                                    Delete user
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Delete this account?
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedRecord.name} will lose portal
                                        access immediately. This action cannot
                                        be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="rounded-lg border border-red-200/80 bg-red-50/80 p-3.5 text-sm leading-5 text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-100">
                                    Delete {selectedRecord.email} and any linked
                                    household profile that depends on this user
                                    account.
                                </div>
                                <InputError message={deleteForm.errors.user} />
                                <InputError message={deleteForm.errors.role} />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setDeleteDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={deleteForm.processing}
                                        onClick={handleDelete}
                                    >
                                        {deleteForm.processing
                                            ? 'Deleting...'
                                            : 'Confirm delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </SheetFooter>
        </>
    );
}

function DetailCard({
    label,
    value,
    helper,
}: {
    label: string;
    value: string;
    helper: string;
}) {
    return (
        <div className="rounded-[1rem] border border-stone-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold break-words text-slate-950 dark:text-white">
                {value}
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{helper}</p>
        </div>
    );
}

function DetailStatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[1rem] border border-stone-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {value}
            </p>
        </div>
    );
}

function normalizeBarangayValue(barangay: string | null): string {
    return barangay ?? UNASSIGNED_BARANGAY_VALUE;
}

function roleLabelForValue(
    directory: PortalUserDirectory,
    role: string,
): string {
    return (
        directory.roleOptions.find((option) => option.value === role)?.label ??
        role
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
