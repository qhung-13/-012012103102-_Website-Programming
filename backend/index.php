<?php
/**
 * Front controller — every API request is routed through this file.
 * Local dev (no Apache): php -S localhost:8000 index.php
 * Apache/XAMPP: handled by .htaccess rewriting everything here.
 */

declare(strict_types=1);
error_reporting(E_ALL & ~E_DEPRECATED);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/JWT.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Slugger.php';
require_once __DIR__ . '/core/ContentSanitizer.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/BlogController.php';
require_once __DIR__ . '/controllers/WishlistController.php';
require_once __DIR__ . '/controllers/UploadController.php';
require_once __DIR__ . '/controllers/MarketingController.php';
require_once __DIR__ . '/controllers/DashboardController.php';

$debug = filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOL);
ini_set('display_errors', $debug ? '1' : '0');
ini_set('log_errors', '1');

applyCors();

// Serve uploaded files directly when using the PHP built-in dev server
// (Apache/XAMPP serves /uploads as static files automatically).
if (php_sapi_name() === 'cli-server') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (str_starts_with($path, '/uploads/') && file_exists(__DIR__ . $path)) {
        return false;
    }
}

set_exception_handler(function (Throwable $e) {
    $debug = filter_var(env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOL);
    error_log($e->__toString());
    Response::error(
        $debug ? $e->getMessage() : 'Lỗi máy chủ nội bộ.',
        500,
        $debug ? ['trace' => $e->getTraceAsString()] : null
    );
});

$router = new Router();
require __DIR__ . '/routes/api.php';

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
