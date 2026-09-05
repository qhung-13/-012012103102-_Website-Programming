<?php
/**
 * Product CRUD, with pagination + category/sort filtering for the
 * storefront, and admin-only create/update/delete.
 */

class ProductController
{
    private const MAX_IMAGES = 20;

    /** GET /api/products — public, paginated, filterable */
    public static function index(): void
    {
        $pdo = getDbConnection();

        $adminView = Request::query('admin') === '1' && (Auth::user()['role'] ?? '') === 'admin';
        $page = max(1, (int) Request::query('page', 1));
        $limit = min($adminView ? 100 : 48, max(1, (int) Request::query('limit', 12)));
        $offset = ($page - 1) * $limit;

        $category = Request::query('category');
        $search = trim((string) Request::query('search', ''));
        $sort = Request::query('sort', 'newest');
        $status = Request::query('status');

        $where = $adminView ? [] : ["p.status = 'active'"];
        $params = [];

        if ($category && $category !== 'all') {
            $where[] = 'c.slug = ?';
            $params[] = $category;
        }
        if ($search !== '') {
            $search = substr($search, 0, 100);
            $where[] = '(p.name LIKE ? OR c.name LIKE ? OR CAST(p.id AS CHAR) LIKE ?)';
            $needle = '%' . $search . '%';
            array_push($params, $needle, $needle, $needle);
        }
        if ($adminView && in_array($status, ['active', 'draft'], true)) {
            $where[] = 'p.status = ?';
            $params[] = $status;
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

        $images = self::validateImages(Request::input('images', []), $data['colors']);

        $pdo->beginTransaction();
        try {
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
            self::saveImages($id, $images);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        self::show(['id' => $id]);
    }

    /** PUT /api/products/{id} — admin only */
    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];

        $data = self::validate(partial: true);
        $newImagesInput = Request::input('add_images');
        // Older admin clients used "images" on update. Treat those entries as
        // additions instead of destructively replacing the whole gallery.
        if ($newImagesInput === null && Request::input('images') !== null) {
            $newImagesInput = Request::input('images');
        }
        $availableColors = $data['colors'] ?? self::productColors($id);
        $newImages = self::validateImages($newImagesInput ?? [], $availableColors);
        $removeImageIds = self::validateImageIds(Request::input('remove_image_ids', []));

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

        $pathsToDelete = [];
        $pdo->beginTransaction();
        try {
            $exists = $pdo->prepare('SELECT id FROM products WHERE id = ? FOR UPDATE');
            $exists->execute([$id]);
            if (!$exists->fetch()) {
                $pdo->rollBack();
                Response::error('Không tìm thấy sản phẩm.', 404);
            }

            if ($fields) {
                $values[] = $id;
                $stmt = $pdo->prepare('UPDATE products SET ' . implode(', ', $fields) . ' WHERE id = ?');
                $stmt->execute($values);
            }

            if ($removeImageIds) {
                $placeholders = implode(',', array_fill(0, count($removeImageIds), '?'));
                $imageParams = array_merge([$id], $removeImageIds);
                $imageStmt = $pdo->prepare(
                    "SELECT image_path FROM product_images WHERE product_id = ? AND id IN ($placeholders)"
                );
                $imageStmt->execute($imageParams);
                $pathsToDelete = array_column($imageStmt->fetchAll(), 'image_path');
                if (count($pathsToDelete) !== count($removeImageIds)) {
                    $pdo->rollBack();
                    Response::error('Có ảnh không thuộc sản phẩm này hoặc đã bị xóa.', 422, [
                        'remove_image_ids' => 'Vui lòng tải lại dữ liệu sản phẩm rồi thử lại.',
                    ]);
                }
                $pdo->prepare(
                    "DELETE FROM product_images WHERE product_id = ? AND id IN ($placeholders)"
                )->execute($imageParams);
            }

            $currentCountStmt = $pdo->prepare('SELECT COUNT(*) FROM product_images WHERE product_id = ?');
            $currentCountStmt->execute([$id]);
            $currentCount = (int) $currentCountStmt->fetchColumn();
            if ($currentCount + count($newImages) > self::MAX_IMAGES) {
                $pdo->rollBack();
                Response::error('Mỗi sản phẩm chỉ được có tối đa ' . self::MAX_IMAGES . ' ảnh.', 422, [
                    'add_images' => 'Hãy xóa bớt ảnh hoặc chọn ít ảnh mới hơn.',
                ]);
            }

            if (array_key_exists('colors', $data)) {
                self::detachRemovedImageColors($id, $data['colors']);
            }

            $nextSortStmt = $pdo->prepare(
                'SELECT COALESCE(MAX(sort_order), -1) + 1 FROM product_images WHERE product_id = ?'
            );
            $nextSortStmt->execute([$id]);
            self::saveImages($id, $newImages, (int) $nextSortStmt->fetchColumn());
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        UploadController::deleteManagedFiles($pathsToDelete);

        self::show(['id' => $id]);
    }

    /** DELETE /api/products/{id} — admin only */
    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];
        $pdo->beginTransaction();
        try {
            $imageStmt = $pdo->prepare('SELECT image_path FROM product_images WHERE product_id = ?');
            $imageStmt->execute([$id]);
            $pathsToDelete = array_column($imageStmt->fetchAll(), 'image_path');

            $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                $pdo->rollBack();
                Response::error('Không tìm thấy sản phẩm.', 404);
            }
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }

        UploadController::deleteManagedFiles($pathsToDelete);
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
        if (array_key_exists('description', $data)) {
            $data['description'] = ContentSanitizer::richText($data['description']);
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

    private static function saveImages(int $productId, array $images, int $startOrder = 0): void
    {
        if (!$images) return;
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'INSERT INTO product_images (product_id, color, image_path, sort_order) VALUES (?, ?, ?, ?)'
        );
        foreach (array_values($images) as $i => $image) {
            $stmt->execute([
                $productId,
                $image['color'],
                $image['path'],
                $startOrder + $i,
            ]);
        }
    }

    private static function attachImages(array $product): array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT id, color, image_path, sort_order
             FROM product_images
             WHERE product_id = ?
             ORDER BY sort_order ASC, id ASC'
        );
        $stmt->execute([$product['id']]);
        $product['images_raw'] = $stmt->fetchAll();
        return $product;
    }

    /** Keeps the legacy color map while exposing every ordered image for galleries/editing. */
    private static function formatProduct(array $product): array
    {
        $images = [];
        $gallery = [];
        foreach ($product['images_raw'] ?? [] as $img) {
            $key = $img['color'] ?? 'default';
            // The old clients expect one representative image per color. Keep
            // the first one, while image_gallery preserves the complete list.
            if (!isset($images[$key])) $images[$key] = $img['image_path'];
            $gallery[] = [
                'id' => (int) $img['id'],
                'color' => $img['color'],
                'image_path' => $img['image_path'],
                'sort_order' => (int) $img['sort_order'],
            ];
        }
        unset($product['images_raw']);

        $product['sizes'] = json_decode($product['sizes'] ?? '[]', true) ?? [];
        $product['colors'] = json_decode($product['colors'] ?? '[]', true) ?? [];
        $product['images'] = $images;
        $product['image_gallery'] = $gallery;
        $product['primary_image'] = $gallery[0]['image_path'] ?? null;
        $product['description'] = ContentSanitizer::richText($product['description'] ?? '');
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
            "SELECT id, product_id, color, image_path, sort_order
             FROM product_images
             WHERE product_id IN ($placeholders)
             ORDER BY product_id ASC, sort_order ASC, id ASC"
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

    private static function validateImages($value, array $availableColors = []): array
    {
        if (!is_array($value)) {
            Response::error('Danh sách ảnh không hợp lệ.', 422, ['images' => 'Dữ liệu phải là một danh sách.']);
        }
        if (count($value) > self::MAX_IMAGES) {
            Response::error('Mỗi sản phẩm chỉ được có tối đa ' . self::MAX_IMAGES . ' ảnh.', 422);
        }

        $configuredBase = trim((string) env('UPLOAD_BASE_URL', ''), '/');
        $publicBase = '/' . ($configuredBase !== '' ? $configuredBase : 'uploads');
        $managedPattern = '#^' . preg_quote($publicBase . '/products/', '#')
            . '[a-f0-9]{32}\.(?:jpe?g|png|webp|gif)$#i';
        $bundledPattern = '#^/products/[A-Za-z0-9_-]+\.(?:jpe?g|png|webp|gif)$#i';
        $clean = [];

        foreach (array_values($value) as $index => $image) {
            if (!is_array($image)) {
                Response::error('Danh sách ảnh không hợp lệ.', 422, [
                    'images' => 'Ảnh thứ ' . ($index + 1) . ' không đúng định dạng.',
                ]);
            }
            $path = trim((string) ($image['path'] ?? $image['image_path'] ?? ''));
            if (!preg_match($managedPattern, $path) && !preg_match($bundledPattern, $path)) {
                Response::error('Đường dẫn ảnh không hợp lệ.', 422, [
                    'images' => 'Ảnh thứ ' . ($index + 1) . ' không thuộc vùng ảnh sản phẩm.',
                ]);
            }

            $color = isset($image['color']) && is_string($image['color'])
                ? substr(trim($image['color']), 0, 50)
                : '';
            if ($color !== '' && !in_array($color, $availableColors, true)) {
                Response::error('Màu gắn với ảnh không hợp lệ.', 422, [
                    'images' => 'Ảnh thứ ' . ($index + 1) . ' đang dùng màu chưa được chọn.',
                ]);
            }
            $clean[] = ['path' => $path, 'color' => $color !== '' ? $color : null];
        }

        return $clean;
    }

    private static function validateImageIds($value): array
    {
        if (!is_array($value)) {
            Response::error('Danh sách ảnh cần xóa không hợp lệ.', 422, [
                'remove_image_ids' => 'Dữ liệu phải là một danh sách ID.',
            ]);
        }

        $ids = [];
        foreach ($value as $rawId) {
            $id = filter_var($rawId, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
            if ($id === false) {
                Response::error('Danh sách ảnh cần xóa không hợp lệ.', 422);
            }
            $ids[] = (int) $id;
        }
        return array_values(array_unique(array_slice($ids, 0, self::MAX_IMAGES)));
    }

    private static function productColors(int $productId): array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT colors FROM products WHERE id = ?');
        $stmt->execute([$productId]);
        $json = $stmt->fetchColumn();
        if ($json === false) {
            Response::error('Không tìm thấy sản phẩm.', 404);
        }
        return is_string($json) ? (json_decode($json, true) ?: []) : [];
    }

    private static function detachRemovedImageColors(int $productId, array $colors): void
    {
        $pdo = getDbConnection();
        if (!$colors) {
            $pdo->prepare('UPDATE product_images SET color = NULL WHERE product_id = ?')->execute([$productId]);
            return;
        }

        $placeholders = implode(',', array_fill(0, count($colors), '?'));
        $params = array_merge([$productId], $colors);
        $pdo->prepare(
            "UPDATE product_images SET color = NULL
             WHERE product_id = ? AND color IS NOT NULL AND color NOT IN ($placeholders)"
        )->execute($params);
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
