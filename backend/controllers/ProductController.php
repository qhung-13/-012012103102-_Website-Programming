<?php
/**
 * Product CRUD, with pagination + category/sort filtering for the
 * storefront, and admin-only create/update/delete.
 */

class ProductController
{
    /** GET /api/products — public, paginated, filterable */
    public static function index(): void
    {
        $pdo = getDbConnection();

        $page = max(1, (int) Request::query('page', 1));
        $limit = min(48, max(1, (int) Request::query('limit', 12)));
        $offset = ($page - 1) * $limit;

        $category = Request::query('category');
        $search = Request::query('search');
        $sort = Request::query('sort', 'newest');

        $where = ["p.status = 'active'"];
        $params = [];

        if ($category && $category !== 'all') {
            $where[] = 'c.slug = ?';
            $params[] = $category;
        }
        if ($search) {
            $where[] = 'p.name LIKE ?';
            $params[] = '%' . $search . '%';
        }

        $orderBy = match ($sort) {
            'asc' => 'p.price ASC',
            'desc' => 'p.price DESC',
            'oldest' => 'p.created_at ASC',
            default => 'p.created_at DESC',
        };

        $whereSql = 'WHERE ' . implode(' AND ', $where);

        $countStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM products p LEFT JOIN categories c ON c.id = p.category_id $whereSql"
        );
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             $whereSql
             ORDER BY $orderBy
             LIMIT $limit OFFSET $offset"
        );
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        $products = array_map([self::class, 'attachImages'], $products);
        $products = array_map([self::class, 'formatProduct'], $products);

        Response::success($products, 'OK', 200, [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    /** GET /api/products/{id} — public, accepts numeric id or slug */
    public static function show(array $params): void
    {
        $pdo = getDbConnection();
        $idOrSlug = $params['id'];

        $stmt = $pdo->prepare(
            'SELECT p.*, c.name AS category_name, c.slug AS category_slug
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = ? OR p.slug = ?'
        );
        $stmt->execute([is_numeric($idOrSlug) ? $idOrSlug : 0, $idOrSlug]);
        $product = $stmt->fetch();

        if (!$product) {
            Response::error('Product not found.', 404);
        }

        $product = self::attachImages($product);
        Response::success(self::formatProduct($product));
    }

    /** POST /api/products — admin only */
    public static function store(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();

        $data = self::validate();

        $slug = self::uniqueSlug($data['name']);

        $stmt = $pdo->prepare(
            'INSERT INTO products (category_id, name, slug, short_description, description, price, stock, sizes, colors, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['category_id'],
            $data['name'],
            $slug,
            $data['short_description'],
            $data['description'],
            $data['price'],
            $data['stock'],
            json_encode($data['sizes']),
            json_encode($data['colors']),
            $data['status'],
        ]);

        $id = (int) $pdo->lastInsertId();
        self::saveImages($id, Request::input('images', []));

        self::show(['id' => $id]);
    }

    /** PUT /api/products/{id} — admin only */
    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];

        $data = self::validate(partial: true);

        $fields = [];
        $values = [];
        foreach (['category_id', 'name', 'short_description', 'description', 'price', 'stock', 'status'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        if (isset($data['sizes'])) {
            $fields[] = 'sizes = ?';
            $values[] = json_encode($data['sizes']);
        }
        if (isset($data['colors'])) {
            $fields[] = 'colors = ?';
            $values[] = json_encode($data['colors']);
        }
        if (isset($data['name'])) {
            $fields[] = 'slug = ?';
            $values[] = self::uniqueSlug($data['name'], $id);
        }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        if (Request::input('images') !== null) {
            $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
            self::saveImages($id, Request::input('images', []));
        }

        self::show(['id' => $id]);
    }

    /** DELETE /api/products/{id} — admin only */
    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        Response::success(null, 'Product deleted.');
    }

    // -----------------------------------------------------------------

    private static function validate(bool $partial = false): array
    {
        $body = Request::body();
        $errors = [];

        if (!$partial || array_key_exists('name', $body)) {
            if (empty($body['name']) || strlen($body['name']) < 2) {
                $errors['name'] = 'Name is required.';
            }
        }
        if (!$partial || array_key_exists('price', $body)) {
            if (!isset($body['price']) || !is_numeric($body['price']) || $body['price'] < 0) {
                $errors['price'] = 'Price must be a positive number.';
            }
        }

        if ($errors) {
            Response::error('Validation failed.', 422, $errors);
        }

        $data = [];
        foreach (['name', 'short_description', 'description', 'status'] as $field) {
            if (array_key_exists($field, $body)) $data[$field] = $body[$field];
        }
        if (array_key_exists('category_id', $body)) $data['category_id'] = $body['category_id'] ?: null;
        if (array_key_exists('price', $body)) $data['price'] = (float) $body['price'];
        if (array_key_exists('stock', $body)) $data['stock'] = (int) ($body['stock'] ?? 0);
        if (array_key_exists('sizes', $body)) $data['sizes'] = is_array($body['sizes']) ? $body['sizes'] : [];
        if (array_key_exists('colors', $body)) $data['colors'] = is_array($body['colors']) ? $body['colors'] : [];
        if (!$partial) {
            // Creating a product: make sure every column the INSERT needs
            // has a sane default even when the client didn't send it.
            $data['status'] = $data['status'] ?? 'active';
            $data['category_id'] = $data['category_id'] ?? null;
            $data['short_description'] = $data['short_description'] ?? null;
            $data['description'] = $data['description'] ?? null;
            $data['stock'] = $data['stock'] ?? 0;
            $data['sizes'] = $data['sizes'] ?? [];
            $data['colors'] = $data['colors'] ?? [];
        }

        return $data;
    }

    private static function saveImages(int $productId, array $images): void
    {
        if (!$images) return;
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO product_images (product_id, color, image_path, sort_order) VALUES (?, ?, ?, ?)'
        );
        foreach (array_values($images) as $i => $image) {
            $stmt->execute([
                $productId,
                $image['color'] ?? null,
                $image['path'] ?? $image['image_path'] ?? '',
                $i,
            ]);
        }
    }

    private static function attachImages(array $product): array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT color, image_path FROM product_images WHERE product_id = ? ORDER BY sort_order ASC'
        );
        $stmt->execute([$product['id']]);
        $product['images_raw'] = $stmt->fetchAll();
        return $product;
    }

    /** Reshapes a DB row into the { images: { color: path } } shape the frontend expects. */
    private static function formatProduct(array $product): array
    {
        $images = [];
        foreach ($product['images_raw'] ?? [] as $img) {
            $key = $img['color'] ?? 'default';
            $images[$key] = $img['image_path'];
        }
        unset($product['images_raw']);

        $product['sizes'] = json_decode($product['sizes'] ?? '[]', true) ?? [];
        $product['colors'] = json_decode($product['colors'] ?? '[]', true) ?? [];
        $product['images'] = $images;
        $product['price'] = (float) $product['price'];

        return $product;
    }

    private static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $pdo = getDbConnection();
        $base = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $name), '-'));
        $slug = $base;
        $i = 1;

        while (true) {
            $sql = 'SELECT id FROM products WHERE slug = ?' . ($ignoreId ? ' AND id != ?' : '');
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ignoreId ? [$slug, $ignoreId] : [$slug]);
            if (!$stmt->fetch()) break;
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
