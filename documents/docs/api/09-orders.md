# Sales & Customer Lifecycle: Order Lifecycle & Warnings

## Overview
This module handles **UC 2.11 (Order Lifecycle Management)**.
It manages `Order` records, their `OrderItem`s, and `OrderWarning`s from creation to completion. Field changes and alerts are managed via the Order Warning system and direct Order Item adjustments, replacing the old Change Request workflow.

## Standard Error Codes (SRS Mapping)
- `MSG-UC11-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC11-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC11-04`: Không thể xác nhận đơn hàng khi chưa có báo giá được chấp nhận.

---

## 1. Order Lifecycle Management (UC 2.11)

### 1. `GET /api/v1/orders`
- **Use Case:** UC 2.11 - View Order List
- **Description:** Retrieves a paginated list of orders for operational processing.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `orderStatus` (enum, optional) - Mới, Đã xác nhận, Đang thực hiện, Hoàn thành, Đã hủy
  - `paymentStatus` (enum, optional) - Chưa thanh toán, Đã cọc, Đã thanh toán
  - `search` (string, optional) - searches `orderCode`, `eventName`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-01",
  "data": [
    {
      "orderId": 1,
      "orderCode": "ORD-001",
      "customerId": 1,
      "eventName": "Đám cưới Minh & Lan",
      "eventDate": "2026-10-15T00:00:00Z",
      "eventType": "Tiệc cưới",
      "location": "123 Event Hall",
      "paymentStatus": "Chưa thanh toán",
      "orderStatus": "Mới",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 45 }
}
```

### 2. `GET /api/v1/orders/:id`
- **Use Case:** UC 2.11 - View Order Details
- **Description:** Retrieves detailed order information including items, customer, and associated quotation.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-02",
  "data": {
    "orderId": 1,
    "orderCode": "ORD-001",
    "customerId": 1,
    "quotationId": 5,
    "policyId": 2,
    "eventName": "Đám cưới Minh & Lan",
    "eventType": "Tiệc cưới",
    "eventDate": "2026-10-15T00:00:00Z",
    "location": "123 Event Hall",
    "guestCount": 300,
    "totalAmount": 50000000.00,
    "paymentStatus": "Chưa thanh toán",
    "orderStatus": "Mới",
    "items": [
      {
        "orderItemId": 10,
        "itemId": 1,
        "itemName": "Loa JBL",
        "quantity": 2,
        "unitPrice": 750000.00,
        "subtotal": 1500000.00,
        "source": "Kho nội bộ",
        "preparedQty": 0
      }
    ]
  }
}
```

### 3. `POST /api/v1/orders`
- **Use Case:** UC 2.11 - Create Order
- **Description:** Creates a new customer order. Can be created directly or from a confirmed Quotation.
- **Business Rules:**
  - BR-11-01: Auto-generates unique `orderCode`.
- **Request Body:**
```json
{
  "customerId": 1,
  "quotationId": 5,
  "policyId": 2,
  "eventName": "Đám cưới Minh & Lan",
  "eventType": "Tiệc cưới",
  "eventDate": "2026-10-15T00:00:00Z",
  "location": "123 Event Hall",
  "guestCount": 300,
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "unitPrice": 750000.00,
      "source": "Kho nội bộ"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CO-03",
  "message": "Tạo đơn hàng thành công.",
  "data": { "orderId": 1, "orderCode": "ORD-001" }
}
```

### 4. `PUT /api/v1/orders/:id/status`
- **Use Case:** UC 2.11 - Update Order Status
- **Description:** Updates the order status (e.g. from Mới to Đã xác nhận).
- **Request Body:**
```json
{
  "orderStatus": "Đã xác nhận",
  "notes": "Đã nhận cọc và duyệt hợp đồng"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-04",
  "message": "Cập nhật trạng thái đơn hàng thành công."
}
```

### 5. `PUT /api/v1/orders/:id/items`
- **Use Case:** Update Order Items (Field Changes)
- **Description:** Updates the items for an order. If an order is already in progress, changes may reflect on-site requests.
- **Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "quantity": 3,
      "unitPrice": 750000.00,
      "source": "Kho nội bộ"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-05",
  "message": "Cập nhật danh sách thiết bị thành công."
}
```

---

## 2. Order Warnings (Alerts & Field Issues)

### 6. `GET /api/v1/orders/:id/warnings`
- **Use Case:** View Order Warnings
- **Description:** Retrieves the list of warnings or alerts submitted for a specific order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-06",
  "data": [
    {
      "warningId": 1,
      "orderId": 1,
      "content": "Khách yêu cầu thêm 1 màn chiếu",
      "isResolved": false,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ]
}
```

### 7. `POST /api/v1/orders/:id/warnings`
- **Use Case:** Submit Order Warning
- **Description:** Field staff can submit a warning if there are on-site issues (e.g., changes requested by customer, site not ready).
- **Request Body:**
```json
{
  "content": "Khách yêu cầu thêm 1 màn chiếu"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CO-07",
  "message": "Tạo cảnh báo thành công."
}
```

### 8. `PUT /api/v1/warnings/:id/resolve`
- **Use Case:** Resolve Warning
- **Description:** Manager reviews the warning, takes necessary actions (e.g., updating order items or settlement), and marks it as resolved.
- **Request Body:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CO-08",
  "message": "Đã xử lý cảnh báo thành công."
}
```
