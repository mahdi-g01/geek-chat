<?php

use App\Enums\SystemSettingKeys;

return [

    /*
    |
    | The following language lines are used for system setting keys titles
    |
    */

    SystemSettingKeys::SETUP_STAGE->value => 'مرحله راه‌اندازی',
    SystemSettingKeys::LANGUAGE->value => 'زبان برنامه',
    SystemSettingKeys::PRIMARY_COLOR->value => 'رنگ اصلی برنامه',
    SystemSettingKeys::APP_NAME->value => 'نام برنامه',
    SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED->value => 'فعال‌سازی کپچا برای مسیرهای احراز هویت',
    SystemSettingKeys::ALLOW_SENDING_CHAT_FILES->value => 'ارسال فایل در چت',
    SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES->value => 'فرمت‌های مجاز فایل در چت',
    SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE->value => 'حداکثر حجم فایل در چت',
    SystemSettingKeys::STEALTH_MODE_ACTIVATED->value => 'فعال‌سازی حالت استتار',
    SystemSettingKeys::ALLOW_USER_SIGNUP->value => 'ثبت‌نام دستی کاربران جدید',
    SystemSettingKeys::ENCRYPTION_ACTIVATED->value => 'فعال‌سازی چت‌های رمزنگاری‌شده',
    SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE->value => 'نرخ به‌روزرسانی زنده چت',
    SystemSettingKeys::SEEDER_CHECK->value => 'seeder_check',
    SystemSettingKeys::USER_TOKEN_TTL->value => 'مدت اعتبار توکن کاربر',

];
