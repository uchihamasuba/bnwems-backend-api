# Master Data & Policies: Catalog Management

## Overview
This module handles **UC 2.5 (Master & Reference Data Management)** specifically for `CatalogItem` entity.
It manages services, equipment, materials, and packages used in orders.

## Standard Error Codes (SRS Mapping)
- `MSG-UC05-01`: Required information is missing or invalid.
- `MSG-UC05-02`: System cannot complete the request.
- `MSG-UC05-03`: You do not have permission to perform this action.
- `MSG-UC05-04`: Cannot deactivate item; it is currently tied to an active order.

## Endpoints

### `GET /api/v1/catalog-items`
- **Use Case:** UC 2.5 - View Equipment Catalog
- **Description:** Retrieves a paginated list of catalog items.
- **Query Parameters:** 
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches by name
  - `itemType` (enum, optional) - SERVICE, EQUIPMENT, MATERIAL, PACKAGE
  - `isActive` (boolean, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-uuid",
      "name": "Standard Speaker Set",
      "description": "High quality speakers",
      "itemType": "EQUIPMENT",
      "basePrice": 150.00,
      "isActive": true,
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

### `GET /api/v1/catalog-items/:id`
- **Use Case:** UC 2.5 - View Equipment Details
- **Description:** Retrieves details for a specific catalog item.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "item-uuid",
    "name": "Standard Speaker Set",
    "description": "High quality speakers",
    "itemType": "EQUIPMENT",
    "basePrice": 150.00,
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### `POST /api/v1/catalog-items`
- **Use Case:** UC 2.5 - Create Equipment
- **Description:** Creates a new catalog item. Admin access required.
- **Business Rules:**
  - BR-05-01: Base price must be a positive number.
  - BR-05-02: Item type must be selected from standard enums.
  - BR-05-03: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "Premium Lighting Setup",
  "description": "Full LED lighting for large events",
  "itemType": "EQUIPMENT",
  "basePrice": 300.00
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Catalog item created successfully.",
  "data": {
    "id": "new-uuid",
    "name": "Premium Lighting Setup",
    "itemType": "EQUIPMENT",
    "basePrice": 300.00,
    "isActive": true
  }
}
```

### `PUT /api/v1/catalog-items/:id`
- **Use Case:** UC 2.5 - Update Equipment
- **Description:** Updates information for an existing catalog item. Admin access required.
- **Business Rules:**
  - BR-05-04: Changing the price does not affect historical quotations or confirmed orders.
  - BR-05-05: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "Premium Lighting Setup v2",
  "description": "Updated lighting specs",
  "basePrice": 350.00
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Catalog item updated successfully."
}
```

### `PUT /api/v1/catalog-items/:id/deactivate`
- **Use Case:** UC 2.5 - Deactivate Equipment
- **Description:** Deactivates a catalog item without deleting it, keeping historical integrity for orders.
- **Business Rules:**
  - BR-05-06: An item cannot be deactivated if it is part of an active order not yet completed. Return `MSG-UC05-04`.
- **Request Body:**
```json
{
  "isActive": false
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Catalog item status changed successfully."
}
```
