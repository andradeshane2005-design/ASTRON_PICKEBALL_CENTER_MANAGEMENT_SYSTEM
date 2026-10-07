<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PortalController as AdminPortalController;
use App\Http\Controllers\Admin\WalletController as AdminWalletController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\WalletController;
use App\Http\Controllers\WalletWebhookController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::post('wallet/webhooks/{gateway}', WalletWebhookController::class)->middleware('throttle:30,1')->name('wallet.webhooks');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [CustomerPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('bookings', [CustomerPortalController::class, 'booking'])->name('bookings');
    Route::get('bookings/availability', [CustomerPortalController::class, 'availability'])->name('bookings.availability');
    Route::post('bookings', [CustomerPortalController::class, 'store'])->name('bookings.store');
    Route::get('reservations', [CustomerPortalController::class, 'reservations'])->name('reservations');
    Route::delete('reservations/{reservation}', [CustomerPortalController::class, 'cancel'])->name('reservations.cancel');
    Route::get('payments', [CustomerPortalController::class, 'payments'])->name('payments');
    Route::get('profile', fn () => Inertia\Inertia::render('profile'))->name('profile');
    Route::patch('profile', [CustomerPortalController::class, 'updateProfile'])->name('portal.profile.update');

    Route::get('wallet', [WalletController::class, 'index'])->name('wallet');
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('cash-in', [WalletController::class, 'cashIn'])->name('cash-in');
        Route::post('cash-in', [WalletController::class, 'storeCashIn'])->middleware('throttle:10,1')->name('cash-in.store');
        Route::get('cash-out', [WalletController::class, 'cashOut'])->name('cash-out');
        Route::post('cash-out', [WalletController::class, 'storeCashOut'])->middleware('throttle:5,1')->name('cash-out.store');
        Route::get('transactions', [WalletController::class, 'transactions'])->name('transactions');
    });
    Route::post('reservations/{reservation}/pay-with-wallet', [WalletController::class, 'payReservation'])
        ->middleware('throttle:10,1')->name('reservations.pay-with-wallet');

    Route::inertia('about', 'about')->name('about');
    Route::get('courts', [CustomerPortalController::class, 'courts'])->name('courts');
    Route::inertia('members', 'members')->name('members');

    Route::prefix('admin')->name('admin.')->middleware('can:access-admin')->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::get('courts', [AdminPortalController::class, 'courts'])->name('courts');
        Route::post('courts', [AdminPortalController::class, 'storeCourt'])->name('courts.store');
        Route::patch('courts/{court}', [AdminPortalController::class, 'updateCourt'])->name('courts.update');
        Route::delete('courts/{court}', [AdminPortalController::class, 'destroyCourt'])->name('courts.destroy');
        Route::get('reservations', [AdminPortalController::class, 'reservations'])->name('reservations');
        Route::patch('reservations/{reservation}', [AdminPortalController::class, 'updateReservation'])->name('reservations.update');
        Route::get('customers', [AdminPortalController::class, 'customers'])->name('customers');
        Route::get('payments', [AdminPortalController::class, 'payments'])->name('payments');
        Route::patch('payments/{payment}', [AdminPortalController::class, 'updatePayment'])->name('payments.update');
        Route::prefix('wallet')->name('wallet.')->group(function () {
            Route::get('cash-ins', [AdminWalletController::class, 'cashIns'])->name('cash-ins');
            Route::post('cash-ins/{cashIn}/approve', [AdminWalletController::class, 'approveCashIn'])->name('cash-ins.approve');
            Route::post('cash-ins/{cashIn}/reject', [AdminWalletController::class, 'rejectCashIn'])->name('cash-ins.reject');
            Route::get('cash-outs', [AdminWalletController::class, 'cashOuts'])->name('cash-outs');
            Route::post('cash-outs/{cashOut}/approve', [AdminWalletController::class, 'approveCashOut'])->name('cash-outs.approve');
            Route::post('cash-outs/{cashOut}/reject', [AdminWalletController::class, 'rejectCashOut'])->name('cash-outs.reject');
            Route::get('customers', [AdminWalletController::class, 'customers'])->name('customers');
            Route::post('adjust', [AdminWalletController::class, 'adjust'])->name('adjust');
            Route::get('reports', [AdminWalletController::class, 'reports'])->name('reports');
        });
        Route::get('reports', [AdminPortalController::class, 'reports'])->name('reports');
        Route::get('settings', [AdminPortalController::class, 'settings'])->name('settings');
        Route::patch('settings', [AdminPortalController::class, 'updateSettings'])->name('settings.update');
    });
});

require __DIR__.'/settings.php';
