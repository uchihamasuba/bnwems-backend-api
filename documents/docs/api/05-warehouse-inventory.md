# Inventory Management

## Overview
This module handles **UC 2.13 (Date-based Inventory Management)** and **UC 2.23 (Inventory Check-out Supervision)**.
It ensures equipment availability by date and manages checkout/return operations. Key entities involved are `Inventory` and `InventoryReport`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC13-01`: Required information is missing or invalid.
- `MSG-UC13-02`: System cannot complete the request.
- `MSG-UC13-04`: Insufficient inventory available for the requested date.
- `MSG-UC23-01`: Scanned items do not match the assigned pick-list.
- `MSG-UC23-02`: Items must be returned before confirming inventory return.

## 1. Inventory Management (UC 2.13)

### `GET /api/v1/inventory`
- **Use Case:** UC 2.13 - View Inventory
- **Description:** Retrieves the current stock levels.
- **Query Parameters:**
  - `equipmentItemId` (string, optional)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-00",
  "data": [
    {
      "inventoryId": 1,
      "equipmentItemId": 1,
      "totalQuantity": 100,
      "availableQuantity": 80,
      "reservedQuantity": 18,
      "damagedQuantity": 2,
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 150 }
}
```

### `GET /api/v1/inventory/availability`
- **Use Case:** UC 2.13 - Check Inventory Availability
- **Description:** Checks if sufficient inventory is available for a given event date, factoring in existing reservations.
- **Business Rules:**
  - BR-13-01: Available = Total - (Reserved + Damaged).
- **Query Parameters:** `?eventDate=2026-10-15&equipmentItemId=1`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-WH-00",
  "data": {
    "equipmentItemId": 1,
    "isAvailable": true,
    "availableQuantityOnDate": 80
  }
}
```

### `POST /api/v1/inventory/reserve`
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
  "code": "MSG-WH-00",
  "message": "Inventory successfully reserved."
}
```

## 2. Check-out and Return Operations (UC 2.23)

### `GET /api/v1/inventory/inventory-reports`
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
  "code": "MSG-WH-00",
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

### `POST /api/v1/inventory/checkout`
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
  "code": "MSG-WH-00",
  "message": "Items checked out successfully."
}
```

### `POST /api/v1/inventory/return`
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
  "code": "MSG-WH-00",
  "message": "Items returned to inventory."
}
```
