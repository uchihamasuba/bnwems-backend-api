# Kế Hoạch Kiểm Thử Tự Động (Automation Testing Plan)

## 1. Mục Tiêu Kiểm Thử
Đảm bảo độ tin cậy và tính chính xác của toàn bộ `backend-api` dựa trên **13 API Contracts** đã được định nghĩa trong `documents/Context/docs/api`. 
Kế hoạch sẽ bao phủ tất cả 13 module, kiểm tra tính logic nghiệp vụ, xác thực đầu vào (Validation), luồng dữ liệu (Database Mocking), và xác thực/phân quyền (Auth/RBAC).

## 2. Công Cụ & Chiến Lược
- **Testing Framework**: Jest
- **Assertion & HTTP Request**: Supertest
- **Mocking**: `jest-mock-extended` (Deep mock Prisma Client để giả lập Database mà không cần MySQL thực tế)
- **Cấu hình**: Chạy qua lệnh `npm run test` với biến môi trường định nghĩa trong `.env.test`.

## 3. Cấu Trúc 13 Modules (Test Suites)

Toàn bộ hệ thống kiểm thử sẽ được ánh xạ 1-1 với 13 file API Contracts.

### Module 01: Authentication (`01-auth.test.ts`)
- `POST /api/v1/auth/login`: Xác thực thông tin, cấp token.
- `PUT /api/v1/auth/change-password`: Thay đổi mật khẩu.

### Module 02: Users & Roles (`02-users-roles.test.ts`)
- Quản lý danh sách nhân sự, tạo/sửa/vô hiệu hóa tài khoản và phân quyền.

### Module 03: Catalog (`03-catalog.test.ts`)
- `GET /api/v1/equipment`: Tra cứu danh mục thiết bị, danh mục sự kiện.

### Module 04: Suppliers (`04-suppliers.test.ts`)
- Quản lý nhà cung cấp, liên hệ và giao dịch công nợ.

### Module 05: Warehouse & Inventory (`05-warehouse-inventory.test.ts`)
- Theo dõi tồn kho thực tế, nhập/xuất kho.

### Module 06: Policies & Wage (`06-policies-wage.test.ts`)
- Thiết lập quy tắc đặt cọc, đền bù, và tính lương kỹ thuật viên.

### Module 07: Customers (`07-customers.test.ts`)
- Quản lý thông tin khách hàng, lịch sử liên hệ.

### Module 08: Quotations (`08-quotations.test.ts`)
- Lập báo giá, cập nhật trạng thái báo giá và quy đổi báo giá.

### Module 09: Orders (`09-orders.test.ts`)
- Tạo đơn hàng, theo dõi vòng đời đơn hàng, xác nhận báo giá.

### Module 10: Survey & Assignment (`10-survey-assignment.test.ts`)
- Lên lịch khảo sát, phân công nhân sự thực địa, duyệt báo cáo khảo sát.

### Module 11: Payments & Settlement (`11-payments-settlement.test.ts`)
- Sinh mã thanh toán QR, nộp minh chứng, lập biên bản quyết toán.

### Module 12: Mobile Field Ops (`12-mobile-field-ops.test.ts`)
- API dành riêng cho Mobile App: Tiến độ hiện trường, yêu cầu thay đổi thiết bị, điểm danh, nộp báo cáo.

### Module 13: Reports (`13-reports.test.ts`)
- Thống kê Dashboard, báo cáo doanh thu, tồn kho, đơn hàng dành cho Admin.

## 4. Tiêu Chuẩn Cho Mỗi Test Case
- **Happy Path (Thành công)**: Status 200/201, cấu trúc trả về đúng `success: true`.
- **Bad Request/Validation (Lỗi đầu vào)**: Status 400.
- **Unauthorized/Forbidden (Lỗi bảo mật)**: Status 401 hoặc 403.
- **Edge Cases**: 404 Not Found, 409 Conflict, hoặc Database Logic sai sót.
