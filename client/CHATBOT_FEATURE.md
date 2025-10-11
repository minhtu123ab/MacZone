# 🤖 Chatbot AI Feature - Frontend Implementation

## ✅ Đã hoàn thành

### 📦 Files đã tạo (6 files):

1. **`src/services/api.js`** (Updated)

   - Thêm `chatbotAPI` với 6 API endpoints

2. **`src/store/useChatbotStore.js`** (New)

   - Zustand store quản lý state chatbot
   - Xử lý luồng chat từ greeting → recommendations

3. **`src/components/common/FloatingChatButton/`** (New)

   - FloatingChatButton.jsx
   - index.js
   - Floating button màu tím ở góc trái dưới

4. **`src/components/features/chatbot/ChatbotDrawer/`** (New)

   - ChatbotDrawer.jsx
   - index.js
   - Drawer chat với UI đẹp, hiển thị messages, categories, price ranges, recommendations

5. **`src/App.jsx`** (Updated)
   - Import FloatingChatButton và ChatbotDrawer
   - Thêm vào layout

## 🎯 Tính năng

### Luồng chat hoàn chỉnh:

```
1. User click FloatingChatButton (góc trái dưới)
   ↓
2. ChatbotDrawer mở → Gọi API /chatbot/start
   → Bot: "Xin chào! Bạn muốn tìm loại sản phẩm nào?"
   → Hiển thị: List categories (iPhone, MacBook, iPad...)
   ↓
3. User chọn category
   → Gọi API /chatbot/price-ranges
   → Bot: "Bạn muốn chọn khoảng giá nào?"
   → Hiển thị: 5 price ranges
   ↓
4. User chọn price range
   → Gọi API /chatbot/story-request
   → Bot: "Hãy mô tả nhu cầu sử dụng của bạn..."
   → Hiển thị: TextArea để nhập
   ↓
5. User nhập mô tả (ít nhất 10 ký tự) và gửi
   → Gọi API /chatbot/recommend
   → Bot: Loading... → Hiển thị 3 sản phẩm phù hợp
   → Mỗi sản phẩm có:
     • Rank (Top 1, 2, 3)
     • Hình ảnh, tên, giá
     • Lý do tại sao phù hợp (từ Gemini AI)
     • Button: "Thêm vào giỏ", "Xem chi tiết"
   ↓
6. User có thể:
   - Thêm sản phẩm vào giỏ hàng
   - Xem chi tiết sản phẩm
   - Bắt đầu tìm kiếm mới
```

## 🎨 UI/UX

### FloatingChatButton:

- **Vị trí**: Góc trái dưới (đối xứng với FloatingCartButton)
- **Màu sắc**: Gradient purple (khác biệt với cart button màu blue)
- **Icon**: MessageOutlined + AI indicator dot màu xanh
- **Tooltip**: "🤖 Chat với AI Assistant"
- **Animation**: Hover scale, pulse, shine effect

### ChatbotDrawer:

- **Width**: 480px
- **Header**: Logo AI + "AI Shopping Assistant" + "Powered by Gemini AI"
- **Body**:
  - Messages area với scroll
  - Bot messages: Màu xám, avatar robot
  - User messages: Gradient blue, avatar user
  - Categories/Price ranges: Buttons grid
  - Recommendations: Cards với rank badge
- **Footer**: TextArea + Send button (khi ở bước nhập story)

## 🔄 State Management (Zustand)

### useChatbotStore:

```javascript
{
  // UI State
  drawerVisible: boolean,
  loading: boolean,
  currentStep: 'greeting' | 'category' | 'priceRange' | 'story' | 'recommendations',

  // Data
  greeting: string,
  categories: [],
  selectedCategory: null,
  priceRanges: [],
  selectedPriceRange: null,
  storyPrompt: string,
  userStory: string,
  recommendations: [],
  messages: [], // Chat history

  // Actions
  setDrawerVisible(visible),
  startChat(),
  selectCategory(category),
  selectPriceRange(priceRange),
  submitStory(story),
  resetChat(),
  startNewChat(),
}
```

## 📡 API Integration

### chatbotAPI:

```javascript
{
  start: () => POST /api/chatbot/start,
  getPriceRanges: (categoryId) => GET /api/chatbot/price-ranges?categoryId=...,
  getStoryRequest: (data) => POST /api/chatbot/story-request,
  getRecommendations: (data) => POST /api/chatbot/recommend,
  getHistory: (params) => GET /api/chatbot/history,
  getHistoryDetail: (id) => GET /api/chatbot/history/:id,
}
```

## 🚀 Cách sử dụng

### 1. Đảm bảo server đã chạy:

```bash
cd server
npm run dev
```

### 2. Đảm bảo có GEMINI_API_KEY trong server/.env:

```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Chạy client:

```bash
cd client
npm run dev
```

### 4. Test:

1. Đăng nhập vào website
2. Click vào FloatingChatButton (nút tím góc trái dưới)
3. Follow luồng chat
4. Thử thêm sản phẩm vào giỏ từ recommendations

## ✨ Features nổi bật

### 1. **Tích hợp Gemini AI**

- Sử dụng Gemini 2.0 Flash model
- Phân tích nhu cầu người dùng thông minh
- Đề xuất sản phẩm với lý do cụ thể bằng tiếng Việt

### 2. **UX mượt mà**

- Auto scroll to bottom khi có message mới
- Loading states rõ ràng
- Smooth animations
- Responsive design

### 3. **Smart flow**

- Step-by-step guided conversation
- Validation input (story ≥ 10 chars)
- Error handling graceful
- Có thể start new chat bất cứ lúc nào

### 4. **Integration với Cart**

- Thêm sản phẩm vào giỏ ngay từ chatbot
- Navigate to product detail page
- Seamless experience

### 5. **Authentication aware**

- Chỉ hiện FloatingChatButton khi đã đăng nhập
- Redirect to login nếu chưa đăng nhập
- Token tự động attach vào API calls

## 🎯 Next Steps (Optional)

1. **Thêm chat history**: Hiển thị lịch sử chat cũ
2. **Voice input**: Thêm khả năng nhập bằng giọng nói
3. **Multi-language**: Hỗ trợ nhiều ngôn ngữ
4. **Favorites**: Lưu sản phẩm yêu thích từ recommendations
5. **Share recommendations**: Chia sẻ kết quả với bạn bè
6. **Rating**: Đánh giá độ chính xác của recommendations

## 🐛 Known Issues & Limitations

1. **API Rate limiting**: Gemini free tier có giới hạn 15 requests/minute
2. **Large product list**: Nếu có quá nhiều sản phẩm trong range, có thể slow
3. **No persistence**: Chat history mất khi close drawer (có thể thêm later)

## 📚 Dependencies

Không cần cài thêm dependencies nào! Sử dụng các package có sẵn:

- `zustand` - State management
- `antd` - UI components
- `axios` - API calls
- `react-router-dom` - Navigation

## 🎉 Done!

Chatbot AI đã sẵn sàng sử dụng! Thử ngay nhé! 🚀

### Demo Flow:

1. Login → Click nút tím góc trái dưới
2. Chọn "iPhone"
3. Chọn "10 - 20 triệu"
4. Nhập: "Tôi là sinh viên, cần iPhone để học tập, chụp ảnh đẹp và pin trâu"
5. Nhận 3 iPhone phù hợp nhất với lý do cụ thể!
