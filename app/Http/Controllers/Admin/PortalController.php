<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\FacilitySetting;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    public function courts(): Response
    {
        return Inertia::render('admin/courts', [
            'courts' => Court::query()->withCount('reservations')->orderBy('name')->get(),
        ]);
    }

    public function storeCourt(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', 'unique:courts,name'],
            'surface' => ['required', 'string', 'max:80'],
            'price_per_hour' => ['required', 'numeric', 'min:1', 'max:100000'],
        ]);

        Court::create($data);

        return back()->with('success', 'Court added.');
    }

    public function updateCourt(Request $request, Court $court): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80', Rule::unique('courts')->ignore($court->id)],
            'surface' => ['required', 'string', 'max:80'],
            'price_per_hour' => ['required', 'numeric', 'min:1', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $court->update($data);

        return back()->with('success', 'Court updated.');
    }

    public function destroyCourt(Court $court): RedirectResponse
    {
        if ($court->reservations()->exists()) {
            return back()->withErrors(['court' => 'Courts with reservation history cannot be deleted. Deactivate the court instead.']);
        }

        $court->delete();

        return back()->with('success', 'Court removed.');
    }

    public function reservations(): Response
    {
        return Inertia::render('admin/reservations', [
            'reservations' => Reservation::query()
                ->with(['user:id,name,email', 'court:id,name', 'payment:id,reservation_id,status,method'])
                ->latest('start_at')
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function updateReservation(Request $request, Reservation $reservation, WalletService $walletService): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        DB::transaction(function () use ($reservation, $data, $walletService, $request): void {
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($reservation->id);

            if ($reservation->status === 'completed') {
                throw ValidationException::withMessages(['status' => 'Completed reservations cannot be changed.']);
            }

            $reservation->update($data);

            if ($data['status'] === 'cancelled' && $reservation->payment?->status === 'paid' && $reservation->payment->method === 'wallet') {
                $walletService->refundReservation($reservation->user, $reservation, $request->user());
            } elseif ($data['status'] === 'cancelled' && $reservation->payment?->status === 'pending') {
                $reservation->payment->update(['status' => 'cancelled']);
            }
        });

        return back()->with('success', 'Reservation status updated.');
    }

    public function customers(Request $request): Response
    {
        $customers = User::query()
            ->where('role', 'member')
            ->withCount('reservations')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->trim().'%';
                $query->where(fn ($query) => $query->where('name', 'like', $term)->orWhere('email', 'like', $term));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/customers', [
            'customers' => $customers,
            'search' => $request->string('search')->toString(),
        ]);
    }

    public function payments(): Response
    {
        return Inertia::render('admin/payments', [
            'payments' => Payment::query()
                ->with(['user:id,name,email', 'reservation.court:id,name'])
                ->latest()
                ->paginate(20),
        ]);
    }

    public function updatePayment(Request $request, Payment $payment): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'paid', 'refunded'])],
            'method' => ['nullable', 'required_if:status,paid', 'string', 'max:40'],
        ]);

        DB::transaction(function () use ($payment, $data): void {
            $reservation = Reservation::query()->lockForUpdate()->findOrFail($payment->reservation_id);
            $payment = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            if ($data['status'] === 'paid' && $reservation->status === 'cancelled') {
                throw ValidationException::withMessages(['status' => 'Cancelled reservations cannot be settled.']);
            }

            $payment->update([
                ...$data,
                'reference' => $data['status'] === 'paid'
                    ? ($payment->reference ?? 'OFFLINE-'.$payment->id.'-'.now()->format('YmdHis'))
                    : $payment->reference,
            ]);

            if ($data['status'] === 'paid' && $reservation->status !== 'completed') {
                $reservation->update(['status' => 'completed']);
            }
        });

        return back()->with('success', 'Payment record updated.');
    }

    public function reports(): Response
    {
        $start = now()->subDays(6)->startOfDay();
        $daily = Payment::query()
            ->where('status', 'paid')
            ->where('created_at', '>=', $start)
            ->get(['amount', 'created_at'])
            ->groupBy(fn (Payment $payment) => $payment->created_at->toDateString())
            ->map(fn ($payments) => $payments->sum('amount'));

        return Inertia::render('admin/reports', [
            'summary' => [
                'revenueThisMonth' => Payment::where('status', 'paid')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('amount'),
                'reservationsThisMonth' => Reservation::whereMonth('start_at', now()->month)->whereYear('start_at', now()->year)->where('status', '!=', 'cancelled')->count(),
                'activeCourts' => Court::where('is_active', true)->count(),
                'pendingPayments' => Payment::where('status', 'pending')->count(),
            ],
            'dailyRevenue' => collect(range(6, 0))->map(fn (int $daysAgo) => [
                'date' => now()->subDays($daysAgo)->toDateString(),
                'amount' => (float) $daily->get(now()->subDays($daysAgo)->toDateString(), 0),
            ]),
        ]);
    }

    public function settings(): Response
    {
        $defaults = [
            'center_name' => 'Astron Pickleball Center',
            'location' => 'Abuyog, Leyte',
            'opening_time' => '06:00',
            'closing_time' => '22:00',
            'cancellation_hours' => '12',
        ];

        foreach ($defaults as $key => $value) {
            FacilitySetting::firstOrCreate(['key' => $key], ['value' => $value]);
        }

        return Inertia::render('admin/settings', [
            'settings' => FacilitySetting::query()->whereIn('key', array_keys($defaults))->pluck('value', 'key'),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'center_name' => ['required', 'string', 'max:120'],
            'location' => ['required', 'string', 'max:180'],
            'opening_time' => ['required', 'date_format:H:i'],
            'closing_time' => ['required', 'date_format:H:i', 'after:opening_time'],
            'cancellation_hours' => ['required', 'integer', 'min:0', 'max:168'],
        ]);

        DB::transaction(function () use ($data): void {
            foreach ($data as $key => $value) {
                FacilitySetting::updateOrCreate(['key' => $key], ['value' => (string) $value]);
            }
        });

        return back()->with('success', 'Facility settings saved.');
    }
}
