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
            'SELECT bp.*, u.name AS author_name
             FROM blog_posts bp LEFT JOIN users u ON u.id = bp.author_id
             WHERE bp.id = ? OR bp.slug = ?'
        );
        $stmt->execute([is_numeric($params['id']) ? $params['id'] : 0, $params['id']]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error('Post not found.', 404);
        }

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

    /** POST /api/blog — admin only */
    public static function store(): void
    {
        $user = Auth::requireAdmin();
        $pdo = getDbConnection();

        $title = trim((string) Request::input('title'));
        if (strlen($title) < 2) {
            Response::error('Validation failed.', 422, ['title' => 'Title is required.']);
        }

        $status = Request::input('status', 'draft');
        $slug = self::uniqueSlug($title);

        $stmt = $pdo->prepare(
            'INSERT INTO blog_posts (author_id, title, slug, excerpt, content, category, cover_image, status, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $user['sub'],
            $title,
            $slug,
            Request::input('excerpt'),
            Request::input('content'), // HTML from the admin's rich text editor
            Request::input('category'),
            Request::input('cover_image'),
            $status,
            $status === 'published' ? date('Y-m-d H:i:s') : null,
        ]);

        self::show(['id' => (int) $pdo->lastInsertId()]);
    }

    /** PUT /api/blog/{id} — admin only */
    public static function update(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $id = (int) $params['id'];

        $fields = [];
        $values = [];
        foreach (['excerpt', 'content', 'category', 'cover_image'] as $field) {
            if (Request::input($field) !== null) {
                $fields[] = "$field = ?";
                $values[] = Request::input($field);
            }
        }
        if (Request::input('title') !== null) {
            $fields[] = 'title = ?';
            $values[] = Request::input('title');
            $fields[] = 'slug = ?';
            $values[] = self::uniqueSlug((string) Request::input('title'), $id);
        }
        if (Request::input('status') !== null) {
            $status = Request::input('status');
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

        self::show(['id' => $id]);
    }

    /** DELETE /api/blog/{id} — admin only */
    public static function destroy(array $params): void
    {
        Auth::requireAdmin();
        $pdo = getDbConnection();
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
        $stmt->execute([(int) $params['id']]);
        Response::success(null, 'Post deleted.');
    }

    private static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $pdo = getDbConnection();
        $base = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $title), '-'));
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
}
