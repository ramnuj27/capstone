<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

$projectRoot = dirname(__DIR__);
$appKey = $_ENV['APP_KEY'] ?? $_SERVER['APP_KEY'] ?? getenv('APP_KEY') ?: null;

if (! is_string($appKey) || trim($appKey) === '') {
    $appKeyCachePath = $projectRoot.'/storage/framework/cache/railway-app.key';

    if (is_file($appKeyCachePath)) {
        $cachedAppKey = file_get_contents($appKeyCachePath);

        if (is_string($cachedAppKey) && trim($cachedAppKey) !== '') {
            $appKey = trim($cachedAppKey);
        }
    }

    if (! is_string($appKey) || trim($appKey) === '') {
        $appKey = 'base64:'.base64_encode(random_bytes(32));

        $cacheDirectory = dirname($appKeyCachePath);

        if (! is_dir($cacheDirectory)) {
            mkdir($cacheDirectory, 0755, true);
        }

        file_put_contents($appKeyCachePath, $appKey, LOCK_EX);
    }

    putenv("APP_KEY={$appKey}");
    $_ENV['APP_KEY'] = $appKey;
    $_SERVER['APP_KEY'] = $appKey;
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
