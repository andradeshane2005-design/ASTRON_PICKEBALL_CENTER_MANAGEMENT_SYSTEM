<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletWebhookController extends Controller
{
    public function __invoke(Request $request, string $gateway): JsonResponse
    {
        abort_unless($gateway === 'paymongo', 404);

        if (! config('wallet.online_cash_in_enabled')) {
            return response()->json(['message' => 'Online wallet cash-in is disabled.'], 404);
        }

        return response()->json(['message' => 'Gateway webhook integration is not configured.'], 501);
    }
}
