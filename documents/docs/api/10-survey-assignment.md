# Operations & Field Work: Survey & Schedule Planning

## Overview
This module handles **UC 2.12 (Survey Management)** and **UC 2.14 - 2.15 (Staff Assignment & Schedule Planning)**.
It manages `WorkTask` definitions, specific `SchedulePlan` assignments for orders, and the creation of `SurveyReport`s.

## Standard Error Codes (SRS Mapping)
- `MSG-UC53-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC53-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC53-05`: Thiếu thông tin phân công nhân viên.
- `MSG-UC55-06`: Không thể xóa phân công vì nó đã bắt đầu hoặc đã được thực hiện.
- `MSG-UC12-01`: Báo cáo khảo sát đã được gửi.

---

## 1. Work Task Dictionary

### 1. `GET /api/v1/work-tasks`
- **Use Case:** View predefined tasks.
- **Description:** Retrieves the catalog of work tasks (e.g., Khảo sát, Lắp đặt, Thu dọn).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-01",
  "data": [
    {
      "taskId": 1,
      "taskCode": "TSK-001",
      "taskName": "Khảo sát mặt bằng",
      "isActive": true
    }
  ]
}
```

---

## 2. Schedule Planning & Staff Assignment (UC 2.14, 2.15)

### 2. `GET /api/v1/schedule-plans`
- **Use Case:** UC 2.14 - View Schedule List
- **Description:** Retrieves schedule plans across all orders. Manager access required.
- **Query Parameters:**
  - `orderId` (string, optional)
  - `assignedTo` (string, optional)
  - `status` (enum, optional) - Chờ xử lý, Đã xác nhận, Đang thực hiện, Hoàn thành, Đã hủy
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-02",
  "data": [
    {
      "planId": 1,
      "planCode": "PLN-001",
      "orderId": 100,
      "taskId": 1,
      "taskName": "Khảo sát mặt bằng",
      "assignedTo": 5,
      "assigneeName": "Nguyễn Văn A",
      "startTime": "2026-10-01T09:00:00Z",
      "endTime": "2026-10-01T12:00:00Z",
      "location": "123 Event Hall",
      "status": "Chờ xử lý"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 50 }
}
```

### 3. `POST /api/v1/schedule-plans`
- **Use Case:** UC 2.15.2 - Create Schedule Plan / Assign Staff
- **Description:** Creates a schedule plan for an order and assigns a staff member.
- **Business Rules:**
  - BR-53-06: Automatically notifies the assigned user.
- **Request Body:**
```json
{
  "orderId": 100,
  "taskId": 1,
  "assignedTo": 5,
  "startTime": "2026-10-01T09:00:00Z",
  "endTime": "2026-10-01T12:00:00Z",
  "location": "123 Event Hall",
  "notes": "Nhớ mang theo thước đo"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SV-03",
  "message": "Đã tạo phân công và gửi thông báo cho nhân viên."
}
```

### 4. `PUT /api/v1/schedule-plans/:id`
- **Use Case:** UC 2.15.3 - Edit Schedule Plan
- **Description:** Modifies a schedule plan.
- **Business Rules:**
  - BR-54-07: Executed or Completed plans should not be modified.
- **Request Body:**
```json
{
  "startTime": "2026-10-01T10:00:00Z",
  "endTime": "2026-10-01T11:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-03-UPDATED",
  "message": "Cập nhật phân công thành công."
}
```

### 5. `PATCH /api/v1/schedule-plans/:id/status`
- **Use Case:** UC 2.15.4 - Update Schedule Status
- **Description:** Updates the status of the plan (e.g., to Đã hủy or Đã xác nhận).
- **Request Body:**
```json
{
  "status": "Đã hủy"
}
```

---

## 3. Survey Management (UC 2.12)

### 6. `GET /api/v1/orders/:orderId/survey-reports`
- **Use Case:** UC 2.12 - View Survey Reports for an Order
- **Description:** Retrieves all survey reports associated with an order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-04",
  "data": [
    {
      "surveyId": 1,
      "reportCode": "SRV-001",
      "orderId": 100,
      "planId": 1,
      "surveyDate": "2026-10-01T00:00:00Z",
      "location": "123 Event Hall",
      "area": 200.5,
      "status": "Đã xác nhận"
    }
  ]
}
```

### 7. `GET /api/v1/survey-reports/:id`
- **Use Case:** View Survey Report Details
- **Description:** Retrieves full details of a survey report, including evidence links.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-04-DETAIL",
  "data": {
    "surveyId": 1,
    "reportCode": "SRV-001",
    "orderId": 100,
    "planId": 1,
    "evidenceId": 15,
    "surveyDate": "2026-10-01T00:00:00Z",
    "location": "123 Event Hall",
    "area": 200.5,
    "length": 20.0,
    "width": 10.0,
    "entrance": "Cổng sau rộng 3m",
    "siteConstraints": "Không dùng đinh đóng tường",
    "proposedItems": "Nên dùng khung truss tự đứng",
    "notes": "Khách hàng dặn kỹ về vệ sinh",
    "status": "Đã xác nhận",
    "evidence": {
      "fileId": 15,
      "fileUrl": "https://example.com/survey-doc.pdf"
    }
  }
}
```

### 8. `POST /api/v1/survey-reports`
- **Use Case:** UC 2.12 - Submit Survey Report
- **Description:** Staff submits a survey report after completing a site survey.
- **Request Body:**
```json
{
  "orderId": 100,
  "planId": 1,
  "evidenceId": 15,
  "surveyDate": "2026-10-01T00:00:00Z",
  "location": "123 Event Hall",
  "area": 200.5,
  "length": 20.0,
  "width": 10.0,
  "entrance": "Cổng sau rộng 3m",
  "siteConstraints": "Không dùng đinh đóng tường",
  "proposedItems": "Nên dùng khung truss tự đứng",
  "notes": "Khách hàng dặn kỹ về vệ sinh"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SV-05",
  "message": "Đã nộp báo cáo khảo sát thành công."
}
```

### 9. `PUT /api/v1/survey-reports/:id/confirm`
- **Use Case:** UC 2.12 - Survey Report Approval
- **Description:** Manager confirms the submitted survey report.
- **Request Body:**
```json
{
  "status": "Đã xác nhận"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-06",
  "message": "Báo cáo khảo sát đã được xác nhận."
}
```
