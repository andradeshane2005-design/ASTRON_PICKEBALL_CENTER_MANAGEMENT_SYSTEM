<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'member';
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'amount_centavos' => ['required', 'integer', 'min:'.config('wallet.min_cash_out')],
            'payout_method' => ['required', 'in:cash_pickup,gcash,bank'],
            'account_name' => ['required', 'string', 'max:120'],
            'account_number' => ['required', 'string', 'max:120'],
        ];
    }
}
