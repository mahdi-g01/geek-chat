<?php

namespace App\Http\Routes;

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\SystemSettingsController;
use App\Http\Controllers\UsersController;
use Illuminate\Support\Facades\Route;


Route::get('/system-settings', [SystemSettingsController::class, 'getSystemSettings']);

Route::post('/system-settings', [SystemSettingsController::class, 'setSystemSettings']);

Route::get('/admin-dashboard', [AdminController::class, 'getDashboardInfo']);

// Users

Route::get('/all-users', [UsersController::class, 'getAllUsers']);

Route::get('/get-user', [UsersController::class, 'getUser']);

Route::post('/create-user', [UsersController::class, 'createUser']);

Route::put('/update-user', [UsersController::class, 'updateUser']);

Route::delete('/delete-user', [UsersController::class, 'deleteUser']);

Route::post('/ban-user', [UsersController::class, 'banUser']);

Route::post('/unban-user', [UsersController::class, 'unbanUser']);

// Chats

Route::get('/all-chats', [ChatController::class, 'getAllChats']);

Route::get('/get-chat', [ChatController::class, 'getChat']);

Route::delete('/delete-chat', [ChatController::class, 'deleteChat']);
