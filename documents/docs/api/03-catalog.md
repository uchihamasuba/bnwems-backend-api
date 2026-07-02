# Master Data & Policies: Equipment (Catalog) Management

## Overview
This module handles **UC 2.5 (Master & Reference Data Management)** specifically for the `Equipment` entity (formerly `CatalogItem`).
It manages services, equipment, materials, and packages used in orders.

## Standard Error Codes (SRS Mapping)
- `MSG-UC05-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC05-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC05-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC05-04`: Không thể vô hiệu hóa thiết bị; thiết bị hiện đang liên kết với một đơn hàng đang hoạt động.

## Endpoints

### 1. `GET /api/v1/equipment`
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
  "code": "MSG-CT-01",
  "data": [
    {
      "equipmentItemId": 1,
      "code": "SPK-001",
      "name": "Bộ loa tiêu chuẩn",
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

### 2. `GET /api/v1/equipment/:id`
- **Use Case:** UC 2.5 - View Equipment Details
- **Description:** Retrieves details for a specific equipment item.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-02",
  "data": {
    "equipmentItemId": 1,
    "code": "SPK-001",
    "name": "Bộ loa tiêu chuẩn",
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

### 3. `POST /api/v1/equipment`
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
  "name": "Bộ đèn cao cấp",
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
  "code": "MSG-CT-03",
  "message": "Tạo thiết bị thành công.",
  "data": {
    "equipmentItemId": 2,
    "code": "LIGHT-001",
    "name": "Bộ đèn cao cấp",
    "rentalPrice": 300000.00,
    "status": "active"
  }
}
```

### 4. `PUT /api/v1/equipment/:id`
- **Use Case:** UC 2.5 - Update Equipment
- **Description:** Updates information for an existing equipment item. Admin/Manager access required.
- **Business Rules:**
  - BR-05-04: Changing the price does not affect historical quotations or confirmed orders.
  - BR-05-05: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "Bộ đèn cao cấp v2",
  "rentalPrice": 350000.00,
  "replacementValue": 5500000.00
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-04",
  "message": "Cập nhật thiết bị thành công."
}
```

### 5. `PATCH /api/v1/equipment/:id/status`
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
  "code": "MSG-CT-05",
  "message": "Thay đổi trạng thái thiết bị thành công."
}
```


## 2. Legacy Catalog Categories (Frontend Compatibility)

### 6. `GET /api/v1/catalog-categories`
- **Use Case:** View Catalog Categories
- **Description:** Retrieves a paginated list of catalog categories. Retained for frontend compatibility.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional)
  - `isActive` (boolean, optional) - 'true' or 'false'
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Category Name",
      "description": "Category Description",
      "displayOrder": 1,
      "notes": "Some notes",
      "isActive": true,
      "totalEquipment": 5,
      "createdAt": "2026-06-22T10:00:00Z",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 1 }
}
```

### 7. `GET /api/v1/catalog-categories/:id`
- **Use Case:** View Catalog Category Details
- **Description:** Retrieves details for a specific catalog category.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Category Name",
    "description": "Category Description",
    "displayOrder": 1,
    "notes": "Some notes",
    "isActive": true,
    "totalEquipment": 5,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 8. `POST /api/v1/catalog-categories`
- **Use Case:** Create Catalog Category
- **Description:** Creates a new catalog category. Admin/Manager access required.
- **Request Body:**
```json
{
  "name": "New Category",
  "description": "Description here",
  "displayOrder": 2,
  "notes": "Optional notes"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Catalog category created successfully",
  "data": {
    "categoryId": "2",
    "name": "New Category",
    "description": "Description here",
    "displayOrder": 2,
    "notes": "Optional notes",
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 9. `PUT /api/v1/catalog-categories/:id`
- **Use Case:** Update Catalog Category
- **Description:** Updates information for an existing catalog category. Admin/Manager access required.
- **Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated Description",
  "displayOrder": 3,
  "notes": "Updated notes"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Catalog category updated successfully",
  "data": {
    "categoryId": "1",
    "name": "Updated Category",
    "description": "Updated Description",
    "displayOrder": 3,
    "notes": "Updated notes",
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:05:00Z"
  }
}
```

### 10. `PUT /api/v1/catalog-categories/:id/deactivate`
- **Use Case:** Deactivate Catalog Category
- **Description:** Updates a catalog category's status (isActive). Admin/Manager access required.
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
  "message": "Catalog category status updated successfully"
}
```

## 3. Legacy Catalog Items (Frontend Compatibility)

### 11. `GET /api/v1/catalog-items`
- **Use Case:** View Catalog Items
- **Description:** Retrieves a paginated list of catalog items. Retained for frontend compatibility.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional)
  - `itemType` (enum, optional) - SERVICE, EQUIPMENT, MATERIAL, PACKAGE
  - `categoryId` (string, optional)
  - `isActive` (boolean, optional) - 'true' or 'false'
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Item Name",
      "description": "Item Description",
      "itemType": "EQUIPMENT",
      "basePrice": 150000,
      "categoryId": "1",
      "isActive": true,
      "createdAt": "2026-06-22T10:00:00Z",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 1 }
}
```

### 12. `GET /api/v1/catalog-items/:id`
- **Use Case:** View Catalog Item Details
- **Description:** Retrieves details for a specific catalog item.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Item Name",
    "description": "Item Description",
    "itemType": "EQUIPMENT",
    "basePrice": 150000,
    "categoryId": "1",
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 13. `POST /api/v1/catalog-items`
- **Use Case:** Create Catalog Item
- **Description:** Creates a new catalog item. Admin/Manager access required.
- **Request Body:**
```json
{
  "name": "New Equipment",
  "description": "Description here",
  "itemType": "EQUIPMENT",
  "basePrice": 100000,
  "categoryId": "1"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Catalog item created successfully",
  "data": {
    "itemId": "2",
    "name": "New Equipment",
    "description": "Description here",
    "itemType": "EQUIPMENT",
    "basePrice": 100000,
    "categoryId": "1",
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 14. `PUT /api/v1/catalog-items/:id`
- **Use Case:** Update Catalog Item
- **Description:** Updates a catalog item. `itemType` is usually immutable after creation. Admin/Manager access required.
- **Request Body:**
```json
{
  "name": "Updated Equipment",
  "description": "Updated Description",
  "basePrice": 120000,
  "categoryId": "1"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Catalog item updated successfully",
  "data": {
    "itemId": "1",
    "name": "Updated Equipment",
    "description": "Updated Description",
    "itemType": "EQUIPMENT",
    "basePrice": 120000,
    "categoryId": "1",
    "isActive": true,
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:05:00Z"
  }
}
```

### 15. `PUT /api/v1/catalog-items/:id/deactivate`
- **Use Case:** Deactivate Catalog Item
- **Description:** Updates a catalog item's status. Admin/Manager access required.
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
  "message": "Catalog item status updated successfully"
}
```
