<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDevice;
use Carbon\Carbon;

class DeviceManagerService
{

    public function findDeviceByUserAndPublicKey(int $userId, string|null $publicKey): ?UserDevice
    {
        if ($publicKey === null) {
            return null;
        }
        return UserDevice::query()
            ->where("user_id", $userId)
            ->where("public_key", $publicKey)
            ->first();
    }

    public function registerDevice(
        int $userId,
        string $publicKey,
        ?string $deviceName = null,
        ?string $deviceType = null
    ): UserDevice {
        $device = UserDevice::query()->create([
            "user_id" => $userId,
            "public_key" => $publicKey,
            "device_name" => $deviceName,
            "device_type" => $deviceType,
            "last_used_at" => Carbon::now(),
        ]);

        User::query()->where("id", $userId)->update([
            "last_active_device_id" => $device->id,
        ]);

        return $device;
    }

    public function ensureDeviceForUser(
        int $userId,
        string $publicKey,
        ?string $deviceName = null,
        ?string $deviceType = null
    ): UserDevice {
        $device = $this->findDeviceByUserAndPublicKey($userId, $publicKey);

        if ($device === null) {
            return $this->registerDevice($userId, $publicKey, $deviceName, $deviceType);
        }

        $device->update(["last_used_at" => Carbon::now()]);
        User::query()->where("id", $userId)->update([
            "last_active_device_id" => $device->id,
        ]);

        return $device;
    }

    public function updateLastActiveDevice(int $userId, string $publicKey): bool
    {
        $device = $this->findDeviceByUserAndPublicKey($userId, $publicKey);

        if ($device === null) {
            return false;
        }

        $device->update(["last_used_at" => Carbon::now()]);
        User::query()->where("id", $userId)->update([
            "last_active_device_id" => $device->id,
        ]);

        return true;
    }

    public function removeDeviceForUser(int $userId, string $publicKey): void
    {
        $device = $this->findDeviceByUserAndPublicKey($userId, $publicKey);

        if ($device === null) {
            return;
        }

        User::query()
            ->where("id", $userId)
            ->where("last_active_device_id", $device->id)
            ->update(["last_active_device_id" => null]);

        $device->delete();
    }

}
