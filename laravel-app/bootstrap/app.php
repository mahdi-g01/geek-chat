<?php

use App\Http\Middleware\AdminCheckMiddleware;
use App\Http\Middleware\CaptchaProtectionMiddleware;
use App\Http\Middleware\DetectUserLanguage;
use App\Http\Middleware\ForceJSONResponseMiddleware;
use App\Http\Middleware\StartupCheckMiddleware;
use App\Http\Middleware\UpdateUserLastActiveDevice;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/_index.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        apiPrefix: "",
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            "captcha" => CaptchaProtectionMiddleware::class,
            "startup" => StartupCheckMiddleware::class,
            "admin" => AdminCheckMiddleware::class,
            "device" => UpdateUserLastActiveDevice::class,
        ]);
        $middleware->convertEmptyStringsToNull();
        $middleware->append(DetectUserLanguage::class);
        $middleware->append(ForceJSONResponseMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions) {

        $exceptions->render(function (ThrottleRequestsException $e, $request) {
            return jsonResponse(status: false, message: __("global-messages.too_many_attempts"), code: 400);
        });

        $exceptions->render(function (AuthenticationException $e, $request) {
            return jsonResponse(status: false, message: __("global-messages.authentication_error"), code: 401);
        });

        $exceptions->render(function (RouteNotFoundException|NotFoundHttpException $e, $request) {
            return jsonResponse(status: false, message: __("global-messages.not_found"), code: 404);
        });

        // Here we put all the errors, into our static API response structure
        $exceptions->render(function (Exception $e, $request) {
            $debug = config('app.debug') ?? false;
            return jsonResponse($debug ? [
                "file" => $e->getFile(),
                "line" => $e->getLine(),
                "trace" => array_slice($e->getTrace(), 0, 5)
            ]: null, false, $debug ? $e->getMessage() : __("global-messages.server_error"), 500);
        });

    })
    ->create();
