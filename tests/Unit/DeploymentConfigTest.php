<?php

test('composer requires php 8.4 or newer for deployment targets', function (): void {
    $projectRoot = dirname(__DIR__, 2);
    $composer = json_decode(
        file_get_contents($projectRoot.'/composer.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(data_get($composer, 'require.php'))->toBe('^8.4');
});

test('github actions test matrix matches the supported php versions', function (): void {
    $projectRoot = dirname(__DIR__, 2);
    $workflow = file_get_contents($projectRoot.'/.github/workflows/tests.yml');

    expect($workflow)
        ->not->toBeFalse()
        ->toContain("'8.4'")
        ->toContain("'8.5'")
        ->not->toContain("'8.3'");
});

test('railway deployment config serves Laravel and runs migrations before start', function (): void {
    $projectRoot = dirname(__DIR__, 2);
    $railwayConfig = json_decode(
        file_get_contents($projectRoot.'/railway.json'),
        true,
        flags: JSON_THROW_ON_ERROR,
    );

    expect(data_get($railwayConfig, 'build.builder'))->toBe('RAILPACK');
    expect(data_get($railwayConfig, 'deploy.startCommand'))->toBe('php artisan serve --host=0.0.0.0 --port=${PORT}');
    expect(data_get($railwayConfig, 'deploy.preDeployCommand'))->toBe('php artisan migrate --force');
    expect(data_get($railwayConfig, 'deploy.healthcheckPath'))->toBe('/up');
});

test('database config supports Railway MySQL service variables', function (): void {
    $databaseConfig = file_get_contents(dirname(__DIR__, 2).'/config/database.php');

    expect($databaseConfig)
        ->not->toBeFalse()
        ->toContain("\$railwayMysqlDetected = (bool) (env('MYSQL_URL') ?? env('MYSQLHOST'));")
        ->toContain("'default' => env('DB_CONNECTION', \$railwayMysqlDetected ? 'mysql' : 'sqlite')")
        ->toContain("'url' => env('DB_URL', env('MYSQL_URL'))")
        ->toContain("'host' => env('DB_HOST', env('MYSQLHOST', '127.0.0.1'))")
        ->toContain("'port' => env('DB_PORT', env('MYSQLPORT', '3306'))")
        ->toContain("'database' => env('DB_DATABASE', env('MYSQLDATABASE', 'laravel'))")
        ->toContain("'username' => env('DB_USERNAME', env('MYSQLUSER', 'root'))")
        ->toContain("'password' => env('DB_PASSWORD', env('MYSQLPASSWORD', ''))");
});
