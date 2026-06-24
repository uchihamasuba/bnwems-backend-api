# Entity Relationship Diagram (ERD)

## 1. System Overview
This document outlines the core Entity Relationship Diagram (ERD) based on the updated 23-entity architecture defined in Report 3 (Section 1.5). The system uses these 23 core entities to manage all operations from customer orders to inventory, staff tasks, and final settlements.

## 2. Core Entities

| ID | Entity | Description |
|---|---|---|
| 1 | Internal User | Internal personnel who can log in to the system, including Admin, Manager, Leader Staff, and Technical Staff. |
| 2 | Customer | Customer who books wedding/event services. The Customer is the source of orders but does not log in to or directly use the system. |
| 3 | Supplier | External partner that supplies, rents, or sells equipment/materials for an order when internal inventory is insufficient or additional items are needed. |
| 4 | Catalog Item | Catalog of services, equipment, materials, consumables, or packages used in quotations, orders, inventory, or supplier transactions. |
| 5 | Business Policy | Set of configurable business policies, including deposit, refund, cancellation, date change, additional fee, discount, and compensation policies. |
| 6 | Order | Core entity of the system, representing a service request/contract from a Customer, from initial request to completion or cancellation. |
| 7 | Quotation | Quotation version created by the Manager for an Order before the Customer agrees and the Order is confirmed. |
| 8 | Payment | Financial transaction between the Customer and the business, including deposit, final payment, on-site payment, or customer refund. |
| 9 | Settlement | Final financial reconciliation of an Order, summarizing order value, additional charges, compensation, received payments, and remaining amount. |
| 10 | Change Request | On-site change request from the Customer, such as adding, removing, or replacing items in an Order. |
| 11 | Work Task | Specific operational tasks required to complete an Order, such as survey, preparation, checkout, transportation, installation, collection, or warehouse return. |
| 12 | Assignment | Allocation of a Work Task to a specific Internal User, identifying which staff member is assigned to which task. |
| 13 | Warehouse | Main physical warehouse of the business used to store equipment/materials and manage checkout, return, and inventory adjustment activities. |
| 14 | Inventory | Actual stock data of each Catalog Item in the Warehouse, including available, reserved, checked-out, in-use, maintenance, damaged, and lost quantities. |
| 15 | Warehouse History | Warehouse transaction history recording checkout, return, receiving, returning, inventory adjustment, or item condition updates. |
| 16 | Supplier Transaction | Rental or purchase transaction with a Supplier for a specific Order. |
| 17 | Handover Record | Acceptance and handover record after installation, recording handover status, Customer agreement, and related evidence. |
| 18 | Damage/Loss Report | Report recording damaged or lost equipment/materials during collection, inspection, or warehouse return. |
| 19 | Supplier Debt | Debt amount owed to a Supplier from Supplier Transactions, including rental/purchase costs and compensation if any. |
| 20 | Attendance | Attendance data of Leader Staff or Technical Staff based on Assignment, working date, and working session. |
| 21 | Wage Summary | Wage summary of each staff member for a wage period, usually monthly, based on confirmed Attendance records. |
| 22 | Evidence | Evidence uploaded to the system, including photos, receipts, payment proofs, handover images, survey photos, or damage/loss images. |
| 23 | Notification | Internal notification sent by the system to an Internal User, such as task assignment, confirmation request, pending payment approval, or field report alert. |

## 3. Key Relationships

- **Users & Operations:** `Internal User` handles `Work Task` via `Assignment`. Staff `Attendance` drives `Wage Summary`.
- **Sales & Customers:** `Customer` places `Order`. `Order` has `Quotation`, `Payment`, `Settlement`, and possible `Change Request`.
- **Inventory & Suppliers:** `Order` relies on `Catalog Item` managed via `Inventory` in `Warehouse`. Stock movements are logged in `Warehouse History`. Shortages trigger `Supplier Transaction` linking `Supplier` and adding to `Supplier Debt`.
- **Field Reporting:** `Order` generates `Handover Record`, `Damage/Loss Report`, and `Evidence`.
- **System:** `Business Policy` affects `Order` lifecycle (e.g. deposit, refund, cancel) and `Internal User` acts upon `Notification`.
