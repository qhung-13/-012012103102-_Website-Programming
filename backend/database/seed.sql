-- =========================================================
-- TRENDLAMA — Seed Data (sample data to test the API right away)
-- Run this AFTER schema.sql
-- =========================================================

USE trendlama;

-- Default admin account: admin@trendlama.com / Admin@123
-- Default customer account: customer@trendlama.com / Customer@123
-- (passwords below are bcrypt hashes generated with PHP password_hash)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@trendlama.com', '$2b$10$/pFuvkNXEbQI1nhPeAGqx.k0mXe0dPOJFGiX7e4Ed/B3J3BJ4b6c6', 'admin'),
('Nguyen Van A', 'customer@trendlama.com', '$2b$10$UirHXUDGOdMKU/ffdboV7.5Yj16NSFxKhu/5Jx099VWigMnapRfFe', 'customer');

INSERT INTO categories (name, slug) VALUES
('T-shirts', 't-shirts'),
('Shoes', 'shoes'),
('Accessories', 'accessories'),
('Bags', 'bags'),
('Dresses', 'dresses'),
('Jackets', 'jackets'),
('Gloves', 'gloves');

INSERT INTO products (category_id, name, slug, short_description, description, price, stock, sizes, colors) VALUES
(1, 'Adidas CoreFit T-Shirt', 'adidas-corefit-t-shirt', 'Soft cotton tee built for everyday wear.', 'A breathable, pre-shrunk cotton t-shirt cut for a relaxed, everyday fit. Reinforced seams and a heavier fabric weight keep it looking sharp wash after wash.', 59.90, 120, '["xs","s","m","l","xl"]', '["gray","purple","green"]'),
(6, 'Nike Air Essentials Jacket', 'nike-air-essentials-jacket', 'Lightweight jacket for transitional weather.', 'An unlined shell jacket built for layering. Water-resistant finish and a packable design make it a year-round staple.', 129.90, 60, '["s","m","l","xl"]', '["black","navy"]'),
(2, 'Puma RunFlex Sneakers', 'puma-runflex-sneakers', 'Everyday runners with responsive cushioning.', 'Engineered mesh upper for breathability, paired with a responsive foam midsole for all-day comfort.', 89.90, 80, '["38","39","40","41","42","43"]', '["white","black"]'),
(1, 'Uniqlo Airism Tee', 'uniqlo-airism-tee', 'Ultra-light tee that keeps you cool.', 'Moisture-wicking, quick-drying fabric designed to keep you comfortable through the heat of the day.', 39.90, 200, '["xs","s","m","l","xl"]', '["white","black","blue"]'),
(3, 'Ray-Ban Classic Sunglasses', 'rayban-classic-sunglasses', 'Timeless frame, UV400 protection.', 'A classic silhouette with scratch-resistant lenses and full UV400 protection.', 149.90, 40, '["one-size"]', '["black","tortoise"]');

INSERT INTO product_images (product_id, color, image_path, sort_order) VALUES
(1, 'gray', '/uploads/products/1-gray-1.jpg', 0),
(1, 'purple', '/uploads/products/1-purple-1.jpg', 0),
(1, 'green', '/uploads/products/1-green-1.jpg', 0),
(2, 'black', '/uploads/products/2-black-1.jpg', 0),
(2, 'navy', '/uploads/products/2-navy-1.jpg', 0),
(3, 'white', '/uploads/products/3-white-1.jpg', 0),
(3, 'black', '/uploads/products/3-black-1.jpg', 0),
(4, 'white', '/uploads/products/4-white-1.jpg', 0),
(5, 'black', '/uploads/products/5-black-1.jpg', 0);

INSERT INTO blog_posts (author_id, title, slug, excerpt, content, category, status, published_at) VALUES
(1, 'How to Style Oversized Tees for Every Season', 'how-to-style-oversized-tees',
 'Oversized tees aren''t just for lounging anymore.',
 '<p>Oversized silhouettes have moved from loungewear staple to a genuine wardrobe anchor...</p>',
 'Style Guide', 'published', NOW());
