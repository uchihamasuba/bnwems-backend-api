# Cấu Trúc Và Quy Chuẩn Dự Án

## 1. Tech Stack Ràng Buộc
- **Database**: MySQL v8.0+ (Quản lý cục bộ qua MySQL Workbench).
- **Backend API**: Node.js (v22 LTS) + Framework Express.js + Prisma ORM + TypeScript.
- **Web Frontend**: Next.js (React) + Thư viện Axios.
- **Mobile App**: Flutter (Dart) + Thư viện Dio + Quản lý trạng thái Provider.

## 2. Quy Tắc Tổ Chức Mã Nguồn
- Dự án được chia làm 3 Git Repository độc lập nằm tại: `/backend-api`, `/web-frontend`, `/mobile-app`.
- Tuyệt đối KHÔNG trộn lẫn code giữa các thư mục này.
- Luôn đặt tên biến theo chuẩn `camelCase` cho cả API JSON, Database và Codebase (Ví dụ: `userId`, `createdAt`).

## 3. Quy Trình Kiểm Thử Ràng Buộc (Testing Suite)
- **Backend API**: Sử dụng **Jest** và **Supertest**. Tất cả các Endpoint/Routes và Services xử lý logic cốt lõi đều phải có Unit Test và Integration Test đi kèm.
- **Web Frontend**: Sử dụng **Jest** kết hợp với **React Testing Library** để viết Unit Test cho các Component dùng chung (Common Components), Utility Functions và các hàm gọi API (API Services).
- **Mobile App**: Sử dụng công cụ kiểm thử mặc định của Flutter (**Flutter Test Suite**). Phải viết Unit Test cho các lớp dữ liệu (Models), logic nghiệp vụ trong Providers và viết Widget Test cơ bản cho các màn hình luồng chính (như Login, Dashboard).

## 4. Quy Trình Phát Triển Của Agent
- **Database First**: Khi làm Backend, luôn cập nhật file `schema.prisma` và chạy lệnh tạo migration trước khi viết Routes/Controllers.
- **Auto-Verification & Testing**: Sau khi hoàn thành bất kỳ đoạn code hoặc tính năng nào ở cả 3 Repository, Agent phải tự động mở terminal và thực thi lệnh kiểm thử (`npm run test` hoặc `flutter test`). Nếu phát hiện lỗi (Failures/Errors), Agent phải đọc log terminal, tự động sửa mã nguồn (Auto-fix) và chạy lại cho đến khi pass 100%.
- Không tự ý cài đặt thêm các package bên thứ ba ngoài danh sách trên nếu chưa hỏi ý kiến User.
