<?php

use App\Enums\ChatTypes;
use App\Enums\ChatUserMembershipType;
use App\Enums\FileDisplayType;
use App\Enums\MessageDisplayType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('description')->nullable();
            $table->string('avatar_file_path')->nullable();
            $table->string('chat_type')->default(ChatTypes::DIALOG->value);
            $table->timestamps();
        });

        Schema::create('chat_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained("chats")->cascadeOnDelete();
            $table->foreignId('user_id')->constrained("users")->cascadeOnDelete();
            $table->string('membership_type')->default(ChatUserMembershipType::MEMBER->value);
            $table->timestamp("last_seen_at")->nullable();
            $table->timestamps();

            $table->index(["chat_id", "user_id"]);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained("chats")->cascadeOnDelete();
            $table->foreignId('user_id')->constrained("users")->cascadeOnDelete();
            $table->foreignId('reply_to_id')->nullable()->constrained("chat_messages")->nullOnDelete();
            $table->text('message_body')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->string('display_type', 20)->default(MessageDisplayType::MESSAGE->value);
            $table->boolean('is_edited')->default(false);
            $table->timestamp("edited_at")->nullable();
            $table->timestamps(3);

            $table->index(["chat_id", "user_id", "reply_to_id"]);
        });

        Schema::create('chat_message_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained("chat_messages")->cascadeOnDelete();
            $table->text('file_path');
            $table->string('extension', 10);
            $table->string('display_type', 20)->default(FileDisplayType::PREFER_PREVIEW->value);
            $table->timestamp("edited_at")->nullable();
            $table->timestamps();

            $table->index(["message_id"]);
        });

        Schema::create('chat_encryption_properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->unique()->constrained('chats')->cascadeOnDelete();
            $table->foreignId('initiator_device_id')->constrained('user_devices')->cascadeOnDelete();
            $table->foreignId('responder_device_id')->constrained('user_devices')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['chat_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_encryption_properties');
        Schema::dropIfExists('chat_message_files');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_users');
        Schema::dropIfExists('chats');
    }

};
