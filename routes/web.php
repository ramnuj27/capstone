<?php

use App\Http\Controllers\Auth\RegistrationCompleteController;
use App\Support\PortalAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

$welcomeContent = [
    'header' => [
        'eyebrow' => 'Mati City, Davao Oriental',
        'title' => 'EvaqReady',
    ],
    'hero' => [
        'badge' => 'Mati City evacuation monitoring',
        'title' => 'EvaqReady',
        'description' => 'A QR-based evacuation system for registering evacuees and checking who is safe or missing at evacuation centers during disasters.',
    ],
    'highlights' => [
        [
            'icon' => 'sparkles',
            'title' => 'QR code after registration',
            'description' => 'Each evacuee can receive a QR code right after registration, creating a faster and more reliable check-in process.',
        ],
        [
            'icon' => 'workflow',
            'title' => 'Faster evacuation center check-in',
            'description' => 'When an emergency happens, responders can scan the evacuee QR code on arrival instead of checking people in manually.',
        ],
        [
            'icon' => 'shield-check',
            'title' => 'Safe or missing status tracking',
            'description' => 'The system makes it easier to know who has already arrived safely at the evacuation center and who still needs to be found.',
        ],
    ],
    'spotlight' => [
        'eyebrow' => 'Evacuation center workflow',
        'title' => 'One scan can confirm an evacuee\'s arrival and safety status.',
        'status' => 'Mati City only',
        'lead' => 'EvaqReady system overview',
        'headline' => 'Built for landslide, fire, flood, typhoon, and tsunami scenarios where evacuation centers need a faster way to verify arrivals and identify who may still be missing.',
    ],
    'readinessChecks' => [
        'Evacuee registration can issue a QR code that becomes the person\'s evacuation check-in pass.',
        'Evacuation centers can scan the QR code upon arrival to reduce delays during disasters.',
        'Responders can quickly review whether an evacuee is marked safe or still missing.',
    ],
    'focusAreas' => [
        [
            'eyebrow' => 'Registration',
            'title' => 'The system starts by creating a QR identity for every evacuee.',
            'description' => 'Instead of relying on paper-only logs, EvaqReady prepares each evacuee for faster verification once movement to an evacuation center begins.',
        ],
        [
            'eyebrow' => 'Monitoring',
            'title' => 'Response teams can see who is safe and who still needs attention.',
            'description' => 'Scanning at the evacuation center helps responders update status faster, support family tracing, and improve accountability during active incidents.',
        ],
    ],
    'featureCards' => [
        [
            'icon' => 'compass',
            'title' => 'Register and issue QR codes',
            'description' => 'Capture evacuee details in the system and generate a QR code that will be used during evacuation center check-in.',
        ],
        [
            'icon' => 'layout-dashboard',
            'title' => 'Scan at the evacuation center',
            'description' => 'When evacuees arrive, staff can scan the QR code to verify identity and record that the person has reached safety.',
        ],
        [
            'icon' => 'sparkles',
            'title' => 'Track safe and missing evacuees',
            'description' => 'The platform helps responders monitor who is already safe and who may still be unaccounted for during landslides, fires, floods, typhoons, and tsunami events.',
        ],
    ],
    'journey' => [
        'badge' => 'From registration to verified arrival',
        'title' => 'A welcome page that explains the full EvaqReady system.',
        'description' => 'The page now presents EvaqReady as a Mati City evacuation platform where evacuees register first, receive a QR code, and are scanned at evacuation centers so responders can monitor safety and missing persons in real time.',
    ],
    'launchSteps' => [
        [
            'number' => '01',
            'title' => 'Register the evacuee',
            'description' => 'Save the evacuee record in EvaqReady and generate the QR code that will be used during emergency response.',
        ],
        [
            'number' => '02',
            'title' => 'Scan on arrival',
            'description' => 'At the evacuation center, scan the QR code during a landslide, fire, flood, typhoon, or tsunami response.',
        ],
        [
            'number' => '03',
            'title' => 'Update safety status',
            'description' => 'Use the scan result to identify whether the evacuee is already safe at the center or still missing.',
        ],
    ],
];

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
    'content' => $welcomeContent,
])->name('home');

Route::middleware('auth')->get('registration/complete', RegistrationCompleteController::class)
    ->name('registration.complete');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        return Inertia::render('portal/dashboard', PortalAccess::dashboardPropsFor(
            $request->user()->loadMissing('householdProfile:id,user_id,barangay'),
        ));
    })->name('dashboard');

    foreach (PortalAccess::routeModules() as $module) {
        Route::get($module['path'], function (Request $request) use ($module) {
            return Inertia::render('portal/module', [
                'module' => PortalAccess::modulePageProps(
                    $module['key'],
                    $request->user()->role,
                ),
            ]);
        })
            ->middleware('role:'.implode(',', $module['roles']))
            ->name($module['route_name']);
    }
});

require __DIR__.'/settings.php';
