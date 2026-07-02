# Master Data & Policies: Supplier & Transaction Management

## Overview
This module handles **UC 2.16 (Supplier Transaction & Debt Management)** and **UC 2.24 (Supplier Item Receiving & Return Support)**.
It manages external partners, their transactions (`SupplierTransaction`), receiving/returns, and financial payments (`SupplierPayment`).

## Standard Error Codes (SRS Mapping)
- `MSG-UC16-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC16-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC16-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC24-01`: Số lượng hàng nhận không khớp với thỏa thuận giao dịch.
- `MSG-UC24-02`: Thiếu bằng chứng cho việc trả lại hàng nhà cung cấp.

## 1. Supplier Master Data (UC 2.16)

### 1. `GET /api/v1/suppliers`
- **Use Case:** UC 2.16 (implied) - View Supplier List
- **Description:** Retrieves a paginated list of suppliers. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches by name
  - `status` (enum, optional) - active, inactive
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-01",
  "data": [
    {
      "supplierId": 1,
      "name": "Công ty TNHH AudioVisual Pro",
      "contactPerson": "Nguyễn Văn A",
      "phone": "+123456789",
      "address": "123 Đường Nguyễn Trãi",
      "status": "active"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 15 }
}
```

### 2. `POST /api/v1/suppliers`
- **Description:** Creates a new supplier record. Manager access required.
- **Business Rules:**
  - BR-16-01: Supplier name must be unique.
  - BR-16-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "Công ty TNHH AudioVisual Pro",
  "contactPerson": "Nguyễn Văn A",
  "phone": "+123456789",
  "address": "123 Đường Nguyễn Trãi"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SP-02",
  "message": "Tạo nhà cung cấp thành công."
}
```

## 2. Supplier Transactions (UC 2.16, UC 2.24)

### 3. `POST /api/v1/supplier-transactions`
- **Use Case:** UC 2.16 - Create Supplier Rental/Purchase Order
- **Description:** Creates a transaction to rent or purchase items from a supplier for an order.
- **Business Rules:**
  - BR-16-03: `totalCost` must equal the sum of item costs.
- **Request Body:**
```json
{
  "supplierId": 1,
  "orderId": 1,
  "type": "rental",
  "totalCost": 500000.00,
  "expectedDelivery": "2026-06-25",
  "items": [
    {
      "equipmentItemId": 46,
      "description": "Thuê phông cưới cao cấp",
      "quantity": 1,
      "unitCost": 500000.00
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-SP-03",
  "message": "Tạo giao dịch nhà cung cấp thành công.",
  "data": { "supplierTransactionId": 1, "status": "draft" }
}
```

### 4. `GET /api/v1/supplier-transactions/:id`
- **Use Case:** UC 2.16 - View Supplier Transaction Details
- **Description:** Retrieves the detailed information of a specific supplier transaction, including its items and payment status.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-04",
  "data": {
    "supplierTransactionId": 1,
    "status": "draft"
  }
}
```

### 5. `PUT /api/v1/supplier-transactions/:id/status`
- **Use Case:** UC 2.16 - Update Supplier Transaction Status
- **Description:** Manually overrides or updates the status of a supplier transaction (e.g., cancelled).
- **Request Body:**
```json
{
  "status": "cancelled"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-05",
  "message": "Cập nhật trạng thái giao dịch nhà cung cấp thành công."
}
```

### 6. `PUT /api/v1/supplier-transactions/:id/receive`
- **Use Case:** UC 2.24 - Supplier Item Receiving Support
- **Description:** Records the receipt of equipment/materials from a supplier.
- **Business Rules:**
  - BR-24-01: Validates received quantities against original transaction details.
  - BR-24-02: Changes transaction status to `received`.
- **Request Body:**
```json
{
  "items": [{ "equipmentItemId": 46, "quantityReceived": 1 }]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-06",
  "message": "Đã nhận và ghi nhận thiết bị/vật tư."
}
```

### 7. `PUT /api/v1/supplier-transactions/:id/return`
- **Use Case:** UC 2.24 - Supplier Item Return Support
- **Description:** Records the return of rented equipment to a supplier.
- **Business Rules:**
  - BR-24-03: Validates return quantities against received quantities.
  - BR-24-04: Changes status to `returned`.
- **Request Body:**
```json
{
  "items": [{ "equipmentItemId": 46, "quantityReturned": 1 }]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-07",
  "message": "Trả lại thiết bị/vật tư cho nhà cung cấp thành công."
}
```

## 3. Supplier Payment Management (UC 2.16)

### 8. `GET /api/v1/supplier-transactions`
- **Use Case:** UC 2.16 - Monitor Supplier Debt
- **Description:** Retrieves supplier transactions to monitor payments and debts.
- **Query Parameters:**
  - `paymentStatus` (enum, optional) - unpaid, partial, paid
  - `supplierId` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-08",
  "data": [
    {
      "supplierTransactionId": 1,
      "supplierId": 1,
      "orderId": 1,
      "totalCost": 500000.00,
      "paidAmount": 0.00,
      "paymentStatus": "unpaid",
      "status": "received",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 5 }
}
```

### 9. `POST /api/v1/supplier-transactions/:id/payments`
- **Use Case:** UC 2.16 - Record Supplier Payment
- **Description:** Records a payment made to a supplier, increasing the `paidAmount`.
- **Business Rules:**
  - BR-16-05: Payment amount cannot exceed the remaining `totalCost` - `paidAmount`.
  - BR-16-06: Automatically updates `paymentStatus` to `partial` or `paid`.
- **Request Body:**
```json
{
  "amount": 500000.00,
  "paidAt": "2026-06-25T10:00:00Z",
  "note": "BankTx-12345"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-09",
  "message": "Ghi nhận thanh toán thành công."
}
```
