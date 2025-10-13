# MacZone Admin Panel

## Giới thiệu

Admin Panel cho hệ thống MacZone E-Commerce với giao diện hiện đại và đầy đủ tính năng quản lý.

## Tính năng

### 1. Dashboard (Tổng quan)

- Thống kê doanh thu, đơn hàng, người dùng, sản phẩm
- Biểu đồ tăng trưởng doanh thu
- Danh sách đơn hàng gần đây
- Top khách hàng

### 2. User Management (Quản lý người dùng)

- Xem danh sách tất cả người dùng
- Tìm kiếm theo tên, email
- Lọc theo vai trò (user/admin)
- Chỉnh sửa thông tin người dùng
- Thay đổi vai trò người dùng
- Xóa người dùng
- Xem thống kê đơn hàng và tổng chi tiêu của từng user

### 3. Product Management (Quản lý sản phẩm)

- Xem danh sách tất cả sản phẩm
- Thêm sản phẩm mới
- Chỉnh sửa thông tin sản phẩm
- Xóa sản phẩm
- Bật/tắt trạng thái sản phẩm
- Tìm kiếm sản phẩm
- Lọc theo danh mục và trạng thái
- Xem rating và số lượng review

### 4. Category Management (Quản lý danh mục)

- Xem danh sách danh mục
- Thêm danh mục mới
- Chỉnh sửa danh mục
- Xóa danh mục
- Tìm kiếm danh mục

### 5. Order Management (Quản lý đơn hàng)

- Xem tất cả đơn hàng
- Lọc theo trạng thái đơn hàng
- Lọc theo trạng thái thanh toán
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng
- Cập nhật trạng thái thanh toán
- Thêm mã vận đơn (tracking code)
- Xem thông tin khách hàng và sản phẩm

### 6. Review Management (Quản lý đánh giá)

- Xem tất cả đánh giá
- Lọc theo số sao
- Xóa đánh giá vi phạm
- Xem thông tin người đánh giá và sản phẩm

## Công nghệ sử dụng

### Frontend

- **React 18** - Framework chính
- **Ant Design (antd)** - UI Component Library
- **React Router v7** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Backend

- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Express Validator** - Validation

## Cấu trúc thư mục

```
client/src/
├── components/
│   ├── common/
│   │   └── ProtectedRoute/         # Component bảo vệ routes
│   └── layout/
│       └── AdminLayout/             # Layout chính cho admin
├── pages/
│   └── admin/
│       ├── AdminDashboard.jsx       # Trang tổng quan
│       ├── UserManagement.jsx       # Quản lý user
│       ├── ProductManagement.jsx    # Quản lý sản phẩm
│       ├── CategoryManagement.jsx   # Quản lý danh mục
│       ├── OrderManagement.jsx      # Quản lý đơn hàng
│       └── ReviewManagement.jsx     # Quản lý đánh giá
└── services/
    └── api.js                       # API service với adminAPI

server/src/
├── controllers/
│   ├── user.controller.js           # User & stats controllers
│   ├── order.controller.js          # Order & stats controllers
│   └── review.controller.js         # Review controllers
└── routes/
    ├── user.routes.js               # User routes (admin only)
    ├── order.routes.js              # Order routes
    └── review.routes.js             # Review routes
```

## API Endpoints

### User Management

- `GET /api/users/stats` - Lấy thống kê user
- `GET /api/users` - Lấy danh sách user
- `GET /api/users/:id` - Lấy thông tin user
- `PUT /api/users/:id` - Cập nhật user
- `PUT /api/users/:id/role` - Thay đổi role user
- `DELETE /api/users/:id` - Xóa user

### Product Management

- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Category Management

- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Order Management

- `GET /api/orders/admin/stats` - Lấy thống kê đơn hàng
- `GET /api/orders/admin/all` - Lấy tất cả đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái
- `PUT /api/orders/:id/payment` - Cập nhật trạng thái thanh toán
- `PUT /api/orders/:id/tracking` - Cập nhật mã vận đơn

### Review Management

- `GET /api/reviews` - Lấy tất cả đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

## Cách sử dụng

### 1. Đăng nhập với tài khoản Admin

Đảm bảo user có `role: "admin"` trong database.

### 2. Truy cập Admin Panel

Sau khi đăng nhập, truy cập:

```
http://localhost:3000/admin
```

Hoặc click vào "Admin Panel" trong menu user dropdown.

### 3. Điều hướng

Sử dụng sidebar bên trái để điều hướng giữa các trang:

- **Dashboard** - Trang tổng quan
- **Users** - Quản lý người dùng
- **Products** - Quản lý sản phẩm
- **Categories** - Quản lý danh mục
- **Orders** - Quản lý đơn hàng
- **Reviews** - Quản lý đánh giá

## Bảo mật

- Tất cả routes admin được bảo vệ bởi `ProtectedRoute` với `requireAdmin={true}`
- Server-side validation với middleware `authorize("admin")`
- JWT authentication cho mọi request
- Không thể xóa:
  - Tài khoản của chính mình
  - Tài khoản admin khác
  - User có đơn hàng đang xử lý
  - Sản phẩm có variants

## Giao diện

Admin Panel sử dụng Ant Design với:

- **Sidebar navigation** - Điều hướng dễ dàng
- **Dark theme** cho sidebar
- **Responsive design** - Hoạt động tốt trên mọi thiết bị
- **Tables với pagination** - Hiển thị dữ liệu hiệu quả
- **Modal forms** - Thêm/sửa dữ liệu
- **Statistics cards** - Thống kê trực quan
- **Charts & graphs** - Biểu đồ dữ liệu

## Tùy chỉnh

### Thay đổi màu sắc

Chỉnh sửa trong `AdminLayout.jsx`:

```javascript
style={{
  background: "#001529", // Màu nền sidebar
}}
```

### Thêm menu item mới

Thêm vào `menuItems` trong `AdminLayout.jsx`:

```javascript
{
  key: "/admin/new-page",
  icon: <IconComponent />,
  label: "New Page",
}
```

### Thêm trang admin mới

1. Tạo component trong `client/src/pages/admin/`
2. Thêm route trong `App.jsx`
3. Thêm API endpoint trong server
4. Thêm adminAPI function trong `services/api.js`

## Lưu ý

- Admin panel yêu cầu đăng nhập với tài khoản admin
- Dữ liệu được load real-time từ server
- Sử dụng pagination để tối ưu hiệu suất
- Tất cả thao tác đều có confirm dialog để tránh lỗi
- Toast notifications cho mọi action

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:

1. Console log trong browser
2. Network tab để xem API response
3. Server logs
4. User role trong database

## License

MIT
