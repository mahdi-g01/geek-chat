<?php

namespace App\Models;

use App\Enums\FileDisplayType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/** @property int $id
  * @property int $message_id
  * @property string $file_path
  * @property string $extension
  * @property string $name
  * @property FileDisplayType $display_type
  * @property Carbon|null $edited_at
  * @property Carbon $created_at
  * @property Carbon $updated_at */
class ChatMessageFile extends Model
{

    protected $fillable = [
        "message_id",
        "file_path",
        "extension",
        "display_type",
        "edited_at",
    ];

    protected $appends = [
        "name",
        "size"
    ];

    protected $hidden = [
        "message_id",
        "file_path",
    ];

    protected $casts = [
        "edited_at" => "datetime",
        "display_type" => FileDisplayType::class,
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, "message_id");
    }

    public function name(): Attribute
    {
        return Attribute::get(function () {
            return substr($this->file_path, strrpos($this->file_path, "/") + 1);
        });
    }

    public function size(): Attribute
    {
        return Attribute::get(function () {
            try {
                $disk = config('app.chat_filesystem_driver');
                return Storage::disk($disk)->size($this->file_path);
            } catch (\Exception $e) {
                return null;
            }
        });
    }

}
