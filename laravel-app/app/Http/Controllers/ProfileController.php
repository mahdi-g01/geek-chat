<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ProfileServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{

    protected ProfileServices $profileServices;

    public function __construct()
    {
        $this->profileServices = new ProfileServices();
    }

    /**
     * @throws ValidationException
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|mimes:jpeg,jpg,png,webp|max:2048'
        ]);

        $requestUserId = Auth::id();
        $user = User::query()->findOrFail($requestUserId);

        Gate::authorize("update", $user);

        $image = $validator->validated()["image"];

        $this->profileServices->deleteAllUserAvatars($user);

        $fileStoreResults = $this->profileServices->changeUserAvatar($image, $user);

        if ($fileStoreResults)
            return jsonResponse();
        else
            return jsonResponse(status: false, message: __("profile-management.failed_avatar_update"), code: 500);
    }

    /**
     * @throws ValidationException
     */
    public function updateInfo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'public_name' => 'nullable|string|min:2|max:255',
            'bio_text' => 'nullable|string|min:2|max:1000',
        ]);

        $requestUserId = Auth::id();
        $user = User::query()->findOrFail($requestUserId);
        $validated = $validator->validated();

        Gate::authorize("update", $user);

        $changes = [];

        if ($request->has('public_name')) {
            $changes["public_name"] = $validated["public_name"];
        }

        if ($request->has('bio_text')) {
            $changes["bio_text"] = $validated["bio_text"];
        }

        $user->update($changes);

        return jsonResponse();
    }


}
