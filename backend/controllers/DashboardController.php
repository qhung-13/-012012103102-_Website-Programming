<?php

class DashboardController
{
    /** GET /api/dashboard — số liệu tổng hợp chính xác, chỉ dành cho quản trị viên. */
    public static function index(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();

        $stats = $pdo->query(
            "SELECT
                (SELECT COUNT(*) FROM products WHERE status = 'active') AS products,
                (SELECT COUNT(*) FROM users) AS users,
                (SELECT COUNT(*) FROM orders) AS orders,
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'success') AS revenue"
        )->fetch();

        $monthlyRows = $pdo->query(
            "SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COALESCE(SUM(total), 0) AS total,
                COALESCE(SUM(CASE WHEN status = 'success' THEN total ELSE 0 END), 0) AS successful
             FROM orders
             WHERE created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
             GROUP BY DATE_FORMAT(created_at, '%Y-%m')
             ORDER BY month ASC"
        )->fetchAll();

        $statusRows = $pdo->query(
            'SELECT status, COUNT(*) AS orders FROM orders GROUP BY status'
        )->fetchAll();

        Response::success([
            'stats' => [
                'products' => (int) ($stats['products'] ?? 0),
                'users' => (int) ($stats['users'] ?? 0),
                'orders' => (int) ($stats['orders'] ?? 0),
                'revenue' => (float) ($stats['revenue'] ?? 0),
            ],
            'monthly' => array_map(static fn (array $row): array => [
                'month' => $row['month'],
                'total' => (float) $row['total'],
                'successful' => (float) $row['successful'],
            ], $monthlyRows),
            'statuses' => array_map(static fn (array $row): array => [
                'status' => $row['status'],
                'orders' => (int) $row['orders'],
            ], $statusRows),
        ]);
    }
}
