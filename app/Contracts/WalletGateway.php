<?php

namespace App\Contracts;

use Illuminate\Http\Request;

interface WalletGateway
{
    /** @return array{checkout_url: string, gateway_reference: string} */
    public function createCashInCheckout(int $amountCentavos, string $reference): array;

    public function handleWebhook(Request $request): void;
}
