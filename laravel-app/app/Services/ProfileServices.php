<?php

namespace App\Services;

use App\Helpers\Functions;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProfileServices
{

    public const FILE_PATH_PREFIX = "avatars";
    public const FILE_NAME_PREFIX = "user_avatar";

    public function changeUserAvatar(UploadedFile $file, User $user): bool
    {
        $fileExt = $file->extension();
        $nonce = Str::random(4);
        $fileName = self::FILE_NAME_PREFIX."_{$user->id}_{$nonce}.$fileExt";
        $filePath = self::FILE_PATH_PREFIX;
        $savePath = $file->storeAs($filePath, $fileName, 'public');
        $absolutePath = base_path("storage/app/public/{$savePath}");
        Functions::resizeAndCropSquare($absolutePath);

        $user->update([
            "avatar_file_path" => $savePath
        ]);

        return true;
    }

    public function deleteAllUserAvatars(User $user): bool
    {
        $directory = storage_path("app/public/".self::FILE_PATH_PREFIX);
        $userAvatarPrefix = self::FILE_NAME_PREFIX."_{$user->id}";

        $files = glob($directory . '/' . $userAvatarPrefix . '*');

        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }

        $user->update([
            "avatar_file_path" => null
        ]);

        return true;
    }

}
