<?php

namespace App\Http\Middleware;

use App\Enums\StartupStages;
use App\Services\StartupServices;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StartupCheckMiddleware
{

    public function __construct(
        protected StartupServices $startupServices
    )
    {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $param = "true"): Response
    {
        $withStartup = $param == "true";

        if (!$withStartup) {
            // Here we know using this route, is only allowed if system startup is not locked, so checking it
            $lockFileResult = $this->startupServices->checkStartupLockedWithFile();
            if ($lockFileResult["status"])
                return jsonResponse(status: false, message: __("startup.messages.no_startup_routes_access"));
            else
                return $next($request);
        }

        // If the request is needed to have the startup system process done
        $stage = $this->startupServices->getCurrentStartupStage();
        if (!$stage) {
            return jsonResponse(status: false, message: __("startup.messages.startup_status_not_found"));
        }

        if ($stage != StartupStages::STAGE_FINAL_APP_READY) {
            return jsonResponse(status: false, message: __("startup.messages.startup_is_not_launched_yet"));
        }

        return $next($request);

    }

}
