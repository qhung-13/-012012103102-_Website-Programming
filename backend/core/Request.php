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
            self::$body = json_decode($raw, true) ?? [];
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

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
