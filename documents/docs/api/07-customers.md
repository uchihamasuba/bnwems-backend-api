# Sales & Customer Lifecycle: Customer Management

## Overview
This module handles **UC 2.9 (Customer Management)**.
It deals with the registration, retrieval, and updating of `Customer` records. Customers themselves do not access the system; internal managers handle their profiles.

## Standard Error Codes (SRS Mapping)
- `MSG-UC09-01`: Required information is missing or invalid.
- `MSG-UC09-02`: System cannot complete the request.
- `MSG-UC09-03`: You do not have permission to perform this action.
- `MSG-UC09-05`: Customer phone number already exists.

## Endpoints

### `GET /api/v1/customers`
- **Use Case:** UC 2.9 - View Customer Information
- **Description:** Retrieves a paginated list of customers. Manager access required.
- **Query Parameters:**
  - `page` (number, default 1)
  - `limit` (number, default 20)
  - `search` (string, optional) - searches `fullName`, `phone`, or `email`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer-uuid",
      "fullName": "Jane Doe",
      "phone": "+198765432",
      "email": "jane@example.com",
      "address": "123 Event Street",
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 100 }
}
```

### `GET /api/v1/customers/:id`
- **Use Case:** UC 2.9 - View Customer Information
- **Description:** Retrieves details of a specific customer by ID.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "customer-uuid",
    "fullName": "Jane Doe",
    "phone": "+198765432",
    "email": "jane@example.com",
    "address": "123 Event Street",
    "createdAt": "2026-06-22T10:00:00Z",
    "updatedAt": "2026-06-22T10:00:00Z"
  }
}
```

### `POST /api/v1/customers`
- **Use Case:** UC 2.9 - Register Customer
- **Description:** Registers a new customer in the system.
- **Business Rules:**
  - BR-09-01: Phone number must be unique. If it exists, return `MSG-UC09-05`.
  - BR-09-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "fullName": "Jane Doe",
  "phone": "+198765432",
  "email": "jane@example.com",
  "address": "123 Event Street"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Customer registered successfully.",
  "data": { "id": "customer-uuid" }
}
```

### `PUT /api/v1/customers/:id`
- **Use Case:** UC 2.9 - Update Customer
- **Description:** Updates the profile information of an existing customer.
- **Request Body:**
```json
{
  "fullName": "Jane Doe Smith",
  "email": "jane.smith@example.com",
  "address": "456 New Venue Ave"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Customer updated successfully."
}
```
