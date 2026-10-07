<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCashInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'member';
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'amount_centavos' => ['required', 'integer', 'min:'.config('wallet.min_cash_in'), 'max:'.config('wallet.max_cash_in')],
            'method' => ['required', 'in:front_desk'],
            'reference_note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
