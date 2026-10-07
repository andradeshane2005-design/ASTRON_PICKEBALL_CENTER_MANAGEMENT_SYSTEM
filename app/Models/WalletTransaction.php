<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use LogicException;

/**
 * @property int $id
 * @property int $wallet_id
 * @property int $user_id
 * @property int $amount
 * @property int $balance_before
 * @property int $balance_after
 * @property string $reference_no
 */
#[Fillable(['wallet_id', 'user_id', 'type', 'direction', 'amount', 'balance_before', 'balance_after', 'status', 'reference_no', 'reservation_id', 'processed_by', 'meta'])]
class WalletTransaction extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_before' => 'integer',
            'balance_after' => 'integer',
            'meta' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::updating(fn () => throw new LogicException('Wallet ledger entries are immutable.'));
        static::deleting(fn () => throw new LogicException('Wallet ledger entries are immutable.'));
    }

    /** @return BelongsTo<Wallet, $this> */
    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Reservation, $this> */
    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
