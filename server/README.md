# Express Server - Graduation Project

Đây là server Express.js cho đồ án tốt nghiệp với đầy đủ chức năng authentication, authorization và quản lý người dùng.

## Tính năng

- ✅ Express.js server với cấu trúc MVC
- ✅ MongoDB với Mongoose ODM
- ✅ Authentication với JWT
- ✅ Password hashing với bcryptjs
- ✅ Validation với express-validator
- ✅ Security headers với Helmet
- ✅ CORS configuration
- ✅ Request logging với Morgan
- ✅ Response compression
- ✅ Environment variables với dotenv
- ✅ Hot reload với Nodemon

## Cấu trúc thư mục

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── validator.middleware.js
│   ├── models/          # Database models
│   │   └── User.model.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   └── index.js         # Entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa file `.env` với thông tin của bạn:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/your_database_name
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### 3. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn.

### 4. Chạy server

**Development mode (với hot reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

### 5. Truy cập Swagger Documentation

Mở trình duyệt và truy cập:

```
http://localhost:5000/api-docs
```

Swagger UI cung cấp:

- 📚 Documentation đầy đủ cho tất cả API endpoints
- 🧪 Test API trực tiếp trên trình duyệt
- 🔐 Authentication với JWT token
- 📋 Request/Response examples

**Xem chi tiết:** [SWAGGER_GUIDE.md](./SWAGGER_GUIDE.md)

## API Endpoints

### Authentication Routes

| Method | Endpoint             | Description                 | Access  |
| ------ | -------------------- | --------------------------- | ------- |
| POST   | `/api/auth/register` | Đăng ký user mới            | Public  |
| POST   | `/api/auth/login`    | Đăng nhập                   | Public  |
| GET    | `/api/auth/me`       | Lấy thông tin user hiện tại | Private |

### User Routes

| Method | Endpoint         | Description                | Access        |
| ------ | ---------------- | -------------------------- | ------------- |
| GET    | `/api/users`     | Lấy tất cả users           | Private/Admin |
| GET    | `/api/users/:id` | Lấy thông tin user theo ID | Private       |
| PUT    | `/api/users/:id` | Cập nhật user              | Private       |
| DELETE | `/api/users/:id` | Xóa user                   | Private/Admin |

### Category Routes

| Method | Endpoint              | Description           | Access        |
| ------ | --------------------- | --------------------- | ------------- |
| GET    | `/api/categories`     | Lấy tất cả danh mục   | Public        |
| GET    | `/api/categories/:id` | Lấy chi tiết danh mục | Public        |
| POST   | `/api/categories`     | Tạo danh mục mới      | Private/Admin |
| PUT    | `/api/categories/:id` | Cập nhật danh mục     | Private/Admin |
| DELETE | `/api/categories/:id` | Xóa danh mục          | Private/Admin |

### Product Routes

| Method | Endpoint                     | Description                | Access        |
| ------ | ---------------------------- | -------------------------- | ------------- |
| GET    | `/api/products`              | Lấy danh sách sản phẩm     | Public        |
| GET    | `/api/products/:id`          | Lấy chi tiết sản phẩm      | Public        |
| GET    | `/api/products/category/:id` | Lấy sản phẩm theo danh mục | Public        |
| POST   | `/api/products`              | Tạo sản phẩm mới           | Private/Admin |
| PUT    | `/api/products/:id`          | Cập nhật sản phẩm          | Private/Admin |
| DELETE | `/api/products/:id`          | Xóa sản phẩm               | Private/Admin |

### Product Variant Routes

| Method | Endpoint                            | Description           | Access        |
| ------ | ----------------------------------- | --------------------- | ------------- |
| GET    | `/api/products/:productId/variants` | Lấy biến thể sản phẩm | Public        |
| POST   | `/api/products/:productId/variants` | Tạo biến thể mới      | Private/Admin |
| PUT    | `/api/variants/:id`                 | Cập nhật biến thể     | Private/Admin |
| DELETE | `/api/variants/:id`                 | Xóa biến thể          | Private/Admin |

### Cart Routes (🆕 NEW)

| Method | Endpoint          | Description                       | Access  |
| ------ | ----------------- | --------------------------------- | ------- |
| GET    | `/api/cart`       | Lấy giỏ hàng của user             | Private |
| GET    | `/api/cart/count` | Lấy số lượng items trong giỏ hàng | Private |
| POST   | `/api/cart`       | Thêm sản phẩm vào giỏ hàng        | Private |
| PUT    | `/api/cart/:id`   | Cập nhật số lượng item trong giỏ  | Private |
| DELETE | `/api/cart/:id`   | Xóa item khỏi giỏ hàng            | Private |
| DELETE | `/api/cart`       | Xóa toàn bộ giỏ hàng              | Private |

**📖 Chi tiết Cart API:** [CART_API_DOCUMENTATION.md](./CART_API_DOCUMENTATION.md)

## Request Examples

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

## Dependencies

### Production Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variables
- **cors**: CORS middleware
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-validator**: Input validation
- **morgan**: HTTP request logger
- **helmet**: Security headers
- **compression**: Response compression

### Development Dependencies

- **nodemon**: Auto-restart server on file changes

## Security Features

- ✅ Password hashing với bcrypt
- ✅ JWT authentication
- ✅ Security headers với Helmet
- ✅ Input validation
- ✅ CORS configuration
- ✅ Role-based access control (RBAC)

## Lưu ý

- Thay đổi `JWT_SECRET` trong file `.env` thành một chuỗi bí mật mạnh
- Cấu hình CORS `CLIENT_URL` phù hợp với frontend của bạn
- Trong production, nên sử dụng MongoDB Atlas hoặc database cloud khác
- Đảm bảo `.env` được thêm vào `.gitignore` để bảo mật

## License

ISC
