<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\User;
use App\Services\StorageFilesServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{

    protected StorageFilesServices $fileService;

    public function __construct()
    {
        $this->fileService = new StorageFilesServices();
    }

    public function getDashboardInfo(Request $request): JsonResponse
    {
        $todayMessages = ChatMessage::query()->whereDate("created_at", today())->count();
        $totalMessages = ChatMessage::all()->count();
        $totalUsers = User::all()->count();
        $availableFileSpace = $this->fileService->freeSystemSpaceLeftInKb();
        $occupiedFileSpace = $this->fileService->occupiedStorageSpaceInKb() ?? 0;
        $latestUsers = User::query()->orderBy("created_at", "desc")->take(12)->get();

        return jsonResponse([
            "today_messages" => $todayMessages,
            "total_messages" => $totalMessages,
            "total_users" => $totalUsers,
            "available_file_space_kb" => $availableFileSpace,
            "occupied_space_kb" => $occupiedFileSpace,
            "latest_users" => $latestUsers,
        ]);
    }

}
