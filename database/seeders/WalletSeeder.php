<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class WalletSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->where('role', 'member')->chunkById(200, function ($users): void {
            foreach ($users as $user) {
                $user->wallet()->firstOrCreate([], ['balance' => 0, 'held_balance' => 0]);
            }
        });
    }
}
