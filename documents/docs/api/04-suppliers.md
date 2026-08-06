# Master Data & Policies: Supplier & Transaction Management

## Overview
This module handles **UC 2.16 (Supplier Transaction & Debt Management)** and **UC 2.24 (Supplier Item Receiving & Return Support)**.
It manages external partners, their transactions (`SupplierTransaction`), and links to field operations for item receiving/returns.

## Standard Error Codes (SRS Mapping)
- `MSG-UC16-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC16-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC16-03`: Bạn không có quyền thực hiện thao tác này.
- `MSG-UC24-01`: Số lượng hàng nhận không khớp với thỏa thuận giao dịch.
- `MSG-UC24-02`: Thiếu bằng chứng cho việc trả lại hàng nhà cung cấp.

---

## 1. Supplier Master Data (UC 2.16)

### 1. `GET /api/v1/suppliers`
- **Use Case:** UC 2.16 (implied) - View Supplier List
- **Description:** Retrieves a paginated list of suppliers. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches by name or code
  - `status` (enum, optional) - Hoạt động, Ngừng hoạt động
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-01",
  "data": [
    {
      "supplierId": 1,
      "supplierCode": "SUP-001",
      "supplierName": "Công ty TNHH AudioVisual Pro",
      "serviceType": "Cung cấp âm thanh ánh sáng",
      "contactPerson": "Nguyễn Văn A",
      "phone": "0901234567",
      "rating": 5,
      "status": "Hoạt động"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 15 }
}
```

### 2. `POST /api/v1/suppliers`
- **Description:** Creates a new supplier record. Manager access required.
- **Business Rules:**
  - BR-16-01: Supplier code must be unique.
  - BR-16-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "supplierCode": "SUP-001",
  "supplierName": "Công ty TNHH AudioVisual Pro",
  "serviceType": "Cung cấp âm thanh ánh sáng",
  "contactPerson": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường Nguyễn Trãi",
  "rating": 5
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

### 3. `PUT /api/v1/suppliers/:id`
- **Description:** Updates supplier information.
- **Request Body:**
```json
{
  "supplierName": "Công ty TNHH AudioVisual Pro (Updated)",
  "serviceType": "Cung cấp âm thanh ánh sáng",
  "contactPerson": "Nguyễn Văn B",
  "phone": "0901234568",
  "address": "456 Đường Nguyễn Trãi",
  "rating": 4
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-02-UPDATED",
  "message": "Cập nhật nhà cung cấp thành công."
}
```

---

## 2. Supplier Transactions (UC 2.16)

### 4. `POST /api/v1/supplier-transactions`
- **Use Case:** UC 2.16 - Create Supplier Rental/Purchase Order
- **Description:** Creates a transaction to rent or purchase items from a supplier for a specific order.
- **Business Rules:**
  - BR-16-03: System automatically calculates `estimatedCost` based on the items.
- **Request Body:**
```json
{
  "supplierId": 1,
  "orderId": 100,
  "transactionType": "Thuê",
  "serviceTitle": "Thuê bổ sung màn hình LED",
  "depositAmount": 1000000.00,
  "items": [
    {
      "itemId": 46,
      "itemName": "Màn hình LED P3",
      "quantity": 10,
      "unitCost": 500000.00,
      "notes": "Bao gồm thi công"
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
  "data": { "transactionId": 1, "status": "Chờ duyệt" }
}
```

### 5. `GET /api/v1/supplier-transactions`
- **Use Case:** UC 2.16 - Monitor Supplier Debt & Transactions
- **Description:** Retrieves paginated transactions for monitoring.
- **Query Parameters:**
  - `supplierId` (number, optional)
  - `paymentStatus` (enum, optional) - Chưa thanh toán, Đã cọc, Đã thanh toán
  - `status` (enum, optional) - Chờ duyệt, Đã duyệt, Đang thực hiện, Hoàn thành, Đã hủy
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-04",
  "data": [
    {
      "transactionId": 1,
      "transactionCode": "STX-001",
      "supplierName": "Công ty TNHH AudioVisual Pro",
      "transactionType": "Thuê",
      "estimatedCost": 5000000.00,
      "depositAmount": 1000000.00,
      "paymentStatus": "Đã cọc",
      "status": "Đang thực hiện",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 5 }
}
```

### 6. `GET /api/v1/supplier-transactions/:id`
- **Use Case:** View Transaction Details
- **Description:** Retrieves transaction details including items and their `receivedQuantity`.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-04-DETAIL",
  "data": {
    "transactionId": 1,
    "transactionCode": "STX-001",
    "supplierId": 1,
    "orderId": 100,
    "transactionType": "Thuê",
    "serviceTitle": "Thuê bổ sung màn hình LED",
    "estimatedCost": 5000000.00,
    "depositAmount": 1000000.00,
    "paymentStatus": "Đã cọc",
    "status": "Đang thực hiện",
    "items": [
      {
        "stItemId": 1,
        "itemId": 46,
        "itemName": "Màn hình LED P3",
        "quantity": 10,
        "receivedQuantity": 0,
        "unitCost": 500000.00,
        "notes": "Bao gồm thi công"
      }
    ]
  }
}
```

### 7. `PATCH /api/v1/supplier-transactions/:id/status`
- **Use Case:** Approve/Cancel Transaction
- **Description:** Updates transaction status.
- **Request Body:**
```json
{
  "status": "Đã duyệt",
  "notes": "Duyệt thuê màn LED"
}
```

### 8. `PATCH /api/v1/supplier-transactions/:id/payment-status`
- **Use Case:** Update Transaction Payment Status
- **Description:** Updates the payment status (e.g., from Unpaid to Deposited or Paid).
- **Request Body:**
```json
{
  "paymentStatus": "Đã thanh toán"
}
```

---

## 3. Supplier Receiving & Return (Integration with CollectedEquipmentReport)

*Note: Receiving and returning items from/to suppliers is now primarily handled through the `CollectedEquipmentReport` (UC 2.24). When a report of type `Nhà cung cấp` is submitted, it links to a `SupplierTransaction` and automatically updates the `receivedQuantity` and `status` of the transaction.*

### 9. `POST /api/v1/supplier-transactions/:id/receive` (Legacy / Direct Endpoint)
- **Use Case:** UC 2.24 - Direct Receiving
- **Description:** Alternatively, a direct endpoint to mark items as received by updating the `receivedQuantity` of `SupplierTransactionItem`.
- **Request Body:**
```json
{
  "items": [
    {
      "stItemId": 10,
      "receivedQuantity": 10
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-SP-05",
  "message": "Đã cập nhật số lượng nhận hàng từ nhà cung cấp."
}
```
