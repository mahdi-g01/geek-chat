<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use JetBrains\PhpStorm\ArrayShape;

class ChatManagementService
{
    public function __construct(
        protected StorageFilesServices $storageFilesServices
    ) {}

    public const DEFAULT_PER_PAGE = 20;
    public const MAX_PER_PAGE = 100;

    /**
     * Get paginated chats for admin listing.
     */
    public function getPaginatedChats(int $perPage = self::DEFAULT_PER_PAGE, ?string $search = null): LengthAwarePaginator
    {
        $perPage = min(max((int) $perPage, 1), self::MAX_PER_PAGE);

        $query = Chat::query()
            ->with(['members', 'lastMessageModel', 'encryptionProperty'])
            ->orderByDesc('updated_at');

        if ($search !== null && trim($search) !== '') {
            $term = '%' . trim($search) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)
                    ->orWhere('description', 'like', $term);
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Find a chat by id.
     */
    public function findChat(int $id, ?array $additionalRelations = []): ?Chat
    {
        return Chat::query()->with(['members', 'lastMessageModel', ...$additionalRelations])->find($id);
    }

    /**
     * Find a chat and its details by id.
     */
    #[ArrayShape(["chat_model" => Chat::class, "users" => "array", "files_count" => "int", "messages_count" => "int", "files_size" => "int"])]
    public function getDetailedChat(int $id): ?array
    {
        $chat = $this->findChat($id, [
            "messages.files",
            "members.user"
        ])->makeHidden([
            "messages",
            "last_message_model",
            "last_message",
        ]);
        if ($chat == null) {
            return null;
        }
        $filesCountSum = 0;
        $fileSizeSum = 0;
        foreach ($chat->messages as $message) {
            $filesCountSum += sizeof($message->files);
            foreach ($message->files as $file) {
                $fileSizeSum += ($file->size);
            }
        }
        return [
            "chat_model" => $chat,
            "users" => $chat->members->map(fn ($member) => $member->user),
            "messages_count" => $chat->messages()->count(),
            "files_count" => $filesCountSum,
            "files_size" => ($fileSizeSum / 1024) // Bytes to killobytes
        ];
    }

    /**
     * Permanently delete a chat and its related data (cascade will handle members, messages, etc.).
     * All related chat files are deleted from storage before the chat is removed.
     */
    public function deleteChat(Chat $chat): void
    {
        $chat->loadMissing('messages.files');
        $filePaths = $chat->messages->flatMap(fn ($message) => $message->files->pluck('file_path'));
        $this->storageFilesServices->deleteChatFiles($filePaths);
        $chat->delete();
    }
}
