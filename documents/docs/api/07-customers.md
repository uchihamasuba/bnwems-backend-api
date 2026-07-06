# Sales & Customer Lifecycle: Customer Management

## Overview
This module handles **UC 2.9 (Customer Management)**.
It deals with the registration, retrieval, and updating of `Customer` records. Customers themselves do not access the system; internal managers handle their profiles.

## Standard Error Codes (SRS Mapping)
- `MSG-UC09-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC09-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC09-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC09-05`: Số điện thoại hoặc mã khách hàng đã tồn tại.

## Endpoints

### 1. `GET /api/v1/customers`
- **Use Case:** UC 2.9 - View Customer Information
- **Description:** Retrieves a paginated list of customers. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches `customerName`, `customerCode`, `phone`, or `email`
  - `status` (enum, optional) - Hoạt động, Ngừng hoạt động
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CU-01",
  "data": [
    {
      "customerId": 1,
      "customerCode": "CUS-001",
      "customerName": "Trần Thị B",
      "phone": "0901234567",
      "email": "jane@example.com",
      "status": "Hoạt động",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 100 }
}
```

### 2. `GET /api/v1/customers/:id`
- **Use Case:** UC 2.9 - View Customer Information
- **Description:** Retrieves details of a specific customer by ID.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CU-02",
  "data": {
    "customerId": 1,
    "customerCode": "CUS-001",
    "customerName": "Trần Thị B",
    "phone": "0901234567",
    "email": "jane@example.com",
    "address": "123 Đường Sự Kiện",
    "notes": "Khách VIP",
    "status": "Hoạt động",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 3. `POST /api/v1/customers`
- **Use Case:** UC 2.9 - Register Customer
- **Description:** Registers a new customer in the system.
- **Business Rules:**
  - BR-09-01: `customerCode` and `phone` must be unique. If it exists, return `MSG-UC09-05`.
  - BR-09-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "customerCode": "CUS-001",
  "customerName": "Trần Thị B",
  "phone": "0901234567",
  "email": "jane@example.com",
  "address": "123 Đường Sự Kiện",
  "notes": "Khách VIP"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CU-03",
  "message": "Đăng ký khách hàng thành công.",
  "data": { "customerId": 1 }
}
```

### 4. `PUT /api/v1/customers/:id`
- **Use Case:** UC 2.9 - Update Customer
- **Description:** Updates the profile information of an existing customer.
- **Request Body:**
```json
{
  "customerName": "Trần Thị B C",
  "email": "jane.smith@example.com",
  "address": "456 Đại lộ Địa điểm Mới",
  "notes": "Khách cực kỳ VIP",
  "status": "Hoạt động"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CU-04",
  "message": "Cập nhật khách hàng thành công."
}
```
