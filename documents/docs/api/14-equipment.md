# 14. Equipment API

Quản lý danh sách thiết bị (Equipment).

## 1. Get Equipments
- **Endpoint:** `GET /api/v1/equipment`
- **Access:** Public (không yêu cầu Auth)
- **Query Params:**
  - `page` (optional): Số trang
  - `limit` (optional): Kích thước trang
  - `search` (optional): Tìm kiếm theo tên hoặc mã
  - `category` (optional): Lọc theo danh mục
  - `status` (optional): `active` hoặc `inactive`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "equipmentItemId": "1",
      "code": "SPK-001",
      "name": "Loa JBL",
      "category": "Âm thanh",
      "unit": "Cái",
      "rentalPrice": "500000.00",
      "costPrice": "400000.00",
      "replacementValue": "15000000.00",
      "status": "active",
      "createdAt": "2026-07-01T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 50
  }
}
```

## 2. Get Equipment By Id
- **Endpoint:** `GET /api/v1/equipment/:id`
- **Access:** Public
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipmentItemId": "1",
    "code": "SPK-001",
    "name": "Loa JBL",
    "category": "Âm thanh",
    "unit": "Cái",
    "rentalPrice": "500000.00",
    "costPrice": "400000.00",
    "replacementValue": "15000000.00",
    "status": "active"
  }
}
```

## 3. Create Equipment
- **Endpoint:** `POST /api/v1/equipment`
- **Access:** ADMIN, MANAGER
- **Request Body:**
```json
{
  "code": "SPK-002",
  "name": "Micro Shure",
  "category": "Âm thanh",
  "unit": "Cái",
  "rentalPrice": 150000,
  "costPrice": 100000,
  "replacementValue": 3000000
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo thiết bị thành công.",
  "data": {
    "equipmentItemId": "2",
    "code": "SPK-002"
  }
}
```

## 4. Update Equipment
- **Endpoint:** `PUT /api/v1/equipment/:id`
- **Access:** ADMIN, MANAGER
- **Request Body:**
```json
{
  "rentalPrice": 160000,
  "replacementValue": 3200000
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật thiết bị thành công."
}
```

## 5. Update Status
- **Endpoint:** `PATCH /api/v1/equipment/:id/status`
- **Access:** ADMIN, MANAGER
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
  "message": "Cập nhật trạng thái thiết bị thành công."
}
```
