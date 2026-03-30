<?php

use App\Models\User;
use App\Notifications\Auth\EmailVerificationCodeNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyFeature(Features::emailVerification());
});

test('authenticated user can request a new confirmation code', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.code.send'), [
            'email' => $user->email,
        ])
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('status', 'We sent a new confirmation code to your email address.');

    Notification::assertSentTo($user, EmailVerificationCodeNotification::class);
});

test('guest can request a new confirmation code', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->from(route('verification.code.create'))
        ->post(route('verification.code.send'), [
            'email' => $user->email,
        ])
        ->assertRedirect(route('verification.code.create'))
        ->assertSessionHas('status', 'We sent a new confirmation code to your email address.');

    Notification::assertSentTo($user, EmailVerificationCodeNotification::class);
});

test('guest receives a local preview code when confirmation email delivery fails', function () {
    config()->set('mail.default', 'smtp');
    config()->set('mail.mailers.smtp.scheme', 'tls');

    $user = User::factory()->unverified()->create();

    $this->from(route('verification.code.create'))
        ->post(route('verification.code.send'), [
            'email' => $user->email,
        ])
        ->assertRedirect(route('verification.code.create'))
        ->assertSessionHas(
            'status',
            'We generated a new confirmation code, but this local machine could not deliver email. Use the preview code below.',
        )
        ->assertSessionHas('emailVerificationCodePreview', function ($code): bool {
            return is_string($code) && preg_match('/^\d{6}$/', $code) === 1;
        });
});

test('does not send confirmation notification if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.code.send'), [
            'email' => $user->email,
        ])
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});
