<?php

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

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('public_name', 255)->nullable();
            $table->string('user_name', 255);
            $table->boolean('is_banned')->default(false);
            $table->string('password');
            $table->text('preferences');
            $table->string('phone_number')->nullable();
            $table->text('bio_text')->nullable();
            $table->string('avatar_file_path')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->timestamp('banned_at')->nullable();
            $table->timestamp("last_seen_at")->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('user_devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('public_key');
            $table->string('device_name', 255)->nullable();
            $table->string('device_type', 64)->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['user_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('last_active_device_id')
                ->nullable()
                ->after('last_seen_at')
                ->constrained('user_devices')
                ->nullOnDelete();
        });

        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained("users")->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('user_block_list', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained("users")->cascadeOnDelete();
            $table->foreignId('target_id')->constrained("users")->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('sign_up_tokens', function (Blueprint $table) {
            $table->string('phone')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('phone')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('expires_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sign_up_tokens');
        Schema::dropIfExists('user_block_list');
        Schema::dropIfExists('admins');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['last_active_device_id']);
        });
        Schema::dropIfExists('user_devices');
        Schema::dropIfExists('users');
    }
};
