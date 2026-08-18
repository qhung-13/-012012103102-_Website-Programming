<?php
/**
 * Handles multipart/form-data image uploads. Accepts one or many files
 * under the "images[]" field (or a single "image" field) and returns
 * the public URL(s) to store against a product / blog post / avatar.
 */

class UploadController
{
    private const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    /** POST /api/upload?type=products|blog|avatars — admin only, supports multiple files */
    public static function store(): void
    {
        Auth::requireAdmin();

        $type = Request::query('type', 'products');
        if (!in_array($type, ['products', 'blog', 'avatars'], true)) {
            $type = 'products';
        }

        $targetDir = __DIR__ . '/../uploads/' . $type;
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $files = self::normalizeFiles($_FILES);

        if (!$files) {
            Response::error('No file(s) uploaded. Use field "images[]" or "image".', 422);
        }

        $uploaded = [];
        foreach ($files as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                continue;
            }
            if (!in_array($file['type'], self::ALLOWED_TYPES, true)) {
                Response::error("Unsupported file type: {$file['type']}. Use JPEG, PNG, WEBP or GIF.", 422);
            }
            if ($file['size'] > self::MAX_SIZE) {
                Response::error("File too large: {$file['name']}. Max size is 5MB.", 422);
            }

            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = bin2hex(random_bytes(8)) . '.' . strtolower($ext);
            $destination = $targetDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                Response::error("Failed to save file: {$file['name']}.", 500);
            }

            $uploaded[] = [
                'filename' => $filename,
                'path' => "/uploads/{$type}/{$filename}",
                'color' => $file['color'] ?? null,
            ];
        }

        Response::success($uploaded, count($uploaded) . ' file(s) uploaded.', 201);
    }

    /**
     * Normalizes PHP's awkward multi-file $_FILES structure (for "images[]")
     * into a flat list of single-file arrays, and also supports a plain
     * single "image" field. Also picks up a matching "colors[]" field so
     * each image can be tagged with the product color it belongs to.
     */
    private static function normalizeFiles(array $filesGlobal): array
    {
        $result = [];
        $colors = $_POST['colors'] ?? [];

        if (isset($filesGlobal['images'])) {
            $images = $filesGlobal['images'];
            if (is_array($images['name'])) {
                foreach ($images['name'] as $i => $name) {
                    $result[] = [
                        'name' => $name,
                        'type' => $images['type'][$i],
                        'tmp_name' => $images['tmp_name'][$i],
                        'error' => $images['error'][$i],
                        'size' => $images['size'][$i],
                        'color' => $colors[$i] ?? null,
                    ];
                }
            } else {
                $result[] = array_merge($images, ['color' => $colors[0] ?? null]);
            }
        }

        if (isset($filesGlobal['image']) && is_string($filesGlobal['image']['name'] ?? null)) {
            $result[] = array_merge($filesGlobal['image'], ['color' => $colors[0] ?? null]);
        }

        return $result;
    }
}
