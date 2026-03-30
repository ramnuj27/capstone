import { Form, Head } from '@inertiajs/react';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import EmailVerificationCodeController from '@/actions/App/Http/Controllers/Auth/EmailVerificationCodeController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, logout } from '@/routes';

type Props = {
    email?: string | null;
    canEditEmail: boolean;
    codePreview?: string | null;
    isAuthenticated: boolean;
    status?: string;
};

export default function VerifyEmail({
    email,
    canEditEmail,
    codePreview,
    isAuthenticated,
    status,
}: Props) {
    const [pendingEmail, setPendingEmail] = useState(email ?? '');

    return (
        <>
            <Head title="Email verification" />

            <div className="space-y-5">
                {status && (
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        {status}
                    </div>
                )}

                {codePreview && (
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                        Local preview code: <span className="font-semibold">{codePreview}</span>
                    </div>
                )}

                <Form
                    {...EmailVerificationCodeController.store.form()}
                    resetOnSuccess={['code']}
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-5 rounded-[1.75rem] border border-stone-200/80 bg-white/72 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                            <div className="space-y-2">
                                <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.24em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    Email confirmation
                                </div>
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                    Confirm your email address
                                </h2>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Enter the 6-digit confirmation code we sent to your email before continuing.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                    <MailCheck className="size-4 text-emerald-700 dark:text-emerald-300" />
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={pendingEmail}
                                    onChange={(event) => {
                                        setPendingEmail(event.target.value);
                                    }}
                                    autoComplete="email"
                                    readOnly={! canEditEmail}
                                    required={canEditEmail}
                                    className="h-12 rounded-2xl border-stone-200/80 bg-stone-50/90 px-4 shadow-xs read-only:cursor-default read-only:opacity-90 dark:border-white/10 dark:bg-slate-950/70"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="code"
                                    className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                    <ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-300" />
                                    Confirmation code
                                </Label>
                                <Input
                                    id="code"
                                    type="text"
                                    name="code"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="6-digit code"
                                    className="h-12 rounded-2xl border-stone-200/80 bg-stone-50/90 px-4 shadow-xs dark:border-white/10 dark:bg-slate-950/70"
                                    required
                                />
                                <InputError message={errors.code} />
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] text-white shadow-lg shadow-slate-900/15 hover:opacity-95 dark:bg-[linear-gradient(135deg,#ffffff_0%,#e5e7eb_100%)] dark:text-slate-950"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Confirm email
                            </Button>
                        </div>
                    )}
                </Form>

                <Form
                    {...EmailVerificationCodeController.send.form()}
                    className="space-y-4 rounded-[1.75rem] border border-stone-200/80 bg-white/72 p-5 text-center shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
                >
                    {({ processing }) => (
                        <>
                            <input type="hidden" name="email" value={pendingEmail} />

                            <p className="text-sm leading-6 text-muted-foreground">
                                No code yet, or the last one expired? We can send a fresh confirmation code.
                            </p>

                            <Button
                                type="submit"
                                variant="outline"
                                className="h-11 rounded-2xl border-stone-200/80 bg-stone-50/90 dark:border-white/10 dark:bg-slate-950/70"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Resend confirmation code
                            </Button>

                            {isAuthenticated ? (
                                <TextLink href={logout()} className="mx-auto block text-sm">
                                    Log out
                                </TextLink>
                            ) : (
                                <TextLink href={login()} className="mx-auto block text-sm">
                                    Back to login
                                </TextLink>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Enter the confirmation code we emailed to you to finish setting up your account.',
    variant: 'minimal',
};
