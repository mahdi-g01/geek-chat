<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/** @property int $id
 * @property string $public_name
 * @property string $user_name
 * @property boolean $is_banned
 * @property string $password
 * @property array $preferences
 * @property string|null $phone_number
 * @property string|null $bio_text
 * @property string|null $avatar_file_path
 * @property string|null $avatar_url
 * @property Carbon|null $phone_verified_at
 * @property Carbon|null $banned_at
 * @property Carbon|null $last_seen_at
 * @property int|null $last_active_device_id
 * @property Admin|null $admin_model
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property \Illuminate\Database\Eloquent\Collection|UserDevice[] $devices
 * @property UserDevice|null $lastActiveDevice
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'public_name',
        'user_name',
        'is_banned',
        'password',
        'preferences',
        'phone_number',
        'bio_text',
        'avatar_file_path',
        'phone_verified_at',
        'banned_at',
        'last_seen_at',
        'last_active_device_id',
    ];

    protected $hidden = [
        'password',
        'preferences',
        'phone_number',
        'avatar_file_path',
        'banned_at',
        'phone_verified_at',
        'last_seen_at',
        'remember_token',
        'admin_model',
    ];

    protected $casts = [
        'phone_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'banned_at' => 'datetime',
        'password' => 'hashed',
        'preferences' => 'array',
    ];

    protected $appends = [
        "avatar_url",
    ];

    public function adminModel(): HasOne
    {
        return $this->hasOne(Admin::class);
    }

    public function devices(): HasMany
    {
        return $this->hasMany(UserDevice::class);
    }

    public function lastActiveDevice(): BelongsTo
    {
        return $this->belongsTo(UserDevice::class, "last_active_device_id");
    }

    public function avatarUrl(): Attribute
    {
        return Attribute::make(get: function () {
            if ($this->avatar_file_path == null)
                return null;
            return config('app.url') . '/storage/' . $this->avatar_file_path;
        });
    }

    // Helper functions
    public function isAdmin(): bool
    {
        if ($this->relationLoaded("adminModel")) {
            return $this->admin_model != null;
        } else {
            return $this->adminModel()->exists();
        }
    }

}
