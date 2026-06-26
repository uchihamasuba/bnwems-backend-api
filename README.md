# Backend API - Binh Nguyen Wedding & Event Management System

Dự án Backend API được xây dựng với **Node.js (v22 LTS)**, **Express.js**, **TypeScript**, và **Prisma ORM** (MySQL). Kiến trúc mã nguồn được phân lớp (Layered Architecture) giúp dễ dàng mở rộng và bảo trì.

## Cấu Trúc Mã Nguồn (Folder Tree)

Dưới đây là sơ đồ cây thư mục của dự án và giải thích vai trò của từng thành phần:

```text
backend-api/
├── prisma/
│   ├── schema.prisma        # Nơi định nghĩa toàn bộ mô hình dữ liệu (models) và các mối quan hệ (relations) cho CSDL.
│   └── seed.ts              # Script dùng để chèn dữ liệu mẫu (Seeding) vào CSDL.
├── src/
│   ├── app.ts               # File cấu hình Express app, tích hợp middlewares cơ bản và gắn các routes chính.
│   ├── server.ts            # Entry point của ứng dụng; khởi tạo và chạy web server trên port được chỉ định.
│   ├── config/
│   │   ├── database.ts      # Khởi tạo instance PrismaClient singleton để sử dụng lại xuyên suốt dự án.
│   │   └── env.ts           # File khai báo, parse và kiểm tra tính hợp lệ của các biến môi trường (Environment Variables).
│   ├── controllers/         # Tầng giao tiếp HTTP: Nhận request, gọi service xử lý, và trả về response chuẩn.
│   ├── services/            # Tầng Business Logic: Nơi chứa toàn bộ nghiệp vụ cốt lõi và gọi truy vấn CSDL qua Prisma.
│   ├── routes/              # Tầng định tuyến: Định nghĩa URL Endpoints, method và chèn Middlewares tương ứng.
│   │   └── index.ts         # Router trung tâm gộp tất cả các sub-routers con.
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # Middleware kiểm tra Token hợp lệ (JWT) và xác thực quyền Role (RBAC).
│   │   ├── error.middleware.ts      # Middleware bắt lỗi Global và xử lý khi route không tồn tại (404).
│   │   └── validate.middleware.ts   # Middleware chặn bắt đầu vào (body/query) nếu sai định dạng trước khi vào controller.
│   ├── validators/          # Các schema kiểm tra đầu vào (sử dụng Zod)
│   └── utils/
│       └── response.ts      # Các Utility Functions dùng để chuẩn hóa format response (success/error envelope).
├── tests/                   # Thư mục chứa các file Test Case tự động bằng Jest (Unit Test, Integration Test).
└── TESTING_PLAN.md          # Bản kế hoạch và chiến lược kiểm thử tự động.
```

---

## 🚀 Hướng Dẫn Cài Đặt Và Chạy (Installation & Setup)

### 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản v22 LTS trở lên.
- **MySQL**: Máy chủ MySQL (Local, XAMPP, hoặc Docker).
- **Trình quản lý gói**: `npm` (được khuyến nghị).

### 2. Các bước cài đặt chi tiết

**Bước 1:** Clone mã nguồn và cài đặt các thư viện phụ thuộc:
```bash
# Trỏ vào thư mục backend
cd backend-api

# Cài đặt tất cả dependencies
npm install
```

**Bước 2:** Cấu hình biến môi trường:
Copy file `.env.example` thành file `.env` ở thư mục gốc của `backend-api` và thiết lập các thông số cơ bản.
```bash
cp .env.example .env
```
Mở file `.env` và chỉnh sửa các thông số. Nội dung file cơ bản nên bao gồm:
```env
PORT=3000
# Sửa lại user, password và database name của bạn
DATABASE_URL="mysql://root:password@localhost:3306/bnwems_db"
JWT_SECRET="your_jwt_secret_key_here"
```

**Bước 3:** Khởi tạo cơ sở dữ liệu với Prisma:
Để tạo cấu trúc bảng trong MySQL dựa theo file `schema.prisma`:
```bash
# Chạy migration để đồng bộ database và cập nhật Prisma Client
npx prisma migrate dev
```

**Bước 4:** Nạp dữ liệu mẫu (Seeding)
Hệ thống đi kèm dữ liệu mẫu để bạn có thể test ứng dụng ngay lập tức (bao gồm 1 Admin user, 3 roles, các báo giá mẫu, v.v.):
```bash
npm run prisma:generate
npx prisma db seed
```
> **Lưu ý:** Tài khoản đăng nhập mặc định (đã seed) có thể xem trong file `prisma/seed.ts` (ví dụ số điện thoại `0987654321`, mật khẩu `password123`).

---

## 💻 Chạy Ứng Dụng

### Môi trường phát triển (Development)
Khởi động server với tính năng auto-reload (sử dụng `ts-node`):
```bash
npm run dev
```
> **Dấu hiệu thành công:** Terminal sẽ hiển thị: `[Server] Server is running on port 3000`

### Môi trường sản xuất (Production)
Build mã nguồn TypeScript sang JavaScript thuần và chạy:
```bash
# Xóa build cũ (nếu có) và biên dịch mã nguồn
npm run build

# Chạy server ở chế độ Production
npm run start
```
> **Lưu ý về BigInt:** Hệ thống sử dụng khóa chính dạng `BigInt` để tăng hiệu suất. Khi trả kết quả qua JSON, các trường ID này sẽ được parse thành `String` (VD: `"userId": "1"`). Frontend cần chú ý xử lý dạng chuỗi này thay vì số nguyên.

---

## 🧪 Kế Hoạch Kiểm Thử (Automation Testing)

Hệ thống được thiết kế đi kèm với các bộ kiểm thử tự động toàn diện, dựa trên tài liệu **13 API Contracts** đã được thống nhất. Chi tiết về kế hoạch kiểm thử xem tại [TESTING_PLAN.md](./TESTING_PLAN.md).

### 1. Công Cụ & Chiến Lược
- **Testing Framework**: Jest
- **Assertion & HTTP Request**: Supertest
- **Mocking**: `jest-mock-extended` (Deep mock Prisma Client để giả lập Database mà không cần kết nối MySQL thực tế).

### 2. Chạy Kiểm Thử (Running Tests)
Để chạy toàn bộ các test suites, sử dụng lệnh:
```bash
npm test
```
> **Kết quả mong đợi:** 100% các bài kiểm tra được phủ sóng và chạy thành công (177/177 test cases PASS).

### 3. Xem độ phủ (Coverage)
Để xem chi tiết tỷ lệ code đã được kiểm thử:
```bash
npm run test:coverage
```

### 4. Cấu Trúc Các Test Suites
Hệ thống kiểm thử tự động gồm 21 file test tương ứng với Router, đã đạt mức độ bao phủ 100% (177/177 test cases PASS) và khớp 1:1 với 13 API contracts:
- `auth.test.ts`, `user.test.ts`: Xác thực, quản lý tài khoản.
- `catalog.test.ts`, `warehouse.test.ts`, `inventory.test.ts`: Quản lý kho, hạng mục, tồn kho.
- `supplier.test.ts`, `suppliertx.test.ts`: Quản lý nhà cung cấp.
- `order.test.ts`, `quotation.test.ts`: Đơn hàng, báo giá.
- `task.test.ts`, `survey.test.ts`, `attendance.test.ts`: Khảo sát, task công việc.
- `payment.test.ts`, `settlement.test.ts`: Thanh toán, quyết toán.
- `policy.test.ts`, `wage.test.ts`: Hợp đồng, lương.
- V.v.

---

## 🧰 Các Tiện Ích Hỗ Trợ (Utilities)

- **Xem trực tiếp CSDL qua giao diện Web:**
  ```bash
  npm run prisma:studio
  ```
  *(Truy cập `http://localhost:5555` để thao tác trực tiếp với các bảng dữ liệu)*
