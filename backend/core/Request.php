<?php
/**
 * Small helper to read the incoming request: JSON body, query string,
 * and the Authorization header.
 */

class Request
{
    private static ?array $body = null;

    public static function body(): array
    {
        if (self::$body !== null) {
            return self::$body;
        }

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            if ($raw === '' || $raw === false) {
                self::$body = [];
            } else {
                $decoded = json_decode($raw, true);
                if (!is_array($decoded) || json_last_error() !== JSON_ERROR_NONE) {
                    Response::error('Nội dung JSON không hợp lệ.', 400);
                }
                self::$body = $decoded;
            }
        } else {
            // multipart/form-data (file uploads) or urlencoded
            self::$body = $_POST;
        }

        return self::$body;
    }

    public static function input(string $key, $default = null)
    {
        return self::body()[$key] ?? $default;
    }

    /** Returns only genuine string input; arrays/objects never become the literal word "Array". */
    public static function string(string $key, ?string $default = ''): ?string
    {
        $value = self::input($key, $default);
        return is_string($value) ? $value : $default;
    }

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        // Some Apache/FastCGI setups expose Authorization only through the
        // headers array, even when SetEnvIf is enabled.
        if ($header === '' && function_exists('getallheaders')) {
            foreach (getallheaders() as $name => $value) {
                if (strcasecmp((string) $name, 'Authorization') === 0) {
                    $header = (string) $value;
                    break;
                }
            }
        }

        if (preg_match('/^Bearer\s+([A-Za-z0-9._~-]+)$/i', trim($header), $matches)) {
            return $matches[1];
        }

        return null;
    }
}
