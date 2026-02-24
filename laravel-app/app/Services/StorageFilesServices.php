<?php

namespace App\Services;

use App\Enums\FileDisplayType;
use App\Models\ChatMessage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\ArrayShape;

class StorageFilesServices
{

    protected const STORAGE_CHAT_FILES_PATH = 'chat_files';

    public function freeSystemSpaceLeftInKb(): int
    {
        $bytes = disk_free_space("/");
        return $bytes / 1024;
    }

    public function occupiedStorageSpaceInKb(): int
    {
        $bytes = 0;
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator(
                storage_path()
            )
        );
        foreach ($iterator as $i) {
            $bytes += $i->getSize();
        }

        return $bytes / 1024;
    }

    /**
     * @param UploadedFile[] $files
     * @param ChatMessage $messageModel
     * @return array
     */
    #[ArrayShape(["status" => "bool", "message" => "string"])]
    public function storeChatFile(array $files, ChatMessage $messageModel): array
    {
        $results = [];

        for ($i = 0; $i < sizeof($files); $i++) {

            // Checking file size with space left on device
            $file = $files[$i];
            $sizeInKB = $file->getSize() / 1024;
            if ($sizeInKB > $this->freeSystemSpaceLeftInKb()) {
                $results[$i] = [
                    "status" => false,
                    "message" => __("chat-system.no_space_left_for_file")
                ];
                continue;
            }

            // All clear, storing the file
            $fileIsImage = match ($file->extension()) {
                "jpeg", "jpg", "gif", "png" => true,
                default => false
            };
            $fileExt = $file->extension();
            $fileRandomId = Str::uuid();
            $fileName = "chat_message_{$fileRandomId}.$fileExt";
            $filePath = $this::STORAGE_CHAT_FILES_PATH;
            Storage::putFileAs($filePath, $file, $fileName);

            // File stored, creating model
            $messageModel->files()->create([
                "file_path" => "$filePath/$fileName",
                "extension" => $fileExt,
                "display_type" => $fileIsImage ? FileDisplayType::PREFER_PREVIEW->value : FileDisplayType::FILE->value,
            ]);

            $results[$i] = [
                "status" => true,
                "name" => $fileName,
                "message" => __("chat-system.file_uploaded")
            ];
        }

        return $results;
    }

    /**
     * Delete a single chat file from storage by its path.
     */
    public function deleteChatFile(string $filePath): bool
    {
        if ($filePath === '') {
            return false;
        }
        return Storage::delete($filePath);
    }

    /**
     * Delete multiple chat files from storage by their paths.
     */
    public function deleteChatFiles(iterable $filePaths): void
    {
        foreach ($filePaths as $path) {
            if (is_string($path) && $path !== '') {
                Storage::delete($path);
            }
        }
    }

}
