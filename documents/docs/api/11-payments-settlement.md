# Finance & Analytics: Payment & Settlement Management

## Overview
This module handles **UC 2.19 (Payment & Settlement Management)** and **UC 2.30 (Field Settlement Support)**.
It deals with financial transactions (`Payment`) and the final reconciliation of an order (`Settlement`).

## Standard Error Codes (SRS Mapping)
- `MSG-UC19-01`: Required information is missing or invalid.
- `MSG-UC19-02`: System cannot complete the request.
- `MSG-UC19-04`: Payment amount exceeds total order amount.
- `MSG-UC30-01`: Settlement discrepancy detected.

## 1. Payment Management (UC 2.19)

### `GET /api/v1/orders/:id/payments`
- **Use Case:** UC 2.19 - Track Payments
- **Description:** Retrieves all payment records associated with an order.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "data": [
    {
      "paymentId": 1,
      "amount": 500000.00,
      "paymentType": "deposit",
      "paymentMethod": "bank_transfer",
      "status": "completed",
      "paymentDate": "2026-06-22T10:00:00Z",
      "evidences": [{ "fileUrl": "https://storage.example.com/receipt.jpg" }]
    }
  ]
}
```

### `GET /api/v1/orders/:id/payment-requests`
- **Use Case:** Payment Confirmation (List)
- **Description:** Hiển thị danh sách payment request chờ duyệt của đơn hàng.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "data": [
    {
      "paymentRequestId": 1,
      "amount": 500000.00,
      "paymentType": "deposit",
      "status": "pending",
      "createdAt": "2026-06-22T09:00:00Z"
    }
  ]
}
```

### `GET /api/v1/payment-requests/:id`
- **Use Case:** Payment Confirmation (Detail)
- **Description:** Lấy chi tiết payment request và bằng chứng thanh toán.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "data": {
    "paymentRequestId": 1,
    "orderId": 1,
    "amount": 500000.00,
    "paymentType": "deposit",
    "paymentMethod": "bank_transfer",
    "status": "pending",
    "evidenceUrl": "https://storage.example.com/receipt_submitted.jpg",
    "createdAt": "2026-06-22T09:00:00Z"
  }
}
```

### `POST /api/v1/orders/:id/payments/request`
- **Use Case:** UC 2.19 - Create Deposit Payment Request
- **Description:** Manager creates a payment request (e.g., Deposit) and generates payment instructions.
- **Business Rules:**
  - BR-19-01: Auto-calculates required deposit based on `BusinessPolicy`.
- **Request Body:**
```json
{
  "amount": 500000.00,
  "paymentType": "deposit",
  "paymentMethod": "vnpay_qr"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "message": "Payment request created.",
  "data": { "paymentRequestId": 1, "paymentUrl": "vnpay-qr-url" }
}
```

### `PUT /api/v1/payments/:id/confirm`
- **Use Case:** UC 2.19 - Confirm Deposit / Confirm Final Payment
- **Description:** Manager confirms a payment manually after verifying evidence.
- **Business Rules:**
  - BR-19-02: Updates payment status to `completed`.
  - BR-19-03: Triggers order status change (e.g. `deposit_paid`) if applicable.
- **Request Body:**
```json
{
  "status": "completed",
  "evidenceUrl": "https://storage.example.com/receipt.jpg"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "message": "Payment confirmed successfully."
}
```

## 2. Settlement Management (UC 2.19 & UC 2.30)

### `POST /api/v1/orders/:id/settlement`
- **Use Case:** UC 2.30 - Record Settlement (Field)
- **Description:** Leader staff records on-site settlement info, including extra charges or compensation.
- **Business Rules:**
  - BR-30-01: `remainingAmount` = `originalValue` + `changeAdjustment` + `additionalFee` - `compensation` - `totalPaid`.
  - BR-30-02: Requires evidence (e.g. signed agreement) if `additionalFee` or `compensation` > 0.
- **Request Body:**
```json
{
  "originalValue": 1500000.00,
  "changeAdjustment": 0.00,
  "additionalFee": 100000.00,
  "compensation": 0,
  "totalAmount": 1600000.00,
  "totalPaid": 500000.00,
  "remainingAmount": 1100000.00,
  "evidences": [{ "fileUrl": "https://storage.example.com/agreement.jpg" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "message": "Field settlement recorded.",
  "data": { "settlementId": 1 }
}
```

### `PUT /api/v1/settlements/:id/confirm`
- **Use Case:** UC 2.19 - Confirm Settlement
- **Description:** Manager reviews and confirms the final settlement amount after the event.
- **Business Rules:**
  - BR-19-05: Confirms the `Settlement` record, preparing the order for `completed` status.
- **Request Body:**
```json
{
  "status": "confirmed"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-PM-00",
  "message": "Settlement confirmed."
}
```
