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
        $name = trim(Request::string('name') ?? '');
        $email = strtolower(trim(Request::string('email') ?? ''));
        $password = Request::string('password') ?? '';

        $errors = [];
        if (strlen($name) < 2 || strlen($name) > 150) $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) $errors['email'] = 'Địa chỉ email không hợp lệ.';
        if (strlen($password) < 8 || strlen($password) > 72) $errors['password'] = 'Mật khẩu phải có từ 8 đến 72 ký tự.';

        if ($errors) {
            Response::error('Dữ liệu đăng ký chưa hợp lệ.', 422, $errors);
        }

        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Email này đã được đăng ký.', 409, ['email' => 'Vui lòng dùng email khác hoặc đăng nhập.']);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
        );
        try {
            $stmt->execute([$name, $email, $hash, 'customer']);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('Email này đã được đăng ký.', 409, ['email' => 'Vui lòng dùng email khác hoặc đăng nhập.']);
            }
            throw $e;
        }
        $userId = (int) $pdo->lastInsertId();

        $user = self::findUserById($userId);
        $token = self::issueToken($user);

        Response::success(['user' => $user, 'token' => $token], 'Tạo tài khoản thành công.', 201);
    }

    public static function login(): void
    {
        $email = strtolower(trim(Request::string('email') ?? ''));
        $password = Request::string('password') ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            Response::error('Email hoặc mật khẩu không đúng.', 401);
        }

        $pdo = getDbConnection();
        self::enforceLoginRateLimit($pdo, $email);
        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        $passwordValid = $user
            ? password_verify($password, $user['password'])
            : password_verify($password, '$2y$10$/pFuvkNXEbQI1nhPeAGqx.k0mXe0dPOJFGiX7e4Ed/B3J3BJ4b6c6');
        if (!$user || !$passwordValid) {
            self::recordFailedLogin($pdo, $email);
            Response::error('Email hoặc mật khẩu không đúng.', 401);
        }

        if ($user['status'] === 'blocked') {
            Response::error('Tài khoản đã bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.', 403);
        }

        unset($user['password']);
        self::clearFailedLogins($pdo, $email);
        $token = self::issueToken($user);

        Response::success(['user' => $user, 'token' => $token], 'Đăng nhập thành công.');
    }

    public static function me(): void
    {
        $payload = Auth::requireAuth();
        $user = self::findUserById((int) $payload['sub']);

        if (!$user) {
            Response::error('Không tìm thấy người dùng.', 404);
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
        $errors = [];

        if ($name !== null) {
            if (!is_string($name)) {
                $errors['name'] = 'Họ tên phải là văn bản.';
            }
            $name = trim(is_string($name) ? $name : '');
            if (strlen($name) < 2 || strlen($name) > 150) {
                $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
            }
        }
        if ($phone !== null) {
            if (!is_string($phone)) {
                $errors['phone'] = 'Số điện thoại phải là văn bản.';
            }
            $phone = trim(is_string($phone) ? $phone : '');
            if ($phone !== '' && !preg_match('/^[0-9+() .-]{8,20}$/', $phone)) {
                $errors['phone'] = 'Số điện thoại không hợp lệ.';
            }
        }
        if ($address !== null) {
            if (!is_string($address)) {
                $errors['address'] = 'Địa chỉ phải là văn bản.';
            }
            $address = trim(is_string($address) ? $address : '');
            if (strlen($address) > 255) {
                $errors['address'] = 'Địa chỉ không được dài quá 255 ký tự.';
            }
        }
        if ($errors) {
            Response::error('Dữ liệu hồ sơ chưa hợp lệ.', 422, $errors);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?'
        );
        $stmt->execute([$name, $phone, $address, $userId]);

        Response::success(self::findUserById($userId), 'Cập nhật hồ sơ thành công.');
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

    private static function loginIdentity(string $email): array
    {
        $ip = trim((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        return [$email, hash('sha256', $ip)];
    }

    private static function enforceLoginRateLimit(PDO $pdo, string $email): void
    {
        [$normalizedEmail, $ipHash] = self::loginIdentity($email);
        $stmt = $pdo->prepare(
            'SELECT
                COALESCE(SUM(email = ?), 0) AS email_attempts,
                COALESCE(SUM(ip_hash = ?), 0) AS ip_attempts
             FROM auth_login_attempts
             WHERE attempted_at >= (NOW() - INTERVAL 15 MINUTE)'
        );
        $stmt->execute([$normalizedEmail, $ipHash]);
        $attempts = $stmt->fetch();
        if ((int) ($attempts['email_attempts'] ?? 0) >= 10 || (int) ($attempts['ip_attempts'] ?? 0) >= 50) {
            Response::error('Đã thử đăng nhập quá nhiều lần. Vui lòng chờ 15 phút.', 429);
        }
    }

    private static function recordFailedLogin(PDO $pdo, string $email): void
    {
        [$normalizedEmail, $ipHash] = self::loginIdentity($email);
        $pdo->prepare('INSERT INTO auth_login_attempts (email, ip_hash) VALUES (?, ?)')->execute([$normalizedEmail, $ipHash]);
        if (random_int(1, 100) === 1) {
            $pdo->exec('DELETE FROM auth_login_attempts WHERE attempted_at < (NOW() - INTERVAL 1 DAY)');
        }
    }

    private static function clearFailedLogins(PDO $pdo, string $email): void
    {
        [$normalizedEmail] = self::loginIdentity($email);
        $pdo->prepare('DELETE FROM auth_login_attempts WHERE email = ?')->execute([$normalizedEmail]);
    }
}
