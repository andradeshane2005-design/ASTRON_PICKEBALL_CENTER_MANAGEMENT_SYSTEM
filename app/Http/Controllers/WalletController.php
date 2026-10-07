<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCashInRequest;
use App\Http\Requests\StoreCashOutRequest;
use App\Models\CashOutRequest as CashOut;
use App\Models\Reservation;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $wallet = $request->user()->wallet()->firstOrCreate([], ['balance' => 0, 'held_balance' => 0]);
        Gate::authorize('view', $wallet);

        return Inertia::render('wallet', [
            'wallet' => $wallet->only(['balance', 'held_balance']),
            'transactions' => $wallet->transactions()->latest()->limit(10)->get(),
        ]);
    }

    public function cashIn(): Response
    {
        return Inertia::render('wallet/cash-in', [
            'minimum' => config('wallet.min_cash_in'),
            'maximum' => config('wallet.max_cash_in'),
        ]);
    }

    public function storeCashIn(StoreCashInRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $request->user()->cashInRequests()->create([
            'amount' => (int) $data['amount_centavos'],
            'method' => $data['method'],
            'reference_note' => $data['reference_note'] ?? null,
        ]);

        return to_route('wallet')->with('success', 'Cash-in request submitted. Pay at the front desk and wait for confirmation.');
    }

    public function cashOut(Request $request): Response
    {
        $wallet = $request->user()->wallet()->firstOrCreate([], ['balance' => 0, 'held_balance' => 0]);

        return Inertia::render('wallet/cash-out', [
            'balance' => $wallet->balance,
            'minimum' => config('wallet.min_cash_out'),
        ]);
    }

    public function storeCashOut(StoreCashOutRequest $request, WalletService $walletService): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        DB::transaction(function () use ($data, $user, $walletService): void {
            $wallet = Wallet::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            if ($wallet->balance < (int) $data['amount_centavos']) {
                throw ValidationException::withMessages(['amount_centavos' => 'Insufficient wallet balance.']);
            }
            $dailyTotal = CashOut::query()
                ->where('user_id', $user->id)
                ->whereDate('created_at', today())
                ->whereIn('status', ['pending', 'approved'])
                ->sum('amount');

            if ($dailyTotal + $data['amount_centavos'] > config('wallet.max_daily_cash_out')) {
                throw ValidationException::withMessages(['amount_centavos' => 'This withdrawal would exceed the daily cash-out limit.']);
            }

            $cashOut = $user->cashOutRequests()->create([
                'amount' => (int) $data['amount_centavos'],
                'payout_method' => $data['payout_method'],
                'account_name' => $data['account_name'],
                'account_number' => $data['account_number'],
                'status' => 'pending',
            ]);
            $walletService->holdForCashOut($user, (int) $data['amount_centavos'], 'AST-CO-'.$cashOut->id.'-HOLD', [
                'cash_out_request_id' => $cashOut->id,
            ]);
        });

        return to_route('wallet')->with('success', 'Cash-out request submitted. The amount is held until review.');
    }

    public function transactions(Request $request): Response
    {
        $filters = $request->validate([
            'type' => ['nullable', Rule::in(['cash_in', 'cash_out', 'payment', 'refund', 'adjustment', 'hold', 'release'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'search' => ['nullable', 'string', 'max:80'],
        ]);
        $query = WalletTransaction::query()->where('user_id', $request->user()->id);
        $query->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type));
        $query->when($filters['from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from));
        $query->when($filters['to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to));
        $query->when($filters['search'] ?? null, fn ($query, $search) => $query->where('reference_no', 'like', '%'.$search.'%'));

        return Inertia::render('wallet/transactions', [
            'transactions' => $query->latest()->paginate(20)->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function payReservation(Request $request, Reservation $reservation, WalletService $walletService): RedirectResponse
    {
        $walletService->payReservation($request->user(), $reservation);

        return to_route('reservations')->with('success', 'Reservation paid with your wallet.');
    }
}
