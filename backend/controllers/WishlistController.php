<?php

class WishlistController
{
    /** GET /api/wishlist — logged-in user's wishlist */
    public static function index(): void
    {
        $user = Auth::requireAuth();
        $pdo = getDbConnection();

        $stmt = $pdo->prepare(
            'SELECT p.* FROM wishlists w
             JOIN products p ON p.id = w.product_id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC'
        );
        $stmt->execute([$user['sub']]);
        $products = $stmt->fetchAll();

        Response::success($products);
    }

    /** POST /api/wishlist — body: { product_id } */
    public static function store(): void
    {
        $user = Auth::requireAuth();
        $productId = (int) Request::input('product_id');

        if (!$productId) {
            Response::error('Validation failed.', 422, ['product_id' => 'Required.']);
        }

        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)'
        );
        $stmt->execute([$user['sub'], $productId]);

        Response::success(null, 'Added to wishlist.', 201);
    }

    /** DELETE /api/wishlist/{productId} */
    public static function destroy(array $params): void
    {
        $user = Auth::requireAuth();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?');
        $stmt->execute([$user['sub'], (int) $params['id']]);
        Response::success(null, 'Removed from wishlist.');
    }
}
