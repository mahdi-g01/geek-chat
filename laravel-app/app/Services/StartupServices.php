<?php

namespace App\Services;

use App\Enums\StartupStages;
use App\Enums\SystemSettingKeys;
use App\Helpers\SystemConstants;
use App\Models\SystemSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use JetBrains\PhpStorm\ArrayShape;
use Random\RandomException;

class StartupServices
{

    protected const LOCK_FILE_NAME = "gc.lock";
    protected const LOCK_TIMESTAMP_VAR_NAME = "STARTUP_LOCKED_AT";

    public function getCurrentStartupStage(): StartupStages|null
    {
        $services = $this;

        if ($services->checkStartupLockedWithFile()["status"])
            return StartupStages::STAGE_FINAL_APP_READY;

        if (!$services->checkDatabaseConfiguration()["status"])
            return StartupStages::STAGE_0_IDLE;

        if (!$services->checkDatabaseConnection()["status"])
            return StartupStages::STAGE_1_ENV_CONFIGURED;

        if (!$services->checkDatabaseMigration()["status"])
            return StartupStages::STAGE_2_DB_CONNECTED;

        if (!$services->checkDatabaseSeeding()["status"])
            return StartupStages::STAGE_3_DB_MIGRATED;

        $stageSetting = SystemSetting::get(SystemSettingKeys::SETUP_STAGE);

        if (!$stageSetting)
            return null;

        return StartupStages::tryFrom($stageSetting);

    }

    #[ArrayShape(['status' => "boolean", 'messages' => "array"])]
    public function checkSystemRequirements(): array
    {
        try {

            $status = true;
            $messages = [];

            // Checking PHP version
            $current = (float)phpversion();
            $required = SystemConstants::SUPPORTED_PHP_VERSION;
            if ($current < $required) {
                $status = false;
                $messages[] = __("startup.unsupported_php_version");
            }

            return [
                "status" => $status,
                "messages" => $messages,
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "messages" => [
                    $e->getMessage()
                ]
            ];
        }

    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function checkStartupLockedWithFile(): array
    {
        try {

            // Check the lock file that created after all stages are complete
            $lockFilePath = base_path($this::LOCK_FILE_NAME);

            if (!file_exists($lockFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.lock_file_not_exists"),
                ];
            }

            if (!is_readable($lockFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.lock_file_not_readable"),
                ];
            }

            $lockTimestamp = substr(
                file_get_contents($lockFilePath),
                strlen($this::LOCK_TIMESTAMP_VAR_NAME . "=")
            );

            $carbon = Carbon::createFromTimestampMs($lockTimestamp);

            if (!$carbon->isValid()) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.lock_file_startup_ts_nan"),
                ];
            }

            return [
                "status" => true,
                "message" => __("startup.messages.startup_locked_at", ["date" => $carbon->toDateTimeString()]),
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }

    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function checkDatabaseConnection(): array
    {
        try {

            $engine = env("DB_CONNECTION");
            if ($engine == "mysql" && (!extension_loaded("pdo_mysql") )) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_engine_not_supported_by_php", [
                        "engine" => $engine
                    ])
                ];
            }

            if ($engine == "pgsql" && (!extension_loaded("pdo_pgsql") )) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_engine_not_supported_by_php", [
                        "engine" => $engine
                    ])
                ];
            }

            if ($engine == "sqlite" && (!extension_loaded("pdo_sqlite") )) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_engine_not_supported_by_php", [
                        "engine" => $engine
                    ])
                ];
            }

            if ($engine == "sqlsrv" && (!extension_loaded("pdo_sqlsrv") )) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_engine_not_supported_by_php", [
                        "engine" => $engine
                    ])
                ];
            }


            DB::connection()->getServerVersion();
            return [
                "status" => true,
                "message" => __("startup.messages.connection_succeeded")
            ];
        } catch (\PDOException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function checkDatabaseConfiguration(): array
    {
        try {

            if (env("DB_CONNECTION") === null)
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_connection_not_set")
                ];

            if (env("DB_DATABASE") === null)
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_name_not_set")
                ];

            if (env("DB_CONNECTION") == "sqlite") {
                if (env("DB_DATABASE") == ":memory:") {
                    return [
                        "status" => false,
                        "message" => __("startup.messages.db_name_not_set")
                    ];
                } else
                    return [
                        "status" => true,
                        "message" => __("startup.messages.db_configs_all_set")
                    ];
            }

            if (env("DB_HOST") === null)
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_host_not_set")
                ];

            if (env("DB_PORT") === null)
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_port_not_set")
                ];

            if (env("DB_USERNAME") === null)
                return [
                    "status" => false,
                    "message" => __("startup.messages.db_username_not_set")
                ];

            return [
                "status" => true,
                "message" => __("startup.messages.db_configs_all_set")
            ];

        } catch (\PDOException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function checkDatabaseMigration(): array
    {
        try {

            // Here we check the last table in the migration files to see
            // if all the tables are created.

            if (!Schema::hasTable("chat_message_files"))
                return [
                    "status" => false,
                    "message" => __("startup.messages.migration_not_completed")
                ];

            return [
                "status" => true,
                "message" => __("startup.messages.all_tables_ready")
            ];

        } catch (\PDOException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function checkDatabaseSeeding(): array
    {
        try {

            // Here we check the last seeder to see
            // if all the tables are seeded well.

            $lastSeededRowExists = SystemSetting::get(SystemSettingKeys::SEEDER_CHECK);

            if (!$lastSeededRowExists)
                return [
                    "status" => false,
                    "message" => __("startup.messages.database_seed_not_completed")
                ];

            return [
                "status" => true,
                "message" => __("startup.messages.all_seeders_done")
            ];

        } catch (\PDOException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function configEnv(
        string $engine,
        string|null $host,
        string|null $port,
        string|null $dbName,
        string|null $userName,
        string|null $password,
        string $appUrl,
        string $appLang,
    ): array
    {

        try {

            // Check template file exists
            $templateFilePath = base_path(".env.template");
            $mainEnvFilePath = base_path(".env");
            $templateExists = file_exists($templateFilePath);
            if (!$templateExists) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.env_file_template_not_exists"),
                ];
            }

            if (!is_readable($templateFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.env_file_template_not_readable"),
                ];
            }

            $appKey = base64_encode(random_bytes(32));
            $oldEnvContent = file_get_contents($templateFilePath);
            $newContent = $oldEnvContent;

            // Here we create a SQLite file if user decided
            // Or just configure the database variables by user inputs

            if ($engine == "sqlite") {

                // Creating SQLite file
                $path = database_path("app-database.sqlite");
                file_put_contents($path, "");

                $newContent = str_replace("{db_engine}", $engine, $newContent);
                $newContent = str_replace("{db_name}", $path, $newContent);

            } else {

                // Here we know user want to set up a mysql, postgres or sql server
                // Config ENV variables
                $newContent = str_replace("{db_engine}", $engine, $newContent);
                $newContent = str_replace("{db_host}", $host, $newContent);
                $newContent = str_replace("{db_port}", $port, $newContent);
                $newContent = str_replace("{db_name}", $dbName, $newContent);
                $newContent = str_replace("{db_user}", $userName, $newContent);
                $newContent = str_replace("{db_password}", $password ?? "", $newContent);

            }

            $newContent = str_replace("{app_url}", "$appUrl/api/public", $newContent);
            $newContent = str_replace("{app_frontend}", $appUrl, $newContent);
            $newContent = str_replace("{app_language}", $appLang, $newContent);
            $newContent = str_replace("{app_key}", $appKey, $newContent);

            if (file_exists($mainEnvFilePath)) {

                if (!is_writable($mainEnvFilePath)) {
                    return [
                        "status" => false,
                        "message" => __("startup.messages.env_file_not_writeable"),
                    ];
                }

                file_put_contents($mainEnvFilePath, $newContent);

            } else {
                $file = fopen($mainEnvFilePath, "w");
                fwrite($file, $newContent);
                fclose($file);
            }

            return [
                "status" => true,
                "message" => __("startup.messages.env_file_saved_successfully")
            ];

        } catch (RandomException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function disableDebugMode(): array
    {

        try {

            // Check env file exists
            $mainEnvFilePath = base_path(".env");
            if (!$mainEnvFilePath) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.env_file_not_exists"),
                ];
            }

            $oldEnvContent = file_get_contents($mainEnvFilePath);
            $newContent = $oldEnvContent;
            $newContent = str_replace("APP_DEBUG=true", "APP_DEBUG=false", $newContent);
            $newContent = str_replace("APP_ENV=local", "APP_ENV=production", $newContent);

            if (!is_writable($mainEnvFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.env_file_not_writeable"),
                ];
            }

            $file = fopen($mainEnvFilePath, "w");
            fwrite($file, $newContent);
            fclose($file);

            return [
                "status" => true,
                "message" => __("startup.messages.debug_mode_disabled_successfully")
            ];

        } catch (RandomException $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function clearConfigCache(): array
    {
        try {

            Artisan::call("config:clear");

            return [
                "status" => true,
                "message" => __("startup.messages.cleared")
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function migrateDatabase(): array
    {
        try {

            Artisan::call("migrate:fresh", [
                '--no-interaction' => true,
                '--force' => true
            ]);

            return [
                "status" => true,
                "message" => __("startup.messages.migrated")
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function seedDatabase(): array
    {
        try {

            Artisan::call("db:seed", [
                "--force" => true
            ]);

            return [
                "status" => true,
                "message" => __("startup.messages.seeded")
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function handlePostConfiguration(): array
    {
        try {

            // Creating lock file after all stages are complete
            $lockFilePath = base_path($this::LOCK_FILE_NAME);
            $lockExists = file_exists($lockFilePath);

            if (!$lockExists) {
                $file = fopen($lockFilePath, "w");
                fwrite($file, "");
                fclose($file);
            }

            if (!is_readable($lockFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.lock_file_not_readable"),
                ];
            }

            if (!is_writable($lockFilePath)) {
                return [
                    "status" => false,
                    "message" => __("startup.messages.lock_file_not_writable"),
                ];
            }

            file_put_contents($lockFilePath, $this::LOCK_TIMESTAMP_VAR_NAME . "=" . Carbon::now()->getTimestampMs());

            return [
                "status" => true,
                "message" => __("startup.messages.lock_file_saved_successfully")
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }


    #[ArrayShape(['status' => "boolean", 'message' => "string"])]
    public function handleStorageFolderLink(): array
    {
        try {

            Artisan::call("storage:link");

            return [
                "status" => true,
                "message" => __("startup.messages.storage_linked_successfully")
            ];

        } catch (\Exception $e) {
            return [
                "status" => false,
                "message" => $e->getMessage()
            ];
        }
    }

}
