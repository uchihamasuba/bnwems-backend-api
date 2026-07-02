# Operations & Field Work: Mobile Field Operations

## Overview
This module aggregates endpoints primarily consumed by the Mobile App for field operations.
It covers:
- **UC 2.18:** Field Operation Monitoring & Approval
- **UC 2.20:** Assigned Field Task Management
- **UC 2.21:** Equipment Pick-list Viewing
- **UC 2.22:** Survey Reporting
- **UC 2.25:** Field Progress Tracking
- **UC 2.26:** Handover Evidence Management
- **UC 2.28:** Damage/Loss Recording

## Standard Error Codes (SRS Mapping)
- `MSG-UC20-01`: Không tìm thấy công việc hoặc bị từ chối truy cập.
- `MSG-UC25-01`: Chuyển đổi trạng thái tiến độ không hợp lệ.
- `MSG-UC26-01`: Thiếu chữ ký khách hàng/bằng chứng cho việc bàn giao.
- `MSG-UC28-01`: Thiếu bằng chứng cho báo cáo hư hỏng/mất mát.

## Endpoints

### 1. `GET /api/v1/tasks/assigned`
- **Use Case:** UC 2.20 - View Assigned Tasks
- **Description:** Mobile staff views their assigned tasks.
- **Query Parameters:**
  - `date` (string, format YYYY-MM-DD, optional)
  - `status` (enum, optional) - pending, in_progress
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-01",
  "data": [
    {
      "workTaskId": 1,
      "orderId": 1,
      "taskType": "installation",
      "scheduledStart": "2026-10-14T08:00:00Z",
      "location": "123 Event Hall",
      "status": "pending",
      "progressPercent": 0,
      "fieldStatus": "pending"
    }
  ],
  "meta": { "totalCount": 5 }
}
```

### 2. `GET /api/v1/tasks/:id/pick-list`
- **Use Case:** UC 2.21 - View Pick List
- **Description:** Retrieves the pick-list of equipment for a specific task (preparation, delivery, etc.).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-02",
  "data": [
    {
      "equipmentItemId": 1,
      "itemName": "Standard Speaker",
      "quantity": 10
    }
  ]
}
```

### 3. `POST /api/v1/tasks/:id/survey-report`
- **Use Case:** UC 2.22 - Record Survey Report
- **Description:** Leader staff uploads survey details and images from the field.
- **Business Rules:**
  - BR-22-01: Must include at least one photo evidence.
- **Request Body:**
```json
{
  "notes": "Đã ghi nhận giới hạn chiều cao của địa điểm.",
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-MO-03",
  "message": "Đã gửi báo cáo khảo sát."
}
```

### 4. `PUT /api/v1/tasks/:id/progress`
- **Use Case:** UC 2.25 - Update Field Progress
- **Description:** Leader staff updates the progress status of a task.
- **Business Rules:**
  - BR-25-01: Updating to `in_progress` sets `actualStart`. Updating to `completed` sets `actualEnd`.
  - BR-25-02: `progressPercent` can be updated continuously (0-100).
- **Request Body:**
```json
{
  "status": "in_progress",
  "progressPercent": 50,
  "notes": "Đã đến địa điểm, bắt đầu lắp đặt."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-04",
  "message": "Cập nhật tiến độ công việc thành công."
}
```

### 5. `GET /api/v1/orders/field-progress`
- **Use Case:** Field Task Progress Tracking
- **Description:** Xem timeline tiến độ xuất kho, vận chuyển, lắp đặt, bàn giao, thu hồi, hoàn kho theo đơn hàng.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-05",
  "data": [
    {
      "taskType": "preparation",
      "status": "completed",
      "updatedAt": "2026-10-14T10:00:00Z"
    },
    {
      "taskType": "delivery",
      "status": "in_progress",
      "updatedAt": "2026-10-14T11:30:00Z"
    }
  ]
}
```

### 6. `GET /api/v1/orders/:id/mobile-summary`
- **Use Case:** Order Status Checking
- **Description:** Gom trạng thái đơn hàng, thanh toán, và vận hành phục vụ cho màn hình tổng quan đơn của mobile.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-06",
  "data": {
    "orderId": 1,
    "orderNumber": "ORD-2026-0001",
    "status": "in_progress",
    "paymentStatus": "deposit_paid",
    "fieldOperationStatus": "delivery_in_progress",
    "nextAction": "Confirm Delivery"
  }
}
```

### 7. `POST /api/v1/orders/:id/handover`
- **Use Case:** UC 2.26 - Record Handover Evidence
- **Description:** Leader staff uploads handover photos and confirmation after setup.
- **Business Rules:**
  - BR-26-01: `customerAgreed` must be true and evidence must be provided.
- **Request Body:**
```json
{
  "customerAgreed": true,
  "notes": "Khách hàng đã ký nghiệm thu.",
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-MO-07",
  "message": "Tạo biên bản bàn giao thành công."
}
```

### 8. `POST /api/v1/orders/:id/damage-loss`
- **Use Case:** UC 2.28 - Record Damage/Loss Report
- **Description:** Leader staff records any damaged or lost items during collection/return.
- **Business Rules:**
  - BR-28-01: Must specify responsible party (customer or staff).
  - BR-28-02: Requires evidence.
- **Request Body:**
```json
{
  "reportDetails": {
    "items": [
      {
        "equipmentItemId": 1,
        "quantity": 1,
        "type": "damaged",
        "responsibleParty": "staff",
        "responsibleUserId": 1
      }
    ]
  },
  "evidences": [{ "fileUrl": "url-to-image" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-MO-09",
  "message": "Gửi báo cáo hư hỏng/mất mát thành công."
}
```
