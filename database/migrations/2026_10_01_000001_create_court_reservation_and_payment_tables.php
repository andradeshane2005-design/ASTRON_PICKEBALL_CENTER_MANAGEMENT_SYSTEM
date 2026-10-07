<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable();
        });

        Schema::create('courts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('surface')->default('Outdoor');
            $table->decimal('price_per_hour', 8, 2)->default(350);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        DB::table('courts')->insert(collect(range(1, 4))->map(fn (int $number) => [
            'name' => 'Court '.$number,
            'surface' => 'Outdoor',
            'price_per_hour' => 350,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ])->all());

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('court_id')->constrained()->restrictOnDelete();
            $table->dateTime('start_at')->index();
            $table->dateTime('end_at');
            $table->string('status')->default('confirmed')->index();
            $table->decimal('amount', 8, 2);
            $table->timestamps();
            $table->index(['court_id', 'start_at', 'end_at']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reservation_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->string('status')->default('pending')->index();
            $table->string('method')->nullable();
            $table->string('reference')->nullable()->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('courts');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
        });
    }
};
