<?php
/**
 * Handles multipart/form-data image uploads. Accepts one or many files
 * under the "images[]" field (or a single "image" field) and returns
 * the public URL(s) to store against a product / blog post / avatar.
 */

class UploadController
{
    private const MIME_EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    private const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private const MAX_FILES = 20;

    /** POST /api/upload?type=products|blog|avatars — admin only, supports multiple files */
    public static function store(): void
    {
        Auth::requireAdmin();

        $type = Request::query('type', 'products');
        if (!in_array($type, ['products', 'blog', 'avatars'], true)) {
            Response::error('Loại ảnh tải lên không hợp lệ.', 422, ['type' => 'Chỉ nhận products, blog hoặc avatars.']);
        }

        $configuredRoot = trim((string) env('UPLOAD_DIR', ''));
        $uploadRoot = rtrim($configuredRoot !== '' ? $configuredRoot : __DIR__ . '/../uploads', '/\\');
        $targetDir = $uploadRoot . DIRECTORY_SEPARATOR . $type;
        if (!is_dir($targetDir)) {
            if (!mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
                Response::error('Không thể tạo thư mục lưu ảnh.', 500);
            }
        }

        $files = self::normalizeFiles($_FILES);

        if (!$files) {
            Response::error('Chưa có tệp ảnh nào được gửi lên.', 422, ['images' => 'Dùng trường "images[]" hoặc "image".']);
        }
        if (count($files) > self::MAX_FILES) {
            Response::error('Mỗi lần chỉ được tải lên tối đa ' . self::MAX_FILES . ' ảnh.', 422);
        }

        $uploaded = [];
        foreach ($files as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::error('Một tệp tải lên bị lỗi.', 422, ['images' => self::uploadErrorMessage((int) $file['error'])]);
            }
            if (!is_uploaded_file($file['tmp_name']) || !is_readable($file['tmp_name'])) {
                Response::error('Tệp tải lên không hợp lệ.', 422);
            }
            if ((int) $file['size'] <= 0 || (int) $file['size'] > self::MAX_SIZE) {
                Response::error('Ảnh phải có dung lượng lớn hơn 0 và không quá 5 MB.', 422, ['images' => basename((string) $file['name'])]);
            }

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->file($file['tmp_name']);
            $dimensions = @getimagesize($file['tmp_name']);
            if (!is_string($mime) || !isset(self::MIME_EXTENSIONS[$mime]) || $dimensions === false) {
                Response::error('Định dạng ảnh không được hỗ trợ. Chỉ nhận JPEG, PNG, WEBP hoặc GIF.', 422);
            }
            if (($dimensions[0] ?? 0) > 8000 || ($dimensions[1] ?? 0) > 8000) {
                Response::error('Kích thước ảnh không được vượt quá 8.000 × 8.000 pixel.', 422);
            }

            $filename = bin2hex(random_bytes(16)) . '.' . self::MIME_EXTENSIONS[$mime];
            $destination = $targetDir . '/' . $filename;

            if (!move_uploaded_file($file['tmp_name'], $destination)) {
                Response::error('Không thể lưu ảnh tải lên.', 500);
            }
            chmod($destination, 0644);

            $configuredBase = trim((string) env('UPLOAD_BASE_URL', ''));
            $publicBase = '/' . trim($configuredBase !== '' ? $configuredBase : '/uploads', '/');
            $uploaded[] = [
                'filename' => $filename,
                'path' => "{$publicBase}/{$type}/{$filename}",
                'color' => isset($file['color']) ? substr(trim((string) $file['color']), 0, 50) : null,
            ];
        }

        Response::success($uploaded, 'Đã tải lên ' . count($uploaded) . ' ảnh.', 201);
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
        $colors = is_array($_POST['colors'] ?? null) ? $_POST['colors'] : [];

        if (isset($filesGlobal['images']) && is_array($filesGlobal['images'])) {
            $images = $filesGlobal['images'];
            if (is_array($images['name'] ?? null)) {
                foreach ($images['name'] as $i => $name) {
                    if (!isset($images['tmp_name'][$i], $images['error'][$i], $images['size'][$i])) {
                        continue;
                    }
                    $result[] = [
                        'name' => $name,
                        'type' => $images['type'][$i] ?? '',
                        'tmp_name' => $images['tmp_name'][$i],
                        'error' => $images['error'][$i],
                        'size' => $images['size'][$i],
                        'color' => $colors[$i] ?? null,
                    ];
                }
            } elseif (is_string($images['name'] ?? null)) {
                $result[] = array_merge($images, ['color' => $colors[0] ?? null]);
            }
        }

        if (isset($filesGlobal['image']) && is_string($filesGlobal['image']['name'] ?? null)) {
            $result[] = array_merge($filesGlobal['image'], ['color' => $colors[0] ?? null]);
        }

        return $result;
    }

    private static function uploadErrorMessage(int $code): string
    {
        return match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Tệp vượt quá giới hạn dung lượng.',
            UPLOAD_ERR_PARTIAL => 'Tệp chỉ được tải lên một phần.',
            UPLOAD_ERR_NO_FILE => 'Chưa chọn tệp.',
            default => 'Không thể tải tệp lên máy chủ.',
        };
    }
}
