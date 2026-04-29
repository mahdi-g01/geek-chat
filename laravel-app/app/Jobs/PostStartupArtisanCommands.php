<?php

namespace App\Jobs;

use App\Enums\StartupStages;
use App\Enums\SystemSettingKeys;
use App\Models\SystemSetting;
use App\Services\StartupServices;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class PostStartupArtisanCommands implements ShouldQueue
{
    use Queueable;

    protected StartupServices $startupServices;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->startupServices = new StartupServices();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

//        $this->startupServices->handleStorageFolderLink();

//        $this->startupServices->cacheConfig();

    }

}
