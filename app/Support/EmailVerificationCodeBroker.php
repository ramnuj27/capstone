<?php

namespace App\Support;

use App\Models\User;
use App\Notifications\Auth\EmailVerificationCodeNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Hash;
use Throwable;

class EmailVerificationCodeBroker
{
    private const CODE_LENGTH = 6;

    private const EXPIRATION_MINUTES = 15;

    private const DELIVERY_FAILED_SESSION_KEY = 'emailVerificationDeliveryFailed';

    public function send(User $user): string
    {
        $code = $this->generateCode();
        $expiresAt = now()->addMinutes(self::EXPIRATION_MINUTES);

        $user->forceFill([
            'email_verification_code' => Hash::make($code),
            'email_verification_code_expires_at' => $expiresAt,
        ])->save();

        try {
            $user->notify(new EmailVerificationCodeNotification(
                code: $code,
                expiresAt: $expiresAt,
            ));
        } catch (Throwable $exception) {
            report($exception);

            if (! app()->environment(['local', 'testing'])) {
                throw $exception;
            }

            $this->flashLocalDeliveryFallback($code);
        }

        return $code;
    }

    public function verify(User $user, string $code): bool
    {
        $storedCode = $user->email_verification_code;
        $expiresAt = $user->email_verification_code_expires_at;

        if (! is_string($storedCode) || ! $expiresAt instanceof CarbonInterface) {
            return false;
        }

        if ($expiresAt->isPast() || ! Hash::check(trim($code), $storedCode)) {
            return false;
        }

        $this->clear($user);

        return true;
    }

    public function clear(User $user): void
    {
        $user->forceFill([
            'email_verification_code' => null,
            'email_verification_code_expires_at' => null,
        ])->save();
    }

    public function expirationMinutes(): int
    {
        return self::EXPIRATION_MINUTES;
    }

    public function deliveryFailedForCurrentRequest(): bool
    {
        if (! app()->bound('request') || ! request()->hasSession()) {
            return false;
        }

        return request()->session()->get(self::DELIVERY_FAILED_SESSION_KEY) === true;
    }

    private function generateCode(): string
    {
        return str_pad(
            (string) random_int(0, 999999),
            self::CODE_LENGTH,
            '0',
            STR_PAD_LEFT,
        );
    }

    private function flashLocalDeliveryFallback(string $code): void
    {
        if (! app()->bound('request') || ! request()->hasSession()) {
            return;
        }

        request()->session()->flash(self::DELIVERY_FAILED_SESSION_KEY, true);
        request()->session()->flash('emailVerificationCodePreview', $code);
    }
}
