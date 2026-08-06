# Finance & Analytics: Reporting & Dashboards

## Overview
This module handles **UC 2.7 (Reporting Management)**, **UC 2.8 (Operational Dashboard)**, and **UC 2.15 (Operational Result Verification)**.
These endpoints aggregate data across Orders, Inventory, Supplier Debt, and Staff Operations.

## Standard Error Codes (SRS Mapping)
- `MSG-UC07-01`: Khoảng thời gian báo cáo không hợp lệ.
- `MSG-UC08-01`: Số liệu thống kê không khả dụng.
- `MSG-UC15-01`: Kết quả đơn hàng chưa đầy đủ để xác minh.

---

## 1. Reporting Management (UC 2.7)

### 1. `GET /api/v1/reports/revenue`
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
  "code": "MSG-RP-01",
  "data": {
    "totalRevenue": 150000000.00,
    "breakdownByMonth": [
      { "month": "2026-06", "revenue": 25000000.00 }
    ],
    "topCustomers": [
      { "customerId": 1, "customerName": "Trần Thị B", "revenue": 10000000.00 }
    ]
  }
}
```

### 2. `GET /api/v1/reports/inventory`
- **Use Case:** UC 2.7 - View Inventory Reports & Statistics
- **Description:** Retrieves aggregated reports on inventory usage, damage, and loss based on `InventoryMovement` and `CollectedEquipmentReport`. Admin access required.
- **Query Parameters:** 
  - `startDate` (string)
  - `endDate` (string)
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-RP-02",
  "data": {
    "totalDamaged": 10,
    "totalLost": 2,
    "mostUsedItems": [ 
      { "itemId": 1, "itemName": "Loa JBL", "usageCount": 50 } 
    ]
  }
}
```

---

## 2. Operational Dashboards (UC 2.8)

### 3. `GET /api/v1/dashboard/admin`
- **Use Case:** UC 2.8 - View Administrative Dashboard
- **Description:** Returns high-level operational and financial KPIs for the Admin.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-RP-03",
  "data": {
    "activeOrders": 15,
    "totalRevenueMonth": 25000000.00,
    "unpaidSupplierDebt": 2000000.00,
    "recentOrders": [
      { "orderId": 1, "orderStatus": "Đã xác nhận" }
    ]
  }
}
```

### 4. `GET /api/v1/dashboard/manager`
- **Use Case:** UC 2.8 - View Operational Dashboard
- **Description:** Returns real-time task statuses, active orders, and pending alerts for the Manager.
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-RP-04",
  "data": {
    "ordersInProgress": 5,
    "pendingWarnings": 2,
    "tasksToday": 8,
    "alerts": [
      { "type": "warning", "warningId": 1, "content": "Thiếu thiết bị" }
    ]
  }
}
```

---

## 3. Operational Result Verification (UC 2.15)

### 5. `GET /api/v1/reports/verification`
- **Use Case:** UC 2.15 - Operational Result Verification
- **Description:** Manager pulls a compiled report of an order's operational results (survey, schedule plans, warnings, damage/loss) to verify before final settlement.
- **Business Rules:**
  - BR-15-01: Verifies all `SchedulePlan` statuses for the order are `Hoàn thành`. If not, raises `MSG-UC15-01`.
- **Query Parameters:** `?orderId=100`
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-RP-05",
  "data": {
    "orderId": 100,
    "tasksCompleted": 5,
    "totalTasks": 5,
    "warningsResolved": true,
    "damageLossRecorded": true,
    "verificationStatus": "ready_for_settlement"
  }
}
```

---

## 4. Manager Approvals

### 6. `GET /api/v1/manager/approvals`
- **Use Case:** UC 2.8 - View Pending Approvals
- **Description:** Retrieves a list of pending items requiring manager approval/resolution (e.g., Unresolved Warnings, Pending Survey Reports, Pending Supplier Transactions).
- **Response (200 OK):**
```json
{
  "success": true,
  "code": "MSG-RP-06",
  "message": "Pending approvals retrieved successfully",
  "data": {
    "orderWarnings": [
      {
        "warningId": 1,
        "orderId": 100,
        "content": "Khách yêu cầu thêm đèn",
        "createdAt": "2026-06-22T10:00:00Z"
      }
    ],
    "surveyReports": [
      {
        "surveyId": 1,
        "orderId": 100,
        "status": "Cần xem xét",
        "createdAt": "2026-06-22T10:00:00Z"
      }
    ]
  }
}
```
