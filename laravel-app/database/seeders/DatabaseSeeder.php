<?php

namespace Database\Seeders;

use App\Enums\StartupStages;
use App\Enums\SystemSettingKeys;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        SystemSetting::query()->insert([
            ["key" => SystemSettingKeys::SETUP_STAGE, "value" => StartupStages::STAGE_4_DB_SEEDED->value],
            ["key" => SystemSettingKeys::LANGUAGE, "value" => "en"],
            ["key" => SystemSettingKeys::PRIMARY_COLOR, "value" => "#f00"],
            ["key" => SystemSettingKeys::APP_NAME, "value" => "GeekChat"],
            ["key" => SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED, "value" => "true"],
            ["key" => SystemSettingKeys::ALLOW_SENDING_CHAT_FILES, "value" => "true"],
            ["key" => SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES, "value" => "jpg,jpeg,png,gif,mp4,zip,rar,mp3"],
            ["key" => SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE, "value" => "50000"],
            ["key" => SystemSettingKeys::STEALTH_MODE_ACTIVATED, "value" => "false"],
            ["key" => SystemSettingKeys::ALLOW_USER_SIGNUP, "value" => "true"],
            ["key" => SystemSettingKeys::ENCRYPTION_ACTIVATED, "value" => "true"],
            ["key" => SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE, "value" => "5000"],
            ["key" => SystemSettingKeys::SEEDER_CHECK, "value" => "true"],
            ["key" => SystemSettingKeys::USER_TOKEN_TTL, "value" => "2592000"],
        ]);

    }

}
