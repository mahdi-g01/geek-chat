<?php

namespace App\Helpers;

class Functions
{

    // Here public re-usable static functions could be placed
    public static function resizeAndCropSquare(string $filePath, int $size = 500): bool
    {
        if (!file_exists($filePath)) {
            return false;
        }

        $info = getimagesize($filePath);
        if ($info === false) {
            return false;
        }

        [$width, $height, $type] = $info;

        // Create image from file
        switch ($type) {
            case IMAGETYPE_JPEG:
                $image = imagecreatefromjpeg($filePath);
                break;

            case IMAGETYPE_PNG:
                $image = imagecreatefrompng($filePath);
                break;

            case IMAGETYPE_WEBP:
                $image = imagecreatefromwebp($filePath);
                break;

            default:
                return false; // Unsupported type
        }

        if (!$image) {
            return false;
        }

        // Scale so smaller side becomes $size
        $scale = $size / min($width, $height);
        $newWidth  = (int) round($width * $scale);
        $newHeight = (int) round($height * $scale);

        $resized = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency for PNG & WEBP
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_WEBP) {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
            imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled(
            $resized,
            $image,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $width, $height
        );

        // Center crop
        $x = (int)(($newWidth - $size) / 2);
        $y = (int)(($newHeight - $size) / 2);

        $final = imagecrop($resized, [
            'x' => $x,
            'y' => $y,
            'width' => $size,
            'height' => $size
        ]);

        if (!$final) {
            imagedestroy($image);
            imagedestroy($resized);
            return false;
        }

        // Overwrite original file
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($final, $filePath, 90);
                break;

            case IMAGETYPE_PNG:
                imagepng($final, $filePath);
                break;

            case IMAGETYPE_WEBP:
                imagewebp($final, $filePath, 90);
                break;
        }

        imagedestroy($image);
        imagedestroy($resized);
        imagedestroy($final);

        return true;
    }

}
