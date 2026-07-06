# Operations & Field Work: Mobile Field Operations

## Overview
This module aggregates endpoints primarily consumed by the Mobile App for field operations.
It covers:
- **UC 2.20:** Assigned Field Task Management (SchedulePlan)
- **UC 2.21:** Equipment Pick-list Viewing (OrderItem)
- **UC 2.25:** Field Progress Tracking (SchedulePlan Status)
- **UC 2.26:** Handover Evidence Management (Evidence)
- **UC 2.28:** Damage/Loss Recording (CollectedEquipmentReport)

## Standard Error Codes (SRS Mapping)
- `MSG-UC20-01`: Không tìm thấy phân công hoặc bị từ chối truy cập.
- `MSG-UC25-01`: Chuyển đổi trạng thái tiến độ không hợp lệ.
- `MSG-UC26-01`: Thiếu chữ ký khách hàng/bằng chứng cho việc bàn giao.
- `MSG-UC28-01`: Thiếu bằng chứng cho báo cáo thu hồi.

---

## 1. Assigned Tasks & Progress (UC 2.20, UC 2.25)

### 1. `GET /api/v1/mobile/schedule-plans`
- **Use Case:** UC 2.20 - View Assigned Tasks
- **Description:** Mobile staff views their assigned schedule plans.
- **Query Parameters:**
  - `date` (string, format YYYY-MM-DD, optional)
  - `status` (enum, optional) - Chờ xử lý, Đã xác nhận, Đang thực hiện
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-01",
  "data": [
    {
      "planId": 1,
      "orderId": 100,
      "taskName": "Lắp đặt sự kiện",
      "startTime": "2026-10-14T08:00:00Z",
      "endTime": "2026-10-14T12:00:00Z",
      "location": "123 Event Hall",
      "status": "Chờ xử lý"
    }
  ]
}
```

### 2. `PUT /api/v1/mobile/schedule-plans/:id/status`
- **Use Case:** UC 2.25 - Update Field Progress
- **Description:** Staff updates the status of their assigned plan.
- **Business Rules:**
  - BR-25-01: Update status to `Đang thực hiện` when starting, `Hoàn thành` when finished.
- **Request Body:**
```json
{
  "status": "Đang thực hiện",
  "notes": "Đã đến địa điểm, bắt đầu lắp đặt."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-02",
  "message": "Cập nhật tiến độ công việc thành công."
}
```

---

## 2. Order Information & Pick List (UC 2.21)

### 3. `GET /api/v1/mobile/orders/:id`
- **Use Case:** Order Status Checking & Pick-list Viewing
- **Description:** Mobile staff views order details and the equipment list to verify items.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-MO-03",
  "data": {
    "orderId": 100,
    "orderCode": "ORD-001",
    "eventName": "Đám cưới Minh & Lan",
    "location": "123 Event Hall",
    "items": [
      {
        "itemId": 1,
        "itemName": "Loa JBL",
        "quantity": 2,
        "preparedQty": 2,
        "source": "Kho nội bộ"
      }
    ]
  }
}
```

---

## 3. Handover & Return Reports (UC 2.26, UC 2.28)

### 4. `POST /api/v1/mobile/schedule-plans/:id/handover`
- **Use Case:** UC 2.26 - Record Handover Evidence
- **Description:** Staff uploads handover photos and confirmation after setup. This updates the `evidenceId` in `SchedulePlan` and marks it `Hoàn thành`.
- **Request Body:**
```json
{
  "notes": "Khách hàng đã ký nghiệm thu.",
  "evidenceId": 10
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-MO-04",
  "message": "Tạo biên bản bàn giao thành công."
}
```

### 5. `POST /api/v1/mobile/orders/:id/collected-reports`
- **Use Case:** UC 2.28 - Record Damage/Loss Report (Thu hồi thiết bị)
- **Description:** Leader staff records collected items, including damaged or lost quantities, when tearing down an event.
- **Business Rules:**
  - BR-28-01: Creates a `CollectedEquipmentReport` which later affects Inventory and Settlement.
- **Request Body:**
```json
{
  "reportType": "Kho công ty",
  "notes": "Đã thu hồi xong, có hư hỏng nhẹ.",
  "items": [
    {
      "itemId": 1,
      "goodQuantity": 1,
      "damagedQuantity": 1,
      "lostQuantity": 0
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-MO-05",
  "message": "Gửi báo cáo thu hồi/hư hỏng thành công."
}
```
