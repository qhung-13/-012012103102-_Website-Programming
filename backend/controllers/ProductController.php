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

        $adminView = Request::query('admin') === '1' && (Auth::user()['role'] ?? '') === 'admin';
        $page = max(1, (int) Request::query('page', 1));
        $limit = min($adminView ? 100 : 48, max(1, (int) Request::query('limit', 12)));
        $offset = ($page - 1) * $limit;

        $category = Request::query('category');
        $search = Request::query('search');
        $sort = Request::query('sort', 'newest');

        $where = $adminView ? [] : ["p.status = 'active'"];
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

        $whereSql = $where ? 'WHERE ' . implode(' AND ', $where) : '';

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
        $products = self::presentMany($stmt->fetchAll());

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
            Response::error('Không tìm thấy sản phẩm.', 404);
        }

        if ($product['status'] !== 'active' && (Auth::user()['role'] ?? '') !== 'admin') {
            Response::error('Không tìm thấy sản phẩm.', 404);
        }

        Response::success(self::present($product));
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
        if ($stmt->rowCount() === 0) {
            Response::error('Không tìm thấy sản phẩm.', 404);
        }
        Response::success(null, 'Đã xóa sản phẩm.');
    }

    // -----------------------------------------------------------------

    private static function validate(bool $partial = false): array
    {
        $body = Request::body();
        $errors = [];

        if (!$partial || array_key_exists('name', $body)) {
            if (!isset($body['name']) || !is_string($body['name']) || strlen(trim($body['name'])) < 2) {
                $errors['name'] = 'Tên sản phẩm phải có từ 2 đến 200 ký tự.';
            }
            if (is_string($body['name'] ?? null) && strlen(trim($body['name'])) > 200) {
                $errors['name'] = 'Tên sản phẩm không được dài quá 200 ký tự.';
            }
        }
        if (!$partial || array_key_exists('price', $body)) {
            if (!isset($body['price']) || !is_numeric($body['price']) || $body['price'] < 0 || $body['price'] > 99999999.99) {
                $errors['price'] = 'Giá phải là số từ 0 đến 99.999.999,99.';
            }
        }

        if (array_key_exists('stock', $body) && (
            !is_numeric($body['stock'])
            || (float) $body['stock'] !== (float) (int) $body['stock']
            || (int) $body['stock'] < 0
            || (int) $body['stock'] > 4294967295
        )) {
            $errors['stock'] = 'Tồn kho phải là số nguyên không âm.';
        }
        if (array_key_exists('short_description', $body) && $body['short_description'] !== null) {
            if (!is_string($body['short_description']) || strlen($body['short_description']) > 500) {
                $errors['short_description'] = 'Mô tả ngắn phải là văn bản không quá 500 ký tự.';
            }
        }
        if (array_key_exists('description', $body) && $body['description'] !== null) {
            if (!is_string($body['description']) || strlen($body['description']) > 50000) {
                $errors['description'] = 'Mô tả chi tiết phải là văn bản không quá 50.000 ký tự.';
            }
        }
        foreach (['sizes', 'colors', 'images'] as $listField) {
            if (array_key_exists($listField, $body) && !is_array($body[$listField])) {
                $errors[$listField] = 'Dữ liệu phải là một danh sách.';
            }
        }
        if (array_key_exists('status', $body) && !in_array($body['status'], ['active', 'draft'], true)) {
            $errors['status'] = 'Trạng thái sản phẩm không hợp lệ.';
        }
        if (array_key_exists('category_id', $body) && $body['category_id'] !== null && $body['category_id'] !== '') {
            $categoryId = filter_var($body['category_id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($categoryId === false) {
                $errors['category_id'] = 'Danh mục đã chọn không hợp lệ.';
            } else {
                $pdo = getDbConnection();
                $stmt = $pdo->prepare('SELECT id FROM categories WHERE id = ?');
                $stmt->execute([$categoryId]);
                if (!$stmt->fetch()) $errors['category_id'] = 'Danh mục đã chọn không tồn tại.';
            }
        }

        if ($errors) {
            Response::error('Dữ liệu sản phẩm chưa hợp lệ.', 422, $errors);
        }

        $data = [];
        foreach (['name', 'short_description', 'description', 'status'] as $field) {
            if (array_key_exists($field, $body)) $data[$field] = is_string($body[$field]) ? trim($body[$field]) : $body[$field];
        }
        if (array_key_exists('category_id', $body)) {
            $data['category_id'] = $body['category_id'] === null || $body['category_id'] === ''
                ? null
                : (int) $body['category_id'];
        }
        if (array_key_exists('price', $body)) $data['price'] = (float) $body['price'];
        if (array_key_exists('stock', $body)) $data['stock'] = (int) ($body['stock'] ?? 0);
        if (array_key_exists('sizes', $body)) $data['sizes'] = self::cleanStringList($body['sizes']);
        if (array_key_exists('colors', $body)) $data['colors'] = self::cleanStringList($body['colors']);
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
        foreach (array_slice(array_values($images), 0, 20) as $i => $image) {
            if (!is_array($image)) {
                continue;
            }
            $path = trim((string) ($image['path'] ?? $image['image_path'] ?? ''));
            if (!preg_match('#^/(uploads|products)/[A-Za-z0-9/_-]+\.(jpe?g|png|webp|gif)$#i', $path)) {
                continue;
            }
            $stmt->execute([
                $productId,
                isset($image['color']) ? substr(trim((string) $image['color']), 0, 50) : null,
                $path,
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
        $product['id'] = (int) $product['id'];
        $product['category_id'] = $product['category_id'] !== null ? (int) $product['category_id'] : null;
        $product['price'] = (float) $product['price'];
        $product['stock'] = (int) $product['stock'];

        return $product;
    }

    public static function present(array $product): array
    {
        return self::formatProduct(self::attachImages($product));
    }

    /** Định dạng nhiều sản phẩm với một truy vấn ảnh duy nhất, tránh N+1 query. */
    public static function presentMany(array $products): array
    {
        if (!$products) return [];

        $ids = array_map(static fn (array $product): int => (int) $product['id'], $products);
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            "SELECT product_id, color, image_path
             FROM product_images
             WHERE product_id IN ($placeholders)
             ORDER BY sort_order ASC"
        );
        $stmt->execute($ids);

        $imagesByProduct = [];
        foreach ($stmt->fetchAll() as $image) {
            $imagesByProduct[(int) $image['product_id']][] = $image;
        }

        return array_map(static function (array $product) use ($imagesByProduct): array {
            $product['images_raw'] = $imagesByProduct[(int) $product['id']] ?? [];
            return self::formatProduct($product);
        }, $products);
    }

    private static function cleanStringList($value): array
    {
        if (!is_array($value)) return [];
        $clean = array_map(
            static fn ($item): string => is_string($item) ? substr(trim($item), 0, 50) : '',
            $value
        );
        return array_values(array_slice(array_unique(array_filter($clean)), 0, 30));
    }

    private static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $pdo = getDbConnection();
        $base = Slugger::make($name, 'san-pham');
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
