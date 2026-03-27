<?php

use Illuminate\Support\Str;
use Pdo\Mysql;

$filledEnvironmentValue = static function (mixed ...$values): mixed {
    foreach ($values as $value) {
        if (! blank($value)) {
            return $value;
        }
    }

    return null;
};

$railwayMysqlDetected = $filledEnvironmentValue(env('MYSQL_URL'), env('MYSQLHOST')) !== null;
$railwayPgsqlDetected = $filledEnvironmentValue(env('DATABASE_URL'), env('PGHOST')) !== null;
$railwayDatabaseConnection = $railwayMysqlDetected
    ? 'mysql'
    : ($railwayPgsqlDetected ? 'pgsql' : 'sqlite');

$databaseConnection = $filledEnvironmentValue(env('DB_CONNECTION'), $railwayDatabaseConnection);
$databaseUrl = $filledEnvironmentValue(env('DB_URL'));
$mysqlUrl = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQL_URL'), $databaseUrl)
    : $filledEnvironmentValue($databaseUrl, env('MYSQL_URL'));
$mysqlHost = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQLHOST'), env('DB_HOST'), '127.0.0.1')
    : $filledEnvironmentValue(env('DB_HOST'), env('MYSQLHOST'), '127.0.0.1');
$mysqlPort = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQLPORT'), env('DB_PORT'), '3306')
    : $filledEnvironmentValue(env('DB_PORT'), env('MYSQLPORT'), '3306');
$mysqlDatabase = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQLDATABASE'), env('DB_DATABASE'), 'laravel')
    : $filledEnvironmentValue(env('DB_DATABASE'), env('MYSQLDATABASE'), 'laravel');
$mysqlUsername = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQLUSER'), env('DB_USERNAME'), 'root')
    : $filledEnvironmentValue(env('DB_USERNAME'), env('MYSQLUSER'), 'root');
$mysqlPassword = $railwayMysqlDetected
    ? $filledEnvironmentValue(env('MYSQLPASSWORD'), env('DB_PASSWORD'), '')
    : $filledEnvironmentValue(env('DB_PASSWORD'), env('MYSQLPASSWORD'), '');
$pgsqlUrl = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('DATABASE_URL'), $databaseUrl)
    : $filledEnvironmentValue($databaseUrl, env('DATABASE_URL'));
$pgsqlHost = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGHOST'), env('DB_HOST'), '127.0.0.1')
    : $filledEnvironmentValue(env('DB_HOST'), env('PGHOST'), '127.0.0.1');
$pgsqlPort = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGPORT'), env('DB_PORT'), '5432')
    : $filledEnvironmentValue(env('DB_PORT'), env('PGPORT'), '5432');
$pgsqlDatabase = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGDATABASE'), env('DB_DATABASE'), 'laravel')
    : $filledEnvironmentValue(env('DB_DATABASE'), env('PGDATABASE'), 'laravel');
$pgsqlUsername = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGUSER'), env('DB_USERNAME'), 'root')
    : $filledEnvironmentValue(env('DB_USERNAME'), env('PGUSER'), 'root');
$pgsqlPassword = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGPASSWORD'), env('DB_PASSWORD'), '')
    : $filledEnvironmentValue(env('DB_PASSWORD'), env('PGPASSWORD'), '');
$pgsqlSslMode = $railwayPgsqlDetected
    ? $filledEnvironmentValue(env('PGSSLMODE'), env('DB_SSLMODE'), 'prefer')
    : $filledEnvironmentValue(env('DB_SSLMODE'), env('PGSSLMODE'), 'prefer');

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for database operations. This is
    | the connection which will be utilized unless another connection
    | is explicitly specified when you execute a query / statement.
    |
    */

    'default' => $databaseConnection,

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Below are all of the database connections defined for your application.
    | An example configuration is provided for each database system which
    | is supported by Laravel. You're free to add / remove connections.
    |
    */

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
            'transaction_mode' => 'DEFERRED',
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => $mysqlUrl,
            'host' => $mysqlHost,
            'port' => $mysqlPort,
            'database' => $mysqlDatabase,
            'username' => $mysqlUsername,
            'password' => $mysqlPassword,
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'mariadb' => [
            'driver' => 'mariadb',
            'url' => $mysqlUrl,
            'host' => $mysqlHost,
            'port' => $mysqlPort,
            'database' => $mysqlDatabase,
            'username' => $mysqlUsername,
            'password' => $mysqlPassword,
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? Mysql::ATTR_SSL_CA : PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => $pgsqlUrl,
            'host' => $pgsqlHost,
            'port' => $pgsqlPort,
            'database' => $pgsqlDatabase,
            'username' => $pgsqlUsername,
            'password' => $pgsqlPassword,
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => env('DB_SCHEMA', 'public'),
            'sslmode' => $pgsqlSslMode,
        ],

        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '1433'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            // 'encrypt' => env('DB_ENCRYPT', 'yes'),
            // 'trust_server_certificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'false'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run on the database.
    |
    */

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as Memcached. You may define your connection settings here.
    |
    */

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
            'persistent' => env('REDIS_PERSISTENT', false),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

    ],

];
