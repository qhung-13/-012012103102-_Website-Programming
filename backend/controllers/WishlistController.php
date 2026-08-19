<?php

class WishlistController
{
    /** GET /api/wishlist — logged-in user's wishlist */
    public static function index(): void
    {
        $user = Auth::requireAuth();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare(
            "SELECT p.* FROM wishlists w
             JOIN products p ON p.id = w.product_id
             WHERE w.user_id = ? AND p.status = 'active'
             ORDER BY w.created_at DESC"
        );
        $stmt->execute([$user['sub']]);
        $products = ProductController::presentMany($stmt->fetchAll());

        Response::success($products);
    }

    /** POST /api/wishlist — body: { product_id } */
    public static function store(): void
    {
        $user = Auth::requireAuth();
        $productId = (int) Request::input('product_id');

        if (!$productId) {
            Response::error('Dữ liệu chưa hợp lệ.', 422, ['product_id' => 'Vui lòng chọn sản phẩm.']);
        }

        $pdo = getDbConnection();
        $productStmt = $pdo->prepare("SELECT id FROM products WHERE id = ? AND status = 'active'");
        $productStmt->execute([$productId]);
        if (!$productStmt->fetch()) {
            Response::error('Không tìm thấy sản phẩm.', 404);
        }
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)'
        );
        $stmt->execute([$user['sub'], $productId]);

        Response::success(null, 'Đã thêm vào danh sách yêu thích.', 201);
    }

    /** DELETE /api/wishlist/{productId} */
    public static function destroy(array $params): void
    {
        $user = Auth::requireAuth();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$user['sub'], (int) $params['id']]);
        Response::success(null, 'Đã xóa khỏi danh sách yêu thích.');
    }
}
