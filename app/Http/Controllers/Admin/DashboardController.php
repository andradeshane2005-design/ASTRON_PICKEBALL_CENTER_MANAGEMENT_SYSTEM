<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $monthStart = now()->startOfMonth();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'accounts' => User::count(),
                'members' => User::where('role', 'member')->count(),
                'administrators' => User::where('role', 'admin')->count(),
                'pendingVerification' => User::whereNull('email_verified_at')->count(),
                'joinedThisMonth' => User::where('created_at', '>=', $monthStart)->count(),
                'activeCourts' => Court::where('is_active', true)->count(),
                'reservationsToday' => Reservation::whereDate('start_at', today())->where('status', '!=', 'cancelled')->count(),
                'revenueThisMonth' => Payment::where('status', 'paid')
                    ->where('created_at', '>=', $monthStart)
                    ->sum('amount'),
            ],
            'recentAccounts' => User::query()
                ->select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at'])
                ->latest('created_at')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'verified' => $user->email_verified_at !== null,
                    'joinedAt' => $user->created_at?->toDateString(),
                ])
                ->values(),
            'recentReservations' => Reservation::query()
                ->with(['user:id,name,email', 'court:id,name'])
                ->latest('start_at')
                ->limit(8)
                ->get(),
            'adminName' => $request->user()->name,
        ]);
    }
}
