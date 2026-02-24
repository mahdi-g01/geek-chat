<?php

use App\Services\CaptchaServices;
use Illuminate\Support\Str;

test('that captcha checks successfully', function () {
    $code = "75JLL+";
    $key = Str::random(32);
    $hashData = CaptchaServices::hash($code, $key);
    $checkResult = CaptchaServices::checkPayload($hashData["hash"], "75JLL+", $hashData["timestamp"], $key);
    expect($checkResult)->toBeTrue();
});
