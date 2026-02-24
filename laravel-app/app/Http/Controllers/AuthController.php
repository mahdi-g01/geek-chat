<?php

namespace App\Http\Controllers;

use App\Enums\SystemSettingKeys;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\DeviceManagerService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{

    protected DeviceManagerService $deviceManager;

    public function __construct(DeviceManagerService $deviceManager)
    {
        $this->deviceManager = $deviceManager;
    }

    public function checkIfAuthNeedsCaptcha(Request $request): JsonResponse
    {
        return jsonResponse([
            "auth_needs_captcha" => SystemSetting::get(SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED),
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_name' => 'required|string',
            'password' => 'required|string',
            'public_key' => 'required|string',
            'device_name' => 'nullable|string|max:255',
            'device_type' => 'nullable|string|max:64',
        ]);

        $validated = $validator->validated();

        if (!Auth::attempt($request->only("user_name", "password")))
            return jsonResponse([], false, __("auth.failed"), 401);

        $user = User::query()->where("user_name", $validated["user_name"])->first();

        $this->deviceManager->ensureDeviceForUser(
            $user->id,
            $validated["public_key"],
            $validated["device_name"] ?? null,
            $validated["device_type"] ?? null
        );

        $tokenTTL = Carbon::now()->addSeconds(
            intval(SystemSetting::get(SystemSettingKeys::USER_TOKEN_TTL, "2592000"))
        )->toDate();

        $token = $user->createToken('authToken', expiresAt: $tokenTTL)->plainTextToken;

        return jsonResponse([
            "token" => $token,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function signup(Request $request): JsonResponse
    {
        // Here we check if admin allowed users signup or not
        $signupAllowed = SystemSetting::get(SystemSettingKeys::ALLOW_USER_SIGNUP, false);

        if (!$signupAllowed)
            abort(403);

        $validator = Validator::make($request->all(), [
            "public_name" => "required|string|",
            "user_name" => "required|string|unique:users",
            "password" => "required|string|between:8,255",
            'public_key' => 'required|string',
            'device_name' => 'nullable|string|max:255',
            'device_type' => 'nullable|string|max:64',
        ]);

        $validated = $validator->validated();

        $user = User::query()->create([
            "public_name" => $validated["public_name"],
            "user_name" => $validated["user_name"],
            "password" => Hash::make($validated["password"]),
            "preferences" => [],
            "phone_verified_at" => Carbon::now(),
            "last_seen_at" => Carbon::now(),
        ]);

        $this->deviceManager->ensureDeviceForUser(
            $user->id,
            $validated["public_key"],
            $validated["device_name"] ?? null,
            $validated["device_type"] ?? null
        );

        $tokenTTL = Carbon::now()->addSeconds(
            intval(SystemSetting::get(SystemSettingKeys::USER_TOKEN_TTL, "2592000"))
        )->toDate();

        $token = $user->createToken('authToken', expiresAt: $tokenTTL)->plainTextToken;

        return jsonResponse([
            "token" => $token,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function logout(Request $request): JsonResponse
    {
        if (!Auth::check())
            abort(401);

        $validator = Validator::make($request->all(), [
            'public_key' => 'required|string',
        ]);

        $validated = $validator->validated();
        $publicKey = $validated["public_key"];
        $user = User::query()->find(Auth::id());

        if (!empty($publicKey)) {
            $this->deviceManager->removeDeviceForUser($user->id, $publicKey);
        }

        $user->tokens()->delete(
            $user->currentAccessToken()
        );

        return jsonResponse();
    }

    /**
     * Logout user
     */
    public function check(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            abort(401);
        }

        $user = User::query()->find(Auth::id());
        $isAdmin = $user->isAdmin();

        return jsonResponse([
            "user" => [
                "id" => $user->id,
                "user_name" => $user->user_name,
                "public_name" => $user->public_name,
                "phone_number" => $user->phone_number,
                "avatar_url" => $user->avatar_url,
                "is_admin" => $isAdmin,
                "bio_text" => $user->bio_text,
            ]
        ]);
    }

}
