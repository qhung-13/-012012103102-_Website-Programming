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
require_once __DIR__ . '/middleware/AuthMiddleware.php';

require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/BlogController.php';
require_once __DIR__ . '/controllers/WishlistController.php';
require_once __DIR__ . '/controllers/UploadController.php';

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
    $debug = env('APP_DEBUG', 'false') === 'true';
    Response::error(
        $debug ? $e->getMessage() : 'Internal server error.',
        500,
        $debug ? ['trace' => $e->getTraceAsString()] : null
    );
});

$router = new Router();
require __DIR__ . '/routes/api.php';

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
