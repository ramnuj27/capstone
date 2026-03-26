<?php

use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('welcome page is displayed', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('canRegister', Features::enabled(Features::registration()))
            ->where('content.header.eyebrow', 'Mati City, Davao Oriental')
            ->where('content.hero.title', 'EvaqReady')
            ->where('content.hero.description', 'A QR-based evacuation system for registering evacuees and checking who is safe or missing at evacuation centers during disasters.')
            ->where('content.highlights.0.title', 'QR code after registration')
            ->where('content.journey.title', 'A welcome page that explains the full EvaqReady system.'),
        );
});
