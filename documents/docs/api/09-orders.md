# Sales & Customer Lifecycle: Order Lifecycle & Change Requests

## Overview
This module handles **UC 2.11 (Order Lifecycle Management)** and **UC 2.27 (Field Change Request Management)**.
It manages `Order` and `ChangeRequest` entities from creation to completion.

## Standard Error Codes (SRS Mapping)
- `MSG-UC11-01`: Required information is missing or invalid.
- `MSG-UC11-02`: System cannot complete the request.
- `MSG-UC11-04`: Cannot confirm order without an accepted quotation.
- `MSG-UC27-01`: Change request requires manager approval.

## 1. Order Lifecycle Management (UC 2.11)

### `GET /api/v1/orders`
- **Use Case:** UC 2.11 - View Order List
- **Description:** Retrieves a paginated list of orders for operational processing. Manager/Staff access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `status` (enum, optional) - DRAFT, QUOTED, CONFIRMED, IN_PROGRESS, COMPLETED
  - `search` (string, optional) - searches `orderNumber`
  - `startDate`, `endDate` (string, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-2026-0001",
      "customerId": "customer-uuid",
      "eventDate": "2026-10-15T00:00:00Z",
      "venueAddress": "123 Event Hall",
      "status": "CONFIRMED",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 45 }
}
```

### `GET /api/v1/orders/:id`
- **Use Case:** UC 2.11 - View Order Details
- **Description:** Retrieves detailed order information including customer, quotation, and related operational data.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-2026-0001",
    "customerId": "customer-uuid",
    "eventDate": "2026-10-15T00:00:00Z",
    "venueAddress": "123 Event Hall",
    "status": "CONFIRMED",
    "customer": {
      "fullName": "Jane Doe",
      "phone": "+198765432"
    },
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### `POST /api/v1/orders`
- **Use Case:** UC 2.11 - Create Order
- **Description:** Creates a new customer order in DRAFT status.
- **Business Rules:**
  - BR-11-01: Auto-generates unique `orderNumber`.
  - BR-11-02: `eventDate` must be in the future.
- **Request Body:**
```json
{
  "customerId": "customer-uuid",
  "eventDate": "2026-10-15T00:00:00Z",
  "venueAddress": "123 Event Hall"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully.",
  "data": { "id": "new-order-uuid" }
}
```

### `PUT /api/v1/orders/:id/confirm`
- **Use Case:** UC 2.11 - Confirm Order
- **Description:** Confirms an order after quotation agreement and deposit payment. Triggers inventory reservation.
- **Business Rules:**
  - BR-11-03: System checks if there is an `ACCEPTED` quotation. Returns MSG-UC11-04 if missing.
  - BR-11-04: Transitions status to `CONFIRMED`.
  - BR-11-05: System triggers automatic inventory reservation logic (UC 2.13).
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Order confirmed.",
  "data": { "status": "CONFIRMED" }
}
```

### `PUT /api/v1/orders/:id/change-date`
- **Use Case:** UC 2.11 - Change Event Date
- **Description:** Changes the event date, rechecking inventory availability.
- **Business Rules:**
  - BR-11-06: Validates if `newEventDate` is available for all reserved items.
  - BR-11-07: Applies `DATE_CHANGE` policy if applicable.
- **Request Body:**
```json
{
  "newEventDate": "2026-11-01T00:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Order date updated."
}
```

### `PUT /api/v1/orders/:id/close`
- **Use Case:** UC 2.11 - Confirm Order Closure
- **Description:** Reviews all final order data and closes the order.
- **Business Rules:**
  - BR-11-08: All payments, settlements, and warehouse returns must be completed before closure.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Order closed successfully.",
  "data": { "status": "COMPLETED" }
}
```

## 2. Field Change Request Management (UC 2.27)

### `POST /api/v1/orders/:id/change-requests`
- **Use Case:** UC 2.27 - Record Change Request
- **Description:** Submits an on-site change request (add/remove items).
- **Request Body:**
```json
{
  "requestDetails": {
    "addedItems": [{ "catalogItemId": "item-uuid", "quantity": 1 }],
    "removedItems": []
  },
  "additionalCost": 150.00
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Change request submitted for approval."
}
```

### `PUT /api/v1/change-requests/:id/approve`
- **Use Case:** UC 2.27 - Approve Change Request
- **Description:** Approves or rejects a field change request.
- **Business Rules:**
  - BR-27-01: Approval updates `Order` financial totals.
- **Request Body:**
```json
{
  "status": "APPROVED"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Change request status updated."
}
```
