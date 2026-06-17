# Hướng Dẫn Đóng Góp — BNWEMS

> **Binh Nguyen Wedding Event Management System (BNWEMS)**  
> Phiên bản tài liệu: `1.0.0` | Cập nhật lần cuối: `2026-06-17`

---

## 🚀 1. Chào Mừng & Tổng Quan Dự Án

Chào mừng bạn đến với team phát triển **BNWEMS** (Binh Nguyen Wedding Event Management System)! Đây là hệ thống quản lý sự kiện cưới hỏi toàn diện, bao gồm quản lý đơn hàng, khảo sát thực địa, xuất kho, theo dõi thi công, thanh toán và quyết toán cuối ca.

### Kiến Trúc Đa-Repository

Dự án được tổ chức thành **3 Git repository hoàn toàn độc lập**:

| Repository | Công Nghệ | Mục Đích |
|---|---|---|
| `/backend-api` | Node.js v22 + Express.js + Prisma ORM + MySQL | REST API trung tâm cho toàn hệ thống |
| `/web-frontend` | Next.js (React) + TailwindCSS + Axios | Ứng dụng web cho vai trò Admin & Manager |
| `/mobile-app` | Flutter (Dart) + http + Provider | Ứng dụng di động cho Leader Staff & Technical Staff |

> ⚠️ **NGUYÊN TẮC BẤT BIẾN**: Tuyệt đối **KHÔNG** trộn lẫn mã nguồn giữa 3 repository này. Mỗi repository phải được clone riêng, phát triển riêng, và có pipeline CI/CD riêng biệt. Việc commit nhầm code của repository này sang repository khác sẽ bị yêu cầu rollback ngay lập tức.

---

## 🛠️ 2. Thiết Lập Môi Trường Phát Triển Cục Bộ

### 2.1. Phần Mềm Bắt Buộc (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt đầy đủ các phần mềm sau:

| Phần Mềm | Phiên Bản Yêu Cầu | Liên Kết Tải |
|---|---|---|
| **Node.js** | v22 LTS (bắt buộc) | https://nodejs.org/en/download |
| **Flutter SDK** | Stable Channel mới nhất | https://docs.flutter.dev/get-started/install |
| **MySQL Server** | v8.0 trở lên | https://dev.mysql.com/downloads/mysql/ |
| **MySQL Workbench** | Bản mới nhất | https://dev.mysql.com/downloads/workbench/ |
| **Git** | v2.x trở lên | https://git-scm.com/downloads |

Kiểm tra phiên bản sau khi cài đặt:

```bash
node --version    # Phải hiện v22.x.x
npm --version     # Phải hiện 10.x trở lên
flutter --version # Phải hiện Flutter (stable channel)
git --version     # Phải hiện git version 2.x
```

---

### 2.2. Thiết Lập Backend API (`/backend-api`)

```bash
# Bước 1: Clone repository và di chuyển vào thư mục
git clone <URL_BACKEND_REPO>
cd backend-api

# Bước 2: Cài đặt toàn bộ dependencies
npm install

# Bước 3: Cấu hình biến môi trường
# Sao chép file mẫu và điền thông tin của bạn vào
cp .env.example .env
```

Mở file `.env` vừa tạo và cập nhật các giá trị sau:

```dotenv
# Kết nối MySQL — thay thế bằng thông tin MySQL cục bộ của bạn
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/bnwems"

# JWT — đặt một chuỗi bí mật dài, ngẫu nhiên cho môi trường phát triển
JWT_SECRET="your_local_dev_secret_key"
JWT_EXPIRES_IN="8h"

PORT=3001
NODE_ENV=development
```

```bash
# Bước 4: Tạo database schema bằng Prisma migration
npx prisma migrate dev --name init

# Bước 5: Generate Prisma Client (bắt buộc sau mỗi lần thay đổi schema.prisma)
npx prisma generate

# Bước 6: Khởi động server phát triển
npm run dev
```

✅ Server backend sẽ chạy tại: **`http://localhost:3001/api/v1`**  
✅ Kiểm tra: truy cập `http://localhost:3001/api/v1/health` — phải trả về `{"success": true}`.

---

### 2.3. Thiết Lập Web Frontend (`/web-frontend`)

```bash
# Bước 1: Clone repository và di chuyển vào thư mục
git clone <URL_WEB_FRONTEND_REPO>
cd web-frontend

# Bước 2: Cài đặt toàn bộ dependencies
npm install

# Bước 3: Cấu hình biến môi trường
cp .env.example .env.local
```

Mở file `.env.local` và cập nhật:

```dotenv
# Trỏ tới backend API đang chạy cục bộ
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

```bash
# Bước 4: Khởi động server phát triển Next.js
npm run dev
```

✅ Ứng dụng web sẽ chạy tại: **`http://localhost:3000`**

---

### 2.4. Thiết Lập Mobile App (`/mobile-app`)

> ⚠️ **Lưu ý cho Windows**: Flutter yêu cầu **Windows Developer Mode** được bật để hỗ trợ symlink cho các plugin. Bật bằng lệnh:
> ```powershell
> start ms-settings:developers
> ```

```bash
# Bước 1: Clone repository và di chuyển vào thư mục
git clone <URL_MOBILE_REPO>
cd mobile-app

# Bước 2: Tải toàn bộ Flutter dependencies
flutter pub get

# Bước 3: Kiểm tra các thiết bị có sẵn (emulator hoặc thiết bị thật)
flutter devices

# Bước 4: Chạy ứng dụng trên thiết bị/emulator đã chọn
flutter run
```

> 📱 **Kết nối với Backend (Android Emulator)**: Ứng dụng đã được cấu hình sẵn với URL `http://10.0.2.2:3001/api/v1`. Địa chỉ `10.0.2.2` là địa chỉ đặc biệt của Android Emulator, trỏ về `localhost` của máy chủ. Nếu dùng thiết bị thật, hãy đổi sang địa chỉ IP cục bộ của máy bạn (ví dụ: `http://192.168.1.x:3001/api/v1`).

---

## 📝 3. Quy Chuẩn Viết Mã Nguồn

### 3.1. Quy Tắc Đặt Tên (Naming Conventions)

Đây là quy tắc **bắt buộc** áp dụng nhất quán trên toàn bộ 3 repository:

| Phạm Vi | Quy Tắc | Ví Dụ Đúng ✅ | Ví Dụ Sai ❌ |
|---|---|---|---|
| Biến & Hàm (mọi ngôn ngữ) | `camelCase` | `userId`, `getOrderById()` | `user_id`, `GetOrderById()` |
| Class & Interface (TS/Dart) | `PascalCase` | `OrderService`, `UserModel` | `order_service`, `usermodel` |
| Tên file TypeScript/React | `camelCase` hoặc `PascalCase` (Component) | `auth.service.ts`, `Button.tsx` | `Auth_Service.ts`, `button.tsx` |
| Tên file Dart | `snake_case` | `user_model.dart`, `auth_service.dart` | `userModel.dart`, `AuthService.dart` |
| Cột Database (Prisma schema) | `camelCase` (ánh xạ qua `@@map`) | `createdAt`, `orderCode` | `created_at`, `order_code` |
| JSON Keys (API response/request) | `camelCase` | `"fullName"`, `"eventDate"` | `"full_name"`, `"event_date"` |
| Tên branch Git | `kebab-case` | `feature/add-payment-qr` | `feature/add_payment_QR` |

### 3.2. Kiến Trúc Mã Nguồn

Mỗi repository tuân thủ kiến trúc phân tầng riêng:

**Backend API** — Mô hình Controller → Service → Repository (Prisma):
```
routes/       ← Định nghĩa endpoints, gắn middleware RBAC
controllers/  ← Nhận HTTP request, gọi service, trả HTTP response
services/     ← Toàn bộ business logic, gọi Prisma
config/       ← Cấu hình DB, env
middlewares/  ← JWT auth, validation, error handling
```
> ❗ **Quy tắc bắt buộc**: Controllers **không được** chứa bất kỳ logic nghiệp vụ nào. Toàn bộ logic phải nằm trong Services.

**Web Frontend** — Next.js App Router:
```
src/app/         ← Pages & layouts (App Router, Server/Client Components)
src/components/  ← Reusable UI components (phải có unit test)
src/services/    ← Tất cả lời gọi API (axios wrappers)
src/context/     ← React Context cho global state (AuthContext, v.v.)
src/hooks/       ← Custom React hooks
```

**Mobile App** — Provider Pattern:
```
lib/models/     ← Data classes thuần túy (fromJson / toJson)
lib/services/   ← HTTP calls, local storage
lib/providers/  ← ChangeNotifier classes quản lý state
lib/screens/    ← UI Screens (Widget)
lib/widgets/    ← Reusable Widgets
lib/utils/      ← Helper functions, constants
```

### 3.3. Quy Tắc Làm Việc Với Database (Backend)

- **Database First**: Mỗi khi thêm hoặc thay đổi entity, phải cập nhật `prisma/schema.prisma` **trước tiên**, sau đó mới viết Route/Controller/Service.
- Tên bảng trong MySQL dùng `snake_case` thông qua `@@map("ten_bang")` trong Prisma schema.
- Tên cột trong MySQL dùng `snake_case` thông qua `@map("ten_cot")` trong Prisma schema.
- Tên thuộc tính trong Prisma model (code Dart/TS) dùng `camelCase`.
- Không tự ý chỉnh sửa trực tiếp database bằng MySQL Workbench — mọi thay đổi cấu trúc phải thông qua Prisma Migration.

---

## 🧪 4. Kiểm Thử & Giao Thức Xác Minh Tự Động

### 4.1. Chính Sách Zero-Tolerance

> 🚨 **KHÔNG có ngoại lệ**: Dự án BNWEMS áp dụng chính sách **không dung thứ** với các test thất bại. Mọi Pull Request có test thất bại sẽ **bị từ chối tự động** và không được review.

### 4.2. Lệnh Chạy Test

Thực thi các lệnh sau từ thư mục gốc của từng repository:

```bash
# ── Backend API ──────────────────────────────────────────────────────────────
cd backend-api
npm run test              # Chạy toàn bộ test suite (Jest + ts-jest)
npm run test:coverage     # Chạy test kèm báo cáo coverage (phải ≥ 70%)

# ── Web Frontend ─────────────────────────────────────────────────────────────
cd web-frontend
npm run test              # Chạy toàn bộ test suite (Jest + React Testing Library)
npm run test:coverage     # Chạy test kèm báo cáo coverage

# ── Mobile App ───────────────────────────────────────────────────────────────
cd mobile-app
flutter test              # Chạy toàn bộ test suite (Unit + Widget tests)
flutter test test/models/ # Chỉ chạy unit tests cho models
```

Kết quả mong đợi (hiện tại):

```
Backend  : Test Suites: 3 passed | Tests: 15 passed ✅
Frontend : Test Suites: 3 passed | Tests: 13 passed ✅
Mobile   : All tests passed!      Tests:  8 passed  ✅
────────────────────────────────────────────────────
Tổng cộng: 36 tests — 36 PASS — 0 FAIL
```

### 4.3. Yêu Cầu Viết Test Cho Tính Năng Mới

Khi thêm một tính năng mới, **bắt buộc phải viết test tương ứng** theo bảng sau:

| Repository | Loại Code Mới | Loại Test Bắt Buộc |
|---|---|---|
| `backend-api` | Service mới | Unit test mock Prisma cho mọi nhánh logic (success + error cases) |
| `backend-api` | Route/Controller mới | Integration test với Supertest (happy path + 4xx errors) |
| `web-frontend` | Component UI mới | Unit test với React Testing Library (render, interaction) |
| `web-frontend` | API Service mới | Unit test mock axios (success + network error) |
| `mobile-app` | Model mới | Unit test `fromJson()` và `toJson()` với dữ liệu hợp lệ và null fields |
| `mobile-app` | Provider mới | Unit test các trạng thái (loading, success, error) |
| `mobile-app` | Screen chính | Widget test cơ bản (render không crash) |

---

## 🌿 5. Quy Trình Git & Pull Request (PR)

### 5.1. Chiến Lược Branching

Dự án sử dụng mô hình **Git Flow** đơn giản hóa:

```
main              ← Nhánh production. Chỉ merge qua PR được approve.
develop           ← Nhánh tích hợp chính. Mọi feature merge vào đây trước.
feature/<tên>     ← Nhánh phát triển tính năng mới.
bugfix/<tên>      ← Nhánh sửa lỗi.
hotfix/<tên>      ← Nhánh vá lỗi khẩn cấp trực tiếp từ main.
```

**Quy tắc đặt tên nhánh** — dùng `kebab-case`, ngắn gọn, mô tả rõ mục đích:

```bash
# ✅ Đúng
feature/add-payment-qr-generation
feature/order-list-pagination
bugfix/fix-jwt-expiry-401-redirect
hotfix/fix-login-crash-null-role

# ❌ Sai
Feature/AddPaymentQR
new_stuff
fixbug
fix123
```

### 5.2. Quy Trình Tạo Nhánh & Commit

```bash
# 1. Luôn bắt đầu từ nhánh develop mới nhất
git checkout develop
git pull origin develop

# 2. Tạo nhánh mới cho task của bạn
git checkout -b feature/ten-tinh-nang

# 3. Commit thường xuyên với message rõ ràng theo chuẩn Conventional Commits
git add .
git commit -m "feat(orders): add quotation confirmation endpoint"
git commit -m "fix(auth): handle expired token gracefully in mobile app"
git commit -m "test(survey): add unit tests for submitSurveyReport service"
git commit -m "docs: update API endpoint list in CONTRIBUTING.md"

# 4. Push nhánh lên remote
git push origin feature/ten-tinh-nang
```

**Chuẩn Conventional Commits** — prefix bắt buộc cho commit message:

| Prefix | Dùng Khi |
|---|---|
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa lỗi |
| `test:` | Thêm hoặc sửa test |
| `refactor:` | Tái cấu trúc code, không thêm feature hay fix bug |
| `docs:` | Cập nhật tài liệu |
| `chore:` | Cập nhật dependencies, cấu hình build |
| `style:` | Thay đổi format, không ảnh hưởng logic |

### 5.3. Checklist Trước Khi Mở Pull Request

Trước khi tạo PR, tác giả **phải tự kiểm tra** và xác nhận toàn bộ các mục dưới đây:

```
Pull Request Checklist — BNWEMS
──────────────────────────────────────────────────────────────
[ ] 1. CODE BIÊN DỊCH KHÔNG LỖI
        Backend  : npx tsc --noEmit  → 0 TypeScript errors
        Frontend : npx tsc --noEmit  → 0 TypeScript errors
        Mobile   : flutter analyze   → No issues found

[ ] 2. TOÀN BỘ AUTOMATED TESTS PASS (36+ tests)
        Backend  : npm run test       → All tests passed ✅
        Frontend : npm run test       → All tests passed ✅
        Mobile   : flutter test       → All tests passed ✅
        Lưu ý: Phải có thêm test mới nếu có thêm code mới.

[ ] 3. DATABASE MIGRATION (nếu có thay đổi schema)
        [ ] File migration mới đã được tạo qua `npx prisma migrate dev`
        [ ] File migration đã được commit vào repository
        [ ] Mô tả thay đổi schema trong phần PR description

[ ] 4. REVIEW & APPROVAL
        [ ] PR description mô tả rõ "Tại sao" cần thay đổi này
        [ ] PR đã được link với task/issue tương ứng (nếu có)
        [ ] Tối thiểu 1 thành viên khác trong team đã review và approve
        [ ] Mọi comment review đã được giải quyết (resolved)
        [ ] Không merge vào `main` trực tiếp — phải qua `develop` trước
──────────────────────────────────────────────────────────────
```

### 5.4. Quy Trình Review Code

**Dành cho Reviewer:**
- Review trong vòng **1 ngày làm việc** kể từ khi được assign.
- Tập trung vào: logic nghiệp vụ, bảo mật, tuân thủ naming convention, và độ phủ của test.
- Dùng các nhãn: `Approved ✅`, `Request Changes 🔄`, `Comment 💬`.
- **Không approve** nếu thiếu test cho logic mới.

**Dành cho Author:**
- Không tự merge PR của chính mình, dù đã được approve.
- Phản hồi mọi comment review trong vòng 24 giờ.
- Sau khi được approve, author thực hiện merge (Squash and Merge được khuyến khích để giữ history sạch).

---

## ❓ Câu Hỏi & Hỗ Trợ

Nếu bạn gặp bất kỳ vấn đề nào trong quá trình setup hoặc phát triển:

1. **Đọc lại tài liệu**: Kiểm tra `PROJECT_GUIDELINES.md` và `README.md` của từng repository.
2. **Kiểm tra log**: Đọc kỹ thông báo lỗi trong terminal trước khi hỏi.
3. **Hỏi team**: Tạo một issue hoặc nhắn trong kênh chat của team với đầy đủ thông tin: môi trường, lệnh đã chạy, và log lỗi.

---

*Tài liệu này được duy trì bởi team BNWEMS — SEP490 G83. Mọi đề xuất cải thiện quy trình vui lòng tạo PR cập nhật file này.*
