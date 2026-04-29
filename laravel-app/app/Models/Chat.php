<?php

namespace App\Models;

use App\Enums\ChatTypes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

/** @property int $id
 * @property string|null $title
 * @property string|null $description
 * @property string|null $avatar_file_path
 * @property numeric|null $dialog_target_user_id
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property ChatTypes $chat_type
 * Relations
 * @property ChatMessage|null $lastMessageModel
 * @property Collection|ChatMessage[]|null $messages
 * @property Collection|ChatUser[]|null $members
 * @property ChatEncryptionProperty|null $encryptionProperty
 */
class Chat extends Model
{

    protected $fillable = [
        'title',
        'description',
        'chat_type',
        'avatar_file_path',
        'updated_at',
    ];

    protected $casts = [
        "chat_type" => ChatTypes::class
    ];

    protected $appends = [
        "last_message",
        "title",
        "avatar_url",
        "dialog_target_user_id"
    ];

    protected $hidden = [
        "avatar_file_path",
        "members",
        "last_message_model",
    ];

    public function members(): HasMany
    {
        return $this->hasMany(ChatUser::class)->with("user");
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, "chat_id");
    }

    public function lastMessageModel(): HasOne
    {
        return $this->hasOne(ChatMessage::class, "chat_id")->orderBy("id", "desc")->limit(1);
    }

    public function files(): HasManyThrough
    {
        return $this->hasManyThrough(ChatMessageFile::class, ChatMessage::class, "chat_id", "message_id");
    }

    public function encryptionProperty(): HasOne
    {
        return $this->hasOne(ChatEncryptionProperty::class);
    }

    // Attributes
    public function lastMessage(): Attribute
    {
        return Attribute::get(function () {

            if ($this->relationLoaded("lastMessageModel")) {
                if ($this->lastMessageModel == null)
                    return __("chat-system.no_message");

                // Check if message is only file
                if ($this->lastMessageModel->message_body == null)
                    return "File";

                return $this->lastMessageModel->message_body;
            }

            if ($this->relationLoaded("messages")) {
                $messagesArray = $this->messages->toArray();
                $last = last($messagesArray) !== null ? last($messagesArray) : null;
                if ($last) {
                    return $last["message_body"];
                } else {
                    return __("chat-system.no_message");
                }
            }

            return __("chat-system.no_message");
        });
    }

    public function title(): Attribute
    {
        return Attribute::get(function () {
            $isTwoSidedChat = $this->isTwoSidedChat();
            $thereIsNoAuthentication = !Auth::check();
            $membersRelationAreLoaded = $this->relationLoaded("members");
            $userIsAdminAndIsOutOfChat = $this->userIsAdminAndIsOutOfChat();

            if ($isTwoSidedChat) {
                // Here, we should generate a title for the chat
                // since it is not a group and have no title

                if (!$membersRelationAreLoaded) {
                    // Return null, since we don't have access to users names
                    return null;
                }

                if ($thereIsNoAuthentication || $userIsAdminAndIsOutOfChat) {
                    // Returning a combination of the name of all users
                    // since there is no user to see which side of chat user
                    // should be shown as title
                    $users = array_column($this->members->toArray(), "user");
                    $names = array_column($users, "public_name");
                    return implode(", ", $names);

                } else {
                    // Returning the name of the other side user
                    $users = $this->members->pluck("user");

                    // Checking if chat is saved messages
                    $isSavedMessages = $this->isSavedMessage();
                    if ($isSavedMessages)
                        return __("chat-system.saved_messages");

                    $otherSideUser = $users->where("id", "!=", Auth::id())->first();
                    if ($otherSideUser) {
                        return $otherSideUser->public_name;
                    } else return null;

                }

            } else {
                // This chat would be a group, so it has a title, returning it
                return $this->getRawOriginal('title');
            }

        });
    }

    public function description(): Attribute
    {
        return Attribute::get(function () {
            $isTwoSidedChat = $this->isTwoSidedChat();
            $thereIsNoAuthentication = !Auth::check();
            $userIsAdminAndIsOutOfChat = $this->userIsAdminAndIsOutOfChat();
            $membersRelationAreLoaded = $this->relationLoaded("members");

            if ($isTwoSidedChat) {
                if (!$membersRelationAreLoaded) {
                    return null;
                }

                if ($thereIsNoAuthentication || $userIsAdminAndIsOutOfChat) {
                    return null;
                }

                $users = $this->members->pluck("user");
                $isSavedMessages = $this->isSavedMessage();
                if ($isSavedMessages) {
                    return __("chat-system.saved_messages");
                }

                $otherSideUser = $users->where("id", "!=", Auth::id())->first();
                return $otherSideUser?->bio_text;
            }

            return $this->getRawOriginal('description');
        });
    }

    public function avatarUrl(): Attribute
    {
        return Attribute::get(function () {
            $isTwoSidedChat = $this->isTwoSidedChat();
            $thereIsNoAuthentication = !Auth::check();
            $membersRelationAreLoaded = $this->relationLoaded("members");

            if ($isTwoSidedChat) {
                if (!$membersRelationAreLoaded) {
                    return null;
                }

                if ($thereIsNoAuthentication) {
                    return null;
                }

                $users = $this->members->pluck("user");
                $isSavedMessages = $this->isSavedMessage();
                if ($isSavedMessages) {
                    return Auth::user()->avatar_url;
                }

                $otherSideUser = $users->where("id", "!=", Auth::id())->first();
                return $otherSideUser?->avatar_url;
            }

            if ($this->avatar_file_path === null) {
                return null;
            }
            return config('app.public_storage_url') . '/' . $this->avatar_file_path;
        });
    }

    public function dialogTargetUserId(): Attribute
    {
        return Attribute::get(function () {
            $isTwoSidedChat = $this->isTwoSidedChat();
            $thereIsNoAuthentication = !Auth::check();
            $userIsAdminAndIsOutOfChat = $this->userIsAdminAndIsOutOfChat();
            $membersRelationAreLoaded = $this->relationLoaded("members");

            if (!$isTwoSidedChat) {
                return null;
            }

            if (!$membersRelationAreLoaded) {
                return null;
            }

            if ($thereIsNoAuthentication || $userIsAdminAndIsOutOfChat) {
                return null;
            }

            $users = $this->members->pluck("user");
            $isSavedMessages = $this->isSavedMessage();
            if ($isSavedMessages) {
                return null;
            }

            $otherSideUser = $users->where("id", "!=", Auth::id())->first();
            return $otherSideUser?->id;
        });
    }

    // Helper function
    protected function isTwoSidedChat(): bool
    {
        return match ($this->chat_type) {
            ChatTypes::DIALOG, ChatTypes::ENCRYPTED_DIALOG => true,
            default => false,
        };
    }

    protected function userIsAdminAndIsOutOfChat(): bool
    {
        if (!Auth::check())
            return false;
        if (!Auth::user()->isAdmin())
            return false;
        if (!$this->relationLoaded("members"))
            return false;
        return !$this->members->pluck("user")->pluck("id")->contains(Auth::id());
    }

    protected function isSavedMessage(): bool
    {
        if (!$this->relationLoaded("members"))
            return false;

        $userIds = $this->members->pluck("user")->pluck("id");
        if ($userIds->count() != 2)
            return false;

        return $userIds[0] == $userIds[1];
    }

}
