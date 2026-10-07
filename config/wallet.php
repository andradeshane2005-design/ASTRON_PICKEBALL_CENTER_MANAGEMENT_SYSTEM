<?php

return [
    'min_cash_in' => (int) env('WALLET_MIN_CASH_IN_CENTAVOS', 20000),
    'max_cash_in' => (int) env('WALLET_MAX_CASH_IN_CENTAVOS', 10000000),
    'min_cash_out' => (int) env('WALLET_MIN_CASH_OUT_CENTAVOS', 10000),
    'max_daily_cash_out' => (int) env('WALLET_MAX_DAILY_CASH_OUT_CENTAVOS', 5000000),
    'allow_negative_balances' => false,
    'online_cash_in_enabled' => (bool) env('WALLET_ONLINE_CASH_IN_ENABLED', false),
    'paymongo_secret_key' => env('PAYMONGO_SECRET_KEY'),
    'paymongo_webhook_secret' => env('PAYMONGO_WEBHOOK_SECRET'),
];
