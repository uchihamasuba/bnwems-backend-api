-- =============================================================================
-- BNWEMS — SCHEMA CHUẨN HÓA (3NF) — 40 bảng
-- MySQL 8.0+ / InnoDB / utf8mb4 — tiền DECIMAL(12,2), khóa BIGINT AUTO_INCREMENT
-- =============================================================================
CREATE DATABASE IF NOT EXISTS BNWEMS CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE BNWEMS;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS device_tokens;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS damage_loss_items;
DROP TABLE IF EXISTS damage_loss_reports;
DROP TABLE IF EXISTS handover_records;
DROP TABLE IF EXISTS change_request_items;
DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS survey_reports;
DROP TABLE IF EXISTS supplier_payments;
DROP TABLE IF EXISTS supplier_transaction_items;
DROP TABLE IF EXISTS supplier_transactions;
DROP TABLE IF EXISTS inventory_report_items;
DROP TABLE IF EXISTS inventory_reports;
DROP TABLE IF EXISTS inventory_reservation_items;
DROP TABLE IF EXISTS inventory_reservations;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS wage_summaries;
DROP TABLE IF EXISTS wage_rules;
DROP TABLE IF EXISTS staff_availability;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS task_progress_updates;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS work_tasks;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS settlement_lines;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_requests;
DROP TABLE IF EXISTS company_bank_accounts;
DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS business_policies;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS internal_users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USER & ROLE -------------------------------------------------------------
CREATE TABLE roles (
  role_id     BIGINT NOT NULL AUTO_INCREMENT,
  role_name   VARCHAR(50)  NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (role_id), UNIQUE KEY uq_roles_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE internal_users (
  user_id       BIGINT NOT NULL AUTO_INCREMENT,
  role_id       BIGINT NOT NULL,
  username      VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NULL,
  phone         VARCHAR(20)  NULL,
  avatar_url    VARCHAR(500) NULL,   -- URL ảnh đại diện (Firebase)
  bio           VARCHAR(255) NULL,   -- mô tả ngắn về nhân viên
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username), UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. CUSTOMER / SUPPLIER / POLICY -------------------------------------------
CREATE TABLE customers (
  customer_id BIGINT NOT NULL AUTO_INCREMENT,
  full_name   VARCHAR(150) NOT NULL,
  phone       VARCHAR(20)  NULL,
  email       VARCHAR(150) NULL,
  address     VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id), UNIQUE KEY uq_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  supplier_id    BIGINT NOT NULL AUTO_INCREMENT,
  name           VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150) NULL,
  phone          VARCHAR(20)  NULL,
  address        VARCHAR(255) NULL,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE business_policies (
  policy_id      BIGINT NOT NULL AUTO_INCREMENT,
  policy_type    ENUM('deposit','cancellation','compensation','additional_fee','wage') NOT NULL,
  name           VARCHAR(150) NOT NULL,
  config         JSON NOT NULL,
  effective_from DATE NOT NULL,
  effective_to   DATE NULL,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_by     BIGINT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (policy_id),
  CONSTRAINT fk_policy_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. EQUIPMENT (đổi tên từ catalog_items, giá lưu trên cột) -------------------
CREATE TABLE equipment (
  equipment_item_id BIGINT NOT NULL AUTO_INCREMENT,
  code              VARCHAR(50)  NOT NULL,
  name              VARCHAR(150) NOT NULL,
  category          VARCHAR(100) NULL,
  unit              VARCHAR(30)  NULL,
  rental_price      DECIMAL(12,2) NOT NULL DEFAULT 0,  -- giá thuê hiện hành
  cost_price        DECIMAL(12,2) NOT NULL DEFAULT 0,  -- giá vốn
  replacement_value DECIMAL(12,2) NOT NULL DEFAULT 0,  -- giá đền bù
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (equipment_item_id), UNIQUE KEY uq_equipment_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ORDER & QUOTATION -------------------------------------------------------
CREATE TABLE orders (
  order_id       BIGINT NOT NULL AUTO_INCREMENT,
  order_number   VARCHAR(30) NULL,
  customer_id    BIGINT NOT NULL,
  event_date     DATE   NOT NULL,
  event_end_date DATE   NULL,
  event_type     VARCHAR(50) NULL,
  event_name     VARCHAR(255) NULL,
  notes          TEXT NULL,
  guest_count    INT    NULL,
  event_location VARCHAR(255) NULL,
  total_value    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status         ENUM('draft','confirmed','deposit_paid','in_progress','settlement_pending','completed','cancelled') NOT NULL DEFAULT 'draft',
  revenue_status ENUM('pending','recognized') NOT NULL DEFAULT 'pending',
  recognized_at  DATETIME NULL,
  created_by     BIGINT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id), UNIQUE KEY uq_orders_number (order_number),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT fk_orders_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  order_id          BIGINT NOT NULL,
  equipment_item_id BIGINT NOT NULL,
  quantity          INT NOT NULL,
  unit_price        DECIMAL(12,2) NOT NULL,
  source            ENUM('internal','supplier') NOT NULL DEFAULT 'internal',
  PRIMARY KEY (id), KEY idx_oitem_order (order_id),
  CONSTRAINT fk_oitem_order     FOREIGN KEY (order_id)          REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oitem_equipment FOREIGN KEY (equipment_item_id) REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quotations (
  quotation_id BIGINT NOT NULL AUTO_INCREMENT,
  customer_id  BIGINT NOT NULL,
  order_id     BIGINT NOT NULL,
  version      INT NOT NULL DEFAULT 1,
  subtotal     DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax          DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount     DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status       ENUM('draft','confirmed','deleted') NOT NULL DEFAULT 'draft',
  created_by   BIGINT NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (quotation_id), KEY idx_quotation_order (order_id),
  CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT fk_quotation_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_quotation_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quotation_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  quotation_id      BIGINT NOT NULL,
  equipment_item_id BIGINT NOT NULL,
  quantity          INT NOT NULL,
  unit_price        DECIMAL(12,2) NOT NULL,
  line_total        DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id), KEY idx_qitem_quotation (quotation_id),
  CONSTRAINT fk_qitem_quotation FOREIGN KEY (quotation_id)      REFERENCES quotations (quotation_id) ON DELETE CASCADE,
  CONSTRAINT fk_qitem_equipment FOREIGN KEY (equipment_item_id) REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. PAYMENT & SETTLEMENT ----------------------------------------------------
CREATE TABLE company_bank_accounts (
  bank_account_id BIGINT NOT NULL AUTO_INCREMENT,
  bank_code      VARCHAR(20)  NOT NULL,
  account_number VARCHAR(30)  NOT NULL,
  account_name   VARCHAR(150) NOT NULL,
  is_default     BOOLEAN NOT NULL DEFAULT FALSE,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (bank_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_requests (
  payment_request_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id        BIGINT NOT NULL,
  payment_type    ENUM('deposit','final') NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  method_hint     ENUM('cash','bank_transfer') NULL,
  bank_account_id BIGINT NULL,
  transfer_code   VARCHAR(50)  NULL,
  qr_url          VARCHAR(500) NULL,
  due_date        DATE NULL,
  status          ENUM('pending','partially_paid','paid','cancelled') NOT NULL DEFAULT 'pending',
  submitted_by    BIGINT NULL,
  submitted_at    DATETIME NULL,
  review_note     VARCHAR(255) NULL,
  created_by      BIGINT NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_request_id), UNIQUE KEY uq_preq_transfer (transfer_code),
  CONSTRAINT fk_preq_order     FOREIGN KEY (order_id)        REFERENCES orders (order_id),
  CONSTRAINT fk_preq_bank      FOREIGN KEY (bank_account_id) REFERENCES company_bank_accounts (bank_account_id),
  CONSTRAINT fk_preq_submitter FOREIGN KEY (submitted_by)    REFERENCES internal_users (user_id),
  CONSTRAINT fk_preq_creator   FOREIGN KEY (created_by)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  payment_id         BIGINT NOT NULL AUTO_INCREMENT,
  payment_request_id BIGINT NOT NULL,
  order_id           BIGINT NOT NULL,
  amount             DECIMAL(12,2) NOT NULL,
  method             ENUM('cash','bank_transfer') NOT NULL,
  status             ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  paid_at            DATETIME NULL,
  submitted_by       BIGINT NULL,
  submitted_at       DATETIME NULL,
  review_note        VARCHAR(255) NULL,
  confirmed_by       BIGINT NULL,
  confirmed_at       DATETIME NULL,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id), KEY idx_pay_order (order_id),
  CONSTRAINT fk_pay_request   FOREIGN KEY (payment_request_id) REFERENCES payment_requests (payment_request_id),
  CONSTRAINT fk_pay_order     FOREIGN KEY (order_id)           REFERENCES orders (order_id),
  CONSTRAINT fk_pay_submitter FOREIGN KEY (submitted_by)       REFERENCES internal_users (user_id),
  CONSTRAINT fk_pay_confirmer FOREIGN KEY (confirmed_by)       REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settlements (
  settlement_id     BIGINT NOT NULL AUTO_INCREMENT,
  order_id          BIGINT NOT NULL,
  original_value    DECIMAL(12,2) NOT NULL,
  change_adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
  additional_fee    DECIMAL(12,2) NOT NULL DEFAULT 0,
  compensation      DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,  -- hóa đơn cuối
  total_paid        DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,  -- còn phải thu
  payment_method    ENUM('cash','bank_transfer') NULL,
  recorded_by       BIGINT NULL,
  status            ENUM('draft','recorded','confirmed') NOT NULL DEFAULT 'draft',
  confirmed_by      BIGINT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (settlement_id), UNIQUE KEY uq_settlement_order (order_id),
  CONSTRAINT fk_settle_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_settle_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_settle_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settlement_lines (
  id              BIGINT NOT NULL AUTO_INCREMENT,
  settlement_id   BIGINT NOT NULL,
  line_type       ENUM('original','change','additional_fee','compensation','deposit','payment') NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  note            VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_sline_settle (settlement_id),
  CONSTRAINT fk_sline_settle FOREIGN KEY (settlement_id) REFERENCES settlements (settlement_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. SCHEDULE (gộp plan + activities) ----------------------------------------
CREATE TABLE schedules (
  schedule_id   BIGINT NOT NULL AUTO_INCREMENT,
  order_id      BIGINT NOT NULL,
  activity_type ENUM('survey','preparation','transport','execution','collection','return') NOT NULL,
  planned_date  DATE     NOT NULL,
  planned_start DATETIME NULL,
  planned_end   DATETIME NULL,
  location      VARCHAR(255) NULL,
  note          TEXT NULL,
  status        ENUM('planned','done','cancelled') NOT NULL DEFAULT 'planned',
  created_by    BIGINT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (schedule_id), KEY idx_sched_order (order_id),
  CONSTRAINT fk_sched_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
  CONSTRAINT fk_sched_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TASK & ATTENDANCE -------------------------------------------------------
CREATE TABLE work_tasks (
  work_task_id  BIGINT NOT NULL AUTO_INCREMENT,
  order_id      BIGINT NOT NULL,
  schedule_id   BIGINT NULL,
  task_category ENUM('survey','operation') NOT NULL DEFAULT 'operation',
  title         VARCHAR(200) NOT NULL,
  description   TEXT NULL,
  status        ENUM('draft','assigned','in_progress','done') NOT NULL DEFAULT 'draft',
  progress_percent INT NOT NULL DEFAULT 0,
  created_by    BIGINT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (work_task_id), KEY idx_task_order (order_id),
  CONSTRAINT fk_task_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_task_schedule FOREIGN KEY (schedule_id) REFERENCES schedules (schedule_id),
  CONSTRAINT fk_task_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assignments (
  assignment_id BIGINT NOT NULL AUTO_INCREMENT,
  work_task_id  BIGINT NOT NULL,
  user_id       BIGINT NOT NULL,
  role_in_task  ENUM('leader','technical') NOT NULL,
  field_status  ENUM('pending','ready','in_setup','completed') NOT NULL DEFAULT 'pending',
  assigned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (assignment_id), UNIQUE KEY uq_assign (work_task_id, user_id),
  CONSTRAINT fk_assign_task FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_user FOREIGN KEY (user_id)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task_progress_updates (
  id              BIGINT NOT NULL AUTO_INCREMENT,
  work_task_id    BIGINT NOT NULL,
  updated_by      BIGINT NOT NULL,
  step            ENUM('preparation','checkout','transport','installation','handover','collection','return') NULL,
  progress_status VARCHAR(50) NOT NULL,
  note            TEXT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_tpu_task (work_task_id),
  CONSTRAINT fk_tpu_task FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id) ON DELETE CASCADE,
  CONSTRAINT fk_tpu_user FOREIGN KEY (updated_by)   REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
  attendance_id     BIGINT NOT NULL AUTO_INCREMENT,
  assignment_id     BIGINT NOT NULL,
  check_in          DATETIME NULL,
  check_out         DATETIME NULL,
  completion_status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  confirmed_by      BIGINT NULL,
  confirmed_at      DATETIME NULL,
  PRIMARY KEY (attendance_id), KEY idx_att_assign (assignment_id),
  CONSTRAINT fk_att_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (assignment_id) ON DELETE CASCADE,
  CONSTRAINT fk_att_confirmer  FOREIGN KEY (confirmed_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE staff_availability (
  id        BIGINT NOT NULL AUTO_INCREMENT,
  user_id   BIGINT NOT NULL,
  work_date DATE NOT NULL,
  status    ENUM('available','unavailable') NOT NULL DEFAULT 'available',
  note      VARCHAR(255) NULL,
  PRIMARY KEY (id), UNIQUE KEY uq_avail (user_id, work_date),
  CONSTRAINT fk_avail_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. WAGE (rút gọn) ----------------------------------------------------------
CREATE TABLE wage_rules (
  wage_rule_id     BIGINT NOT NULL AUTO_INCREMENT,
  role_in_task     ENUM('leader','technical') NOT NULL,
  rate_per_session DECIMAL(12,2) NOT NULL,
  effective_from   DATE NOT NULL,
  effective_to     DATE NULL,
  status           ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (wage_rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wage_summaries (
  wage_summary_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id         BIGINT NOT NULL,
  order_id        BIGINT NULL,
  period          VARCHAR(20) NULL,
  total_sessions  INT NOT NULL DEFAULT 0,
  gross_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_wage      DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          ENUM('draft','confirmed','settled') NOT NULL DEFAULT 'draft',
  confirmed_by    BIGINT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (wage_summary_id), KEY idx_wage_user (user_id),
  CONSTRAINT fk_wage_user      FOREIGN KEY (user_id)      REFERENCES internal_users (user_id),
  CONSTRAINT fk_wage_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_wage_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. INVENTORY (1 kho — bỏ warehouse) ----------------------------------------
CREATE TABLE inventory (
  inventory_id       BIGINT NOT NULL AUTO_INCREMENT,
  equipment_item_id  BIGINT NOT NULL,
  total_quantity     INT NOT NULL DEFAULT 0,
  available_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity  INT NOT NULL DEFAULT 0,
  damaged_quantity   INT NOT NULL DEFAULT 0,   -- hỏng hóc/bảo trì ghi nhận tại đây
  PRIMARY KEY (inventory_id), UNIQUE KEY uq_inv_equipment (equipment_item_id),
  CONSTRAINT fk_inv_equipment FOREIGN KEY (equipment_item_id) REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reservations (
  reservation_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id       BIGINT NOT NULL,
  event_date     DATE NOT NULL,
  status         ENUM('reserved','released','fulfilled') NOT NULL DEFAULT 'reserved',
  created_by     BIGINT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id), KEY idx_resv_order (order_id),
  CONSTRAINT fk_resv_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
  CONSTRAINT fk_resv_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reservation_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  reservation_id    BIGINT NOT NULL,
  equipment_item_id BIGINT NOT NULL,
  reserved_quantity INT NOT NULL,
  PRIMARY KEY (id), KEY idx_rsvitem_resv (reservation_id),
  CONSTRAINT fk_rsvitem_resv      FOREIGN KEY (reservation_id)    REFERENCES inventory_reservations (reservation_id) ON DELETE CASCADE,
  CONSTRAINT fk_rsvitem_equipment FOREIGN KEY (equipment_item_id) REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reports (
  inventory_report_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id     BIGINT NOT NULL,
  report_type  ENUM('checkout','collection','return') NOT NULL,
  recorded_by  BIGINT NOT NULL,
  confirmed_by BIGINT NULL,
  status       ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  note         TEXT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (inventory_report_id), KEY idx_invrep_order (order_id),
  CONSTRAINT fk_invrep_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_invrep_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_invrep_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_report_items (
  id                  BIGINT NOT NULL AUTO_INCREMENT,
  inventory_report_id BIGINT NOT NULL,
  equipment_item_id   BIGINT NOT NULL,
  expected_quantity   INT NULL,
  quantity            INT NOT NULL,
  condition_status    ENUM('good','damaged','lost') NOT NULL DEFAULT 'good',
  PRIMARY KEY (id), KEY idx_invrepitem_report (inventory_report_id),
  CONSTRAINT fk_invrepitem_report    FOREIGN KEY (inventory_report_id) REFERENCES inventory_reports (inventory_report_id) ON DELETE CASCADE,
  CONSTRAINT fk_invrepitem_equipment FOREIGN KEY (equipment_item_id)   REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. SUPPLIER (gộp công nợ vào giao dịch) -----------------------------------
CREATE TABLE supplier_transactions (
  supplier_transaction_id BIGINT NOT NULL AUTO_INCREMENT,
  supplier_id       BIGINT NOT NULL,
  order_id          BIGINT NOT NULL,
  type              ENUM('rental','purchase') NOT NULL,
  total_cost        DECIMAL(12,2) NOT NULL DEFAULT 0,  -- tổng cần trả
  paid_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,  -- đã trả
  payment_status    ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  expected_delivery DATE NULL,
  status            ENUM('draft','confirmed','received','returned') NOT NULL DEFAULT 'draft',
  created_by        BIGINT NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_transaction_id), KEY idx_st_supplier (supplier_id), KEY idx_st_order (order_id),
  CONSTRAINT fk_st_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
  CONSTRAINT fk_st_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_st_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_transaction_items (
  id                      BIGINT NOT NULL AUTO_INCREMENT,
  supplier_transaction_id BIGINT NOT NULL,
  equipment_item_id       BIGINT NULL,
  description             VARCHAR(255) NULL,
  quantity                INT NOT NULL,
  quantity_received       INT NOT NULL DEFAULT 0,
  quantity_returned       INT NOT NULL DEFAULT 0,
  unit_cost               DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id), KEY idx_stitem_trans (supplier_transaction_id),
  CONSTRAINT fk_stitem_trans     FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id) ON DELETE CASCADE,
  CONSTRAINT fk_stitem_equipment FOREIGN KEY (equipment_item_id)       REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_payments (
  payment_id              BIGINT NOT NULL AUTO_INCREMENT,
  supplier_transaction_id BIGINT NOT NULL,
  amount                  DECIMAL(12,2) NOT NULL,
  paid_at                 DATETIME NOT NULL,
  recorded_by             BIGINT NOT NULL,
  note                    VARCHAR(255) NULL,
  PRIMARY KEY (payment_id), KEY idx_spay_trans (supplier_transaction_id),
  CONSTRAINT fk_spay_trans    FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id),
  CONSTRAINT fk_spay_recorder FOREIGN KEY (recorded_by)             REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. FIELD OPERATION --------------------------------------------------------
CREATE TABLE survey_reports (
  survey_report_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id         BIGINT NOT NULL,
  work_task_id     BIGINT NULL,
  site_address     VARCHAR(255) NULL,
  site_condition   TEXT NULL,
  feasibility_note TEXT NULL,
  area_sqm         DECIMAL(10,2) NULL,
  has_power        BOOLEAN NULL,
  ground_type      VARCHAR(100) NULL,
  access_note      TEXT NULL,
  recorded_by      BIGINT NOT NULL,
  reviewed_by      BIGINT NULL,
  reviewed_at      DATETIME NULL,
  review_note      TEXT NULL,
  status           ENUM('submitted','needs_revision','confirmed') NOT NULL DEFAULT 'submitted',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (survey_report_id), KEY idx_survey_order (order_id),
  CONSTRAINT fk_survey_order    FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_survey_task     FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id),
  CONSTRAINT fk_survey_recorder FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_survey_reviewer FOREIGN KEY (reviewed_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE change_requests (
  change_request_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id          BIGINT NOT NULL,
  requested_by      BIGINT NOT NULL,
  type              ENUM('add','remove','replace') NOT NULL,
  reason            TEXT NULL,
  note_from_leader  TEXT NULL,
  estimated_cost    DECIMAL(12,2) NULL,
  status            ENUM('pending','approved','rejected','executed_pending_review','reconciled') NOT NULL DEFAULT 'pending',
  executed_at       DATETIME NULL,
  approved_by       BIGINT NULL,
  reconciled_by     BIGINT NULL,
  reconciled_at     DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (change_request_id), KEY idx_cr_order (order_id),
  CONSTRAINT fk_cr_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_cr_requester FOREIGN KEY (requested_by) REFERENCES internal_users (user_id),
  CONSTRAINT fk_cr_approver  FOREIGN KEY (approved_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_cr_reconciler FOREIGN KEY (reconciled_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE change_request_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  change_request_id BIGINT NOT NULL,
  equipment_item_id BIGINT NOT NULL,
  quantity          INT NOT NULL,
  action            ENUM('add','remove','replace') NOT NULL,
  note              VARCHAR(255) NULL,
  PRIMARY KEY (id), KEY idx_cri_request (change_request_id),
  CONSTRAINT fk_cri_request   FOREIGN KEY (change_request_id) REFERENCES change_requests (change_request_id) ON DELETE CASCADE,
  CONSTRAINT fk_cri_equipment FOREIGN KEY (equipment_item_id) REFERENCES equipment (equipment_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE handover_records (
  handover_id  BIGINT NOT NULL AUTO_INCREMENT,
  order_id     BIGINT NOT NULL,
  recorded_by  BIGINT NOT NULL,
  confirmed_by BIGINT NULL,
  status       ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  note         TEXT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (handover_id), KEY idx_ho_order (order_id),
  CONSTRAINT fk_ho_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_ho_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_ho_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE damage_loss_reports (
  damage_loss_id     BIGINT NOT NULL AUTO_INCREMENT,
  order_id           BIGINT NOT NULL,
  recorded_by        BIGINT NOT NULL,
  confirmed_by       BIGINT NULL,
  total_compensation DECIMAL(12,2) NOT NULL DEFAULT 0,
  status             ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (damage_loss_id), KEY idx_dl_order (order_id),
  CONSTRAINT fk_dl_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_dl_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_dl_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE damage_loss_items (
  id                           BIGINT NOT NULL AUTO_INCREMENT,
  damage_loss_id               BIGINT NOT NULL,
  equipment_item_id            BIGINT NOT NULL,
  quantity                     INT NOT NULL,
  damage_type                  ENUM('damaged','lost') NOT NULL,
  source                       ENUM('internal','supplier') NOT NULL DEFAULT 'internal',
  supplier_transaction_item_id BIGINT NULL,
  compensation_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  responsible_party            VARCHAR(20) NULL,
  responsible_user_id          BIGINT NULL,
  PRIMARY KEY (id), KEY idx_dli_report (damage_loss_id),
  CONSTRAINT fk_dli_report    FOREIGN KEY (damage_loss_id)               REFERENCES damage_loss_reports (damage_loss_id) ON DELETE CASCADE,
  CONSTRAINT fk_dli_equipment FOREIGN KEY (equipment_item_id)            REFERENCES equipment (equipment_item_id),
  CONSTRAINT fk_dli_stitem    FOREIGN KEY (supplier_transaction_item_id) REFERENCES supplier_transaction_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. SYSTEM -----------------------------------------------------------------
CREATE TABLE notifications (
  notification_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id         BIGINT NOT NULL,
  type            VARCHAR(50)  NOT NULL,
  title           VARCHAR(200) NOT NULL,
  content         TEXT NULL,
  priority        ENUM('normal','high','urgent') NOT NULL DEFAULT 'normal',
  target_screen   VARCHAR(50) NULL,
  target_ref_type VARCHAR(50) NULL,
  target_ref_id   BIGINT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  push_status     ENUM('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
  push_sent_at    DATETIME NULL,
  fcm_message_id  VARCHAR(255) NULL,
  push_error      VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id), KEY idx_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE device_tokens (
  device_token_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id      BIGINT NOT NULL,
  fcm_token    VARCHAR(255) NOT NULL,
  platform     ENUM('android','ios','web') NOT NULL,
  device_name  VARCHAR(150) NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (device_token_id), UNIQUE KEY uq_devtoken (fcm_token), KEY idx_devtoken_user (user_id),
  CONSTRAINT fk_devtoken_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE evidence (
  evidence_id      BIGINT NOT NULL AUTO_INCREMENT,
  ref_type         VARCHAR(50) NOT NULL,
  ref_id           BIGINT NOT NULL,
  order_id         BIGINT NULL,
  storage_provider VARCHAR(30) NOT NULL DEFAULT 'firebase',
  storage_path     VARCHAR(500) NULL,
  file_url         VARCHAR(500) NOT NULL,
  thumbnail_url    VARCHAR(500) NULL,
  file_name        VARCHAR(255) NULL,
  file_size        BIGINT NULL,
  file_type        VARCHAR(50) NULL,
  uploaded_by      BIGINT NOT NULL,
  uploaded_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evidence_id), KEY idx_evidence_ref (ref_type, ref_id), KEY idx_evidence_order (order_id),
  CONSTRAINT fk_evidence_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_evidence_uploader FOREIGN KEY (uploaded_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  log_id      BIGINT NOT NULL AUTO_INCREMENT,
  user_id     BIGINT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   BIGINT NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id), KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_status_history (
  history_id  BIGINT NOT NULL AUTO_INCREMENT,
  order_id    BIGINT NOT NULL,
  from_status VARCHAR(50) NULL,
  to_status   VARCHAR(50) NOT NULL,
  changed_by  BIGINT NULL,
  changed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note        TEXT NULL,
  PRIMARY KEY (history_id), KEY idx_osh_order (order_id),
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- =============================================================================
-- SEED — khớp schema 40 bảng. 3 đơn: 1 hoàn tất, 2 thi công, 3 xác nhận.
-- Tài khoản: admin/Admin@123 · manager01/Manager@123 · leader01..02/Leader@123 · tech01..02/Tech@123
-- =============================================================================
USE BNWEMS;
SET NAMES utf8mb4;

INSERT INTO roles (role_id, role_name, description) VALUES
  (1,'Admin','Quản trị hệ thống'),(2,'Manager','Điều hành & quyết toán'),
  (3,'Leader Staff','Trưởng nhóm hiện trường'),(4,'Technical Staff','Nhân viên kỹ thuật');

INSERT INTO internal_users (user_id, role_id, username, password_hash, full_name, email, phone, avatar_url, bio) VALUES
  (1,1,'admin',    '$2b$10$l.QBcxMNBEFLd9Hx9TtLd.UgHf6vbeeJTnn1IE5AROMsgjCuLr7.q','Quản trị viên','admin@company.vn','0900000001','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_1.jpg?alt=media','Quản trị hệ thống, cấu hình & phân quyền.'),
  (2,2,'manager01','$2b$10$VEImidEYNZ9H9W2JGYgBk.tT9NCEa1CiCzIoE5Oyw/hkguaFOMmSG','Nguyễn Văn Quản','manager@company.vn','0900000002','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_2.jpg?alt=media','Điều hành đơn hàng & quyết toán, 5 năm kinh nghiệm sự kiện.'),
  (3,3,'leader01', '$2b$10$Ye4P1qRrfUXSWQYnbWhVV.IzcmMZvWgiRvBb2bSys1gKbrxw/ivIa','Trần Văn Trưởng','leader1@company.vn','0900000003','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_3.jpg?alt=media','Trưởng nhóm hiện trường, chuyên lắp đặt nhà rạp.'),
  (4,3,'leader02', '$2b$10$5feKO5nKzYVCTIUA8bS6zOZpcd5.ZhvIo9Om1aZs7Xpy9CgfhlhRW','Lê Thị Nhóm','leader2@company.vn','0900000004','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_4.jpg?alt=media','Trưởng nhóm trang trí, tỉ mỉ với chi tiết hoa & gallery.'),
  (5,4,'tech01',   '$2b$10$ExRltfVE5JUQqWI4ECoqTuhm8Q1cWcBh.weAtor3sW4OTFWuN2Cw2','Phạm Văn Kỹ','tech1@company.vn','0900000005','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_5.jpg?alt=media','Kỹ thuật âm thanh – ánh sáng.'),
  (6,4,'tech02',   '$2b$10$jPNycqf9mSsvBGrkmZozs.ftBKTTj5OLMf1ezWB6s76q9b.ZlgiPG','Hoàng Văn Thuật','tech2@company.vn','0900000006','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/avatars%2Fuser_6.jpg?alt=media','Kỹ thuật lắp dựng khung & vận chuyển.');

INSERT INTO customers (customer_id, full_name, phone, email, address) VALUES
  (1,'Trần Thị Hoa','0933333331','hoa@gmail.com','Cầu Giấy, Hà Nội'),
  (2,'Công ty TNHH Sự Kiện XYZ','0933333332','xyz@company.vn','Đống Đa, Hà Nội'),
  (3,'Nguyễn Văn Phúc','0933333333','phuc@gmail.com','Hà Đông, Hà Nội');

INSERT INTO suppliers (supplier_id, name, contact_person, phone, address) VALUES
  (1,'Cho thuê thiết bị Minh Anh','Anh Minh','0911111111','Hà Nội'),
  (2,'Hoa tươi Phương Nam','Chị Nam','0922222222','Hà Nội');

INSERT INTO business_policies (policy_id, policy_type, name, config, effective_from, created_by) VALUES
  (1,'deposit','Cọc 30%','{"deposit_percent":30}','2026-01-01',1),
  (2,'cancellation','Hủy theo mốc','{"before_7d":0,"within_7d":50,"within_2d":100}','2026-01-01',1),
  (3,'compensation','Đền bù giá thay thế','{"basis":"replacement_value","rate":100}','2026-01-01',1),
  (4,'additional_fee','Phụ phí phát sinh','{"overtime_per_hour":100000}','2026-01-01',1);

INSERT INTO equipment (equipment_item_id, code, name, category, unit, rental_price, replacement_value) VALUES
  (1,'TBL-001','Bàn loại to','Bàn','cái',50000,800000),(2,'TBL-002','Bàn loại nhỏ','Bàn','cái',40000,600000),
  (3,'CHR-001','Ghế đẩu','Ghế','cái',8000,120000),(4,'CHR-002','Ghế inox (y nốc)','Ghế','cái',10000,180000),
  (5,'CHR-003','Ghế Tiffany tiệc cưới','Ghế','cái',25000,450000),(6,'TXT-001','Khăn bàn màu đỏ','Khăn bàn','cái',15000,150000),
  (7,'TXT-002','Khăn bàn màu vàng','Khăn bàn','cái',15000,150000),(8,'TXT-003','Khăn bàn màu trắng','Khăn bàn','cái',15000,150000),
  (9,'TXT-004','Áo ghế','Phụ kiện vải','cái',8000,80000),(10,'TXT-005','Nơ ghế','Phụ kiện vải','cái',3000,30000),
  (11,'TXT-006','Runner (dải trải bàn)','Phụ kiện vải','cái',10000,90000),(12,'TENT-001','Thanh sắt 2,5m','Khung nhà rạp','thanh',15000,250000),
  (13,'TENT-002','Thanh sắt 3m','Khung nhà rạp','thanh',18000,300000),(14,'TENT-003','Thanh sắt 4m','Khung nhà rạp','thanh',22000,400000),
  (15,'TENT-004','Cột chống','Khung nhà rạp','cái',10000,200000),(16,'TENT-005','Mẩu sắt nối','Khung nhà rạp','cái',2000,30000),
  (17,'TENT-006','Bạt trắng','Khung nhà rạp','tấm',50000,1200000),(18,'TENT-007','Rèm quây xung quanh','Khung nhà rạp','tấm',40000,800000),
  (19,'TENT-008','Quây trần nhà','Khung nhà rạp','tấm',60000,1500000),(20,'TENT-009','Đèn nhấp nháy','Khung nhà rạp','bộ',30000,250000),
  (21,'TENT-010','Đèn chùm','Khung nhà rạp','cái',80000,1500000),(22,'TENT-011','Đèn chạy dọc 20m','Khung nhà rạp','dây',50000,600000),
  (23,'TENT-012','Quạt công nghiệp','Khung nhà rạp','cái',70000,1800000),(24,'TENT-013','Quạt hơi nước','Khung nhà rạp','cái',100000,3500000),
  (25,'TENT-014','Thảm cỏ','Khung nhà rạp','cuộn',40000,700000),(26,'TENT-015','Thảm đỏ','Khung nhà rạp','cuộn',45000,800000),
  (27,'GATE-001','Khung cổng hình tròn','Cổng hoa','cái',150000,2000000),(28,'GATE-002','Khung cổng hình vuông','Cổng hoa','cái',150000,2000000),
  (29,'GATE-003','Khung cổng hình lục giác','Cổng hoa','cái',160000,2200000),(30,'GATE-004','Cổng vòm bằng sắt','Cổng hoa','cái',200000,2500000),
  (31,'GATE-005','Cổng vòm bằng nhựa','Cổng hoa','cái',180000,2000000),(32,'FLR-001','Hoa giả cụm - trắng','Hoa giả','cụm',30000,200000),
  (33,'FLR-002','Hoa giả cụm - hồng','Hoa giả','cụm',30000,200000),(34,'FLR-003','Hoa giả cụm - đỏ','Hoa giả','cụm',30000,200000),
  (35,'FLR-004','Hoa giả cụm - pastel','Hoa giả','cụm',30000,200000),(36,'FLR-005','Hoa giả cụm - sen đá','Hoa giả','cụm',35000,220000),
  (37,'FLR-006','Hoa giả dải dài - đa màu','Hoa giả','dải',50000,350000),(38,'GAL-001','Khay bánh cupcake','Phụ kiện gallery','cái',40000,300000),
  (39,'GAL-002','Khung ảnh trang trí','Phụ kiện gallery','cái',25000,200000),(40,'GAL-003','Hòm tiền mừng - hình ngôi nhà','Phụ kiện gallery','cái',50000,400000),
  (41,'GAL-004','Hòm tiền mừng - hình hòm thư','Phụ kiện gallery','cái',50000,400000),(42,'GAL-005','Hòm tiền mừng - mica','Phụ kiện gallery','cái',60000,500000),
  (43,'GAL-006','Bình hoa thủy tinh - nhỏ','Phụ kiện gallery','cái',20000,150000),(44,'GAL-007','Bình hoa thủy tinh - vừa','Phụ kiện gallery','cái',30000,250000),
  (45,'GAL-008','Bình hoa thủy tinh - lớn','Phụ kiện gallery','cái',40000,400000),(46,'BDR-001','Chữ trên phông','Phông cưới hỏi','bộ',200000,1500000),
  (47,'BDR-002','Đèn sân khấu','Phông cưới hỏi','cái',100000,2000000),(48,'BDR-003','Trap (khung sân khấu)','Phông cưới hỏi','bộ',300000,5000000),
  (49,'BDR-004','Phông quây','Phông cưới hỏi','tấm',150000,1500000),(50,'AUD-001','Hệ thống loa đài','Âm thanh','bộ',500000,15000000);

INSERT INTO company_bank_accounts (bank_account_id, bank_code, account_number, account_name, is_default) VALUES
  (1,'MB','0900000000000','CONG TY SU KIEN ABC',TRUE);

INSERT INTO wage_rules (wage_rule_id, role_in_task, rate_per_session, effective_from) VALUES
  (1,'leader',500000,'2026-01-01'),(2,'technical',350000,'2026-01-01');

INSERT INTO orders (order_id, order_number, customer_id, event_date, event_end_date, event_type, guest_count, event_location, total_value, status, revenue_status, recognized_at, created_by) VALUES
  (1,'DH-2026-0001',1,'2026-05-10','2026-05-11','wedding',300,'Trung tâm tiệc cưới Sao Mai',50000000,'completed','recognized','2026-05-31 18:00:00',2),
  (2,'DH-2026-0002',2,'2026-06-20',NULL,'corporate',150,'Hội trường công ty XYZ',30000000,'in_progress','pending',NULL,2),
  (3,'DH-2026-0003',3,'2026-07-15',NULL,'birthday',50,'Nhà văn hóa Hà Đông',18000000,'confirmed','pending',NULL,2);

INSERT INTO order_items (id, order_id, equipment_item_id, quantity, unit_price, source) VALUES
  (1,1,1,20,50000,'internal'),(2,1,5,200,25000,'internal'),(3,1,8,20,15000,'internal'),
  (4,1,27,1,150000,'internal'),(5,1,50,1,500000,'internal'),(6,1,46,1,200000,'supplier'),
  (7,2,2,15,40000,'internal'),(8,2,4,150,10000,'internal'),(9,2,50,1,500000,'internal'),
  (10,3,2,10,40000,'internal'),(11,3,3,80,8000,'internal'),(12,3,27,1,150000,'internal');

INSERT INTO quotations (quotation_id, customer_id, order_id, subtotal, tax, discount, total_amount, status, created_by) VALUES
  (1,1,1,50000000,0,0,50000000,'confirmed',2),(2,2,2,30000000,0,0,30000000,'confirmed',2),(3,3,3,18000000,0,0,18000000,'confirmed',2);

INSERT INTO quotation_items (id, quotation_id, equipment_item_id, quantity, unit_price, line_total) VALUES
  (1,1,1,20,50000,1000000),(2,1,5,200,25000,5000000),(3,1,8,20,15000,300000),
  (4,2,2,15,40000,600000),(5,2,4,150,10000,1500000),(6,3,2,10,40000,400000),(7,3,3,80,8000,640000);

INSERT INTO payment_requests (payment_request_id, order_id, payment_type, amount, method_hint, bank_account_id, transfer_code, status, created_by) VALUES
  (1,1,'deposit',15000000,'bank_transfer',1,'DH1COC','paid',2),
  (2,1,'final',38500000,'bank_transfer',1,'DH1CK','paid',2),
  (3,2,'deposit',9000000,'bank_transfer',1,'DH2COC','paid',2),
  (4,3,'deposit',5400000,'bank_transfer',1,'DH3COC','pending',2);

INSERT INTO payments (payment_id, payment_request_id, order_id, amount, method, status, paid_at, confirmed_by, confirmed_at) VALUES
  (1,1,1,15000000,'bank_transfer','success','2026-04-20 09:30:00',2,'2026-04-20 09:45:00'),
  (2,2,1,38500000,'bank_transfer','success','2026-05-10 20:00:00',2,'2026-05-10 20:15:00'),
  (3,3,2,9000000,'bank_transfer','success','2026-06-01 08:30:00',2,'2026-06-01 08:45:00');

INSERT INTO settlements (settlement_id, order_id, original_value, change_adjustment, additional_fee, compensation, total_amount, total_paid, remaining_amount, payment_method, recorded_by, status, confirmed_by) VALUES
  (1,1,50000000,2000000,500000,1000000,53500000,53500000,0,'bank_transfer',3,'confirmed',2);

INSERT INTO schedules (schedule_id, order_id, activity_type, planned_date, location, status, created_by) VALUES
  (1,1,'survey','2026-04-15','TT tiệc cưới Sao Mai','done',2),
  (2,1,'preparation','2026-05-09','Kho chính','done',2),
  (3,1,'execution','2026-05-09','TT tiệc cưới Sao Mai','done',2),
  (4,1,'collection','2026-05-11','TT tiệc cưới Sao Mai','done',2),
  (5,2,'survey','2026-05-25','Hội trường XYZ','done',2),
  (6,2,'preparation','2026-06-19','Kho chính','planned',2),
  (7,3,'survey','2026-07-01','Nhà văn hóa Hà Đông','planned',2);

INSERT INTO work_tasks (work_task_id, order_id, schedule_id, task_category, title, status, created_by) VALUES
  (1,1,1,'survey','Khảo sát địa điểm đơn 1','done',2),
  (2,2,5,'survey','Khảo sát địa điểm đơn 2','done',2),
  (3,3,7,'survey','Khảo sát địa điểm đơn 3','assigned',2),
  (4,1,2,'operation','Chuẩn bị & xuất kho đơn 1','done',2),
  (5,1,3,'operation','Thi công lắp đặt đơn 1','done',2),
  (6,1,4,'operation','Thu hồi đơn 1','done',2),
  (7,2,6,'operation','Chuẩn bị & xuất kho đơn 2','in_progress',2);

INSERT INTO assignments (assignment_id, work_task_id, user_id, role_in_task) VALUES
  (1,1,3,'leader'),(2,1,5,'technical'),(3,4,3,'leader'),(4,4,5,'technical'),
  (5,5,3,'leader'),(6,5,6,'technical'),(7,6,3,'leader'),(8,2,4,'leader'),(9,7,4,'leader');

INSERT INTO task_progress_updates (id, work_task_id, updated_by, step, progress_status, note, created_at) VALUES
  (1,5,3,'transport','transport','Đã vận chuyển tới địa điểm','2026-05-09 15:00:00'),
  (2,5,3,'installation','installation','Lắp xong khung rạp','2026-05-09 20:00:00'),
  (3,5,3,'handover','done','Hoàn tất bàn giao','2026-05-10 10:00:00'),
  (4,7,4,'transport','transport','Đang vận chuyển','2026-06-19 14:00:00');

INSERT INTO attendance (attendance_id, assignment_id, check_in, check_out, completion_status, confirmed_by, confirmed_at) VALUES
  (1,3,'2026-05-08 08:00:00','2026-05-08 12:00:00','completed',3,'2026-05-08 12:10:00'),
  (2,4,'2026-05-08 08:00:00','2026-05-08 12:00:00','completed',3,'2026-05-08 12:10:00'),
  (3,5,'2026-05-09 08:00:00','2026-05-10 11:00:00','completed',3,'2026-05-10 11:10:00'),
  (4,6,'2026-05-09 08:00:00','2026-05-10 11:00:00','completed',3,'2026-05-10 11:10:00'),
  (5,7,'2026-05-11 08:00:00','2026-05-11 12:00:00','completed',3,'2026-05-11 12:10:00');

INSERT INTO staff_availability (id, user_id, work_date, status, note) VALUES
  (1,3,'2026-05-09','available',NULL),(2,5,'2026-05-09','available',NULL),
  (3,6,'2026-05-09','available',NULL),(4,4,'2026-05-09','unavailable','Nghỉ phép'),(5,4,'2026-06-19','available',NULL);

INSERT INTO wage_summaries (wage_summary_id, user_id, order_id, period, total_sessions, gross_amount, total_deduction, total_wage, status, confirmed_by) VALUES
  (1,3,1,'2026-05',2,1000000,0,1000000,'settled',2),
  (2,5,1,'2026-05',2,700000,50000,650000,'settled',2),
  (3,6,1,'2026-05',1,350000,0,350000,'settled',2);

INSERT INTO inventory (equipment_item_id, total_quantity, available_quantity, damaged_quantity) VALUES
  (1,100,100,0),(2,100,100,0),(3,500,500,0),(4,300,300,0),(5,200,200,0),(6,200,200,0),(7,200,200,0),(8,200,200,0),
  (9,500,500,0),(10,500,500,0),(11,150,150,0),(12,300,300,0),(13,300,300,0),(14,200,200,0),(15,200,200,0),(16,1000,1000,0),
  (17,50,50,0),(18,80,80,0),(19,40,40,0),(20,100,100,0),(21,30,30,0),(22,40,40,0),(23,30,30,0),(24,15,13,2),
  (25,50,50,0),(26,40,40,0),(27,10,10,0),(28,10,10,0),(29,8,8,0),(30,6,6,0),(31,6,6,0),(32,100,100,0),
  (33,100,100,0),(34,100,100,0),(35,100,100,0),(36,80,80,0),(37,60,60,0),(38,30,30,0),(39,50,50,0),(40,15,15,0),
  (41,15,15,0),(42,20,20,0),(43,60,60,0),(44,50,50,0),(45,40,40,0),(46,20,20,0),(47,40,40,0),(48,10,10,0),(49,20,20,0),(50,10,10,0);

INSERT INTO inventory_reservations (reservation_id, order_id, event_date, status, created_by) VALUES
  (1,1,'2026-05-10','fulfilled',2),(2,2,'2026-06-20','reserved',2),(3,3,'2026-07-15','reserved',2);

INSERT INTO inventory_reservation_items (id, reservation_id, equipment_item_id, reserved_quantity) VALUES
  (1,1,1,20),(2,1,5,200),(3,1,8,20),(4,2,2,15),(5,2,4,150),(6,3,2,10),(7,3,3,80),(8,3,27,1);

INSERT INTO inventory_reports (inventory_report_id, order_id, report_type, recorded_by, confirmed_by, status, note) VALUES
  (1,1,'checkout',3,2,'confirmed','Xuất kho đơn 1'),
  (2,1,'return',3,2,'confirmed','Trả về kho - có hụt'),
  (3,2,'checkout',4,NULL,'submitted','Xuất kho đơn 2');

INSERT INTO inventory_report_items (id, inventory_report_id, equipment_item_id, expected_quantity, quantity, condition_status) VALUES
  (1,1,1,NULL,20,'good'),(2,1,5,NULL,200,'good'),(3,1,8,NULL,20,'good'),
  (4,2,1,20,20,'good'),(5,2,5,200,198,'lost'),(6,2,8,20,20,'good'),(7,3,2,NULL,15,'good');

INSERT INTO supplier_transactions (supplier_transaction_id, supplier_id, order_id, type, total_cost, paid_amount, payment_status, status, created_by) VALUES
  (1,1,1,'rental',5000000,5000000,'paid','returned',2),
  (2,2,2,'purchase',3000000,0,'unpaid','received',2);

INSERT INTO supplier_transaction_items (id, supplier_transaction_id, equipment_item_id, description, quantity, quantity_received, quantity_returned, unit_cost) VALUES
  (1,1,46,'Thuê chữ phông cao cấp',1,1,1,3000000),(2,1,NULL,'Thuê backdrop đặc biệt',1,1,1,2000000),(3,2,NULL,'Mua hoa tươi',1,1,0,3000000);

INSERT INTO supplier_payments (payment_id, supplier_transaction_id, amount, paid_at, recorded_by, note) VALUES
  (1,1,5000000,'2026-05-20 10:00:00',2,'Thanh toán NCC Minh Anh');

INSERT INTO survey_reports (survey_report_id, order_id, work_task_id, site_address, site_condition, feasibility_note, area_sqm, has_power, ground_type, recorded_by, reviewed_by, reviewed_at, review_note, status) VALUES
  (1,1,1,'TT tiệc cưới Sao Mai','Mặt bằng 200m2, điện 3 pha','Khả thi',200.00,TRUE,'Sân bê tông',3,2,'2026-04-16 09:00:00','Đạt yêu cầu','confirmed'),
  (2,2,2,'Hội trường XYZ','Trong nhà, điều hòa','Khả thi',150.00,TRUE,'Trong nhà',4,2,'2026-05-26 09:00:00','Đạt','confirmed'),
  (3,3,3,'Nhà văn hóa Hà Đông','Sân ngoài trời','Cần kiểm tra thời tiết',150.00,FALSE,'Sân ngoài trời',3,NULL,NULL,NULL,'submitted');

INSERT INTO change_requests (change_request_id, order_id, requested_by, type, reason, note_from_leader, estimated_cost, status, executed_at, approved_by, reconciled_by, reconciled_at) VALUES
  (1,1,3,'add','Khách thêm cổng vòm sắt','Lắp được trong ngày',2000000,'reconciled','2026-05-09 18:00:00',2,2,'2026-05-11 09:00:00'),
  (2,2,4,'replace','Đổi ghế inox sang Tiffany','Cần xác nhận màu',300000,'pending',NULL,NULL,NULL,NULL);

INSERT INTO change_request_items (id, change_request_id, equipment_item_id, quantity, action, note) VALUES
  (1,1,30,1,'add','Cổng vòm lối vào'),(2,2,4,20,'replace','Nâng cấp ghế tiệc');

INSERT INTO handover_records (handover_id, order_id, recorded_by, confirmed_by, status, note) VALUES
  (1,1,3,2,'confirmed','Bàn giao hoàn tất, khách ký nhận');

INSERT INTO damage_loss_reports (damage_loss_id, order_id, recorded_by, confirmed_by, total_compensation, status) VALUES
  (1,1,3,2,1000000,'confirmed');

INSERT INTO damage_loss_items (id, damage_loss_id, equipment_item_id, quantity, damage_type, source, supplier_transaction_item_id, compensation_amount) VALUES
  (1,1,5,2,'lost','internal',NULL,900000),(2,1,46,1,'damaged','supplier',1,100000);

INSERT INTO notifications (notification_id, user_id, type, title, content, priority, target_screen, target_ref_type, target_ref_id, is_read, push_status, push_sent_at, fcm_message_id) VALUES
  (1,3,'task','Bạn được giao khảo sát','Khảo sát địa điểm đơn 1','normal','task_detail','work_task',1,TRUE,'sent','2026-04-15 08:05:00','projects/bnwems/messages/1'),
  (2,2,'operational','Cần xác nhận bàn giao','Đơn 1 có handover chờ duyệt','high','handover_detail','handover_record',1,TRUE,'sent','2026-05-10 10:05:00','projects/bnwems/messages/2'),
  (3,2,'operational','Cần phê duyệt phát sinh','Đơn 2 yêu cầu đổi thiết bị','high','change_request_detail','change_request',2,FALSE,'sent','2026-06-15 09:00:00','projects/bnwems/messages/3'),
  (4,4,'task','Bạn được giao việc','Chuẩn bị & xuất kho đơn 2','normal','task_detail','work_task',7,FALSE,'failed',NULL,NULL);

INSERT INTO device_tokens (device_token_id, user_id, fcm_token, platform, device_name, last_used_at) VALUES
  (1,2,'fcm_demo_manager01_0001','android','Manager Pixel 7','2026-06-29 08:00:00'),
  (2,3,'fcm_demo_leader01_0002','android','Leader Samsung A52','2026-06-28 18:00:00'),
  (3,5,'fcm_demo_tech01_0003','ios','Tech iPhone 12','2026-06-28 17:00:00');

INSERT INTO evidence (evidence_id, ref_type, ref_id, order_id, storage_path, file_url, file_name, file_size, file_type, uploaded_by) VALUES
  (1,'survey_report',1,1,'evidences/order_1/survey_1.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fsurvey_1.jpg?alt=media','survey_1.jpg',251000,'image',3),
  (2,'payment',1,1,'evidences/order_1/pay_1.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fpay_1.jpg?alt=media','pay_1.jpg',252000,'image',2),
  (3,'payment',2,1,'evidences/order_1/pay_2.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fpay_2.jpg?alt=media','pay_2.jpg',253000,'image',3),
  (4,'handover_record',1,1,'evidences/order_1/handover_1.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fhandover_1.jpg?alt=media','handover_1.jpg',254000,'image',3),
  (5,'damage_loss_report',1,1,'evidences/order_1/damage_1.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fdamage_1.jpg?alt=media','damage_1.jpg',255000,'image',3),
  (6,'inventory_report',1,1,'evidences/order_1/checkout_1.jpg','https://firebasestorage.googleapis.com/v0/b/bnwems.appspot.com/o/evidences%2Forder_1%2Fcheckout_1.jpg?alt=media','checkout_1.jpg',256000,'image',3);

INSERT INTO audit_logs (log_id, user_id, action, entity_type, entity_id, new_value) VALUES
  (1,2,'login','internal_users',2,NULL),
  (2,2,'create','orders',1,'{"status":"draft"}'),
  (3,2,'confirm','payments',1,'{"status":"success"}'),
  (4,1,'recognize_revenue','orders',1,'{"period":"2026-05"}');