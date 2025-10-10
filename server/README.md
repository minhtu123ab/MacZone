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
