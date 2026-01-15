# HƯỚNG DẪN CÀI ĐẶT PROJECT ĐỒ ÁN TỐT NGHIỆP

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc project](#cấu-trúc-project)
- [Cài đặt](#cài-đặt)
  - [Phương án 1: Cài đặt thủ công](#phương-án-1-cài-đặt-thủ-công)
  - [Phương án 2: Sử dụng Docker](#phương-án-2-sử-dụng-docker)
- [Cấu hình biến môi trường](#cấu-hình-biến-môi-trường)
- [Seed dữ liệu mẫu](#seed-dữ-liệu-mẫu)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Truy cập ứng dụng](#truy-cập-ứng-dụng)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 🎯 Tổng quan

Đây là ứng dụng web thương mại điện tử bán sản phẩm Apple (MacZone) với đầy đủ tính năng:

**Frontend (Client):**

- React 18 + Vite
- Ant Design + Tailwind CSS
- Socket.IO Client (Real-time chat)
- Zustand (State management)
- React Router v7

**Backend (Server):**

- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (Real-time communication)
- JWT Authentication
- Cloudinary (Upload hình ảnh)
- Groq AI (Chatbot tư vấn sản phẩm)
- Swagger API Documentation

**Tính năng chính:**

- ✅ Quản lý sản phẩm, danh mục, giỏ hàng, đơn hàng
- ✅ Authentication & Authorization (JWT)
- ✅ Upload và quản lý hình ảnh (Cloudinary)
- ✅ Chatbot AI tư vấn sản phẩm (Groq AI)
- ✅ Chat support real-time (Socket.IO)
- ✅ So sánh sản phẩm
- ✅ Đánh giá và review sản phẩm
- ✅ Admin Dashboard

---

## 💻 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

### Cài đặt thủ công:

- **Node.js**: phiên bản 18.x trở lên ([Download](https://nodejs.org/))
- **MongoDB**: phiên bản 6.x trở lên ([Download](https://www.mongodb.com/try/download/community))
  - Hoặc sử dụng MongoDB Atlas (Cloud Database - miễn phí)
- **Git**: để clone repository

### Sử dụng Docker:

- **Docker**: phiên bản 20.x trở lên ([Download](https://www.docker.com/))
- **Docker Compose**: phiên bản 2.x trở lên (thường đi kèm Docker Desktop)

---

## 📁 Cấu trúc project

```
Do_an_tot_nghiep/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services & Socket.IO
│   │   ├── store/          # Zustand stores
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.IO handlers
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker compose configuration
└── INSTALLATION_GUIDE.md   # File này
```

---

## 🚀 Cài đặt

### Phương án 1: Cài đặt thủ công

#### Bước 1: Clone repository

```bash
git clone <repository-url>
cd Do_an_tot_nghiep
```

#### Bước 2: Cài đặt dependencies cho Server

```bash
cd server
npm install
```

#### Bước 3: Cài đặt dependencies cho Client

```bash
cd ../client
npm install
```

#### Bước 4: Cấu hình biến môi trường

##### 4.1. Cấu hình Server

Tạo file `.env` trong thư mục `server/`:

```bash
cd ../server
```

Tạo file `.env` với nội dung sau:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/maczone
# Hoặc sử dụng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/maczone

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this
JWT_EXPIRE=7d

# Client URL (cho CORS)
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration (để upload hình ảnh)
# Đăng ký miễn phí tại: https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI Configuration (cho chatbot)
# Lấy API key miễn phí tại: https://console.groq.com
GROQ_API_KEY=your_groq_api_key

# Email Configuration (optional - cho chức năng gửi email)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=MacZone <noreply@maczone.com>
```

**Lưu ý quan trọng:**

- `JWT_SECRET`: Thay đổi thành chuỗi bí mật của bạn (ít nhất 32 ký tự)
- `MONGODB_URI`: Nếu MongoDB chạy local, giữ nguyên. Nếu dùng MongoDB Atlas, thay bằng connection string của bạn
- `CLOUDINARY_*`: Đăng ký tài khoản tại [Cloudinary](https://cloudinary.com) (miễn phí) để lấy thông tin
- `GROQ_API_KEY`: Đăng ký tại [Groq Console](https://console.groq.com) (miễn phí) để lấy API key

##### 4.2. Cấu hình Client

Tạo file `.env` trong thư mục `client/`:

```bash
cd ../client
```

Tạo file `.env` với nội dung sau:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000

# Socket.IO URL (thường giống Backend URL)
VITE_API_URL=http://localhost:5000

# Frontend Port
VITE_FE_PORT=3000
```

#### Bước 5: Khởi động MongoDB

##### Nếu dùng MongoDB local:

**Windows:**

```bash
# Mở Command Prompt/PowerShell với quyền Admin
mongod
```

**macOS/Linux:**

```bash
# Nếu cài qua brew
brew services start mongodb-community

# Hoặc chạy trực tiếp
mongod --config /usr/local/etc/mongod.conf
```

##### Nếu dùng MongoDB Atlas:

- Không cần khởi động, chỉ cần cấu hình đúng `MONGODB_URI` trong `.env`

#### Bước 6: Seed dữ liệu mẫu (optional nhưng khuyến nghị)

```bash
cd ../server

# Seed categories (danh mục sản phẩm)
npm run seed:categories

# Seed products (sản phẩm mẫu)
npm run seed:products

# Hoặc seed tất cả cùng lúc
npm run seed:all
```

#### Bước 7: Chạy ứng dụng

##### Chạy Server (Terminal 1):

```bash
cd server
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

##### Chạy Client (Terminal 2):

```bash
cd client
npm run dev
```

Client sẽ chạy tại: `http://localhost:3000`

---

### Phương án 2: Sử dụng Docker

Docker giúp bạn chạy ứng dụng nhanh chóng mà không cần cài đặt Node.js hay MongoDB.

#### Bước 1: Clone repository

```bash
git clone <repository-url>
cd Do_an_tot_nghiep
```

#### Bước 2: Cấu hình biến môi trường

Tạo file `.env` cho cả server và client như hướng dẫn ở [Phương án 1 - Bước 4](#bước-4-cấu-hình-biến-môi-trường)

**Lưu ý:** Nếu dùng MongoDB trong Docker, thay `MONGODB_URI` thành:

```env
MONGODB_URI=mongodb://mongo:27017/maczone
```

#### Bước 3: Build và chạy với Docker Compose

```bash
docker-compose up --build
```

Hoặc chạy ở chế độ nền:

```bash
docker-compose up -d
```

#### Bước 4: Kiểm tra containers đang chạy

```bash
docker-compose ps
```

#### Bước 5: Seed dữ liệu (nếu cần)

```bash
# Vào container của server
docker-compose exec server sh

# Chạy seed commands
npm run seed:all

# Thoát container
exit
```

#### Dừng ứng dụng:

```bash
docker-compose down
```

Xóa cả volumes (database):

```bash
docker-compose down -v
```

---

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công:

### Frontend (Client)

- **URL**: http://localhost:3000
- **Tính năng**:
  - Trang chủ
  - Danh sách sản phẩm
  - Chi tiết sản phẩm
  - Giỏ hàng
  - Đăng nhập/Đăng ký
  - Admin Dashboard (sau khi đăng nhập với tài khoản admin)

### Backend (Server)

- **API**: http://localhost:5000/api
- **Swagger Documentation**: http://localhost:5000/api-docs
  - Xem chi tiết tất cả API endpoints
  - Test API trực tiếp trên trình duyệt

### Tài khoản mẫu (sau khi seed)

Bạn có thể tạo tài khoản mới hoặc sử dụng tài khoản admin:

- **Email**: admin@maczone.com (nếu đã tạo trong database)
- **Password**: (mật khẩu bạn đã đặt khi tạo)

> **Lưu ý**: Tài khoản admin cần được tạo thủ công hoặc qua script seed tùy chỉnh

---

## 🔧 Xử lý lỗi thường gặp

### 1. Lỗi kết nối MongoDB

**Lỗi**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Giải pháp**:

- Kiểm tra MongoDB đã chạy chưa: `mongod`
- Kiểm tra `MONGODB_URI` trong file `.env` đúng chưa
- Nếu dùng MongoDB Atlas, kiểm tra:
  - Connection string đúng format
  - IP của bạn đã được whitelist chưa
  - Username/password đúng chưa

### 2. Lỗi port đã được sử dụng

**Lỗi**: `EADDRINUSE: address already in use :::5000`

**Giải pháp**:

**Windows:**

```bash
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay <PID> bằng số PID tìm được)
taskkill /PID <PID> /F
```

**macOS/Linux:**

```bash
# Tìm và kill process
lsof -ti:5000 | xargs kill -9
```

Hoặc đổi port trong file `.env`:

```env
PORT=5001
```

### 3. Lỗi không có biến môi trường

**Lỗi**: `JWT_SECRET is not defined`

**Giải pháp**:

- Đảm bảo file `.env` đã được tạo trong thư mục đúng
- Đảm bảo tất cả biến môi trường bắt buộc đã được khai báo
- Restart server sau khi thay đổi `.env`

### 4. Lỗi CORS

**Lỗi**: `Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS policy`

**Giải pháp**:

- Kiểm tra `CLIENT_URL` trong server `.env` đúng với URL client
- Đảm bảo server đang chạy
- Clear browser cache và reload

### 5. Lỗi Cloudinary upload

**Lỗi**: `Invalid Cloudinary configuration`

**Giải pháp**:

- Đăng ký tài khoản Cloudinary miễn phí
- Copy đúng `cloud_name`, `api_key`, `api_secret` vào `.env`
- Khởi động lại server

### 6. Chatbot không hoạt động

**Lỗi**: `GROQ_API_KEY is not set`

**Giải pháp**:

- Đăng ký API key tại [Groq Console](https://console.groq.com)
- Thêm `GROQ_API_KEY` vào server `.env`
- Restart server

### 7. Lỗi npm install

**Lỗi**: `npm ERR! code ENOENT`

**Giải pháp**:

- Đảm bảo đang ở đúng thư mục (server hoặc client)
- Xóa `node_modules` và `package-lock.json`, chạy lại:

```bash
rm -rf node_modules package-lock.json
npm install
```

### 8. Docker container không start

**Giải pháp**:

```bash
# Xem logs để biết lỗi
docker-compose logs

# Rebuild lại containers
docker-compose down
docker-compose up --build
```

---

## 📝 Ghi chú bổ sung

### Scripts hữu ích

**Server:**

```bash
npm start          # Chạy production mode
npm run dev        # Chạy development mode (hot reload)
npm run seed:all   # Seed dữ liệu mẫu
```

**Client:**

```bash
npm run dev        # Chạy development server
npm run build      # Build production
npm run preview    # Preview production build
```

### Môi trường Production

Khi deploy lên production:

1. Thay đổi `NODE_ENV=production` trong server `.env`
2. Build client: `npm run build`
3. Sử dụng process manager như PM2 cho server
4. Cấu hình reverse proxy (Nginx)
5. Sử dụng HTTPS
6. Bảo mật các biến môi trường

### API Testing

Sử dụng Swagger UI tại `http://localhost:5000/api-docs` để:

- Xem danh sách tất cả API endpoints
- Test API trực tiếp
- Xem request/response schema
- Authorize với JWT token

---

## 🆘 Liên hệ và Hỗ trợ

Nếu gặp vấn đề không nằm trong danh sách trên:

1. Kiểm tra logs trong terminal để xem thông báo lỗi chi tiết
2. Kiểm tra file `.env` đã cấu hình đúng chưa
3. Đảm bảo đã cài đặt đầy đủ dependencies: `npm install`
4. Thử xóa `node_modules` và cài lại
5. Kiểm tra version Node.js: `node --version` (cần >= 18.x)

---

## ✅ Checklist cài đặt

- [ ] Đã cài Node.js >= 18.x
- [ ] Đã cài MongoDB hoặc có MongoDB Atlas connection string
- [ ] Đã clone repository
- [ ] Đã chạy `npm install` cho cả server và client
- [ ] Đã tạo file `.env` cho server với đầy đủ biến môi trường
- [ ] Đã tạo file `.env` cho client
- [ ] Đã khởi động MongoDB
- [ ] Đã seed dữ liệu mẫu
- [ ] Server chạy thành công tại http://localhost:5000
- [ ] Client chạy thành công tại http://localhost:3000
- [ ] Đã test API qua Swagger tại http://localhost:5000/api-docs
- [ ] Frontend kết nối được với Backend

---
