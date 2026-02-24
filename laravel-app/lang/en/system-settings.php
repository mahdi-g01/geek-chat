<?php

use App\Enums\SystemSettingKeys;

return [

    /*
    |
    | The following language lines are used for system setting keys titles
    |
    */

    SystemSettingKeys::SETUP_STAGE->value => 'Setup stage',
    SystemSettingKeys::LANGUAGE->value => 'App language',
    SystemSettingKeys::PRIMARY_COLOR->value => 'Primary app color',
    SystemSettingKeys::APP_NAME->value => 'App name',
    SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED->value => 'Captcha activated for auth routes',
    SystemSettingKeys::ALLOW_SENDING_CHAT_FILES->value => 'Allow sending files in chat',
    SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES->value => 'Allowed mimes for chat files',
    SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE->value => 'Maximum file size allowed in chat (Kilobytes)',
    SystemSettingKeys::STEALTH_MODE_ACTIVATED->value => 'Activate stealth mode',
    SystemSettingKeys::ALLOW_USER_SIGNUP->value => 'Allow new users to signup manually',
    SystemSettingKeys::ENCRYPTION_ACTIVATED->value => 'Encrypted chats are activated',
    SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE->value => 'Live chat updates throttle rate (Milliseconds)',
    SystemSettingKeys::SEEDER_CHECK->value => 'seeder_check',
    SystemSettingKeys::USER_TOKEN_TTL->value => 'User token TTL (Seconds)',

];
