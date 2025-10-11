# Chatbot API - Quick Start Guide

## 🚀 Cài đặt nhanh

### 1. Cài đặt package

```bash
cd server
npm install @google/generative-ai
```

### 2. Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click "Create API Key"
4. Copy API key

### 3. Cấu hình .env

Thêm vào file `server/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Chạy server

```bash
npm run dev
```

## 📋 Luồng sử dụng API

### Bước 1: Đăng nhập để lấy token

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

→ Lấy `token` từ response

### Bước 2: Bắt đầu chat

```bash
POST /api/chatbot/start
Headers: Authorization: Bearer {token}
```

→ Lấy danh sách `categories`

### Bước 3: Người dùng chọn category

Frontend: Hiển thị danh sách categories cho user chọn
→ Lưu `categoryId`

### Bước 4: Lấy khoảng giá

```bash
GET /api/chatbot/price-ranges?categoryId={categoryId}
Headers: Authorization: Bearer {token}
```

→ Lấy danh sách `priceRanges`

### Bước 5: Người dùng chọn khoảng giá

Frontend: Hiển thị danh sách priceRanges cho user chọn
→ Lưu `priceRangeId`

### Bước 6: Yêu cầu mô tả nhu cầu

```bash
POST /api/chatbot/story-request
Headers: Authorization: Bearer {token}
{
  "categoryId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "priceRangeId": 1
}
```

→ Hiển thị message yêu cầu user nhập mô tả

### Bước 7: Người dùng nhập mô tả và nhận đề xuất

```bash
POST /api/chatbot/recommend
Headers: Authorization: Bearer {token}
{
  "categoryId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "priceRangeId": 1,
  "userStory": "Tôi là sinh viên, cần iPhone để học tập, chụp ảnh đẹp và pin trâu"
}
```

→ Nhận 3 sản phẩm được đề xuất + lý do

## 🧪 Test nhanh với curl

### 1. Đăng nhập

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### 2. Start chat

```bash
curl -X POST http://localhost:5000/api/chatbot/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get price ranges

```bash
curl -X GET "http://localhost:5000/api/chatbot/price-ranges?categoryId=YOUR_CATEGORY_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get recommendations

```bash
curl -X POST http://localhost:5000/api/chatbot/recommend \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "YOUR_CATEGORY_ID",
    "priceRangeId": 1,
    "userStory": "Tôi cần một chiếc MacBook để làm việc với design và video editing"
  }'
```

## 📊 Khoảng giá có sẵn

| ID  | Khoảng giá              | Label         |
| --- | ----------------------- | ------------- |
| 0   | 0 - 10,000,000          | Dưới 10 triệu |
| 1   | 10,000,000 - 20,000,000 | 10 - 20 triệu |
| 2   | 20,000,000 - 30,000,000 | 20 - 30 triệu |
| 3   | 30,000,000 - 50,000,000 | 30 - 50 triệu |
| 4   | 50,000,000+             | Trên 50 triệu |

## 🔍 Swagger UI

Test API dễ dàng hơn với Swagger:

```
http://localhost:5000/api-docs
```

Tìm tag "Chatbot" trong danh sách.

## ⚠️ Lưu ý

1. **Authentication**: Tất cả API đều cần Bearer token
2. **userStory**: Tối thiểu 10 ký tự
3. **Ít sản phẩm**: Nếu có ít hơn 3 sản phẩm trong khoảng giá, API sẽ warning
4. **Token usage**: Mỗi lần recommend sẽ tiêu tốn Gemini tokens (~1000-2000 tokens)
5. **Rate limiting**: Nên implement rate limiting cho API `/recommend`

## 🎯 Flow diagram

```
User clicks chat
    ↓
POST /chatbot/start → Get categories
    ↓
User selects category
    ↓
GET /chatbot/price-ranges → Get price ranges
    ↓
User selects price range
    ↓
POST /chatbot/story-request → Get story prompt
    ↓
User enters description
    ↓
POST /chatbot/recommend → Get 3 products + reasons
    ↓
Display recommendations to user
```

## 💡 Ví dụ User Story tốt

✅ **Tốt:**

- "Tôi là sinh viên IT, cần MacBook để code, chạy Docker và máy ảo. Ngân sách khoảng 30 triệu."
- "Muốn mua iPad để vẽ digital art, xem phim và đọc sách. Cần màn hình lớn và Apple Pencil."
- "Cần iPhone chụp ảnh đẹp, pin trâu cho công việc sales, thường xuyên di chuyển."

❌ **Không tốt:**

- "Tôi muốn mua" (quá ngắn, không rõ nhu cầu)
- "Có gì hay không" (không cụ thể)
- "Mua được không" (không đủ thông tin)

## 🐛 Troubleshooting

### Lỗi "AI analysis failed"

- Kiểm tra GEMINI_API_KEY trong .env
- Kiểm tra kết nối internet
- Kiểm tra quota API key

### Lỗi "No products found"

- Kiểm tra có sản phẩm trong database không
- Kiểm tra category có sản phẩm không
- Thử khoảng giá khác

### Lỗi "Invalid token"

- Token hết hạn, đăng nhập lại
- Kiểm tra header Authorization

## 📚 Tài liệu đầy đủ

Xem file `CHATBOT_API_DOCUMENTATION.md` để biết thêm chi tiết.
