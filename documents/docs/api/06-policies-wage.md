# Master Data & Policies: Policy, Attendance, and Wage Management

## Overview
This module handles **UC 2.6 (Policy Configuration)**, **UC 2.29 (Attendance & Task Completion)**, and **UC 2.17 (Staff Wage Confirmation)**.
It manages `BusinessPolicy` records, staff `Attendance`, and order-based `WageRecord`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC06-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC06-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC29-01`: Vị trí nằm ngoài phạm vi chấm công.
- `MSG-UC17-01`: Các vấn đề điểm danh chưa được giải quyết ngăn cản việc xác nhận lương.

---

## 1. Policy Configuration (UC 2.6)

### 1. `GET /api/v1/policies`
- **Use Case:** UC 2.6 - View Policy List
- **Description:** Retrieves the list of configured business policies. Admin/Manager access required.
- **Query Parameters:**
  - `policyType` (enum, optional) - Đặt cọc, Hủy đơn, Bồi thường, Phụ phí, Lương
  - `isActive` (boolean, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-01",
  "data": [
    {
      "policyId": 1,
      "policyCode": "POL-001",
      "policyName": "Lương Thi công Decor",
      "policyType": "Lương",
      "description": "Lương theo ca cho nhân sự thi công decor",
      "policyValue": 300000.00,
      "unit": "VNĐ",
      "isActive": true
    }
  ],
  "meta": { "totalCount": 10 }
}
```

### 2. `POST /api/v1/policies`
- **Use Case:** UC 2.6 - Create Policy
- **Description:** Creates a new business policy. Admin access required.
- **Business Rules:**
  - BR-06-01: Policy value and unit must match logically (e.g. max 100 for %).
- **Request Body:**
```json
{
  "policyCode": "POL-002",
  "policyName": "Quy định cọc đơn hàng",
  "policyType": "Đặt cọc",
  "policyValue": 50.00,
  "unit": "%",
  "description": "Yêu cầu đặt cọc 50% trước ngày sự kiện"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-PO-02",
  "message": "Tạo chính sách thành công."
}
```

### 3. `PUT /api/v1/policies/:id`
- **Use Case:** UC 2.6 - Update Policy
- **Description:** Updates an existing policy. Admin access required.
- **Request Body:**
```json
{
  "policyValue": 60.00,
  "unit": "%",
  "isActive": true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-03",
  "message": "Cập nhật chính sách thành công."
}
```

---

## 2. Attendance & Task Completion (UC 2.29)

### 4. `POST /api/v1/attendance/check-in`
- **Use Case:** UC 2.29 - Check-in Attendance
- **Description:** Allows staff to check in for their assigned `SchedulePlan`. Usually involves uploading an evidence photo.
- **Request Body:**
```json
{
  "planId": 10,
  "checkInEvidenceId": 50,
  "checkInAt": "2026-06-22T08:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-04",
  "message": "Chấm công vào ca thành công."
}
```

### 5. `PUT /api/v1/attendance/:id/check-out`
- **Use Case:** UC 2.29 - Check-out Attendance
- **Description:** Records check-out time.
- **Request Body:**
```json
{
  "checkOutAt": "2026-06-22T17:00:00Z",
  "note": "Hoàn thành nhiệm vụ"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-05",
  "message": "Chấm công ra ca thành công."
}
```

---

## 3. Staff Wage Confirmation (UC 2.17)

### 6. `GET /api/v1/wages`
- **Use Case:** UC 2.17 - Monitor Staff Wage Data
- **Description:** Retrieves order-based wage records for staff.
- **Query Parameters:**
  - `userId` (optional)
  - `orderId` (optional)
  - `status` (enum, optional) - Nháp, Chờ duyệt, Đã xác nhận, Đã thanh toán
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-06",
  "data": [
    {
      "wageId": 1,
      "wageCode": "WAG-001",
      "orderId": 100,
      "userId": 5,
      "wageRole": "Thi công Decor",
      "shifts": 2,
      "wageRate": 300000.00,
      "totalWage": 600000.00,
      "status": "Chờ duyệt",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 10 }
}
```

### 7. `POST /api/v1/wages/:id/confirm`
- **Use Case:** UC 2.17 - Confirm Staff Work and Wage
- **Description:** Manager confirms the wage record for an order.
- **Request Body:**
```json
{
  "status": "Đã xác nhận",
  "notes": "Duyệt lương thi công"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-07",
  "message": "Xác nhận lương thành công."
}
```
