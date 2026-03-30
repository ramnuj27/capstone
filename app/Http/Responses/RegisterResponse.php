<?php

namespace App\Http\Responses;

use App\Support\EmailVerificationCodeBroker;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     */
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        $authenticatedUser = $request->user();
        $redirect = route('registration.complete', absolute: false);
        $status = null;

        if ($authenticatedUser instanceof MustVerifyEmail && ! $authenticatedUser->hasVerifiedEmail()) {
            $redirect = route('verification.notice', absolute: false);
            $status = app(EmailVerificationCodeBroker::class)->deliveryFailedForCurrentRequest()
                ? 'We generated a confirmation code, but this local machine could not deliver email. Use the preview code shown on the next page.'
                : 'We sent a confirmation code to your email address.';
        }

        if ($request->wantsJson()) {
            return new JsonResponse(['redirect' => $redirect], 201);
        }

        $response = redirect()->intended($redirect);

        if ($status !== null) {
            $response->with('status', $status);
        }

        return $response;
    }
}
