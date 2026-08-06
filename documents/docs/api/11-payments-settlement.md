# Finance & Analytics: Payment & Settlement Management

## Overview
This module handles **UC 2.19 (Payment & Settlement Management)** and **UC 2.30 (Field Settlement Support)**.
It deals with advance payments (`Deposit`) and the final reconciliation of an order (`Settlement`).

## Standard Error Codes (SRS Mapping)
- `MSG-UC19-01`: Thông tin bắt buộc bị thiếu hoặc không hợp lệ.
- `MSG-UC19-02`: Hệ thống không thể hoàn thành yêu cầu.
- `MSG-UC19-04`: Số tiền đặt cọc/quyết toán không hợp lệ.
- `MSG-UC30-01`: Phát hiện chênh lệch quyết toán.

---

## 1. Deposit Management (UC 2.19)

### 1. `GET /api/v1/orders/:id/deposits`
- **Use Case:** View Deposits
- **Description:** Retrieves all deposit records associated with an order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-01",
  "data": [
    {
      "depositId": 1,
      "orderId": 100,
      "amount": 5000000.00,
      "depositDate": "2026-06-22T10:00:00Z",
      "paymentMethod": "Chuyển khoản",
      "status": "Đã thanh toán",
      "receivedBy": 2,
      "notes": "Khách chuyển khoản VCB"
    }
  ]
}
```

### 2. `POST /api/v1/orders/:id/deposits`
- **Use Case:** UC 2.19 - Create Deposit
- **Description:** Records a deposit payment for an order.
- **Business Rules:**
  - BR-19-01: Auto-calculates required deposit based on `BusinessPolicy` (if any).
  - BR-19-02: After a successful deposit, the Order `paymentStatus` may update to `Đã cọc`.
- **Request Body:**
```json
{
  "amount": 5000000.00,
  "depositDate": "2026-06-22T10:00:00Z",
  "paymentMethod": "Chuyển khoản",
  "status": "Đã thanh toán",
  "notes": "Khách chuyển khoản VCB"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-PM-02",
  "message": "Ghi nhận tiền cọc thành công.",
  "data": { "depositId": 1 }
}
```

### 3. `PUT /api/v1/deposits/:id`
- **Use Case:** UC 2.19 - Update Deposit Status
- **Description:** Manager confirms or updates a deposit record.
- **Request Body:**
```json
{
  "status": "Đã thanh toán"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-03",
  "message": "Cập nhật trạng thái tiền cọc thành công."
}
```

---

## 2. Settlement Management (UC 2.19 & UC 2.30)

### 4. `GET /api/v1/orders/:id/settlement`
- **Use Case:** UC 2.30 - View Settlement (Field)
- **Description:** Retrieves the existing settlement record for an order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-04",
  "data": {
    "settlementId": 1,
    "orderId": 100,
    "settlementDate": "2026-10-16T15:00:00Z",
    "totalAmount": 50000000.00,
    "depositAmount": 10000000.00,
    "deductionAmount": 2000000.00,
    "finalAmount": 38000000.00,
    "status": "Chưa quyết toán",
    "notes": "Trừ 2tr tiền bồi thường hư hỏng đồ"
  }
}
```

### 5. `POST /api/v1/orders/:id/settlement`
- **Use Case:** UC 2.30 - Record Settlement
- **Description:** Records the final settlement data, including deductions (e.g., from damages tracked in `CollectedEquipmentReport`).
- **Business Rules:**
  - BR-30-01: `finalAmount` = `totalAmount` - `depositAmount` - `deductionAmount`.
- **Request Body:**
```json
{
  "settlementDate": "2026-10-16T15:00:00Z",
  "totalAmount": 50000000.00,
  "depositAmount": 10000000.00,
  "deductionAmount": 2000000.00,
  "finalAmount": 38000000.00,
  "status": "Chưa quyết toán",
  "notes": "Trừ 2tr tiền bồi thường hư hỏng đồ"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-PM-05",
  "message": "Tạo biên bản quyết toán thành công.",
  "data": { "settlementId": 1 }
}
```

### 6. `PUT /api/v1/settlements/:id/confirm`
- **Use Case:** UC 2.19 - Confirm Settlement
- **Description:** Manager reviews and confirms the final settlement after the customer has paid the `finalAmount`.
- **Business Rules:**
  - BR-19-05: Updates `Settlement` status to `Đã quyết toán`. Triggers parent `Order` paymentStatus to `Đã thanh toán`.
- **Request Body:**
```json
{
  "status": "Đã quyết toán",
  "notes": "Khách đã thanh toán phần còn lại"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-06",
  "message": "Xác nhận quyết toán thành công."
}
```
