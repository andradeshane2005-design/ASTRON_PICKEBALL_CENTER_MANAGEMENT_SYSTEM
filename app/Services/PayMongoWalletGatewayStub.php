<?php

namespace App\Services;

use App\Contracts\WalletGateway;
use Illuminate\Http\Request;
use LogicException;

class PayMongoWalletGatewayStub implements WalletGateway
{
    public function createCashInCheckout(int $amountCentavos, string $reference): array
    {
        throw new LogicException('PayMongo cash-in checkout has not been configured.');
    }

    public function handleWebhook(Request $request): void
    {
        throw new LogicException('PayMongo webhook verification has not been configured.');
    }
}
