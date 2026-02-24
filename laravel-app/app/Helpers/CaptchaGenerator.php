<?php

namespace App\Helpers;

use Random\RandomException;

class CaptchaGenerator
{

    /**
     * Generate a base64-encoded CAPTCHA image with customizable parameters.
     *
     * @param int $length Length of the CAPTCHA code (default: 6)
     * @param bool $use_numbers Include numbers 0-9 (default: true)
     * @param bool $use_uppercase Include uppercase letters A-Z (default: true)
     * @param bool $use_lowercase Include lowercase letters a-z (default: false)
     * @param int $image_width Width of the image in pixels (default: 300)
     * @param int $image_height Height of the image in pixels (default: 100)
     * @param int $font_size Font size for the text (default: 50)
     *
     * @return array Array containing:
     *         - 'code': The CAPTCHA text code
     *         - 'base64': Base64-encoded PNG image
     *         - 'image_url': Data URL suitable for HTML img tag
     *
     * @throws RandomException
     */
    public static function generate(
        int  $length = 6,
        bool $use_numbers = true,
        bool $use_uppercase = true,
        bool $use_lowercase = false,
        int  $image_width = 300,
        int  $image_height = 80,
        int  $font_size = 20
    ): array
    {
        // Build character set
        $chars = '';

        if ($use_numbers) {
            $chars .= '0123456789';
        }
        if ($use_uppercase) {
            $chars .= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        if ($use_lowercase) {
            $chars .= 'abcdefghijklmnopqrstuvwxyz';
        }

        if (empty($chars)) {
            throw new \Exception('At least one character type must be enabled!');
        }

        // Generate random code
        $code = '';
        $chars_length = strlen($chars);
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[random_int(0, $chars_length - 1)];
        }

        // Create image with alpha channel support
        $image = imagecreatetruecolor($image_width, $image_height);
        imagesavealpha($image, true);

        // Create complex background with gradient and noise
        $bg_color = imagecolorallocatealpha($image,
            random_int(220, 245),
            random_int(220, 245),
            random_int(220, 245),
            0
        );
        imagefill($image, 0, 0, $bg_color);

        // Add gradient background
        for ($i = 0; $i < $image_height; $i++) {
            $r = random_int(210, 250);
            $g = random_int(210, 250);
            $b = random_int(210, 250);
            $line_color = imagecolorallocate($image, $r, $g, $b);
            imageline($image, 0, $i, $image_width, $i, $line_color);
        }

        // Add wavy lines for extra obfuscation
        for ($line = 0; $line < 3; $line++) {
            $y_start = random_int(10, $image_height - 10);
            $amplitude = random_int(5, 15);
            $wavelength = random_int(20, 40);

            $line_color = imagecolorallocatealpha(
                $image,
                random_int(180, 220),
                random_int(180, 220),
                random_int(180, 220),
                0
            );

            for ($x = 0; $x < $image_width - 1; $x++) {
                $y = $y_start + $amplitude * sin($x / $wavelength);
                $next_y = $y_start + $amplitude * sin(($x + 1) / $wavelength);
                imageline($image, $x, $y, $x + 1, $next_y, $line_color);
            }
        }

        // Add heavy noise overlay
        for ($i = 0; $i < random_int(300, 500); $i++) {
            $x = random_int(0, $image_width - 1);
            $y = random_int(0, $image_height - 1);
            $noise_color = imagecolorallocatealpha(
                $image,
                random_int(100, 200),
                random_int(100, 200),
                random_int(100, 200),
                random_int(60, 120)
            );
            imagefilledrectangle($image, $x, $y, $x + random_int(1, 3), $y + random_int(1, 3), $noise_color);
        }

        // Add random circles and shapes
        for ($i = 0; $i < random_int(5, 10); $i++) {
            $circle_color = imagecolorallocatealpha(
                $image,
                random_int(150, 220),
                random_int(150, 220),
                random_int(150, 220),
                random_int(80, 120)
            );
            $cx = random_int(0, $image_width);
            $cy = random_int(0, $image_height);
            $radius = random_int(5, 25);
            imagefilledarc($image, $cx, $cy, $radius * 2, $radius * 2, 0, 360, $circle_color, IMG_ARC_PIE);
        }

        // Get font file
        $font_file = base_path('app/Assets/Fonts/DejaVu_Sans_Bold.ttf');

        // If font not found, create from scratch
        $use_ttf = file_exists($font_file);

        // Draw each character individually with transformations
        $char_spacing = $image_width / ($length + 1);
        $center_y = $image_height / 2;

        for ($i = 0; $i < $length; $i++) {
            $char = $code[$i];

            // Random angle for each character
            $angle = random_int(-45, 45);

            // Random vertical offset
            $y_offset = random_int(-15, 15);

            // Random horizontal position with spacing
            $x_pos = ($i + 1) * $char_spacing + random_int(-10, 10);
            $y_pos = $center_y + $y_offset;

            // Vary font size slightly
            $char_font_size = $font_size + random_int(-8, 8);

            // Different colors for each character
            $text_color = imagecolorallocate(
                $image,
                random_int(30, 90),
                random_int(30, 90),
                random_int(30, 90)
            );

            if ($use_ttf) {
                // Draw with TrueType font and rotation
                imagettftext(
                    $image,
                    $char_font_size,
                    $angle,
                    $x_pos,
                    $y_pos,
                    $text_color,
                    $font_file,
                    $char
                );
            } else {
                // Fallback: use built-in font (less effective but works)
                imagestring($image, 150, $x_pos, $y_pos, $char, $text_color);
            }
        }

        // Add more diagonal lines for interference
        for ($i = 0; $i < random_int(8, 15); $i++) {
            $x1 = random_int(-50, $image_width);
            $y1 = random_int(-50, $image_height);
            $x2 = random_int(-50, $image_width);
            $y2 = random_int(-50, $image_height);

            $line_color = imagecolorallocatealpha(
                $image,
                random_int(150, 220),
                random_int(150, 220),
                random_int(150, 220),
                random_int(80, 120)
            );
            imageline($image, $x1, $y1, $x2, $y2, $line_color);
        }

        // Apply slight blur/distortion via dithering effect
        for ($i = 0; $i < random_int(100, 200); $i++) {
            $x = random_int(0, $image_width - 1);
            $y = random_int(0, $image_height - 1);
            $pixel_color = imagecolorallocatealpha(
                $image,
                random_int(180, 255),
                random_int(180, 255),
                random_int(180, 255),
                random_int(40, 100)
            );
            imagesetpixel($image, $x, $y, $pixel_color);
        }

        // Convert to base64
        ob_start();
        imagepng($image, null, 9);
        $image_data = ob_get_clean();
        imagedestroy($image);

        $base64_str = base64_encode($image_data);

        return [
            'code' => $code,
            'base64' => $base64_str,
            'image_url' => 'data:image/png;base64,' . $base64_str
        ];
    }

}
