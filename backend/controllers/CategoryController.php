<?php

class CategoryController
{
    public static function index(): void
    {
        $pdo = getDbConnection();
        $categories = $pdo->query(
            "SELECT c.*, COUNT(p.id) AS product_count
             FROM categories c
             LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
             GROUP BY c.id, c.name, c.slug, c.created_at
             ORDER BY c.name ASC"
        )->fetchAll();

        Response::success($categories);
    }

    public static function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ? OR slug = ?');
        $stmt->execute([is_numeric($params['id']) ? $params['id'] : 0, $params['id']]);
        $category = $stmt->fetch();

        if (!$category) {
            Response::error('Không tìm thấy danh mục.', 404);
        }

        Response::success($category);
    }

    public static function store(): void
    {
        Auth::requireAdmin();
        $name = trim(Request::string('name') ?? '');

        if (strlen($name) < 2) {
            Response::error('Dữ liệu danh mục chưa hợp lệ.', 422, ['name' => 'Tên danh mục phải có từ 2 đến 100 ký tự.']);
        }

        $pdo = getDbConnection();
        if (strlen($name) > 100) {
            Response::error('Dữ liệu danh mục chưa hợp lệ.', 422, ['name' => 'Tên danh mục không được dài quá 100 ký tự.']);
        }
        $slug = self::uniqueSlug($name);

        $stmt = $pdo->prepare('INSERT INTO categories (name, slug) VALUES (?, ?)');
        $stmt->execute([$name, $slug]);

        self::show(['id' => (int) $pdo->lastInsertId()]);
    }

    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $id = (int) $params['id'];
        $name = trim(Request::string('name') ?? '');

        if (strlen($name) < 2) {
            Response::error('Dữ liệu danh mục chưa hợp lệ.', 422, ['name' => 'Tên danh mục phải có từ 2 đến 100 ký tự.']);
        }

        if (strlen($name) > 100) {
            Response::error('Dữ liệu danh mục chưa hợp lệ.', 422, ['name' => 'Tên danh mục không được dài quá 100 ký tự.']);
        }
        $pdo = getDbConnection();
        $slug = self::uniqueSlug($name, $id);

        $stmt = $pdo->prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?');
        $stmt->execute([$name, $slug, $id]);

        self::show(['id' => $id]);
    }

    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        if ($stmt->rowCount() === 0) {
            Response::error('Không tìm thấy danh mục.', 404);
        }
        Response::success(null, 'Đã xóa danh mục.');
    }

    private static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $pdo = getDbConnection();
        $base = Slugger::make($name, 'danh-muc');
        $slug = $base;
        $i = 1;

        while (true) {
            $sql = 'SELECT id FROM categories WHERE slug = ?' . ($ignoreId ? ' AND id != ?' : '');
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ignoreId ? [$slug, $ignoreId] : [$slug]);
            if (!$stmt->fetch()) break;
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
