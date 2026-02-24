<?php

return [

    /*
    |
    | The following language lines contain the messages and strings used by
    | the startup system.
    |
    */

    "messages" => [
        'db_not_configured' => 'Database not configured.',
        'db_miss_configuration' => 'Database miss configuration - Connection failed.',
        'db_not_migrated' => 'Database is not fully migrated.',
        'db_not_seeded' => 'Database is not seeded completely.',
        'something_is_wrong' => 'Something is wrong with startup process.',
        'env_file_template_not_exists' => 'The environment template file does not exists.',
        'env_file_not_exists' => 'The environment file does not exists.',
        'env_file_template_not_readable' => 'The environment template file is not readable. Make sure it is readable.',
        'env_file_not_writeable' => 'The environment file is not writeable. Make sure it is writeable and has correct permissions.',
        'configs_saved_successfully' => 'Configs saved successfully.',
        'db_connection_made' => 'Database and env file is well and working',
        'db_migrated_and_seeded' => 'Database is migrated and seeded.',
        'user_name_already_exists' => 'User with selected username already exists.',
        'app_is_ready' => 'All set up and app is ready to use! enjoy :)',
        'startup_status_not_found' => 'We could not find the startup status and current stage. It might be a bug.',
        'startup_is_not_launched_yet' => 'Startup procedure is not completed yet and app is not ready to use.',
        'startup_is_not_in_right_stage' => 'Startup procedure is not in the right stage. Please complete previous steps.',
        'lock_file_not_exists' => 'The gc.lock file not existed.',
        'lock_file_not_readable' => 'The gc.lock file is not readable. Make sure it is readable.',
        'lock_file_not_writable' => 'The gc.lock file is not writable. Make sure it is writable.',
        'lock_file_startup_ts_nan' => 'The saved timestamp on gc.lock file is not a number.',
        'no_startup_routes_access' => 'Startup is already configured and you dont have access to it.',
        'unsupported_php_version' => 'This source code needs at least version 8.2 of PHP.',
        'startup_locked_at' => 'Startup is locked at :date',
        'connection_succeeded' => 'Connection to database succeeded.',
        'db_connection_not_set' => 'DB connection is not set.',
        'db_name_not_set' => 'DB name is not set.',
        'db_configs_all_set' => 'DB configs are all set.',
        'db_host_not_set' => 'DB host is not set.',
        'db_port_not_set' => 'DB port is not set.',
        'db_username_not_set' => 'DB username is not set.',
        'db_password_not_set' => 'DB password is not set.',
        'migration_not_completed' => 'Migration is not completed.',
        'all_tables_ready' => 'All tables are ready.',
        'database_seed_not_completed' => 'Database seed is not completed.',
        'all_seeders_done' => 'All seeders are done.',
        'env_file_saved_successfully' => 'Env file saved successfully.',
        'debug_mode_disabled_successfully' => 'Debug mode disabled successfully.',
        'cleared' => 'Cleared.',
        'migrated' => 'Migrated.',
        'seeded' => 'Seeded.',
        'lock_file_saved_successfully' => 'Lock file saved successfully.',
        'storage_linked_successfully' => 'Storage linked successfully.',
        'db_engine_not_supported_by_php' => "The :engine is not supported by you php. Make sure their extention are active."
    ]


];
