import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    QrCode,
    ScanLine,
    ShieldCheck,
    Sparkles,
    Workflow,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';

type IconName = 'sparkles' | 'workflow' | 'shield-check';

type Highlight = {
    icon: IconName;
    title: string;
    description: string;
};

type Journey = {
    badge: string;
    title: string;
    description: string;
};

type LaunchStep = {
    number: string;
    title: string;
    description: string;
};

type WelcomeContent = {
    header: {
        eyebrow: string;
        title: string;
    };
    hero: {
        badge: string;
        title: string;
        description: string;
    };
    highlights: Highlight[];
    journey: Journey;
    launchSteps: LaunchStep[];
};

type WelcomeProps = {
    canRegister?: boolean;
    content: WelcomeContent;
};

const quickPoints = [
    'QR registration',
    'Evacuation center scan',
    'Safe or missing status',
];

const iconMap = {
    sparkles: Sparkles,
    workflow: Workflow,
    'shield-check': ShieldCheck,
} satisfies Record<IconName, typeof Sparkles>;

export default function Welcome({ canRegister = true, content }: WelcomeProps) {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);

    const primaryAction = isAuthenticated
        ? { href: dashboard(), label: 'Open dashboard' }
        : canRegister
          ? { href: register(), label: 'Register' }
          : { href: login(), label: 'Sign in' };

    const secondaryAction =
        !isAuthenticated && canRegister
            ? { href: login(), label: 'Sign in' }
            : null;

    return (
        <>
            <Head title="EvaqReady">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffaf3_0%,#f8efe2_54%,#f3e6d7_100%)] text-slate-950 dark:bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)] dark:text-white">
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] opacity-[0.18] lg:block dark:opacity-[0.06]">
                    <BackgroundArtwork />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,243,0.98)_0%,rgba(255,249,241,0.95)_42%,rgba(248,239,226,0.76)_72%,rgba(243,230,215,0.74)_100%)] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.78)_0%,rgba(2,6,23,0.9)_100%)]" />
                <div className="pointer-events-none absolute top-0 left-0 h-72 w-72 rounded-full bg-amber-100/80 blur-3xl dark:bg-emerald-500/10" />
                <div className="pointer-events-none absolute top-32 right-1/4 h-64 w-64 rounded-full bg-orange-100/70 blur-3xl dark:bg-amber-400/10" />
                <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-rose-100/60 blur-3xl dark:bg-sky-500/10" />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-8">
                    <header className="flex flex-col gap-4 rounded-full border border-stone-200/80 bg-[#fff8f1]/96 px-5 py-4 shadow-sm backdrop-blur-md md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-slate-950/80">
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <AppLogoIcon className="size-5 fill-current" />
                            </div>

                            <div>
                                <p className="text-[0.65rem] font-semibold tracking-[0.35em] text-emerald-700 uppercase dark:text-emerald-300">
                                    {content.header.eyebrow}
                                </p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {content.header.title}
                                </p>
                            </div>
                        </div>

                        <nav className="flex flex-wrap items-center gap-3">
                            {isAuthenticated ? (
                                <Button
                                    asChild
                                    size="sm"
                                    className="rounded-full px-5"
                                >
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-full border border-stone-200/80 bg-[#fffaf4] px-5 text-slate-700 hover:bg-[#f6ecdf] dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                                    >
                                        <Link href={login()}>Sign in</Link>
                                    </Button>

                                    {canRegister && (
                                        <Button
                                            asChild
                                            size="sm"
                                            className="rounded-full px-5"
                                        >
                                            <Link href={register()}>
                                                Register
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="flex flex-1 py-12 lg:py-16">
                        <div className="w-full space-y-8 lg:space-y-10">
                            <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                                <div className="max-w-2xl">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-emerald-500/20 bg-emerald-500/10 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.25em] text-emerald-800 uppercase dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                                    >
                                        {content.hero.badge}
                                    </Badge>

                                    <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                                        {content.hero.title}
                                    </h1>

                                    <p className="mt-5 max-w-xl text-base leading-8 text-slate-700 sm:text-lg dark:text-slate-300">
                                        {content.hero.description}
                                    </p>

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-full px-6 shadow-lg shadow-emerald-500/20"
                                        >
                                            <Link href={primaryAction.href}>
                                                {primaryAction.label}
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>

                                        {secondaryAction && (
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="rounded-full border-stone-200/80 bg-[#fff8f1]/96 px-6 dark:border-white/10 dark:bg-white/5"
                                            >
                                                <Link
                                                    href={secondaryAction.href}
                                                >
                                                    {secondaryAction.label}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {quickPoints.map((point) => (
                                            <div
                                                key={point}
                                                className="rounded-full border border-stone-200/80 bg-[#fff8f1]/96 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                                            >
                                                {point}
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
                                        For landslide, fire, flood, typhoon, and
                                        tsunami response in Mati City.
                                    </p>
                                </div>

                                <div className="rounded-[2rem] border border-stone-200/80 bg-[#fffaf4]/96 p-6 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-white/10 dark:bg-slate-950/82">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase dark:text-emerald-300">
                                                System Preview
                                            </p>
                                            <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                                                For Mati City evacuation
                                                response
                                            </h2>
                                        </div>

                                        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                            <QrCode className="size-5" />
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <PreviewRow
                                            icon={QrCode}
                                            title="Register evacuees"
                                            description="Create a QR code for each evacuee."
                                        />
                                        <PreviewRow
                                            icon={ScanLine}
                                            title="Scan on arrival"
                                            description="Check them in quickly at the evacuation center."
                                        />
                                        <PreviewRow
                                            icon={ShieldCheck}
                                            title="Monitor status"
                                            description="See who is safe or still missing."
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-4 md:grid-cols-3">
                                {content.highlights.map((highlight) => (
                                    <HighlightCard
                                        key={highlight.title}
                                        highlight={highlight}
                                    />
                                ))}
                            </section>

                            <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                                <div className="rounded-[2rem] border border-stone-200/80 bg-[#fff8f1]/96 p-6 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/82">
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-sky-500/20 bg-sky-500/10 px-4 py-1 text-[0.7rem] font-semibold tracking-[0.22em] text-sky-800 uppercase dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"
                                    >
                                        {content.journey.badge}
                                    </Badge>

                                    <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">
                                        {content.journey.title}
                                    </h2>

                                    <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
                                        {content.journey.description}
                                    </p>
                                </div>

                                <div className="rounded-[2rem] border border-stone-200/80 bg-[#fff8f1]/96 p-6 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/82">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                            <Workflow className="size-5" />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.22em] text-emerald-700 uppercase dark:text-emerald-300">
                                                How It Works
                                            </p>
                                            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                                                Short and clear flow for users
                                            </h2>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        {content.launchSteps.map((step) => (
                                            <StepCard
                                                key={step.number}
                                                step={step}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

function HighlightCard({ highlight }: { highlight: Highlight }) {
    const Icon = iconMap[highlight.icon];

    return (
        <div className="rounded-[1.75rem] border border-stone-200/80 bg-[#fff8f1]/96 p-5 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950/82">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Icon className="size-5" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
                {highlight.title}
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">
                {highlight.description}
            </p>
        </div>
    );
}

function PreviewRow({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof QrCode;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-[#f8efe4]/92 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Icon className="size-4" />
            </div>

            <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {description}
                </p>
            </div>
        </div>
    );
}

function StepCard({ step }: { step: LaunchStep }) {
    return (
        <div className="rounded-[1.5rem] border border-stone-200/80 bg-[#f8efe4]/92 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase dark:text-emerald-300">
                {step.number}
            </p>
            <h3 className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
                {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {step.description}
            </p>
        </div>
    );
}

function BackgroundArtwork() {
    return (
        <svg
            viewBox="0 0 1600 1200"
            className="h-full w-full object-cover"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="bg-sky" x1="800" y1="0" x2="800" y2="1200">
                    <stop offset="0%" stopColor="#fff8ef" />
                    <stop offset="55%" stopColor="#f7ecdd" />
                    <stop offset="100%" stopColor="#efdcc6" />
                </linearGradient>
                <linearGradient
                    id="bg-sea"
                    x1="800"
                    y1="768"
                    x2="800"
                    y2="1088"
                >
                    <stop offset="0%" stopColor="#cfe3d8" />
                    <stop offset="100%" stopColor="#9fc0b1" />
                </linearGradient>
                <linearGradient
                    id="bg-hill-back"
                    x1="800"
                    y1="460"
                    x2="800"
                    y2="860"
                >
                    <stop offset="0%" stopColor="#dac7ab" />
                    <stop offset="100%" stopColor="#b9997c" />
                </linearGradient>
                <linearGradient
                    id="bg-hill-front"
                    x1="800"
                    y1="530"
                    x2="800"
                    y2="980"
                >
                    <stop offset="0%" stopColor="#c4d5b9" />
                    <stop offset="100%" stopColor="#89a58f" />
                </linearGradient>
                <filter
                    id="bg-blur"
                    x="-200"
                    y="-200"
                    width="2000"
                    height="1600"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                >
                    <feGaussianBlur stdDeviation="40" />
                </filter>
            </defs>

            <rect width="1600" height="1200" fill="url(#bg-sky)" />

            <g opacity="0.55">
                <circle cx="240" cy="178" r="140" fill="#fff6da" />
                <circle cx="1320" cy="216" r="116" fill="#fce1c4" />
                <circle cx="1184" cy="114" r="42" fill="#fff4e8" />
            </g>

            <g opacity="0.3" filter="url(#bg-blur)">
                <ellipse cx="302" cy="221" rx="196" ry="104" fill="#f4d7b4" />
                <ellipse cx="1234" cy="265" rx="220" ry="118" fill="#e7c8a7" />
                <ellipse cx="840" cy="156" rx="288" ry="120" fill="#fff2dd" />
            </g>

            <g opacity="0.45">
                <path
                    d="M0 574C148 522 246 506 390 506C580 506 686 610 876 610C1056 610 1138 488 1322 488C1444 488 1530 530 1600 562V1200H0V574Z"
                    fill="url(#bg-hill-back)"
                />
                <path
                    d="M0 678C114 630 246 618 388 618C578 618 670 742 848 742C1012 742 1118 602 1294 602C1432 602 1514 656 1600 708V1200H0V678Z"
                    fill="url(#bg-hill-front)"
                />
            </g>

            <path
                d="M0 808C156 770 264 756 402 756C550 756 700 842 852 842C1026 842 1130 744 1322 744C1446 744 1532 780 1600 812V1200H0V808Z"
                fill="url(#bg-sea)"
                opacity="0.92"
            />

            <g opacity="0.4">
                <path
                    d="M0 860C124 836 252 824 396 824C570 824 696 890 850 890C1030 890 1120 814 1326 814C1438 814 1528 834 1600 854"
                    stroke="#faf4ec"
                    strokeLinecap="round"
                    strokeWidth="18"
                />
                <path
                    d="M0 914C142 888 258 880 410 880C586 880 702 942 850 942C1032 942 1112 868 1314 868C1444 868 1536 896 1600 912"
                    stroke="#ecf4ef"
                    strokeLinecap="round"
                    strokeWidth="12"
                />
            </g>

            <g opacity="0.35">
                <path
                    d="M154 640L376 486L496 592L640 446L818 612"
                    stroke="#fff8ef"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="18"
                />
                <path
                    d="M948 614L1122 474L1264 574L1412 430"
                    stroke="#fff3e6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="18"
                />
            </g>

            <g opacity="0.4">
                <rect
                    x="208"
                    y="682"
                    width="104"
                    height="80"
                    rx="18"
                    fill="#f5efe7"
                />
                <path
                    d="M194 698L260 646L326 698"
                    stroke="#d7b898"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                />
                <rect
                    x="242"
                    y="716"
                    width="34"
                    height="46"
                    rx="10"
                    fill="#d3b08b"
                />
                <rect
                    x="528"
                    y="710"
                    width="112"
                    height="86"
                    rx="20"
                    fill="#f6f1ea"
                />
                <path
                    d="M514 730L584 672L654 730"
                    stroke="#dabb9a"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="16"
                />
                <rect
                    x="564"
                    y="744"
                    width="38"
                    height="52"
                    rx="10"
                    fill="#d2b08a"
                />
            </g>

            <g opacity="0.22">
                <path
                    d="M1024 532C1104 520 1174 552 1228 612C1270 658 1328 694 1396 696"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeWidth="12"
                />
                <path
                    d="M1128 578C1182 568 1232 590 1268 634"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeWidth="10"
                />
                <path
                    d="M276 286C342 272 398 298 436 344C474 388 528 414 588 414"
                    stroke="#ffffff"
                    strokeLinecap="round"
                    strokeWidth="12"
                />
            </g>

            <g opacity="0.12">
                <path
                    d="M0 120H1600"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M0 318H1600"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M0 516H1600"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M0 714H1600"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M0 912H1600"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M186 0V1200"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M478 0V1200"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M770 0V1200"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M1062 0V1200"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
                <path
                    d="M1354 0V1200"
                    stroke="#b58e6b"
                    strokeDasharray="8 14"
                    strokeWidth="2"
                />
            </g>
        </svg>
    );
}
