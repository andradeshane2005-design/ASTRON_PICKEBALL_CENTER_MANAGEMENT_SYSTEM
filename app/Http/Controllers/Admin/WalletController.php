<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdjustWalletRequest;
use App\Models\CashInRequest as CashIn;
use App\Models\CashOutRequest as CashOut;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Notifications\WalletRequestReviewed;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WalletController extends Controller
{
    public function cashIns(): Response
    {
        return Inertia::render('admin/wallet', [
            'section' => 'cash-ins',
            'items' => CashIn::query()->with('user:id,name,email')->latest()->paginate(20),
            'stats' => ['pendingCashIns' => CashIn::where('status', 'pending')->count(), 'pendingCashOuts' => CashOut::where('status', 'pending')->count()],
        ]);
    }

    public function approveCashIn(Request $request, int $cashIn, WalletService $walletService): RedirectResponse
    {
        $user = null;
        DB::transaction(function () use ($request, $cashIn, $walletService, &$user): void {
            $item = CashIn::query()->lockForUpdate()->findOrFail($cashIn);
            if ($item->status !== 'pending') {
                return;
            }
            $user = $item->user;
            $walletService->credit($user, $item->amount, 'cash_in', 'AST-CI-'.$item->id.'-APPROVED', $request->user(), [
                'cash_in_request_id' => $item->id,
                'note' => $item->reference_note,
            ]);
            $item->update(['status' => 'approved', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
        });
        if ($user) {
            $user->notify(new WalletRequestReviewed('cash-in', 'approved'));
            Log::info('Wallet cash-in approved.', ['request_id' => $cashIn, 'admin_id' => $request->user()->id]);
        }

        return back()->with('success', 'Cash-in request approved.');
    }

    public function rejectCashIn(Request $request, int $cashIn): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:500']]);
        $user = DB::transaction(function () use ($request, $cashIn, $data): ?User {
            $item = CashIn::query()->lockForUpdate()->findOrFail($cashIn);
            if ($item->status !== 'pending') {
                return null;
            }
            $item->update(['status' => 'rejected', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'reject_reason' => $data['reason']]);

            return $item->user;
        });
        if ($user) {
            $user->notify(new WalletRequestReviewed('cash-in', 'rejected', ['reason' => $data['reason']]));
            Log::info('Wallet cash-in rejected.', ['request_id' => $cashIn, 'admin_id' => $request->user()->id]);
        }

        return back()->with('success', 'Cash-in request rejected.');
    }

    public function cashOuts(): Response
    {
        return Inertia::render('admin/wallet', [
            'section' => 'cash-outs',
            'items' => CashOut::query()->with('user:id,name,email')->latest()->paginate(20),
            'stats' => ['pendingCashIns' => CashIn::where('status', 'pending')->count(), 'pendingCashOuts' => CashOut::where('status', 'pending')->count()],
        ]);
    }

    public function approveCashOut(Request $request, int $cashOut, WalletService $walletService): RedirectResponse
    {
        $user = null;
        DB::transaction(function () use ($request, $cashOut, $walletService, &$user): void {
            $item = CashOut::query()->lockForUpdate()->findOrFail($cashOut);
            if ($item->status !== 'pending') {
                return;
            }
            $user = $item->user;
            $walletService->completeCashOut($user, $item->amount, 'AST-CO-'.$item->id.'-PAID', $request->user(), [
                'cash_out_request_id' => $item->id,
                'payout_method' => $item->payout_method,
            ]);
            $item->update(['status' => 'approved', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
        });
        if ($user) {
            $user->notify(new WalletRequestReviewed('cash-out', 'approved'));
            Log::info('Wallet cash-out approved.', ['request_id' => $cashOut, 'admin_id' => $request->user()->id]);
        }

        return back()->with('success', 'Cash-out request marked as paid.');
    }

    public function rejectCashOut(Request $request, int $cashOut, WalletService $walletService): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:500']]);
        $user = null;
        DB::transaction(function () use ($request, $cashOut, $data, $walletService, &$user): void {
            $item = CashOut::query()->lockForUpdate()->findOrFail($cashOut);
            if ($item->status !== 'pending') {
                return;
            }
            $user = $item->user;
            $walletService->releaseHold($user, $item->amount, 'AST-CO-'.$item->id.'-RELEASE', $request->user(), [
                'cash_out_request_id' => $item->id,
                'reason' => $data['reason'],
            ]);
            $item->update(['status' => 'rejected', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'reject_reason' => $data['reason']]);
        });
        if ($user) {
            $user->notify(new WalletRequestReviewed('cash-out', 'rejected', ['reason' => $data['reason']]));
            Log::info('Wallet cash-out rejected.', ['request_id' => $cashOut, 'admin_id' => $request->user()->id]);
        }

        return back()->with('success', 'Cash-out request rejected and funds released.');
    }

    public function customers(): Response
    {
        return Inertia::render('admin/wallet', [
            'section' => 'customers',
            'items' => User::query()->where('role', 'member')->with('wallet')->latest()->paginate(20),
            'stats' => ['pendingCashIns' => CashIn::where('status', 'pending')->count(), 'pendingCashOuts' => CashOut::where('status', 'pending')->count()],
        ]);
    }

    public function adjust(AdjustWalletRequest $request, WalletService $walletService): RedirectResponse
    {
        $data = $request->validated();
        $user = User::query()->where('role', 'member')->whereKey($data['user_id'])->firstOrFail();
        $walletService->adjust($user, (int) $data['amount_centavos'], $data['reason'], $request->user());
        Log::info('Wallet balance adjusted.', ['customer_id' => $user->id, 'admin_id' => $request->user()->id, 'reason' => $data['reason']]);

        return back()->with('success', 'Wallet balance adjusted.');
    }

    public function reports(Request $request): Response|StreamedResponse
    {
        $filters = $request->validate([
            'period' => ['nullable', Rule::in(['daily', 'weekly', 'monthly'])],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);
        $period = $filters['period'] ?? 'daily';
        $defaultDays = ['daily' => 30, 'weekly' => 84, 'monthly' => 365][$period];
        $from = $filters['from'] ?? now()->subDays($defaultDays - 1)->toDateString();
        $to = $filters['to'] ?? today()->toDateString();

        if ($request->boolean('export')) {
            return response()->streamDownload(function () use ($from, $to): void {
                $output = fopen('php://output', 'w');
                if (! is_resource($output)) {
                    return;
                }
                fputcsv($output, ['Reference', 'Type', 'Direction', 'Amount (centavos)', 'Status', 'Created at']);
                WalletTransaction::query()->whereDate('created_at', '>=', $from)->whereDate('created_at', '<=', $to)->chunkById(500, function ($transactions) use ($output): void {
                    foreach ($transactions as $transaction) {
                        fputcsv($output, [$transaction->reference_no, $transaction->type, $transaction->direction, $transaction->amount, $transaction->status, $transaction->created_at->toDateTimeString()]);
                    }
                });
                fclose($output);
            }, 'wallet-transactions.csv', ['Content-Type' => 'text/csv']);
        }

        $transactions = WalletTransaction::query()
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->get(['type', 'amount', 'created_at']);
        $bucketKey = fn (WalletTransaction $transaction): string => match ($period) {
            'weekly' => $transaction->created_at->startOfWeek()->toDateString(),
            'monthly' => $transaction->created_at->format('Y-m'),
            default => $transaction->created_at->toDateString(),
        };
        /** @var list<array{type: string, total_centavos: int, day: string}> $totals */
        $totals = [];
        foreach ($transactions->groupBy($bucketKey) as $day => $bucket) {
            foreach ($bucket->groupBy('type') as $type => $typed) {
                $totals[] = [
                    'type' => (string) $type,
                    'total_centavos' => (int) $typed->sum('amount'),
                    'day' => (string) $day,
                ];
            }
        }
        $totalFor = fn (string $type): int => (int) $transactions->where('type', $type)->sum('amount');

        return Inertia::render('admin/wallet', [
            'section' => 'reports',
            'items' => $totals,
            'filters' => ['period' => $period, 'from' => $from, 'to' => $to],
            'stats' => [
                'pendingCashIns' => CashIn::where('status', 'pending')->count(),
                'pendingCashOuts' => CashOut::where('status', 'pending')->count(),
                'cashInCentavos' => $totalFor('cash_in'),
                'cashOutCentavos' => $totalFor('cash_out'),
                'paymentsCentavos' => $totalFor('payment'),
                'refundsCentavos' => $totalFor('refund'),
            ],
        ]);
    }
}
