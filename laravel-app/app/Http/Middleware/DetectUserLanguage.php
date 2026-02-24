<?php

namespace App\Http\Middleware;

use App\Helpers\SystemConstants;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class DetectUserLanguage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = SystemConstants::SUPPORTED_LANGUAGES;

        $preferred = $request->getPreferredLanguage($supportedLocales);

        if ($preferred)
            App::setLocale($preferred);

        return $next($request);
    }
}
