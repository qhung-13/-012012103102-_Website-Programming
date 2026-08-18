<?php
/**
 * Auth middleware — verifies the JWT on protected routes and exposes the
 * current user. Call Auth::user() to get the decoded token payload, or
 * Auth::requireAuth() / Auth::requireAdmin() to guard a route.
 */

class Auth
{
    private static ?array $currentUser = null;
    private static bool $resolved = false;

    public static function user(): ?array
    {
        if (self::$resolved) {
            return self::$currentUser;
        }
        self::$resolved = true;

        $token = Request::bearerToken();
        if (!$token) {
            return null;
        }

        $payload = JWT::decode($token);
        if (!$payload) {
            return null;
        }

        self::$currentUser = $payload;
        return $payload;
    }

    /** Aborts with 401 if there is no valid, logged-in user. */
    public static function requireAuth(): array
    {
        $user = self::user();
        if (!$user) {
            Response::error('Unauthorized. Please log in.', 401);
        }
        return $user;
    }

    /** Aborts with 403 if the logged-in user is not an admin. */
    public static function requireAdmin(): array
    {
        $user = self::requireAuth();
        if (($user['role'] ?? '') !== 'admin') {
            Response::error('Forbidden. Admin access required.', 403);
        }
        return $user;
    }
}
