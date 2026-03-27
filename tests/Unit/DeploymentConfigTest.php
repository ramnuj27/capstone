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
        ->toContain('$filledEnvironmentValue = static function (mixed ...$values): mixed {')
        ->toContain("\$railwayMysqlDetected = \$filledEnvironmentValue(env('MYSQL_URL'), env('MYSQLHOST')) !== null;")
        ->toContain("\$railwayPgsqlDetected = \$filledEnvironmentValue(env('DATABASE_URL'), env('PGHOST')) !== null;")
        ->toContain('$railwayDatabaseConnection = $railwayMysqlDetected')
        ->toContain("\$databaseConnection = \$filledEnvironmentValue(env('DB_CONNECTION'), \$railwayDatabaseConnection);")
        ->toContain("'default' => \$databaseConnection")
        ->toContain('$mysqlHost = $railwayMysqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('MYSQLHOST'), env('DB_HOST'), '127.0.0.1')")
        ->toContain(": \$filledEnvironmentValue(env('DB_HOST'), env('MYSQLHOST'), '127.0.0.1');")
        ->toContain('$mysqlPort = $railwayMysqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('MYSQLPORT'), env('DB_PORT'), '3306')")
        ->toContain(": \$filledEnvironmentValue(env('DB_PORT'), env('MYSQLPORT'), '3306');")
        ->toContain('$mysqlDatabase = $railwayMysqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('MYSQLDATABASE'), env('DB_DATABASE'), 'laravel')")
        ->toContain(": \$filledEnvironmentValue(env('DB_DATABASE'), env('MYSQLDATABASE'), 'laravel');")
        ->toContain('$mysqlUsername = $railwayMysqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('MYSQLUSER'), env('DB_USERNAME'), 'root')")
        ->toContain(": \$filledEnvironmentValue(env('DB_USERNAME'), env('MYSQLUSER'), 'root');")
        ->toContain('$mysqlPassword = $railwayMysqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('MYSQLPASSWORD'), env('DB_PASSWORD'), '')")
        ->toContain(": \$filledEnvironmentValue(env('DB_PASSWORD'), env('MYSQLPASSWORD'), '');")
        ->toContain('$pgsqlHost = $railwayPgsqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('PGHOST'), env('DB_HOST'), '127.0.0.1')")
        ->toContain(": \$filledEnvironmentValue(env('DB_HOST'), env('PGHOST'), '127.0.0.1');")
        ->toContain('$pgsqlPort = $railwayPgsqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('PGPORT'), env('DB_PORT'), '5432')")
        ->toContain(": \$filledEnvironmentValue(env('DB_PORT'), env('PGPORT'), '5432');")
        ->toContain('$pgsqlDatabase = $railwayPgsqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('PGDATABASE'), env('DB_DATABASE'), 'laravel')")
        ->toContain(": \$filledEnvironmentValue(env('DB_DATABASE'), env('PGDATABASE'), 'laravel');")
        ->toContain('$pgsqlUsername = $railwayPgsqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('PGUSER'), env('DB_USERNAME'), 'root')")
        ->toContain(": \$filledEnvironmentValue(env('DB_USERNAME'), env('PGUSER'), 'root');")
        ->toContain('$pgsqlPassword = $railwayPgsqlDetected')
        ->toContain("? \$filledEnvironmentValue(env('PGPASSWORD'), env('DB_PASSWORD'), '')")
        ->toContain(": \$filledEnvironmentValue(env('DB_PASSWORD'), env('PGPASSWORD'), '');")
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

test('bootstrap app provisions a persistent fallback app key when APP_KEY is missing', function (): void {
    $bootstrapApp = file_get_contents(dirname(__DIR__, 2).'/bootstrap/app.php');

    expect($bootstrapApp)
        ->not->toBeFalse()
        ->toContain("\$_ENV['APP_KEY'] ?? \$_SERVER['APP_KEY'] ?? getenv('APP_KEY') ?: null;")
        ->toContain("\$appKeyCachePath = \$projectRoot.'/storage/framework/cache/railway-app.key';")
        ->toContain("\$appKey = 'base64:'.base64_encode(random_bytes(32));")
        ->toContain('file_put_contents($appKeyCachePath, $appKey, LOCK_EX);')
        ->toContain('putenv("APP_KEY={$appKey}");');
});

test('bootstrap app trusts forwarded proxy headers for hosted https deployments', function (): void {
    $bootstrapApp = file_get_contents(dirname(__DIR__, 2).'/bootstrap/app.php');

    expect($bootstrapApp)
        ->not->toBeFalse()
        ->toContain('$middleware->trustProxies(')
        ->toContain("at: '*'")
        ->toContain('Request::HEADER_X_FORWARDED_PROTO')
        ->toContain('Request::HEADER_X_FORWARDED_AWS_ELB');
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
