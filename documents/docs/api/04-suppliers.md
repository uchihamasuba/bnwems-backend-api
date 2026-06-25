# Master Data & Policies: Supplier & Transaction Management

## Overview
This module handles **UC 2.16 (Supplier Transaction & Debt Management)** and **UC 2.24 (Supplier Item Receiving & Return Support)**.
It manages external partners, their transactions (`SupplierTransaction`), receiving/returns, and financial debt (`SupplierDebt`).

## Standard Error Codes (SRS Mapping)
- `MSG-UC16-01`: Required information is missing or invalid.
- `MSG-UC16-02`: System cannot complete the request.
- `MSG-UC16-03`: You do not have permission to perform this action.
- `MSG-UC24-01`: Received item quantities do not match the transaction agreement.
- `MSG-UC24-02`: Evidence missing for supplier return.

## 1. Supplier Master Data (UC 2.16)

### `GET /api/v1/suppliers`
- **Use Case:** UC 2.16 (implied) - View Supplier List
- **Description:** Retrieves a paginated list of suppliers. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches by name
  - `status` (enum, optional) - ACTIVE, INACTIVE
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "supplierId": 1,
      "name": "AudioVisual Pro Inc.",
      "contactPerson": "John Doe",
      "phone": "+123456789",
      "email": "contact@audiovisual.com",
      "status": "active",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 15 }
}
```

### `POST /api/v1/suppliers`
- **Description:** Creates a new supplier record. Manager access required.
- **Business Rules:**
  - BR-16-01: Supplier name must be unique.
  - BR-16-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "name": "AudioVisual Pro Inc.",
  "contactPerson": "John Doe",
  "phone": "+123456789",
  "email": "contact@audiovisual.com",
  "address": "123 Supplier St"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Supplier created successfully."
}
```

## 2. Supplier Transactions (UC 2.16, UC 2.24)

### `POST /api/v1/supplier-transactions`
- **Use Case:** UC 2.16 - Create Supplier Rental/Purchase Order
- **Description:** Creates a transaction to rent or purchase items from a supplier for an order.
- **Business Rules:**
  - BR-16-03: `totalCost` must equal the sum of item costs.
  - BR-16-04: Creates or updates `SupplierDebt` automatically upon confirmation.
- **Request Body:**
```json
{
  "supplierId": 1,
  "orderId": 1,
  "transactionType": "rental",
  "totalCost": 500.00,
  "items": [
    {
      "catalogItemId": 1,
      "quantity": 2,
      "unitPrice": 250.00
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Supplier transaction created.",
  "data": { "supplierTransactionId": 1, "status": "draft" }
}
```

### `PUT /api/v1/supplier-transactions/:id/receive`
- **Use Case:** UC 2.24 - Supplier Item Receiving Support
- **Description:** Records the receipt of equipment/materials from a supplier.
- **Business Rules:**
  - BR-24-01: Validates `receivedItems` against original transaction details.
  - BR-24-02: Changes transaction status to `RECEIVED`. Adds items to `Inventory` if applicable.
- **Request Body:**
```json
{
  "items": [{ "catalogItemId": 1, "quantityReceived": 2 }],
  "evidenceUrls": ["https://storage.example.com/receipt.jpg"]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Items received and logged."
}
```

### `PUT /api/v1/supplier-transactions/:id/return`
- **Use Case:** UC 2.24 - Supplier Item Return Support
- **Description:** Records the return of rented equipment to a supplier.
- **Business Rules:**
  - BR-24-03: Validates return quantities against received quantities.
  - BR-24-04: Changes status to `RETURNED`. Reduces `Inventory` if applicable.
- **Request Body:**
```json
{
  "items": [{ "catalogItemId": 1, "quantityReturned": 2 }],
  "condition": "good",
  "evidenceUrls": ["https://storage.example.com/return_receipt.jpg"]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Items returned to supplier successfully."
}
```

## 3. Supplier Debt Management (UC 2.16)

### `GET /api/v1/supplier-debts`
- **Use Case:** UC 2.16 - Monitor Supplier Debt
- **Description:** Retrieves the outstanding debts owed to suppliers.
- **Query Parameters:**
  - `status` (enum, optional) - UNPAID, PARTIALLY_PAID, PAID
  - `supplierId` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "supplierDebtId": 1,
      "supplierId": 1,
      "amountOwed": 500.00,
      "amountPaid": 0.00,
      "status": "unpaid",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 5 }
}
```

### `POST /api/v1/supplier-debts/:id/pay`
- **Use Case:** UC 2.16 - Record Supplier Payment
- **Description:** Records a payment made to a supplier, reducing the debt amount.
- **Business Rules:**
  - BR-16-05: Payment amount cannot exceed the remaining `amountOwed` - `amountPaid`.
  - BR-16-06: Automatically updates debt status to `PARTIALLY_PAID` or `PAID`.
- **Request Body:**
```json
{
  "amount": 500.00,
  "paymentRef": "BankTx-12345"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment recorded successfully."
}
```
