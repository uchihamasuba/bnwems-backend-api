# Master Data & Policies: Equipment (Catalog) Management

## Overview
This module handles **UC 2.5 (Master & Reference Data Management)** specifically for the `Equipment` entity (formerly `CatalogItem`).
It manages services, equipment, materials, and packages used in orders.

## Standard Error Codes (SRS Mapping)
- `MSG-UC05-01`: Required information is missing or invalid.
- `MSG-UC05-02`: System cannot complete the request.
- `MSG-UC05-03`: You do not have permission to perform this action.
- `MSG-UC05-04`: Cannot deactivate item; it is currently tied to an active order.

## Endpoints

### `GET /api/v1/equipment`
- **Use Case:** UC 2.5 - View Equipment Catalog
- **Description:** Retrieves a paginated list of equipment items.
- **Query Parameters:** 
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches by name or code
  - `category` (string, optional)
  - `status` (enum, optional) - active, inactive
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-00",
  "data": [
    {
      "equipmentItemId": 1,
      "code": "SPK-001",
      "name": "Standard Speaker Set",
      "category": "Âm thanh",
      "unit": "bộ",
      "rentalPrice": 150000.00,
      "costPrice": 100000.00,
      "replacementValue": 2500000.00,
      "status": "active",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 50
  }
}
```

### `GET /api/v1/equipment/:id`
- **Use Case:** UC 2.5 - View Equipment Details
- **Description:** Retrieves details for a specific equipment item.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-00",
  "data": {
    "equipmentItemId": 1,
    "code": "SPK-001",
    "name": "Standard Speaker Set",
    "category": "Âm thanh",
    "unit": "bộ",
    "rentalPrice": 150000.00,
    "costPrice": 100000.00,
    "replacementValue": 2500000.00,
    "status": "active",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### `POST /api/v1/equipment`
- **Use Case:** UC 2.5 - Create Equipment
- **Description:** Creates a new equipment item. Admin/Manager access required.
- **Business Rules:**
  - BR-05-01: Rental price and replacement value must be positive numbers.
  - BR-05-02: Code must be unique.
  - BR-05-03: Log to `AuditLog`.
- **Request Body:**
```json
{
  "code": "LIGHT-001",
  "name": "Premium Lighting Setup",
  "category": "Ánh sáng",
  "unit": "bộ",
  "rentalPrice": 300000.00,
  "costPrice": 200000.00,
  "replacementValue": 5000000.00
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CT-00",
  "message": "Equipment created successfully.",
  "data": {
    "equipmentItemId": 2,
    "code": "LIGHT-001",
    "name": "Premium Lighting Setup",
    "rentalPrice": 300000.00,
    "status": "active"
  }
}
```

### `PUT /api/v1/equipment/:id`
- **Use Case:** UC 2.5 - Update Equipment
- **Description:** Updates information for an existing equipment item. Admin/Manager access required.
- **Business Rules:**
  - BR-05-04: Changing the price does not affect historical quotations or confirmed orders.
  - BR-05-05: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "Premium Lighting Setup v2",
  "rentalPrice": 350000.00,
  "replacementValue": 5500000.00
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-00",
  "message": "Equipment updated successfully."
}
```

### `PATCH /api/v1/equipment/:id/status`
- **Use Case:** UC 2.4 - Disable Equipment
- **Description:** Deactivates an equipment item without deleting it, keeping historical integrity for orders.
- **Business Rules:**
  - BR-05-06: An item cannot be deactivated if it is part of an active order not yet completed. Return `MSG-UC05-04`.
- **Request Body:**
```json
{
  "status": "inactive"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-00",
  "message": "Equipment status changed successfully."
}
```
