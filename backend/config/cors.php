<?php
/**
 * CORS setup — allows the client (localhost:3000) and admin (localhost:3001)
 * Next.js apps to call this API from the browser. Add production domains
 * to ALLOWED_ORIGINS in .env once deployed (comma-separated).
 */

function applyCors(): void
{
    $defaultOrigins = 'http://localhost:3000,http://localhost:3001';
    $allowedOrigins = array_map('trim', explode(',', env('ALLOWED_ORIGINS', $defaultOrigins)));

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Vary: Origin');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
