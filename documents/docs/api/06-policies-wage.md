# Master Data & Policies: Policy, Attendance, and Wage Management

## Overview
This module handles **UC 2.6 (Policy Configuration)**, **UC 2.29 (Attendance & Task Completion)**, and **UC 2.17 (Staff Wage Confirmation)**.
It manages `BusinessPolicy` records, staff `Attendance`, and their monthly `WageSummary`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC06-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC06-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC29-01`: Vị trí nằm ngoài phạm vi chấm công.
- `MSG-UC17-01`: Các vấn đề điểm danh chưa được giải quyết ngăn cản việc xác nhận lương.

## 1. Policy & Wage Rule Configuration (UC 2.6)

### 1. `GET /api/v1/policies`
- **Use Case:** UC 2.6 - View Policy List
- **Description:** Retrieves the list of configured business policies. Admin access required.
- **Query Parameters:**
  - `policyType` (enum, optional) - DEPOSIT, REFUND, CANCELLATION, etc.
  - `isActive` (boolean, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-01",
  "data": [
    {
      "policyId": 1,
      "policyType": "deposit",
      "name": "Chính sách đặt cọc tiêu chuẩn",
      "rules": { "percentage": 50 },
      "isActive": true,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "totalCount": 10 }
}
```

### 2. `POST /api/v1/policies`
- **Use Case:** UC 2.6 - Create Policy
- **Description:** Creates a new business policy. Admin access required.
- **Business Rules:**
  - BR-06-01: Rule constraints (e.g. percentages) must be between 0 and 100.
  - BR-06-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "policyType": "cancellation",
  "name": "Hủy trước 7 ngày",
  "rules": { "refundPercentage": 100, "daysBeforeEvent": 7 }
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
- **Business Rules:**
  - BR-06-03: Active orders use the policy that was in effect at the time of order confirmation.
- **Request Body:**
```json
{
  "rules": { "refundPercentage": 80, "daysBeforeEvent": 7 }
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

## 2. Attendance & Task Completion (UC 2.29)

### 4. `POST /api/v1/attendance/check-in`
- **Use Case:** UC 2.29 - Check-in Attendance
- **Description:** Allows staff to check in for their assigned work session.
- **Business Rules:**
  - BR-29-01: System verifies that current time is within allowed schedule buffer.
  - BR-29-02: Optional GPS location verification against task location.
- **Request Body:**
```json
{
  "assignmentId": 1,
  "checkInTime": "2026-06-22T08:00:00Z",
  "locationCoordinates": "10.762622, 106.660172"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-04",
  "message": "Chấm công thành công."
}
```

### 5. `PUT /api/v1/attendance/:id/confirm`
- **Use Case:** UC 2.29 - Confirm Technical Staff Attendance & Work Completion
- **Description:** Leader staff confirms the attendance and task completion of technical staff.
- **Business Rules:**
  - BR-29-03: Changes attendance status to `confirmed` or `rejected`.
- **Request Body:**
```json
{
  "status": "confirmed",
  "checkOutTime": "2026-06-22T17:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-05",
  "message": "Xác nhận điểm danh thành công."
}
```

## 3. Staff Wage Confirmation (UC 2.17)

### 6. `GET /api/v1/wages/summary`
- **Use Case:** UC 2.17 - Monitor Staff Wage Data
- **Description:** Retrieves wage summaries for staff by period. Manager access required.
- **Query Parameters:**
  - `period` (string, format YYYY-MM)
  - `userId` (string, optional)
  - `status` (enum, optional) - draft, confirmed, paid
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-06",
  "data": [
    {
      "wageSummaryId": 1,
      "userId": 1,
      "wagePeriod": "2026-06",
      "totalSessions": 5,
      "grossAmount": 1500000.00,
      "totalDeduction": 50000.00,
      "totalWage": 1450000.00,
      "status": "draft",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 10 }
}
```

### 7. `POST /api/v1/wages/summary/:id/confirm`
- **Use Case:** UC 2.17 - Confirm Staff Work and Wage
- **Description:** Confirms the wage summary for a staff member after verifying attendance and deductions.
- **Business Rules:**
  - BR-17-01: Manager confirms the system-calculated `totalWage`.
  - BR-17-02: Wage cannot be confirmed if there are pending attendances for the period.
- **Request Body:**
```json
{
  "status": "confirmed"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PO-07",
  "message": "Xác nhận tổng kết lương thành công."
}
```
