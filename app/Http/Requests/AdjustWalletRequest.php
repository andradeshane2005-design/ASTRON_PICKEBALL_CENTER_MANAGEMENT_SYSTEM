<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustWalletRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'amount_centavos' => ['required', 'integer', 'not_in:0', 'between:-1000000000,1000000000'],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }
}
