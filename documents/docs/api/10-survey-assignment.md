# Operations & Field Work: Survey & Assignment

## Overview
This module handles **UC 2.12 (Survey Management)** and **UC 2.14 - 2.15 (Staff Assignment & Operation Planning)**.
It manages `Schedule` entities and their associated `WorkTask` entities, assigning `InternalUser` personnel to them through the `Assignment` entity.

## Standard Error Codes (SRS Mapping)
- `MSG-UC53-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC53-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC53-05`: Thiếu thông tin phân công nhân viên.
- `MSG-UC55-06`: Không thể xóa công việc vì nó đã bắt đầu hoặc đã được thực hiện.
- `MSG-UC12-01`: Báo cáo khảo sát đã được gửi.

## 1. Survey Management (UC 2.12)

### 1. `GET /api/v1/tasks`
- **Use Case:** UC 2.12 / 2.15 - View All Tasks
- **Description:** Retrieves a paginated list of all tasks in the system. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `orderId` (string, optional)
  - `status` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-01",
  "data": [
    {
      "workTaskId": 1,
      "orderId": 1,
      "title": "Survey task",
      "status": "pending"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 100 }
}
```

### 2. `POST /api/v1/orders/:id/tasks`
- **Use Case:** UC 2.12 - Create Survey Task & UC 2.15.1 - Create Work Task
- **Description:** Creates a task (survey or operational) linked to an order.
- **Business Rules:**
  - BR-52-05: If operational, must be linked to a related `scheduleId`.
- **Request Body:**
```json
{
  "taskType": "survey",
  "scheduledStart": "2026-08-01T09:00:00Z",
  "scheduledEnd": "2026-08-01T12:00:00Z",
  "location": "123 Event Hall"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SV-02",
  "message": "Tạo công việc thành công.",
  "data": { "workTaskId": 1 }
}
```

### 3. `GET /api/v1/tasks/:id/survey-report`
- **Use Case:** UC 2.12 - View Survey Report
- **Description:** Manager reviews submitted survey reports attached to a task.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-03",
  "data": {
    "workTaskId": 1,
    "notes": "Venue has strict height limits.",
    "evidences": [
      { "fileUrl": "https://storage.example.com/survey1.jpg" }
    ],
    "surveyedBy": {
      "userId": 1,
      "fullName": "Nguyễn Văn A"
    },
    "submittedAt": "2026-06-22T12:00:00Z"
  }
}
```

### 4. `PUT /api/v1/tasks/:id/survey-report/review`
- **Use Case:** UC 2.12 - Survey Report Approval
- **Description:** Manager duyệt hoặc yêu cầu bổ sung báo cáo khảo sát.
- **Request Body:**
```json
{
  "status": "approved",
  "reviewNotes": "All good to proceed."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-04",
  "message": "Bản đánh giá báo cáo khảo sát đã được gửi."
}
```

## 2. Staff Assignment (UC 2.14, 2.15)

### 5. `GET /api/v1/schedules`
- **Use Case:** UC 2.14 - View Schedule List
- **Description:** Manager views scheduled operations for orders.
- **Query Parameters:**
  - `orderId` (string, optional)
  - `status` (enum, optional)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-05",
  "data": [
    {
      "scheduleId": 1,
      "orderId": 1,
      "status": "draft",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 50 }
}
```



### 6. `GET /api/v1/orders/:id/assignments`
- **Use Case:** UC 2.15 - View Assignments
- **Description:** Retrieves all staff assignments for a specific order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-06",
  "data": [
    {
      "assignmentId": 1,
      "workTaskId": 1,
      "userId": 1,
      "assignedRole": "Leader Staff",
      "fieldStatus": "pending",
      "fullName": "Nguyễn Văn A"
    }
  ]
}
```

### 7. `POST /api/v1/tasks/:id/assignments`
- **Use Case:** UC 2.15.2 - Assign Work Task for Staff
- **Description:** Assigns staff members to a specific task.
- **Business Rules:**
  - BR-53-06: Must identify responsible staff and roles.
  - BR-53-08: Assignment changes should trigger notification to affected staff (UC 2.3).
- **Request Body:**
```json
{
  "assignments": [
    {
      "userId": 1,
      "assignedRole": "Leader Staff"
    },
    {
      "userId": 2,
      "assignedRole": "Technical Staff"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-07",
  "message": "Đã phân công nhân viên và gửi thông báo."
}
```

### 8. `PUT /api/v1/tasks/:id`
- **Use Case:** UC 2.15.3 - Edit Work Task
- **Description:** Modifies a task.
- **Business Rules:**
  - BR-54-07: Executed tasks should not be modified, only updated with progress.
- **Request Body:**
```json
{
  "scheduledStart": "2026-10-14T09:00:00Z"
}
```

### 9. `PATCH /api/v1/tasks/:id/status`
- **Use Case:** UC 2.15.4 - Soft Delete / Cancel Task
- **Description:** Soft-deletes or cancels an unscheduled or draft task.
- **Business Rules:**
  - BR-55-07: Cannot delete if `status` is not `pending`. Returns `MSG-UC55-06`.
- **Request Body:**
```json
{
  "status": "cancelled"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SV-08",
  "message": "Xóa công việc thành công."
}
```
