# Inventory Management

## Overview
This module handles **UC 2.13 (Date-based Inventory Management)** and **UC 2.23 (Inventory Check-out Supervision)**.
It ensures equipment availability by date and manages checkout/return operations. Key entities involved are `Inventory` and `InventoryReport`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC13-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC13-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC13-04`: Không đủ hàng trong kho cho ngày yêu cầu.
- `MSG-UC23-01`: Các thiết bị đã quét không khớp với danh sách được giao.
- `MSG-UC23-02`: Phải trả lại thiết bị/vật tư trước khi xác nhận nhập kho.

## 1. Inventory Management (UC 2.13)

### 1. `GET /api/v1/inventory`
- **Use Case:** UC 2.13 - View Inventory
- **Description:** Retrieves a paginated list of inventory across warehouses.
- **Query Parameters:** 
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `equipmentItemId` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "inventoryId": "1",
      "equipmentItemId": "1",
      "totalQuantity": 100,
      "availableQuantity": 90,
      "reservedQuantity": 10,
      "damagedQuantity": 0
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1
  }
}
```

### 2. `POST /api/v1/inventory`
- **Use Case:** UC 2.13 - Adjust Inventory
- **Description:** Adds new inventory for an equipment item. Admin/Manager only.
- **Request Body:**
```json
{
  "equipmentItemId": 1,
  "availableQuantity": 100
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo kho thành công.",
  "data": {
    "inventoryId": "1",
    "equipmentItemId": "1",
    "totalQuantity": 100,
    "availableQuantity": 100,
    "reservedQuantity": 0,
    "damagedQuantity": 0
  }
}
```

### 3. `PUT /api/v1/inventory/:id`
- **Use Case:** UC 2.13 - Adjust Inventory
- **Description:** Manually adjusts inventory levels. Admin/Manager only.
- **Request Body:**
```json
{
  "availableQuantity": 90,
  "reservedQuantity": 10,
  "damagedQuantity": 0
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật kho thành công."
}
```

### 4. `GET /api/v1/inventory/availability`
- **Use Case:** UC 2.13 - Check Inventory Availability
- **Description:** Checks if sufficient inventory is available for a given event date, factoring in existing reservations.
- **Business Rules:**
  - BR-13-01: Available = Total - (Reserved + Damaged).
- **Query Parameters:** `?eventDate=2026-10-15&equipmentItemId=1`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-01",
  "data": {
    "equipmentItemId": 1,
    "isAvailable": true,
    "availableQuantityOnDate": 80
  }
}
```

### 5. `POST /api/v1/inventory/reserve`
- **Use Case:** UC 2.13 - Reserve Inventory
- **Description:** Reserves inventory for an order once it is confirmed.
- **Business Rules:**
  - BR-13-02: If quantity > available on the date, throw `MSG-UC13-04`.
  - BR-13-03: Successfully reserved items increase the `reservedQuantity` and decrease `availableQuantity`.
- **Request Body:**
```json
{
  "orderId": 1,
  "items": [
    {
      "equipmentItemId": 1,
      "quantity": 5
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-02",
  "message": "Giữ chỗ kho thành công."
}
```

## 2. Check-out and Return Operations (UC 2.23)

### 6. `GET /api/v1/inventory/inventory-reports`
- **Use Case:** UC 2.23 - View Inventory Reports
- **Description:** Retrieves a history of inventory operations (checkout, return, adjustments).
- **Query Parameters:**
  - `reportType` (enum, optional) - checkout, return, adjustment, damage_loss
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-03",
  "data": [
    {
      "inventoryReportId": 1,
      "orderId": 1,
      "reportType": "checkout",
      "reportedBy": 1,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 45 }
}
```

### 7. `POST /api/v1/inventory/checkout`
- **Use Case:** UC 2.23 - Confirm Inventory Check-out
- **Description:** Records an inventory checkout operation, decreasing `reservedQuantity`, but `totalQuantity` remains the same until items are lost. Generates an `InventoryReport`.
- **Business Rules:**
  - BR-23-01: The items checked out must exactly match the confirmed `Order` items or valid pick-list. If mismatch, return `MSG-UC23-01`.
- **Request Body:**
```json
{
  "orderId": 1,
  "items": [
    {
      "equipmentItemId": 1,
      "quantity": 10
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-04",
  "message": "Xuất kho thành công."
}
```

### 8. `POST /api/v1/inventory/return`
- **Use Case:** UC 2.23 - Confirm Inventory Return Report
- **Description:** Records the return of inventory back to the warehouse after an event. Generates an `InventoryReport`.
- **Business Rules:**
  - BR-23-03: Increases `availableQuantity`.
  - BR-23-04: If condition is DAMAGED, the quantity is added to `damagedQuantity` instead.
- **Request Body:**
```json
{
  "orderId": 1,
  "items": [
    {
      "equipmentItemId": 1,
      "quantity": 10,
      "condition": "good"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-05",
  "message": "Nhập lại kho thành công."
}
```

### 9. `GET /api/v1/warehouse-histories`
- **Use Case:** UC 2.23 - View Warehouse History
- **Description:** Retrieves the detailed history of warehouse transactions (checkout, return, adjustment).
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `transactionType` (enum, optional) - CHECKOUT, RETURN, ADJUSTMENT
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-06",
  "data": [
    {
      "id": "1",
      "warehouseId": "1",
      "transactionType": "CHECKOUT",
      "performedBy": "1",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 1 }
}
```
