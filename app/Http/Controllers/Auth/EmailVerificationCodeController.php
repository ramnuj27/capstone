<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResendEmailVerificationCodeRequest;
use App\Http\Requests\Auth\VerifyEmailCodeRequest;
use App\Models\User;
use App\Support\EmailVerificationCodeBroker;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationCodeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        $authenticatedUser = $request->user();

        if ($authenticatedUser !== null && $authenticatedUser->hasVerifiedEmail()) {
            return $this->redirectToDashboard();
        }

        return Inertia::render('auth/verify-email', [
            'email' => $authenticatedUser?->email ?? $this->guestEmail($request),
            'canEditEmail' => $authenticatedUser === null,
            'codePreview' => $request->session()->get('emailVerificationCodePreview'),
            'isAuthenticated' => $authenticatedUser !== null,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(
        VerifyEmailCodeRequest $request,
        EmailVerificationCodeBroker $emailVerificationCodeBroker,
    ): RedirectResponse {
        $user = $this->resolveUser($request);

        if ($user === null) {
            return back()
                ->withErrors(['email' => 'We could not find an account with that email address.'])
                ->withInput(['email' => $this->guestEmail($request)]);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->redirectAfterVerification(
                $request,
                $user,
                'This email address is already confirmed.',
            );
        }

        if (! $emailVerificationCodeBroker->verify(
            $user,
            $request->string('code')->toString(),
        )) {
            return back()
                ->withErrors(['code' => 'That confirmation code is invalid or has expired.'])
                ->withInput(['email' => $user->email]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return $this->redirectAfterVerification(
            $request,
            $user,
            $request->user() === null
                ? 'Your email is confirmed. You can log in now.'
                : 'Your email is confirmed.',
        );
    }

    public function send(
        ResendEmailVerificationCodeRequest $request,
        EmailVerificationCodeBroker $emailVerificationCodeBroker,
    ): RedirectResponse {
        $user = $this->resolveUser($request);

        if ($user === null) {
            return back()
                ->withErrors(['email' => 'We could not find an account with that email address.'])
                ->withInput(['email' => $this->guestEmail($request)]);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->redirectAfterVerification(
                $request,
                $user,
                'This email address is already confirmed.',
            );
        }

        $user->sendEmailVerificationNotification();

        $status = $emailVerificationCodeBroker->deliveryFailedForCurrentRequest()
            ? 'We generated a new confirmation code, but this local machine could not deliver email. Use the preview code below.'
            : 'We sent a new confirmation code to your email address.';

        return back()
            ->with('status', $status)
            ->withInput(['email' => $user->email]);
    }

    private function resolveUser(Request $request): ?User
    {
        if ($request->user() !== null) {
            return $request->user()->fresh();
        }

        $email = $this->guestEmail($request);

        if ($email === null) {
            return null;
        }

        return User::query()->firstWhere('email', $email);
    }

    private function guestEmail(Request $request): ?string
    {
        $email = Str::lower($request->string('email')->trim()->toString());

        return $email === '' ? null : $email;
    }

    private function redirectAfterVerification(
        Request $request,
        User $user,
        string $status,
    ): RedirectResponse {
        if ($request->user()?->is($user)) {
            $fallbackRoute = $user->householdProfile()->exists()
                ? route('registration.complete', absolute: false)
                : route('dashboard', absolute: false);

            return redirect()->intended($fallbackRoute)->with('status', $status);
        }

        return redirect()
            ->away(route('login', absolute: false))
            ->with('status', $status);
    }

    private function redirectToDashboard(): RedirectResponse
    {
        return redirect()->away(route('dashboard', absolute: false));
    }
}
