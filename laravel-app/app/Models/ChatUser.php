<?php

namespace App\Models;

use App\Enums\ChatUserMembershipType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $chat_id
 * @property int $user_id
 * @property ChatUserMembershipType $membership_type
 * @property Carbon|null $last_seen_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class ChatUser extends Model
{

    protected $fillable = [
        "chat_id",
        "user_id",
        "membership_type",
        "last_seen_at",
    ];

    protected $appends = [

    ];

    protected $hidden = [
        "id",
        "chat_id",
    ];

    protected $casts = [
        "last_seen_at" => "datetime",
        "membership_type" => ChatUserMembershipType::class,
    ];

    protected $with = [
        "user"
    ];

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, "chat_id")
            ->where("user_id", "=", $this->user_id);
    }

}
