<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WalletRequestReviewed extends Notification
{
    use Queueable;

    /** @param array<string, int|string|null> $details */
    public function __construct(private readonly string $requestType, private readonly string $status, private readonly array $details = []) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Wallet '.$this->requestType.' '.$this->status)
            ->line('Your '.$this->requestType.' request was '.$this->status.'.')
            ->when(isset($this->details['reason']), fn (MailMessage $message) => $message->line('Reason: '.$this->details['reason']));
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'request_type' => $this->requestType,
            'status' => $this->status,
            ...$this->details,
        ];
    }
}
