<?php
/** @var Router $router */

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
