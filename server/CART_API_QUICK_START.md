# Cart API - Quick Start Guide

Hướng dẫn nhanh để test các Cart APIs vừa được tạo.

## Bước 1: Khởi động Server

```bash
cd server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## Bước 2: Truy cập Swagger Documentation

Mở trình duyệt và truy cập:
```
http://localhost:5000/api-docs
```

Tìm section **"Cart"** trong Swagger UI để test các endpoints.

## Bước 3: Chuẩn bị để Test

### 3.1. Đăng ký/Đăng nhập

Bạn cần có JWT token để sử dụng Cart APIs. 

**Đăng ký user mới:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "test@example.com",
  "password": "123456"
}
```

**Đăng nhập:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response sẽ chứa token:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3.2. Lấy Product ID và Variant ID

Để test Cart, bạn cần product_id và variant_id:

**Lấy danh sách sản phẩm:**
```bash
GET http://localhost:5000/api/products
```

**Lấy chi tiết sản phẩm (có variants):**
```bash
GET http://localhost:5000/api/products/{product_id}
```

Copy `_id` của product và variant từ response.

## Bước 4: Test Cart APIs

### 4.1. Thêm sản phẩm vào giỏ hàng

```bash
POST http://localhost:5000/api/cart
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "product_id": "6763f82db85d74d3d0929ae7",
  "variant_id": "6763f82db85d74d3d0929ae8",
  "quantity": 2
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "_id": "...",
    "product": { ... },
    "variant": { ... },
    "quantity": 2,
    "subtotal": 59980000
  }
}
```

### 4.2. Xem giỏ hàng

```bash
GET http://localhost:5000/api/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cart_id": "...",
    "items": [ ... ],
    "total_items": 2,
    "total_price": 59980000
  }
}
```

### 4.3. Lấy số lượng items trong giỏ (cho cart badge)

```bash
GET http://localhost:5000/api/cart/count
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "count": 2
  }
}
```

### 4.4. Cập nhật số lượng

```bash
PUT http://localhost:5000/api/cart/{cart_item_id}
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quantity": 5
}
```

### 4.5. Xóa 1 item khỏi giỏ

```bash
DELETE http://localhost:5000/api/cart/{cart_item_id}
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4.6. Xóa toàn bộ giỏ hàng

```bash
DELETE http://localhost:5000/api/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

## Bước 5: Test với cURL

### Thêm vào giỏ hàng
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product_id": "6763f82db85d74d3d0929ae7",
    "variant_id": "6763f82db85d74d3d0929ae8",
    "quantity": 1
  }'
```

### Xem giỏ hàng
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Xem số lượng
```bash
curl -X GET http://localhost:5000/api/cart/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Bước 6: Test với Postman

1. **Import Collection:**
   - Tạo collection mới trong Postman
   - Thêm các request như trên

2. **Setup Environment:**
   - Tạo environment variable `base_url` = `http://localhost:5000`
   - Tạo environment variable `token` = `YOUR_JWT_TOKEN`

3. **Sử dụng Variables:**
   - URL: `{{base_url}}/api/cart`
   - Authorization: `Bearer {{token}}`

## Các Test Case Quan Trọng

### ✅ Test Case 1: Thêm sản phẩm mới vào giỏ
- Status: 200
- Cart item được tạo mới
- Quantity = 1 (hoặc giá trị được chỉ định)

### ✅ Test Case 2: Thêm sản phẩm đã có trong giỏ
- Status: 200
- Quantity được cộng thêm (không tạo item mới)

### ✅ Test Case 3: Thêm quá số lượng tồn kho
- Status: 400
- Error message: "Only {stock} items available in stock"

### ✅ Test Case 4: Thêm sản phẩm không tồn tại
- Status: 404
- Error message: "Product not found"

### ✅ Test Case 5: Thêm variant không thuộc product
- Status: 400
- Error message: "Variant does not belong to the specified product"

### ✅ Test Case 6: Update quantity vượt stock
- Status: 400
- Error message: "Only {stock} items available in stock"

### ✅ Test Case 7: Xóa item của user khác
- Status: 403
- Error message: "Not authorized to remove this cart item"

### ✅ Test Case 8: Xem giỏ hàng lần đầu (chưa có cart)
- Status: 200
- Tự động tạo cart mới
- items = []
- total_items = 0
- total_price = 0

## Validation Errors

### Thêm vào giỏ thiếu product_id
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Product ID is required",
      "param": "product_id",
      "location": "body"
    }
  ]
}
```

### Update với quantity không hợp lệ
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Quantity must be at least 1",
      "param": "quantity",
      "location": "body"
    }
  ]
}
```

## Database Verification

### Kiểm tra Cart trong MongoDB

```javascript
// Kết nối MongoDB Compass hoặc mongosh
use your_database_name

// Xem tất cả carts
db.carts.find().pretty()

// Xem cart items
db.cartitems.find().pretty()

// Xem cart của user cụ thể
db.carts.find({ user_id: ObjectId("user_id_here") })

// Xem items của cart
db.cartitems.find({ cart_id: ObjectId("cart_id_here") })
  .populate('product_id')
  .populate('variant_id')
```

## Troubleshooting

### Lỗi: "Not authorized to access this route"
- Kiểm tra token có được gửi trong header không
- Token có đúng format `Bearer TOKEN` không
- Token có hết hạn không (check JWT_EXPIRE trong .env)

### Lỗi: "Product not found"
- Kiểm tra product_id có đúng không
- Product có tồn tại trong database không
- Product có is_active = true không

### Lỗi: "Variant does not belong to the specified product"
- Kiểm tra variant_id có thuộc product_id không
- Xem chi tiết product để lấy đúng variant_id

### Cart không có items
- Kiểm tra product và variant có is_active = true không
- Inactive items sẽ bị tự động loại bỏ khi get cart

## Notes

1. **Auto Cart Creation**: Cart được tạo tự động khi user thêm item lần đầu

2. **Stock Validation**: Mọi thao tác đều check stock để tránh overselling

3. **Duplicate Prevention**: Không thể thêm cùng variant 2 lần, quantity sẽ được cộng dồn

4. **Auto Cleanup**: Items có product/variant inactive sẽ bị xóa tự động khi get cart

5. **Authorization**: Mỗi user chỉ có thể access cart của mình

6. **Price Calculation**: Giá được tính từ variant.price * quantity

## Next Steps

Sau khi test Cart APIs, bạn có thể:

1. ✅ Tích hợp với frontend React
2. ✅ Implement checkout flow
3. ✅ Thêm order management APIs
4. ✅ Thêm payment integration
5. ✅ Implement inventory management

## Support

Nếu gặp vấn đề, check:
1. Server logs trong terminal
2. MongoDB connection
3. Swagger documentation tại `/api-docs`
4. Chi tiết trong [CART_API_DOCUMENTATION.md](./CART_API_DOCUMENTATION.md)

