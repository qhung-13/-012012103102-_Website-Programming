<?php

class UserController
{
    /** GET /api/users — admin only, paginated */
    public static function index(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();

        $page = max(1, (int) Request::query('page', 1));
        $limit = min(100, max(1, (int) Request::query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $total = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT id, name, email, role, phone, address, avatar, status, created_at
             FROM users ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
        );
        $stmt->execute();

        Response::success($stmt->fetchAll(), 'OK', 200, [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    /** GET /api/users/{id} — admin, or the user themself */
    public static function show(array $params): void
    {
        $current = Auth::requireAuth();
        $id = (int) $params['id'];

        if ($current['role'] !== 'admin' && (int) $current['sub'] !== $id) {
            Response::error('Bạn không có quyền xem người dùng này.', 403);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, role, phone, address, avatar, status, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Không tìm thấy người dùng.', 404);
        }

        Response::success($user);
    }

    /** POST /api/users — admin only (create a user, e.g. another admin) */
    public static function store(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();

        $name = trim(Request::string('name') ?? '');
        $email = strtolower(trim(Request::string('email') ?? ''));
        $password = Request::string('password') ?? '';
        $role = Request::input('role', 'customer');
        $phone = trim(Request::string('phone') ?? '');
        $address = trim(Request::string('address') ?? '');

        $errors = [];
        if (strlen($name) < 2 || strlen($name) > 150) $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) $errors['email'] = 'Email không hợp lệ.';
        if (strlen($password) < 8 || strlen($password) > 72) $errors['password'] = 'Mật khẩu phải có từ 8 đến 72 ký tự.';
        if (!in_array($role, ['admin', 'customer'], true)) $errors['role'] = 'Vai trò không hợp lệ.';
        if ($phone !== '' && !preg_match('/^[0-9+() .-]{8,20}$/', $phone)) $errors['phone'] = 'Số điện thoại không hợp lệ.';
        if (strlen($address) > 255) $errors['address'] = 'Địa chỉ không được dài quá 255 ký tự.';

        if ($errors) {
            Response::error('Dữ liệu người dùng chưa hợp lệ.', 422, $errors);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('Email này đã được đăng ký.', 409);
        }

        $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)');
        try {
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT), $role, $phone ?: null, $address ?: null]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                Response::error('Email này đã được đăng ký.', 409);
            }
            throw $e;
        }

        self::show(['id' => (int) $pdo->lastInsertId()]);
    }

    /** PUT /api/users/{id} — admin, or the user themself (role/status admin-only) */
    public static function update(array $params): void
    {
        $current = Auth::requireAuth();
        $id = (int) $params['id'];
        $isAdmin = $current['role'] === 'admin';

        if (!$isAdmin && (int) $current['sub'] !== $id) {
            Response::error('Bạn không có quyền sửa người dùng này.', 403);
        }

        $pdo = getDbConnection();
        $existsStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
        $existsStmt->execute([$id]);
        if (!$existsStmt->fetch()) {
            Response::error('Không tìm thấy người dùng.', 404);
        }

        $fields = [];
        $values = [];

        $errors = [];
        if (Request::input('name') !== null) {
            $name = trim(Request::string('name') ?? '');
            if (strlen($name) < 2 || strlen($name) > 150) $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
        }
        if (Request::input('phone') !== null) {
            $phone = trim(Request::string('phone') ?? '');
            if (!is_string(Request::input('phone'))) {
                $errors['phone'] = 'Số điện thoại phải là văn bản.';
            } elseif ($phone !== '' && !preg_match('/^[0-9+() .-]{8,20}$/', $phone)) {
                $errors['phone'] = 'Số điện thoại không hợp lệ.';
            }
        }
        if (Request::input('address') !== null) {
            if (!is_string(Request::input('address'))) {
                $errors['address'] = 'Địa chỉ phải là văn bản.';
            } elseif (strlen(trim(Request::string('address') ?? '')) > 255) {
                $errors['address'] = 'Địa chỉ không được dài quá 255 ký tự.';
            }
        }
        if ($isAdmin && Request::input('role') !== null && !in_array(Request::input('role'), ['admin', 'customer'], true)) {
            $errors['role'] = 'Vai trò không hợp lệ.';
        }
        if ($isAdmin && Request::input('status') !== null && !in_array(Request::input('status'), ['active', 'blocked'], true)) {
            $errors['status'] = 'Trạng thái không hợp lệ.';
        }
        if ($isAdmin && (int) $current['sub'] === $id) {
            if (Request::input('role') !== null && Request::input('role') !== 'admin') {
                $errors['role'] = 'Bạn không thể tự hạ quyền tài khoản đang đăng nhập.';
            }
            if (Request::input('status') !== null && Request::input('status') !== 'active') {
                $errors['status'] = 'Bạn không thể tự khóa tài khoản đang đăng nhập.';
            }
        }
        if (Request::input('password') !== null && Request::input('password') !== '' && (
            !is_string(Request::input('password'))
            || strlen(Request::string('password') ?? '') < 8
            || strlen(Request::string('password') ?? '') > 72
        )) {
            $errors['password'] = 'Mật khẩu phải có từ 8 đến 72 ký tự.';
        }
        if ($errors) {
            Response::error('Dữ liệu người dùng chưa hợp lệ.', 422, $errors);
        }

        foreach (['name', 'phone', 'address'] as $field) {
            if (Request::input($field) !== null) {
                $fields[] = "$field = ?";
                $values[] = trim(Request::string($field) ?? '');
            }
        }

        if ($isAdmin) {
            foreach (['role', 'status'] as $field) {
                if (Request::input($field) !== null) {
                    $fields[] = "$field = ?";
                    $values[] = Request::input($field);
                }
            }
        }

        if (is_string(Request::input('password')) && Request::input('password') !== '') {
            $fields[] = 'password = ?';
            $values[] = password_hash(Request::string('password') ?? '', PASSWORD_BCRYPT);
        }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        self::show(['id' => $id]);
    }

    /** DELETE /api/users/{id} — admin only */
    public static function destroy(array $params): void
    {
        $current = Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        if ((int) $current['sub'] === $id) {
            Response::error('Bạn không thể tự xóa tài khoản quản trị đang đăng nhập.', 422);
        }
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            Response::error('Không tìm thấy người dùng.', 404);
        }
        Response::success(null, 'Đã xóa người dùng.');
    }
}
