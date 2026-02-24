<?php

namespace App\Http\Routes;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;


Route::get('/user-chats', [ChatController::class, 'getUsersChats']);

Route::get('/search-users', [ChatController::class, 'searchUsers']);

Route::get('/chat-messages', [ChatController::class, 'getChatMessages']);

Route::post('/make-dialog', [ChatController::class, 'getOrCreateDialog']);

Route::post('/initiate-encrypted-dialog', [ChatController::class, 'getOrCreateEncryptedDialog']);

Route::post('/send-message', [ChatController::class, 'sendMessage']);

Route::get('/download-file', [ChatController::class, 'downloadMessageFile']);


Route::post('/update-avatar', [ProfileController::class, 'updateAvatar']);

Route::post('/update-profile', [ProfileController::class, 'updateInfo']);
