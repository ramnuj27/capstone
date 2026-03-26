import { Form, Head } from '@inertiajs/react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <div className="space-y-5">
                {status && (
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        {status}
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                    <InfoCard
                        title="Protected access"
                        description="Only authorized responders and staff should sign in here."
                    />
                    <InfoCard
                        title="Fast coordination"
                        description="Get straight to scanning, registration, and center updates."
                    />
                    <InfoCard
                        title="Clear visibility"
                        description="Keep safety and missing-person records easier to monitor."
                    />
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-5 rounded-[1.75rem] border border-stone-200/80 bg-white/72 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.26em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                                        <ShieldCheck className="size-3.5" />
                                        Secure login
                                    </div>
                                    <p className="pt-2 text-sm leading-6 text-muted-foreground">
                                        Enter your account details to continue
                                        to the responder dashboard.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="email"
                                        className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                    >
                                        <Mail className="size-4 text-emerald-700 dark:text-emerald-300" />
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="h-12 rounded-2xl border-stone-200/80 bg-stone-50/90 px-4 shadow-xs dark:border-white/10 dark:bg-slate-950/70"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label
                                            htmlFor="password"
                                            className="flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                        >
                                            <KeyRound className="size-4 text-emerald-700 dark:text-emerald-300" />
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm font-medium"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className="h-12 rounded-2xl border-stone-200/80 bg-stone-50/90 px-4 shadow-xs dark:border-white/10 dark:bg-slate-950/70"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/50">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-sm font-medium text-slate-700 dark:text-slate-200"
                                        >
                                            Remember me
                                        </Label>
                                    </div>
                                    <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                        Encrypted
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] text-white shadow-lg shadow-slate-900/15 hover:opacity-95 dark:bg-[linear-gradient(135deg,#ffffff_0%,#e5e7eb_100%)] dark:text-slate-950"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in to EvaqReady
                                </Button>
                            </div>

                            {canRegister && (
                                <div className="rounded-2xl border border-stone-200/80 bg-white/72 px-4 py-4 text-center text-sm text-muted-foreground shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                    <span>
                                        Don&apos;t have an account yet?{' '}
                                    </span>
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="font-medium"
                                    >
                                        Create one now
                                    </TextLink>
                                </div>
                            )}
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

function InfoCard({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-stone-200/80 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
                {title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {description}
            </p>
        </div>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
