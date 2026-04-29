<?php

namespace App\Services;

use App\Enums\FileDisplayType;
use App\Helpers\FTPHelpers;
use App\Models\ChatMessage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use JetBrains\PhpStorm\ArrayShape;

class StorageFilesServices
{

    protected const STORAGE_CHAT_FILES_PATH = 'chat_files';

    protected string $storageChatFileSystemDisk = 'local';

    protected FTPHelpers|null $ftpHelpers = null;

    public function __construct()
    {
        $this->storageChatFileSystemDisk = config('app.chat_filesystem_driver');
        if ($this->storageChatFileSystemDisk == "ftp") {
            $this->ftpHelpers = new FTPHelpers();
        }
    }

    public function freeSpaceLeftInKb(): int
    {
        $total = $this->totalSpaceInKb();
        if ($total == -1) {
            return -1;
        }
        $used = $this->occupiedStorageSpaceInKb();

        return $total - $used;
    }


    public function totalSpaceInKb(): int
    {
        if (config("app.manual_maximum_chat_filesystem_space")){
            return config("app.manual_maximum_chat_filesystem_space");
        }
        switch ($this->storageChatFileSystemDisk) {
            case "ftp":
                $space = $this->ftpHelpers->getTotalSpace();
                if ($space == null || is_nan($space)) {
                    return -1;
                }
                return $this->ftpHelpers->getTotalSpace() / 1024;
            default:
            case "local":
                if (!function_exists('disk_free_space')) {
                    return -1;
                }
                $bytes = disk_free_space("/");
                return $bytes / 1024;
        }
    }

    public function occupiedStorageSpaceInKb(): int
    {
        switch ($this->storageChatFileSystemDisk) {
            case "ftp":
                return $this->ftpHelpers->getOccupiedSpace() / 1024;
            default:
            case "local":
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
            $freeSpace = $this->freeSpaceLeftInKb();
            if ($freeSpace == -1) {
                // Space check is unsupported
                goto save;
            }

            if ($sizeInKB > $this->freeSpaceLeftInKb()) {
                $results[$i] = [
                    "status" => false,
                    "message" => __("chat-system.no_space_left_for_file")
                ];
                continue;
            }

            save:{

                // All clear, storing the file
                $fileIsImage = match ($file->extension()) {
                    "jpeg", "jpg", "gif", "png" => true,
                    default => false
                };
                $fileExt = $file->extension();
                $fileRandomId = Str::uuid();
                $fileName = "chat_message_{$fileRandomId}.$fileExt";
                $filePath = $this::STORAGE_CHAT_FILES_PATH;
                Storage::disk($this->storageChatFileSystemDisk)->putFileAs($filePath, $file, $fileName);

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
        }

        return $results;
    }

    /**
     * Download chat file from storage
     */
    public function downloadChatFile(string $filePath): \Symfony\Component\HttpFoundation\StreamedResponse|null
    {
        if ($filePath === '') {
            return null;
        }
        return Storage::disk($this->storageChatFileSystemDisk)->download(
            "".$filePath
        );
    }


    /**
     * Delete a single chat file from storage by its path.
     */
    public function deleteChatFile(string $filePath): bool
    {
        if ($filePath === '') {
            return false;
        }
        return Storage::disk($this->storageChatFileSystemDisk)->delete($filePath);
    }

    /**
     * Delete multiple chat files from storage by their paths.
     */
    public function deleteChatFiles(iterable $filePaths): void
    {
        foreach ($filePaths as $path) {
            if (is_string($path) && $path !== '') {
                Storage::disk($this->storageChatFileSystemDisk)->delete($path);
            }
        }
    }

}
