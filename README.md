# Backend API - Binh Nguyen Wedding & Event Management System

Dự án Backend API được xây dựng với **Node.js (v22 LTS)**, **Express.js**, **TypeScript**, và **Prisma ORM** (MySQL). Kiến trúc mã nguồn được phân lớp (Layered Architecture) giúp dễ dàng mở rộng và bảo trì.

## Cấu Trúc Mã Nguồn (Folder Tree)

Dưới đây là sơ đồ cây thư mục của dự án và giải thích vai trò của từng thành phần:

```text
backend-api/
├── prisma/
│   └── schema.prisma        # Nơi định nghĩa toàn bộ mô hình dữ liệu (models) và các mối quan hệ (relations) cho CSDL.
├── src/
│   ├── app.ts               # File cấu hình Express app, tích hợp middlewares cơ bản và gắn các routes chính.
│   ├── server.ts            # Entry point của ứng dụng; khởi tạo và chạy web server trên port được chỉ định.
│   ├── config/
│   │   ├── database.ts      # Khởi tạo instance PrismaClient singleton để sử dụng lại xuyên suốt dự án.
│   │   └── env.ts           # File khai báo, parse và kiểm tra tính hợp lệ của các biến môi trường (Environment Variables).
│   ├── controllers/         # Tầng giao tiếp HTTP: Nhận request, gọi service xử lý, và trả về response chuẩn.
│   │   ├── attendance.controller.ts # API điểm danh kỹ thuật viên tại công trường.
│   │   ├── auth.controller.ts       # API xác thực: Login, thay đổi mật khẩu.
│   │   ├── catalog.controller.ts    # API danh mục thiết bị, vật tư.
│   │   ├── customer.controller.ts   # API thông tin khách hàng.
│   │   ├── field.controller.ts      # API quản lý tiến độ thi công thực địa, yêu cầu thay đổi thiết bị.
│   │   ├── inventory.controller.ts  # API quản lý kho, kiểm tra tính khả dụng vật tư.
│   │   ├── operations.controller.ts # API điều phối xuất kho, tạo pick-list.
│   │   ├── order.controller.ts      # API quản lý vòng đời đơn hàng sự kiện.
│   │   ├── payment.controller.ts    # API thanh toán, sinh mã QR, upload biên lai.
│   │   ├── policy.controller.ts     # API thiết lập quy định, chính sách (đặt cọc, đền bù).
│   │   ├── quotation.controller.ts  # API quản lý báo giá.
│   │   ├── report.controller.ts     # API xuất báo cáo thống kê.
│   │   ├── settlement.controller.ts # API quyết toán đơn hàng, đền bù mất mát.
│   │   ├── supplier.controller.ts   # API quản lý nhà cung cấp vật tư ngoài.
│   │   ├── survey.controller.ts     # API phân công và báo cáo khảo sát mặt bằng.
│   │   └── user.controller.ts       # API quản trị tài khoản, phân quyền (RBAC).
│   ├── services/            # Tầng Business Logic: Nơi chứa toàn bộ nghiệp vụ cốt lõi và gọi truy vấn CSDL qua Prisma.
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── catalog.service.ts
│   │   ├── customer.service.ts
│   │   ├── field.service.ts
│   │   ├── inventory.service.ts
│   │   ├── operations.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── policy.service.ts
│   │   ├── quotation.service.ts
│   │   ├── report.service.ts
│   │   ├── settlement.service.ts
│   │   ├── supplier.service.ts
│   │   ├── survey.service.ts
│   │   └── user.service.ts
│   ├── routes/              # Tầng định tuyến: Định nghĩa URL Endpoints, method và chèn Middlewares tương ứng.
│   │   ├── index.ts                 # Router trung tâm gộp tất cả các sub-routers con.
│   │   ├── attendance.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── catalog.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── field.routes.ts
│   │   ├── inventory.routes.ts
│   │   ├── operations.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── policy.routes.ts
│   │   ├── quotation.routes.ts
│   │   ├── report.routes.ts
│   │   ├── settlement.routes.ts
│   │   ├── supplier.routes.ts
│   │   ├── survey.routes.ts
│   │   └── user.routes.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # Middleware kiểm tra Token hợp lệ (JWT) và xác thực quyền Role (RBAC).
│   │   ├── error.middleware.ts      # Middleware bắt lỗi Global và xử lý khi route không tồn tại (404).
│   │   └── validation.middleware.ts # Middleware chặn bắt đầu vào (body/query) nếu sai định dạng trước khi vào controller.
│   └── utils/
│       └── response.ts              # Các Utility Functions dùng để chuẩn hóa format response (success/error envelope).
├── tests/                   # Thư mục chứa các file Test Case tự động bằng Jest (Unit Test, Integration Test).
│   ├── attendance.test.ts
│   ├── auth.test.ts
│   ├── catalog.test.ts
│   └── ...
└── TESTING_PLAN.md          # Bản kế hoạch và chiến lược kiểm thử tự động.
```

## Hướng Dẫn Cài Đặt Và Chạy (Installation & Setup)

### 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js**: Phiên bản v22 LTS trở lên.
- **MySQL**: Máy chủ MySQL (Local hoặc Docker).
- **Trình quản lý gói**: `npm` (được khuyến nghị).

### 2. Các bước cài đặt
**Bước 1:** Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

**Bước 2:** Cấu hình biến môi trường:
Tạo file `.env` ở thư mục gốc của `backend-api` và thiết lập các thông số cơ bản (có thể tham khảo cấu trúc nếu có file mẫu):
```env
PORT=3000
DATABASE_URL="mysql://user:password@localhost:3306/wedding_event_db"
JWT_SECRET="your_jwt_secret"
```

**Bước 3:** Khởi tạo cơ sở dữ liệu với Prisma:
Đồng bộ hóa schema với Database:
```bash
npx prisma db push
```
*(Hoặc dùng `npx prisma migrate dev` nếu bạn dùng migration)*

Sau đó generate Prisma Client:
```bash
npx prisma generate
```

### 3. Chạy ứng dụng
**Môi trường phát triển (Development):**
Khởi động server với tính năng auto-reload:
```bash
npm run dev
```
> **Dấu hiệu chạy thành công:** Terminal/Console hiển thị dòng chữ `Server running on port 3000` (hoặc đúng số port bạn đã cấu hình).

**Môi trường sản xuất (Production):**
Build mã nguồn TypeScript sang JavaScript và chạy:
```bash
npm run build
npm start
```
> **Dấu hiệu chạy thành công:** Terminal/Console hiển thị dòng chữ `Server running on port 3000` (hoặc đúng số port bạn đã cấu hình).


## Kế Hoạch Kiểm Thử Tự Động (Automation Testing)

Hệ thống được thiết kế đi kèm với các bộ kiểm thử tự động toàn diện, dựa trên tài liệu **13 API Contracts** đã được thống nhất. Chi tiết về kế hoạch kiểm thử xem tại [TESTING_PLAN.md](./TESTING_PLAN.md).

### 1. Công Cụ & Chiến Lược
- **Testing Framework**: Jest
- **Assertion & HTTP Request**: Supertest
- **Mocking**: `jest-mock-extended` (Deep mock Prisma Client để giả lập Database mà không cần kết nối MySQL thực tế).
- **Lệnh chạy**: Sử dụng lệnh `npm run test` với biến môi trường từ `.env.test`.
  > **Dấu hiệu test thành công:** Terminal sẽ hiển thị tất cả các Test Suites màu xanh lá với chữ `PASS` (ví dụ: `PASS tests/auth.test.ts`). Ở phần tóm tắt cuối cùng, thông báo sẽ hiển thị `Test Suites: X passed, X total` và `Tests: Y passed, Y total` không có lỗi nào (`0 failed`).

### 2. Cấu Trúc Các Test Suites (13 Modules)
Toàn bộ hệ thống kiểm thử được ánh xạ 1-1 với 13 modules nghiệp vụ chính, bao gồm:
1. **Authentication** (`01-auth.test.ts`): Xác thực, token, đổi mật khẩu.
2. **Users & Roles** (`02-users-roles.test.ts`): Quản lý tài khoản, phân quyền.
3. **Catalog** (`03-catalog.test.ts`): Danh mục thiết bị, sự kiện.
4. **Suppliers** (`04-suppliers.test.ts`): Quản lý nhà cung cấp.
5. **Warehouse & Inventory** (`05-warehouse-inventory.test.ts`): Tồn kho, nhập/xuất kho.
6. **Policies & Wage** (`06-policies-wage.test.ts`): Quy tắc đặt cọc, đền bù, lương.
7. **Customers** (`07-customers.test.ts`): Thông tin khách hàng.
8. **Quotations** (`08-quotations.test.ts`): Quản lý báo giá.
9. **Orders** (`09-orders.test.ts`): Vòng đời đơn hàng.
10. **Survey & Assignment** (`10-survey-assignment.test.ts`): Khảo sát và phân công.
11. **Payments & Settlement** (`11-payments-settlement.test.ts`): Thanh toán và quyết toán.
12. **Mobile Field Ops** (`12-mobile-field-ops.test.ts`): Nghiệp vụ cho mobile app (tiến độ, điểm danh).
13. **Reports** (`13-reports.test.ts`): Báo cáo thống kê.

### 3. Tiêu Chuẩn Cho Mỗi Test Case
- **Happy Path (Thành công)**: Đảm bảo luồng chuẩn trả về Status 200/201, cấu trúc response hợp lệ (`success: true`).
- **Bad Request/Validation (Lỗi đầu vào)**: Xử lý và trả về Status 400.
- **Unauthorized/Forbidden (Lỗi bảo mật)**: Xác thực Auth/RBAC chặn đúng quyền, trả về Status 401 hoặc 403.
- **Edge Cases**: Bao phủ các ngoại lệ như 404 Not Found, 409 Conflict, hoặc logic xử lý dữ liệu phức tạp.
