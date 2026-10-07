<?php

use App\Models\Court;
use App\Models\Reservation;
use App\Models\User;

beforeEach(function () {
    $this->withoutVite();
});

test('a member can reserve an available court and gets a pending payment record', function () {
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    $date = now()->addDay()->toDateString();

    $this->actingAs($member)
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'date' => $date,
            'start_time' => '09:00',
            'duration' => 1,
        ])
        ->assertRedirect(route('reservations'));

    $reservation = Reservation::where('user_id', $member->id)->firstOrFail();

    expect((float) $reservation->amount)->toBe(350.0)
        ->and($reservation->status)->toBe('pending')
        ->and($reservation->start_at->format('H:i'))->toBe('09:00')
        ->and($reservation->end_at->format('H:i'))->toBe('10:00')
        ->and($reservation->payment->status)->toBe('pending');

    $this->actingAs($member)
        ->get(route('reservations'))
        ->assertInertia(fn ($page) => $page
            ->component('reservations')
            ->where('reservations.0.id', $reservation->id)
        );
});

test('members can view active courts with their current rates', function () {
    $member = User::factory()->create();

    $this->actingAs($member)
        ->get(route('courts'))
        ->assertInertia(fn ($page) => $page
            ->component('courts')
            ->has('courts', 4)
            ->where('courts.0.name', 'Court 1')
            ->where('courts.0.price_per_hour', '350.00')
            ->where('location', 'Astron Pickleball Center, Abuyog, Leyte')
        );
});

test('overlapping reservations for the same court and time are rejected', function () {
    $member = User::factory()->create();
    $court = Court::firstOrFail();
    $booking = [
        'court_id' => $court->id,
        'date' => now()->addDay()->toDateString(),
        'start_time' => '09:00',
        'duration' => 2,
    ];

    $this->actingAs($member)->post(route('bookings.store'), $booking)->assertRedirect(route('reservations'));
    $this->post(route('bookings.store'), [...$booking, 'start_time' => '10:00'])
        ->assertSessionHasErrors('start_time');

    expect(Reservation::where('court_id', $court->id)->count())->toBe(1);
});

test('members can only see and cancel their own future reservations', function () {
    $member = User::factory()->create();
    $otherMember = User::factory()->create();
    $court = Court::firstOrFail();
    $reservation = Reservation::create([
        'user_id' => $member->id,
        'court_id' => $court->id,
        'start_at' => now()->addDay()->setTime(9, 0),
        'end_at' => now()->addDay()->setTime(10, 0),
        'status' => 'confirmed',
        'amount' => 350,
    ]);
    $member->payments()->create([
        'reservation_id' => $reservation->id,
        'amount' => 350,
        'status' => 'pending',
    ]);

    $this->actingAs($otherMember)
        ->delete(route('reservations.cancel', $reservation))
        ->assertNotFound();

    $this->actingAs($member)
        ->delete(route('reservations.cancel', $reservation))
        ->assertRedirect(route('reservations'));

    expect($reservation->fresh()->status)->toBe('cancelled')
        ->and($reservation->payment->fresh()->status)->toBe('cancelled');
});

test('members cannot access admin operations', function () {
    $member = User::factory()->create();

    $this->actingAs($member)
        ->get(route('admin.courts'))
        ->assertForbidden();
});
