# Master Data & Policies: Policy, Attendance, and Wage Management

## Overview
This module handles **UC 2.6 (Policy Configuration)**, **UC 2.29 (Attendance & Task Completion)**, and **UC 2.17 (Staff Wage Confirmation)**.
It manages `BusinessPolicy` records, staff `Attendance`, and their monthly `WageSummary`.

## Standard Error Codes (SRS Mapping)
- `MSG-UC06-01`: Required information is missing or invalid.
- `MSG-UC06-02`: System cannot complete the request.
- `MSG-UC29-01`: Location out of bounds for check-in.
- `MSG-UC17-01`: Unresolved attendance issues prevent wage confirmation.

## 1. Policy Configuration (UC 2.6)

### `GET /api/v1/policies`
- **Use Case:** UC 2.6 - View Policy List
- **Description:** Retrieves the list of configured business policies. Admin access required.
- **Query Parameters:**
  - `policyType` (enum, optional) - DEPOSIT, REFUND, CANCELLATION, etc.
  - `isActive` (boolean, optional)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "policy-uuid",
      "policyType": "DEPOSIT",
      "name": "Standard Deposit Policy",
      "rules": { "percentage": 50 },
      "isActive": true,
      "createdAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "totalCount": 10 }
}
```

### `POST /api/v1/policies`
- **Use Case:** UC 2.6 - Create Policy
- **Description:** Creates a new business policy. Admin access required.
- **Business Rules:**
  - BR-06-01: Rule constraints (e.g. percentages) must be between 0 and 100.
  - BR-06-02: Log to `AuditLog`.
- **Request Body:**
```json
{
  "policyType": "CANCELLATION",
  "name": "7-Day Cancellation",
  "rules": { "refundPercentage": 100, "daysBeforeEvent": 7 }
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Policy created successfully."
}
```

### `PUT /api/v1/policies/:id`
- **Use Case:** UC 2.6 - Update Policy
- **Description:** Updates an existing policy. Admin access required.
- **Business Rules:**
  - BR-06-03: Active orders use the policy that was in effect at the time of order confirmation.
- **Request Body:**
```json
{
  "rules": { "refundPercentage": 80, "daysBeforeEvent": 7 }
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Policy updated successfully."
}
```

## 2. Attendance & Task Completion (UC 2.29)

### `POST /api/v1/attendance/check-in`
- **Use Case:** UC 2.29 - Check-in Attendance
- **Description:** Allows staff to check in for their assigned work session.
- **Business Rules:**
  - BR-29-01: System verifies that current time is within allowed schedule buffer.
  - BR-29-02: Optional GPS location verification against task location.
- **Request Body:**
```json
{
  "assignmentId": "assignment-uuid",
  "checkInTime": "2026-06-22T08:00:00Z",
  "locationCoordinates": "10.762622, 106.660172"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Check-in successful."
}
```

### `PUT /api/v1/attendance/:id/confirm`
- **Use Case:** UC 2.29 - Confirm Technical Staff Attendance & Work Completion
- **Description:** Leader staff confirms the attendance and task completion of technical staff.
- **Business Rules:**
  - BR-29-03: Changes attendance status to `CONFIRMED` or `REJECTED`.
- **Request Body:**
```json
{
  "status": "CONFIRMED",
  "checkOutTime": "2026-06-22T17:00:00Z"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Attendance confirmed."
}
```

## 3. Staff Wage Confirmation (UC 2.17)

### `GET /api/v1/wages/summary`
- **Use Case:** UC 2.17 - Monitor Staff Wage Data (implied)
- **Description:** Retrieves wage summaries for staff by period. Manager access required.
- **Query Parameters:**
  - `period` (string, format YYYY-MM)
  - `userId` (string, optional)
  - `status` (enum, optional) - DRAFT, CONFIRMED, PAID
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "wage-uuid",
      "userId": "user-uuid",
      "wagePeriod": "2026-06",
      "totalWage": 1500.00,
      "deductions": 50.00,
      "netWage": 1450.00,
      "status": "DRAFT",
      "updatedAt": "2026-06-22T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "totalCount": 10 }
}
```

### `POST /api/v1/wages/summary/:id/confirm`
- **Use Case:** UC 2.17 - Confirm Staff Work and Wage
- **Description:** Confirms the wage summary for a staff member after verifying attendance and deductions.
- **Business Rules:**
  - BR-17-01: Manager confirms the system-calculated `netWage`.
  - BR-17-02: Wage cannot be confirmed if there are `PENDING` attendances for the period.
- **Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Reviewed and approved."
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Wage summary confirmed."
}
```
