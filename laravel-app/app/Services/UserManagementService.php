<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserManagementService
{
    public const DEFAULT_PER_PAGE = 20;
    public const MAX_PER_PAGE = 100;

    /**
     * Get paginated users for admin listing.
     */
    public function getPaginatedUsers(int $perPage = self::DEFAULT_PER_PAGE, ?string $search = null): LengthAwarePaginator
    {
        $perPage = min(max((int) $perPage, 1), self::MAX_PER_PAGE);

        $query = User::query()->orderByDesc('created_at');

        if ($search !== null && trim($search) !== '') {
            $term = '%' . trim($search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('user_name', 'like', $term)
                    ->orWhere('public_name', 'like', $term);
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Find a user by id.
     */
    public function findUser(int $id): ?User
    {
        return User::query()->find($id);
    }

    /**
     * Create a new user (admin only).
     */
    public function createUser(array $data): User
    {
        $user = User::query()->create([
            'public_name' => $data['public_name'] ?? null,
            'user_name' => $data['user_name'],
            'password' => Hash::make($data['password']),
            'preferences' => $data['preferences'] ?? [],
        ]);

        return $user->fresh();
    }

    /**
     * Update an existing user.
     */
    public function updateUser(User $user, array $data): User
    {
        $update = [];

        if (array_key_exists('public_name', $data)) {
            $update['public_name'] = $data['public_name'];
        }
        if (array_key_exists('user_name', $data)) {
            $update['user_name'] = $data['user_name'];
        }
        if (!empty($data['password'])) {
            $update['password'] = Hash::make($data['password']);
        }
        if (array_key_exists('preferences', $data)) {
            $update['preferences'] = $data['preferences'];
        }
        if (array_key_exists('bio_text', $data)) {
            $update['bio_text'] = $data['bio_text'];
        }

        $user->update($update);

        return $user->fresh();
    }

    /**
     * Delete a user permanently.
     */
    public function deleteUser(User $user): void
    {
        $user->delete();
    }

    /**
     * Ban a user (admin only, cannot ban self or other admins).
     */
    public function banUser(User $user): User
    {
        $user->update([
            'is_banned' => true,
            'banned_at' => now(),
        ]);

        return $user->fresh();
    }

    /**
     * Unban a user.
     */
    public function unbanUser(User $user): User
    {
        $user->update([
            'is_banned' => false,
            'banned_at' => null,
        ]);

        return $user->fresh();
    }
}
