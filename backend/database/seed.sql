-- =========================================================
-- Roxbusi - du lieu mau mo rong, ban de doc
-- Chay sau database/schema.sql tren database TiDB/MySQL.
--
-- Script nay:
--   1. Khong tao/chinh mat khau admin.
--   2. Co the chay lai: categories/products/blog/newsletter update theo slug/email.
--   3. Anh mau /products/* cua san pham seed se duoc refresh de tranh trung.
-- =========================================================

USE rozbux;
SET NAMES utf8mb4;

START TRANSACTION;

-- =========================================================
-- 1. Danh muc
-- =========================================================

INSERT INTO categories (name, slug)
VALUES
  ('Áo thun', 'ao-thun'),
  ('Giày', 'giay'),
  ('Phụ kiện', 'phu-kien'),
  ('Túi xách', 'tui-xach'),
  ('Váy', 'vay'),
  ('Áo khoác', 'ao-khoac'),
  ('Găng tay', 'gang-tay'),
  ('Quần', 'quan'),
  ('Mũ nón', 'mu-non'),
  ('Đồ thể thao', 'do-the-thao')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- =========================================================
-- 2. San pham
-- =========================================================

INSERT INTO products (
  category_id,
  name,
  slug,
  short_description,
  description,
  price,
  stock,
  sizes,
  colors,
  status
)
VALUES
  -- Ao thun
  (
    (SELECT id FROM categories WHERE slug = 'ao-thun'),
    'Áo thun Adidas CoreFit',
    'ao-thun-adidas-corefit',
    'Áo cotton mềm mại dành cho trang phục hằng ngày.',
    '<p>Chất cotton thoáng khí, chống co rút và phom dáng thoải mái. Đường may gia cố giúp áo giữ dáng tốt sau nhiều lần giặt.</p>',
    59.90,
    120,
    '["xs","s","m","l","xl"]',
    '["gray","purple","green"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'ao-thun'),
    'Áo thun Uniqlo Airism',
    'ao-thun-uniqlo-airism',
    'Áo siêu nhẹ giúp cơ thể luôn thoáng mát.',
    '<p>Chất liệu thấm hút và khô nhanh, phù hợp đi học, đi làm hoặc mặc lót bên trong áo khoác.</p>',
    39.90,
    200,
    '["xs","s","m","l","xl"]',
    '["white","black","blue"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'ao-thun'),
    'Áo polo Lacoste City',
    'ao-polo-lacoste-city',
    'Áo polo tối giản cho phong cách smart casual.',
    '<p>Vải pique đứng phom, cổ áo chắc chắn và màu sắc dễ phối với quần jeans hoặc chân váy.</p>',
    79.90,
    95,
    '["s","m","l","xl"]',
    '["green","gray"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'ao-thun'),
    'Áo thun Local Brand Minimal',
    'ao-thun-local-brand-minimal',
    'Áo thun in logo nhỏ, dễ mặc mỗi ngày.',
    '<p>Form oversize vừa phải, chất vải dày dặn nhưng vẫn mềm, hợp với outfit streetwear gọn gàng.</p>',
    34.90,
    150,
    '["s","m","l","xl"]',
    '["black","white"]',
    'active'
  ),

  -- Ao khoac
  (
    (SELECT id FROM categories WHERE slug = 'ao-khoac'),
    'Áo khoác Nike Air Essentials',
    'ao-khoac-nike-air-essentials',
    'Áo khoác nhẹ phù hợp thời tiết giao mùa.',
    '<p>Lớp ngoài chống thấm nhẹ, dễ phối nhiều lớp và có thể gấp gọn để mang theo quanh năm.</p>',
    129.90,
    60,
    '["s","m","l","xl"]',
    '["black","navy"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'ao-khoac'),
    'Áo hoodie Champion Reverse Weave',
    'ao-hoodie-champion-reverse-weave',
    'Hoodie nỉ dày, giữ ấm tốt nhưng vẫn thoải mái.',
    '<p>Mặt trong mềm, bo tay chắc, có túi kangaroo và phần mũ rộng vừa đủ cho những ngày se lạnh.</p>',
    99.90,
    70,
    '["s","m","l","xl"]',
    '["gray","green"]',
    'active'
  ),

  -- Giay
  (
    (SELECT id FROM categories WHERE slug = 'giay'),
    'Giày Puma RunFlex',
    'giay-puma-runflex',
    'Giày chạy hằng ngày với lớp đệm đàn hồi.',
    '<p>Thân giày lưới thoáng khí kết hợp đế giữa bằng bọt đàn hồi, tạo cảm giác êm ái suốt ngày dài.</p>',
    89.90,
    80,
    '["38","39","40","41","42","43"]',
    '["white","black"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'giay'),
    'Giày Adidas Court Daily',
    'giay-adidas-court-daily',
    'Giày sneaker trắng dễ phối cho mọi outfit.',
    '<p>Thiết kế gọn, đế cao su bám tốt và lớp lót êm phù hợp đi học, đi chơi hoặc đi làm.</p>',
    84.90,
    110,
    '["37","38","39","40","41","42"]',
    '["white","green"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'giay'),
    'Giày Nike Street Runner',
    'giay-nike-street-runner',
    'Sneaker năng động cho di chuyển cả ngày.',
    '<p>Đệm gót nhẹ, phần upper thoáng và phối màu trung tính để dùng được trong nhiều dịp.</p>',
    119.90,
    58,
    '["38","39","40","41","42","43"]',
    '["black","gray"]',
    'active'
  ),

  -- Phu kien
  (
    (SELECT id FROM categories WHERE slug = 'phu-kien'),
    'Kính mát Ray-Ban Classic',
    'kinh-mat-rayban-classic',
    'Gọng kính kinh điển với khả năng chống tia UV400.',
    '<p>Kiểu dáng vượt thời gian, tròng chống trầy xước và bảo vệ mắt toàn diện trước tia UV400.</p>',
    149.90,
    40,
    '["one-size"]',
    '["black","tortoise"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'phu-kien'),
    'Dây nịt Leather Basic',
    'day-nit-leather-basic',
    'Dây nịt da tổng hợp, khóa kim loại tối giản.',
    '<p>Bề mặt vân nhẹ, dễ phối cùng quần jeans, quần tây hoặc váy dáng dài.</p>',
    29.90,
    130,
    '["s","m","l"]',
    '["black","brown"]',
    'active'
  ),

  -- Tui xach
  (
    (SELECT id FROM categories WHERE slug = 'tui-xach'),
    'Túi tote Canvas Everyday',
    'tui-tote-canvas-everyday',
    'Túi tote rộng rãi cho laptop và đồ cá nhân.',
    '<p>Canvas dày, quai chắc, ngăn chính rộng và có túi phụ để cất ví, chìa khóa hoặc tai nghe.</p>',
    24.90,
    180,
    '["one-size"]',
    '["black","green"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'tui-xach'),
    'Balo Urban Compact',
    'balo-urban-compact',
    'Balo gọn nhẹ cho đi học và đi làm.',
    '<p>Ngăn laptop 14 inch, mặt lưng êm và thiết kế tối giản phù hợp dùng hằng ngày.</p>',
    69.90,
    75,
    '["one-size"]',
    '["black","navy"]',
    'active'
  ),

  -- Vay
  (
    (SELECT id FROM categories WHERE slug = 'vay'),
    'Váy midi Linen Breeze',
    'vay-midi-linen-breeze',
    'Váy midi chất linen nhẹ, hợp thời tiết nóng.',
    '<p>Dáng xòe vừa phải, cạp lưng thoải mái và chất vải thoáng giúp outfit mềm mại hơn.</p>',
    64.90,
    52,
    '["s","m","l"]',
    '["white","orange"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'vay'),
    'Váy tennis Sporty Pleat',
    'vay-tennis-sporty-pleat',
    'Chân váy tennis xếp ly cho outfit năng động.',
    '<p>Có quần bảo hộ bên trong, chất vải co giãn nhẹ và giữ ly tốt sau nhiều lần giặt.</p>',
    44.90,
    88,
    '["xs","s","m","l"]',
    '["white","purple"]',
    'active'
  ),

  -- Cac danh muc con lai
  (
    (SELECT id FROM categories WHERE slug = 'gang-tay'),
    'Găng tay Winter Touch',
    'gang-tay-winter-touch',
    'Găng tay giữ ấm có đầu ngón hỗ trợ cảm ứng.',
    '<p>Lớp len mềm, cổ tay ôm vừa và đầu ngón có sợi dẫn điện để dùng điện thoại khi trời lạnh.</p>',
    19.90,
    140,
    '["s","m","l"]',
    '["gray","black"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'quan'),
    'Quần jogger Daily Move',
    'quan-jogger-daily-move',
    'Jogger co giãn nhẹ, thoải mái khi di chuyển.',
    '<p>Lưng thun có dây rút, túi hai bên sâu và bo ống gọn để phối cùng sneaker.</p>',
    54.90,
    105,
    '["s","m","l","xl"]',
    '["black","gray"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'quan'),
    'Quần jeans Straight Blue',
    'quan-jeans-straight-blue',
    'Jeans ống đứng xanh cổ điển.',
    '<p>Form straight dễ mặc, denim vừa độ dày và wash xanh trung tính cho tủ đồ hằng ngày.</p>',
    74.90,
    66,
    '["28","29","30","31","32","33"]',
    '["blue"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'mu-non'),
    'Mũ bucket Summer Shade',
    'mu-bucket-summer-shade',
    'Mũ bucket mềm, che nắng tốt.',
    '<p>Vải cotton dày vừa, vành mũ rộng nhẹ và có thể gấp gọn khi mang theo trong túi.</p>',
    22.90,
    115,
    '["one-size"]',
    '["black","green"]',
    'active'
  ),
  (
    (SELECT id FROM categories WHERE slug = 'do-the-thao'),
    'Set gym Active Duo',
    'set-gym-active-duo',
    'Set áo và quần tập co giãn cho buổi workout.',
    '<p>Chất vải khô nhanh, đường may phẳng giảm cọ xát và màu sắc dễ phối với giày thể thao.</p>',
    89.90,
    72,
    '["s","m","l","xl"]',
    '["gray","purple"]',
    'active'
  )
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = VALUES(name),
  short_description = VALUES(short_description),
  description = VALUES(description),
  price = VALUES(price),
  stock = VALUES(stock),
  sizes = VALUES(sizes),
  colors = VALUES(colors),
  status = VALUES(status);

-- =========================================================
-- 3. Anh san pham
-- =========================================================

DELETE FROM product_images
WHERE image_path LIKE '/products/%'
  AND product_id IN (
    SELECT id
    FROM products
    WHERE slug IN (
      'ao-thun-adidas-corefit',
      'ao-thun-uniqlo-airism',
      'ao-polo-lacoste-city',
      'ao-thun-local-brand-minimal',
      'ao-khoac-nike-air-essentials',
      'ao-hoodie-champion-reverse-weave',
      'giay-puma-runflex',
      'giay-adidas-court-daily',
      'giay-nike-street-runner',
      'kinh-mat-rayban-classic',
      'day-nit-leather-basic',
      'tui-tote-canvas-everyday',
      'balo-urban-compact',
      'vay-midi-linen-breeze',
      'vay-tennis-sporty-pleat',
      'gang-tay-winter-touch',
      'quan-jogger-daily-move',
      'quan-jeans-straight-blue',
      'mu-bucket-summer-shade',
      'set-gym-active-duo'
    )
  );

INSERT INTO product_images (
  product_id,
  color,
  image_path,
  sort_order
)
VALUES
  -- Ao thun Adidas CoreFit
  ((SELECT id FROM products WHERE slug = 'ao-thun-adidas-corefit'), 'gray', '/products/1g.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-thun-adidas-corefit'), 'purple', '/products/1p.png', 1),
  ((SELECT id FROM products WHERE slug = 'ao-thun-adidas-corefit'), 'green', '/products/1gr.png', 2),

  -- Ao thun Uniqlo Airism
  ((SELECT id FROM products WHERE slug = 'ao-thun-uniqlo-airism'), 'white', '/products/6w.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-thun-uniqlo-airism'), 'black', '/products/8b.png', 1),
  ((SELECT id FROM products WHERE slug = 'ao-thun-uniqlo-airism'), 'blue', '/products/5bl.png', 2),

  -- Ao polo Lacoste City
  ((SELECT id FROM products WHERE slug = 'ao-polo-lacoste-city'), 'green', '/products/7g.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-polo-lacoste-city'), 'gray', '/products/2g.png', 1),

  -- Ao thun Local Brand Minimal
  ((SELECT id FROM products WHERE slug = 'ao-thun-local-brand-minimal'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-thun-local-brand-minimal'), 'white', '/products/4w.png', 1),

  -- Ao khoac
  ((SELECT id FROM products WHERE slug = 'ao-khoac-nike-air-essentials'), 'black', '/products/3b.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-khoac-nike-air-essentials'), 'navy', '/products/3bl.png', 1),
  ((SELECT id FROM products WHERE slug = 'ao-hoodie-champion-reverse-weave'), 'gray', '/products/3gr.png', 0),
  ((SELECT id FROM products WHERE slug = 'ao-hoodie-champion-reverse-weave'), 'green', '/products/2gr.png', 1),

  -- Giay
  ((SELECT id FROM products WHERE slug = 'giay-puma-runflex'), 'white', '/products/4w.png', 0),
  ((SELECT id FROM products WHERE slug = 'giay-puma-runflex'), 'black', '/products/4p.png', 1),
  ((SELECT id FROM products WHERE slug = 'giay-adidas-court-daily'), 'white', '/products/6w.png', 0),
  ((SELECT id FROM products WHERE slug = 'giay-adidas-court-daily'), 'green', '/products/6g.png', 1),
  ((SELECT id FROM products WHERE slug = 'giay-nike-street-runner'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'giay-nike-street-runner'), 'gray', '/products/8gr.png', 1),

  -- Phu kien
  ((SELECT id FROM products WHERE slug = 'kinh-mat-rayban-classic'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'kinh-mat-rayban-classic'), 'tortoise', '/products/5o.png', 1),
  ((SELECT id FROM products WHERE slug = 'day-nit-leather-basic'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'day-nit-leather-basic'), 'brown', '/products/5o.png', 1),

  -- Tui xach
  ((SELECT id FROM products WHERE slug = 'tui-tote-canvas-everyday'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'tui-tote-canvas-everyday'), 'green', '/products/7g.png', 1),
  ((SELECT id FROM products WHERE slug = 'balo-urban-compact'), 'black', '/products/3b.png', 0),
  ((SELECT id FROM products WHERE slug = 'balo-urban-compact'), 'navy', '/products/5bl.png', 1),

  -- Vay
  ((SELECT id FROM products WHERE slug = 'vay-midi-linen-breeze'), 'white', '/products/6w.png', 0),
  ((SELECT id FROM products WHERE slug = 'vay-midi-linen-breeze'), 'orange', '/products/5o.png', 1),
  ((SELECT id FROM products WHERE slug = 'vay-tennis-sporty-pleat'), 'white', '/products/4w.png', 0),
  ((SELECT id FROM products WHERE slug = 'vay-tennis-sporty-pleat'), 'purple', '/products/7p.png', 1),

  -- Cac san pham con lai
  ((SELECT id FROM products WHERE slug = 'gang-tay-winter-touch'), 'gray', '/products/1g.png', 0),
  ((SELECT id FROM products WHERE slug = 'gang-tay-winter-touch'), 'black', '/products/8b.png', 1),
  ((SELECT id FROM products WHERE slug = 'quan-jogger-daily-move'), 'black', '/products/3b.png', 0),
  ((SELECT id FROM products WHERE slug = 'quan-jogger-daily-move'), 'gray', '/products/3gr.png', 1),
  ((SELECT id FROM products WHERE slug = 'quan-jeans-straight-blue'), 'blue', '/products/5bl.png', 0),
  ((SELECT id FROM products WHERE slug = 'mu-bucket-summer-shade'), 'black', '/products/8b.png', 0),
  ((SELECT id FROM products WHERE slug = 'mu-bucket-summer-shade'), 'green', '/products/2gr.png', 1),
  ((SELECT id FROM products WHERE slug = 'set-gym-active-duo'), 'gray', '/products/2g.png', 0),
  ((SELECT id FROM products WHERE slug = 'set-gym-active-duo'), 'purple', '/products/1p.png', 1);

-- =========================================================
-- 4. Blog
-- =========================================================

INSERT INTO blog_posts (
  author_id,
  title,
  slug,
  excerpt,
  content,
  category,
  cover_image,
  status,
  published_at
)
VALUES
  (
    NULL,
    'Phối áo thun dáng rộng cho mọi mùa',
    'phoi-ao-thun-dang-rong-cho-moi-mua',
    'Áo thun dáng rộng không còn chỉ dành cho những lúc ở nhà.',
    '<p>Phom dáng rộng đã trở thành một món đồ chủ đạo, dễ kết hợp trong nhiều phong cách khác nhau.</p><p>Hãy bắt đầu với quần jeans ống đứng, sneaker trắng và thêm áo khoác nhẹ khi thời tiết chuyển mùa.</p>',
    'Cẩm nang phong cách',
    '/products/1g.png',
    'published',
    NOW()
  ),
  (
    NULL,
    'Cách chọn sneaker đi học và đi làm',
    'cach-chon-sneaker-di-hoc-va-di-lam',
    'Một đôi sneaker tốt cần vừa thoải mái vừa đủ gọn để phối đồ.',
    '<p>Ưu tiên đế êm, upper thoáng và màu trung tính. Nếu bạn chỉ chọn một đôi đầu tiên, trắng hoặc đen là lựa chọn an toàn nhất.</p>',
    'Hướng dẫn mua sắm',
    '/products/4w.png',
    'published',
    NOW()
  ),
  (
    NULL,
    'Checklist chăm sóc áo khoác sau mùa mưa',
    'checklist-cham-soc-ao-khoac-sau-mua-mua',
    'Giữ áo khoác bền màu hơn bằng vài bước vệ sinh đơn giản.',
    '<p>Phơi nơi thoáng, tránh nắng gắt, kéo khóa trước khi giặt và dùng túi giặt nếu áo có lớp phủ chống thấm nhẹ.</p>',
    'Bảo quản sản phẩm',
    '/products/3b.png',
    'published',
    NOW()
  ),
  (
    NULL,
    'Phụ kiện nhỏ giúp outfit gọn hơn',
    'phu-kien-nho-giup-outfit-gon-hon',
    'Kính, nón, dây nịt và túi có thể làm outfit nhìn chỉn chu hơn rất nhanh.',
    '<p>Chọn phụ kiện theo một bảng màu nhất quán. Đen, trắng, xanh navy và nâu là nhóm màu dễ dùng nhất.</p>',
    'Cẩm nang phong cách',
    '/products/8b.png',
    'published',
    NOW()
  ),
  (
    NULL,
    'Gợi ý vali đồ cho chuyến đi 3 ngày',
    'goi-y-vali-do-cho-chuyen-di-3-ngay',
    'Một capsule wardrobe nhỏ giúp bạn mang ít đồ hơn mà vẫn có nhiều outfit.',
    '<p>Chuẩn bị hai áo thun, một áo khoác nhẹ, một quần jeans, một jogger, một đôi sneaker và vài phụ kiện nhỏ.</p>',
    'Du lịch',
    '/products/5bl.png',
    'draft',
    NULL
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  excerpt = VALUES(excerpt),
  content = VALUES(content),
  category = VALUES(category),
  cover_image = VALUES(cover_image),
  status = VALUES(status),
  published_at = VALUES(published_at);

-- =========================================================
-- 5. Newsletter
-- =========================================================

INSERT INTO newsletter_subscribers (email, status)
VALUES
  ('minh.anh@example.com', 'active'),
  ('quoc.huy@example.com', 'active'),
  ('bao.ngoc@example.com', 'active'),
  ('thanh.dat@example.com', 'unsubscribed')
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- =========================================================
-- 6. Tin nhan lien he
-- =========================================================

DELETE FROM contact_messages
WHERE email IN (
  'minh.anh@example.com',
  'quoc.huy@example.com',
  'bao.ngoc@example.com',
  'thanh.dat@example.com'
);

INSERT INTO contact_messages (
  name,
  email,
  subject,
  message,
  status
)
VALUES
  (
    'Minh Anh',
    'minh.anh@example.com',
    'Hỏi về size áo thun',
    'Mình cao 1m62 nặng 52kg thì áo CoreFit nên chọn size nào?',
    'new'
  ),
  (
    'Quốc Huy',
    'quoc.huy@example.com',
    'Đổi màu sản phẩm',
    'Mình đặt sneaker màu trắng nhưng muốn đổi sang màu đen trước khi giao.',
    'read'
  ),
  (
    'Bảo Ngọc',
    'bao.ngoc@example.com',
    'Tư vấn phối đồ',
    'Shop có thể gợi ý outfit đi Đà Lạt 3 ngày không?',
    'resolved'
  ),
  (
    'Thanh Đạt',
    'thanh.dat@example.com',
    'Kiểm tra tồn kho',
    'Balo Urban Compact màu navy còn hàng không shop?',
    'new'
  );

COMMIT;
