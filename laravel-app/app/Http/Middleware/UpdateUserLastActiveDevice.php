<?php

namespace App\Http\Middleware;

use App\Services\DeviceManagerService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserLastActiveDevice
{

    public function __construct(
        protected DeviceManagerService $deviceManager
    ) {}

    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $publicKey = $request->header("X-Device-Public-Key");

        if (empty($publicKey) || !is_string($publicKey)) {
            return jsonResponse([], false, __("auth.device_public_key_required"), 403);
        }

        $userId = Auth::id();
        if ($userId === null) {
            return jsonResponse([], false, __("global-messages.authentication_error"), 401);
        }

        if (!$this->deviceManager->updateLastActiveDevice($userId, $publicKey)) {
            return jsonResponse([], false, __("auth.device_not_registered"), 403);
        }

        return $next($request);
    }

}
