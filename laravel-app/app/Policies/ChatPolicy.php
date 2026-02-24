<?php

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

class ChatPolicy
{
    /**
     * Determine whether the user can view any models (e.g. list all chats for admin).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Chat $chat): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->is_banned)
            return false;
        return $this->checkUserIsChatMember($user, $chat);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        return !$user->is_banned;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Chat $chat): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->is_banned)
            return false;
        return $this->checkUserIsChatMember($user, $chat);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Chat $chat): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        if ($user->is_banned)
            return false;
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Chat $chat): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Chat $chat): bool
    {
        return false;
    }

    private function checkUserIsChatMember(User $user, Chat $chat): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        $members = $chat->relationLoaded("members") ? $chat->members : $chat->members()->get();
        $isMember = in_array($user->id, array_column($members->toArray(), 'user_id'));
        return $isMember;
    }

}
