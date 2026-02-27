<?php

namespace App\Http\Controllers;

use App\Enums\StartupStages;
use App\Enums\SystemSettingKeys;
use App\Helpers\SystemConstants;
use App\Models\Admin;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\StartupServices;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StartupController extends Controller
{

    protected StartupServices $services;

    public function __construct()
    {
        $this->services = new StartupServices();
    }

    public function getStartupStage(Request $request): JsonResponse
    {
        $stage = $this->services->getCurrentStartupStage();

        if (!$stage)
            return jsonResponse([
                "stage" => null
            ], status: false, message: __("startup.messages.something_is_wrong"));

        return jsonResponse([
            "stage" => $stage->value
        ]);

    }

    public function checkRequirements(Request $request): JsonResponse
    {
        $result = $this->services->checkSystemRequirements();

        return jsonResponse([
            "messages" => $result["messages"],
        ], status: $result["status"]);
    }

    public function setupEnvConfiguration(Request $request): JsonResponse
    {
        $request->validate([
            "engine" => "required|in:mysql,pgsql,sqlsrv,sqlite",
            "host" => "nullable|required_if:engine,mysql,pgsql,sqlsrv|string",
            "port" => "nullable|required_if:engine,mysql,pgsql,sqlsrv|integer|between:1,65535",
            "database" => "nullable|required_if:engine,mysql,pgsql,sqlsrv|string",
            "username" => "nullable|required_if:engine,mysql,pgsql,sqlsrv|string",
            "password" => "nullable|string",
            "language" => ["required", Rule::in(SystemConstants::SUPPORTED_LANGUAGES)],
        ]);

        $configResult = $this->services->configEnv(
            $request->get("engine"),
            $request->get("host"),
            $request->get("port"),
            $request->get("database"),
            $request->get("username"),
            $request->get("password"),
            $request->getHttpHost(),
            $request->get("language")
        );

        if (!$configResult["status"]) {
            return jsonResponse(status: false, message: __("startup.messages.something_is_wrong") . ": " . $configResult["message"]);
        }

        return jsonResponse(message: __("startup.messages.configs_saved_successfully"));
    }

    public function checkEnvConfiguration(Request $request): JsonResponse
    {
        $configCheckResult = $this->services->checkSystemRequirements();
        if (!$configCheckResult["status"])
            return jsonResponse([
                'stage' => StartupStages::STAGE_0_IDLE->value
            ], status: false, message: $configCheckResult["messages"][0] ?? __("startup.messages.something_is_wrong"));

        $dbCheckResult = $this->services->checkDatabaseConnection();
        if (!$dbCheckResult["status"])
            return jsonResponse([
                'stage' => StartupStages::STAGE_1_ENV_CONFIGURED->value
            ], status: false, message: $dbCheckResult["message"]);

        return jsonResponse(message: __("startup.messages.db_connection_made"));
    }

    public function migrateAndSeedDatabase(Request $request): JsonResponse
    {

        if (!$this->services->checkDatabaseConfiguration()["status"])
            return jsonResponse(status: false, message: __("startup.messages.db_not_configured"));

        if (!$this->services->checkDatabaseMigration()["status"]) {
            $result = $this->services->migrateDatabase();
            if (!$result["status"]) {
                return jsonResponse(status: false, message: __("startup.messages.something_is_wrong") . ": " . $result["message"]);
            }
        }

        if (!$this->services->checkDatabaseSeeding()["status"]) {
            $result = $this->services->seedDatabase();
            if (!$result["status"]) {
                return jsonResponse(status: false, message: __("startup.messages.something_is_wrong") . ": " . $result["message"]);
            }
        }

        $result = $this->services->disableDebugMode();
        if (!$result["status"]) {
            return jsonResponse(status: false, message: __("startup.messages.something_is_wrong") . ": " . $result["message"]);
        }

        $result = $this->services->clearConfigCache();
        if (!$result["status"]) {
            return jsonResponse(status: false, message: __("startup.messages.something_is_wrong") . ": " . $result["message"]);
        }

        SystemSetting::set(SystemSettingKeys::SETUP_STAGE, StartupStages::STAGE_4_DB_SEEDED->value);

        return jsonResponse(message: __("startup.messages.db_migrated_and_seeded"));
    }

    public function setupAdminUserAndFinalizeStartup(Request $request): JsonResponse
    {
        if ($this->services->getCurrentStartupStage() != StartupStages::STAGE_4_DB_SEEDED)
            return jsonResponse(status: false, message: __("startup.messages.startup_is_not_in_right_stage"));

        $request->validate([
            "user_name" => "required|string|between:4,100",
            "password" => "required|string|between:8,255",
        ]);

        $existing = User::query()
            ->where("user_name", $request->get("user_name"))
            ->first();

        if ($existing) {
            return jsonResponse(status: false, message: __("startup.messages.user_name_already_exists"));
        }

        $user = User::query()->create([
            "public_name" => $request->get("user_name"),
            "user_name" => $request->get("user_name"),
            "password" => Hash::make($request->get("password")),
            "preferences" => [],
            "phone_verified_at" => Carbon::now(),
            "last_seen_at" => Carbon::now(),
        ]);

        Admin::query()->create([
            "user_id" => $user->id,
        ]);

        SystemSetting::set(SystemSettingKeys::SETUP_STAGE, StartupStages::STAGE_FINAL_APP_READY->value);

        SystemSetting::set(SystemSettingKeys::LANGUAGE, env("APP_LOCALE"));

        $this->services->handlePostConfiguration();

        $this->services->handleStorageFolderLink();

        $this->services->cacheConfig();

        return jsonResponse(message: __("startup.messages.app_is_ready"));

    }

}
