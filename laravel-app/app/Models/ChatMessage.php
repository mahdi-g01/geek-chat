<?php

namespace App\Models;

use App\Enums\MessageDisplayType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** @property int $id
  * @property int $chat_id
  * @property int $user_id
  * @property int|null $reply_to_id
  * @property string|null $message_body
  * @property array|null $metadata
  * @property MessageDisplayType $display_type
  * @property boolean $is_edited
  * @property Carbon|null $edited_at
  * @property Carbon $created_at
  * @property Carbon $updated_at */
class ChatMessage extends Model
{

    protected $fillable = [
        "chat_id",
        "user_id",
        "reply_to_id",
        "message_body",
        "metadata",
        "display_type",
        "is_edited",
        "edited_at",
    ];

    protected $appends = [

    ];

    protected $hidden = [
        "user_id",
        "reply_to_id",
        "metadata",
        "edited_at",
    ];

    protected $casts = [
        "edited_at" => "datetime",
        "display_type" => MessageDisplayType::class,
        "metadata" => "json"
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ChatMessageFile::class, "message_id");
    }

    public function replyTarget(): HasOne
    {
        return $this->hasOne(ChatMessage::class, "reply_to_id");
    }

}
