<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $id
 * @property int $user_id
 * @property string $public_key
 * @property string|null $device_name
 * @property string|null $device_type
 * @property Carbon|null $last_used_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property User|null $user
 */
class UserDevice extends Model
{

    protected $fillable = [
        "user_id",
        "public_key",
        "device_name",
        "device_type",
        "last_used_at",
    ];

    protected $casts = [
        "last_used_at" => "datetime",
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
