<?php

namespace App\Http\Routes;

use App\Helpers\CaptchaGenerator;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StartupController;
use App\Http\Controllers\SystemSettingsController;
use App\Services\CaptchaServices;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return jsonResponse();
});

Route::get('/captcha', function () {
    $captcha = CaptchaGenerator::generate();
    $hash = CaptchaServices::hash($captcha["code"]);

    return jsonResponse([
        'base64_url' => $captcha["image_url"],
        'timestamp' => $hash["timestamp"],
        'payload' => $hash["hash"],
    ]);

})->middleware(["startup:true", "throttle:api"]);

Route::get('/system-settings', [SystemSettingsController::class, "getPublicSystemSettings"])
    ->middleware(["startup:true"]);

Route::prefix('/startup')
    ->group(function () {

    Route::get('/get-stage', [StartupController::class, "getStartupStage"]);

    Route::middleware(["startup:false"])->group(function () {

        Route::get('/check-requirements', [StartupController::class, "checkRequirements"]);

        Route::post('/config-env', [StartupController::class, "setupEnvConfiguration"]);

        Route::get('/check-env', [StartupController::class, "checkEnvConfiguration"]);

        Route::post('/initiate-db', [StartupController::class, "migrateAndSeedDatabase"]);

        Route::post('/setup-admin', [StartupController::class, "setupAdminUserAndFinalizeStartup"]);

    });

});

Route::prefix("auth")->group(function () {

    Route::get('/', [AuthController::class, 'check'])
        ->middleware(["startup:true", "throttle:api", "auth:sanctum"]);

    Route::get('/needs-captcha', [AuthController::class, 'checkIfAuthNeedsCaptcha'])
        ->middleware(["startup:true", "throttle:api"]);

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware(["startup:true", "throttle:api", "captcha:auth"]);

    Route::post('/signup', [AuthController::class, 'signup'])
        ->middleware(["startup:true", "throttle:api", "captcha:auth"]);

    Route::get('/logout', [AuthController::class, 'logout'])
        ->middleware(["startup:true", "throttle:api", "auth:sanctum"]);

});

Route::prefix("app")
    ->middleware(["startup:true", "throttle:api", "auth:sanctum", "device:update"])
    ->group(function () {

    require_once base_path("routes/app.php");

});

Route::prefix("admin")
    ->middleware(["startup:true", "throttle:api", "auth:sanctum", "admin"])
    ->group(function () {

    require_once base_path("routes/admin.php");

});
