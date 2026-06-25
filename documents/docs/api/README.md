# API Documentation — ERP Bình Nguyễn

> Tài liệu hợp đồng API giữa Backend và Frontend (web + mobile).
> File này là **khung chuẩn**: quy ước chung + template. Mỗi nhóm nghiệp vụ nằm trong một file riêng (xem [Mục lục](#c-mục-lục-module)).

**Cách dùng:** Khi viết một endpoint mới, mở file module tương ứng, copy [template](#b-template-cho-mỗi-endpoint) và điền vào. Mọi quy ước (envelope, lỗi, phân trang…) tuân theo Phần A bên dưới — không lặp lại trong từng file.

---

## A. Quy ước chung

- **Base URL:** `/api/v1`
- **Format:** JSON · **Charset:** UTF-8
- **Mọi path** trong các file module được viết tương đối so với Base URL (vd `POST /orders` = `POST /api/v1/orders`).

### A.1 Xác thực (tối giản)

- `POST /auth/login` trả về 1 token (JWT, hạn ~7 ngày, **không refresh token**).
- Mọi request cần đăng nhập gắn header: `Authorization: Bearer <token>`.
- Logout = client tự xóa token.
- Phân quyền theo vai trò: thiếu quyền → trả `403`.

### A.2 Envelope thành công

```json
{
  "success": true,
  "code": "MSG-CO-01",
  "message": "Tạo đơn hàng thành công",
  "data": {}
}
```

`code` tái dùng bộ mã **MSG-\*** đã định nghĩa ở mục 8 của `documents.md`.

> **Quy ước chuẩn hóa prefix MSG (để tránh trùng lặp):**
> - `MSG-AU`: Auth (Xác thực, quên mật khẩu)
> - `MSG-US`: User & Role
> - `MSG-CT`: Catalog (danh mục)
> - `MSG-SP`: Supplier (nhà cung cấp)
> - `MSG-WH`: Warehouse & Inventory
> - `MSG-PO`: Policy
> - `MSG-CU`: Customer
> - `MSG-QO`: Quotation
> - `MSG-CO`: Order (đơn hàng)
> - `MSG-SV`: Survey & Assignment
> - `MSG-PM`: Payment & Settlement
> - `MSG-MO`: Mobile (Tiến độ hiện trường)
> - `MSG-RP`: Report

### A.3 Envelope lỗi

```json
{
  "success": false,
  "code": "MSG-CO-02",
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    { "field": "customerId", "message": "Khách hàng không tồn tại" }
  ]
}
```

`errors` chỉ xuất hiện với lỗi validation theo từng field; lỗi chung thì bỏ.

### A.4 Danh sách & phân trang

`data` là mảng, kèm `meta`:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 135, "total_pages": 7 }
}
```

Query chuẩn cho mọi endpoint list:
`?page=1&limit=20&search=&sortBy=createdAt&sortOrder=desc`

### A.5 Mã HTTP dùng trong dự án

| Code | Khi nào |
|------|---------|
| 200  | GET/PUT/PATCH thành công |
| 201  | POST tạo mới thành công |
| 400  | Sai cú pháp / thiếu field |
| 401  | Chưa đăng nhập / token sai |
| 403  | Sai vai trò, không đủ quyền |
| 404  | Không tìm thấy resource |
| 409  | Xung đột nghiệp vụ (trùng, sai trạng thái) |
| 500  | Lỗi server |

> **Lưu ý:**
> - Mọi endpoint yêu cầu xác thực đều có thể trả `401` nếu token không hợp lệ hoặc hết hạn.
> - Hệ thống không hard-delete; mọi tác vụ vô hiệu hóa/xóa đều dùng `PATCH .../status` (soft delete), vì vậy hệ thống **không sử dụng method `DELETE`**.

### A.6 Quy ước dữ liệu

- Ngày: `YYYY-MM-DD`
- Thời gian: ISO-8601 UTC — `2026-06-19T10:00:00Z` (Tất cả các trường kiểu `DATETIME` trong DB sẽ được serialize thành ISO-8601 UTC trong API).
- Tiền: kiểu **number**, đơn vị VNĐ.

---

## B. Template cho mỗi endpoint

Copy khối dưới đây cho từng endpoint. Endpoint đơn giản (login, list) có thể bỏ bớt ô không cần.

---

### `[UC-56]` Tạo đơn hàng

`POST /orders`

| | |
|---|---|
| **Vai trò** | Manager |
| **UC · BR** | UC-56 · BR-CO01–05 |
| **Mô tả** | Manager tạo đơn hàng mới gắn với một khách hàng. |

**Path params:** không có
**Query params:** không có

**Request body**

```json
{ "customerId": 1, "eventDate": "2026-07-01" }
```

**Response `201`**

```json
{
  "success": true,
  "code": "MSG-CO-01",
  "message": "Tạo đơn hàng thành công",
  "data": { "orderId": 10, "orderNumber": "ORD-010", "status": "draft" }
}
```

**Lỗi có thể gặp**

| HTTP | code | Khi nào |
|------|------|---------|
| 400  | MSG-CO-02 | Thiếu field bắt buộc |
| 404  | MSG-CO-03 | `customerId` không tồn tại |

**Ghi chú:** Ghi audit log khi tạo (BR-CO05).

---

## C. Mục lục module

| # | File | Nghiệp vụ | UC | Nền tảng | Phụ trách |
|---|------|-----------|----|----------|-----------|
| 01 | [01-auth.md](./01-auth.md) | Xác thực, hồ sơ, thông báo | 1–5, 7 | Web + Mobile | _(chưa phân)_ |
| 02 | [02-users-roles.md](./02-users-roles.md) | Người dùng, vai trò, quyền | 8–18 | Web | _(chưa phân)_ |
| 03 | [03-catalog.md](./03-catalog.md) | Danh mục thiết bị/dịch vụ + giá | 19–27 | Web | _(chưa phân)_ |
| 04 | [04-suppliers.md](./04-suppliers.md) | Nhà cung cấp + giao dịch/công nợ NCC | 28–31, 71–74 | Web | _(chưa phân)_ |
| 05 | [05-warehouse-inventory.md](./05-warehouse-inventory.md) | Kho + tồn kho + xuất/hoàn trả | 32–33, 66–70 | Web | _(chưa phân)_ |
| 06 | [06-policies-wage.md](./06-policies-wage.md) | Chính sách + quy tắc lương | 34–38 | Web | _(chưa phân)_ |
| 07 | [07-customers.md](./07-customers.md) | Khách hàng | 47–49 | Web | _(chưa phân)_ |
| 08 | [08-quotations.md](./08-quotations.md) | Báo giá | 50–52 | Web | _(chưa phân)_ |
| 09 | [09-orders.md](./09-orders.md) | Đơn hàng (vòng đời) + dashboard vận hành | 39B, 53–60 | Web | _(chưa phân)_ |
| 10 | [10-survey-assignment.md](./10-survey-assignment.md) | Khảo sát + phân công + giám sát vận hành | 62–65, 75–82 | Web | _(chưa phân)_ |
| 11 | [11-payments-settlement.md](./11-payments-settlement.md) | Thanh toán + quyết toán | 83–87 | Web | _(chưa phân)_ |
| 12 | [12-mobile-field-ops.md](./12-mobile-field-ops.md) | App mobile (Leader/Tech) | 88–107 | Mobile | _(chưa phân)_ |
| 13 | [13-reports.md](./13-reports.md) | Báo cáo + dashboard quản trị | 39A, 40–46 | Web | _(chưa phân)_ |

> **Quy ước trạng thái** trong từng file: ⬜ chưa viết · 🟡 đang viết · ✅ xong.
