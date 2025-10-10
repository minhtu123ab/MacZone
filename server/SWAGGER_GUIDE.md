# 📚 Hướng dẫn sử dụng Swagger API Documentation

## 🚀 Truy cập Swagger UI

Sau khi chạy server, truy cập:

```
http://localhost:5000/api-docs
```

## 📋 Các tính năng của Swagger

### 1. **Xem tất cả API endpoints**

- Swagger UI hiển thị tất cả endpoints được chia theo tags
- Mỗi endpoint có mô tả chi tiết về request/response

### 2. **Test API trực tiếp**

- Click vào endpoint → Click **"Try it out"**
- Nhập dữ liệu test → Click **"Execute"**
- Xem kết quả ngay lập tức

### 3. **Authentication với JWT**

- Click button **"Authorize"** ở góc trên bên phải
- Nhập token: `Bearer your_jwt_token_here`
- Tất cả requests sau đó sẽ tự động gửi kèm token

## 🔐 Cách test với Swagger:

### Bước 1: Đăng ký user

1. Mở endpoint `POST /api/auth/register`
2. Click **"Try it out"**
3. Nhập:

```json
{
  "email": "test@example.com",
  "password": "123456",
  "full_name": "Test User"
}
```

4. Click **"Execute"**
5. Copy **token** từ response

### Bước 2: Authorize

1. Click button **"Authorize"** (góc trên bên phải)
2. Nhập: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (paste token vừa copy)
3. Click **"Authorize"** → **"Close"**

### Bước 3: Test protected endpoints

Bây giờ bạn có thể test các endpoints cần authentication:

- `GET /api/auth/me` - Xem profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Đổi password

## 📖 Tags (Categories)

### 🔐 Authentication

- Register, Login
- Forgot Password, Reset Password
- Get Profile, Update Profile
- Change Password

### 👥 Users (Admin only)

- Get all users (pagination)
- Get user by ID
- Update user
- Delete user

### 🛍️ Products (Coming soon)

- CRUD operations for products

### 🏷️ Categories (Coming soon)

- CRUD operations for categories

### 🛒 Cart (Coming soon)

- Add to cart, Remove from cart
- View cart, Clear cart

### 📦 Orders (Coming soon)

- Create order, View orders
- Update order status

## 💡 Tips

### 1. **Schema Models**

- Click vào "Schemas" ở cuối trang
- Xem cấu trúc của các models (User, Product, Order, etc.)

### 2. **Export Swagger JSON**

```
http://localhost:5000/api-docs.json
```

- Có thể import vào Postman
- Hoặc dùng cho testing tools khác

### 3. **Customize Swagger UI**

File cấu hình: `server/src/config/swagger.js`

- Có thể thêm/sửa thông tin API
- Thêm schemas mới
- Thêm security schemes

## 🔧 Cài đặt

Các package cần thiết (đã được cài):

```bash
npm install swagger-jsdoc swagger-ui-express
```

## 📝 Thêm documentation cho endpoints mới

Ví dụ thêm doc cho 1 endpoint:

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", getProducts);
```

## 🎨 Screenshots

### Swagger UI Homepage

![Swagger UI](https://swagger.io/swagger/media/Images/tools/opensource/swagger_ui.png)

### Try it out

1. Click "Try it out"
2. Modify request body
3. Click "Execute"
4. See response

## ⚠️ Lưu ý

1. **Development only**: Trong production nên bảo mật Swagger UI
2. **API Key**: Có thể thêm API key authentication nếu cần
3. **Rate limiting**: Nên thêm rate limiting cho production
4. **HTTPS**: Trong production, chỉ dùng HTTPS

## 🔗 Links hữu ích

- [Swagger Official Docs](https://swagger.io/docs/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc GitHub](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express GitHub](https://github.com/scottie1984/swagger-ui-express)

---

**Happy API Testing! 🎉**
