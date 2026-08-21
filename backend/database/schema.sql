-- =========================================================
-- ROZBUX — Database Schema
-- Run this once to create the database and all tables.
-- =========================================================

CREATE DATABASE IF NOT EXISTS rozbux
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rozbux;

-- ---------------------------------------------------------
-- USERS
-- ---------------------------------------------------------
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  phone VARCHAR(20) DEFAULT NULL,
  address VARCHAR(255) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE auth_login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_email_time (email, attempted_at),
  INDEX idx_login_ip_time (ip_hash, attempted_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------
CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED DEFAULT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  short_description VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  sizes JSON DEFAULT NULL,       -- e.g. ["xs","s","m","l","xl"]
  colors JSON DEFAULT NULL,      -- e.g. ["black","white","gray"]
  status ENUM('active', 'draft') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_products_status_created (status, created_at),
  INDEX idx_products_category_status (category_id, status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PRODUCT IMAGES (supports multi-image upload per product,
-- optionally tagged with a color variant)
-- ---------------------------------------------------------
CREATE TABLE product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  color VARCHAR(50) DEFAULT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_name VARCHAR(150) NOT NULL,
  shipping_email VARCHAR(150) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cod',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_orders_user_created (user_id, created_at),
  INDEX idx_orders_status_created (status, created_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ORDER ITEMS (snapshot of product at time of purchase)
-- ---------------------------------------------------------
CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED DEFAULT NULL,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  size VARCHAR(20) DEFAULT NULL,
  color VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- BLOG POSTS (content stored as HTML from a rich text editor,
-- e.g. TipTap / Quill on the admin side)
-- ---------------------------------------------------------
CREATE TABLE blog_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  author_id INT UNSIGNED DEFAULT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  excerpt VARCHAR(500) DEFAULT NULL,
  content LONGTEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  cover_image VARCHAR(255) DEFAULT NULL,
  status ENUM('published', 'draft') NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_blog_status_published (status, published_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- WISHLIST (many-to-many between users and products)
-- ---------------------------------------------------------
CREATE TABLE wishlists (
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- NEWSLETTER / CONTACT
-- ---------------------------------------------------------
CREATE TABLE newsletter_subscribers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_status_created (status, created_at)
) ENGINE=InnoDB;
