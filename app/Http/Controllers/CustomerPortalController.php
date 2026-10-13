<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;
use App\Models\Court;
use App\Models\FacilitySetting;
use App\Models\Reservation;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CustomerPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $user = $request->user();
        $monthStart = now()->startOfMonth();

        return Inertia::render('dashboard', [
            'upcomingReservation' => $user->reservations()
                ->with('court:id,name')
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('start_at', '>=', now())
                ->orderBy('start_at')
                ->first(),
            'monthlyReservations' => $user->reservations()
                ->where('start_at', '>=', $monthStart)
                ->where('status', '!=', 'cancelled')
                ->count(),
            'monthlySpend' => $user->payments()
                ->where('status', 'paid')
                ->where('created_at', '>=', $monthStart)
                ->sum('amount'),
        ]);
    }

    public function booking(Request $request): Response
    {
        [$openingTime, $closingTime] = $this->operatingHours();

        return Inertia::render('bookings', [
            'courts' => Court::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'surface', 'price_per_hour']),
            'minimumDate' => now()->toDateString(),
            'openingTime' => $openingTime,
            'closingTime' => $closingTime,
            'walletBalance' => (int) $request->user()->wallet()->firstOrCreate([], ['balance' => 0, 'held_balance' => 0])->balance,
        ]);
    }

    public function courts(): Response
    {
        [$openingTime, $closingTime] = $this->operatingHours();

        return Inertia::render('courts', [
            'courts' => Court::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'surface', 'price_per_hour']),
            'openingTime' => $openingTime,
            'closingTime' => $closingTime,
            'location' => FacilitySetting::where('key', 'location')->value('value') ?? 'Astron Pickleball Center, Abuyog, Leyte',
        ]);
    }

    public function availability(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'duration' => ['required', 'integer', 'in:1,2,3'],
        ]);
        $startAt = Carbon::parse($data['date'].' '.$data['start_time']);
        $endAt = $startAt->copy()->addHours((int) $data['duration']);
        [$openingTime, $closingTime] = $this->operatingHours();
        $opensAt = Carbon::parse($data['date'].' '.$openingTime);
        $closesAt = Carbon::parse($data['date'].' '.$closingTime);

        if ($startAt->lt($opensAt) || $endAt->gt($closesAt)) {
            throw ValidationException::withMessages([
                'start_time' => 'The selected time falls outside the center operating hours.',
            ]);
        }

        $reservedCourtIds = Reservation::query()
            ->where('status', '!=', 'cancelled')
            ->where('start_at', '<', $endAt)
            ->where('end_at', '>', $startAt)
            ->pluck('court_id');

        return response()->json([
            'availableCourtIds' => Court::query()
                ->where('is_active', true)
                ->whereNotIn('id', $reservedCourtIds)
                ->pluck('id'),
        ]);
    }

    public function store(Request $request, WalletService $walletService): RedirectResponse
    {
        $data = $request->validate([
            'court_id' => ['required', 'integer', 'exists:courts,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'duration' => ['required', 'integer', 'in:1,2,3'],
            'payment_method' => ['nullable', 'in:front_desk,wallet'],
        ]);
        $data['payment_method'] = $data['payment_method'] ?? 'front_desk';

        $reservation = DB::transaction(function () use ($request, $data, $walletService): Reservation {
            $court = Court::query()
                ->where('is_active', true)
                ->lockForUpdate()
                ->findOrFail($data['court_id']);
            $startAt = Carbon::parse($data['date'].' '.$data['start_time']);
            $endAt = $startAt->copy()->addHours((int) $data['duration']);
            [$openingTime, $closingTime] = $this->operatingHours();

            if ($startAt->lt(Carbon::parse($data['date'].' '.$openingTime)) || $endAt->gt(Carbon::parse($data['date'].' '.$closingTime))) {
                throw ValidationException::withMessages([
                    'start_time' => 'The selected time falls outside the center operating hours.',
                ]);
            }

            if ($startAt->isPast()) {
                throw ValidationException::withMessages([
                    'start_time' => 'Choose a start time that is in the future.',
                ]);
            }

            $overlaps = Reservation::query()
                ->where('court_id', $court->id)
                ->where('status', '!=', 'cancelled')
                ->where('start_at', '<', $endAt)
                ->where('end_at', '>', $startAt)
                ->exists();

            if ($overlaps) {
                throw ValidationException::withMessages([
                    'start_time' => 'That court is no longer available for the selected time.',
                ]);
            }

            $amountCentavos = $this->moneyToCentavos((string) $court->price_per_hour) * (int) $data['duration'];
            $reservation = $request->user()->reservations()->create([
                'court_id' => $court->id,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'status' => 'pending',
                'amount' => $this->formatCentavos($amountCentavos),
            ]);

            $request->user()->payments()->create([
                'reservation_id' => $reservation->id,
                'amount' => $this->formatCentavos($amountCentavos),
                'status' => 'pending',
            ]);

            if ($data['payment_method'] === 'wallet') {
                $walletService->payReservation($request->user(), $reservation);
            }

            return $reservation;
        });

        return to_route('reservations')->with('success', $data['payment_method'] === 'wallet'
            ? 'Court reserved and paid with your wallet.'
            : 'Court reserved. Payment is due at the center.');
    }

    public function reservations(Request $request): Response
    {
        return Inertia::render('reservations', [
            'reservations' => $request->user()->reservations()
                ->with(['court:id,name', 'payment:id,reservation_id,status'])
                ->orderByDesc('start_at')
                ->get(),
        ]);
    }

    public function cancel(Request $request, int $reservation, WalletService $walletService): RedirectResponse
    {
        $booking = $request->user()->reservations()->with('payment')->findOrFail($reservation);
        $cancellationHours = (int) (FacilitySetting::where('key', 'cancellation_hours')->value('value') ?? 12);

        if (! in_array($booking->status, ['pending', 'confirmed'], true) || $booking->start_at->lte(now()->addHours($cancellationHours))) {
            throw ValidationException::withMessages([
                'reservation' => 'Reservations can only be cancelled before the cancellation notice period.',
            ]);
        }

        DB::transaction(function () use ($booking, $walletService, $request): void {
            $booking->update(['status' => 'cancelled']);

            if ($booking->payment?->status === 'paid' && $booking->payment->method === 'wallet') {
                $walletService->refundReservation($request->user(), $booking);
            } elseif ($booking->payment?->status === 'pending') {
                $booking->payment->update(['status' => 'cancelled']);
            }
        });

        return to_route('reservations')->with('success', 'Reservation cancelled.');
    }

    public function payments(Request $request): Response
    {
        return Inertia::render('payments', [
            'payments' => $request->user()->payments()
                ->with('reservation.court:id,name')
                ->latest()
                ->get(),
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
{
    $data = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$request->user()->id],
        'phone' => ['nullable', 'string', 'max:30'],
        'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        'remove_avatar' => ['nullable', 'boolean'],
    ]);

    $user = $request->user();
    $user->fill(['name' => $data['name'], 'email' => $data['email']]);
    $user->phone = $data['phone'] ?? null;

    if ($request->hasFile('avatar')) {
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }
        $user->avatar = $request->file('avatar')->store('avatars', 'public');
    } elseif ($request->boolean('remove_avatar') && $user->avatar) {
        Storage::disk('public')->delete($user->avatar);
        $user->avatar = null;
    }

    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save();

    return back()->with('success', 'Profile updated.');
}
    /** @return array{string, string} */
    private function operatingHours(): array
    {
        return [
            FacilitySetting::where('key', 'opening_time')->value('value') ?? '06:00',
            FacilitySetting::where('key', 'closing_time')->value('value') ?? '22:00',
        ];
    }

    private function moneyToCentavos(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function formatCentavos(int $amount): string
    {
        return intdiv($amount, 100).'.'.str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
    }
}
