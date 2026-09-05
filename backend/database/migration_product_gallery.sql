-- =========================================================
-- Roxbusi — Product gallery migration
-- Safe to run against a database created before product_images existed.
-- Existing products and images are not deleted or overwritten.
-- =========================================================

USE rozbux;

CREATE TABLE IF NOT EXISTS product_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  color VARCHAR(50) DEFAULT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- MySQL has no portable ADD INDEX IF NOT EXISTS syntax. Build the ALTER only
-- when the index is absent, so rerunning this migration remains harmless.
SET @gallery_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'product_images'
    AND index_name = 'idx_product_images_product_sort'
);
SET @gallery_index_sql = IF(
  @gallery_index_exists = 0,
  'ALTER TABLE product_images ADD INDEX idx_product_images_product_sort (product_id, sort_order, id)',
  'SELECT 1'
);
PREPARE gallery_index_statement FROM @gallery_index_sql;
EXECUTE gallery_index_statement;
DEALLOCATE PREPARE gallery_index_statement;
