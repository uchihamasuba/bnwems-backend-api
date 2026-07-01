# Backend API - Binh Nguyen Wedding & Event Management System

Dự án Backend API được xây dựng với **Node.js (v22 LTS)**, **Express.js**, **TypeScript**, và **Prisma ORM** (MySQL). Kiến trúc mã nguồn được phân lớp (Layered Architecture) giúp dễ dàng mở rộng và bảo trì.

## Cấu Trúc Mã Nguồn (Folder Tree)

Dưới đây là sơ đồ cây thư mục của dự án và giải thích vai trò của từng thành phần:

```text
backend-api/
├── documents/
│   └── BNWEMS.sql           # File chứa toàn bộ cấu trúc DB và dữ liệu mẫu chuẩn (Mock data).
├── prisma/
│   ├── schema.prisma        # Nơi định nghĩa toàn bộ mô hình dữ liệu (models) cho Prisma.
│   └── seed.ts              # Script tự động đọc file BNWEMS.sql và nạp vào Database.
├── src/
│   ├── app.ts               # File cấu hình Express app, tích hợp middlewares cơ bản và gắn routes.
│   ├── server.ts            # Entry point khởi tạo web server.
│   ├── config/              # Khởi tạo Database (Prisma), Firebase, kiểm tra biến môi trường.
│   ├── controllers/         # Tầng giao tiếp HTTP: Nhận request và trả về response.
│   ├── services/            # Tầng Business Logic: Chứa nghiệp vụ cốt lõi và gọi truy vấn CSDL.
│   ├── routes/              # Tầng định tuyến: URL Endpoints và Middlewares.
│   ├── middlewares/         # Middleware bảo mật, xác thực token (JWT), bắt lỗi (Error Handling).
│   └── validators/          # Các schema kiểm tra đầu vào (sử dụng thư viện Zod).
├── tests/                   # Thư mục chứa các Unit & Integration Tests tự động (Jest).
└── TESTING_PLAN.md          # Kế hoạch và chiến lược kiểm thử.
```

---

## 🚀 Hướng Dẫn Cài Đặt (Tutorial & Setup)

Để chạy dự án trên máy cá nhân, bạn chỉ cần làm theo các bước đơn giản sau.

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản v22 LTS trở lên.
- **MySQL**: Máy chủ MySQL đang chạy (Local, XAMPP, Docker, hoặc dịch vụ Cloud như **Aiven.io**).
- Trình quản lý gói: `npm`.

### 2. Các bước cài đặt chi tiết

**Bước 1: Clone và Cài Đặt Thư Viện**
Mở terminal, di chuyển vào thư mục backend và cài đặt thư viện:
```bash
cd backend-api
npm install
```

**Bước 2: Cấu Hình Biến Môi Trường**
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Mở file `.env` và cập nhật thông số kết nối Database:

**Tùy chọn 1: Dùng MySQL Local (XAMPP, Docker, v.v.)**
```env
PORT=3000
# Thay thế 'root' và 'password' bằng tài khoản MySQL của máy bạn.
DATABASE_URL="mysql://root:password@localhost:3306/bnwems_db"
JWT_SECRET="your_jwt_secret_key_here"
```

**Tùy chọn 2: Dùng Aiven.io MySQL (Cloud)**
Nếu bạn sử dụng Aiven.io, hãy copy "Service URI" trong giao diện Overview của Aiven. Vì Aiven yêu cầu kết nối bảo mật, chuỗi kết nối nên có `?ssl-mode=REQUIRED`:
```env
PORT=3000
# URI mẫu từ Aiven.io:
DATABASE_URL="mysql://avnadmin:your_password@your-project.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED"
JWT_SECRET="your_jwt_secret_key_here"
```

*(Lưu ý: Nếu dùng MySQL Local, công cụ ở bước 3 sẽ tự động tạo bảng và nạp dữ liệu mẫu giúp bạn).*

**Bước 3: Khởi Tạo Database và Nạp Dữ Liệu (Seeding)**

**Trường hợp 1: Sử dụng Aiven.io MySQL (Cloud)**
Do cơ sở dữ liệu online đã được khởi tạo sẵn cấu trúc và dữ liệu cho dự án, bạn **chỉ cần** tạo thư viện Prisma Client:
```bash
npm run prisma:generate
```
> **Mẹo bên lề (Reset Dữ Liệu):** Nếu trong quá trình test bạn muốn xóa sạch dữ liệu hiện tại trên Cloud DB và khôi phục lại dữ liệu mẫu ban đầu (seed), hãy chạy các lệnh sau:
> ```bash
> npx prisma db push --force-reset
> npx prisma db seed
> ```

**Trường hợp 2: Sử dụng MySQL Local**
Nếu dùng DB local, dự án đã tích hợp file `documents/BNWEMS.sql` chứa sẵn toàn bộ cấu trúc bảng và dữ liệu mẫu. Hãy chạy các lệnh sau để tự động áp dụng:
```bash
npm run prisma:generate
npx prisma db push
npx prisma db seed
```
> **Giải thích:**
> - `prisma:generate`: Tạo bộ thư viện client để code Node.js giao tiếp với Database.
> - `db push`: Đồng bộ sơ đồ từ `schema.prisma` sang Database Local.
> - `db seed`: Tự động chèn dữ liệu mẫu vào (bao gồm tài khoản Admin, đơn hàng, v.v.).

---

## 💻 Hướng Dẫn Chạy Ứng Dụng

**Môi trường Phát Triển (Development)**
Chạy lệnh sau để khởi động server (có tính năng tự động tải lại khi sửa code):
```bash
npm run dev
```
> Nếu hiển thị `✅ Firebase Admin SDK initialized` và `[Server] Server is running on port 3000`, tức là ứng dụng đã chạy thành công!

**Xem Database Trực Quan (Prisma Studio)**
Bạn có thể xem và chỉnh sửa trực tiếp dữ liệu trong Database thông qua giao diện Web:
```bash
npm run prisma:studio
```
> Mở trình duyệt và truy cập `http://localhost:5555`.

---

## 🧪 Chạy Kiểm Thử (Automation Testing)

Hệ thống có bộ test suite rất mạnh để đảm bảo tính chính xác của các tính năng. Hiện tại hệ thống có tỷ lệ **bao phủ 100% đối với 14 API Contracts**.

Để chạy kiểm thử tự động, sử dụng:
```bash
npm run test
```
Để xem báo cáo mức độ bao phủ code chi tiết:
```bash
npm run test:coverage
```

## 🔐 Thông Tin Đăng Nhập Mẫu

Sau khi chạy lệnh `seed` thành công, bạn có thể sử dụng các tài khoản sau để đăng nhập trên Swagger hoặc Postman:

| Vai Trò | Số Điện Thoại | Mật Khẩu |
| :--- | :--- | :--- |
| **Admin** | `0987654321` | `password123` |
| **Quản Lý (Manager)** | Tự xem trong bảng `internal_users` | `password123` |
| **Nhân Viên (Staff)** | Tự xem trong bảng `internal_users` | `password123` |
