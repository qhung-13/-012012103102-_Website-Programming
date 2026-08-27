<?php

/**
 * Database connection (PDO + MySQL).
 * Reads credentials from environment variables when available,
 * falling back to local XAMPP/MAMP defaults for quick setup.
 */

function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

        [$key, $value] = array_pad(explode('=', $line, 2), 2, '');

        $key = trim($key);
        $value = trim($value);

        if (
            strlen($value) >= 2 &&
            (
                ($value[0] === '"' && str_ends_with($value, '"')) ||
                ($value[0] === "'" && str_ends_with($value, "'"))
            )
        ) {
            $value = substr($value, 1, -1);
        }

        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
        }
    }
}

loadEnv(__DIR__ . '/../.env');

function env(string $key, $default = null)
{
    $value = getenv($key);

    return $value === false ? $default : $value;
}

function getDbConnection(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    // Support both the names used by this project and the conventional names
    // commonly entered in Render/Aiven settings.
    $host = env('DB_HOST', env('MYSQL_HOST', '127.0.0.1'));
    $port = env('DB_PORT', env('MYSQL_PORT', '3306'));
    $name = env('DB_NAME', env('DB_DATABASE', env('MYSQL_DATABASE', 'rozbux')));
    $user = env('DB_USER', env('DB_USERNAME', env('MYSQL_USER', 'root')));
    $pass = env('DB_PASS', env('DB_PASSWORD', env('MYSQL_PASSWORD', '')));

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $sslCa = trim((string) env('DB_SSL_CA', ''));

        if ($sslCa !== '') {
            if (!is_file($sslCa)) {
                throw new RuntimeException(
                    'SSL CA file not found: ' . $sslCa
                );
            }

            if (!is_readable($sslCa)) {
                throw new RuntimeException(
                    'SSL CA file is not readable: ' . $sslCa
                );
            }

            $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCa;
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        }

        $pdo = new PDO(
            $dsn,
            $user,
            $pass,
            $options
        );

        error_log('MySQL connection successful.');

        return $pdo;

    } catch (Throwable $e) {

        error_log('Database connection error: ' . $e->getMessage());

        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json');
        }

        $payload = [
            'success' => false,
            'message' => 'Không thể kết nối cơ sở dữ liệu.',
        ];

        if (
            filter_var(
                env('APP_DEBUG', 'false'),
                FILTER_VALIDATE_BOOL
            )
        ) {
            $payload['errors'] = [
                'database' => $e->getMessage()
            ];
        }

        echo json_encode(
            $payload,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

        exit;
    }
}
