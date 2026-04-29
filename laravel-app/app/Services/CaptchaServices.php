<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class CaptchaServices
{

    protected const EXPIRES_AFTER_MINUTES = 1;

    protected const CACHE_KEY_PREFIX = 'captcha_used:';

    protected const CACHE_TTL_SECONDS = 120;

    public static function hash(
        string $code,
        ?string $customKey = null
    ): array
    {
        $ts = Carbon::now()->getTimestamp();
        return [
            "timestamp" => "$ts",
            "hash" => hash_hmac('sha256', ($code . "##" . $ts), $customKey ?? config("app.key"))
        ];
    }

    public static function checkPayload(
        string $providedHash,
        string $providedAnswer,
        string $providedTimeStamp,
        ?string $customKey = null
    ): bool
    {
        $expectedCorrectPayload = hash_hmac('sha256', (strtoupper($providedAnswer) . "##" . $providedTimeStamp), $customKey ?? config("app.key"));

        if (hash_equals($expectedCorrectPayload, $providedHash)) {

            // Hash is correct, we check code expiry here
            // User have 1 minutes to solve the puzzle
            $expiresAt = Carbon::createFromTimestamp($providedTimeStamp)->addMinutes(self::EXPIRES_AFTER_MINUTES);
            if (Carbon::now()->isAfter($expiresAt)) {
                return false;
            }

            // One-time use: reject if this payload was already used
            $cacheKey = self::CACHE_KEY_PREFIX . $providedHash;
            if (Cache::has($cacheKey)) {
                return false;
            }
            Cache::put($cacheKey, true, self::CACHE_TTL_SECONDS);

            return true;
        }

        return false;
    }

}
