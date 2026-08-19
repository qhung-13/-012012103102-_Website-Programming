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
            'INSERT INTO newsletter_subscribers (email, status) VALUES (?, "active")
             ON DUPLICATE KEY UPDATE status = "active", updated_at = CURRENT_TIMESTAMP'
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
}
