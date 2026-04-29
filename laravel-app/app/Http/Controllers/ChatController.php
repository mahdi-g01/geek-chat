<?php

namespace App\Http\Controllers;

use App\Enums\ChatTypes;
use App\Enums\ChatUserMembershipType;
use App\Enums\MessageDisplayType;
use App\Enums\SystemSettingKeys;
use App\Models\Chat;
use App\Models\ChatMessageFile;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\ChatManagementService;
use App\Services\DeviceManagerService;
use App\Services\StorageFilesServices;
use App\Services\StartupServices;
use Carbon\Carbon;
use Faker\Provider\Uuid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ChatController extends Controller
{

    protected StorageFilesServices $fileServices;
    protected DeviceManagerService $deviceManagerService;

    public function __construct(
        protected ChatManagementService $chatManagement
    ) {
        $this->fileServices = new StorageFilesServices();
        $this->deviceManagerService = new DeviceManagerService();
    }

    /**
     * List all chats with pagination (admin).
     */
    public function getAllChats(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Chat::class);

        $perPage = $request->integer('per_page', ChatManagementService::DEFAULT_PER_PAGE);
        $search = $request->string('search')->trim() ?: null;

        $paginator = $this->chatManagement->getPaginatedChats($perPage, $search);

        return jsonResponse([
            'chats' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Get detailed chat information (admin).
     */
    public function getChat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chat_id' => 'required|exists:chats,id',
        ]);

        $details = $this->chatManagement->getDetailedChat($validated['chat_id']);
        if ($details === null) {
            return jsonResponse([], false, __("chat-system.chat_not_found"), 404);
        }

        Gate::authorize('view', $details["chat_model"]);

        return jsonResponse($details);
    }

    /**
     * @throws ValidationException
     */
    public function getUsersChats(Request $request): JsonResponse
    {
        $publicKey = $request->header("X-Device-Public-Key");
        $currentDevice = $this->deviceManagerService->findDeviceByUserAndPublicKey(Auth::id(), $publicKey);;

        $query = Chat::query()
            ->with(["members", "lastMessageModel", "encryptionProperty"])
            ->orderBy("updated_at", "desc")
            ->whereHas("members", function ($query) {
                $query->where("user_id", Auth::id());
            });

        if ($currentDevice !== null) {
            $query->whereDoesntHave("encryptionProperty", function ($query) use ($currentDevice) {
                $query->where("initiator_device_id", "!=", $currentDevice->id)
                    ->where("responder_device_id", "!=", $currentDevice->id);
            });
        } else {
            $query->whereDoesntHave("encryptionProperty");
        }

        $chats = $query->get();

        foreach ($chats as $chat) {
            $chatUser = $chat->members->where("user_id", Auth::id())->first();
            $hasUnseenEvent = $chatUser->last_seen_at < $chat->updated_at;
            $chat["has_unseen_event"] = $hasUnseenEvent;
        }

        return jsonResponse([
            "chats" => $chats
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function getOrCreateDialog(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'receiver_user_id' => 'required|exists:users,id',
        ]);

        $requestUserId = Auth::id();
        $receiverUserId = $validator->validated()["receiver_user_id"];

        $chats = Chat::query()
            ->with(["members", "lastMessageModel"])
            ->where("chat_type", ChatTypes::DIALOG)
            ->whereHas('members', function ($query) use ($requestUserId, $receiverUserId) {
                $query->whereIn("user_id", [
                    $requestUserId,
                    $receiverUserId
                ]);
            }, '=', 2)
            ->has('members', '=', 2)
            ->get();

        $chat = null;
        foreach ($chats as $loopChat) {
            $memberOne = $loopChat->members->where("user_id", $requestUserId)->first();
            $memberTwo = $loopChat->members->where("user_id", $receiverUserId)->first();
            if ($memberOne && $memberTwo) {
                $chat = $loopChat;
                break;
            }
        }

        if ($chat == null) {

            Gate::authorize("create", Chat::class);

            $chat = Chat::query()->create([
                "chat_type" => ChatTypes::DIALOG
            ]);
            $chat->members()->create([
                "user_id" => $requestUserId,
                "membership_type" => ChatUserMembershipType::MEMBER,
            ]);
            $chat->members()->create([
                "user_id" => $receiverUserId,
                "membership_type" => ChatUserMembershipType::MEMBER,
            ]);

        } else {
            Gate::authorize("view", $chat);
        }

        $chat->load(["members", "lastMessageModel"]);

        return jsonResponse([
            "chat" => $chat
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function getOrCreateEncryptedDialog(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'receiver_user_id' => 'required|exists:users,id',
        ]);

        $requestUserPublicKey = $request->header("X-Device-Public-Key");
        $requestUserId = Auth::id();
        $receiverUserId = $validator->validated()["receiver_user_id"];

        $initiatorDevice = $this->deviceManagerService->findDeviceByUserAndPublicKey($requestUserId, $requestUserPublicKey);
        if ($initiatorDevice === null) {
            return jsonResponse([], false, __("auth.device_not_registered"), 403);
        }

        $receiver = User::query()->with("lastActiveDevice")->find($receiverUserId);
        $targetDevice = $receiver?->lastActiveDevice;
        if ($targetDevice === null) {
            return jsonResponse([], false, __("auth.other_user_no_device"), 403);
        }

        $chat = Chat::query()
            ->with(["members", "lastMessageModel"])
            ->where("chat_type", ChatTypes::ENCRYPTED_DIALOG)
            ->whereHas("members", function ($query) use ($requestUserId, $receiverUserId) {
                $query->whereIn("user_id", [$requestUserId, $receiverUserId]);
            }, "=", 2)
            ->has("members", "=", 2)
            ->whereHas("encryptionProperty", function ($query) use ($initiatorDevice) {
                $query->where("initiator_device_id", $initiatorDevice->id)
                    ->orWhere("responder_device_id", $initiatorDevice->id);
            })
            ->first();

        if ($chat === null) {
            Gate::authorize("create", Chat::class);

            $chat = Chat::query()->create([
                "chat_type" => ChatTypes::ENCRYPTED_DIALOG,
            ]);
            $chat->members()->create([
                "user_id" => $requestUserId,
                "membership_type" => ChatUserMembershipType::MEMBER,
            ]);
            $chat->members()->create([
                "user_id" => $receiverUserId,
                "membership_type" => ChatUserMembershipType::MEMBER,
            ]);
            $chat->encryptionProperty()->create([
                "initiator_device_id" => $initiatorDevice->id,
                "responder_device_id" => $targetDevice->id,
            ]);
        } else {
            Gate::authorize("view", $chat);
        }

        $chat->load(["members", "lastMessageModel", "encryptionProperty"]);

        return jsonResponse([
            "chat" => $chat
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function getChatMessages(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|exists:chats,id',
            'load_from_ts' => 'nullable|date',
            'load_until_ts' => 'nullable|date',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $input = $validator->validated();

        $chat = Chat::query()
            ->with(["messages.user", "encryptionProperty"])
            ->find($input["chat_id"]);

        Gate::authorize("view", $chat);

        if ($chat->relationLoaded("encryptionProperty") && $chat->encryptionProperty !== null) {
            if (!$this->currentDeviceCanAccessEncryptedChat($request, $chat)) {
                return jsonResponse([], false, __("auth.device_not_registered"), 403);
            }
        }

        $messages = $chat->messages()
            ->with(["user", "files"]);

        if (isset($input["load_from_ts"])) {
            $lastMessageDate = Carbon::parse($input["load_from_ts"]);
            $messages = $messages->where("created_at", ">=", $lastMessageDate);
        }

        if (isset($input["load_until_ts"])) {
            $lastMessageDate = Carbon::parse($input["load_until_ts"]);
            $messages = $messages->where("created_at", "<", $lastMessageDate);
        }

        if (isset($input["limit"])) {
            $messages = $messages->limit($input["limit"]);
        }

        $messages = $messages->orderBy("created_at", "desc")->get();

        $chat->members()->where("user_id", Auth::id())->update([
            "last_seen_at" => Carbon::now()
        ]);

        $data = ["messages" => $messages];
        if ($chat->encryptionProperty !== null) {
            $data["encryption_property"] = $chat->encryptionProperty;
        }

        return jsonResponse($data);
    }

    /**
     * @throws ValidationException
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:1|max:255',
        ]);

        $input = $validator->validated();

        $userResults = User::query()
            ->whereLike('public_name', '%' . $input["query"] . '%')
            ->orWhereLike('user_name', '%' . $input["query"] . '%')
            ->orWhereLike('phone_number', '%' . $input["query"] . '%')
            ->limit(15)
            ->get();

        return jsonResponse([
            "users" => $userResults,
        ]);
    }

    /**
     * @throws ValidationException
     */
    public function sendMessage(Request $request): JsonResponse
    {
        // Here we check the maximum file size that admin have set
        // And if there is non defined, we just set the maximum
        // as the amount of free space left on the device

        $fileSizeLimitation = SystemSetting::get(SystemSettingKeys::MAXIMUM_CHAT_FILE_SIZE);
        if ($fileSizeLimitation == null)
            $fileSizeLimitation = $this->fileServices->freeSpaceLeftInKb();

        $fileAcceptedMimeTypes = SystemSetting::get(SystemSettingKeys::ACCEPTED_CHAT_FILE_MIMES);
        if ($fileAcceptedMimeTypes == null)
            $fileAcceptedMimeTypes = "jpg,jpeg,png,gif,mp4,zip,rar,mp3";

        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|exists:chats,id',
            'reply_to_id' => 'nullable|int',
            'message' => 'nullable|string|min:1|max:10000',
            'files' => "nullable|required_without:message|array",
            'files.*' => "file|mimes:$fileAcceptedMimeTypes|max:$fileSizeLimitation",
        ]);

        $input = $validator->validated();

        $chat = Chat::query()
            ->with("encryptionProperty")
            ->where('id', $input["chat_id"])
            ->first();

        Gate::authorize("update", $chat);

        if ($chat->encryptionProperty !== null) {
            if (!$this->currentDeviceCanAccessEncryptedChat($request, $chat)) {
                return jsonResponse([], false, __("auth.device_not_registered"), 403);
            }
        }

        // Checking if the provided repliable message is valid
        if (isset($input["reply_to_id"]) && !$chat->messages()->where("id", $input["reply_to_id"])->exists()) {
            return jsonResponse(status: false, message: __("chat-system.invalid_provided_message_for_reply"));
        }

        $messageModel = $chat->messages()->create([
            "user_id" => Auth::id(),
            "reply_to_id" => $input["reply_to_id"] ?? null,
            "message_body" => $input["message"],
            "metadata" => [],
            "display_type" => MessageDisplayType::MESSAGE
        ]);

        $responseData = [];

        // Handling files if chat is not encrypted
        if ($chat->chat_type != ChatTypes::ENCRYPTED_DIALOG) {

            if ($request->hasFile("files")) {
                $fileStoreResults = $this->fileServices->storeChatFile($request->file("files"), $messageModel);
            }

            if (isset($fileStoreResults) && $fileStoreResults != null) {
                $responseData["file_upload_results"] = $fileStoreResults;
            }

        }

        $chat->update([
            "updated_at" => Carbon::now()
        ]);

        return jsonResponse($responseData);
    }

    /**
     * @throws ValidationException
     */
    public function downloadMessageFile(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|exists:chats,id',
            'message_id' => 'required|exists:chat_messages,id',
            'file_id' => 'required|exists:chat_message_files,id',
        ]);

        $input = $validator->validated();

        $chat = Chat::query()
            ->with([
                "members.user",
                "messages.files",
            ])
            ->where('id', $input["chat_id"])
            ->first();

        Gate::authorize("view", $chat);

        $messageModel = $chat->messages()
            ->where("id", $input["message_id"])
            ->whereHas("files", function ($query) use ($input) {
                $query->where("id", $input["file_id"]);
            })
            ->first();

        if ($messageModel == null) {
            return jsonResponse(status: false, message: __("chat-system.message_not_found"));
        }

        $fileModel = ChatMessageFile::query()->find($input["file_id"]);

        return $this->fileServices->downloadChatFile($fileModel->file_path);
    }

    /**
     * Delete a chat (admin only).
     *
     */
    public function deleteChat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'chat_id' => 'required|exists:chats,id',
        ]);

        $chat = $this->chatManagement->findChat((int) $validated['chat_id']);
        if ($chat === null) {
            return jsonResponse([], false, __("chat-system.chat_not_found"), 404);
        }

        Gate::authorize('delete', $chat);

        $this->chatManagement->deleteChat($chat);

        return jsonResponse([], true, __("chat-system.chat_deleted"));
    }

    private function currentDeviceCanAccessEncryptedChat(Request $request, Chat $chat): bool
    {
        $publicKey = $request->header("X-Device-Public-Key");
        $device = $this->deviceManagerService->findDeviceByUserAndPublicKey(Auth::id(), $publicKey);
        if ($device === null) {
            return false;
        }

        $enc = $chat->relationLoaded("encryptionProperty") ? $chat->encryptionProperty : $chat->encryptionProperty()->first();
        if ($enc === null) {
            return true;
        }

        return (int) $enc->initiator_device_id === (int) $device->id
            || (int) $enc->responder_device_id === (int) $device->id;
    }

}
