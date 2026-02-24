<?php

namespace App\Http\Controllers;

use App\Enums\SystemSettingKeys;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SystemSettingsController extends Controller
{

    public function getPublicSystemSettings(Request $request): JsonResponse
    {
        $settings = SystemSetting::query()
            ->whereIn("key", [
                SystemSettingKeys::SETUP_STAGE,
                SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED,
                SystemSettingKeys::LANGUAGE,
                SystemSettingKeys::APP_NAME,
                SystemSettingKeys::ALLOW_SENDING_CHAT_FILES,
                SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES,
                SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE,
                SystemSettingKeys::ALLOW_USER_SIGNUP,
                SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE,
            ])
            ->select(["key", "value"])
            ->get();

        return jsonResponse([
            "settings" => $settings
        ]);
    }


    public function getSystemSettings(Request $request): JsonResponse
    {

        Gate::authorize("viewAny", SystemSetting::class);

        $settings = SystemSetting::query()
            ->whereIn("key", [
//                SystemSettingKeys::LANGUAGE,
                SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED,
                SystemSettingKeys::ALLOW_SENDING_CHAT_FILES,
                SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES,
                SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE,
                SystemSettingKeys::ALLOW_USER_SIGNUP,
                SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE,
                SystemSettingKeys::USER_TOKEN_TTL,
//                SystemSettingKeys::PRIMARY_COLOR,
//                SystemSettingKeys::APP_NAME,
//                SystemSettingKeys::STEALTH_MODE_ACTIVATED,
//                SystemSettingKeys::ENCRYPTION_ACTIVATED,
            ])->get();

        return jsonResponse([
            "settings" => $settings
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function setSystemSettings(Request $request): JsonResponse
    {

        $validator = Validator::make($request->all(), [
            SystemSettingKeys::LANGUAGE->value => "nullable|string",
            SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED->value => "nullable|string",
            SystemSettingKeys::ALLOW_SENDING_CHAT_FILES->value => "nullable|string",
            SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES->value => "nullable|string",
            SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE->value => "nullable|string",
            SystemSettingKeys::ALLOW_USER_SIGNUP->value => "nullable|string",
            SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE->value => "nullable|string",
            SystemSettingKeys::USER_TOKEN_TTL->value => "nullable|string",
//                SystemSettingKeys::PRIMARY_COLOR,
//                SystemSettingKeys::APP_NAME,
//                SystemSettingKeys::STEALTH_MODE_ACTIVATED,
//                SystemSettingKeys::ENCRYPTION_ACTIVATED,
        ]);

        Gate::authorize("updateAny", SystemSetting::class);

        $inputSettings = $validator->validated();
        foreach ($inputSettings as $key => $value) {
            if ($value == null)
                continue;
            $settingEnum = SystemSettingKeys::from($key);
            SystemSetting::set($settingEnum, $value);
        }

        return jsonResponse();
    }

}
