# Sales & Customer Lifecycle: Order Lifecycle & Change Requests

## Overview
This module handles **UC 2.11 (Order Lifecycle Management)** and **UC 2.27 (Field Change Request Management)**.
It manages `Order` and `ChangeRequest` entities from creation to completion.

## Standard Error Codes (SRS Mapping)
- `MSG-UC11-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC11-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC11-04`: Không thể xác nhận đơn hàng khi chưa có báo giá được chấp nhận.
- `MSG-UC27-01`: Yêu cầu thay đổi cần được quản lý phê duyệt.

## 1. Order Lifecycle Management (UC 2.11)

### 1. `GET /api/v1/orders`
- **Use Case:** UC 2.11 - View Order List
- **Description:** Retrieves a paginated list of orders for operational processing. Manager/Staff access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `status` (enum, optional) - draft, confirmed, deposit_paid, in_progress, settlement_pending, completed, cancelled
  - `search` (string, optional) - searches `orderNumber`
  - `startDate`, `endDate` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-01",
  "data": [
    {
      "orderId": 1,
      "orderNumber": "ORD-2026-0001",
      "customerId": 1,
      "eventStartDate": "2026-10-15T00:00:00Z",
      "eventEndDate": "2026-10-16T00:00:00Z",
      "eventType": "wedding",
      "guestCount": 300,
      "venueAddress": "123 Event Hall",
      "status": "confirmed",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 45 }
}
```

### 2. `GET /api/v1/orders/:id`
- **Use Case:** UC 2.11 - View Order Details
- **Description:** Retrieves detailed order information including customer, quotation, and related operational data.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-02",
  "data": {
    "orderId": 1,
    "orderNumber": "ORD-2026-0001",
    "customerId": 1,
    "eventStartDate": "2026-10-15T00:00:00Z",
    "eventEndDate": "2026-10-16T00:00:00Z",
    "eventType": "wedding",
    "guestCount": 300,
    "venueAddress": "123 Event Hall",
    "status": "confirmed",
    "customer": {
      "fullName": "Jane Doe",
      "phone": "+198765432"
    },
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 3. `POST /api/v1/orders`
- **Use Case:** UC 2.11 - Create Order
- **Description:** Creates a new customer order in `draft` status.
- **Business Rules:**
  - BR-11-01: Auto-generates unique `orderNumber`.
  - BR-11-02: `eventDate` must be in the future.
- **Request Body:**
```json
{
  "customerId": 1,
  "eventStartDate": "2026-10-15T00:00:00Z",
  "eventEndDate": "2026-10-16T00:00:00Z",
  "eventType": "wedding",
  "guestCount": 300,
  "venueAddress": "123 Event Hall"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CO-03",
  "message": "Tạo đơn hàng thành công.",
  "data": { "orderId": 1, "orderNumber": "ORD-2026-0001" }
}
```

### 4. `PUT /api/v1/orders/:id/confirm`
- **Use Case:** UC 2.11 - Confirm Order
- **Description:** Confirms an order after quotation agreement and deposit payment. Triggers inventory reservation.
- **Business Rules:**
  - BR-11-03: System checks if there is an `accepted` quotation. Returns MSG-UC11-04 if missing.
  - BR-11-04: Transitions status to `confirmed`.
  - BR-11-05: System triggers automatic inventory reservation logic (UC 2.13).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-04",
  "message": "Xác nhận đơn hàng thành công.",
  "data": { "status": "confirmed" }
}
```

### 5. `PUT /api/v1/orders/:id/change-date`
- **Use Case:** UC 2.11 - Change Event Date
- **Description:** Changes the event date, rechecking inventory availability.
- **Business Rules:**
  - BR-11-06: Validates if `newEventStartDate` is available for all reserved items.
  - BR-11-07: Applies date change policy if applicable.
- **Request Body:**
```json
{
  "newEventStartDate": "2026-11-01T00:00:00Z",
  "newEventEndDate": "2026-11-02T00:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-05",
  "message": "Cập nhật ngày đơn hàng thành công."
}
```

### 6. `PUT /api/v1/orders/:id/close`
- **Use Case:** UC 2.11 - Confirm Order Closure
- **Description:** Reviews all final order data and closes the order.
- **Business Rules:**
  - BR-11-08: All payments, settlements, and inventory returns must be completed before closure.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-06",
  "message": "Đóng đơn hàng thành công.",
  "data": { "status": "completed" }
}
```

### 7. `GET /api/v1/orders/:id/evidences`
- **Use Case:** Evidence Viewing
- **Description:** Tổng hợp ảnh minh chứng theo đơn (khảo sát, thanh toán, hư hỏng, bàn giao, hoàn kho).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-07",
  "data": [
    {
      "evidenceId": 1,
      "type": "survey",
      "fileUrl": "https://storage.example.com/survey1.jpg",
      "createdAt": "2026-06-22T12:00:00Z"
    },
    {
      "evidenceId": 2,
      "type": "handover",
      "fileUrl": "https://storage.example.com/handover.jpg",
      "createdAt": "2026-10-15T18:00:00Z"
    }
  ]
}
```

### 8. `GET /api/v1/orders/:id/workflow-timeline`
- **Use Case:** View Order Timeline
- **Description:** Retrieves the timeline of workflow events for a specific order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-08",
  "data": [
    {
      "milestone": "ORDER_CREATED",
      "timestamp": "2026-06-22T10:00:00Z",
      "status": "completed"
    }
  ]
}
```

## 2. Field Change Request Management (UC 2.27)

### 14. `GET /api/v1/change-requests`
- **Use Case:** UC 2.27 - View Change Request List
- **Description:** Retrieves a paginated list of field change requests, primarily used to build the Manager's pending-approval queue.
- **Query Parameters:**
  - `orderId` (string, optional)
  - `status` (enum, optional) - pending, approved, rejected
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-09",
  "data": [
    {
      "changeRequestId": 1,
      "orderId": 1,
      "type": "add",
      "items": [
        {
          "equipmentItemId": 1,
          "equipmentItemName": "Bộ loa tiêu chuẩn",
          "equipmentItemCode": "SPK-001",
          "quantity": 2,
          "action": "add"
        }
      ],
      "status": "pending",
      "createdAt": "2026-06-24T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 2 }
}
```

### 15. `GET /api/v1/orders/:id/change-requests`
- **Use Case:** Change Request Approval (List)
- **Description:** Hiển thị danh sách phát sinh theo đơn hàng (queue phát sinh).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-10",
  "data": [
    {
      "changeRequestId": 1,
      "type": "add",
      "status": "pending",
      "createdAt": "2026-06-24T09:00:00Z"
    }
  ]
}
```

### 16. `GET /api/v1/change-requests/:id`
- **Use Case:** Change Request Approval (Detail)
- **Description:** Lấy chi tiết một yêu cầu thay đổi (phát sinh) cụ thể.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-11",
  "data": {
    "changeRequestId": 1,
    "orderId": 1,
    "type": "add",
    "items": [
      {
        "equipmentItemId": 1,
        "equipmentItemName": "Bộ loa tiêu chuẩn",
        "equipmentItemCode": "SPK-001",
        "quantity": 1,
        "action": "add"
      }
    ],
    "status": "pending",
    "createdAt": "2026-06-24T09:00:00Z",
    "updatedAt": "2026-06-24T09:00:00Z"
  }
}
```

### 17. `POST /api/v1/orders/:id/change-requests`
- **Use Case:** UC 2.27 - Record Change Request
- **Description:** Submits an on-site change request (add/remove items).
- **Request Body:**
```json
{
  "type": "add",
  "items": [
    { "equipmentItemId": 1, "quantity": 1, "action": "add" }
  ]
}
```
- **Payload Rules:**
  - `type`: Loại yêu cầu tổng thể (`add`, `remove`, `replace`).
  - `action`: Hành động cho từng thiết bị cụ thể. Với `type="replace"`, mảng `items` phải bao gồm cả thiết bị bị gỡ bỏ (`action="remove"`) và thiết bị thêm mới (`action="add"`).
  - *Note: Pricing adjustments are calculated automatically upon approval and added to the final settlement.*
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CO-12",
  "message": "Yêu cầu thay đổi đã được gửi để phê duyệt."
}
```

### 18. `PUT /api/v1/change-requests/:id/approve`
- **Use Case:** UC 2.27 - Approve Change Request
- **Description:** Approves or rejects a field change request.
- **Business Rules:**
  - BR-27-01: Approval updates `Settlement` additional fees or deductions.
- **Request Body:**
```json
{
  "status": "approved"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-13",
  "message": "Cập nhật trạng thái yêu cầu thay đổi thành công."
}
```
