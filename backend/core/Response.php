<?php
/**
 * Small helper to send consistent JSON responses across every endpoint.
 */

class Response
{
    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success($data = null, string $message = 'OK', int $status = 200, array $meta = []): void
    {
        self::json(array_merge([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $meta ? ['meta' => $meta] : []), $status);
    }

    public static function error(string $message = 'Something went wrong', int $status = 400, $errors = null): void
    {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
