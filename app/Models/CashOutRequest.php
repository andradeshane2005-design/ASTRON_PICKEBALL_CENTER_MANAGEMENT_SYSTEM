<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $amount
 * @property-read User $user
 * @property-read User|null $reviewer
 */
#[Fillable(['user_id', 'amount', 'payout_method', 'account_name', 'account_number', 'status', 'reviewed_by', 'reviewed_at', 'reject_reason'])]
class CashOutRequest extends Model
{
    protected function casts(): array
    {
        return ['amount' => 'integer', 'reviewed_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
