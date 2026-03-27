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
    expect(data_get($railwayConfig, 'deploy'))->not->toHaveKey('startCommand');
    expect(data_get($railwayConfig, 'deploy.preDeployCommand'))->toBe('php artisan config:clear && php artisan migrate --force');
    expect(data_get($railwayConfig, 'deploy.healthcheckPath'))->toBe('/up');
});

test('database config supports Railway MySQL and PostgreSQL service variables', function (): void {
    $databaseConfig = file_get_contents(dirname(__DIR__, 2).'/config/database.php');

    expect($databaseConfig)
        ->not->toBeFalse()
        ->toContain("\$railwayMysqlDetected = (bool) (env('MYSQL_URL') ?? env('MYSQLHOST'));")
        ->toContain("\$railwayPgsqlDetected = (bool) (env('DATABASE_URL') ?? env('PGHOST'));")
        ->toContain('$railwayDatabaseConnection = $railwayMysqlDetected')
        ->toContain("'default' => env('DB_CONNECTION', \$railwayDatabaseConnection)")
        ->toContain("\$mysqlHost = \$railwayMysqlDetected ? env('MYSQLHOST', env('DB_HOST', '127.0.0.1')) : env('DB_HOST', env('MYSQLHOST', '127.0.0.1'));")
        ->toContain("\$mysqlPort = \$railwayMysqlDetected ? env('MYSQLPORT', env('DB_PORT', '3306')) : env('DB_PORT', env('MYSQLPORT', '3306'));")
        ->toContain("\$mysqlDatabase = \$railwayMysqlDetected ? env('MYSQLDATABASE', env('DB_DATABASE', 'laravel')) : env('DB_DATABASE', env('MYSQLDATABASE', 'laravel'));")
        ->toContain("\$mysqlUsername = \$railwayMysqlDetected ? env('MYSQLUSER', env('DB_USERNAME', 'root')) : env('DB_USERNAME', env('MYSQLUSER', 'root'));")
        ->toContain("\$mysqlPassword = \$railwayMysqlDetected ? env('MYSQLPASSWORD', env('DB_PASSWORD', '')) : env('DB_PASSWORD', env('MYSQLPASSWORD', ''));")
        ->toContain("\$pgsqlHost = \$railwayPgsqlDetected ? env('PGHOST', env('DB_HOST', '127.0.0.1')) : env('DB_HOST', env('PGHOST', '127.0.0.1'));")
        ->toContain("\$pgsqlPort = \$railwayPgsqlDetected ? env('PGPORT', env('DB_PORT', '5432')) : env('DB_PORT', env('PGPORT', '5432'));")
        ->toContain("\$pgsqlDatabase = \$railwayPgsqlDetected ? env('PGDATABASE', env('DB_DATABASE', 'laravel')) : env('DB_DATABASE', env('PGDATABASE', 'laravel'));")
        ->toContain("\$pgsqlUsername = \$railwayPgsqlDetected ? env('PGUSER', env('DB_USERNAME', 'root')) : env('DB_USERNAME', env('PGUSER', 'root'));")
        ->toContain("\$pgsqlPassword = \$railwayPgsqlDetected ? env('PGPASSWORD', env('DB_PASSWORD', '')) : env('DB_PASSWORD', env('PGPASSWORD', ''));")
        ->toContain("'host' => \$mysqlHost")
        ->toContain("'username' => \$mysqlUsername")
        ->toContain("'password' => \$mysqlPassword")
        ->toContain("'host' => \$pgsqlHost")
        ->toContain("'username' => \$pgsqlUsername")
        ->toContain("'password' => \$pgsqlPassword");
});

test('app config can derive the hosted url from Railway when APP_URL is missing', function (): void {
    $appConfig = file_get_contents(dirname(__DIR__, 2).'/config/app.php');

    expect($appConfig)
        ->not->toBeFalse()
        ->toContain("env('RAILWAY_PUBLIC_DOMAIN')")
        ->toContain("'https://'.env('RAILWAY_PUBLIC_DOMAIN')");
});

test('hosted defaults avoid forcing database-backed sessions cache and queues', function (): void {
    $sessionConfig = file_get_contents(dirname(__DIR__, 2).'/config/session.php');
    $cacheConfig = file_get_contents(dirname(__DIR__, 2).'/config/cache.php');
    $queueConfig = file_get_contents(dirname(__DIR__, 2).'/config/queue.php');
    $environmentExample = file_get_contents(dirname(__DIR__, 2).'/.env.example');

    expect($sessionConfig)
        ->not->toBeFalse()
        ->toContain("\$productionEnvironment = env('APP_ENV', 'production') === 'production';")
        ->toContain("'driver' => env('SESSION_DRIVER', \$productionEnvironment ? 'file' : 'database')");

    expect($cacheConfig)
        ->not->toBeFalse()
        ->toContain("\$productionEnvironment = env('APP_ENV', 'production') === 'production';")
        ->toContain("'default' => env('CACHE_STORE', \$productionEnvironment ? 'file' : 'database')");

    expect($queueConfig)
        ->not->toBeFalse()
        ->toContain("\$productionEnvironment = env('APP_ENV', 'production') === 'production';")
        ->toContain("'default' => env('QUEUE_CONNECTION', \$productionEnvironment ? 'sync' : 'database')");

    expect($environmentExample)
        ->not->toBeFalse()
        ->toContain('SESSION_DRIVER=file')
        ->toContain('CACHE_STORE=file')
        ->toContain('QUEUE_CONNECTION=sync');
});
