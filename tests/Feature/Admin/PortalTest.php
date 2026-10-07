<?php

use App\Models\Court;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

test('admins can create a court', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.courts.store'), [
            'name' => 'Court Test',
            'surface' => 'Indoor',
            'price_per_hour' => 500,
        ])
        ->assertRedirect();

    expect(Court::where('name', 'Court Test')->firstOrFail()->price_per_hour)->toBe('500.00');
});

test('admins can open court management', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('admin.courts'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/courts')
            ->where('courts.0.name', 'Court 1')
        );
});

test('admins can browse reservation pages and completed reservations cannot be changed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $member = User::factory()->create();
    $court = Court::firstOrFail();

    foreach (range(1, 21) as $number) {
        Reservation::create([
            'user_id' => $member->id,
            'court_id' => $court->id,
            'start_at' => now()->addDays($number)->setTime(9, 0),
            'end_at' => now()->addDays($number)->setTime(10, 0),
            'status' => 'pending',
            'amount' => 350,
        ]);
    }

    $completed = Reservation::firstOrFail();
    $completed->update(['status' => 'completed']);

    $this->actingAs($admin)
        ->get(route('admin.reservations'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/reservations')
            ->has('reservations.data', 20)
            ->has('reservations.links')
        );

    $this->actingAs($admin)
        ->get(route('admin.reservations', ['page' => 2]))
        ->assertInertia(fn ($page) => $page
            ->component('admin/reservations')
            ->has('reservations.data', 1)
            ->where('reservations.data.0.id', $completed->id)
        );

    $this->actingAs($admin)
        ->patch(route('admin.reservations.update', $completed), ['status' => 'cancelled'])
        ->assertSessionHasErrors('status');

    expect($completed->fresh()->status)->toBe('completed');
});

test('admins can record an offline payment', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    $reservation = Reservation::create([
        'user_id' => $member->id,
        'court_id' => $court->id,
        'start_at' => now()->addDay()->setTime(9, 0),
        'end_at' => now()->addDay()->setTime(10, 0),
        'status' => 'confirmed',
        'amount' => 350,
    ]);
    $payment = Payment::create([
        'user_id' => $member->id,
        'reservation_id' => $reservation->id,
        'amount' => 350,
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.payments.update', $payment), [
            'status' => 'paid',
            'method' => 'cash',
        ])
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe('paid')
        ->and($payment->fresh()->method)->toBe('cash')
        ->and($reservation->fresh()->status)->toBe('completed')
        ->and($payment->fresh()->reference)->toStartWith('OFFLINE-'.$payment->id);
});

test('admins can save facility hours that constrain customer bookings', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->patch(route('admin.settings.update'), [
            'center_name' => 'Astron Pickleball Center',
            'location' => 'Abuyog, Leyte',
            'opening_time' => '07:00',
            'closing_time' => '21:00',
            'cancellation_hours' => 8,
        ])
        ->assertRedirect();

    $this->actingAs(User::factory()->create())
        ->get(route('bookings'))
        ->assertInertia(fn ($page) => $page
            ->component('bookings')
            ->where('openingTime', '07:00')
            ->where('closingTime', '21:00')
        );
});
