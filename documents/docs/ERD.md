# Entity Relationship Diagram (ERD)

## 1. System Overview
This document outlines the core Entity Relationship Diagram (ERD) based on the comprehensive 40-table architecture defined in the `BNWEMS.sql` schema. The system handles all operations from customer orders, inventory management, detailed field operations, supplier interactions, up to financial settlements and wage calculations.

## 2. Core Domains & Entities

The ERD is organized into logical domains.

### 1. User & Role Management
- **Role**: Defines permissions and role levels (Admin, Manager, Leader Staff, Technical Staff).
- **InternalUser**: Personnel who can log in and act on the system. Linked to Roles.

### 2. Customer, Supplier & Business Configuration
- **Customer**: Clients who place orders.
- **Supplier**: Partners who provide rental or purchase equipment.
- **BusinessPolicy**: Dynamic configuration for deposits, refunds, cancellations, compensations, and fees.

### 3. Equipment (Catalog)
- **Equipment**: Core dictionary of services, equipment, materials, and packages (replaces catalog items). Includes rental price, cost price, and replacement value.

### 4. Order & Quotation Lifecycle
- **Order**: The central business transaction with a customer.
- **OrderItem**: The finalized list of items for the order, distinguishing between internal and supplier sources.
- **OrderStatusHistory**: Tracks all status transitions for an order.
- **Quotation**: The proposed pricing sent to the customer before order confirmation (supports versioning).
- **QuotationItem**: The items and their line totals within a quotation.

### 5. Payment & Settlement
- **CompanyBankAccount**: Bank accounts used for receiving transfers.
- **PaymentRequest**: Requests sent to customers to pay deposits or final amounts.
- **Payment**: Actual confirmed receipts of money.
- **Settlement**: Detailed financial reconciliation of the order (original value, changes, fees, compensations).
- **SettlementLine**: Line items detailing each financial adjustment applied in a settlement.

### 6. Scheduling
- **Schedule**: Specific planned milestones (survey, preparation, transport, execution, collection, return). Combines schedule plans and activities.

### 7. Task Execution & Staff Management
- **WorkTask**: Specific operational duties linked to schedule activities.
- **Assignment**: Linking a `WorkTask` to an `InternalUser`.
- **TaskProgressUpdate**: Real-time status updates from the field.
- **Attendance**: Check-in/check-out tracking for assigned tasks.
- **StaffAvailability**: Tracking whether staff are available on specific dates.

### 8. Wage Calculation
- **WageRule**: Pay rates based on roles.
- **WageSummary**: Aggregated pay for a user over a period or order, including total sessions, gross amount, and deductions.

### 9. Inventory Operations
- **Inventory**: Real-time stock levels per equipment (no multi-warehouse support). Includes available, reserved, and damaged quantities.
- **InventoryReservation**: Stock reserved for upcoming confirmed orders.
- **InventoryReservationItem**: The reserved equipment items.
- **InventoryReport**: Checkouts, collections, and returns logged by staff.
- **InventoryReportItem**: The equipment items reported, along with condition status.

### 10. Supplier Transactions
- **SupplierTransaction**: Sub-contracts with suppliers for specific orders (rental or purchase).
- **SupplierTransactionItem**: The items transacted with the supplier.
- **SupplierPayment**: Tracking what we've paid to suppliers.

### 11. Field Operations (Mobile)
- **SurveyReport**: Pre-event site surveys.
- **ChangeRequest**: On-site adjustments by the customer (add/remove/replace).
- **ChangeRequestItem**: The items to change.
- **HandoverRecord**: Formal customer sign-off on installation.
- **DamageLossReport**: Tracking items broken or lost during the event.
- **DamageLossItem**: The specific items damaged or lost, along with compensation amount.

### 12. System Audit & Evidence
- **Notification**: Alerts sent to internal users via push notifications.
- **DeviceToken**: Managing Firebase Cloud Messaging (FCM) tokens for push notifications.
- **Evidence**: Polymorphic table storing file URLs (photos, PDFs) attached to various entities (payments, reports, handovers).
- **AuditLog**: Immutable ledger of critical actions (login, create, confirm).

## 3. Key Relationships & Workflows

- **The Order Hub:** `Order` is strictly 1:1 with `Settlement`. It has 1:N relationships with `Quotation`, `OrderStatusHistory`, `PaymentRequest`, `WorkTask`, `ChangeRequest`, `HandoverRecord`, `Schedule`, `DamageLossReport`, `SurveyReport`, `InventoryReservation`, and `InventoryReport`.
- **The Physical Flow:** An `Order` creates an `InventoryReservation`. A `Schedule` spawns a `WorkTask`. The `WorkTask` drives operations and triggers an `InventoryReport` (checkout/return), which updates the `Inventory` quantities directly.
- **The Financial Flow:** `Quotation` establishes expected value. `PaymentRequest` drives actual `Payment`. Any `ChangeRequest` or `DamageLossReport` alters the final `Settlement`.
- **The Subcontracting Flow:** If internal inventory is insufficient, a `SupplierTransaction` is created. Payments to suppliers are recorded via `SupplierPayment`.
- **The HR Flow:** An `Assignment` leads to `Attendance`. Pay is governed by `WageRule` and aggregated into a `WageSummary` for the staff member.
