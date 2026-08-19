-- Chạy file này một lần nếu database đã được tạo từ schema cũ.
USE rozbux;

CREATE TABLE IF NOT EXISTS auth_login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_email_time (email, attempted_at),
  INDEX idx_login_ip_time (ip_hash, attempted_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  status ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'resolved') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_status_created (status, created_at)
) ENGINE=InnoDB;

ALTER TABLE orders MODIFY payment_method VARCHAR(50) DEFAULT 'cod';

-- Các chỉ mục dưới đây dành cho schema cũ chưa có chỉ mục lọc/sắp xếp.
-- Chạy migration đúng một lần trên mỗi database.
ALTER TABLE products
  ADD INDEX idx_products_status_created (status, created_at),
  ADD INDEX idx_products_category_status (category_id, status);

ALTER TABLE orders
  ADD INDEX idx_orders_user_created (user_id, created_at),
  ADD INDEX idx_orders_status_created (status, created_at);

ALTER TABLE blog_posts
  ADD INDEX idx_blog_status_published (status, published_at);
