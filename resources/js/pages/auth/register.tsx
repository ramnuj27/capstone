import { Form, Head } from '@inertiajs/react';
import {
    House,
    MapPinned,
    Plus,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import { startTransition, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store } from '@/routes/register';

const householdRoleOptions = [
    { value: 'resident', label: 'Resident' },
    { value: 'respondent', label: 'Respondent' },
] as const;

const sexOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
] as const;

const pwdOptions = [
    { value: 'physical', label: 'Physical disability' },
    { value: 'visual', label: 'Visual impairment' },
    { value: 'hearing', label: 'Hearing impairment' },
    { value: 'speech', label: 'Speech impairment' },
    { value: 'intellectual', label: 'Intellectual disability' },
    { value: 'learning', label: 'Learning disability' },
    { value: 'psychosocial', label: 'Psychosocial disability' },
    { value: 'other', label: 'Other' },
] as const;

type HouseholdMemberForm = {
    id: string;
    full_name: string;
    age: string;
    sex: string;
    is_pwd: string;
    pwd_type: string;
    pwd_type_other: string;
};

type Props = {
    barangays: string[];
};

const selectFieldClasses =
    'h-12 w-full rounded-xl border border-stone-200/55 bg-white/95 px-4 text-sm text-slate-950 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.42)] transition-[border-color,box-shadow] outline-none focus-visible:border-emerald-400/70 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950/70 dark:text-white';

const inputFieldClasses =
    'h-12 rounded-xl border-stone-200/55 bg-white/95 px-4 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-slate-950/70';

const sectionClasses =
    'rounded-[1.75rem] border border-stone-200/80 bg-white/92 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/76 sm:p-6';

export default function Register({ barangays }: Props) {
    const [householdRole, setHouseholdRole] = useState('');
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [barangay, setBarangay] = useState('');
    const [isPwd, setIsPwd] = useState('0');
    const [pwdType, setPwdType] = useState('');
    const [pwdTypeOther, setPwdTypeOther] = useState('');
    const [members, setMembers] = useState<HouseholdMemberForm[]>([]);

    const ageGroup = resolveAgeGroup(age);
    const pwdLabel =
        isPwd === '1'
            ? pwdType === 'other'
                ? pwdTypeOther || 'Other PWD type'
                : (pwdOptions.find((option) => option.value === pwdType)
                      ?.label ?? 'PWD type pending')
            : 'No PWD declared';

    return (
        <>
            <Head title="Register" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        <section className="rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe3_100%)] p-6 shadow-[0_32px_90px_-60px_rgba(15,23,42,0.42)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)]">
                            <div className="space-y-3">
                                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.28em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    Household Registration
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                                    Create the household account
                                </h2>
                                <p className="max-w-3xl text-sm leading-7 text-slate-700 sm:text-base dark:text-slate-300">
                                    Fill in the main registrant, address,
                                    household members, and sign-in password
                                    below.
                                </p>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <StatusPill
                                    label="Lead Age Group"
                                    value={ageGroup ?? 'Not set'}
                                />
                                <StatusPill
                                    label="Additional Members"
                                    value={`${members.length}`}
                                />
                                <StatusPill label="PWD" value={pwdLabel} />
                            </div>
                        </section>

                        <SectionBlock
                            icon={House}
                            step="Step 1"
                            title="Primary registrant"
                            description="Add the main household respondent or resident who will own this account."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FieldGroup
                                    label="Household role"
                                    htmlFor="household_role"
                                    error={errors.household_role}
                                >
                                    <select
                                        id="household_role"
                                        name="household_role"
                                        value={householdRole}
                                        onChange={(event) =>
                                            setHouseholdRole(event.target.value)
                                        }
                                        className={selectFieldClasses}
                                        required
                                    >
                                        <option value="">
                                            Select household role
                                        </option>
                                        {householdRoleOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </FieldGroup>

                                <FieldGroup
                                    label="Full name"
                                    htmlFor="name"
                                    error={errors.name}
                                >
                                    <Input
                                        id="name"
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        autoFocus
                                        placeholder="Full name"
                                        className={inputFieldClasses}
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup
                                    label="Email address"
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className={inputFieldClasses}
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup
                                    label="Contact number"
                                    htmlFor="contact_number"
                                    error={errors.contact_number}
                                >
                                    <Input
                                        id="contact_number"
                                        type="tel"
                                        name="contact_number"
                                        autoComplete="tel"
                                        placeholder="09XXXXXXXXX"
                                        className={inputFieldClasses}
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup
                                    label="Age"
                                    htmlFor="age"
                                    error={errors.age}
                                >
                                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                        <Input
                                            id="age"
                                            type="number"
                                            name="age"
                                            min="0"
                                            max="130"
                                            value={age}
                                            onChange={(event) =>
                                                setAge(event.target.value)
                                            }
                                            placeholder="Enter age"
                                            className={inputFieldClasses}
                                            required
                                        />
                                        <AgeBadge ageGroup={ageGroup} />
                                    </div>
                                </FieldGroup>

                                <FieldGroup
                                    label="Sex"
                                    htmlFor="sex"
                                    error={errors.sex}
                                >
                                    <select
                                        id="sex"
                                        name="sex"
                                        value={sex}
                                        onChange={(event) =>
                                            setSex(event.target.value)
                                        }
                                        className={selectFieldClasses}
                                        required
                                    >
                                        <option value="">Select sex</option>
                                        {sexOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </FieldGroup>

                                <FieldGroup
                                    label="PWD status"
                                    htmlFor="is_pwd"
                                    error={errors.is_pwd}
                                >
                                    <select
                                        id="is_pwd"
                                        name="is_pwd"
                                        value={isPwd}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            setIsPwd(value);

                                            if (value !== '1') {
                                                setPwdType('');
                                                setPwdTypeOther('');
                                            }
                                        }}
                                        className={selectFieldClasses}
                                    >
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                </FieldGroup>

                                {isPwd === '1' && (
                                    <>
                                        <FieldGroup
                                            label="PWD type"
                                            htmlFor="pwd_type"
                                            error={errors.pwd_type}
                                        >
                                            <select
                                                id="pwd_type"
                                                name="pwd_type"
                                                value={pwdType}
                                                onChange={(event) =>
                                                    setPwdType(
                                                        event.target.value,
                                                    )
                                                }
                                                className={selectFieldClasses}
                                                required
                                            >
                                                <option value="">
                                                    Select PWD type
                                                </option>
                                                {pwdOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </FieldGroup>

                                        {pwdType === 'other' && (
                                            <FieldGroup
                                                label="Other PWD type"
                                                htmlFor="pwd_type_other"
                                                error={errors.pwd_type_other}
                                            >
                                                <Input
                                                    id="pwd_type_other"
                                                    type="text"
                                                    name="pwd_type_other"
                                                    value={pwdTypeOther}
                                                    onChange={(event) =>
                                                        setPwdTypeOther(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Specify PWD type"
                                                    className={
                                                        inputFieldClasses
                                                    }
                                                    required
                                                />
                                            </FieldGroup>
                                        )}
                                    </>
                                )}
                            </div>
                        </SectionBlock>

                        <SectionBlock
                            icon={MapPinned}
                            step="Step 2"
                            title="Household address"
                            description="Use one barangay and address for the whole household."
                        >
                            <div className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
                                <FieldGroup
                                    label="Barangay"
                                    htmlFor="barangay"
                                    error={errors.barangay}
                                >
                                    <select
                                        id="barangay"
                                        name="barangay"
                                        value={barangay}
                                        onChange={(event) =>
                                            setBarangay(event.target.value)
                                        }
                                        className={selectFieldClasses}
                                        required
                                    >
                                        <option value="">
                                            Select Mati City barangay
                                        </option>
                                        {barangays.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </FieldGroup>

                                <FieldGroup
                                    label="Complete address"
                                    htmlFor="address"
                                    error={errors.address}
                                >
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        placeholder="Street, purok, sitio, and other address details"
                                        className={cn(
                                            selectFieldClasses,
                                            'h-auto min-h-28 resize-y py-3',
                                        )}
                                        required
                                    />
                                </FieldGroup>
                            </div>
                        </SectionBlock>

                        <SectionBlock
                            icon={Users}
                            step="Step 3"
                            title="Household members"
                            description="Add every other person who belongs to the same household."
                            action={
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-2xl"
                                    onClick={() =>
                                        startTransition(() => {
                                            setMembers((currentMembers) => [
                                                ...currentMembers,
                                                createMember(),
                                            ]);
                                        })
                                    }
                                >
                                    <Plus className="size-4" />
                                    Add member
                                </Button>
                            }
                        >
                            <div className="space-y-4">
                                {members.length === 0 ? (
                                    <div className="rounded-[1.5rem] border border-dashed border-stone-300/80 bg-stone-50/70 px-5 py-6 text-sm leading-6 text-muted-foreground dark:border-white/10 dark:bg-slate-950/40">
                                        No additional members yet. Use the
                                        button above if this household includes
                                        other people.
                                    </div>
                                ) : (
                                    members.map((member, index) => {
                                        const memberAgeGroup = resolveAgeGroup(
                                            member.age,
                                        );
                                        const memberErrors = {
                                            full_name:
                                                errors[
                                                    `members.${index}.full_name`
                                                ],
                                            age: errors[`members.${index}.age`],
                                            sex: errors[`members.${index}.sex`],
                                            is_pwd: errors[
                                                `members.${index}.is_pwd`
                                            ],
                                            pwd_type:
                                                errors[
                                                    `members.${index}.pwd_type`
                                                ],
                                            pwd_type_other:
                                                errors[
                                                    `members.${index}.pwd_type_other`
                                                ],
                                        };

                                        return (
                                            <div
                                                key={member.id}
                                                className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50/80 p-4 dark:border-white/10 dark:bg-slate-950/45"
                                            >
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                                            Member {index + 1}
                                                        </p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            Household member
                                                            details
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-500/10"
                                                        onClick={() =>
                                                            startTransition(
                                                                () => {
                                                                    setMembers(
                                                                        (
                                                                            currentMembers,
                                                                        ) =>
                                                                            currentMembers.filter(
                                                                                (
                                                                                    currentMember,
                                                                                ) =>
                                                                                    currentMember.id !==
                                                                                    member.id,
                                                                            ),
                                                                    );
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Remove
                                                    </Button>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <FieldGroup
                                                        label="Full name"
                                                        htmlFor={`member_full_name_${member.id}`}
                                                        error={
                                                            memberErrors.full_name
                                                        }
                                                    >
                                                        <Input
                                                            id={`member_full_name_${member.id}`}
                                                            type="text"
                                                            name={`members[${index}][full_name]`}
                                                            value={
                                                                member.full_name
                                                            }
                                                            onChange={(event) =>
                                                                updateMember(
                                                                    setMembers,
                                                                    member.id,
                                                                    {
                                                                        full_name:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                            placeholder="Member full name"
                                                            className={
                                                                inputFieldClasses
                                                            }
                                                            required
                                                        />
                                                    </FieldGroup>

                                                    <FieldGroup
                                                        label="Age"
                                                        htmlFor={`member_age_${member.id}`}
                                                        error={memberErrors.age}
                                                    >
                                                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                                                            <Input
                                                                id={`member_age_${member.id}`}
                                                                type="number"
                                                                name={`members[${index}][age]`}
                                                                min="0"
                                                                max="130"
                                                                value={
                                                                    member.age
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMember(
                                                                        setMembers,
                                                                        member.id,
                                                                        {
                                                                            age: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Enter age"
                                                                className={
                                                                    inputFieldClasses
                                                                }
                                                                required
                                                            />
                                                            <AgeBadge
                                                                ageGroup={
                                                                    memberAgeGroup
                                                                }
                                                            />
                                                        </div>
                                                    </FieldGroup>

                                                    <FieldGroup
                                                        label="Sex"
                                                        htmlFor={`member_sex_${member.id}`}
                                                        error={memberErrors.sex}
                                                    >
                                                        <select
                                                            id={`member_sex_${member.id}`}
                                                            name={`members[${index}][sex]`}
                                                            value={member.sex}
                                                            onChange={(event) =>
                                                                updateMember(
                                                                    setMembers,
                                                                    member.id,
                                                                    {
                                                                        sex: event
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                            className={
                                                                selectFieldClasses
                                                            }
                                                            required
                                                        >
                                                            <option value="">
                                                                Select sex
                                                            </option>
                                                            {sexOptions.map(
                                                                (option) => (
                                                                    <option
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </FieldGroup>

                                                    <FieldGroup
                                                        label="PWD status"
                                                        htmlFor={`member_is_pwd_${member.id}`}
                                                        error={
                                                            memberErrors.is_pwd
                                                        }
                                                    >
                                                        <select
                                                            id={`member_is_pwd_${member.id}`}
                                                            name={`members[${index}][is_pwd]`}
                                                            value={
                                                                member.is_pwd
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                const value =
                                                                    event.target
                                                                        .value;

                                                                updateMember(
                                                                    setMembers,
                                                                    member.id,
                                                                    {
                                                                        is_pwd: value,
                                                                        pwd_type:
                                                                            value ===
                                                                            '1'
                                                                                ? member.pwd_type
                                                                                : '',
                                                                        pwd_type_other:
                                                                            value ===
                                                                            '1'
                                                                                ? member.pwd_type_other
                                                                                : '',
                                                                    },
                                                                );
                                                            }}
                                                            className={
                                                                selectFieldClasses
                                                            }
                                                        >
                                                            <option value="0">
                                                                No
                                                            </option>
                                                            <option value="1">
                                                                Yes
                                                            </option>
                                                        </select>
                                                    </FieldGroup>

                                                    {member.is_pwd === '1' && (
                                                        <>
                                                            <FieldGroup
                                                                label="PWD type"
                                                                htmlFor={`member_pwd_type_${member.id}`}
                                                                error={
                                                                    memberErrors.pwd_type
                                                                }
                                                            >
                                                                <select
                                                                    id={`member_pwd_type_${member.id}`}
                                                                    name={`members[${index}][pwd_type]`}
                                                                    value={
                                                                        member.pwd_type
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateMember(
                                                                            setMembers,
                                                                            member.id,
                                                                            {
                                                                                pwd_type:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    className={
                                                                        selectFieldClasses
                                                                    }
                                                                    required
                                                                >
                                                                    <option value="">
                                                                        Select
                                                                        PWD type
                                                                    </option>
                                                                    {pwdOptions.map(
                                                                        (
                                                                            option,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    option.value
                                                                                }
                                                                                value={
                                                                                    option.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
                                                            </FieldGroup>

                                                            {member.pwd_type ===
                                                                'other' && (
                                                                <FieldGroup
                                                                    label="Other PWD type"
                                                                    htmlFor={`member_pwd_type_other_${member.id}`}
                                                                    error={
                                                                        memberErrors.pwd_type_other
                                                                    }
                                                                >
                                                                    <Input
                                                                        id={`member_pwd_type_other_${member.id}`}
                                                                        type="text"
                                                                        name={`members[${index}][pwd_type_other]`}
                                                                        value={
                                                                            member.pwd_type_other
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateMember(
                                                                                setMembers,
                                                                                member.id,
                                                                                {
                                                                                    pwd_type_other:
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Specify PWD type"
                                                                        className={
                                                                            inputFieldClasses
                                                                        }
                                                                        required
                                                                    />
                                                                </FieldGroup>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </SectionBlock>

                        <SectionBlock
                            icon={ShieldCheck}
                            step="Step 4"
                            title="Account security"
                            description="Set the password that the household will use to sign in."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <FieldGroup
                                    label="Password"
                                    htmlFor="password"
                                    error={errors.password}
                                >
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        autoComplete="new-password"
                                        placeholder="Password"
                                        className={inputFieldClasses}
                                        required
                                    />
                                </FieldGroup>

                                <FieldGroup
                                    label="Confirm password"
                                    htmlFor="password_confirmation"
                                    error={errors.password_confirmation}
                                >
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        className={inputFieldClasses}
                                        required
                                    />
                                </FieldGroup>
                            </div>

                            <Button
                                type="submit"
                                className="mt-6 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] text-white shadow-lg shadow-slate-900/15 hover:opacity-95 dark:bg-[linear-gradient(135deg,#ffffff_0%,#e5e7eb_100%)] dark:text-slate-950"
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create household account
                            </Button>
                        </SectionBlock>

                        <div className="rounded-[1.5rem] border border-stone-200/80 bg-white/86 px-4 py-4 text-center text-sm text-muted-foreground shadow-sm dark:border-white/10 dark:bg-slate-950/72">
                            Already have a household account?{' '}
                            <TextLink href={login()} className="font-medium">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

function SectionBlock({
    icon: Icon,
    step,
    title,
    description,
    action,
    children,
}: {
    icon: typeof House;
    step: string;
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className={sectionClasses}>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                        <Icon className="size-4" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-[0.68rem] font-semibold tracking-[0.26em] text-slate-500 uppercase dark:text-slate-400">
                            {step}
                        </p>
                        <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                            {title}
                        </h3>
                        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
                {action}
            </div>

            {children}
        </section>
    );
}

function FieldGroup({
    label,
    htmlFor,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label
                htmlFor={htmlFor}
                className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function StatusPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-3 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-white/6">
            <span className="font-medium text-slate-500 dark:text-slate-400">
                {label}:
            </span>
            <span className="font-semibold text-slate-950 dark:text-white">
                {value}
            </span>
        </div>
    );
}

function AgeBadge({ ageGroup }: { ageGroup: string | null }) {
    if (ageGroup === null) {
        return (
            <div className="inline-flex h-12 min-w-[6.75rem] items-center justify-center rounded-xl border border-dashed border-stone-300/80 bg-stone-50/70 px-4 text-sm font-medium text-muted-foreground dark:border-white/10 dark:bg-slate-950/40">
                Not set
            </div>
        );
    }

    return (
        <div
            className={cn(
                'inline-flex h-12 min-w-[6.75rem] items-center justify-center rounded-xl px-4 text-sm font-semibold',
                ageGroup === 'Child' &&
                    'border border-sky-200/80 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200',
                ageGroup === 'Adult' &&
                    'border border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200',
                ageGroup === 'Senior' &&
                    'border border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200',
            )}
        >
            {ageGroup}
        </div>
    );
}

function createMember(): HouseholdMemberForm {
    return {
        id: crypto.randomUUID(),
        full_name: '',
        age: '',
        sex: '',
        is_pwd: '0',
        pwd_type: '',
        pwd_type_other: '',
    };
}

function updateMember(
    setMembers: Dispatch<SetStateAction<HouseholdMemberForm[]>>,
    memberId: string,
    updates: Partial<HouseholdMemberForm>,
): void {
    setMembers((currentMembers) =>
        currentMembers.map((member) =>
            member.id === memberId ? { ...member, ...updates } : member,
        ),
    );
}

function resolveAgeGroup(age: string): string | null {
    if (age.trim() === '') {
        return null;
    }

    const parsedAge = Number.parseInt(age, 10);

    if (Number.isNaN(parsedAge) || parsedAge < 0) {
        return null;
    }

    if (parsedAge <= 17) {
        return 'Child';
    }

    if (parsedAge >= 60) {
        return 'Senior';
    }

    return 'Adult';
}

Register.layout = {
    title: 'Create a household account',
    description:
        'Register the main household respondent or resident, then add the other members under the same address.',
    contentWidth: 'wide',
    variant: 'card',
};
