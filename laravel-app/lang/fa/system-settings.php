<?php

use App\Enums\SystemSettingKeys;

return [

    /*
    |
    | The following language lines are used for system setting keys titles
    |
    */

    SystemSettingKeys::SETUP_STAGE->value => 'وضعیت راه‌اندازی',
    SystemSettingKeys::LANGUAGE->value => 'زبان برنامه',
    SystemSettingKeys::PRIMARY_COLOR->value => 'رنگ اصلی برنامه',
    SystemSettingKeys::APP_NAME->value => 'نام برنامه',
    SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED->value => 'فعال‌سازی کپچا برای ورود و ثبت نام',
    SystemSettingKeys::ALLOW_SENDING_CHAT_FILES->value => 'ارسال فایل در چت',
    SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES->value => 'فرمت‌های مجاز فایل در چت (جداسازی با ، بدون فاصله)',
    SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE->value => 'حداکثر حجم فایل در چت (کیلوبایت)',
    SystemSettingKeys::STEALTH_MODE_ACTIVATED->value => 'فعال‌سازی حالت استتار',
    SystemSettingKeys::ALLOW_USER_SIGNUP->value => 'امکان ثبت نام در صفحه ورود',
    SystemSettingKeys::ENCRYPTION_ACTIVATED->value => 'فعال‌سازی چت‌های رمزنگاری‌ شده',
    SystemSettingKeys::CHAT_SOFT_REFRESH_THROTTLE_RATE->value => 'نرخ به‌روزرسانی زنده چت (میلی ثانیه)',
    SystemSettingKeys::SEEDER_CHECK->value => 'seeder_check',
    SystemSettingKeys::USER_TOKEN_TTL->value => 'مدت اعتبار توکن کاربر (ثانیه)',

];
