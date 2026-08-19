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

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, role, phone, address, avatar, status, created_at FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([(int) $payload['sub']]);
        $user = $stmt->fetch();

        if (!$user || $user['status'] !== 'active') {
            return null;
        }

        // Quyền và trạng thái luôn lấy từ database, không tin dữ liệu cũ trong token.
        self::$currentUser = array_merge($user, ['sub' => (int) $user['id']]);
        return self::$currentUser;
    }

    /** Aborts with 401 if there is no valid, logged-in user. */
    public static function requireAuth(): array
    {
        $user = self::user();
        if (!$user) {
            Response::error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 401);
        }
        return $user;
    }

    /** Aborts with 403 if the logged-in user is not an admin. */
    public static function requireAdmin(): array
    {
        $user = self::requireAuth();
        if (($user['role'] ?? '') !== 'admin') {
            Response::error('Bạn không có quyền quản trị để thực hiện thao tác này.', 403);
        }
        return $user;
    }
}
