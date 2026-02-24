<?php

namespace App\Enums;

enum SystemSettingKeys: string
{

    case SETUP_STAGE = "setup_stage";
    case LANGUAGE = "language";
    case PRIMARY_COLOR = "primary_color";
    case APP_NAME = "app_name";
    case AUTH_CAPTCHA_ACTIVATED = "auth_captcha_activated";
    case ALLOW_SENDING_CHAT_FILES = "allow_sending_files";
    case ACCEPTED_CHAT_FILE_MIMES = "accepted_file_mimes";
    case MAXIMUM_CHAT_FILE_SIZE = "maximum_file_size";
    case STEALTH_MODE_ACTIVATED = "stealth_mode_activated";
    case ALLOW_USER_SIGNUP = "allow_user_signup";
    case ENCRYPTION_ACTIVATED = "encryption_activated";
    case CHAT_SOFT_REFRESH_THROTTLE_RATE = "chat_refresh_throttle_rate";
    case SEEDER_CHECK = "seeder_check";
    case USER_TOKEN_TTL = "user_token_ttl";

}
