# Entity Relationship Diagram (ERD)

## 1. System Overview
This document outlines the core Entity Relationship Diagram (ERD) based on the comprehensive 60-table architecture defined in the `BNWEMS.sql` schema. The system handles all operations from customer orders, dynamic pricing, advanced inventory management, detailed field operations, supplier interactions, up to complex financial settlements and wage calculations.

## 2. Core Domains & Entities

Due to the scale of the system (60 tables), the ERD is organized into logical domains. 

### 1. User & Role Management
- **Role**: Defines permissions and role levels (Admin, Manager, Leader Staff, Technical Staff).
- **InternalUser**: Personnel who can log in and act on the system. Linked to Roles.

### 2. Customer & Business Configuration
- **Customer**: Clients who place orders.
- **Supplier**: Partners who provide rental or purchase equipment.
- **Warehouse**: Physical locations for inventory storage.
- **CatalogItem**: Core dictionary of services, equipment, materials, and packages.
- **BusinessPolicy**: Dynamic configuration for deposits, refunds, cancellations, and wages.

### 3. Catalog Pricing & History
- **ItemPriceHistory**: Tracks historical rental prices for catalog items.
- **ItemCostHistory**: Tracks historical costs/replacement values for catalog items.

### 4. Order & Quotation Lifecycle
- **Order**: The central business transaction with a customer.
- **Quotation** / **QuotationItem**: The proposed pricing and item lists sent to the customer before order confirmation.
- **OrderItem**: The finalized list of items for the order, distinguishing between internal and supplier sources.
- **OrderStatusHistory**: Audit trail of order status transitions.
- **OrderOutstandingCase**: Tracks unresolved operational issues before an order can be financially closed.
- **RevenueRecord**: The final recognized snapshot of revenue and costs for an order.

### 5. Payment & Settlement
- **CompanyBankAccount**: Bank accounts used for receiving transfers.
- **PaymentRequest**: Requests sent to customers (with VietQR) to pay deposits or final amounts.
- **Payment**: Actual confirmed receipts of money.
- **Settlement** / **SettlementLine**: Detailed financial reconciliation of the order (original value, changes, fees, compensations).

### 6. Scheduling & Planning
- **SchedulePlan**: The overarching plan for an order.
- **ScheduleActivity**: Specific planned milestones (preparation, transport, execution, collection, return).

### 7. Task Execution & Staff Management
- **WorkTask**: Specific operational duties linked to schedule activities.
- **Assignment**: Linking a `WorkTask` to an `InternalUser`.
- **TaskProgressUpdate**: Real-time status updates from the field.
- **Attendance**: Check-in/check-out tracking for assigned tasks.
- **StaffAvailability**: Tracking whether staff are available on specific dates.

### 8. Wage Calculation
- **WageRule**: Pay rates based on roles.
- **WageSummary** / **WageSummaryLine**: Aggregated pay for a user over a period or order.
- **WageDeduction**: Penalties or deductions.
- **WagePayment**: Records of actual money transferred to staff.

### 9. Inventory & Warehouse Operations
- **Inventory**: Real-time stock levels per catalog item per warehouse.
- **InventoryReservation** / **InventoryReservationItem**: Stock reserved for upcoming confirmed orders.
- **InventoryReport** / **InventoryReportItem**: Checkouts, collections, and returns logged by staff.
- **WarehouseHistory** / **WarehouseHistoryItem**: The actual stock movement ledger updating `Inventory`.
- **PickList** / **PickListItem**: Checklists for warehouse staff to pick items.
- **EquipmentMaintenance**: Tracking items sent for repair.

### 10. Supplier Management
- **SupplierTransaction** / **SupplierTransactionItem**: Sub-contracts with suppliers for specific orders.
- **SupplierReceiptReport** / **SupplierReceiptReportItem**: Tracking receipt of supplier goods.
- **SupplierReturnReport** / **SupplierReturnReportItem**: Tracking return of supplier goods and assessing damage.
- **SupplierDebt** / **SupplierPayment**: Tracking what we owe suppliers and what we've paid them.

### 11. Field Operations (Mobile)
- **SurveyReport**: Pre-event site surveys.
- **ChangeRequest** / **ChangeRequestItem**: On-site adjustments by the customer (add/remove/replace).
- **HandoverRecord**: Formal customer sign-off on installation.
- **DamageLossReport** / **DamageLossItem**: Tracking items broken or lost during the event.

### 12. System Audit & Evidence
- **Notification**: Alerts sent to internal users.
- **AuditLog**: Immutable ledger of critical actions (login, confirm, delete).
- **Evidence**: Polymorphic table storing file URLs (photos, PDFs) attached to various entities (payments, reports, handovers).

## 3. Key Relationships & Workflows

- **The Order Hub:** `Order` is strictly 1:1 with `Quotation`, `Settlement`, `SchedulePlan`, `RevenueRecord`. It has 1:N relationships with `PaymentRequest`, `WorkTask`, `ChangeRequest`, `HandoverRecord`, and `InventoryReservation`.
- **The Physical Flow:** An `Order` creates an `InventoryReservation`. A `ScheduleActivity` spawns a `PickList` and a `WorkTask`. The `WorkTask` triggers an `InventoryReport` (checkout), which in turn creates a `WarehouseHistory` ledger entry, updating the actual `Inventory`.
- **The Financial Flow:** `Quotation` establishes expected value. `PaymentRequest` drives actual `Payment`. Any `ChangeRequest` or `DamageLossReport` alters the final `Settlement`. `RevenueRecord` is generated only when all `OrderOutstandingCase` items are resolved.
- **The Subcontracting Flow:** If `Inventory` is short, a `SupplierTransaction` is created, leading to `SupplierReceiptReport` (inbound), `SupplierReturnReport` (outbound), and `SupplierDebt`.
- **The HR Flow:** An `Assignment` leads to `Attendance`. `Attendance` combined with `WageRule` creates `WageSummaryLine`, ultimately resolving into a `WagePayment`.
