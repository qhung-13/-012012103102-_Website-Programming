<?php

class OrderController
{
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
        $stmt = $pdo->prepare("SELECT * FROM orders $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
        $stmt->execute($params);
        Response::success(array_map([self::class, 'formatOrder'], $stmt->fetchAll()), 'OK', 200, [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    public static function show(array $params): void
    {
        $current = Auth::requireAuth();
        $order = self::findOrderWithItems((int) $params['id']);
        if (!$order) Response::error('Không tìm thấy đơn hàng.', 404);
        if ($current['role'] !== 'admin' && (int) $order['user_id'] !== (int) $current['sub']) {
            Response::error('Bạn không có quyền xem đơn hàng này.', 403);
        }
        Response::success($order);
    }

    /** Giá, tên và tồn kho luôn được xác minh lại từ database. */
    public static function store(): void
    {
        $pdo = getDbConnection();
        // Checkout is an authenticated user action. Admin-created orders also
        // pass through this guard because the Admin UI sends its Bearer token.
        $current = Auth::requireAuth();
        $items = Request::input('items', []);
        $shipping = Request::input('shipping', []);
        if (!is_array($items) || count($items) < 1 || count($items) > 50) {
            Response::error('Giỏ hàng chưa hợp lệ.', 422, ['items' => 'Giỏ hàng phải có từ 1 đến 50 sản phẩm.']);
        }
        if (!is_array($shipping)) Response::error('Thông tin giao hàng chưa hợp lệ.', 422);
        $shipping = [
            'name' => is_string($shipping['name'] ?? null) ? trim($shipping['name']) : '',
            'email' => is_string($shipping['email'] ?? null) ? strtolower(trim($shipping['email'])) : '',
            'phone' => is_string($shipping['phone'] ?? null) ? trim($shipping['phone']) : '',
            'address' => is_string($shipping['address'] ?? null) ? trim($shipping['address']) : '',
        ];
        $errors = [];
        if (strlen($shipping['name']) < 2 || strlen($shipping['name']) > 150) $errors['name'] = 'Họ tên phải có từ 2 đến 150 ký tự.';
        if (!filter_var($shipping['email'], FILTER_VALIDATE_EMAIL) || strlen($shipping['email']) > 150) $errors['email'] = 'Email không hợp lệ.';
        if (!preg_match('/^[0-9+() .-]{8,20}$/', $shipping['phone'])) $errors['phone'] = 'Số điện thoại không hợp lệ.';
        if (strlen($shipping['address']) < 5 || strlen($shipping['address']) > 255) $errors['address'] = 'Địa chỉ phải có từ 5 đến 255 ký tự.';
        if ($errors) Response::error('Thông tin giao hàng chưa hợp lệ.', 422, $errors);

        $paymentMethod = Request::string('payment_method', 'cod') ?? 'cod';
        if (!in_array($paymentMethod, ['cod', 'bank_transfer'], true)) {
            Response::error('Phương thức thanh toán không hợp lệ.', 422, ['payment_method' => 'Chỉ hỗ trợ COD hoặc chuyển khoản.']);
        }

        $pdo->beginTransaction();
        try {
            $productStmt = $pdo->prepare("SELECT id, name, price, stock, sizes, colors FROM products WHERE id = ? AND status = 'active' FOR UPDATE");
            $stockStmt = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
            $verifiedItems = [];
            $subtotal = 0.0;
            foreach ($items as $index => $item) {
                if (!is_array($item)) throw new InvalidArgumentException('Sản phẩm thứ ' . ($index + 1) . ' không hợp lệ.');
                $productId = filter_var(
                    $item['id'] ?? $item['product_id'] ?? null,
                    FILTER_VALIDATE_INT,
                    ['options' => ['min_range' => 1]]
                );
                $quantity = filter_var(
                    $item['quantity'] ?? null,
                    FILTER_VALIDATE_INT,
                    ['options' => ['min_range' => 1, 'max_range' => 100]]
                );
                if ($productId === false || $quantity === false) {
                    throw new InvalidArgumentException('Sản phẩm thứ ' . ($index + 1) . ' có mã hoặc số lượng không hợp lệ.');
                }
                $productStmt->execute([$productId]);
                $product = $productStmt->fetch();
                if (!$product) throw new InvalidArgumentException('Một sản phẩm trong giỏ không còn được bán.');
                if ((int) $product['stock'] < $quantity) throw new InvalidArgumentException('Sản phẩm "' . $product['name'] . '" không còn đủ số lượng.');
                $size = self::verifyVariant($item['selectedSize'] ?? $item['size'] ?? null, $product['sizes'], 'kích cỡ');
                $color = self::verifyVariant($item['selectedColor'] ?? $item['color'] ?? null, $product['colors'], 'màu sắc');
                $price = (float) $product['price'];
                $subtotal += $price * $quantity;
                $verifiedItems[] = ['id' => (int) $product['id'], 'name' => $product['name'], 'price' => $price, 'quantity' => $quantity, 'size' => $size, 'color' => $color];
                $stockStmt->execute([$quantity, $productId, $quantity]);
                if ($stockStmt->rowCount() !== 1) throw new InvalidArgumentException('Tồn kho vừa thay đổi. Vui lòng thử đặt hàng lại.');
            }
            $subtotal = round($subtotal, 2);
            $shippingFee = $subtotal >= 100 ? 0.0 : 10.0;
            $discount = round($subtotal * 0.1, 2);
            $total = round($subtotal + $shippingFee - $discount, 2);
            $stmt = $pdo->prepare(
                "INSERT INTO orders (user_id, status, subtotal, shipping_fee, discount, total, shipping_name, shipping_email, shipping_phone, shipping_address, payment_method)
                 VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$current['sub'] ?? null, $subtotal, $shippingFee, $discount, $total, $shipping['name'], $shipping['email'], $shipping['phone'], $shipping['address'], $paymentMethod]);
            $orderId = (int) $pdo->lastInsertId();
            $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)');
            foreach ($verifiedItems as $item) {
                $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['price'], $item['quantity'], $item['size'], $item['color']]);
            }
            $pdo->commit();
        } catch (InvalidArgumentException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error($e->getMessage(), 422);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log($e->__toString());
            Response::error('Không thể tạo đơn hàng. Vui lòng thử lại.', 500);
        }
        Response::success(self::findOrderWithItems($orderId), 'Đặt hàng thành công.', 201);
    }

    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        $status = Request::input('status');
        if (!in_array($status, ['pending', 'processing', 'success', 'failed', 'cancelled'], true)) {
            Response::error('Trạng thái đơn hàng không hợp lệ.', 422, ['status' => 'Vui lòng chọn một trạng thái hợp lệ.']);
        }
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('SELECT id, status FROM orders WHERE id = ? FOR UPDATE');
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            if (!$order) {
                $pdo->rollBack();
                Response::error('Không tìm thấy đơn hàng.', 404);
            }
            $wasClosed = in_array($order['status'], ['failed', 'cancelled'], true);
            $willBeClosed = in_array($status, ['failed', 'cancelled'], true);
            if (!$wasClosed && $willBeClosed) self::adjustStock($pdo, $id, 1);
            elseif ($wasClosed && !$willBeClosed) self::adjustStock($pdo, $id, -1);
            $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);
            $pdo->commit();
        } catch (InvalidArgumentException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error($e->getMessage(), 422);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log($e->__toString());
            Response::error('Không thể cập nhật đơn hàng.', 500);
        }
        Response::success(self::findOrderWithItems($id), 'Đã cập nhật trạng thái đơn hàng.');
    }

    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare('SELECT id, status FROM orders WHERE id = ? FOR UPDATE');
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            if (!$order) {
                $pdo->rollBack();
                Response::error('Không tìm thấy đơn hàng.', 404);
            }
            if (in_array($order['status'], ['pending', 'processing'], true)) self::adjustStock($pdo, $id, 1);
            $pdo->prepare('DELETE FROM orders WHERE id = ?')->execute([$id]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            error_log($e->__toString());
            Response::error('Không thể xóa đơn hàng.', 500);
        }
        Response::success(null, 'Đã xóa đơn hàng.');
    }

    private static function verifyVariant($selected, ?string $json, string $label): ?string
    {
        $available = json_decode($json ?? '[]', true);
        if (!is_array($available) || count($available) === 0) return null;
        if (!is_string($selected)) {
            throw new InvalidArgumentException('Vui lòng chọn ' . $label . ' hợp lệ.');
        }
        $selected = trim($selected);
        if ($selected === '' || !in_array($selected, $available, true)) throw new InvalidArgumentException('Vui lòng chọn ' . $label . ' hợp lệ.');
        return substr($selected, 0, 50);
    }

    /** $direction = 1 để hoàn kho, -1 để trừ lại kho. */
    private static function adjustStock(PDO $pdo, int $orderId, int $direction): void
    {
        $stmt = $pdo->prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL');
        $stmt->execute([$orderId]);
        foreach ($stmt->fetchAll() as $item) {
            if ($direction === 1) {
                $pdo->prepare('UPDATE products SET stock = stock + ? WHERE id = ?')->execute([(int) $item['quantity'], (int) $item['product_id']]);
            } else {
                $update = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
                $update->execute([(int) $item['quantity'], (int) $item['product_id'], (int) $item['quantity']]);
                if ($update->rowCount() !== 1) throw new InvalidArgumentException('Không đủ tồn kho để mở lại đơn hàng này.');
            }
        }
    }

    private static function findOrderWithItems(int $id): ?array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order) return null;
        $itemsStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC');
        $itemsStmt->execute([$id]);
        $order['items'] = array_map(static function (array $item): array {
            $item['id'] = (int) $item['id'];
            $item['order_id'] = (int) $item['order_id'];
            $item['product_id'] = $item['product_id'] !== null ? (int) $item['product_id'] : null;
            $item['price'] = (float) $item['price'];
            $item['quantity'] = (int) $item['quantity'];
            return $item;
        }, $itemsStmt->fetchAll());
        return self::formatOrder($order);
    }

    private static function formatOrder(array $order): array
    {
        $order['id'] = (int) $order['id'];
        $order['user_id'] = $order['user_id'] !== null ? (int) $order['user_id'] : null;
        foreach (['subtotal', 'shipping_fee', 'discount', 'total'] as $field) $order[$field] = (float) $order[$field];
        return $order;
    }
}
