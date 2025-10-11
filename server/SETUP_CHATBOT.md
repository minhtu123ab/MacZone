# 🎯 HƯỚNG DẪN CÀI ĐẶT CHATBOT GEMINI

## ✅ Những gì đã hoàn thành

### Files đã tạo mới:

1. ✅ `src/controllers/chatbot.controller.js` - Controller xử lý tất cả logic chatbot
2. ✅ `src/routes/chatbot.routes.js` - Routes định nghĩa 7 endpoints
3. ✅ `src/utils/geminiService.js` - Service tích hợp Google Gemini AI
4. ✅ `CHATBOT_README.md` - Tổng quan về hệ thống
5. ✅ `CHATBOT_API_DOCUMENTATION.md` - Tài liệu API đầy đủ
6. ✅ `CHATBOT_API_QUICK_START.md` - Hướng dẫn nhanh với ví dụ
7. ✅ `SETUP_CHATBOT.md` - File này

### Files đã cập nhật:

1. ✅ `src/index.js` - Đã thêm chatbot routes

### Database Models có sẵn (đã được sử dụng):

1. ✅ `AIMessage.model.js` - Lưu thông tin phân tích AI
2. ✅ `RecommendedProduct.model.js` - Lưu sản phẩm được đề xuất
3. ✅ `ChatRoom.model.js` - Lưu phiên chat
4. ✅ `Category.model.js` - Categories sản phẩm
5. ✅ `Product.model.js` - Thông tin sản phẩm
6. ✅ `ProductVariant.model.js` - Biến thể sản phẩm (giá, màu, dung lượng)

## 📋 CÁC BƯỚC CÀI ĐẶT

### Bước 1: Cài đặt package (BẮT BUỘC)

```bash
cd server
npm install @google/generative-ai
```

### Bước 2: Lấy Gemini API Key (BẮT BUỘC)

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Click **"Create API Key"** hoặc **"Get API Key"**
4. Copy API key (dạng: AIzaSy...)

### Bước 3: Cập nhật file .env (BẮT BUỘC)

Mở file `server/.env` và thêm dòng này:

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Lưu ý**: Nếu chưa có file `.env`, copy từ `.env.example`:

```bash
cp .env.example .env
# Sau đó edit file .env và thêm GEMINI_API_KEY
```

### Bước 4: Chạy server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### Bước 5: Kiểm tra API

Truy cập Swagger UI để test:

```
http://localhost:5000/api-docs
```

Tìm tag **"Chatbot"** trong danh sách và test các endpoints.

## 🔍 KIỂM TRA CÀI ĐẶT

### Test 1: Kiểm tra server đang chạy

```bash
curl http://localhost:5000
```

Kết quả mong đợi:

```json
{
  "message": "Welcome to MacZone E-Commerce API",
  "status": "Server is running"
}
```

### Test 2: Đăng nhập (để lấy token)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email","password":"your_password"}'
```

Lưu `token` từ response.

### Test 3: Bắt đầu chat

```bash
curl -X POST http://localhost:5000/api/chatbot/start \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Nếu thành công, bạn sẽ nhận được:

```json
{
  "success": true,
  "message": "Chat started successfully",
  "data": {
    "greeting": "Xin chào! 👋...",
    "categories": [...]
  }
}
```

## 📊 6 ENDPOINTS ĐÃ TẠO

| #   | Method | Endpoint                     | Mô tả                                |
| --- | ------ | ---------------------------- | ------------------------------------ |
| 1   | POST   | `/api/chatbot/start`         | Bắt đầu chat, lấy categories         |
| 2   | GET    | `/api/chatbot/price-ranges`  | Lấy khoảng giá theo category         |
| 3   | POST   | `/api/chatbot/story-request` | Lấy prompt yêu cầu mô tả             |
| 4   | POST   | `/api/chatbot/recommend`     | **API CHÍNH** - Lấy đề xuất sản phẩm |
| 5   | GET    | `/api/chatbot/history`       | Xem lịch sử chat                     |
| 6   | GET    | `/api/chatbot/history/:id`   | Xem chi tiết một lần chat            |

**Lưu ý**: `ChatRoom` model được dùng cho chat với nhân viên support, không dùng trong flow chatbot AI.

## 🔄 LUỒNG HOẠT ĐỘNG CHATBOT

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Chat với AI"                               │
│    → POST /api/chatbot/start                               │
│    → Chatbot: "Xin chào! Bạn muốn tìm loại sản phẩm nào?" │
│    → Show: Categories (iPhone, MacBook, iPad, etc.)        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User chọn category (VD: iPhone)                         │
│    → GET /api/chatbot/price-ranges?categoryId=xxx         │
│    → Chatbot: "Bạn muốn chọn khoảng giá nào?"             │
│    → Show: Price ranges (Dưới 10tr, 10-20tr, etc.)        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User chọn price range (VD: 10-20 triệu)                │
│    → POST /api/chatbot/story-request                       │
│    → Chatbot: "Hãy mô tả nhu cầu sử dụng của bạn..."      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User nhập mô tả (VD: "Tôi là sinh viên, cần iPhone     │
│    để học tập, chụp ảnh đẹp và pin trâu")                 │
│    → POST /api/chatbot/recommend                           │
│    → Server:                                               │
│      • Lấy products theo category + price range            │
│      • Gửi cho Gemini AI phân tích                         │
│      • Gemini trả về 3 sản phẩm phù hợp + lý do           │
│      • Lưu vào AIMessage + RecommendedProduct              │
│    → Return: 3 sản phẩm phù hợp nhất + lý do              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Hiển thị kết quả cho user                               │
│    • Sản phẩm #1: iPhone 13 - "Phù hợp vì..."            │
│    • Sản phẩm #2: iPhone 12 - "Phù hợp vì..."            │
│    • Sản phẩm #3: iPhone 11 - "Phù hợp vì..."            │
└─────────────────────────────────────────────────────────────┘
```

## 💡 VÍ DỤ FLOW HOÀN CHỈNH

### Request 1: Bắt đầu chat

```http
POST /api/chatbot/start
Authorization: Bearer eyJhbGc...
```

### Response 1:

```json
{
  "data": {
    "greeting": "Xin chào! Bạn muốn tìm loại sản phẩm nào?",
    "categories": [
      { "id": "abc123", "name": "iPhone" },
      { "id": "def456", "name": "MacBook" }
    ]
  }
}
```

### Request 2: Lấy price ranges

```http
GET /api/chatbot/price-ranges?categoryId=abc123
Authorization: Bearer eyJhbGc...
```

### Response 2:

```json
{
  "data": {
    "message": "Bạn muốn chọn khoảng giá nào?",
    "priceRanges": [
      { "id": 0, "label": "Dưới 10 triệu" },
      { "id": 1, "label": "10 - 20 triệu" }
    ]
  }
}
```

### Request 3: Lấy recommendations

```http
POST /api/chatbot/recommend
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "categoryId": "abc123",
  "priceRangeId": 1,
  "userStory": "Tôi là sinh viên, cần iPhone để học tập, chụp ảnh đẹp và pin trâu"
}
```

### Response 3:

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "rank": 1,
        "product": {
          "name": "iPhone 13",
          "price": 15990000
        },
        "reason": "iPhone 13 phù hợp với sinh viên vì..."
      },
      {
        "rank": 2,
        "product": {
          "name": "iPhone 12",
          "price": 13990000
        },
        "reason": "iPhone 12 vẫn mạnh mẽ và tiết kiệm hơn..."
      },
      {
        "rank": 3,
        "product": {
          "name": "iPhone 11",
          "price": 11990000
        },
        "reason": "Nếu ngân sách eo hẹp, iPhone 11 vẫn đủ dùng..."
      }
    ],
    "tokensUsed": 1523
  }
}
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Gemini API Key

- ✅ **MIỄN PHÍ** cho mức sử dụng cơ bản
- ⚠️ Có giới hạn quota (requests per minute)
- 💡 Nên implement rate limiting
- 🔐 **Không** commit API key lên Git

### 2. Database Requirements

Trước khi test chatbot, đảm bảo database có:

- ✅ Categories (iPhone, MacBook, iPad, etc.)
- ✅ Products thuộc các categories đó
- ✅ ProductVariants với giá và stock_quantity > 0

Chạy seed nếu chưa có data:

```bash
npm run seed:all
```

### 3. Authentication

Tất cả API đều cần Bearer Token. Phải đăng nhập trước:

```bash
POST /api/auth/login
```

### 4. Minimum Requirements

- userStory phải ≥ 10 ký tự
- Phải có ít nhất 3 sản phẩm trong khoảng giá được chọn
- ProductVariant phải có stock_quantity > 0

## 🐛 TROUBLESHOOTING

### Lỗi: "AI analysis failed"

**Nguyên nhân**: GEMINI_API_KEY không hợp lệ hoặc chưa cấu hình

**Giải pháp**:

1. Kiểm tra file `.env` có GEMINI_API_KEY chưa
2. Kiểm tra API key có đúng không (copy lại từ Google AI Studio)
3. Kiểm tra kết nối internet
4. Restart server sau khi thêm API key

### Lỗi: "No products found"

**Nguyên nhân**: Database không có sản phẩm hoặc không có sản phẩm trong khoảng giá

**Giải pháp**:

1. Chạy seed data: `npm run seed:all`
2. Kiểm tra ProductVariant có giá trong khoảng đã chọn không
3. Thử khoảng giá khác

### Lỗi: "Only X product(s) found"

**Nguyên nhân**: Không đủ 3 sản phẩm trong khoảng giá

**Giải pháp**:

1. Thử khoảng giá khác rộng hơn
2. Thêm sản phẩm vào database
3. Kiểm tra ProductVariant có is_active = true không

### Lỗi: "Cannot find module '@google/generative-ai'"

**Nguyên nhân**: Chưa cài package

**Giải pháp**:

```bash
cd server
npm install @google/generative-ai
```

## 📚 TÀI LIỆU THAM KHẢO

1. **CHATBOT_README.md** - Tổng quan hệ thống
2. **CHATBOT_API_QUICK_START.md** - Hướng dẫn nhanh + ví dụ curl
3. **CHATBOT_API_DOCUMENTATION.md** - Tài liệu API chi tiết đầy đủ
4. **Swagger UI** - http://localhost:5000/api-docs (tag "Chatbot")

## 🎉 HOÀN TẤT!

Sau khi hoàn thành các bước trên, chatbot đã sẵn sàng sử dụng!

### Next Steps:

1. ✅ Test tất cả endpoints trong Swagger UI
2. ✅ Tích hợp với frontend (client)
3. ✅ Implement rate limiting cho `/recommend` endpoint
4. ✅ Monitor token usage để kiểm soát chi phí

### Cần trợ giúp?

- Xem logs server nếu có lỗi
- Đọc file CHATBOT_API_DOCUMENTATION.md
- Test với Swagger UI trước khi code frontend

**Happy coding! 🚀**
