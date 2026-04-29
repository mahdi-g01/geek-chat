<?php

namespace App\Providers;

use App\Models\Chat;
use App\Models\SystemSetting;
use App\Models\User;
use App\Policies\ChatPolicy;
use App\Policies\SystemSettingPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        // Setting model policies
        Gate::policy(Chat::class, ChatPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(SystemSetting::class, SystemSettingPolicy::class);
        RateLimiter::for('api', function (Request $request) {
            return [
                Limit::perMinute(500),
                Limit::perMinutes(1, 60)->by($request->ip()),
            ];
        });
    }
}
