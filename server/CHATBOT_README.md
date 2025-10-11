# 🤖 Chatbot API - Gemini AI Product Recommendation

## Tổng quan

Hệ thống chatbot AI sử dụng Google Gemini để tư vấn và đề xuất sản phẩm Apple phù hợp nhất dựa trên nhu cầu của khách hàng.

## ✨ Tính năng chính

- ✅ Chat với AI chatbot thông minh
- ✅ Phân tích nhu cầu người dùng bằng Gemini AI
- ✅ Đề xuất top 3 sản phẩm phù hợp nhất
- ✅ Giải thích lý do tại sao sản phẩm phù hợp (tiếng Việt)
- ✅ Lọc theo loại sản phẩm (category)
- ✅ Lọc theo khoảng giá
- ✅ Lưu lịch sử chat và recommendations
- ✅ Tích hợp Swagger documentation

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd server
npm install @google/generative-ai
```

### 2. Cấu hình Gemini API Key

1. Lấy API key từ: https://makersuite.google.com/app/apikey
2. Copy file `.env.example` thành `.env`
3. Thêm GEMINI_API_KEY vào file `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Chạy server

```bash
npm run dev
```

## 📋 API Endpoints

| Method | Endpoint                     | Mô tả                        |
| ------ | ---------------------------- | ---------------------------- |
| POST   | `/api/chatbot/start`         | Bắt đầu chat, lấy categories |
| GET    | `/api/chatbot/price-ranges`  | Lấy khoảng giá theo category |
| POST   | `/api/chatbot/story-request` | Lấy prompt yêu cầu mô tả     |
| POST   | `/api/chatbot/recommend`     | Lấy đề xuất sản phẩm (AI)    |
| GET    | `/api/chatbot/history`       | Xem lịch sử chat             |
| GET    | `/api/chatbot/history/:id`   | Xem chi tiết một lần chat    |

## 📖 Tài liệu

- **Quick Start**: `CHATBOT_API_QUICK_START.md` - Hướng dẫn nhanh, ví dụ curl
- **Full Documentation**: `CHATBOT_API_DOCUMENTATION.md` - Tài liệu chi tiết đầy đủ
- **Swagger UI**: `http://localhost:5000/api-docs` - Test API trực tiếp

## 🔄 Luồng hoạt động

1. **User clicks chat** → POST `/chatbot/start`

   - Chatbot chào hỏi
   - Hiển thị danh sách categories

2. **User chọn category** → GET `/chatbot/price-ranges?categoryId=xxx`

   - Hiển thị các khoảng giá

3. **User chọn khoảng giá** → POST `/chatbot/story-request`

   - Hiển thị prompt yêu cầu mô tả nhu cầu

4. **User nhập mô tả** → POST `/chatbot/recommend`

   - Lọc sản phẩm theo category + price range
   - Gửi cho Gemini AI phân tích
   - Trả về 3 sản phẩm phù hợp nhất + lý do
   - Lưu vào database (AIMessage + RecommendedProduct)

5. **Hiển thị kết quả** cho user

## 💾 Database Models

### AIMessage

Lưu thông tin phân tích của AI:

- user_id, category_id
- price_range_min, price_range_max
- user_description (câu mô tả của user)
- gemini_token_used

### RecommendedProduct

Lưu sản phẩm được đề xuất:

- ai_message_id, product_id
- rank (1, 2, 3)
- reason (lý do phù hợp)

### Lưu ý

`ChatRoom` model được dùng cho chat với nhân viên support, không dùng cho chatbot AI. Chatbot AI chỉ lưu vào `AIMessage` và `RecommendedProduct`.

## 🛠️ Files đã tạo

```
server/
├── src/
│   ├── controllers/
│   │   └── chatbot.controller.js       # Controller xử lý logic chatbot
│   ├── routes/
│   │   └── chatbot.routes.js           # Routes định nghĩa endpoints
│   ├── utils/
│   │   └── geminiService.js            # Service tích hợp Gemini AI
│   └── index.js                        # Updated: Thêm chatbot routes
├── CHATBOT_README.md                   # File này
├── CHATBOT_API_QUICK_START.md          # Hướng dẫn nhanh
├── CHATBOT_API_DOCUMENTATION.md        # Tài liệu đầy đủ
└── .env.example                        # Updated: Thêm GEMINI_API_KEY
```

## 🎯 Ví dụ sử dụng

### Request

```bash
POST /api/chatbot/recommend
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "categoryId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "priceRangeId": 1,
  "userStory": "Tôi là sinh viên IT, cần MacBook để code, chạy Docker và máy ảo. Ngân sách khoảng 30 triệu."
}
```

### Response

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "rank": 1,
        "product": {
          "name": "MacBook Air M2",
          "price": 28990000,
          ...
        },
        "reason": "MacBook Air M2 với chip M2 mạnh mẽ rất phù hợp cho sinh viên IT. Chip M2 đủ mạnh để code, chạy Docker và máy ảo nhẹ. Pin trâu, thiết kế gọn nhẹ, giá 28.99 triệu nằm trong ngân sách của bạn."
      },
      ...
    ]
  }
}
```

## 🔐 Authentication

Tất cả API đều yêu cầu Bearer Token. Lấy token từ:

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## 💰 Price Ranges

| ID  | Khoảng giá    |
| --- | ------------- |
| 0   | Dưới 10 triệu |
| 1   | 10 - 20 triệu |
| 2   | 20 - 30 triệu |
| 3   | 30 - 50 triệu |
| 4   | Trên 50 triệu |

## ⚡ Performance

- **Gemini Model**: `gemini-1.5-flash` (nhanh, cost-effective)
- **Token usage**: ~1000-2000 tokens per recommendation
- **Response time**: ~2-5 giây (tùy số lượng sản phẩm)

## ⚠️ Lưu ý

1. Phải có ít nhất 3 sản phẩm trong khoảng giá được chọn
2. userStory phải có tối thiểu 10 ký tự
3. Nên implement rate limiting cho endpoint `/recommend`
4. Gemini API key có quota giới hạn
5. Tất cả messages chatbot đều bằng tiếng Việt

## 🧪 Testing

### Swagger UI

```
http://localhost:5000/api-docs
```

Tìm tag "Chatbot" và test các endpoints.

### Manual Testing

Xem file `CHATBOT_API_QUICK_START.md` để có ví dụ curl commands.

## 📊 Token Usage Tracking

Mỗi lần gọi API `/recommend`, số token Gemini đã sử dụng sẽ được lưu vào:

- `AIMessage.gemini_token_used`
- Trả về trong response: `data.tokensUsed`

## 🐛 Troubleshooting

### "AI analysis failed"

→ Kiểm tra GEMINI_API_KEY trong .env

### "No products found"

→ Kiểm tra database có sản phẩm và ProductVariant không

### "Only X product(s) found"

→ Thử khoảng giá khác hoặc category khác

## 📞 Support

Nếu có vấn đề, kiểm tra:

1. File `.env` có GEMINI_API_KEY chưa
2. Package `@google/generative-ai` đã cài chưa
3. Database có categories và products chưa
4. Server logs để xem lỗi chi tiết

## 🎉 Hoàn thành!

API Chatbot đã sẵn sàng sử dụng. Tham khảo các file documentation để biết thêm chi tiết.

Happy coding! 🚀
