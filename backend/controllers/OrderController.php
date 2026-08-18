<?php

class OrderController
{
    /** GET /api/orders — admin: all orders; customer: only their own */
    public static function index(): void
    {
        $current = Auth::requireAuth();
        $pdo = getDbConnection();

        $page = max(1, (int) Request::query('page', 1));
        $limit = min(100, max(1, (int) Request::query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $where = '';
        $params = [];
        if ($current['role'] !== 'admin') {
            $where = 'WHERE user_id = ?';
            $params[] = $current['sub'];
        }

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM orders $where");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT * FROM orders $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset"
        );
        $stmt->execute($params);
        $orders = $stmt->fetchAll();

        Response::success($orders, 'OK', 200, [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    /** GET /api/orders/{id} */
    public static function show(array $params): void
    {
        $current = Auth::requireAuth();
        $id = (int) $params['id'];

        $order = self::findOrderWithItems($id);

        if (!$order) {
            Response::error('Order not found.', 404);
        }
        if ($current['role'] !== 'admin' && (int) $order['user_id'] !== (int) $current['sub']) {
            Response::error('Forbidden.', 403);
        }

        Response::success($order);
    }

    /** POST /api/orders — create an order from the cart at checkout (logged-in optional) */
    public static function store(): void
    {
        $pdo = getDbConnection();
        $current = Auth::user(); // optional — guest checkout allowed

        $items = Request::input('items', []);
        $shipping = Request::input('shipping', []);

        if (!$items || !is_array($items)) {
            Response::error('Validation failed.', 422, ['items' => 'Cart is empty.']);
        }

        $errors = [];
        foreach (['name', 'email', 'phone', 'address'] as $field) {
            if (empty($shipping[$field])) {
                $errors[$field] = 'This field is required.';
            }
        }
        if ($errors) {
            Response::error('Validation failed.', 422, $errors);
        }

        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += (float) $item['price'] * (int) $item['quantity'];
        }
        $shippingFee = 10;
        $discount = round($subtotal * 0.1, 2);
        $total = $subtotal + $shippingFee - $discount;

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                'INSERT INTO orders (user_id, status, subtotal, shipping_fee, discount, total, shipping_name, shipping_email, shipping_phone, shipping_address, payment_method)
                 VALUES (?, "pending", ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $current['sub'] ?? null,
                $subtotal,
                $shippingFee,
                $discount,
                $total,
                $shipping['name'],
                $shipping['email'],
                $shipping['phone'],
                $shipping['address'],
                Request::input('payment_method', 'card'),
            ]);
            $orderId = (int) $pdo->lastInsertId();

            $itemStmt = $pdo->prepare(
                'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color)
                 VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            foreach ($items as $item) {
                $itemStmt->execute([
                    $orderId,
                    $item['id'] ?? null,
                    $item['name'] ?? '',
                    $item['price'] ?? 0,
                    $item['quantity'] ?? 1,
                    $item['selectedSize'] ?? null,
                    $item['selectedColor'] ?? null,
                ]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            Response::error('Failed to place order.', 500);
        }

        // Return the freshly created order directly — do NOT reuse show(),
        // since that endpoint requires login and this must also work for
        // guest checkout (the person who just placed the order should
        // always be able to see their own confirmation).
        Response::success(self::findOrderWithItems($orderId), 'Order placed successfully.', 201);
    }

    /** PUT /api/orders/{id} — admin only (update status) */
    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];

        $status = Request::input('status');
        $allowed = ['pending', 'processing', 'success', 'failed', 'cancelled'];

        if (!in_array($status, $allowed, true)) {
            Response::error('Validation failed.', 422, ['status' => 'Invalid status value.']);
        }

        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);

        Response::success(self::findOrderWithItems($id), 'Order status updated.');
    }

    /** DELETE /api/orders/{id} — admin only */
    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM orders WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        Response::success(null, 'Order deleted.');
    }

    private static function findOrderWithItems(int $id): ?array
    {
        $pdo = getDbConnection();

        $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        $itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
        $itemsStmt->execute([$id]);
        $order['items'] = $itemsStmt->fetchAll();

        return $order;
    }
}
