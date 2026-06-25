# Database Schema

## 1. Overview
The database schema has been thoroughly updated to align with the physical SQL seed data (`BNWEMS.sql`), replacing the high-level 23-entity architecture with a detailed 60-table schema. 
This schema is defined in Prisma ORM notation, adhering to the `camelCase` naming convention for all properties and relations. It covers everything from Authentication, Catalog, and Orders to detailed Field Operations, Inventory, Supplier management, and Finance.

## 2. Prisma Schema Definition

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// =============================================================================
// 1. USER & ROLE
// =============================================================================

model Role {
  roleId      BigInt         @id @default(autoincrement()) @map("role_id")
  roleName    String         @unique @db.VarChar(50) @map("role_name")
  description String?        @db.VarChar(255)
  
  users       InternalUser[]

  @@map("roles")
}

model InternalUser {
  userId       BigInt         @id @default(autoincrement()) @map("user_id")
  roleId       BigInt @map("role_id")
  role         Role           @relation(fields: [roleId], references: [roleId])
  username     String         @unique @db.VarChar(100)
  passwordHash String         @db.VarChar(255) @map("password_hash")
  fullName     String         @db.VarChar(150) @map("full_name")
  email        String?        @unique @db.VarChar(150)
  phone        String?        @db.VarChar(20)
  status       String         @default("active") // active, inactive
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  @@map("internal_users")
}

// =============================================================================
// 2. CUSTOMER & POLICY
// =============================================================================

model Customer {
  customerId   BigInt         @id @default(autoincrement()) @map("customer_id")
  fullName     String         @db.VarChar(150) @map("full_name")
  phone        String?        @unique @db.VarChar(20)
  email        String?        @db.VarChar(150)
  address      String?        @db.VarChar(255)
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  @@map("customers")
}

model Supplier {
  supplierId    BigInt         @id @default(autoincrement()) @map("supplier_id")
  name          String         @db.VarChar(150)
  contactPerson String?        @db.VarChar(150) @map("contact_person")
  phone         String?        @db.VarChar(20)
  address       String?        @db.VarChar(255)
  status        String         @default("active") // active, inactive

  @@map("suppliers")
}

model Warehouse {
  warehouseId   BigInt         @id @default(autoincrement()) @map("warehouse_id")
  name          String         @db.VarChar(150)
  address       String?        @db.VarChar(255)
  status        String         @default("active") // active, inactive

  @@map("warehouses")
}

model CatalogItem {
  catalogItemId      BigInt         @id @default(autoincrement()) @map("catalog_item_id")
  code               String         @unique @db.VarChar(50)
  name               String         @db.VarChar(150)
  category           String?        @db.VarChar(100)
  unit               String?        @db.VarChar(30)
  currentRentalPrice Decimal        @default(0) @db.Decimal(12,2) @map("current_rental_price")
  currentCost        Decimal        @default(0) @db.Decimal(12,2) @map("current_cost")
  replacementValue   Decimal        @default(0) @db.Decimal(12,2) @map("replacement_value")
  status             String         @default("active") // active, inactive
  createdAt          DateTime       @default(now()) @map("created_at")
  updatedAt          DateTime       @updatedAt @map("updated_at")

  @@map("catalog_items")
}

model BusinessPolicy {
  policyId       BigInt         @id @default(autoincrement()) @map("policy_id")
  policyType     String @map("policy_type") // deposit, cancellation, compensation, additional_fee, wage
  name           String         @db.VarChar(150)
  config         Json
  effectiveFrom  DateTime       @db.Date @map("effective_from")
  effectiveTo    DateTime?      @db.Date @map("effective_to")
  status         String         @default("active") // active, inactive
  createdBy      BigInt @map("created_by")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  @@map("business_policies")
}

// =============================================================================
// 3. CATALOG PRICE / COST HISTORY
// =============================================================================

model ItemPriceHistory {
  id             BigInt         @id @default(autoincrement())
  catalogItemId  BigInt @map("catalog_item_id")
  price          Decimal        @db.Decimal(12,2)
  effectiveFrom  DateTime @map("effective_from")
  effectiveTo    DateTime? @map("effective_to")
  createdBy      BigInt @map("created_by")

  @@map("item_price_history")
}

model ItemCostHistory {
  id             BigInt         @id @default(autoincrement())
  catalogItemId  BigInt @map("catalog_item_id")
  cost           Decimal        @db.Decimal(12,2)
  effectiveFrom  DateTime @map("effective_from")
  effectiveTo    DateTime? @map("effective_to")
  createdBy      BigInt @map("created_by")

  @@map("item_cost_history")
}

// =============================================================================
// 4. ORDER & QUOTATION
// =============================================================================

model Order {
  orderId             BigInt         @id @default(autoincrement()) @map("order_id")
  customerId          BigInt @map("customer_id")
  eventDate           DateTime       @db.Date @map("event_date")
  eventLocation       String?        @db.VarChar(255) @map("event_location")
  totalValue          Decimal        @default(0) @db.Decimal(12,2) @map("total_value")
  status              String         @default("draft") // draft, confirmed, in_progress, completed, cancelled
  revenueStatus       String         @default("pending") @map("revenue_status") // pending, recognized
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("orders")
}

model Quotation {
  quotationId         BigInt         @id @default(autoincrement()) @map("quotation_id")
  customerId          BigInt @map("customer_id")
  orderId             BigInt         @unique @map("order_id")
  totalAmount         Decimal        @default(0) @db.Decimal(12,2) @map("total_amount")
  status              String         @default("draft") // draft, confirmed, deleted
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("quotations")
}

model QuotationItem {
  id                  BigInt         @id @default(autoincrement())
  quotationId         BigInt @map("quotation_id")
  catalogItemId       BigInt @map("catalog_item_id")
  quantity            Int
  unitPrice           Decimal        @db.Decimal(12,2) @map("unit_price")
  lineTotal           Decimal        @db.Decimal(12,2) @map("line_total")

  @@map("quotation_items")
}

model OrderItem {
  id                  BigInt         @id @default(autoincrement())
  orderId             BigInt @map("order_id")
  catalogItemId       BigInt @map("catalog_item_id")
  quantity            Int
  unitPrice           Decimal        @db.Decimal(12,2) @map("unit_price")
  source              String         @default("internal") // internal, supplier

  @@map("order_items")
}

model OrderStatusHistory {
  id                  BigInt         @id @default(autoincrement())
  orderId             BigInt @map("order_id")
  fromStatus          String?        @db.VarChar(30) @map("from_status")
  toStatus            String         @db.VarChar(30) @map("to_status")
  changedBy           BigInt @map("changed_by")
  note                String?        @db.VarChar(255)
  changedAt           DateTime       @default(now()) @map("changed_at")

  @@map("order_status_history")
}

model OrderOutstandingCase {
  caseId              BigInt         @id @default(autoincrement()) @map("case_id")
  orderId             BigInt @map("order_id")
  caseType            String @map("case_type") // supplier_debt, wage_pending
  referenceId         BigInt @map("reference_id")
  direction           String         @default("out") // out
  amount              Decimal        @default(0) @db.Decimal(12,2)
  status              String         @default("open") // open, resolved
  resolvedBy          BigInt? @map("resolved_by")
  resolvedAt          DateTime? @map("resolved_at")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("order_outstanding_cases")
}

model RevenueRecord {
  revenueRecordId     BigInt         @id @default(autoincrement()) @map("revenue_record_id")
  orderId             BigInt         @unique @map("order_id")
  recognizedPeriod    String         @db.VarChar(7) @map("recognized_period")
  grossRevenue        Decimal        @db.Decimal(12,2) @map("gross_revenue")
  revenueDeduction    Decimal        @default(0) @db.Decimal(12,2) @map("revenue_deduction")
  netRevenue          Decimal        @db.Decimal(12,2) @map("net_revenue")
  supplierCost        Decimal        @default(0) @db.Decimal(12,2) @map("supplier_cost")
  wageCost            Decimal        @default(0) @db.Decimal(12,2) @map("wage_cost")
  grossProfit         Decimal        @db.Decimal(12,2) @map("gross_profit")
  recognizedAt        DateTime @map("recognized_at")
  recognizedBy        BigInt? @map("recognized_by")
  createdAt           DateTime       @default(now()) @map("created_at")

  @@map("revenue_records")
}

// =============================================================================
// 5. PAYMENT & SETTLEMENT
// =============================================================================

model CompanyBankAccount {
  bankAccountId       BigInt         @id @default(autoincrement()) @map("bank_account_id")
  bankCode            String         @db.VarChar(20) @map("bank_code")
  accountNumber       String         @db.VarChar(30) @map("account_number")
  accountName         String         @db.VarChar(150) @map("account_name")
  isDefault           Boolean        @default(false) @map("is_default")
  status              String         @default("active") // active, inactive

  @@map("company_bank_accounts")
}

model PaymentRequest {
  paymentRequestId    BigInt         @id @default(autoincrement()) @map("payment_request_id")
  orderId             BigInt @map("order_id")
  paymentType         String @map("payment_type") // deposit, final
  amount              Decimal        @db.Decimal(12,2)
  methodHint          String? @map("method_hint") // cash, bank_transfer
  bankAccountId       BigInt? @map("bank_account_id")
  transferCode        String?        @unique @db.VarChar(50) @map("transfer_code")
  qrUrl               String?        @db.VarChar(500) @map("qr_url")
  dueDate             DateTime?      @db.Date @map("due_date")
  instruction         String?        @db.Text
  status              String         @default("pending") // pending, partially_paid, paid, cancelled
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("payment_requests")
}

model Payment {
  paymentId           BigInt         @id @default(autoincrement()) @map("payment_id")
  paymentRequestId    BigInt @map("payment_request_id")
  orderId             BigInt @map("order_id")
  amount              Decimal        @db.Decimal(12,2)
  method              String         // cash, bank_transfer
  status              String         @default("pending") // pending, success, failed
  paidAt              DateTime? @map("paid_at")
  confirmedBy         BigInt @map("confirmed_by")
  confirmedAt         DateTime? @map("confirmed_at")
  createdAt           DateTime       @default(now()) @map("created_at")

  @@map("payments")
}

model Settlement {
  settlementId        BigInt         @id @default(autoincrement()) @map("settlement_id")
  orderId             BigInt         @unique @map("order_id")
  originalValue       Decimal        @db.Decimal(12,2) @map("original_value")
  changeAdjustment    Decimal        @default(0) @db.Decimal(12,2) @map("change_adjustment")
  additionalFee       Decimal        @default(0) @db.Decimal(12,2) @map("additional_fee")
  compensation        Decimal        @default(0) @db.Decimal(12,2)
  totalPaid           Decimal        @default(0) @db.Decimal(12,2) @map("total_paid")
  remainingAmount     Decimal        @default(0) @db.Decimal(12,2) @map("remaining_amount")
  paymentMethod       String? @map("payment_method") // cash, bank_transfer
  recordedBy          BigInt? @map("recorded_by")
  status              String         @default("draft") // draft, recorded, confirmed
  confirmedBy         BigInt? @map("confirmed_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("settlements")
}

model SettlementLine {
  id                  BigInt         @id @default(autoincrement())
  settlementId        BigInt @map("settlement_id")
  lineType            String @map("line_type") // original, change, additional_fee, compensation, deposit, payment
  refType             String?        @db.VarChar(50) @map("ref_type")
  refId               BigInt? @map("ref_id")
  description         String?        @db.VarChar(255)
  amount              Decimal        @db.Decimal(12,2)

  @@map("settlement_lines")
}

// =============================================================================
// 6. SCHEDULE
// =============================================================================

model SchedulePlan {
  schedulePlanId      BigInt         @id @default(autoincrement()) @map("schedule_plan_id")
  orderId             BigInt         @unique @map("order_id")
  status              String         @default("draft") // draft, active, done, deleted
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("schedule_plans")
}

model ScheduleActivity {
  activityId          BigInt         @id @default(autoincrement()) @map("activity_id")
  schedulePlanId      BigInt @map("schedule_plan_id")
  activityType        String @map("activity_type") // preparation, transport, execution, collection, return
  plannedStart        DateTime @map("planned_start")
  plannedEnd          DateTime? @map("planned_end")
  location            String?        @db.VarChar(255)
  note                String?        @db.Text
  sortOrder           Int? @map("sort_order")

  @@map("schedule_activities")
}

// =============================================================================
// 7. TASK & ATTENDANCE
// =============================================================================

model WorkTask {
  workTaskId          BigInt         @id @default(autoincrement()) @map("work_task_id")
  orderId             BigInt @map("order_id")
  taskCategory        String         @default("operation") @map("task_category") // survey, operation
  scheduleActivityId  BigInt? @map("schedule_activity_id")
  title               String         @db.VarChar(200)
  description         String?        @db.Text
  status              String         @default("draft") // draft, assigned, in_progress, done
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("work_tasks")
}

model Assignment {
  assignmentId        BigInt         @id @default(autoincrement()) @map("assignment_id")
  workTaskId          BigInt @map("work_task_id")
  userId              BigInt @map("user_id")
  roleInTask          String @map("role_in_task") // leader, technical
  assignedAt          DateTime       @default(now()) @map("assigned_at")

  @@map("assignments")
}

model TaskProgressUpdate {
  id                  BigInt         @id @default(autoincrement())
  workTaskId          BigInt @map("work_task_id")
  updatedBy           BigInt @map("updated_by")
  progressStatus      String         @db.VarChar(50) @map("progress_status")
  note                String?        @db.Text
  createdAt           DateTime       @default(now()) @map("created_at")

  @@map("task_progress_updates")
}

model Attendance {
  attendanceId        BigInt         @id @default(autoincrement()) @map("attendance_id")
  assignmentId        BigInt @map("assignment_id")
  checkIn             DateTime? @map("check_in")
  checkOut            DateTime? @map("check_out")
  completionStatus    String         @default("pending") @map("completion_status") // pending, completed
  confirmedBy         BigInt? @map("confirmed_by")
  confirmedAt         DateTime? @map("confirmed_at")

  @@map("attendance")
}

model StaffAvailability {
  id                  BigInt         @id @default(autoincrement())
  userId              BigInt @map("user_id")
  workDate            DateTime       @db.Date @map("work_date")
  status              String         @default("available") // available, unavailable
  note                String?        @db.VarChar(255)

  @@map("staff_availability")
}

// =============================================================================
// 8. WAGE
// =============================================================================

model WageRule {
  wageRuleId          BigInt         @id @default(autoincrement()) @map("wage_rule_id")
  roleInTask          String @map("role_in_task") // leader, technical
  ratePerSession      Decimal        @db.Decimal(12,2) @map("rate_per_session")
  effectiveFrom       DateTime       @db.Date @map("effective_from")
  effectiveTo         DateTime?      @db.Date @map("effective_to")
  status              String         @default("active") // active, inactive

  @@map("wage_rules")
}

model WageSummary {
  wageSummaryId       BigInt         @id @default(autoincrement()) @map("wage_summary_id")
  userId              BigInt @map("user_id")
  orderId             BigInt? @map("order_id")
  period              String?        @db.VarChar(20)
  totalSessions       Int            @default(0) @map("total_sessions")
  grossAmount         Decimal        @default(0) @db.Decimal(12,2) @map("gross_amount")
  totalDeduction      Decimal        @default(0) @db.Decimal(12,2) @map("total_deduction")
  totalWage           Decimal        @default(0) @db.Decimal(12,2) @map("total_wage")
  status              String         @default("draft") // draft, confirmed, settled
  confirmedBy         BigInt? @map("confirmed_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("wage_summaries")
}

model WageSummaryLine {
  id                  BigInt         @id @default(autoincrement())
  wageSummaryId       BigInt @map("wage_summary_id")
  assignmentId        BigInt? @map("assignment_id")
  attendanceId        BigInt? @map("attendance_id")
  wageRuleId          BigInt? @map("wage_rule_id")
  sessionDate         DateTime?      @db.Date @map("session_date")
  wageRate            Decimal        @db.Decimal(12,2) @map("wage_rate")
  lineAmount          Decimal        @db.Decimal(12,2) @map("line_amount")

  @@map("wage_summary_lines")
}

model WageDeduction {
  id                  BigInt         @id @default(autoincrement())
  wageSummaryId       BigInt @map("wage_summary_id")
  reason              String         @db.VarChar(255)
  amount              Decimal        @db.Decimal(12,2)
  createdBy           BigInt @map("created_by")

  @@map("wage_deductions")
}

model WagePayment {
  id                  BigInt         @id @default(autoincrement())
  wageSummaryId       BigInt @map("wage_summary_id")
  amount              Decimal        @db.Decimal(12,2)
  paidAt              DateTime @map("paid_at")
  paidBy              BigInt @map("paid_by")
  note                String?        @db.VarChar(255)

  @@map("wage_payments")
}

// =============================================================================
// 9. INVENTORY
// =============================================================================

model Inventory {
  inventoryId         BigInt         @id @default(autoincrement()) @map("inventory_id")
  catalogItemId       BigInt @map("catalog_item_id")
  warehouseId         BigInt @map("warehouse_id")
  totalQuantity       Int            @default(0) @map("total_quantity")
  availableQuantity   Int            @default(0) @map("available_quantity")

  @@map("inventory")
}

model InventoryReservation {
  reservationId       BigInt         @id @default(autoincrement()) @map("reservation_id")
  orderId             BigInt @map("order_id")
  eventDate           DateTime       @db.Date @map("event_date")
  status              String         @default("reserved") // reserved, released, fulfilled
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("inventory_reservations")
}

model InventoryReservationItem {
  id                  BigInt         @id @default(autoincrement())
  reservationId       BigInt @map("reservation_id")
  catalogItemId       BigInt @map("catalog_item_id")
  reservedQuantity    Int @map("reserved_quantity")

  @@map("inventory_reservation_items")
}

model InventoryReport {
  inventoryReportId   BigInt         @id @default(autoincrement()) @map("inventory_report_id")
  orderId             BigInt @map("order_id")
  reportType          String @map("report_type") // checkout, collection, return
  recordedBy          BigInt @map("recorded_by")
  confirmedBy         BigInt? @map("confirmed_by")
  status              String         @default("submitted") // submitted, confirmed
  note                String?        @db.Text
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("inventory_reports")
}

model InventoryReportItem {
  id                  BigInt         @id @default(autoincrement())
  inventoryReportId   BigInt @map("inventory_report_id")
  catalogItemId       BigInt @map("catalog_item_id")
  expectedQuantity    Int? @map("expected_quantity")
  quantity            Int
  conditionStatus     String         @default("good") @map("condition_status") // good, damaged, lost

  @@map("inventory_report_items")
}

model WarehouseHistory {
  historyId           BigInt         @id @default(autoincrement()) @map("history_id")
  warehouseId         BigInt @map("warehouse_id")
  orderId             BigInt? @map("order_id")
  inventoryReportId   BigInt? @map("inventory_report_id")
  movementType        String @map("movement_type") // in, out, return, adjust
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")

  @@map("warehouse_histories")
}

model WarehouseHistoryItem {
  id                  BigInt         @id @default(autoincrement())
  historyId           BigInt @map("history_id")
  catalogItemId       BigInt @map("catalog_item_id")
  quantity            Int

  @@map("warehouse_history_items")
}

model PickList {
  pickListId          BigInt         @id @default(autoincrement()) @map("pick_list_id")
  orderId             BigInt @map("order_id")
  purpose             String         // preparation, checkout, delivery, collection, return
  status              String         @default("draft") // draft, active, done
  createdBy           BigInt @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("pick_lists")
}

model PickListItem {
  id                  BigInt         @id @default(autoincrement())
  pickListId          BigInt @map("pick_list_id")
  catalogItemId       BigInt @map("catalog_item_id")
  plannedQuantity     Int @map("planned_quantity")
  actualQuantity      Int? @map("actual_quantity")

  @@map("pick_list_items")
}

model EquipmentMaintenance {
  maintenanceId       BigInt         @id @default(autoincrement()) @map("maintenance_id")
  catalogItemId       BigInt @map("catalog_item_id")
  warehouseId         BigInt? @map("warehouse_id")
  quantity            Int
  startDate           DateTime       @db.Date @map("start_date")
  endDate             DateTime?      @db.Date @map("end_date")
  status              String         @default("in_maintenance") // in_maintenance, done
  note                String?        @db.Text

  @@map("equipment_maintenance")
}

// =============================================================================
// 10. SUPPLIER
// =============================================================================

model SupplierTransaction {
  supplierTransactionId BigInt       @id @default(autoincrement()) @map("supplier_transaction_id")
  supplierId            BigInt @map("supplier_id")
  orderId               BigInt @map("order_id")
  type                  String       // rental, purchase
  totalCost             Decimal      @default(0) @db.Decimal(12,2) @map("total_cost")
  expectedDelivery      DateTime?    @db.Date @map("expected_delivery")
  status                String       @default("draft") // draft, confirmed, received, returned
  createdBy             BigInt @map("created_by")
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  @@map("supplier_transactions")
}

model SupplierTransactionItem {
  id                    BigInt       @id @default(autoincrement())
  supplierTransactionId BigInt @map("supplier_transaction_id")
  catalogItemId         BigInt? @map("catalog_item_id")
  description           String?      @db.VarChar(255)
  quantity              Int
  unitCost              Decimal      @db.Decimal(12,2) @map("unit_cost")

  @@map("supplier_transaction_items")
}

model SupplierReceiptReport {
  receiptReportId       BigInt       @id @default(autoincrement()) @map("receipt_report_id")
  supplierTransactionId BigInt @map("supplier_transaction_id")
  recordedBy            BigInt @map("recorded_by")
  confirmedBy           BigInt? @map("confirmed_by")
  status                String       @default("submitted") // submitted, confirmed
  note                  String?      @db.Text
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  @@map("supplier_receipt_reports")
}

model SupplierReceiptReportItem {
  id                            BigInt       @id @default(autoincrement())
  receiptReportId               BigInt @map("receipt_report_id")
  supplierTransactionItemId     BigInt? @map("supplier_transaction_item_id")
  catalogItemId                 BigInt? @map("catalog_item_id")
  description                   String?      @db.VarChar(255)
  receivedQuantity              Int @map("received_quantity")
  conditionStatus               String       @default("good") @map("condition_status") // good, damaged

  @@map("supplier_receipt_report_items")
}

model SupplierReturnReport {
  returnReportId          BigInt       @id @default(autoincrement()) @map("return_report_id")
  supplierTransactionId   BigInt @map("supplier_transaction_id")
  recordedBy              BigInt @map("recorded_by")
  confirmedBy             BigInt? @map("confirmed_by")
  totalCompensation       Decimal      @default(0) @db.Decimal(12,2) @map("total_compensation")
  status                  String       @default("submitted") // submitted, confirmed
  createdAt               DateTime     @default(now()) @map("created_at")
  updatedAt               DateTime     @updatedAt @map("updated_at")

  @@map("supplier_return_reports")
}

model SupplierReturnReportItem {
  id                    BigInt       @id @default(autoincrement())
  returnReportId        BigInt @map("return_report_id")
  catalogItemId         BigInt? @map("catalog_item_id")
  description           String?      @db.VarChar(255)
  returnedQuantity      Int @map("returned_quantity")
  conditionStatus       String @map("condition_status") // good, damaged, lost
  compensationAmount    Decimal      @default(0) @db.Decimal(12,2) @map("compensation_amount")

  @@map("supplier_return_report_items")
}

model SupplierDebt {
  debtId                  BigInt       @id @default(autoincrement()) @map("debt_id")
  supplierId              BigInt @map("supplier_id")
  supplierTransactionId   BigInt @map("supplier_transaction_id")
  amount                  Decimal      @db.Decimal(12,2)
  paidAmount              Decimal      @default(0) @db.Decimal(12,2) @map("paid_amount")
  status                  String       @default("open") // open, partial, paid
  createdAt               DateTime     @default(now()) @map("created_at")
  updatedAt               DateTime     @updatedAt @map("updated_at")

  @@map("supplier_debts")
}

model SupplierPayment {
  paymentId           BigInt       @id @default(autoincrement()) @map("payment_id")
  debtId              BigInt @map("debt_id")
  amount              Decimal      @db.Decimal(12,2)
  paidAt              DateTime @map("paid_at")
  recordedBy          BigInt @map("recorded_by")
  note                String?      @db.VarChar(255)

  @@map("supplier_payments")
}

// =============================================================================
// 11. FIELD OPERATION
// =============================================================================

model SurveyReport {
  surveyReportId      BigInt       @id @default(autoincrement()) @map("survey_report_id")
  orderId             BigInt @map("order_id")
  workTaskId          BigInt? @map("work_task_id")
  siteAddress         String?      @db.VarChar(255) @map("site_address")
  siteCondition       String?      @db.Text @map("site_condition")
  feasibilityNote     String?      @db.Text @map("feasibility_note")
  recordedBy          BigInt @map("recorded_by")
  confirmedBy         BigInt? @map("confirmed_by")
  status              String       @default("submitted") // submitted, confirmed
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("survey_reports")
}

model ChangeRequest {
  changeRequestId     BigInt       @id @default(autoincrement()) @map("change_request_id")
  orderId             BigInt @map("order_id")
  requestedBy         BigInt @map("requested_by")
  type                String       // add, remove, replace
  status              String       @default("pending") // pending, approved, rejected, executed_pending_review, reconciled
  executedAt          DateTime? @map("executed_at")
  approvedBy          BigInt? @map("approved_by")
  reconciledBy        BigInt? @map("reconciled_by")
  reconciledAt        DateTime? @map("reconciled_at")
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("change_requests")
}

model ChangeRequestItem {
  id                  BigInt       @id @default(autoincrement())
  changeRequestId     BigInt @map("change_request_id")
  catalogItemId       BigInt @map("catalog_item_id")
  quantity            Int
  action              String       // add, remove, replace

  @@map("change_request_items")
}

model HandoverRecord {
  handoverId          BigInt       @id @default(autoincrement()) @map("handover_id")
  orderId             BigInt @map("order_id")
  recordedBy          BigInt @map("recorded_by")
  confirmedBy         BigInt? @map("confirmed_by")
  status              String       @default("submitted") // submitted, confirmed
  note                String?      @db.Text
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("handover_records")
}

model DamageLossReport {
  damageLossId        BigInt       @id @default(autoincrement()) @map("damage_loss_id")
  orderId             BigInt @map("order_id")
  recordedBy          BigInt @map("recorded_by")
  confirmedBy         BigInt? @map("confirmed_by")
  totalCompensation   Decimal      @default(0) @db.Decimal(12,2) @map("total_compensation")
  status              String       @default("submitted") // submitted, confirmed
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("damage_loss_reports")
}

model DamageLossItem {
  id                           BigInt       @id @default(autoincrement())
  damageLossId                 BigInt @map("damage_loss_id")
  catalogItemId                BigInt @map("catalog_item_id")
  quantity                     Int
  damageType                   String @map("damage_type") // damaged, lost
  source                       String       @default("internal") // internal, supplier
  supplierTransactionItemId    BigInt? @map("supplier_transaction_item_id")
  compensationAmount           Decimal      @default(0) @db.Decimal(12,2) @map("compensation_amount")

  @@map("damage_loss_items")
}

// =============================================================================
// 12. SYSTEM
// =============================================================================

model Notification {
  notificationId      BigInt       @id @default(autoincrement()) @map("notification_id")
  userId              BigInt @map("user_id")
  type                String       @db.VarChar(50)
  title               String       @db.VarChar(200)
  content             String?      @db.Text
  refType             String?      @db.VarChar(50) @map("ref_type")
  refId               BigInt? @map("ref_id")
  isRead              Boolean      @default(false) @map("is_read")
  createdAt           DateTime     @default(now()) @map("created_at")

  @@map("notifications")
}

model AuditLog {
  logId               BigInt       @id @default(autoincrement()) @map("log_id")
  userId              BigInt? @map("user_id")
  action              String       @db.VarChar(100)
  entityType          String       @db.VarChar(50) @map("entity_type")
  entityId            BigInt? @map("entity_id")
  oldValue            Json? @map("old_value")
  newValue            Json? @map("new_value")
  createdAt           DateTime     @default(now()) @map("created_at")

  @@map("audit_logs")
}

model Evidence {
  evidenceId          BigInt       @id @default(autoincrement()) @map("evidence_id")
  refType             String       @db.VarChar(50) @map("ref_type")
  refId               BigInt @map("ref_id")
  fileUrl             String       @db.VarChar(500) @map("file_url")
  fileType            String?      @db.VarChar(50) @map("file_type")
  uploadedBy          BigInt @map("uploaded_by")
  uploadedAt          DateTime     @default(now()) @map("uploaded_at")

  @@map("evidence")
}
```

