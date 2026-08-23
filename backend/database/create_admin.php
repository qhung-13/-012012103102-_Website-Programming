<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$name = trim((string) env('ADMIN_NAME', 'Quản trị viên'));
$email = strtolower(trim((string) env('ADMIN_EMAIL', '')));
$password = (string) env('ADMIN_PASSWORD', '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "ADMIN_EMAIL không hợp lệ.\n");
    exit(1);
}
if (strlen($password) < 12 || strlen($password) > 72) {
    fwrite(STDERR, "ADMIN_PASSWORD phải có từ 12 đến 72 ký tự.\n");
    exit(1);
}

$pdo = getDbConnection();
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password, role, status)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role),
        status = VALUES(status)'
);

$stmt->execute([
    $name,
    $email,
    $hashedPassword,
    'admin',
    'active'
]);
fwrite(STDOUT, "Đã tạo hoặc cập nhật tài khoản quản trị.\n");
