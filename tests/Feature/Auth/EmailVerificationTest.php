<?php

use App\Models\User;
use App\Notifications\Auth\EmailVerificationCodeNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyFeature(Features::emailVerification());
});

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get(route('verification.notice'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/verify-email')
            ->where('email', $user->email)
            ->where('canEditEmail', false)
            ->where('isAuthenticated', true)
            ->etc(),
        );
});

test('guest confirmation screen can be rendered', function () {
    $this->get(route('verification.code.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/verify-email')
            ->where('email', null)
            ->where('canEditEmail', true)
            ->where('isAuthenticated', false)
            ->etc(),
        );
});

test('authenticated user can verify email with a confirmation code', function () {
    Notification::fake();
    Event::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.code.send'), [
            'email' => $user->email,
        ])
        ->assertRedirect(route('verification.notice'));

    $code = sentVerificationCodeFor($user);

    $response = $this->actingAs($user)->post(route('verification.code.store'), [
        'code' => $code,
    ]);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('guest can verify email with a confirmation code', function () {
    Notification::fake();
    Event::fake();

    $user = User::factory()->unverified()->create();

    $user->sendEmailVerificationNotification();

    $response = $this->post(route('verification.code.store'), [
        'email' => $user->email,
        'code' => sentVerificationCodeFor($user),
    ]);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHas('status', 'Your email is confirmed. You can log in now.');
});

test('email is not verified with an invalid confirmation code', function () {
    Notification::fake();
    Event::fake();

    $user = User::factory()->unverified()->create();

    $user->sendEmailVerificationNotification();

    $response = $this->from(route('verification.code.create'))->post(route('verification.code.store'), [
        'email' => $user->email,
        'code' => '000000',
    ]);

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
    $response->assertRedirect(route('verification.code.create'));
    $response->assertSessionHasErrors(['code']);
});

test('verified user is redirected to dashboard from verification prompt', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertRedirect(route('dashboard', absolute: false));
});

function sentVerificationCodeFor(User $user): string
{
    $code = null;

    Notification::assertSentTo(
        $user,
        EmailVerificationCodeNotification::class,
        function (EmailVerificationCodeNotification $notification) use (&$code): bool {
            $code = $notification->code();

            return true;
        },
    );

    expect($code)->not->toBeNull();

    return $code;
}
