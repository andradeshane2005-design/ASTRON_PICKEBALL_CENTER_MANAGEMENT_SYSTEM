<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'app:make-admin {email : The account email address}';

    protected $description = 'Grant administrator access to an existing account';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if ($user === null) {
            $this->components->error('No account exists with that email address.');

            return self::FAILURE;
        }

        $user->forceFill(['role' => 'admin'])->save();
        $this->components->info("Administrator access granted to {$user->email}.");

        return self::SUCCESS;
    }
}
