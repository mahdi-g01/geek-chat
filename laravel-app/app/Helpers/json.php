<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Support\MessageBag;

// This is the return format of the whole API system
function jsonResponse($data = [], $status = true, $message = "success", $code = 200): JsonResponse
{
    if ($message === "success") {
        $message = __("global-messages.success");
    }
    return response()->json([
        'status' => $status,
        "message" => $message,
        'data' => $data,
    ], (int) $code);
}

function jsonValidationResponse(array|MessageBag $errors): JsonResponse
{
    return jsonResponse([
        "validation_errors" => $errors
    ], false, __("global-messages.validation_error"), 409);
}
