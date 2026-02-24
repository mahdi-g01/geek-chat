<?php

namespace App\Http\Middleware;

use App\Enums\StartupStages;
use App\Services\StartupServices;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminCheckMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $param = "true"): Response
    {
        if (!Auth::check())
            abort(401);

        if (!Auth::user()->isAdmin())
            abort(403);

        return $next($request);

    }

}
