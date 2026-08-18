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
            Response::error('Forbidden.', 403);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT id, name, email, role, phone, address, avatar, status, created_at FROM users WHERE id = ?'
        );
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('User not found.', 404);
        }

        Response::success($user);
    }

    /** POST /api/users — admin only (create a user, e.g. another admin) */
    public static function store(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();

        $name = trim((string) Request::input('name'));
        $email = strtolower(trim((string) Request::input('email')));
        $password = (string) Request::input('password');
        $role = Request::input('role', 'customer');

        $errors = [];
        if (strlen($name) < 2) $errors['name'] = 'Name is required.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email.';
        if (strlen($password) < 6) $errors['password'] = 'Password must be at least 6 characters.';
        if (!in_array($role, ['admin', 'customer'], true)) $errors['role'] = 'Invalid role.';

        if ($errors) {
            Response::error('Validation failed.', 422, $errors);
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('An account with this email already exists.', 409);
        }

        $stmt = $pdo->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, password_hash($password, PASSWORD_BCRYPT), $role]);

        self::show(['id' => (int) $pdo->lastInsertId()]);
    }

    /** PUT /api/users/{id} — admin, or the user themself (role/status admin-only) */
    public static function update(array $params): void
    {
        $current = Auth::requireAuth();
        $id = (int) $params['id'];
        $isAdmin = $current['role'] === 'admin';

        if (!$isAdmin && (int) $current['sub'] !== $id) {
            Response::error('Forbidden.', 403);
        }

        $pdo = getDbConnection();
        $fields = [];
        $values = [];

        foreach (['name', 'phone', 'address'] as $field) {
            if (Request::input($field) !== null) {
                $fields[] = "$field = ?";
                $values[] = Request::input($field);
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

        if (Request::input('password')) {
            $fields[] = 'password = ?';
            $values[] = password_hash((string) Request::input('password'), PASSWORD_BCRYPT);
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
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        Response::success(null, 'User deleted.');
    }
}
