# Entity Relationship Diagram (ERD)

## 1. System Overview
This document outlines the core Entity Relationship Diagram (ERD) based on the updated `BNWEMS.sql` schema (v2/v6). The system handles all operations from customer orders, inventory management (using category/type/item hierarchy), field operations, supplier interactions, up to financial settlements and wage calculations.

## 2. Core Domains & Entities

The ERD is organized into logical domains.

### 1. User & Role Management
- **InternalUser**: Personnel who can log in and act on the system. Enums define their roles (Admin, Manager, Leader, Technical) and status.
- **DeviceToken**: Managing Firebase Cloud Messaging (FCM) tokens for push notifications across multiple platforms.
- **AuditLog**: Immutable ledger of critical actions (login, create, confirm).

### 2. Evidence & Notifications
- **Evidence**: A central, polymorphic table storing file URLs (photos, PDFs) from Firebase. Many entities (Deposits, Settlements, Schedule Plans, Attendances, Survey Reports) link their `evidence_id` directly to this table.
- **Notification**: Alerts created by the system or users.
- **NotificationRecipient**: Tracking read status and push delivery per user.

### 3. Customer & Business Configuration
- **Customer**: Clients who place orders.
- **BusinessPolicy**: Dynamic configuration for deposits, refunds, cancellations, compensations, and wages. Uses standard units (Day, Percent, VND).

### 4. Catalog & Inventory (No Warehouse)
- **ItemCategory**: Top-level grouping (e.g., Furniture, Lighting).
- **ItemType**: Detailed categorization within a category (e.g., Chavari Chairs).
- **Item**: The core operational asset for rent (e.g., GHE-CHIAVARI).
- **ItemTypeSpec**: The composition of an `ItemType` (e.g., 1 Table + 6 Chairs).
- **Inventory**: Real-time stock tracking directly linked to an `Item`. (Note: The system assumes a single enterprise warehouse, so location tracking inside a multi-warehouse setup is obsolete).

### 5. Order & Quotation Lifecycle
- **Order**: The central business transaction with a customer. Captures event type, date, location.
- **OrderItem**: The finalized list of items for the order, including `prepared_qty` and `prepared_by` to track warehouse preparation directly (replacing separate pick list tables).
- **OrderWarning**: Configurable alerts or risks tied to an order that can be resolved by staff.
- **Quotation**: The proposed pricing sent to the customer before order confirmation.
- **QuotationItem**: The items and their line totals within a quotation.

### 6. Payments, Deposits & Settlement
- **Deposit**: Tracks requested and paid deposits for an order. Includes evidence linking and QR codes.
- **Settlement**: Detailed financial reconciliation of the order (original value, changes, fees, compensations). Tracks final payment.

### 7. Task Execution, Schedule & Staff Management
- **WorkTask**: A catalog of standardized tasks (e.g., Survey, Setup, Teardown).
- **SchedulePlan**: Specific assignment of a `WorkTask` to an `InternalUser` for a given `Order`, time, and location. Includes handover evidence.
- **Attendance**: Real-time check-in and check-out against a `SchedulePlan`. Includes photo evidence of presence.

### 8. Field Operations & Reports
- **SurveyReport**: Pre-event site surveys measuring area, constraints, and proposed items.
- **CollectedEquipmentReport**: Reports from staff recovering equipment from the field or returning to suppliers.
- **CollectedEquipmentReportItem**: Detailed breakdown of good, damaged, or lost items.
- **InventoryMovement**: Immutable ledger of all stock quantity changes (Outbound, Inbound, Adjustments).

### 9. Supplier Transactions
- **Supplier**: Partners who provide rental or purchase equipment.
- **SupplierTransaction**: Sub-contracts with suppliers for specific orders (rental or purchase). Tracks costs and deposit amounts.
- **SupplierTransactionItem**: The items transacted with the supplier and received quantities.

### 10. Wage Calculation
- **WageRecord**: Direct compensation log calculated per order, per user, based on their role and number of shifts. Replaces periodic wage summaries with order-based granularity.

## 3. Key Relationships & Workflows

- **The Order Hub:** `Order` is the primary anchor. It links to exactly one `Quotation`, `Settlement`, and `BusinessPolicy`. It generates 1:N relations for `SchedulePlan`, `Deposit`, `OrderItem`, `SupplierTransaction`, `SurveyReport`, `WageRecord`, and `CollectedEquipmentReport`.
- **The Catalog & Inventory Flow:** `ItemCategory` -> `ItemType` -> `Item` -> `Inventory`. There are no intermediate physical locations; `Inventory` holds total, damaged, and reserved counters.
- **The Physical Flow:** An `Order` triggers `SchedulePlan`s (giao việc). Staff use the Staff App to check in via `Attendance`. Preparing goods updates `prepared_qty` on `OrderItem`. After the event, `CollectedEquipmentReport` drives `InventoryMovement`, adjusting the `Inventory` counts directly.
- **The Financial Flow:** Customers pay `Deposit`s. `Settlement` resolves the final bill. `SupplierTransaction` handles outgoing expenses. `WageRecord` calculates internal labor costs per order.
- **The Subcontracting Flow:** If internal inventory is insufficient, a `SupplierTransaction` is created. `CollectedEquipmentReport` tracks returning those items to the supplier.
