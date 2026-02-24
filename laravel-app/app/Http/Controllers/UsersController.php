<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class UsersController extends Controller
{
    public function __construct(
        protected UserManagementService $userManagement
    ) {
    }

    /**
     * List all users with pagination (admin).
     */
    public function getAllUsers(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $perPage = $request->integer('per_page', UserManagementService::DEFAULT_PER_PAGE);
        $search = $request->string('search')->trim() ?: null;

        $paginator = $this->userManagement->getPaginatedUsers($perPage, $search);

        return jsonResponse([
            'users' => $paginator->makeVisible([
                "is_banned",
                "last_seen_at",
            ])->toArray(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Get a single user by id (admin).
     */
    public function getUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = $this->userManagement->findUser((int) $validated['user_id']);
        if ($user === null) {
            return jsonResponse([], false, __("admin.user_not_found"), 404);
        }

        Gate::authorize('view', $user);

        return jsonResponse([
            'user' => $user,
        ]);
    }

    /**
     * Create a new user (admin only).
     *
     * @throws ValidationException
     */
    public function createUser(Request $request): JsonResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'public_name' => 'nullable|string|max:255',
            'user_name' => 'required|string|max:255|unique:users,user_name',
            'password' => 'required|string|between:8,255',
            'preferences' => 'nullable|array',
        ]);

        $user = $this->userManagement->createUser($validated);

        return jsonResponse([
            'user' => $user,
        ], true, __("global-messages.success"), 201);
    }

    /**
     * Update an existing user (admin).
     *
     * @throws ValidationException
     */
    public function updateUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'public_name' => 'nullable|string|max:255',
            'user_name' => 'sometimes|string|max:255|unique:users,user_name,' . $request->input('user_id'),
            'password' => 'nullable|string|between:8,255',
            'preferences' => 'nullable|array',
            'bio_text' => 'nullable|string',
        ]);

        $user = $this->userManagement->findUser((int) $validated['user_id']);
        if ($user === null) {
            return jsonResponse([], false, __("admin.user_not_found"), 404);
        }

        Gate::authorize('update', $user);

        $payload = array_diff_key($validated, array_flip(['user_id']));
        $user = $this->userManagement->updateUser($user, $payload);

        return jsonResponse([
            'user' => $user,
        ]);
    }

    /**
     * Delete a user (admin only).
     *
     * @throws ValidationException
     */
    public function deleteUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = $this->userManagement->findUser((int) $validated['user_id']);
        if ($user === null) {
            return jsonResponse([], false, __("admin.user_not_found"), 404);
        }

        Gate::authorize('delete', $user);

        $this->userManagement->deleteUser($user);

        return jsonResponse([], true, __("admin.user_deleted"));
    }

    /**
     * Ban a user (admin only).
     *
     * @throws ValidationException
     */
    public function banUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = $this->userManagement->findUser((int) $validated['user_id']);
        if ($user === null) {
            return jsonResponse([], false, __("admin.user_not_found"), 404);
        }

        Gate::authorize('ban', $user);

        $user = $this->userManagement->banUser($user);

        return jsonResponse([
            'user' => $user,
        ]);
    }

    /**
     * Unban a user (admin only).
     *
     * @throws ValidationException
     */
    public function unbanUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = $this->userManagement->findUser((int) $validated['user_id']);
        if ($user === null) {
            return jsonResponse([], false, __("admin.user_not_found"), 404);
        }

        Gate::authorize('ban', $user);

        $user = $this->userManagement->unbanUser($user);

        return jsonResponse([
            'user' => $user,
        ]);
    }
}
