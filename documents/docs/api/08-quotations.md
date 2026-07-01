# Sales & Customer Lifecycle: Quotation Management

## Overview
This module handles **UC 2.10 (Quotation Management)**.
It manages `Quotation` records, which act as versioned proposals attached to an `Order`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC10-01`: Required information is missing or invalid.
- `MSG-UC10-02`: System cannot complete the request.
- `MSG-UC10-03`: You do not have permission to perform this action.
- `MSG-UC10-04`: Quotation cannot be modified after confirmation.

## Endpoints

### `GET /api/v1/orders/:orderId/quotations`
- **Use Case:** UC 2.10 - View Quotation
- **Description:** Retrieves the list of quotation versions for a specific order. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "data": [
    {
      "quotationId": 1,
      "orderId": 1,
      "version": 1,
      "subtotal": 1500000.00,
      "tax": 150000.00,
      "discount": 0.00,
      "totalAmount": 1650000.00,
      "status": "draft",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 2 }
}
```

### `GET /api/v1/quotations/:id`
- **Use Case:** UC 2.10 - View Quotation (Details)
- **Description:** Retrieves the details of a specific quotation version, including its calculated item details.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "data": {
    "quotationId": 1,
    "orderId": 1,
    "version": 1,
    "subtotal": 1500000.00,
    "tax": 150000.00,
    "discount": 0.00,
    "totalAmount": 1650000.00,
    "items": [
      {
        "equipmentItemId": 1,
        "quantity": 2,
        "unitPrice": 750000.00
      }
    ],
    "status": "draft",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### `POST /api/v1/orders/:orderId/quotations`
- **Use Case:** UC 2.10 - Create Quotation
- **Description:** Creates a new quotation draft for an order. If one already exists, creates a new version.
- **Business Rules:**
  - BR-10-01: Auto-increments version number based on existing quotes for the order.
  - BR-10-02: Subtotal, tax, discount, and total must be mathematically consistent.
  - BR-10-03: Log to `AuditLog`.
- **Request Body:**
```json
{
  "subtotal": 1500000.00,
  "tax": 150000.00,
  "discount": 0.00,
  "totalAmount": 1650000.00,
  "items": [
    {
      "equipmentItemId": 1,
      "quantity": 2,
      "unitPrice": 750000.00
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "message": "Quotation created.",
  "data": { "quotationId": 2, "version": 2 }
}
```

### `PUT /api/v1/quotations/:id`
- **Use Case:** UC 2.10 - Update Quotation
- **Description:** Updates the details of an existing draft quotation. 
- **Business Rules:**
  - BR-10-04: Cannot update if `status` is `confirmed` (throws MSG-UC10-04).
- **Request Body:**
```json
{
  "subtotal": 2250000.00,
  "tax": 225000.00,
  "discount": 0.00,
  "totalAmount": 2475000.00,
  "items": [
    {
      "equipmentItemId": 1,
      "quantity": 3,
      "unitPrice": 750000.00
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "message": "Quotation updated successfully."
}
```

### `PATCH /api/v1/quotations/:id/status`
- **Use Case:** UC 2.10 - Soft Delete Quotation
- **Description:** Soft-deletes a quotation.
- **Business Rules:**
  - BR-10-05: Cannot delete confirmed quotations.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "message": "Quotation deleted successfully."
}
```

### `PUT /api/v1/quotations/:id/confirm`
- **Use Case:** UC 2.10 - Confirm Quotation
- **Description:** Confirms the quotation as agreed by the customer. 
- **Business Rules:**
  - BR-10-06: Transitions the quotation status to `confirmed`.
  - BR-10-07: Automatically updates the parent `Order` status to `confirmed` (if it was `draft`).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-QO-00",
  "message": "Quotation confirmed.",
  "data": { "status": "confirmed" }
}
```
