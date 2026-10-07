<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WalletService
{
    /** @param array<string, mixed> $meta */
    public function credit(User $user, int $amount, string $type, string $reference, ?User $processedBy = null, array $meta = [], ?Reservation $reservation = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $reference, $processedBy, $meta, $reservation): WalletTransaction {
            $wallet = $this->lockedWallet($user);

            return $this->apply($wallet, $amount, $type, 'credit', $reference, $processedBy, $meta, $reservation);
        });
    }

    /** @param array<string, mixed> $meta */
    public function debit(User $user, int $amount, string $type, string $reference, ?User $processedBy = null, array $meta = [], ?Reservation $reservation = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $type, $reference, $processedBy, $meta, $reservation): WalletTransaction {
            $wallet = $this->lockedWallet($user);

            return $this->apply($wallet, $amount, $type, 'debit', $reference, $processedBy, $meta, $reservation);
        });
    }

    /** @param array<string, mixed> $meta */
    public function holdForCashOut(User $user, int $amount, string $reference, array $meta = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $reference, $meta): WalletTransaction {
            $wallet = $this->lockedWallet($user);
            if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
                return $existing;
            }
            $transaction = $this->apply($wallet, $amount, 'hold', 'debit', $reference, null, $meta);
            $wallet->increment('held_balance', $amount);

            return $transaction;
        });
    }

    /** @param array<string, mixed> $meta */
    public function releaseHold(User $user, int $amount, string $reference, ?User $processedBy = null, array $meta = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $reference, $processedBy, $meta): WalletTransaction {
            $wallet = $this->lockedWallet($user);

            if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
                return $existing;
            }
            if ($wallet->held_balance < $amount) {
                throw ValidationException::withMessages(['amount' => 'The held withdrawal amount is unavailable.']);
            }

            $wallet->decrement('held_balance', $amount);

            return $this->apply($wallet, $amount, 'release', 'credit', $reference, $processedBy, $meta);
        });
    }

    public function payReservation(User $user, Reservation $reservation, ?User $processedBy = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $reservation, $processedBy): WalletTransaction {
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservation->id);
            $wallet = $this->lockedWallet($user);
            $payment = Payment::query()->where('reservation_id', $reservation->id)->lockForUpdate()->firstOrFail();
            $reference = 'AST-RES-'.$reservation->id.'-PAY';

            if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
                return $existing;
            }
            if ($reservation->user_id !== $user->id || $reservation->status === 'cancelled' || $payment->status !== 'pending') {
                throw ValidationException::withMessages(['reservation' => 'This reservation cannot be paid with the wallet.']);
            }

            $amount = $this->moneyToCentavos((string) $reservation->amount);
            $transaction = $this->apply($wallet, $amount, 'payment', 'debit', $reference, $processedBy, [], $reservation);
            $payment->update(['status' => 'paid', 'method' => 'wallet', 'reference' => $reference]);
            $reservation->update(['status' => 'confirmed']);

            return $transaction;
        });
    }

    public function refundReservation(User $user, Reservation $reservation, ?User $processedBy = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $reservation, $processedBy): WalletTransaction {
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservation->id);
            $payment = Payment::query()->where('reservation_id', $reservation->id)->lockForUpdate()->firstOrFail();
            $reference = 'AST-RES-'.$reservation->id.'-REFUND';

            if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
                return $existing;
            }
            if ($reservation->user_id !== $user->id || $payment->status !== 'paid' || $reservation->status !== 'cancelled') {
                throw ValidationException::withMessages(['reservation' => 'This reservation is not eligible for a wallet refund.']);
            }

            return $this->credit(
                $user,
                $this->moneyToCentavos((string) $reservation->amount),
                'refund',
                $reference,
                $processedBy,
                [],
                $reservation,
            );
        });
    }

    /** @param array<string, mixed> $meta */
    public function completeCashOut(User $user, int $amount, string $reference, ?User $processedBy = null, array $meta = []): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $reference, $processedBy, $meta): WalletTransaction {
            $wallet = $this->lockedWallet($user);
            if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
                return $existing;
            }
            if ($wallet->held_balance < $amount) {
                throw ValidationException::withMessages(['amount' => 'The held withdrawal amount is unavailable.']);
            }

            $wallet->decrement('held_balance', $amount);

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'user_id' => $wallet->user_id,
                'type' => 'cash_out',
                'direction' => 'debit',
                'amount' => $amount,
                'balance_before' => $wallet->balance,
                'balance_after' => $wallet->balance,
                'status' => 'completed',
                'reference_no' => $reference,
                'processed_by' => $processedBy?->id,
                'meta' => $meta,
            ]);
        });
    }

    public function adjust(User $user, int $signedAmount, string $reason, User $processedBy): WalletTransaction
    {
        if ($signedAmount === 0) {
            throw ValidationException::withMessages(['amount' => 'Adjustment must not be zero.']);
        }

        return DB::transaction(function () use ($user, $signedAmount, $reason, $processedBy): WalletTransaction {
            $wallet = $this->lockedWallet($user);

            return $this->apply(
                $wallet,
                abs($signedAmount),
                'adjustment',
                $signedAmount > 0 ? 'credit' : 'debit',
                $this->newReference(),
                $processedBy,
                ['reason' => $reason],
            );
        });
    }

    private function lockedWallet(User $user): Wallet
    {
        $user->wallet()->firstOrCreate([], ['balance' => 0, 'held_balance' => 0]);

        return Wallet::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
    }

    /** @param array<string, mixed> $meta */
    private function apply(Wallet $wallet, int $amount, string $type, string $direction, string $reference, ?User $processedBy, array $meta, ?Reservation $reservation = null): WalletTransaction
    {
        if ($existing = WalletTransaction::query()->where('reference_no', $reference)->first()) {
            return $existing;
        }
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Amount must be greater than zero.']);
        }

        $before = (int) $wallet->balance;
        $after = $direction === 'credit' ? $before + $amount : $before - $amount;
        if ($direction === 'debit' && ! config('wallet.allow_negative_balances') && $after < 0) {
            throw ValidationException::withMessages(['amount' => 'Insufficient wallet balance.']);
        }

        $wallet->update(['balance' => $after]);

        return WalletTransaction::create([
            'wallet_id' => $wallet->id,
            'user_id' => $wallet->user_id,
            'type' => $type,
            'direction' => $direction,
            'amount' => $amount,
            'balance_before' => $before,
            'balance_after' => $after,
            'status' => 'completed',
            'reference_no' => $reference,
            'reservation_id' => $reservation?->id,
            'processed_by' => $processedBy?->id,
            'meta' => $meta,
        ]);
    }

    private function newReference(): string
    {
        do {
            $reference = 'AST-'.now()->format('Ymd').'-'.Str::upper(Str::random(8));
        } while (WalletTransaction::query()->where('reference_no', $reference)->exists());

        return $reference;
    }

    private function moneyToCentavos(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }
}
