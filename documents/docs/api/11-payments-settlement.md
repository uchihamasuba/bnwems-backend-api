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
  "data": [
    {
      "paymentId": 1,
      "amount": 500.00,
      "paymentType": "deposit",
      "paymentMethod": "bank_transfer",
      "status": "completed",
      "paymentDate": "2026-06-22T10:00:00Z",
      "evidences": [{ "fileUrl": "https://storage.example.com/receipt.jpg" }]
    }
  ]
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
  "amount": 500.00,
  "paymentType": "deposit",
  "paymentMethod": "vnpay_qr"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Payment request created.",
  "data": { "paymentRequestId": 1, "paymentUrl": "vnpay-qr-url" }
}
```

### `PUT /api/v1/payments/:id/confirm`
- **Use Case:** UC 2.19 - Confirm Deposit / Confirm Final Payment
- **Description:** Manager confirms a payment manually after verifying evidence.
- **Business Rules:**
  - BR-19-02: Updates payment status to `COMPLETED`.
  - BR-19-03: Triggers order status change (e.g. `DEPOSIT_PAID`) if applicable.
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
  "message": "Payment confirmed successfully."
}
```

## 2. Settlement Management (UC 2.19 & UC 2.30)

### `POST /api/v1/orders/:id/settlement`
- **Use Case:** UC 2.30 - Record Settlement (Field)
- **Description:** Leader staff records on-site settlement info, including extra charges or compensation.
- **Business Rules:**
  - BR-30-01: `remainingAmount` = `originalValue` + `additionalFees` - `compensation` - `paidAmount`.
  - BR-30-02: Requires evidence (e.g. signed agreement) if `additionalFees` or `compensation` > 0.
- **Request Body:**
```json
{
  "originalValue": 1500.00,
  "additionalFees": 100.00,
  "compensation": 0,
  "paidAmount": 500.00,
  "remainingAmount": 1100.00,
  "evidences": [{ "fileUrl": "https://storage.example.com/agreement.jpg" }]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Field settlement recorded.",
  "data": { "settlementId": 1 }
}
```

### `PUT /api/v1/settlements/:id/confirm`
- **Use Case:** UC 2.19 - Confirm Settlement
- **Description:** Manager reviews and confirms the final settlement amount after the event.
- **Business Rules:**
  - BR-19-05: Confirms the `Settlement` record, preparing the order for `COMPLETED` status.
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
  "message": "Settlement confirmed."
}
```
