# Inventory & Warehouse Management

## Overview
This module handles **UC 2.13 (Date-based Inventory Management)** and **UC 2.23 (Warehouse Check-out Supervision)**.
It ensures equipment availability by date and manages checkout operations. Key entities involved are `Warehouse`, `Inventory`, and `WarehouseHistory`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC13-01`: Required information is missing or invalid.
- `MSG-UC13-02`: System cannot complete the request.
- `MSG-UC13-04`: Insufficient inventory available for the requested date.
- `MSG-UC23-01`: Scanned items do not match the assigned pick-list.
- `MSG-UC23-02`: Items must be returned before confirming warehouse return.

## 1. Inventory Management (UC 2.13)

### `GET /api/v1/inventory`
- **Use Case:** UC 2.13 - View Inventory
- **Description:** Retrieves the current stock levels in the warehouse.
- **Query Parameters:**
  - `warehouseId` (string, optional)
  - `catalogItemId` (string, optional)
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv-uuid",
      "warehouseId": "warehouse-uuid",
      "catalogItemId": "item-uuid",
      "availableQuantity": 100,
      "reservedQuantity": 20,
      "checkedOutQuantity": 10,
      "damagedQuantity": 2,
      "lostQuantity": 0,
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
  - BR-13-01: Available = Total - (Reserved + CheckedOut + Damaged + Lost).
- **Query Parameters:** `?eventDate=2026-10-15&itemId=item-uuid`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "catalogItemId": "item-uuid",
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
  - BR-13-03: Successfully reserved items increase the `reservedQuantity`.
- **Request Body:**
```json
{
  "orderId": "order-uuid",
  "items": [
    {
      "catalogItemId": "item-uuid",
      "quantity": 5
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Inventory successfully reserved."
}
```

## 2. Warehouse Operations (UC 2.23)

### `GET /api/v1/warehouse-histories`
- **Use Case:** UC 2.23 - View Warehouse Transactions
- **Description:** Retrieves a history of warehouse transactions (checkout, return, adjustments).
- **Query Parameters:**
  - `transactionType` (enum, optional) - CHECKOUT, RETURN, ADJUSTMENT
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx-uuid",
      "warehouseId": "warehouse-uuid",
      "transactionType": "CHECKOUT",
      "performedBy": "user-uuid",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 45 }
}
```

### `POST /api/v1/warehouse/checkout`
- **Use Case:** UC 2.23 - Confirm Inventory Check-out
- **Description:** Records an inventory checkout operation, reducing available quantity and logging to `WarehouseHistory`.
- **Business Rules:**
  - BR-23-01: The items checked out must exactly match the confirmed `Order` items or valid pick-list. If mismatch, return `MSG-UC23-01`.
  - BR-23-02: Decreases `reservedQuantity` and increases `checkedOutQuantity`.
- **Request Body:**
```json
{
  "warehouseId": "warehouse-uuid",
  "orderId": "order-uuid",
  "items": [
    {
      "catalogItemId": "item-uuid",
      "quantity": 10
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Items checked out successfully."
}
```

### `POST /api/v1/warehouse/return`
- **Use Case:** UC 2.23 - Confirm Inventory Return Report
- **Description:** Records the return of inventory back to the warehouse after an event.
- **Business Rules:**
  - BR-23-03: Decreases `checkedOutQuantity` and increases `availableQuantity`.
  - BR-23-04: If condition is DAMAGED, the quantity is added to `damagedQuantity` instead, triggering a Damage/Loss Report (UC 2.28).
- **Request Body:**
```json
{
  "warehouseId": "warehouse-uuid",
  "orderId": "order-uuid",
  "items": [
    {
      "catalogItemId": "item-uuid",
      "quantity": 10,
      "condition": "GOOD"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Items returned to warehouse."
}
```
