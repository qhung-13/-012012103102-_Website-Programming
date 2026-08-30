<?php

class MarketingController
{
    public static function subscribe(): void
    {
        // Honeypot chống bot đơn giản; người dùng thật không nhìn thấy trường này.
        if (trim(Request::string('website') ?? '') !== '') {
            Response::success(null, 'Đăng ký nhận tin thành công.', 201);
        }
        $email = strtolower(trim(Request::string('email') ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
            Response::error('Email không hợp lệ.', 422, ['email' => 'Vui lòng nhập đúng địa chỉ email.']);
        }
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            "INSERT INTO newsletter_subscribers (email, status) VALUES (?, 'active')
             ON DUPLICATE KEY UPDATE status = 'active', updated_at = CURRENT_TIMESTAMP"
        );
        $stmt->execute([$email]);
        Response::success(null, 'Đăng ký nhận tin thành công.', 201);
    }

    public static function contact(): void
    {
        if (trim(Request::string('website') ?? '') !== '') {
            Response::success(null, 'Đã gửi lời nhắn.', 201);
        }
        $name = trim(Request::string('name') ?? '');
        $email = strtolower(trim(Request::string('email') ?? ''));
        $subject = trim(Request::string('subject') ?? '');
        $message = trim(Request::string('message') ?? '');
        $errors = [];
        if (strlen($name) < 2 || strlen($name) > 150) $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) $errors['email'] = 'Email không hợp lệ.';
        if (strlen($subject) < 2 || strlen($subject) > 200) $errors['subject'] = 'Chủ đề phải có từ 2 đến 200 ký tự.';
        if (strlen($message) < 10 || strlen($message) > 5000) $errors['message'] = 'Nội dung phải có từ 10 đến 5.000 ký tự.';
        if ($errors) Response::error('Thông tin liên hệ chưa hợp lệ.', 422, $errors);

        $pdo = getDbConnection();
        $stmt = $pdo->prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)');
        $stmt->execute([$name, $email, $subject, $message]);
        Response::success(null, 'Đã gửi lời nhắn. Chúng tôi sẽ phản hồi sớm nhất có thể.', 201);
    }

    /** GET /api/contact-messages — admin-only inbox with pagination. */
    public static function messages(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        [$page, $limit, $offset] = self::pagination(20, 100);
        $status = Request::query('status');
        $where = [];
        $params = [];

        if ($status !== null && in_array($status, ['new', 'read', 'resolved'], true)) {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        $whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM contact_messages' . $whereSql);
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            'SELECT id, name, email, subject, message, status, created_at
             FROM contact_messages' . $whereSql . ' ORDER BY created_at DESC LIMIT ' . $limit . ' OFFSET ' . $offset
        );
        $stmt->execute($params);
        Response::success($stmt->fetchAll(), 'OK', 200, self::meta($page, $limit, $total));
    }

    /** GET /api/contact-messages/{id} — admin-only detail. */
    public static function showMessage(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, name, email, subject, message, status, created_at FROM contact_messages WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        $message = $stmt->fetch();
        if (!$message) Response::error('Không tìm thấy tin nhắn.', 404);
        Response::success($message);
    }

    /** PUT /api/contact-messages/{id} — admin-only edit/status update. */
    public static function updateMessage(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        self::ensureExists($pdo, 'contact_messages', $id, 'Không tìm thấy tin nhắn.');

        $fields = [];
        $values = [];
        $errors = [];
        foreach (['name', 'email', 'subject', 'message'] as $field) {
            if (Request::input($field) === null) continue;
            if (!is_string(Request::input($field))) {
                $errors[$field] = 'Giá trị phải là văn bản.';
                continue;
            }
            $value = trim(Request::string($field) ?? '');
            $limits = ['name' => 150, 'email' => 150, 'subject' => 200, 'message' => 5000];
            if ($value === '' || strlen($value) > $limits[$field]) {
                $errors[$field] = 'Giá trị không hợp lệ.';
                continue;
            }
            if ($field === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[$field] = 'Email không hợp lệ.';
                continue;
            }
            $fields[] = "$field = ?";
            $values[] = $field === 'email' ? strtolower($value) : $value;
        }
        if (Request::input('status') !== null) {
            $status = Request::input('status');
            if (!in_array($status, ['new', 'read', 'resolved'], true)) $errors['status'] = 'Trạng thái không hợp lệ.';
            else {
                $fields[] = 'status = ?';
                $values[] = $status;
            }
        }
        if ($errors) Response::error('Dữ liệu tin nhắn chưa hợp lệ.', 422, $errors);
        if (!$fields) Response::error('Không có dữ liệu để cập nhật.', 422);

        $values[] = $id;
        $pdo->prepare('UPDATE contact_messages SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);
        self::showMessage(['id' => $id]);
    }

    /** DELETE /api/contact-messages/{id} — admin-only. */
    public static function deleteMessage(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM contact_messages WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        if ($stmt->rowCount() === 0) Response::error('Không tìm thấy tin nhắn.', 404);
        Response::success(null, 'Đã xóa tin nhắn.');
    }

    /** GET /api/newsletter-subscribers — admin-only list with pagination. */
    public static function subscribers(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        [$page, $limit, $offset] = self::pagination(20, 100);
        $total = (int) $pdo->query('SELECT COUNT(*) FROM newsletter_subscribers')->fetchColumn();
        $stmt = $pdo->prepare(
            'SELECT id, email, status, created_at, updated_at
             FROM newsletter_subscribers ORDER BY created_at DESC LIMIT ' . $limit . ' OFFSET ' . $offset
        );
        $stmt->execute();
        Response::success($stmt->fetchAll(), 'OK', 200, self::meta($page, $limit, $total));
    }

    /** GET /api/newsletter-subscribers/{id} — admin-only detail. */
    public static function showSubscriber(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT id, email, status, created_at, updated_at FROM newsletter_subscribers WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        $subscriber = $stmt->fetch();
        if (!$subscriber) Response::error('Không tìm thấy người đăng ký.', 404);
        Response::success($subscriber);
    }

    /** PUT /api/newsletter-subscribers/{id} — admin-only. */
    public static function updateSubscriber(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        self::ensureExists($pdo, 'newsletter_subscribers', $id, 'Không tìm thấy người đăng ký.');
        $fields = [];
        $values = [];

        if (Request::input('email') !== null) {
            $email = strtolower(trim(Request::string('email') ?? ''));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
                Response::error('Email không hợp lệ.', 422, ['email' => 'Vui lòng nhập đúng địa chỉ email.']);
            }
            $fields[] = 'email = ?';
            $values[] = $email;
        }
        if (Request::input('status') !== null) {
            $status = Request::input('status');
            if (!in_array($status, ['active', 'unsubscribed'], true)) {
                Response::error('Trạng thái không hợp lệ.', 422, ['status' => 'Chỉ nhận active hoặc unsubscribed.']);
            }
            $fields[] = 'status = ?';
            $values[] = $status;
        }
        if (!$fields) Response::error('Không có dữ liệu để cập nhật.', 422);

        $values[] = $id;
        try {
            $pdo->prepare('UPDATE newsletter_subscribers SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($values);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') Response::error('Email này đã tồn tại.', 409);
            throw $e;
        }
        self::showSubscriber(['id' => $id]);
    }

    /** DELETE /api/newsletter-subscribers/{id} — admin-only. */
    public static function deleteSubscriber(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM newsletter_subscribers WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        if ($stmt->rowCount() === 0) Response::error('Không tìm thấy người đăng ký.', 404);
        Response::success(null, 'Đã xóa người đăng ký.');
    }

    private static function pagination(int $defaultLimit, int $maxLimit): array
    {
        $page = max(1, (int) Request::query('page', 1));
        $limit = min($maxLimit, max(1, (int) Request::query('limit', $defaultLimit)));
        return [$page, $limit, ($page - 1) * $limit];
    }

    private static function meta(int $page, int $limit, int $total): array
    {
        return [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ];
    }

    private static function ensureExists(PDO $pdo, string $table, int $id, string $message): void
    {
        // Table names are hard-coded by callers; only the numeric id is user input.
        $stmt = $pdo->prepare("SELECT id FROM {$table} WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) Response::error($message, 404);
    }
}
