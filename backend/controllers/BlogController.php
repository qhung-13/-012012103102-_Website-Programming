<?php

class BlogController
{
    /** GET /api/blog — public, published posts only, paginated */
    public static function index(): void
    {
        $pdo = getDbConnection();

        $page = max(1, (int) Request::query('page', 1));
        $limit = min(48, max(1, (int) Request::query('limit', 9)));
        $offset = ($page - 1) * $limit;

        $total = (int) $pdo->query("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'")->fetchColumn();

        $stmt = $pdo->prepare(
            "SELECT id, title, slug, excerpt, category, cover_image, published_at
             FROM blog_posts WHERE status = 'published'
             ORDER BY published_at DESC LIMIT $limit OFFSET $offset"
        );
        $stmt->execute();

        Response::success($stmt->fetchAll(), 'OK', 200, [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    /** GET /api/blog/{slug} — public */
    public static function show(array $params): void
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            "SELECT bp.*, u.name AS author_name
             FROM blog_posts bp LEFT JOIN users u ON u.id = bp.author_id
             WHERE (bp.id = ? OR bp.slug = ?) AND bp.status = 'published'"
        );
        $stmt->execute([is_numeric($params['id']) ? $params['id'] : 0, $params['id']]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error('Không tìm thấy bài viết.', 404);
        }

        $post['content'] = ContentSanitizer::richText($post['content'] ?? '');
        Response::success($post);
    }

    /** GET /api/blog-admin — admin only, includes drafts, for the admin table */
    public static function indexAdmin(): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $posts = $pdo->query(
            'SELECT id, title, slug, category, status, published_at, created_at FROM blog_posts ORDER BY created_at DESC'
        )->fetchAll();
        Response::success($posts);
    }

    /** GET /api/blog-admin/{id} — admin only, includes drafts */
    public static function showAdmin(array $params): void
    {
        Auth::requireAdmin();
        $post = self::findById((int) $params['id']);
        if (!$post) {
            Response::error('Không tìm thấy bài viết.', 404);
        }
        Response::success($post);
    }

    /** POST /api/blog — admin only */
    public static function store(): void
    {
        $user = Auth::requireAdmin();
        $pdo = getDbConnection();

        $title = trim(Request::string('title') ?? '');
        if (strlen($title) < 2 || strlen($title) > 200) {
            Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['title' => 'Tiêu đề phải có từ 2 đến 200 ký tự.']);
        }

        $status = Request::input('status', 'draft');
        if (!in_array($status, ['draft', 'published'], true)) {
            Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['status' => 'Trạng thái bài viết không hợp lệ.']);
        }
        $slug = self::uniqueSlug($title);
        $excerpt = trim(Request::string('excerpt') ?? '');
        if (strlen($excerpt) > 500) {
            Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['excerpt' => 'Mô tả ngắn không được dài quá 500 ký tự.']);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO blog_posts (author_id, title, slug, excerpt, content, category, cover_image, status, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $user['sub'],
            $title,
            $slug,
            $excerpt !== '' ? $excerpt : null,
            ContentSanitizer::richText(Request::string('content')),
            substr(trim(Request::string('category') ?? ''), 0, 100) ?: null,
            self::cleanImagePath(Request::input('cover_image')),
            $status,
            $status === 'published' ? date('Y-m-d H:i:s') : null,
        ]);

        Response::success(self::findById((int) $pdo->lastInsertId()), 'Đã tạo bài viết.', 201);
    }

    /** PUT /api/blog/{id} — admin only */
    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];

        $fields = [];
        $values = [];
        foreach (['excerpt', 'category', 'cover_image'] as $field) {
            if (Request::input($field) !== null) {
                $fields[] = "$field = ?";
                if (!is_string(Request::input($field))) {
                    Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, [$field => 'Giá trị phải là văn bản.']);
                }
                $value = trim(Request::string($field) ?? '');
                if ($field === 'excerpt' && strlen($value) > 500) {
                    Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['excerpt' => 'Mô tả ngắn không được dài quá 500 ký tự.']);
                }
                if ($field === 'category') $values[] = substr($value, 0, 100);
                elseif ($field === 'cover_image') $values[] = self::cleanImagePath($value);
                else $values[] = $value !== '' ? $value : null;
            }
        }
        if (Request::input('content') !== null) {
            $fields[] = 'content = ?';
            if (!is_string(Request::input('content'))) {
                Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['content' => 'Nội dung phải là văn bản.']);
            }
            $values[] = ContentSanitizer::richText(Request::string('content'));
        }
        if (Request::input('title') !== null) {
            $title = trim(Request::string('title') ?? '');
            if (strlen($title) < 2 || strlen($title) > 200) {
                Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['title' => 'Tiêu đề phải có từ 2 đến 200 ký tự.']);
            }
            $fields[] = 'title = ?';
            $values[] = $title;
            $fields[] = 'slug = ?';
            $values[] = self::uniqueSlug($title, $id);
        }
        if (Request::input('status') !== null) {
            $status = Request::input('status');
            if (!in_array($status, ['draft', 'published'], true)) {
                Response::error('Dữ liệu bài viết chưa hợp lệ.', 422, ['status' => 'Trạng thái bài viết không hợp lệ.']);
            }
            $fields[] = 'status = ?';
            $values[] = $status;
            if ($status === 'published') {
                $fields[] = 'published_at = COALESCE(published_at, NOW())';
            }
        }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE blog_posts SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        $post = self::findById($id);
        if (!$post) {
            Response::error('Không tìm thấy bài viết.', 404);
        }
        Response::success($post, 'Đã cập nhật bài viết.');
    }

    /** DELETE /api/blog/{id} — admin only */
    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        if ($stmt->rowCount() === 0) {
            Response::error('Không tìm thấy bài viết.', 404);
        }
        Response::success(null, 'Đã xóa bài viết.');
    }

    private static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $pdo = getDbConnection();
        $base = Slugger::make($title, 'bai-viet');
        $slug = $base;
        $i = 1;

        while (true) {
            $sql = 'SELECT id FROM blog_posts WHERE slug = ?' . ($ignoreId ? ' AND id != ?' : '');
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ignoreId ? [$slug, $ignoreId] : [$slug]);
            if (!$stmt->fetch()) break;
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }

    private static function findById(int $id): ?array
    {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare(
            'SELECT bp.*, u.name AS author_name
             FROM blog_posts bp LEFT JOIN users u ON u.id = bp.author_id
             WHERE bp.id = ?'
        );
        $stmt->execute([$id]);
        $post = $stmt->fetch();
        if ($post) $post['content'] = ContentSanitizer::richText($post['content'] ?? '');
        return $post ?: null;
    }

    private static function cleanImagePath($value): ?string
    {
        if ($value !== null && !is_string($value)) {
            Response::error('Đường dẫn ảnh bìa không hợp lệ.', 422, ['cover_image' => 'Đường dẫn ảnh phải là văn bản.']);
        }
        $path = trim(is_string($value) ? $value : '');
        if ($path === '') return null;
        if (preg_match('#^/uploads/blog/[A-Za-z0-9_-]+\.(jpe?g|png|webp|gif)$#i', $path)) return $path;
        Response::error('Đường dẫn ảnh bìa không hợp lệ.', 422, ['cover_image' => 'Hãy tải ảnh bằng chức năng tải lên.']);
        return null;
    }
}
