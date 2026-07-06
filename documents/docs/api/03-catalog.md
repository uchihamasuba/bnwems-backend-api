# Master Data: Catalog Management

## Overview
This module handles **UC 2.5 (Master & Reference Data Management)** specifically for the `ItemCategory`, `ItemType`, `Item`, and `ItemTypeSpec` entities.
It manages the hierarchical structure of services, equipment, and packages used in orders.

## Standard Error Codes (SRS Mapping)
- `MSG-UC05-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC05-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC05-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC05-04`: Không thể vô hiệu hóa thiết bị; thiết bị hiện đang liên kết với một đơn hàng đang hoạt động.
- `MSG-UC05-05`: Mã thiết bị hoặc tên danh mục đã tồn tại.

---

## 1. Item Category (Danh mục chính)

### 1. `GET /api/v1/catalog/categories`
- **Use Case:** View Categories
- **Description:** Retrieves a paginated list of top-level item categories.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-01",
  "data": [
    {
      "categoryId": 1,
      "categoryName": "Âm thanh",
      "description": "Các thiết bị âm thanh"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 5 }
}
```

### 2. `POST /api/v1/catalog/categories`
- **Use Case:** Create Category
- **Description:** Creates a new category. Admin/Manager access required.
- **Request Body:**
```json
{
  "categoryName": "Ánh sáng",
  "description": "Các thiết bị ánh sáng"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CT-02",
  "message": "Tạo danh mục thành công.",
  "data": {
    "categoryId": 2,
    "categoryName": "Ánh sáng",
    "description": "Các thiết bị ánh sáng"
  }
}
```

### 3. `PUT /api/v1/catalog/categories/:id`
- **Use Case:** Update Category
- **Description:** Updates an existing category. Admin/Manager access required.
- **Request Body:**
```json
{
  "categoryName": "Ánh sáng & Sân khấu",
  "description": "Thiết bị ánh sáng và sân khấu"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-02",
  "message": "Cập nhật danh mục thành công."
}
```

---

## 2. Item Type (Loại thiết bị / Gói)

### 4. `GET /api/v1/catalog/types`
- **Use Case:** View Item Types
- **Description:** Retrieves a paginated list of item types. Can filter by `categoryId`.
- **Query Parameters:** `categoryId`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-03",
  "data": [
    {
      "typeId": 1,
      "categoryId": 1,
      "typeName": "Loa Full",
      "description": "Loa toàn dải",
      "categoryName": "Âm thanh"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 15 }
}
```

### 5. `POST /api/v1/catalog/types`
- **Use Case:** Create Item Type
- **Description:** Creates a new item type within a category. Admin/Manager access required.
- **Request Body:**
```json
{
  "categoryId": 1,
  "typeName": "Loa Sub",
  "description": "Loa siêu trầm"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CT-04",
  "message": "Tạo loại thiết bị thành công."
}
```

### 6. `PUT /api/v1/catalog/types/:id`
- **Use Case:** Update Item Type
- **Description:** Updates an item type. Admin/Manager access required.
- **Request Body:**
```json
{
  "typeName": "Loa Sub V2",
  "description": "Loa siêu trầm thế hệ mới"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-04",
  "message": "Cập nhật loại thiết bị thành công."
}
```

---

## 3. Item Type Specs (Cấu hình gói / Combo)

### 7. `GET /api/v1/catalog/types/:id/specs`
- **Use Case:** View Specs of an Item Type
- **Description:** If an Item Type is a package (e.g., Gói Âm Thanh Cơ Bản), this lists the individual Items it consists of.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-05",
  "data": [
    {
      "specId": 1,
      "typeId": 5,
      "componentItemId": 10,
      "componentName": "Loa Full JBL",
      "quantity": 2,
      "note": "Kèm chân loa"
    }
  ]
}
```

### 8. `POST /api/v1/catalog/types/:id/specs`
- **Use Case:** Define Specs for a Type
- **Description:** Bulk inserts or updates the component items for a specific item type.
- **Request Body:**
```json
{
  "specs": [
    {
      "componentItemId": 10,
      "componentName": "Loa Full JBL",
      "quantity": 2,
      "note": "Kèm chân loa"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-06",
  "message": "Cập nhật cấu hình loại thiết bị thành công."
}
```

---

## 4. Item (Thiết bị / Dịch vụ cụ thể)

### 9. `GET /api/v1/catalog/items`
- **Use Case:** View Items
- **Description:** Retrieves a paginated list of items.
- **Query Parameters:** 
  - `page`, `limit`
  - `search` (searches code, name)
  - `typeId`
  - `status` (Đang hoạt động, Ngừng hoạt động, Bảo trì)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-07",
  "data": [
    {
      "itemId": 1,
      "itemCode": "SPK-001",
      "itemName": "Loa JBL PRX815",
      "typeId": 1,
      "typeName": "Loa Full",
      "unit": "Cái",
      "rentalPrice": 500000.00,
      "imageUrl": "https://example.com/jbl.jpg",
      "status": "Đang hoạt động",
      "inventory": {
        "quantityTotal": 10,
        "quantityAvailable": 8
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 50 }
}
```

### 10. `GET /api/v1/catalog/items/:id`
- **Use Case:** View Item Details
- **Description:** Retrieves detailed info of an item.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-07",
  "data": {
    "itemId": 1,
    "itemCode": "SPK-001",
    "itemName": "Loa JBL PRX815",
    "typeId": 1,
    "typeName": "Loa Full",
    "unit": "Cái",
    "rentalPrice": 500000.00,
    "imageUrl": "https://example.com/jbl.jpg",
    "status": "Đang hoạt động",
    "inventory": {
      "quantityTotal": 10,
      "quantityAvailable": 8
    }
  }
}
```

### 11. `POST /api/v1/catalog/items`
- **Use Case:** Create Item
- **Description:** Creates a new item. Admin/Manager access required. Will automatically create an `Inventory` record with 0 quantity.
- **Business Rules:**
  - BR-05-02: `itemCode` must be unique.
- **Request Body:**
```json
{
  "itemCode": "LIGHT-001",
  "itemName": "Đèn Beam 230",
  "typeId": 2,
  "description": "Đèn moving head beam",
  "unit": "Cái",
  "rentalPrice": 300000.00,
  "priceValidFrom": "2026-01-01",
  "imageUrl": "https://example.com/beam.jpg",
  "status": "Đang hoạt động"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-CT-08",
  "message": "Tạo thiết bị thành công."
}
```

### 12. `PUT /api/v1/catalog/items/:id`
- **Use Case:** Update Item
- **Description:** Updates item info. Changing `rentalPrice` will only affect future quotations.
- **Request Body:**
```json
{
  "itemName": "Đèn Beam 230 V2",
  "rentalPrice": 350000.00,
  "status": "Đang hoạt động"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-08",
  "message": "Cập nhật thiết bị thành công."
}
```

### 13. `PATCH /api/v1/catalog/items/:id/status`
- **Use Case:** Change Item Status
- **Description:** Changes status between Đang hoạt động, Ngừng hoạt động, and Bảo trì.
- **Request Body:**
```json
{
  "status": "Bảo trì"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-CT-09",
  "message": "Thay đổi trạng thái thiết bị thành công."
}
```
