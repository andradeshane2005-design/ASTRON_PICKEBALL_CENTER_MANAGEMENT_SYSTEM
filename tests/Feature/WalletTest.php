<?php

use App\Models\CashInRequest;
use App\Models\CashOutRequest;
use App\Models\Court;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    $this->withoutVite();
});

test('cash-in requests credit once when an admin approves twice', function () {
    $member = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    expect($member->role)->toBe('member');
    $this->actingAs($member)->post(route('wallet.cash-in.store'), [
        'amount_centavos' => 50000,
        'method' => 'front_desk',
        'reference_note' => 'Desk receipt 42',
    ])->assertRedirect(route('wallet'));

    $cashIn = CashInRequest::firstOrFail();
    expect($cashIn->status)->toBe('pending')
        ->and($member->wallet->fresh()->balance)->toBe(0);

    $this->actingAs($admin)->post(route('admin.wallet.cash-ins.approve', $cashIn))->assertRedirect();
    $this->post(route('admin.wallet.cash-ins.approve', $cashIn))->assertRedirect();

    expect($cashIn->fresh()->status)->toBe('approved')
        ->and($member->wallet->fresh()->balance)->toBe(50000)
        ->and(WalletTransaction::where('type', 'cash_in')->count())->toBe(1);
});

test('cash-out holds available funds and rejection releases them', function () {
    $member = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    app(WalletService::class)->credit($member, 80000, 'cash_in', 'TEST-FUND-CASHOUT');

    $this->actingAs($member)->post(route('wallet.cash-out.store'), [
        'amount_centavos' => 30000,
        'payout_method' => 'gcash',
        'account_name' => 'Member One',
        'account_number' => '09170000000',
    ])->assertRedirect(route('wallet'));

    $cashOut = CashOutRequest::firstOrFail();
    expect($member->wallet->fresh()->balance)->toBe(50000)
        ->and($member->wallet->fresh()->held_balance)->toBe(30000);

    $this->actingAs($admin)->post(route('admin.wallet.cash-outs.reject', $cashOut), [
        'reason' => 'Payout details need correction',
    ])->assertRedirect();

    expect($cashOut->fresh()->status)->toBe('rejected')
        ->and($member->wallet->fresh()->balance)->toBe(80000)
        ->and($member->wallet->fresh()->held_balance)->toBe(0)
        ->and(WalletTransaction::where('type', 'release')->count())->toBe(1);
});

test('approved cash-out consumes the existing hold without a second balance debit', function () {
    $member = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);
    app(WalletService::class)->credit($member, 70000, 'cash_in', 'TEST-FUND-APPROVAL');
    $this->actingAs($member)->post(route('wallet.cash-out.store'), [
        'amount_centavos' => 25000,
        'payout_method' => 'cash_pickup',
        'account_name' => 'Member Two',
        'account_number' => 'Front desk',
    ])->assertRedirect(route('wallet'));

    $cashOut = CashOutRequest::firstOrFail();
    $this->actingAs($admin)->post(route('admin.wallet.cash-outs.approve', $cashOut))->assertRedirect();
    $cashOutTransaction = WalletTransaction::where('type', 'cash_out')->firstOrFail();

    expect($cashOut->fresh()->status)->toBe('approved')
        ->and($member->wallet->fresh()->balance)->toBe(45000)
        ->and($member->wallet->fresh()->held_balance)->toBe(0)
        ->and($cashOutTransaction->balance_before)->toBe(45000)
        ->and($cashOutTransaction->balance_after)->toBe(45000);
});

test('insufficient wallet balance blocks cash-out and reservation payment', function () {
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    $this->actingAs($member)->post(route('wallet.cash-out.store'), [
        'amount_centavos' => 10000,
        'payout_method' => 'cash_pickup',
        'account_name' => 'Member One',
        'account_number' => 'Front desk',
    ])->assertSessionHasErrors('amount_centavos');

    $reservation = Reservation::create([
        'user_id' => $member->id,
        'court_id' => $court->id,
        'start_at' => now()->addDay()->setTime(9, 0),
        'end_at' => now()->addDay()->setTime(10, 0),
        'status' => 'pending',
        'amount' => 350,
    ]);
    Payment::create(['user_id' => $member->id, 'reservation_id' => $reservation->id, 'amount' => 350, 'status' => 'pending']);

    $this->post(route('reservations.pay-with-wallet', $reservation))->assertSessionHasErrors('amount');

    expect($member->wallet->fresh()->balance)->toBe(0)
        ->and($reservation->fresh()->status)->toBe('pending');
});

test('serialized reservation payments cannot overdraw the wallet', function () {
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    app(WalletService::class)->credit($member, 40000, 'cash_in', 'TEST-FUND-DOUBLE-PAY');
    $reservations = collect(range(1, 2))->map(function (int $number) use ($member, $court): Reservation {
        $reservation = Reservation::create([
            'user_id' => $member->id,
            'court_id' => $court->id,
            'start_at' => now()->addDays($number)->setTime(9, 0),
            'end_at' => now()->addDays($number)->setTime(10, 0),
            'status' => 'pending',
            'amount' => 350,
        ]);
        Payment::create(['user_id' => $member->id, 'reservation_id' => $reservation->id, 'amount' => 350, 'status' => 'pending']);

        return $reservation;
    });

    $service = app(WalletService::class);
    $service->payReservation($member, $reservations[0]);
    expect(fn () => $service->payReservation($member, $reservations[1]))
        ->toThrow(ValidationException::class);
    expect($member->wallet->fresh()->balance)->toBe(5000)
        ->and(WalletTransaction::where('type', 'payment')->count())->toBe(1);
});

test('wallet checkout debits centavos and eligible cancellation refunds once', function () {
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    app(WalletService::class)->credit($member, 100000, 'cash_in', 'TEST-FUND-BOOKING');
    $this->actingAs($member)->post(route('bookings.store'), [
        'court_id' => $court->id,
        'date' => now()->addDays(2)->toDateString(),
        'start_time' => '09:00',
        'duration' => 1,
        'payment_method' => 'wallet',
    ])->assertRedirect(route('reservations'));

    $reservation = Reservation::where('user_id', $member->id)->firstOrFail();
    expect($reservation->status)->toBe('confirmed')
        ->and($reservation->payment->status)->toBe('paid')
        ->and($reservation->payment->method)->toBe('wallet')
        ->and($member->wallet->fresh()->balance)->toBe(65000)
        ->and(WalletTransaction::where('type', 'payment')->count())->toBe(1);

    $this->delete(route('reservations.cancel', $reservation))->assertRedirect(route('reservations'));
    $refund = app(WalletService::class)->refundReservation($member, $reservation);
    expect($reservation->fresh()->status)->toBe('cancelled')
        ->and($member->wallet->fresh()->balance)->toBe(100000)
        ->and($refund->reference_no)->toBe('AST-RES-'.$reservation->id.'-REFUND')
        ->and(WalletTransaction::where('type', 'refund')->count())->toBe(1);
});

test('customers cannot view another customer wallet activity or approve cash-ins', function () {
    $member = User::factory()->create();
    $anotherMember = User::factory()->create();
    $cashIn = CashInRequest::create([
        'user_id' => $anotherMember->id,
        'amount' => 50000,
        'method' => 'front_desk',
        'status' => 'pending',
    ]);

    $wallet = $member->wallet()->firstOrFail();
    expect((int) $wallet->user_id)->toBe($member->id);
    $this->actingAs($member)->get(route('wallet'))->assertOk()->assertInertia(fn ($page) => $page
        ->component('wallet')
        ->where('wallet.balance', 0)
        ->has('transactions', 0)
    );

    $this->post(route('admin.wallet.cash-ins.approve', $cashIn))->assertForbidden();
    expect($cashIn->fresh()->status)->toBe('pending');
});

test('admin wallet tabs render against the wallet schema', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('admin.wallet.cash-ins'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/wallet')
            ->where('section', 'cash-ins')
        );

    $this->get(route('admin.wallet.cash-outs'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/wallet')
            ->where('section', 'cash-outs')
        );

    $this->get(route('admin.wallet.customers'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/wallet')
            ->where('section', 'customers')
        );

    $this->get(route('admin.wallet.reports'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/wallet')
            ->where('section', 'reports')
        );
});
