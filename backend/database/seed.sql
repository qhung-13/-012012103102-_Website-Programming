-- =========================================================
-- TRENDLAMA — Dữ liệu mẫu (chạy sau schema.sql)
-- Không chứa mật khẩu hoặc tài khoản mặc định.
-- Tạo quản trị viên bằng: php database/create_admin.php
-- =========================================================

USE rozbux;

INSERT INTO categories (name, slug) VALUES
('Áo thun', 'ao-thun'),
('Giày', 'giay'),
('Phụ kiện', 'phu-kien'),
('Túi xách', 'tui-xach'),
('Váy', 'vay'),
('Áo khoác', 'ao-khoac'),
('Găng tay', 'gang-tay');

INSERT INTO products (category_id, name, slug, short_description, description, price, stock, sizes, colors) VALUES
(1, 'Áo thun Adidas CoreFit', 'ao-thun-adidas-corefit', 'Áo cotton mềm mại dành cho trang phục hằng ngày.', 'Chất cotton thoáng khí, chống co rút và phom dáng thoải mái. Đường may gia cố giúp áo giữ dáng tốt sau nhiều lần giặt.', 59.90, 120, '["xs","s","m","l","xl"]', '["gray","purple","green"]'),
(6, 'Áo khoác Nike Air Essentials', 'ao-khoac-nike-air-essentials', 'Áo khoác nhẹ phù hợp thời tiết giao mùa.', 'Lớp ngoài chống thấm nhẹ, dễ phối nhiều lớp và có thể gấp gọn để mang theo quanh năm.', 129.90, 60, '["s","m","l","xl"]', '["black","navy"]'),
(2, 'Giày Puma RunFlex', 'giay-puma-runflex', 'Giày chạy hằng ngày với lớp đệm đàn hồi.', 'Thân giày lưới thoáng khí kết hợp đế giữa bằng bọt đàn hồi, tạo cảm giác êm ái suốt ngày dài.', 89.90, 80, '["38","39","40","41","42","43"]', '["white","black"]'),
(1, 'Áo thun Uniqlo Airism', 'ao-thun-uniqlo-airism', 'Áo siêu nhẹ giúp cơ thể luôn thoáng mát.', 'Chất liệu thấm hút và khô nhanh, mang lại cảm giác thoải mái trong những ngày nóng.', 39.90, 200, '["xs","s","m","l","xl"]', '["white","black","blue"]'),
(3, 'Kính mát Ray-Ban Classic', 'kinh-mat-rayban-classic', 'Gọng kính kinh điển với khả năng chống tia UV400.', 'Kiểu dáng vượt thời gian, tròng chống trầy xước và bảo vệ mắt toàn diện trước tia UV400.', 149.90, 40, '["one-size"]', '["black","tortoise"]');

-- Ảnh mẫu nằm trong public/products của cả client và admin.
INSERT INTO product_images (product_id, color, image_path, sort_order) VALUES
(1, 'gray', '/products/1g.png', 0),
(1, 'purple', '/products/1p.png', 0),
(1, 'green', '/products/1gr.png', 0),
(2, 'black', '/products/3b.png', 0),
(2, 'navy', '/products/3bl.png', 0),
(3, 'white', '/products/4w.png', 0),
(3, 'black', '/products/4p.png', 0),
(4, 'white', '/products/6w.png', 0),
(5, 'black', '/products/8b.png', 0);

INSERT INTO blog_posts (author_id, title, slug, excerpt, content, category, status, published_at) VALUES
(NULL, 'Phối áo thun dáng rộng cho mọi mùa', 'phoi-ao-thun-dang-rong-cho-moi-mua',
 'Áo thun dáng rộng không còn chỉ dành cho những lúc ở nhà.',
 '<p>Phom dáng rộng đã trở thành một món đồ chủ đạo, dễ kết hợp trong nhiều phong cách khác nhau.</p>',
 'Cẩm nang phong cách', 'published', NOW());
