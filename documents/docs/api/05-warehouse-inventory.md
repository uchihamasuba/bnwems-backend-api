# Inventory Management

## Overview
This module handles **UC 2.13 (Inventory Management)** and **UC 2.23 (Inventory Check-out & Return Operations)**.
It ensures equipment availability by date, manages preparation for orders, and records checkout/return operations. Key entities involved are `Inventory`, `InventoryMovement`, `CollectedEquipmentReport`, and `OrderItem` (for preparation tracking).

## Standard Error Codes (SRS Mapping)
- `MSG-UC13-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC13-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC13-04`: Không đủ hàng trong kho.
- `MSG-UC23-01`: Các thiết bị xuất/nhập không khớp với danh sách được giao.

---

## 1. Inventory View & Adjustments (UC 2.13)

### 1. `GET /api/v1/inventory`
- **Use Case:** UC 2.13 - View Inventory
- **Description:** Retrieves a paginated list of inventory for items.
- **Query Parameters:** 
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `itemId` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-01",
  "data": [
    {
      "inventoryId": 1,
      "itemId": 1,
      "itemName": "Loa JBL",
      "quantityTotal": 100,
      "quantityAvailable": 90,
      "quantityReserved": 10,
      "quantityDamaged": 0
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 1 }
}
```

### 2. `POST /api/v1/inventory/adjust`
- **Use Case:** UC 2.13 - Manual Inventory Adjustment
- **Description:** Manually adjusts inventory levels (creates an `ADJUSTMENT` movement). Admin/Manager only.
- **Request Body:**
```json
{
  "itemId": 1,
  "quantityChange": 5,
  "notes": "Nhập thêm hàng mới"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-02",
  "message": "Điều chỉnh kho thành công."
}
```

### 3. `GET /api/v1/inventory/movements`
- **Use Case:** UC 2.13 - View Inventory Movement History
- **Description:** Retrieves history of inventory transactions.
- **Query Parameters:**
  - `itemId` (optional)
  - `movementType` (enum, optional) - Xuất kho, Nhập kho, Điều chỉnh
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-03",
  "data": [
    {
      "movementId": 1,
      "itemId": 1,
      "movementType": "Điều chỉnh",
      "quantity": 5,
      "performedBy": 1,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ]
}
```

---

## 2. Order Preparation & Check-out Operations (UC 2.23)

### 4. `PUT /api/v1/orders/:id/prepare`
- **Use Case:** UC 2.23 - Prepare Order Items
- **Description:** Warehouse staff records the quantity they have prepared for a specific order. Updates `prepared_qty` and `prepared_by` on `OrderItem`.
- **Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "preparedQty": 10
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-04",
  "message": "Cập nhật số lượng chuẩn bị thành công."
}
```

### 5. `POST /api/v1/orders/:id/checkout`
- **Use Case:** UC 2.23 - Confirm Inventory Check-out (Xuất kho)
- **Description:** Formally checks out items for an order. It generates `OUTBOUND` movements in `InventoryMovement`, decreases `quantityReserved`, and may decrease `quantityTotal`.
- **Request Body:**
```json
{
  "items": [
    {
      "itemId": 1,
      "quantity": 10
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-05",
  "message": "Xuất kho cho đơn hàng thành công."
}
```

---

## 3. Inventory Return Operations (UC 2.23)

*Note: Returns from events are managed via `CollectedEquipmentReport`. When a report of type `Kho công ty` is confirmed, it generates `INBOUND` movements.*

### 6. `POST /api/v1/inventory/return-reports`
- **Use Case:** UC 2.23 - Submit Return Report
- **Description:** Staff submits a report of collected equipment returning to the company warehouse.
- **Request Body:**
```json
{
  "orderId": 100,
  "reportType": "Kho công ty",
  "notes": "Trả hàng sau sự kiện",
  "items": [
    {
      "itemId": 1,
      "goodQuantity": 9,
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
  "code": "MSG-WH-06",
  "message": "Đã tạo báo cáo thu hồi thiết bị."
}
```

### 7. `PUT /api/v1/inventory/return-reports/:id/confirm`
- **Use Case:** UC 2.23 - Confirm Return Report
- **Description:** Warehouse manager confirms the return report. This triggers the creation of `INBOUND` movements, updating `quantityTotal` and `quantityDamaged`.
- **Request Body:** None
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-07",
  "message": "Đã xác nhận báo cáo và nhập kho thành công."
}
```
