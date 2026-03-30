<?php

namespace App\Notifications\Auth;

use Carbon\CarbonInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationCodeNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $code,
        private readonly CarbonInterface $expiresAt,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your EvaqReady confirmation code')
            ->greeting('Hello!')
            ->line('Use this confirmation code to verify your EvaqReady email address before you sign in.')
            ->line('Confirmation code: '.$this->code)
            ->line('This code will expire in '.max(0, $this->expiresAt->diffInMinutes(now(), false)).' minutes.')
            ->line('If you did not create an EvaqReady account, you can ignore this email.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'code' => $this->code,
        ];
    }

    public function code(): string
    {
        return $this->code;
    }
}
