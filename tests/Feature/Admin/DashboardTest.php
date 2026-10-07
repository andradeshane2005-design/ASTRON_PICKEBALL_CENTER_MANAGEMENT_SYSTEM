<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

test('guests are redirected to login from the admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('members are forbidden from the admin dashboard', function () {
    $member = User::factory()->create();

    $this->actingAs($member)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can view account metrics and recent accounts', function () {
    $this->withoutVite();

    $admin = User::factory()->create(['role' => 'admin']);
    $member = User::factory()->create([
        'role' => 'member',
        'email_verified_at' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/dashboard')
            ->where('metrics.accounts', 2)
            ->where('metrics.members', 1)
            ->where('metrics.administrators', 1)
            ->where('metrics.pendingVerification', 1)
            ->has('recentAccounts', 2)
            ->where('recentAccounts.0.id', $member->id)
        );
});

test('an existing account can be promoted to admin from the command line', function () {
    $user = User::factory()->create();

    $this->artisan('app:make-admin', ['email' => $user->email])
        ->assertSuccessful();

    expect($user->fresh()->role)->toBe('admin');
});

test('the admin provisioning command fails for an unknown account', function () {
    expect(Artisan::call('app:make-admin', ['email' => 'missing@example.com']))
        ->toBe(1);
});
