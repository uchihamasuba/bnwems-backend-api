# Finance & Analytics: Reporting & Dashboards

## Overview
This module handles **UC 2.7 (Reporting Management)**, **UC 2.8 (Operational Dashboard)**, and **UC 2.15 (Operational Result Verification)**.
These endpoints aggregate data across Orders, Inventory, Supplier Debt, and Staff Wages.

## Standard Error Codes (SRS Mapping)
- `MSG-UC07-01`: Invalid date range for reports.
- `MSG-UC08-01`: Dashboard metrics unavailable.
- `MSG-UC15-01`: Order results are incomplete for verification.

## 1. Reporting Management (UC 2.7)

### `GET /api/v1/reports/revenue`
- **Use Case:** UC 2.7 - View Revenue Reports
- **Description:** Retrieves aggregated revenue statistics. Admin access required.
- **Business Rules:**
  - BR-07-01: Must specify `startDate` and `endDate`.
- **Query Parameters:** 
  - `startDate` (string, format YYYY-MM-DD)
  - `endDate` (string, format YYYY-MM-DD)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 150000.00,
    "breakdownByMonth": [
      { "month": "2026-06", "revenue": 25000.00 }
    ],
    "topCustomers": [
      { "customerId": "customer-uuid", "revenue": 10000.00 }
    ]
  }
}
```

### `GET /api/v1/reports/inventory`
- **Use Case:** UC 2.7 - View Inventory Reports & Statistics
- **Description:** Retrieves aggregated reports on inventory usage, damage, and loss. Admin access required.
- **Query Parameters:** 
  - `startDate` (string)
  - `endDate` (string)
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalDamaged": 10,
    "totalLost": 2,
    "mostUsedItems": [ 
      { "catalogItemId": "item-uuid", "itemName": "Standard Speaker", "usageCount": 50 } 
    ]
  }
}
```

## 2. Operational Dashboards (UC 2.8)

### `GET /api/v1/dashboard/admin`
- **Use Case:** UC 2.8 - View Administrative Dashboard
- **Description:** Returns high-level operational and financial KPIs for the Admin.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activeOrders": 15,
    "totalRevenueMonth": 25000.00,
    "unpaidSupplierDebt": 2000.00,
    "recentOrders": [
      { "orderId": "order-uuid", "status": "CONFIRMED" }
    ]
  }
}
```

### `GET /api/v1/dashboard/manager`
- **Use Case:** UC 2.8 - View Operational Dashboard
- **Description:** Returns real-time task statuses, active orders, and pending approvals for the Manager.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "ordersInProgress": 5,
    "pendingChangeRequests": 2,
    "tasksToday": 8,
    "alerts": [
      { "type": "DELAYED_TASK", "taskId": "task-uuid" }
    ]
  }
}
```

## 3. Operational Result Verification (UC 2.15)

### `GET /api/v1/reports/verification`
- **Use Case:** UC 2.15 - Operational Result Verification
- **Description:** Manager pulls a compiled report of an order's operational results (survey, field progress, handover, damage) to verify before final settlement.
- **Business Rules:**
  - BR-15-01: Verifies all task statuses for the order are `COMPLETED`. If not, raises `MSG-UC15-01`.
- **Query Parameters:** `?orderId=order-uuid`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "tasksCompleted": 5,
    "totalTasks": 5,
    "handoverStatus": "AGREED",
    "damageLossRecorded": true,
    "changeRequestsProcessed": true,
    "verificationStatus": "READY_FOR_SETTLEMENT"
  }
}
```
