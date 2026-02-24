<?php

return [

    /*
    |
    | The following language lines contain the messages and strings used by
    | the startup system.
    |
    */

    "messages" => [
        'db_not_configured' => 'دیتابیس پیکربندی نشده است.',
        'db_miss_configuration' => 'پیکربندی دیتابیس ناقص است — اتصال برقرار نشد.',
        'db_not_migrated' => 'دیتابیس به‌طور کامل مایگریت نشده است.',
        'db_not_seeded' => 'دیتابیس به‌طور کامل سید نشده است.',
        'something_is_wrong' => 'مشکلی در فرایند راه‌اندازی پیش آمده است.',
        'env_file_template_not_exists' => 'فایل قالب محیط (.env.template) وجود ندارد.',
        'env_file_not_exists' => 'فایل محیط (.env) وجود ندارد.',
        'env_file_template_not_readable' => 'فایل قالب محیط قابل خواندن نیست. دسترسی خواندن را بررسی کنید.',
        'env_file_not_writeable' => 'فایل محیط قابل نوشتن نیست. دسترسی نوشتن و مجوزها را بررسی کنید.',
        'configs_saved_successfully' => 'تنظیمات با موفقیت ذخیره شد.',
        'db_connection_made' => 'دیتابیس و فایل env درست کار می‌کنند.',
        'db_migrated_and_seeded' => 'مایگریت و سید دیتابیس انجام شد.',
        'user_name_already_exists' => 'کاربری با این نام کاربری از قبل وجود دارد.',
        'app_is_ready' => 'همه‌چیز آماده است! از برنامه لذت ببرید :)',
        'startup_status_not_found' => 'وضعیت راه‌اندازی و مرحله فعلی یافت نشد. احتمالاً باگ است.',
        'startup_is_not_launched_yet' => 'راه‌اندازی هنوز کامل نشده و برنامه آماده استفاده نیست.',
        'startup_is_not_in_right_stage' => 'راه‌اندازی در مرحله درست نیست. مراحل قبل را تکمیل کنید.',
        'lock_file_not_exists' => 'فایل gc.lock وجود نداشت.',
        'lock_file_not_readable' => 'فایل gc.lock قابل خواندن نیست. دسترسی را بررسی کنید.',
        'lock_file_not_writable' => 'فایل gc.lock قابل نوشتن نیست. دسترسی را بررسی کنید.',
        'lock_file_startup_ts_nan' => 'مقدار ذخیره‌شده در فایل gc.lock عدد معتبر نیست.',
        'no_startup_routes_access' => 'راه‌اندازی قبلاً انجام شده و به این مسیرها دسترسی ندارید.',
        'unsupported_php_version' => 'این کد حداقل به نسخه ۸.۲ PHP نیاز دارد.',
        'startup_locked_at' => 'راه‌اندازی در تاریخ :date قفل شده است',
        'connection_succeeded' => 'اتصال به دیتابیس برقرار شد.',
        'db_connection_not_set' => 'نوع اتصال دیتابیس تنظیم نشده است.',
        'db_name_not_set' => 'نام دیتابیس تنظیم نشده است.',
        'db_configs_all_set' => 'تنظیمات دیتابیس کامل است.',
        'db_host_not_set' => 'میزبان دیتابیس تنظیم نشده است.',
        'db_port_not_set' => 'پورت دیتابیس تنظیم نشده است.',
        'db_username_not_set' => 'نام کاربری دیتابیس تنظیم نشده است.',
        'db_password_not_set' => 'رمز عبور دیتابیس تنظیم نشده است.',
        'migration_not_completed' => 'مایگریت کامل نشده است.',
        'all_tables_ready' => 'همه جداول آماده هستند.',
        'database_seed_not_completed' => 'سید دیتابیس کامل نشده است.',
        'all_seeders_done' => 'همه سیدرها اجرا شده‌اند.',
        'env_file_saved_successfully' => 'فایل محیط با موفقیت ذخیره شد.',
        'debug_mode_disabled_successfully' => 'حالت دیباگ غیرفعال شد.',
        'cleared' => 'پاکسازی شد.',
        'migrated' => 'مایگریت انجام شد.',
        'seeded' => 'سید انجام شد.',
        'lock_file_saved_successfully' => 'فایل قفل با موفقیت ذخیره شد.',
        'storage_linked_successfully' => 'لینک storage با موفقیت ایجاد شد.',
        'db_engine_not_supported_by_php' => "دیتابیس :engine در تنظیمات PHP شما فعال نیست."
    ],

];
