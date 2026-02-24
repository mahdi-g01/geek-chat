<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFaker
{
    /**
     * Create fake users. Does not run any seeders or change app behavior.
     *
     * @param int $count Number of users to create (default 100)
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    public function fake(int $count = 100): \Illuminate\Database\Eloquent\Collection
    {
        $users = collect();

        for ($i = 0; $i < $count; $i++) {
            $users->push($this->createOne());
        }

        return $users;
    }

    /**
     * Create a single fake user.
     */
    public function createOne(): User
    {
        $userName = fake()->userName() . '_' . Str::random(8);

        $isBanned = fake()->boolean(5);

        return User::query()->create([
            'public_name' => fake()->name(),
            'user_name' => $userName,
            'is_banned' => $isBanned,
            'password' => Hash::make('password'),
            'preferences' => $this->fakePreferences(),
            'phone_number' => fake()->optional(0.7)->numerify('09########'),
            'bio_text' => fake()->optional(0.6)->sentence(12),
            'avatar_file_path' => null,
            'phone_verified_at' => fake()->optional(0.8)->dateTimeThisYear(),
            'banned_at' => $isBanned ? fake()->dateTimeThisYear() : null,
            'last_seen_at' => fake()->optional(0.9)->dateTimeThisMonth(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function fakePreferences(): array
    {
        return [];
    }
}
