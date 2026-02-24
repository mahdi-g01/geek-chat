<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $id
 * @property int $chat_id
 * @property int $initiator_device_id
 * @property int $responder_device_id
 * @property string|null $initiator_public_key
 * @property string|null $responder_public_key
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Chat|null $chat
 * @property UserDevice|null $initiatorDevice
 * @property UserDevice|null $responderDevice
 */
class ChatEncryptionProperty extends Model
{

    protected $fillable = [
        "chat_id",
        "initiator_device_id",
        "responder_device_id",
    ];

    protected $with = [
        "initiatorDevice",
        "responderDevice",
    ];

    protected $appends = [
        "initiator_public_key",
        "responder_public_key",
    ];

    public function initiatorPublicKey(): Attribute
    {
        return Attribute::get(fn () => $this->initiatorDevice?->public_key);
    }

    public function responderPublicKey(): Attribute
    {
        return Attribute::get(fn () => $this->responderDevice?->public_key);
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function initiatorDevice(): BelongsTo
    {
        return $this->belongsTo(UserDevice::class, "initiator_device_id");
    }

    public function responderDevice(): BelongsTo
    {
        return $this->belongsTo(UserDevice::class, "responder_device_id");
    }

}
