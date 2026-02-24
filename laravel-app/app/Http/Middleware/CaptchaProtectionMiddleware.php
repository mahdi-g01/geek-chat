<?php

namespace App\Http\Middleware;

use App\Enums\SystemSettingKeys;
use App\Models\SystemSetting;
use App\Services\CaptchaServices;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class CaptchaProtectionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next, string $param = null): Response
    {

        if ($param == "auth") {
            // Here we check the system setting is activated for auth routes
            // Otherwise, we realize that user just want to protect the route with captcha
            $checkCaptcha = SystemSetting::get(SystemSettingKeys::AUTH_CAPTCHA_ACTIVATED, false) === "true";
        } else {
            // Here is clear that user just wants to protect the route with captcha
            // So we skip settings check for captcha being activated for auth routes
            $checkCaptcha = true;
        }

        if (!$checkCaptcha)
            return $next($request);

        $validator = Validator::make($request->all(), [
            'captcha_answer' => 'required|string',
            'captcha_ts' => 'required|string',
            'captcha_payload' => 'required|string',
        ]);

        if ($validator->fails())
            return jsonValidationResponse($validator->errors());

        $answer = $request->get("captcha_answer");
        $payload = $request->get("captcha_payload");
        $timestamp = $request->get("captcha_ts");

        if (CaptchaServices::checkPayload($payload, $answer, $timestamp)) {
            return $next($request);
        } else {
            return jsonResponse(status: false, message: __("captcha.is_invalid"), code: 400);
        }

    }

}
