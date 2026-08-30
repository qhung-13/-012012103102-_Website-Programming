<?php
/**
 * CORS setup — allows the client (localhost:3000) and admin (localhost:3001)
 * Next.js apps to call this API from the browser. Add production domains
 * to ALLOWED_ORIGINS in .env once deployed (comma-separated).
 */

function applyCors(): void
{
    $defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://client-pink-seven-61.vercel.app',
    ];
    $configuredOrigins = (string) env('ALLOWED_ORIGINS', '');
    $allowedOrigins = array_values(array_filter(array_map(
        static fn (string $value): string => rtrim(trim($value), '/'),
        array_merge(
            $configuredOrigins !== '' ? explode(',', $configuredOrigins) : $defaultOrigins,
            [
                (string) env('CLIENT_ORIGIN', ''),
                (string) env('ADMIN_ORIGIN', ''),
            ]
        )
    )));

    $origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
