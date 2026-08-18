# TRENDLAMA — Backend (PHP + MySQL)

REST API phục vụ cho 2 app frontend Next.js (`frontend/client` và `frontend/admin`). Viết bằng PHP thuần (không framework), PDO + MySQL, JWT tự viết (không cần Composer) — chạy được ngay trên XAMPP/MAMP hoặc PHP built-in server.

Toàn bộ API trong dự án này đã được **cài đặt và test thật** (PHP 8.3 + MySQL 8) trước khi bàn giao — không chỉ viết code suông.

## 1. Yêu cầu

- PHP >= 8.1 (khuyến khích XAMPP nếu bạn dùng Windows)
- MySQL >= 5.7 / MariaDB
- Không cần Composer, không cần cài thêm package nào

## 2. Cài đặt

### Bước 1 — Tạo database

Mở phpMyAdmin (hoặc `mysql` CLI) và chạy lần lượt 2 file:

```
database/schema.sql   -- tạo database + toàn bộ bảng
database/seed.sql     -- (tuỳ chọn) thêm dữ liệu mẫu để test ngay
```

### Bước 2 — Cấu hình `.env`

```bash
cp .env.example .env
```

Sửa lại theo thông tin MySQL của bạn:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=trendlama
DB_USER=root
DB_PASS=
JWT_SECRET=doi-chuoi-nay-thanh-gi-do-ngau-nhien
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
APP_DEBUG=true
```

> ⚠️ Không nên dùng user `root` cho ứng dụng thật — nên tạo 1 user MySQL riêng chỉ có quyền trên database `trendlama`.

### Bước 3 — Chạy server

**Cách 1 — dùng PHP built-in server (nhanh nhất để test):**

```bash
php -S localhost:8000 index.php
```

**Cách 2 — dùng XAMPP/Apache:**

Copy cả thư mục `backend/` vào `htdocs/`, đảm bảo `.htaccess` được Apache đọc (bật `mod_rewrite` + `AllowOverride All`), rồi truy cập `http://localhost/backend/api/products`.

### Bước 4 — Test thử

```bash
curl http://localhost:8000/api/products
```

Nếu trả về JSON danh sách sản phẩm là đã chạy đúng.

## 3. Tài khoản mẫu (từ `seed.sql`)

| Vai trò  | Email                    | Mật khẩu      |
|----------|---------------------------|----------------|
| Admin    | admin@trendlama.com       | Admin@123      |
| Customer | customer@trendlama.com    | Customer@123   |

## 4. Danh sách API

Base URL: `http://localhost:8000/api` (hoặc `http://localhost/backend/api` nếu dùng Apache)

Header xác thực (cho các route cần đăng nhập): `Authorization: Bearer <token>` (token nhận được từ `/auth/login`)

### Auth
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký tài khoản customer |
| POST | `/auth/login` | Public | Đăng nhập, trả về `{ user, token }` |
| GET | `/auth/me` | Đã đăng nhập | Lấy thông tin user hiện tại |
| PUT | `/auth/profile` | Đã đăng nhập | Cập nhật hồ sơ (name/phone/address) |

> **Đăng xuất:** vì dùng JWT (stateless), "logout" chỉ đơn giản là frontend xoá token đã lưu (localStorage/cookie) — không cần gọi API.

### Products
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/products?page=1&limit=12&category=t-shirts&sort=asc&search=...` | Public | Danh sách, có phân trang + lọc + sort |
| GET | `/products/{id_or_slug}` | Public | Chi tiết 1 sản phẩm |
| POST | `/products` | Admin | Tạo sản phẩm |
| PUT | `/products/{id}` | Admin | Sửa sản phẩm |
| DELETE | `/products/{id}` | Admin | Xoá sản phẩm |

`sort` nhận: `newest` (mặc định) / `oldest` / `asc` (giá tăng) / `desc` (giá giảm) — khớp với UI Filter đã làm ở frontend.

### Categories
| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/categories` | Public |
| GET | `/categories/{id_or_slug}` | Public |
| POST | `/categories` | Admin |
| PUT | `/categories/{id}` | Admin |
| DELETE | `/categories/{id}` | Admin |

### Users (quản trị)
| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/users?page=1&limit=20` | Admin |
| GET | `/users/{id}` | Admin, hoặc chính chủ |
| POST | `/users` | Admin |
| PUT | `/users/{id}` | Admin, hoặc chính chủ (đổi role/status chỉ admin được) |
| DELETE | `/users/{id}` | Admin |

### Orders
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/orders?page=1` | Đã đăng nhập | Admin thấy tất cả, customer chỉ thấy đơn của mình |
| GET | `/orders/{id}` | Đã đăng nhập | Chỉ chủ đơn hoặc admin |
| POST | `/orders` | Public (guest checkout OK) | Tạo đơn hàng từ giỏ hàng |
| PUT | `/orders/{id}` | Admin | Đổi trạng thái đơn (`pending/processing/success/failed/cancelled`) |
| DELETE | `/orders/{id}` | Admin | Xoá đơn |

Body mẫu cho `POST /orders`:
```json
{
  "items": [
    { "id": 1, "name": "Adidas CoreFit T-Shirt", "price": 59.9, "quantity": 2, "selectedSize": "m", "selectedColor": "gray" }
  ],
  "shipping": { "name": "...", "email": "...", "phone": "...", "address": "..." },
  "payment_method": "card"
}
```

### Blog
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/blog?page=1` | Public | Chỉ bài `published` |
| GET | `/blog-admin` | Admin | Toàn bộ bài (kể cả draft) |
| GET | `/blog/{id_or_slug}` | Public | Chi tiết bài viết |
| POST | `/blog` | Admin | Tạo bài (field `content` nhận HTML từ rich text editor) |
| PUT | `/blog/{id}` | Admin | Sửa bài |
| DELETE | `/blog/{id}` | Admin | Xoá bài |

### Wishlist
| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/wishlist` | Đã đăng nhập |
| POST | `/wishlist` `{ "product_id": 1 }` | Đã đăng nhập |
| DELETE | `/wishlist/{product_id}` | Đã đăng nhập |

### Upload ảnh
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/upload?type=products\|blog\|avatars` | Admin | Upload **nhiều ảnh cùng lúc** |

Gửi dạng `multipart/form-data`, field `images[]` (nhiều file), tuỳ chọn `colors[]` để gắn màu tương ứng cho từng ảnh (dùng khi thêm sản phẩm nhiều màu). Trả về mảng `{ filename, path, color }`. Giới hạn 5MB/file, chỉ nhận JPEG/PNG/WEBP/GIF.

## 5. Kết nối vào frontend Next.js

Trong `frontend/client` và `frontend/admin`, tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Rồi gọi API bằng `fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)`. Hiện tại 2 app frontend đang dùng **dữ liệu mẫu tĩnh** (hardcode trong code) — cần thay các đoạn dữ liệu tĩnh đó bằng `fetch` gọi API thật. Đây sẽ là bước tiếp theo.

## 6. Cấu trúc thư mục

```
backend/
├── config/
│   ├── database.php      # kết nối PDO + đọc .env
│   └── cors.php          # cấu hình CORS cho phép frontend gọi
├── core/
│   ├── Router.php        # router tự viết, khớp method + path
│   ├── Request.php       # đọc JSON body / query / Bearer token
│   ├── Response.php      # chuẩn hoá JSON trả về
│   └── JWT.php           # JWT tự viết (HS256), không cần Composer
├── middleware/
│   └── AuthMiddleware.php  # Auth::requireAuth() / Auth::requireAdmin()
├── controllers/
│   ├── AuthController.php
│   ├── ProductController.php
│   ├── CategoryController.php
│   ├── UserController.php
│   ├── OrderController.php
│   ├── BlogController.php
│   ├── WishlistController.php
│   └── UploadController.php
├── routes/api.php        # khai báo toàn bộ route
├── database/
│   ├── schema.sql
│   └── seed.sql
├── uploads/               # ảnh upload lưu ở đây (products/blog/avatars)
├── index.php              # front controller — điểm vào duy nhất
└── .htaccess               # rewrite rule cho Apache
```

## 7. Bảo mật đã áp dụng

- Mật khẩu hash bằng `password_hash` (bcrypt), không lưu plain text
- Toàn bộ query dùng PDO prepared statements — chống SQL injection
- JWT ký bằng HMAC-SHA256, hết hạn sau 7 ngày
- Phân quyền theo role (`admin` / `customer`) ở tầng middleware, không tin dữ liệu từ client
- Validate input ở mọi endpoint ghi dữ liệu (register, tạo/sửa sản phẩm, đơn hàng...)
- Giới hạn loại file + dung lượng khi upload ảnh

## 8. Việc còn lại (gợi ý bước tiếp theo)

- [ ] Nối API thật vào 2 frontend (thay dữ liệu tĩnh bằng `fetch`)
- [ ] Thêm rich text editor (TipTap/Quill) ở form thêm/sửa Blog trên admin — field `content` đã sẵn sàng nhận HTML
- [ ] Refresh token / thu hồi token nếu cần bảo mật cao hơn
- [ ] Gửi email xác nhận đơn hàng (chưa làm — cần cấu hình SMTP)
