# Database Schema

## 1. Overview
The database schema is based on the 40-table normalized architecture defined in `BNWEMS.sql`.
This schema is defined in Prisma ORM notation, adhering to the `camelCase` naming convention for all properties and relations. It covers everything from Authentication, Catalog (Equipment), and Orders to detailed Field Operations, Inventory, Supplier management, and Finance.

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
  roleId       BigInt         @map("role_id")
  role         Role           @relation(fields: [roleId], references: [roleId])
  username     String         @unique @db.VarChar(100)
  passwordHash String         @db.VarChar(255) @map("password_hash")
  fullName     String         @db.VarChar(150) @map("full_name")
  email        String?        @unique @db.VarChar(150)
  phone        String?        @db.VarChar(20)
  avatarUrl    String?        @db.VarChar(500) @map("avatar_url")
  bio          String?        @db.VarChar(255)
  status       String         @default("active") // active, inactive
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  @@map("internal_users")
}

// =============================================================================
// 2. CUSTOMER / SUPPLIER / POLICY
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

model BusinessPolicy {
  policyId       BigInt         @id @default(autoincrement()) @map("policy_id")
  policyType     String         @map("policy_type") // deposit, cancellation, compensation, additional_fee, wage
  name           String         @db.VarChar(150)
  config         Json
  effectiveFrom  DateTime       @db.Date @map("effective_from")
  effectiveTo    DateTime?      @db.Date @map("effective_to")
  status         String         @default("active") // active, inactive
  createdBy      BigInt         @map("created_by")
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")

  @@map("business_policies")
}

// =============================================================================
// 3. EQUIPMENT
// =============================================================================
model Equipment {
  equipmentItemId   BigInt         @id @default(autoincrement()) @map("equipment_item_id")
  code              String         @unique @db.VarChar(50)
  name              String         @db.VarChar(150)
  category          String?        @db.VarChar(100)
  unit              String?        @db.VarChar(30)
  rentalPrice       Decimal        @default(0) @db.Decimal(12,2) @map("rental_price")
  costPrice         Decimal        @default(0) @db.Decimal(12,2) @map("cost_price")
  replacementValue  Decimal        @default(0) @db.Decimal(12,2) @map("replacement_value")
  status            String         @default("active") // active, inactive
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  @@map("equipment")
}

// =============================================================================
// 4. ORDER & QUOTATION
// =============================================================================
model Order {
  orderId             BigInt         @id @default(autoincrement()) @map("order_id")
  orderNumber         String?        @unique @db.VarChar(30) @map("order_number")
  customerId          BigInt         @map("customer_id")
  eventDate           DateTime       @db.Date @map("event_date")
  eventLocation       String?        @db.VarChar(255) @map("event_location")
  totalValue          Decimal        @default(0) @db.Decimal(12,2) @map("total_value")
  status              String         @default("draft") // draft, confirmed, in_progress, completed, cancelled
  revenueStatus       String         @default("pending") @map("revenue_status") // pending, recognized
  recognizedAt        DateTime?      @map("recognized_at")
  createdBy           BigInt         @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("orders")
}

model OrderItem {
  id                  BigInt         @id @default(autoincrement())
  orderId             BigInt         @map("order_id")
  equipmentItemId     BigInt         @map("equipment_item_id")
  quantity            Int
  unitPrice           Decimal        @db.Decimal(12,2) @map("unit_price")
  source              String         @default("internal") // internal, supplier

  @@map("order_items")
}

model Quotation {
  quotationId         BigInt         @id @default(autoincrement()) @map("quotation_id")
  customerId          BigInt         @map("customer_id")
  orderId             BigInt         @unique @map("order_id")
  totalAmount         Decimal        @default(0) @db.Decimal(12,2) @map("total_amount")
  status              String         @default("draft") // draft, confirmed, deleted
  createdBy           BigInt         @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("quotations")
}

model QuotationItem {
  id                  BigInt         @id @default(autoincrement())
  quotationId         BigInt         @map("quotation_id")
  equipmentItemId     BigInt         @map("equipment_item_id")
  quantity            Int
  unitPrice           Decimal        @db.Decimal(12,2) @map("unit_price")
  lineTotal           Decimal        @db.Decimal(12,2) @map("line_total")

  @@map("quotation_items")
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
  orderId             BigInt         @map("order_id")
  paymentType         String         @map("payment_type") // deposit, final
  amount              Decimal        @db.Decimal(12,2)
  methodHint          String?        @map("method_hint") // cash, bank_transfer
  bankAccountId       BigInt?        @map("bank_account_id")
  transferCode        String?        @unique @db.VarChar(50) @map("transfer_code")
  qrUrl               String?        @db.VarChar(500) @map("qr_url")
  dueDate             DateTime?      @db.Date @map("due_date")
  status              String         @default("pending") // pending, partially_paid, paid, cancelled
  submittedBy         BigInt?        @map("submitted_by")
  submittedAt         DateTime?      @map("submitted_at")
  reviewNote          String?        @db.VarChar(255) @map("review_note")
  createdBy           BigInt         @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("payment_requests")
}

model Payment {
  paymentId           BigInt         @id @default(autoincrement()) @map("payment_id")
  paymentRequestId    BigInt         @map("payment_request_id")
  orderId             BigInt         @map("order_id")
  amount              Decimal        @db.Decimal(12,2)
  method              String         // cash, bank_transfer
  status              String         @default("pending") // pending, success, failed
  paidAt              DateTime?      @map("paid_at")
  submittedBy         BigInt?        @map("submitted_by")
  submittedAt         DateTime?      @map("submitted_at")
  reviewNote          String?        @db.VarChar(255) @map("review_note")
  confirmedBy         BigInt?        @map("confirmed_by")
  confirmedAt         DateTime?      @map("confirmed_at")
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
  totalAmount         Decimal        @default(0) @db.Decimal(12,2) @map("total_amount")
  totalPaid           Decimal        @default(0) @db.Decimal(12,2) @map("total_paid")
  remainingAmount     Decimal        @default(0) @db.Decimal(12,2) @map("remaining_amount")
  paymentMethod       String?        @map("payment_method") // cash, bank_transfer
  recordedBy          BigInt?        @map("recorded_by")
  status              String         @default("draft") // draft, recorded, confirmed
  confirmedBy         BigInt?        @map("confirmed_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("settlements")
}

// =============================================================================
// 6. SCHEDULE
// =============================================================================
model Schedule {
  scheduleId    BigInt         @id @default(autoincrement()) @map("schedule_id")
  orderId       BigInt         @map("order_id")
  activityType  String         @map("activity_type") // survey, preparation, transport, execution, collection, return
  plannedDate   DateTime       @db.Date @map("planned_date")
  plannedStart  DateTime?      @map("planned_start")
  plannedEnd    DateTime?      @map("planned_end")
  location      String?        @db.VarChar(255)
  note          String?        @db.Text
  status        String         @default("planned") // planned, done, cancelled
  createdBy     BigInt         @map("created_by")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  @@map("schedules")
}

// =============================================================================
// 7. TASK & ATTENDANCE
// =============================================================================
model WorkTask {
  workTaskId          BigInt         @id @default(autoincrement()) @map("work_task_id")
  orderId             BigInt         @map("order_id")
  scheduleId          BigInt?        @map("schedule_id")
  taskCategory        String         @default("operation") @map("task_category") // survey, operation
  title               String         @db.VarChar(200)
  description         String?        @db.Text
  status              String         @default("draft") // draft, assigned, in_progress, done
  createdBy           BigInt         @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("work_tasks")
}

model Assignment {
  assignmentId        BigInt         @id @default(autoincrement()) @map("assignment_id")
  workTaskId          BigInt         @map("work_task_id")
  userId              BigInt         @map("user_id")
  roleInTask          String         @map("role_in_task") // leader, technical
  assignedAt          DateTime       @default(now()) @map("assigned_at")

  @@map("assignments")
}

model TaskProgressUpdate {
  id                  BigInt         @id @default(autoincrement())
  workTaskId          BigInt         @map("work_task_id")
  updatedBy           BigInt         @map("updated_by")
  step                String?        // preparation, checkout, transport, installation, handover, collection, return
  progressStatus      String         @db.VarChar(50) @map("progress_status")
  note                String?        @db.Text
  createdAt           DateTime       @default(now()) @map("created_at")

  @@map("task_progress_updates")
}

model Attendance {
  attendanceId        BigInt         @id @default(autoincrement()) @map("attendance_id")
  assignmentId        BigInt         @map("assignment_id")
  checkIn             DateTime?      @map("check_in")
  checkOut            DateTime?      @map("check_out")
  completionStatus    String         @default("pending") @map("completion_status") // pending, completed
  confirmedBy         BigInt?        @map("confirmed_by")
  confirmedAt         DateTime?      @map("confirmed_at")

  @@map("attendance")
}

model StaffAvailability {
  id                  BigInt         @id @default(autoincrement())
  userId              BigInt         @map("user_id")
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
  roleInTask          String         @map("role_in_task") // leader, technical
  ratePerSession      Decimal        @db.Decimal(12,2) @map("rate_per_session")
  effectiveFrom       DateTime       @db.Date @map("effective_from")
  effectiveTo         DateTime?      @db.Date @map("effective_to")
  status              String         @default("active") // active, inactive

  @@map("wage_rules")
}

model WageSummary {
  wageSummaryId       BigInt         @id @default(autoincrement()) @map("wage_summary_id")
  userId              BigInt         @map("user_id")
  orderId             BigInt?        @map("order_id")
  period              String?        @db.VarChar(20)
  totalSessions       Int            @default(0) @map("total_sessions")
  grossAmount         Decimal        @default(0) @db.Decimal(12,2) @map("gross_amount")
  totalDeduction      Decimal        @default(0) @db.Decimal(12,2) @map("total_deduction")
  totalWage           Decimal        @default(0) @db.Decimal(12,2) @map("total_wage")
  status              String         @default("draft") // draft, confirmed, settled
  confirmedBy         BigInt?        @map("confirmed_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("wage_summaries")
}

// =============================================================================
// 9. INVENTORY
// =============================================================================
model Inventory {
  inventoryId         BigInt         @id @default(autoincrement()) @map("inventory_id")
  equipmentItemId     BigInt         @unique @map("equipment_item_id")
  totalQuantity       Int            @default(0) @map("total_quantity")
  availableQuantity   Int            @default(0) @map("available_quantity")
  reservedQuantity    Int            @default(0) @map("reserved_quantity")
  damagedQuantity     Int            @default(0) @map("damaged_quantity")

  @@map("inventory")
}

model InventoryReservation {
  reservationId       BigInt         @id @default(autoincrement()) @map("reservation_id")
  orderId             BigInt         @map("order_id")
  eventDate           DateTime       @db.Date @map("event_date")
  status              String         @default("reserved") // reserved, released, fulfilled
  createdBy           BigInt         @map("created_by")
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("inventory_reservations")
}

model InventoryReservationItem {
  id                  BigInt         @id @default(autoincrement())
  reservationId       BigInt         @map("reservation_id")
  equipmentItemId     BigInt         @map("equipment_item_id")
  reservedQuantity    Int            @map("reserved_quantity")

  @@map("inventory_reservation_items")
}

model InventoryReport {
  inventoryReportId   BigInt         @id @default(autoincrement()) @map("inventory_report_id")
  orderId             BigInt         @map("order_id")
  reportType          String         @map("report_type") // checkout, collection, return
  recordedBy          BigInt         @map("recorded_by")
  confirmedBy         BigInt?        @map("confirmed_by")
  status              String         @default("submitted") // submitted, confirmed
  note                String?        @db.Text
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  @@map("inventory_reports")
}

model InventoryReportItem {
  id                  BigInt         @id @default(autoincrement())
  inventoryReportId   BigInt         @map("inventory_report_id")
  equipmentItemId     BigInt         @map("equipment_item_id")
  expectedQuantity    Int?           @map("expected_quantity")
  quantity            Int
  conditionStatus     String         @default("good") @map("condition_status") // good, damaged, lost

  @@map("inventory_report_items")
}

// =============================================================================
// 10. SUPPLIER
// =============================================================================
model SupplierTransaction {
  supplierTransactionId BigInt       @id @default(autoincrement()) @map("supplier_transaction_id")
  supplierId            BigInt       @map("supplier_id")
  orderId               BigInt       @map("order_id")
  type                  String       // rental, purchase
  totalCost             Decimal      @default(0) @db.Decimal(12,2) @map("total_cost")
  paidAmount            Decimal      @default(0) @db.Decimal(12,2) @map("paid_amount")
  paymentStatus         String       @default("unpaid") // unpaid, partial, paid
  expectedDelivery      DateTime?    @db.Date @map("expected_delivery")
  status                String       @default("draft") // draft, confirmed, received, returned
  createdBy             BigInt       @map("created_by")
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  @@map("supplier_transactions")
}

model SupplierTransactionItem {
  id                    BigInt       @id @default(autoincrement())
  supplierTransactionId BigInt       @map("supplier_transaction_id")
  equipmentItemId       BigInt?      @map("equipment_item_id")
  description           String?      @db.VarChar(255)
  quantity              Int
  unitCost              Decimal      @db.Decimal(12,2) @map("unit_cost")

  @@map("supplier_transaction_items")
}

model SupplierPayment {
  paymentId             BigInt       @id @default(autoincrement()) @map("payment_id")
  supplierTransactionId BigInt     @map("supplier_transaction_id")
  amount                Decimal      @db.Decimal(12,2)
  paidAt                DateTime     @map("paid_at")
  recordedBy            BigInt       @map("recorded_by")
  note                  String?      @db.VarChar(255)

  @@map("supplier_payments")
}

// =============================================================================
// 11. FIELD OPERATION
// =============================================================================
model SurveyReport {
  surveyReportId      BigInt       @id @default(autoincrement()) @map("survey_report_id")
  orderId             BigInt       @map("order_id")
  workTaskId          BigInt?      @map("work_task_id")
  siteAddress         String?      @db.VarChar(255) @map("site_address")
  siteCondition       String?      @db.Text @map("site_condition")
  feasibilityNote     String?      @db.Text @map("feasibility_note")
  areaSqm             Decimal?     @db.Decimal(10,2) @map("area_sqm")
  hasPower            Boolean?     @map("has_power")
  groundType          String?      @db.VarChar(100) @map("ground_type")
  accessNote          String?      @db.Text @map("access_note")
  recordedBy          BigInt       @map("recorded_by")
  reviewedBy          BigInt?      @map("reviewed_by")
  reviewedAt          DateTime?    @map("reviewed_at")
  reviewNote          String?      @db.Text @map("review_note")
  status              String       @default("submitted") // submitted, needs_revision, confirmed
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("survey_reports")
}

model ChangeRequest {
  changeRequestId     BigInt       @id @default(autoincrement()) @map("change_request_id")
  orderId             BigInt       @map("order_id")
  requestedBy         BigInt       @map("requested_by")
  type                String       // add, remove, replace
  reason              String?      @db.Text
  noteFromLeader      String?      @db.Text @map("note_from_leader")
  estimatedCost       Decimal?     @db.Decimal(12,2) @map("estimated_cost")
  status              String       @default("pending") // pending, approved, rejected, executed_pending_review, reconciled
  executedAt          DateTime?    @map("executed_at")
  approvedBy          BigInt?      @map("approved_by")
  reconciledBy        BigInt?      @map("reconciled_by")
  reconciledAt        DateTime?    @map("reconciled_at")
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("change_requests")
}

model ChangeRequestItem {
  id                  BigInt       @id @default(autoincrement())
  changeRequestId     BigInt       @map("change_request_id")
  equipmentItemId     BigInt       @map("equipment_item_id")
  quantity            Int
  action              String       // add, remove, replace
  note                String?      @db.VarChar(255)

  @@map("change_request_items")
}

model HandoverRecord {
  handoverId          BigInt       @id @default(autoincrement()) @map("handover_id")
  orderId             BigInt       @map("order_id")
  recordedBy          BigInt       @map("recorded_by")
  confirmedBy         BigInt?      @map("confirmed_by")
  status              String       @default("submitted") // submitted, confirmed
  note                String?      @db.Text
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("handover_records")
}

model DamageLossReport {
  damageLossId        BigInt       @id @default(autoincrement()) @map("damage_loss_id")
  orderId             BigInt       @map("order_id")
  recordedBy          BigInt       @map("recorded_by")
  confirmedBy         BigInt?      @map("confirmed_by")
  totalCompensation   Decimal      @default(0) @db.Decimal(12,2) @map("total_compensation")
  status              String       @default("submitted") // submitted, confirmed
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("damage_loss_reports")
}

model DamageLossItem {
  id                           BigInt       @id @default(autoincrement())
  damageLossId                 BigInt       @map("damage_loss_id")
  equipmentItemId              BigInt       @map("equipment_item_id")
  quantity                     Int
  damageType                   String       @map("damage_type") // damaged, lost
  source                       String       @default("internal") // internal, supplier
  supplierTransactionItemId    BigInt?      @map("supplier_transaction_item_id")
  compensationAmount           Decimal      @default(0) @db.Decimal(12,2) @map("compensation_amount")

  @@map("damage_loss_items")
}

// =============================================================================
// 12. SYSTEM
// =============================================================================
model Notification {
  notificationId      BigInt       @id @default(autoincrement()) @map("notification_id")
  userId              BigInt       @map("user_id")
  type                String       @db.VarChar(50)
  title               String       @db.VarChar(200)
  content             String?      @db.Text
  priority            String       @default("normal") // normal, high, urgent
  targetScreen        String?      @db.VarChar(50) @map("target_screen")
  targetRefType       String?      @db.VarChar(50) @map("target_ref_type")
  targetRefId         BigInt?      @map("target_ref_id")
  isRead              Boolean      @default(false) @map("is_read")
  pushStatus          String       @default("pending") @map("push_status") // pending, sent, failed, skipped
  pushSentAt          DateTime?    @map("push_sent_at")
  fcmMessageId        String?      @db.VarChar(255) @map("fcm_message_id")
  pushError           String?      @db.VarChar(255) @map("push_error")
  createdAt           DateTime     @default(now()) @map("created_at")

  @@map("notifications")
}

model DeviceToken {
  deviceTokenId       BigInt       @id @default(autoincrement()) @map("device_token_id")
  userId              BigInt       @map("user_id")
  fcmToken            String       @unique @db.VarChar(255) @map("fcm_token")
  platform            String       // android, ios, web
  deviceName          String?      @db.VarChar(150) @map("device_name")
  isActive            Boolean      @default(true) @map("is_active")
  lastUsedAt          DateTime?    @map("last_used_at")
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@map("device_tokens")
}

model Evidence {
  evidenceId          BigInt       @id @default(autoincrement()) @map("evidence_id")
  refType             String       @db.VarChar(50) @map("ref_type")
  refId               BigInt       @map("ref_id")
  orderId             BigInt?      @map("order_id")
  storageProvider     String       @default("firebase") @db.VarChar(30) @map("storage_provider")
  storagePath         String?      @db.VarChar(500) @map("storage_path")
  fileUrl             String       @db.VarChar(500) @map("file_url")
  thumbnailUrl        String?      @db.VarChar(500) @map("thumbnail_url")
  fileName            String?      @db.VarChar(255) @map("file_name")
  fileSize            BigInt?      @map("file_size")
  fileType            String?      @db.VarChar(50) @map("file_type")
  uploadedBy          BigInt       @map("uploaded_by")
  uploadedAt          DateTime     @default(now()) @map("uploaded_at")

  @@map("evidence")
}

model AuditLog {
  logId               BigInt       @id @default(autoincrement()) @map("log_id")
  userId              BigInt?      @map("user_id")
  action              String       @db.VarChar(100)
  entityType          String       @db.VarChar(50) @map("entity_type")
  entityId            BigInt?      @map("entity_id")
  oldValue            Json?        @map("old_value")
  newValue            Json?        @map("new_value")
  createdAt           DateTime     @default(now()) @map("created_at")

  @@map("audit_logs")
}
```
