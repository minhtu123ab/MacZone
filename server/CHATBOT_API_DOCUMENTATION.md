# Chatbot API Documentation

## Tổng quan

API Chatbot sử dụng Google Gemini AI để phân tích nhu cầu của người dùng và đề xuất 3 sản phẩm phù hợp nhất dựa trên:

- Loại sản phẩm (Category)
- Khoảng giá mong muốn
- Mô tả nhu cầu của người dùng

## Luồng hoạt động

### 1. Bắt đầu chat (Start Chat)

**Endpoint:** `POST /api/chatbot/start`  
**Authentication:** Required (Bearer Token)

Khởi tạo phiên chat mới, tạo chat room và trả về:

- Lời chào từ chatbot
- Danh sách các loại sản phẩm (categories) để người dùng chọn

**Response:**

```json
{
  "success": true,
  "message": "Chat started successfully",
  "data": {
    "greeting": "Xin chào! 👋\n\nTôi là trợ lý AI của MacZone...",
    "categories": [
      {
        "id": "64f5a1b2c3d4e5f6g7h8i9j0",
        "name": "iPhone",
        "description": "Điện thoại thông minh Apple",
        "image": "https://..."
      },
      {
        "id": "64f5a1b2c3d4e5f6g7h8i9j1",
        "name": "MacBook",
        "description": "Laptop của Apple",
        "image": "https://..."
      }
    ]
  }
}
```

### 2. Lấy danh sách khoảng giá (Get Price Ranges)

**Endpoint:** `GET /api/chatbot/price-ranges?categoryId={categoryId}`  
**Authentication:** Required (Bearer Token)

Sau khi người dùng chọn category, gọi API này để lấy các khoảng giá có sẵn.

**Query Parameters:**

- `categoryId` (required): ID của category đã chọn

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Tuyệt vời! Bạn đã chọn iPhone...",
    "priceRanges": [
      {
        "id": 0,
        "min": 0,
        "max": 10000000,
        "label": "Dưới 10 triệu"
      },
      {
        "id": 1,
        "min": 10000000,
        "max": 20000000,
        "label": "10 - 20 triệu"
      },
      {
        "id": 2,
        "min": 20000000,
        "max": 30000000,
        "label": "20 - 30 triệu"
      },
      {
        "id": 3,
        "min": 30000000,
        "max": 50000000,
        "label": "30 - 50 triệu"
      },
      {
        "id": 4,
        "min": 50000000,
        "max": null,
        "label": "Trên 50 triệu"
      }
    ]
  }
}
```

### 3. Yêu cầu mô tả nhu cầu (Get Story Request)

**Endpoint:** `POST /api/chatbot/story-request`  
**Authentication:** Required (Bearer Token)

Sau khi người dùng chọn khoảng giá, gọi API này để lấy thông điệp yêu cầu người dùng mô tả nhu cầu.

**Request Body:**

```json
{
  "categoryId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "priceRangeId": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Tuyệt vời! Tôi đã hiểu:\n- Loại sản phẩm: iPhone\n- Khoảng giá: 10,000,000₫ - 20,000,000₫\n\nBây giờ, hãy cho tôi biết thêm về nhu cầu sử dụng của bạn nhé!..."
  }
}
```

### 4. Lấy đề xuất sản phẩm (Get Recommendations) - API CHÍNH

**Endpoint:** `POST /api/chatbot/recommend`  
**Authentication:** Required (Bearer Token)

Đây là API chính của chatbot. Sau khi người dùng nhập mô tả nhu cầu, API này sẽ:

1. Lấy danh sách sản phẩm theo category và price range
2. Gửi danh sách sản phẩm + mô tả nhu cầu cho Gemini AI
3. Gemini phân tích và trả về 3 sản phẩm phù hợp nhất + lý do
4. Lưu kết quả vào database (AIMessage và RecommendedProduct)

**Request Body:**

```json
{
  "categoryId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "priceRangeId": 1,
  "userStory": "Tôi là sinh viên, cần iPhone để học tập, chụp ảnh đẹp và pin trâu. Ngân sách khoảng 15 triệu."
}
```

**Validation:**

- `categoryId`: Required, phải là MongoID hợp lệ
- `priceRangeId`: Required, phải là số từ 0-4
- `userStory`: Required, tối thiểu 10 ký tự

**Response:**

```json
{
  "success": true,
  "message": "Recommendations generated successfully",
  "data": {
    "aiMessageId": "64f5a1b2c3d4e5f6g7h8i9j0",
    "categoryName": "iPhone",
    "priceRange": {
      "min": 10000000,
      "max": 20000000,
      "label": "10 - 20 triệu"
    },
    "userStory": "Tôi là sinh viên, cần iPhone để học tập...",
    "recommendations": [
      {
        "rank": 1,
        "product": {
          "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
          "name": "iPhone 13",
          "description": "iPhone 13 với chip A15 Bionic mạnh mẽ",
          "thumbnail_url": "https://...",
          "category_id": {
            "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
            "name": "iPhone"
          },
          "price": 15990000,
          "variantId": "64f5a1b2c3d4e5f6g7h8i9j0",
          "storage": "128GB",
          "color": "Midnight"
        },
        "reason": "iPhone 13 là lựa chọn hoàn hảo cho sinh viên với hiệu năng mạnh mẽ từ chip A15, camera kép chất lượng cao cho những bức ảnh đẹp, và pin đủ dùng cả ngày. Mức giá 15.99 triệu nằm trong ngân sách của bạn."
      },
      {
        "rank": 2,
        "product": {
          "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
          "name": "iPhone 12",
          "description": "iPhone 12 với thiết kế vuông vức sang trọng",
          "thumbnail_url": "https://...",
          "price": 13990000,
          "variantId": "64f5a1b2c3d4e5f6g7h8i9j1",
          "storage": "128GB",
          "color": "Blue"
        },
        "reason": "iPhone 12 vẫn rất mạnh mẽ với chip A14, camera chụp đêm tốt, và giá rẻ hơn iPhone 13 khoảng 2 triệu. Bạn có thể tiết kiệm ngân sách mà vẫn có trải nghiệm tốt."
      },
      {
        "rank": 3,
        "product": {
          "_id": "64f5a1b2c3d4e5f6g7h8i9j2",
          "name": "iPhone 11",
          "description": "iPhone 11 giá rẻ, hiệu năng tốt",
          "thumbnail_url": "https://...",
          "price": 11990000,
          "variantId": "64f5a1b2c3d4e5f6g7h8i9j2",
          "storage": "128GB",
          "color": "White"
        },
        "reason": "Nếu ngân sách eo hẹp, iPhone 11 vẫn đủ dùng cho nhu cầu học tập và giải trí. Camera đủ tốt, pin khỏe, và giá chỉ dưới 12 triệu."
      }
    ],
    "tokensUsed": 1523
  }
}
```

**Các trường hợp lỗi:**

- `404`: Không tìm thấy category
- `404`: Không có sản phẩm nào trong category này
- `404`: Không có sản phẩm nào trong khoảng giá này
- `200` với `success: false`: Có ít hơn 3 sản phẩm trong khoảng giá

### 5. Xem lịch sử chat (Get Chat History)

**Endpoint:** `GET /api/chatbot/history?page=1&limit=10`  
**Authentication:** Required (Bearer Token)

Lấy lịch sử các lần chat (AI messages) của người dùng.

**Query Parameters:**

- `page` (optional): Số trang, mặc định là 1
- `limit` (optional): Số lượng item mỗi trang, mặc định là 10

**Response:**

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "category": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
        "name": "iPhone",
        "description": "Điện thoại thông minh Apple",
        "image": "https://..."
      },
      "priceRange": {
        "min": 10000000,
        "max": 20000000
      },
      "userStory": "Tôi là sinh viên...",
      "recommendations": [
        {
          "rank": 1,
          "product": {
            "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
            "name": "iPhone 13"
          },
          "reason": "iPhone 13 là lựa chọn hoàn hảo..."
        }
      ],
      "tokensUsed": 1523,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 6. Xem chi tiết một lần chat (Get AI Message Detail)

**Endpoint:** `GET /api/chatbot/history/:id`  
**Authentication:** Required (Bearer Token)

Lấy chi tiết một lần chat cụ thể, bao gồm tất cả thông tin về sản phẩm được đề xuất và các variants của chúng.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "category": {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "name": "iPhone",
      "description": "Điện thoại thông minh Apple",
      "image": "https://..."
    },
    "priceRange": {
      "min": 10000000,
      "max": 20000000
    },
    "userStory": "Tôi là sinh viên...",
    "recommendations": [
      {
        "rank": 1,
        "product": {
          "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
          "name": "iPhone 13",
          "description": "...",
          "variants": [
            {
              "_id": "...",
              "storage": "128GB",
              "color": "Midnight",
              "price": 15990000,
              "stock_quantity": 10
            },
            {
              "_id": "...",
              "storage": "256GB",
              "color": "Midnight",
              "price": 18990000,
              "stock_quantity": 5
            }
          ]
        },
        "reason": "iPhone 13 là lựa chọn hoàn hảo..."
      }
    ],
    "tokensUsed": 1523,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 7. Đóng phiên chat (Close Chat Room)

**Endpoint:** `POST /api/chatbot/close/:roomId`  
**Authentication:** Required (Bearer Token)

Đóng một chat room cụ thể.

**Response:**

```json
{
  "success": true,
  "message": "Chat room closed successfully"
}
```

## Cấu trúc Database

### AIMessage Model

Lưu thông tin về một lần phân tích của AI:

- `user_id`: ID người dùng
- `category_id`: ID category đã chọn
- `price_range_min`: Giá tối thiểu
- `price_range_max`: Giá tối đa
- `user_description`: Mô tả nhu cầu của người dùng
- `gemini_token_used`: Số token Gemini đã sử dụng
- `createdAt`, `updatedAt`: Timestamps

### RecommendedProduct Model

Lưu các sản phẩm được đề xuất:

- `ai_message_id`: ID của AIMessage
- `product_id`: ID sản phẩm được đề xuất
- `rank`: Thứ hạng (1, 2, 3)
- `reason`: Lý do tại sao sản phẩm này phù hợp
- `createdAt`, `updatedAt`: Timestamps

### ChatRoom Model

Lưu thông tin về phiên chat:

- `user_id`: ID người dùng
- `admin_id`: ID admin (nếu có)
- `closed_at`: Thời gian đóng chat room
- `createdAt`, `updatedAt`: Timestamps

## Cấu hình

### Environment Variables

Thêm vào file `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng tài khoản Google
3. Tạo API key mới
4. Copy và paste vào file `.env`

## Cài đặt

```bash
# Cài đặt dependencies
cd server
npm install @google/generative-ai

# Cập nhật .env với GEMINI_API_KEY

# Chạy server
npm run dev
```

## Testing với Swagger

Sau khi chạy server, truy cập: `http://localhost:5000/api-docs`

Tất cả các API chatbot đều có tag "Chatbot" trong Swagger UI.

## Lưu ý

- Tất cả API đều yêu cầu authentication (Bearer Token)
- API `/recommend` tiêu tốn Gemini tokens, nên có rate limiting
- Nếu không có đủ 3 sản phẩm trong khoảng giá, API sẽ trả về warning
- Gemini AI sử dụng model `gemini-1.5-flash` (nhanh và cost-effective)
- Lý do đề xuất được viết bằng tiếng Việt tự nhiên
