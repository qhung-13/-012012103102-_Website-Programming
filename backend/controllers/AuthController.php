<?php
/**
 * Handles register / login / current-user / profile update.
 * Auth is stateless JWT — "logout" is simply the frontend discarding
 * its token, so there is no server-side session to destroy.
 */

class AuthController
{
    public static function register(): void
    {
        $name = trim((string) Request::input('name'));
        $email = strtolower(trim((string) Request::input('email')));
        $password = (string) Request::input('password');

        $errors = [];
        if (strlen($name) < 2) $errors['name'] = 'Name must be at least 2 characters.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email address.';
        if (strlen($password) < 6) $errors['password'] = 'Password must be at least 6 characters.';

        if ($errors) {
            Response::error('Validation failed.', 422, $errors);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('An account with this email already exists.', 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$name, $email, $hash, 'customer']);
        $userId = (int) $pdo->lastInsertId();

        $user = self::findUserById($userId);
        $token = self::issueToken($user);

        Response::success(['user' => $user, 'token' => $token], 'Account created.', 201);
    }

    public static function login(): void
    {
        $email = strtolower(trim((string) Request::input('email')));
        $password = (string) Request::input('password');

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            Response::error('Invalid email or password.', 401);
        }

        if ($user['status'] === 'blocked') {
            Response::error('This account has been blocked. Contact support.', 403);
        }

        unset($user['password']);
        $token = self::issueToken($user);

        Response::success(['user' => $user, 'token' => $token], 'Logged in successfully.');
    }

    public static function me(): void
    {
        $payload = Auth::requireAuth();
        $user = self::findUserById((int) $payload['sub']);

        if (!$user) {
            Response::error('User not found.', 404);
        }

        Response::success($user);
    }

    public static function updateProfile(): void
    {
        $payload = Auth::requireAuth();
        $userId = (int) $payload['sub'];

        $name = Request::input('name');
        $phone = Request::input('phone');
        $address = Request::input('address');

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?'
        );
        $stmt->execute([$name, $phone, $address, $userId]);

        Response::success(self::findUserById($userId), 'Profile updated.');
    }

    private static function findUserById(int $id): ?array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, role, phone, address, avatar, status, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    private static function issueToken(array $user): string
    {
        return JWT::encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ], 60 * 60 * 24 * 7); // 7 days
    }
}
