<?php
/**
 * CORS setup — allows the client (localhost:3000) and admin (localhost:3001)
 * Next.js apps to call this API from the browser. Add production domains
 * to ALLOWED_ORIGINS in .env once deployed (comma-separated).
 */

function applyCors(): void
{
    $configuredOrigins = trim((string) env('ALLOWED_ORIGINS', ''));
    $defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://client-pink-seven-61.vercel.app',
        'https://admin-cyan-six-44.vercel.app/',
    ];

    $allowedOrigins = $configuredOrigins !== ''
        ? explode(',', $configuredOrigins)
        : $defaultOrigins;

    // Keep the two deployed origins explicit without forcing them into the
    // source code. ALLOWED_ORIGINS remains supported for comma-separated lists.
    foreach (['CLIENT_ORIGIN', 'ADMIN_ORIGIN'] as $originKey) {
        $origin = trim((string) env($originKey, ''));
        if ($origin !== '') {
            $allowedOrigins[] = $origin;
        }
    }

    $allowedOrigins = array_values(array_unique(array_filter(array_map(
        static fn (string $value): string => rtrim(trim($value), '/'),
        $allowedOrigins
    ))));

    $origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Accept, Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
