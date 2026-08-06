# Sales & Customer Lifecycle: Quotation Management

## Overview
This module handles **UC 2.10 (Quotation Management)**.
It manages `Quotation` records, which act as versioned proposals created for a `Customer`. A confirmed quotation can be linked to an `Order`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC10-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC10-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC10-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC10-04`: Không thể sửa báo giá sau khi đã được duyệt.

---

## Endpoints

### 1. `GET /api/v1/customers/:customerId/quotations`
- **Use Case:** UC 2.10 - View Quotations for Customer
- **Description:** Retrieves the list of quotation versions for a specific customer.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-01",
  "data": [
    {
      "quotationId": 1,
      "quotationCode": "QUO-001",
      "customerId": 1,
      "version": "v1.0",
      "subtotal": 1500000.00,
      "discountTotal": 0.00,
      "totalAmount": 1500000.00,
      "status": "Nháp",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 2 }
}
```

### 2. `GET /api/v1/quotations/:id`
- **Use Case:** UC 2.10 - View Quotation (Details)
- **Description:** Retrieves the details of a specific quotation, including its calculated item details.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-02",
  "data": {
    "quotationId": 1,
    "quotationCode": "QUO-001",
    "customerId": 1,
    "version": "v1.0",
    "subtotal": 1500000.00,
    "discountTotal": 0.00,
    "totalAmount": 1500000.00,
    "status": "Nháp",
    "notes": "Báo giá lần 1",
    "items": [
      {
        "quotationItemId": 1,
        "itemId": 1,
        "itemName": "Loa JBL",
        "category": "Âm thanh",
        "unit": "Cái",
        "quantity": 2,
        "price": 750000.00,
        "discount": 0.00,
        "lineTotal": 1500000.00
      }
    ],
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### 3. `POST /api/v1/customers/:customerId/quotations`
- **Use Case:** UC 2.10 - Create Quotation
- **Description:** Creates a new quotation draft for a customer.
- **Business Rules:**
  - BR-10-01: Auto-generates `quotationCode`.
  - BR-10-02: `totalAmount` must equal `subtotal - discountTotal`. System auto-calculates `lineTotal` for items.
- **Request Body:**
```json
{
  "version": "v1.0",
  "notes": "Báo giá lần 1",
  "items": [
    {
      "itemId": 1,
      "quantity": 2,
      "price": 750000.00,
      "discount": 0.00
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-QO-03",
  "message": "Tạo báo giá thành công.",
  "data": { "quotationId": 1, "quotationCode": "QUO-001" }
}
```

### 4. `PUT /api/v1/quotations/:id`
- **Use Case:** UC 2.10 - Update Quotation
- **Description:** Updates the details of an existing draft quotation.
- **Business Rules:**
  - BR-10-04: Cannot update if `status` is `Đã duyệt` or `Từ chối`.
- **Request Body:**
```json
{
  "notes": "Báo giá cập nhật",
  "items": [
    {
      "itemId": 1,
      "quantity": 3,
      "price": 750000.00,
      "discount": 50000.00
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-04",
  "message": "Cập nhật báo giá thành công."
}
```

### 5. `PATCH /api/v1/quotations/:id/status`
- **Use Case:** UC 2.10 - Update Quotation Status
- **Description:** Changes the quotation status (e.g., from Nháp to Đã duyệt or Từ chối).
- **Business Rules:**
  - BR-10-06: A quotation marked as `Đã duyệt` can then be converted into an Order.
- **Request Body:**
```json
{
  "status": "Đã duyệt"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-05",
  "message": "Cập nhật trạng thái báo giá thành công."
}
```

### 6. `DELETE /api/v1/quotations/:id`
- **Use Case:** Delete Quotation
- **Description:** Hard-deletes a quotation.
- **Business Rules:**
  - BR-10-06: Cannot delete `Đã duyệt` quotations.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-06",
  "message": "Xóa báo giá thành công."
}
```
