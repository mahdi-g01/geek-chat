<?php

namespace App\Models;

use App\Enums\SystemSettingKeys;
use App\Policies\SystemSettingPolicy;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

/** @property SystemSettingKeys $key
  * @property string $value
  * @property Carbon $created_at
  * @property Carbon $updated_at */
class SystemSetting extends Model
{

    protected $primaryKey = "key";

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value'
    ];

    protected $casts = [
        "key" => SystemSettingKeys::class,
    ];

    protected $appends = [
        "title"
    ];

    public function title(): Attribute
    {
        return Attribute::get(function (){
            return __("system-settings.".$this->key->value);
        });
    }

    public static function get(SystemSettingKeys $key, $default = null)
    {
        return SystemSetting::query()->where("key", $key)->select("value")->first()?->value ?? $default;
    }

    public static function set(SystemSettingKeys $key, mixed  $val)
    {
        return SystemSetting::query()->updateOrCreate([
            "key" => $key,
        ],[
            "value" => $val
        ]);
    }

}
