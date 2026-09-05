<?php
/** @var Router $router */

$router->get('', static function (array $params = []): void {
    Response::success([
        'service' => 'Roxbusi API',
        'status' => 'ok',
    ], 'API đang hoạt động.');
});
$router->get('/health', static function (array $params = []): void {
    getDbConnection()->query('SELECT 1');
    Response::success(['status' => 'ok', 'database' => 'ok'], 'Hệ thống hoạt động bình thường.');
});

// -------------------- DASHBOARD (admin) --------------------
$router->get('/dashboard', [DashboardController::class, 'index']);

// -------------------- AUTH --------------------
$router->post('/auth/register', [AuthController::class, 'register']);
$router->post('/auth/login', [AuthController::class, 'login']);
$router->get('/auth/me', [AuthController::class, 'me']);
$router->put('/auth/profile', [AuthController::class, 'updateProfile']);

// -------------------- PRODUCTS --------------------
$router->get('/products', [ProductController::class, 'index']);
$router->get('/products/{id}', [ProductController::class, 'show']);
$router->post('/products', [ProductController::class, 'store']);
$router->put('/products/{id}', [ProductController::class, 'update']);
$router->delete('/products/{id}', [ProductController::class, 'destroy']);

// -------------------- CATEGORIES --------------------
$router->get('/categories', [CategoryController::class, 'index']);
$router->get('/categories/{id}', [CategoryController::class, 'show']);
$router->post('/categories', [CategoryController::class, 'store']);
$router->put('/categories/{id}', [CategoryController::class, 'update']);
$router->delete('/categories/{id}', [CategoryController::class, 'destroy']);

// -------------------- USERS (admin) --------------------
$router->get('/users', [UserController::class, 'index']);
$router->get('/users/{id}', [UserController::class, 'show']);
$router->post('/users', [UserController::class, 'store']);
$router->put('/users/{id}', [UserController::class, 'update']);
$router->delete('/users/{id}', [UserController::class, 'destroy']);

// -------------------- ORDERS --------------------
$router->get('/orders', [OrderController::class, 'index']);
$router->get('/orders/{id}', [OrderController::class, 'show']);
$router->post('/orders', [OrderController::class, 'store']);
$router->put('/orders/{id}', [OrderController::class, 'update']);
$router->delete('/orders/{id}', [OrderController::class, 'destroy']);

// -------------------- BLOG --------------------
$router->get('/blog', [BlogController::class, 'index']);
$router->get('/blog-admin', [BlogController::class, 'indexAdmin']);
$router->get('/blog-admin/{id}', [BlogController::class, 'showAdmin']);
$router->get('/blog/{id}', [BlogController::class, 'show']);
$router->post('/blog', [BlogController::class, 'store']);
$router->put('/blog/{id}', [BlogController::class, 'update']);
$router->delete('/blog/{id}', [BlogController::class, 'destroy']);

// -------------------- WISHLIST --------------------
$router->get('/wishlist', [WishlistController::class, 'index']);
$router->post('/wishlist', [WishlistController::class, 'store']);
$router->delete('/wishlist/{id}', [WishlistController::class, 'destroy']);

// -------------------- UPLOAD --------------------
$router->post('/upload', [UploadController::class, 'store']);
$router->delete('/upload', [UploadController::class, 'destroy']);

// -------------------- CONTACT / NEWSLETTER --------------------
$router->post('/contact', [MarketingController::class, 'contact']);
$router->post('/newsletter', [MarketingController::class, 'subscribe']);
$router->get('/contact-messages', [MarketingController::class, 'messages']);
$router->get('/contact-messages/{id}', [MarketingController::class, 'showMessage']);
$router->put('/contact-messages/{id}', [MarketingController::class, 'updateMessage']);
$router->delete('/contact-messages/{id}', [MarketingController::class, 'deleteMessage']);
$router->get('/newsletter-subscribers', [MarketingController::class, 'subscribers']);
$router->get('/newsletter-subscribers/{id}', [MarketingController::class, 'showSubscriber']);
$router->put('/newsletter-subscribers/{id}', [MarketingController::class, 'updateSubscriber']);
$router->delete('/newsletter-subscribers/{id}', [MarketingController::class, 'deleteSubscriber']);
