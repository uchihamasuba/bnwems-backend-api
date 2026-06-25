-- =============================================================================
-- HỆ THỐNG CHO THUÊ & LẮP ĐẶT THIẾT BỊ SỰ KIỆN
-- MySQL 8.0+ / InnoDB / utf8mb4
-- Sinh từ tài liệu thiết kế: database-design-event-rental.md
-- Quy ước: tiền DECIMAL(12,2), khóa BIGINT AUTO_INCREMENT
-- =============================================================================

CREATE DATABASE IF NOT EXISTS BNWEMS;
USE BNWEMS;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS evidence;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS damage_loss_items;
DROP TABLE IF EXISTS damage_loss_reports;
DROP TABLE IF EXISTS handover_records;
DROP TABLE IF EXISTS change_request_items;
DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS survey_reports;
DROP TABLE IF EXISTS supplier_payments;
DROP TABLE IF EXISTS supplier_debts;
DROP TABLE IF EXISTS supplier_return_report_items;
DROP TABLE IF EXISTS supplier_return_reports;
DROP TABLE IF EXISTS supplier_receipt_report_items;
DROP TABLE IF EXISTS supplier_receipt_reports;
DROP TABLE IF EXISTS supplier_transaction_items;
DROP TABLE IF EXISTS supplier_transactions;
DROP TABLE IF EXISTS equipment_maintenance;
DROP TABLE IF EXISTS pick_list_items;
DROP TABLE IF EXISTS pick_lists;
DROP TABLE IF EXISTS warehouse_history_items;
DROP TABLE IF EXISTS warehouse_histories;
DROP TABLE IF EXISTS inventory_report_items;
DROP TABLE IF EXISTS inventory_reports;
DROP TABLE IF EXISTS inventory_reservation_items;
DROP TABLE IF EXISTS inventory_reservations;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS wage_payments;
DROP TABLE IF EXISTS wage_deductions;
DROP TABLE IF EXISTS wage_summary_lines;
DROP TABLE IF EXISTS wage_summaries;
DROP TABLE IF EXISTS wage_rules;
DROP TABLE IF EXISTS staff_availability;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS task_progress_updates;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS work_tasks;
DROP TABLE IF EXISTS schedule_activities;
DROP TABLE IF EXISTS schedule_plans;
DROP TABLE IF EXISTS settlement_lines;
DROP TABLE IF EXISTS settlements;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_requests;
DROP TABLE IF EXISTS company_bank_accounts;
DROP TABLE IF EXISTS revenue_records;
DROP TABLE IF EXISTS order_outstanding_cases;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS item_cost_history;
DROP TABLE IF EXISTS item_price_history;
DROP TABLE IF EXISTS catalog_items;
DROP TABLE IF EXISTS business_policies;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS internal_users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USER & ROLE
-- =============================================================================

CREATE TABLE roles (
  role_id      BIGINT       NOT NULL AUTO_INCREMENT,
  role_name    VARCHAR(50)  NOT NULL,
  description  VARCHAR(255) NULL,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_roles_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE internal_users (
  user_id        BIGINT       NOT NULL AUTO_INCREMENT,
  role_id        BIGINT       NOT NULL,
  username       VARCHAR(100) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  email          VARCHAR(150) NULL,
  phone          VARCHAR(20)  NULL,
  status         ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 3. CUSTOMER & POLICY
-- =============================================================================

CREATE TABLE customers (
  customer_id  BIGINT       NOT NULL AUTO_INCREMENT,
  full_name    VARCHAR(150) NOT NULL,
  phone        VARCHAR(20)  NULL,
  email        VARCHAR(150) NULL,
  address      VARCHAR(255) NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customers_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE suppliers (
  supplier_id     BIGINT       NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150) NOT NULL,
  contact_person  VARCHAR(150) NULL,
  phone           VARCHAR(20)  NULL,
  address         VARCHAR(255) NULL,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE warehouses (
  warehouse_id  BIGINT       NOT NULL AUTO_INCREMENT,
  name          VARCHAR(150) NOT NULL,
  address       VARCHAR(255) NULL,
  status        ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE catalog_items (
  catalog_item_id       BIGINT        NOT NULL AUTO_INCREMENT,
  code                  VARCHAR(50)   NOT NULL,
  name                  VARCHAR(150)  NOT NULL,
  category              VARCHAR(100)  NULL,
  unit                  VARCHAR(30)   NULL,
  current_rental_price  DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_cost          DECIMAL(12,2) NOT NULL DEFAULT 0,
  replacement_value     DECIMAL(12,2) NOT NULL DEFAULT 0,
  status                ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (catalog_item_id),
  UNIQUE KEY uq_catalog_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE business_policies (
  policy_id       BIGINT      NOT NULL AUTO_INCREMENT,
  policy_type     ENUM('deposit','cancellation','compensation','additional_fee','wage') NOT NULL,
  name            VARCHAR(150) NOT NULL,
  config          JSON         NOT NULL,
  effective_from  DATE         NOT NULL,
  effective_to    DATE         NULL,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_by      BIGINT       NOT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (policy_id),
  KEY idx_policy_type (policy_type),
  CONSTRAINT fk_policy_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 4. CATALOG PRICE / COST HISTORY
-- =============================================================================

CREATE TABLE item_price_history (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  catalog_item_id BIGINT        NOT NULL,
  price           DECIMAL(12,2) NOT NULL,
  effective_from  DATETIME      NOT NULL,
  effective_to    DATETIME      NULL,
  created_by      BIGINT        NOT NULL,
  PRIMARY KEY (id),
  KEY idx_price_item (catalog_item_id),
  CONSTRAINT fk_price_item    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id),
  CONSTRAINT fk_price_creator FOREIGN KEY (created_by)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE item_cost_history (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  catalog_item_id BIGINT        NOT NULL,
  cost            DECIMAL(12,2) NOT NULL,
  effective_from  DATETIME      NOT NULL,
  effective_to    DATETIME      NULL,
  created_by      BIGINT        NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cost_item (catalog_item_id),
  CONSTRAINT fk_cost_item    FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id),
  CONSTRAINT fk_cost_creator FOREIGN KEY (created_by)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 5. ORDER & QUOTATION
-- =============================================================================

CREATE TABLE orders (
  order_id              BIGINT        NOT NULL AUTO_INCREMENT,
  customer_id           BIGINT        NOT NULL,
  event_date            DATE          NOT NULL,
  event_location        VARCHAR(255)  NULL,
  total_value           DECIMAL(12,2) NOT NULL DEFAULT 0,
  status                ENUM('draft','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
  revenue_status        ENUM('pending','recognized') NOT NULL DEFAULT 'pending',
  created_by            BIGINT        NOT NULL,
  created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  KEY idx_orders_customer (customer_id),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT fk_orders_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quotations (
  quotation_id  BIGINT        NOT NULL AUTO_INCREMENT,
  customer_id   BIGINT        NOT NULL,
  order_id      BIGINT        NOT NULL,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('draft','confirmed','deleted') NOT NULL DEFAULT 'draft',
  created_by    BIGINT        NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (quotation_id),
  UNIQUE KEY uq_quotation_order (order_id),     -- ép quan hệ 1:1 với order
  KEY idx_quotation_customer (customer_id),
  CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT fk_quotation_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_quotation_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quotation_items (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  quotation_id    BIGINT        NOT NULL,
  catalog_item_id BIGINT        NOT NULL,
  quantity        INT           NOT NULL,
  unit_price      DECIMAL(12,2) NOT NULL,
  line_total      DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_qitem_quotation (quotation_id),
  CONSTRAINT fk_qitem_quotation FOREIGN KEY (quotation_id)    REFERENCES quotations (quotation_id) ON DELETE CASCADE,
  CONSTRAINT fk_qitem_catalog   FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  order_id        BIGINT        NOT NULL,
  catalog_item_id BIGINT        NOT NULL,
  quantity        INT           NOT NULL,
  unit_price      DECIMAL(12,2) NOT NULL,
  source          ENUM('internal','supplier') NOT NULL DEFAULT 'internal',
  PRIMARY KEY (id),
  KEY idx_oitem_order (order_id),
  CONSTRAINT fk_oitem_order   FOREIGN KEY (order_id)        REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oitem_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_status_history (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  order_id    BIGINT       NOT NULL,
  from_status VARCHAR(30)  NULL,
  to_status   VARCHAR(30)  NOT NULL,
  changed_by  BIGINT       NOT NULL,
  note        VARCHAR(255) NULL,
  changed_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_osh_order (order_id),
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id)   REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT fk_osh_user  FOREIGN KEY (changed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_outstanding_cases (
  case_id      BIGINT        NOT NULL AUTO_INCREMENT,
  order_id     BIGINT        NOT NULL,
  case_type    ENUM('supplier_debt','wage_pending') NOT NULL,
  reference_id BIGINT        NOT NULL,
  direction    ENUM('out')   NOT NULL DEFAULT 'out',
  amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  status       ENUM('open','resolved') NOT NULL DEFAULT 'open',
  resolved_by  BIGINT        NULL,
  resolved_at  DATETIME      NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (case_id),
  KEY idx_ooc_order (order_id),
  KEY idx_ooc_ref (case_type, reference_id),
  CONSTRAINT fk_ooc_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_ooc_resolver FOREIGN KEY (resolved_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE revenue_records (
  revenue_record_id BIGINT        NOT NULL AUTO_INCREMENT,
  order_id          BIGINT        NOT NULL,
  recognized_period VARCHAR(7)    NOT NULL,
  gross_revenue     DECIMAL(12,2) NOT NULL,
  revenue_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_revenue       DECIMAL(12,2) NOT NULL,
  supplier_cost     DECIMAL(12,2) NOT NULL DEFAULT 0,
  wage_cost         DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_profit      DECIMAL(12,2) NOT NULL,
  recognized_at     DATETIME      NOT NULL,
  recognized_by     BIGINT        NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (revenue_record_id),
  UNIQUE KEY uq_revrec_order (order_id),         -- 1:1 với order
  KEY idx_revrec_period (recognized_period),
  CONSTRAINT fk_revrec_order    FOREIGN KEY (order_id)      REFERENCES orders (order_id),
  CONSTRAINT fk_revrec_recognizer FOREIGN KEY (recognized_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 6. PAYMENT & SETTLEMENT
-- =============================================================================

CREATE TABLE company_bank_accounts (
  bank_account_id BIGINT       NOT NULL AUTO_INCREMENT,
  bank_code       VARCHAR(20)  NOT NULL,
  account_number  VARCHAR(30)  NOT NULL,
  account_name    VARCHAR(150) NOT NULL,
  is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
  status          ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (bank_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payment_requests (
  payment_request_id BIGINT        NOT NULL AUTO_INCREMENT,
  order_id           BIGINT        NOT NULL,
  payment_type       ENUM('deposit','final') NOT NULL,
  amount             DECIMAL(12,2) NOT NULL,
  method_hint        ENUM('cash','bank_transfer') NULL,
  bank_account_id    BIGINT        NULL,
  transfer_code      VARCHAR(50)   NULL,
  qr_url             VARCHAR(500)  NULL,
  due_date           DATE          NULL,
  instruction        TEXT          NULL,
  status             ENUM('pending','partially_paid','paid','cancelled') NOT NULL DEFAULT 'pending',
  created_by         BIGINT        NOT NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_request_id),
  UNIQUE KEY uq_preq_transfer_code (transfer_code),
  KEY idx_preq_order (order_id),
  KEY idx_preq_bank (bank_account_id),
  CONSTRAINT fk_preq_order   FOREIGN KEY (order_id)        REFERENCES orders (order_id),
  CONSTRAINT fk_preq_bank    FOREIGN KEY (bank_account_id) REFERENCES company_bank_accounts (bank_account_id),
  CONSTRAINT fk_preq_creator FOREIGN KEY (created_by)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
  payment_id         BIGINT        NOT NULL AUTO_INCREMENT,
  payment_request_id BIGINT        NOT NULL,
  order_id           BIGINT        NOT NULL,
  amount             DECIMAL(12,2) NOT NULL,
  method             ENUM('cash','bank_transfer') NOT NULL,
  status             ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
  paid_at            DATETIME      NULL,
  confirmed_by       BIGINT        NOT NULL,
  confirmed_at       DATETIME      NULL,
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (payment_id),
  KEY idx_pay_request (payment_request_id),
  KEY idx_pay_order (order_id),
  CONSTRAINT fk_pay_request   FOREIGN KEY (payment_request_id) REFERENCES payment_requests (payment_request_id),
  CONSTRAINT fk_pay_order     FOREIGN KEY (order_id)           REFERENCES orders (order_id),
  CONSTRAINT fk_pay_confirmer FOREIGN KEY (confirmed_by)       REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settlements (
  settlement_id     BIGINT        NOT NULL AUTO_INCREMENT,
  order_id          BIGINT        NOT NULL,
  original_value    DECIMAL(12,2) NOT NULL,
  change_adjustment DECIMAL(12,2) NOT NULL DEFAULT 0,
  additional_fee    DECIMAL(12,2) NOT NULL DEFAULT 0,
  compensation      DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_paid        DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method    ENUM('cash','bank_transfer') NULL,
  recorded_by       BIGINT        NULL,
  status            ENUM('draft','recorded','confirmed') NOT NULL DEFAULT 'draft',
  confirmed_by      BIGINT        NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (settlement_id),
  UNIQUE KEY uq_settlement_order (order_id),    -- 1:1 với order
  CONSTRAINT fk_settle_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_settle_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_settle_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE settlement_lines (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  settlement_id BIGINT        NOT NULL,
  line_type     ENUM('original','change','additional_fee','compensation','deposit','payment') NOT NULL,
  ref_type      VARCHAR(50)   NULL,
  ref_id        BIGINT        NULL,
  description   VARCHAR(255)  NULL,
  amount        DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sline_settlement (settlement_id),
  CONSTRAINT fk_sline_settlement FOREIGN KEY (settlement_id) REFERENCES settlements (settlement_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 7. SCHEDULE
-- =============================================================================

CREATE TABLE schedule_plans (
  schedule_plan_id BIGINT   NOT NULL AUTO_INCREMENT,
  order_id         BIGINT   NOT NULL,
  status           ENUM('draft','active','done','deleted') NOT NULL DEFAULT 'draft',
  created_by       BIGINT   NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (schedule_plan_id),
  UNIQUE KEY uq_plan_order (order_id),          -- 1:1 với order
  CONSTRAINT fk_plan_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
  CONSTRAINT fk_plan_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE schedule_activities (
  activity_id      BIGINT       NOT NULL AUTO_INCREMENT,
  schedule_plan_id BIGINT       NOT NULL,
  activity_type    ENUM('preparation','transport','execution','collection','return') NOT NULL,
  planned_start    DATETIME     NOT NULL,
  planned_end      DATETIME     NULL,
  location         VARCHAR(255) NULL,
  note             TEXT         NULL,
  sort_order       INT          NULL,
  PRIMARY KEY (activity_id),
  KEY idx_act_plan (schedule_plan_id),
  CONSTRAINT fk_act_plan FOREIGN KEY (schedule_plan_id) REFERENCES schedule_plans (schedule_plan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 8. TASK & ATTENDANCE
-- =============================================================================

CREATE TABLE work_tasks (
  work_task_id        BIGINT       NOT NULL AUTO_INCREMENT,
  order_id            BIGINT       NOT NULL,
  task_category       ENUM('survey','operation') NOT NULL DEFAULT 'operation',
  schedule_activity_id BIGINT      NULL,
  title               VARCHAR(200) NOT NULL,
  description         TEXT         NULL,
  status              ENUM('draft','assigned','in_progress','done') NOT NULL DEFAULT 'draft',
  created_by          BIGINT       NOT NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (work_task_id),
  KEY idx_task_order (order_id),
  KEY idx_task_activity (schedule_activity_id),
  CONSTRAINT fk_task_order    FOREIGN KEY (order_id)             REFERENCES orders (order_id),
  CONSTRAINT fk_task_activity FOREIGN KEY (schedule_activity_id) REFERENCES schedule_activities (activity_id),
  CONSTRAINT fk_task_creator  FOREIGN KEY (created_by)           REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE assignments (
  assignment_id BIGINT   NOT NULL AUTO_INCREMENT,
  work_task_id  BIGINT   NOT NULL,
  user_id       BIGINT   NOT NULL,
  role_in_task  ENUM('leader','technical') NOT NULL,
  assigned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (assignment_id),
  UNIQUE KEY uq_assign_task_user (work_task_id, user_id),
  KEY idx_assign_user (user_id),
  CONSTRAINT fk_assign_task FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_user FOREIGN KEY (user_id)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task_progress_updates (
  id              BIGINT      NOT NULL AUTO_INCREMENT,
  work_task_id    BIGINT      NOT NULL,
  updated_by      BIGINT      NOT NULL,
  progress_status VARCHAR(50) NOT NULL,
  note            TEXT        NULL,
  created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tpu_task (work_task_id),
  CONSTRAINT fk_tpu_task FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id) ON DELETE CASCADE,
  CONSTRAINT fk_tpu_user FOREIGN KEY (updated_by)   REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
  attendance_id     BIGINT   NOT NULL AUTO_INCREMENT,
  assignment_id     BIGINT   NOT NULL,
  check_in          DATETIME NULL,
  check_out         DATETIME NULL,
  completion_status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  confirmed_by      BIGINT   NULL,
  confirmed_at      DATETIME NULL,
  PRIMARY KEY (attendance_id),
  KEY idx_att_assignment (assignment_id),
  CONSTRAINT fk_att_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (assignment_id) ON DELETE CASCADE,
  CONSTRAINT fk_att_confirmer  FOREIGN KEY (confirmed_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE staff_availability (
  id        BIGINT       NOT NULL AUTO_INCREMENT,
  user_id   BIGINT       NOT NULL,
  work_date DATE         NOT NULL,
  status    ENUM('available','unavailable') NOT NULL DEFAULT 'available',
  note      VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_avail_user_date (user_id, work_date),
  CONSTRAINT fk_avail_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 9. WAGE
-- =============================================================================

CREATE TABLE wage_rules (
  wage_rule_id     BIGINT        NOT NULL AUTO_INCREMENT,
  role_in_task     ENUM('leader','technical') NOT NULL,
  rate_per_session DECIMAL(12,2) NOT NULL,
  effective_from   DATE          NOT NULL,
  effective_to     DATE          NULL,
  status           ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (wage_rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wage_summaries (
  wage_summary_id BIGINT        NOT NULL AUTO_INCREMENT,
  user_id         BIGINT        NOT NULL,
  order_id        BIGINT        NULL,
  period          VARCHAR(20)   NULL,
  total_sessions  INT           NOT NULL DEFAULT 0,
  gross_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_deduction DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_wage      DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          ENUM('draft','confirmed','settled') NOT NULL DEFAULT 'draft',
  confirmed_by    BIGINT        NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (wage_summary_id),
  KEY idx_wage_user (user_id),
  KEY idx_wage_order (order_id),
  CONSTRAINT fk_wage_user      FOREIGN KEY (user_id)      REFERENCES internal_users (user_id),
  CONSTRAINT fk_wage_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_wage_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wage_summary_lines (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  wage_summary_id BIGINT        NOT NULL,
  assignment_id   BIGINT        NULL,
  attendance_id   BIGINT        NULL,
  wage_rule_id    BIGINT        NULL,
  session_date    DATE          NULL,
  wage_rate       DECIMAL(12,2) NOT NULL,
  line_amount     DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_wsl_summary (wage_summary_id),
  CONSTRAINT fk_wsl_summary    FOREIGN KEY (wage_summary_id) REFERENCES wage_summaries (wage_summary_id) ON DELETE CASCADE,
  CONSTRAINT fk_wsl_assignment FOREIGN KEY (assignment_id)   REFERENCES assignments (assignment_id),
  CONSTRAINT fk_wsl_attendance FOREIGN KEY (attendance_id)   REFERENCES attendance (attendance_id),
  CONSTRAINT fk_wsl_rule       FOREIGN KEY (wage_rule_id)    REFERENCES wage_rules (wage_rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wage_deductions (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  wage_summary_id BIGINT        NOT NULL,
  reason          VARCHAR(255)  NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  created_by      BIGINT        NOT NULL,
  PRIMARY KEY (id),
  KEY idx_wded_summary (wage_summary_id),
  CONSTRAINT fk_wded_summary FOREIGN KEY (wage_summary_id) REFERENCES wage_summaries (wage_summary_id) ON DELETE CASCADE,
  CONSTRAINT fk_wded_creator FOREIGN KEY (created_by)      REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE wage_payments (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  wage_summary_id BIGINT        NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  paid_at         DATETIME      NOT NULL,
  paid_by         BIGINT        NOT NULL,
  note            VARCHAR(255)  NULL,
  PRIMARY KEY (id),
  KEY idx_wpay_summary (wage_summary_id),
  CONSTRAINT fk_wpay_summary FOREIGN KEY (wage_summary_id) REFERENCES wage_summaries (wage_summary_id),
  CONSTRAINT fk_wpay_payer   FOREIGN KEY (paid_by)         REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 10. INVENTORY
-- =============================================================================

CREATE TABLE inventory (
  inventory_id       BIGINT NOT NULL AUTO_INCREMENT,
  catalog_item_id    BIGINT NOT NULL,
  warehouse_id       BIGINT NOT NULL,
  total_quantity     INT    NOT NULL DEFAULT 0,
  available_quantity INT    NOT NULL DEFAULT 0,
  PRIMARY KEY (inventory_id),
  UNIQUE KEY uq_inv_item_wh (catalog_item_id, warehouse_id),
  CONSTRAINT fk_inv_catalog   FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id),
  CONSTRAINT fk_inv_warehouse FOREIGN KEY (warehouse_id)    REFERENCES warehouses (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reservations (
  reservation_id BIGINT   NOT NULL AUTO_INCREMENT,
  order_id       BIGINT   NOT NULL,
  event_date     DATE     NOT NULL,
  status         ENUM('reserved','released','fulfilled') NOT NULL DEFAULT 'reserved',
  created_by     BIGINT   NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reservation_id),
  KEY idx_resv_order (order_id),
  CONSTRAINT fk_resv_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
  CONSTRAINT fk_resv_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reservation_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  reservation_id    BIGINT NOT NULL,
  catalog_item_id   BIGINT NOT NULL,
  reserved_quantity INT    NOT NULL,
  PRIMARY KEY (id),
  KEY idx_rsvitem_resv (reservation_id),
  CONSTRAINT fk_rsvitem_resv    FOREIGN KEY (reservation_id)  REFERENCES inventory_reservations (reservation_id) ON DELETE CASCADE,
  CONSTRAINT fk_rsvitem_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_reports (
  inventory_report_id BIGINT   NOT NULL AUTO_INCREMENT,
  order_id            BIGINT   NOT NULL,
  report_type         ENUM('checkout','collection','return') NOT NULL,
  recorded_by         BIGINT   NOT NULL,
  confirmed_by        BIGINT   NULL,
  status              ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  note                TEXT     NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (inventory_report_id),
  KEY idx_invrep_order (order_id),
  CONSTRAINT fk_invrep_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_invrep_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_invrep_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_report_items (
  id                  BIGINT NOT NULL AUTO_INCREMENT,
  inventory_report_id BIGINT NOT NULL,
  catalog_item_id     BIGINT NOT NULL,
  expected_quantity   INT    NULL,
  quantity            INT    NOT NULL,
  condition_status    ENUM('good','damaged','lost') NOT NULL DEFAULT 'good',
  PRIMARY KEY (id),
  KEY idx_invrepitem_report (inventory_report_id),
  CONSTRAINT fk_invrepitem_report  FOREIGN KEY (inventory_report_id) REFERENCES inventory_reports (inventory_report_id) ON DELETE CASCADE,
  CONSTRAINT fk_invrepitem_catalog FOREIGN KEY (catalog_item_id)     REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Lưu ý: 'condition' là từ khóa MySQL nên cột đặt tên condition_status.

CREATE TABLE warehouse_histories (
  history_id          BIGINT   NOT NULL AUTO_INCREMENT,
  warehouse_id        BIGINT   NOT NULL,
  order_id            BIGINT   NULL,
  inventory_report_id BIGINT   NULL,
  movement_type       ENUM('in','out','return','adjust') NOT NULL,
  created_by          BIGINT   NOT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (history_id),
  KEY idx_wh_warehouse (warehouse_id),
  CONSTRAINT fk_wh_warehouse FOREIGN KEY (warehouse_id)        REFERENCES warehouses (warehouse_id),
  CONSTRAINT fk_wh_order     FOREIGN KEY (order_id)            REFERENCES orders (order_id),
  CONSTRAINT fk_wh_report    FOREIGN KEY (inventory_report_id) REFERENCES inventory_reports (inventory_report_id),
  CONSTRAINT fk_wh_creator   FOREIGN KEY (created_by)          REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE warehouse_history_items (
  id              BIGINT NOT NULL AUTO_INCREMENT,
  history_id      BIGINT NOT NULL,
  catalog_item_id BIGINT NOT NULL,
  quantity        INT    NOT NULL,
  PRIMARY KEY (id),
  KEY idx_whitem_history (history_id),
  CONSTRAINT fk_whitem_history FOREIGN KEY (history_id)      REFERENCES warehouse_histories (history_id) ON DELETE CASCADE,
  CONSTRAINT fk_whitem_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pick_lists (
  pick_list_id BIGINT   NOT NULL AUTO_INCREMENT,
  order_id     BIGINT   NOT NULL,
  purpose      ENUM('preparation','checkout','delivery','collection','return') NOT NULL,
  status       ENUM('draft','active','done') NOT NULL DEFAULT 'draft',
  created_by   BIGINT   NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (pick_list_id),
  KEY idx_pl_order (order_id),
  CONSTRAINT fk_pl_order   FOREIGN KEY (order_id)   REFERENCES orders (order_id),
  CONSTRAINT fk_pl_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pick_list_items (
  id               BIGINT NOT NULL AUTO_INCREMENT,
  pick_list_id     BIGINT NOT NULL,
  catalog_item_id  BIGINT NOT NULL,
  planned_quantity INT    NOT NULL,
  actual_quantity  INT    NULL,
  PRIMARY KEY (id),
  KEY idx_plitem_list (pick_list_id),
  CONSTRAINT fk_plitem_list    FOREIGN KEY (pick_list_id)    REFERENCES pick_lists (pick_list_id) ON DELETE CASCADE,
  CONSTRAINT fk_plitem_catalog FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE equipment_maintenance (
  maintenance_id  BIGINT   NOT NULL AUTO_INCREMENT,
  catalog_item_id BIGINT   NOT NULL,
  warehouse_id    BIGINT   NULL,
  quantity        INT      NOT NULL,
  start_date      DATE     NOT NULL,
  end_date        DATE     NULL,
  status          ENUM('in_maintenance','done') NOT NULL DEFAULT 'in_maintenance',
  note            TEXT     NULL,
  PRIMARY KEY (maintenance_id),
  KEY idx_maint_catalog (catalog_item_id),
  CONSTRAINT fk_maint_catalog   FOREIGN KEY (catalog_item_id) REFERENCES catalog_items (catalog_item_id),
  CONSTRAINT fk_maint_warehouse FOREIGN KEY (warehouse_id)    REFERENCES warehouses (warehouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 11. SUPPLIER
-- =============================================================================

CREATE TABLE supplier_transactions (
  supplier_transaction_id BIGINT        NOT NULL AUTO_INCREMENT,
  supplier_id             BIGINT        NOT NULL,
  order_id                BIGINT        NOT NULL,
  type                    ENUM('rental','purchase') NOT NULL,
  total_cost              DECIMAL(12,2) NOT NULL DEFAULT 0,
  expected_delivery       DATE          NULL,
  status                  ENUM('draft','confirmed','received','returned') NOT NULL DEFAULT 'draft',
  created_by              BIGINT        NOT NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_transaction_id),
  KEY idx_st_supplier (supplier_id),
  KEY idx_st_order (order_id),
  CONSTRAINT fk_st_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
  CONSTRAINT fk_st_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_st_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_transaction_items (
  id                      BIGINT        NOT NULL AUTO_INCREMENT,
  supplier_transaction_id BIGINT        NOT NULL,
  catalog_item_id         BIGINT        NULL,
  description             VARCHAR(255)  NULL,
  quantity                INT           NOT NULL,
  unit_cost               DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_stitem_trans (supplier_transaction_id),
  CONSTRAINT fk_stitem_trans   FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id) ON DELETE CASCADE,
  CONSTRAINT fk_stitem_catalog FOREIGN KEY (catalog_item_id)         REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_receipt_reports (
  receipt_report_id       BIGINT   NOT NULL AUTO_INCREMENT,
  supplier_transaction_id BIGINT   NOT NULL,
  recorded_by             BIGINT   NOT NULL,
  confirmed_by            BIGINT   NULL,
  status                  ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  note                    TEXT     NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (receipt_report_id),
  KEY idx_srr_trans (supplier_transaction_id),
  CONSTRAINT fk_srr_trans     FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id),
  CONSTRAINT fk_srr_recorder  FOREIGN KEY (recorded_by)             REFERENCES internal_users (user_id),
  CONSTRAINT fk_srr_confirmer FOREIGN KEY (confirmed_by)            REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_receipt_report_items (
  id                           BIGINT       NOT NULL AUTO_INCREMENT,
  receipt_report_id            BIGINT       NOT NULL,
  supplier_transaction_item_id BIGINT       NULL,
  catalog_item_id              BIGINT       NULL,
  description                  VARCHAR(255) NULL,
  received_quantity            INT          NOT NULL,
  condition_status             ENUM('good','damaged') NOT NULL DEFAULT 'good',
  PRIMARY KEY (id),
  KEY idx_srri_report (receipt_report_id),
  CONSTRAINT fk_srri_report  FOREIGN KEY (receipt_report_id)            REFERENCES supplier_receipt_reports (receipt_report_id) ON DELETE CASCADE,
  CONSTRAINT fk_srri_stitem  FOREIGN KEY (supplier_transaction_item_id) REFERENCES supplier_transaction_items (id),
  CONSTRAINT fk_srri_catalog FOREIGN KEY (catalog_item_id)              REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_return_reports (
  return_report_id        BIGINT        NOT NULL AUTO_INCREMENT,
  supplier_transaction_id BIGINT        NOT NULL,
  recorded_by             BIGINT        NOT NULL,
  confirmed_by            BIGINT        NULL,
  total_compensation      DECIMAL(12,2) NOT NULL DEFAULT 0,
  status                  ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (return_report_id),
  KEY idx_srrr_trans (supplier_transaction_id),
  CONSTRAINT fk_srrr_trans     FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id),
  CONSTRAINT fk_srrr_recorder  FOREIGN KEY (recorded_by)             REFERENCES internal_users (user_id),
  CONSTRAINT fk_srrr_confirmer FOREIGN KEY (confirmed_by)            REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_return_report_items (
  id                  BIGINT        NOT NULL AUTO_INCREMENT,
  return_report_id    BIGINT        NOT NULL,
  catalog_item_id     BIGINT        NULL,
  description         VARCHAR(255)  NULL,
  returned_quantity   INT           NOT NULL,
  condition_status    ENUM('good','damaged','lost') NOT NULL,
  compensation_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_srreti_report (return_report_id),
  CONSTRAINT fk_srreti_report  FOREIGN KEY (return_report_id) REFERENCES supplier_return_reports (return_report_id) ON DELETE CASCADE,
  CONSTRAINT fk_srreti_catalog FOREIGN KEY (catalog_item_id)  REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_debts (
  debt_id                 BIGINT        NOT NULL AUTO_INCREMENT,
  supplier_id             BIGINT        NOT NULL,
  supplier_transaction_id BIGINT        NOT NULL,
  amount                  DECIMAL(12,2) NOT NULL,
  paid_amount             DECIMAL(12,2) NOT NULL DEFAULT 0,
  status                  ENUM('open','partial','paid') NOT NULL DEFAULT 'open',
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (debt_id),
  KEY idx_debt_supplier (supplier_id),
  KEY idx_debt_trans (supplier_transaction_id),
  CONSTRAINT fk_debt_supplier FOREIGN KEY (supplier_id)             REFERENCES suppliers (supplier_id),
  CONSTRAINT fk_debt_trans    FOREIGN KEY (supplier_transaction_id) REFERENCES supplier_transactions (supplier_transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_payments (
  payment_id  BIGINT        NOT NULL AUTO_INCREMENT,
  debt_id     BIGINT        NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  paid_at     DATETIME      NOT NULL,
  recorded_by BIGINT        NOT NULL,
  note        VARCHAR(255)  NULL,
  PRIMARY KEY (payment_id),
  KEY idx_spay_debt (debt_id),
  CONSTRAINT fk_spay_debt     FOREIGN KEY (debt_id)     REFERENCES supplier_debts (debt_id),
  CONSTRAINT fk_spay_recorder FOREIGN KEY (recorded_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 12. FIELD OPERATION
-- =============================================================================

CREATE TABLE survey_reports (
  survey_report_id BIGINT       NOT NULL AUTO_INCREMENT,
  order_id         BIGINT       NOT NULL,
  work_task_id     BIGINT       NULL,
  site_address     VARCHAR(255) NULL,
  site_condition   TEXT         NULL,
  feasibility_note TEXT         NULL,
  recorded_by      BIGINT       NOT NULL,
  confirmed_by     BIGINT       NULL,
  status           ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (survey_report_id),
  KEY idx_survey_order (order_id),
  CONSTRAINT fk_survey_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_survey_task      FOREIGN KEY (work_task_id) REFERENCES work_tasks (work_task_id),
  CONSTRAINT fk_survey_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_survey_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE change_requests (
  change_request_id BIGINT   NOT NULL AUTO_INCREMENT,
  order_id          BIGINT   NOT NULL,
  requested_by      BIGINT   NOT NULL,
  type              ENUM('add','remove','replace') NOT NULL,
  status            ENUM('pending','approved','rejected','executed_pending_review','reconciled') NOT NULL DEFAULT 'pending',
  executed_at       DATETIME NULL,
  approved_by       BIGINT   NULL,
  reconciled_by     BIGINT   NULL,
  reconciled_at     DATETIME NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (change_request_id),
  KEY idx_cr_order (order_id),
  CONSTRAINT fk_cr_order      FOREIGN KEY (order_id)      REFERENCES orders (order_id),
  CONSTRAINT fk_cr_requester  FOREIGN KEY (requested_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_cr_approver   FOREIGN KEY (approved_by)   REFERENCES internal_users (user_id),
  CONSTRAINT fk_cr_reconciler FOREIGN KEY (reconciled_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE change_request_items (
  id                BIGINT NOT NULL AUTO_INCREMENT,
  change_request_id BIGINT NOT NULL,
  catalog_item_id   BIGINT NOT NULL,
  quantity          INT    NOT NULL,
  action            ENUM('add','remove','replace') NOT NULL,
  PRIMARY KEY (id),
  KEY idx_cri_request (change_request_id),
  CONSTRAINT fk_cri_request FOREIGN KEY (change_request_id) REFERENCES change_requests (change_request_id) ON DELETE CASCADE,
  CONSTRAINT fk_cri_catalog FOREIGN KEY (catalog_item_id)   REFERENCES catalog_items (catalog_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE handover_records (
  handover_id  BIGINT   NOT NULL AUTO_INCREMENT,
  order_id     BIGINT   NOT NULL,
  recorded_by  BIGINT   NOT NULL,
  confirmed_by BIGINT   NULL,
  status       ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  note         TEXT     NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (handover_id),
  KEY idx_ho_order (order_id),
  CONSTRAINT fk_ho_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_ho_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_ho_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE damage_loss_reports (
  damage_loss_id     BIGINT        NOT NULL AUTO_INCREMENT,
  order_id           BIGINT        NOT NULL,
  recorded_by        BIGINT        NOT NULL,
  confirmed_by       BIGINT        NULL,
  total_compensation DECIMAL(12,2) NOT NULL DEFAULT 0,
  status             ENUM('submitted','confirmed') NOT NULL DEFAULT 'submitted',
  created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (damage_loss_id),
  KEY idx_dl_order (order_id),
  CONSTRAINT fk_dl_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_dl_recorder  FOREIGN KEY (recorded_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_dl_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE damage_loss_items (
  id                           BIGINT        NOT NULL AUTO_INCREMENT,
  damage_loss_id               BIGINT        NOT NULL,
  catalog_item_id              BIGINT        NOT NULL,
  quantity                     INT           NOT NULL,
  damage_type                  ENUM('damaged','lost') NOT NULL,
  source                       ENUM('internal','supplier') NOT NULL DEFAULT 'internal',
  supplier_transaction_item_id BIGINT        NULL,
  compensation_amount          DECIMAL(12,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_dli_report (damage_loss_id),
  CONSTRAINT fk_dli_report  FOREIGN KEY (damage_loss_id)               REFERENCES damage_loss_reports (damage_loss_id) ON DELETE CASCADE,
  CONSTRAINT fk_dli_catalog FOREIGN KEY (catalog_item_id)              REFERENCES catalog_items (catalog_item_id),
  CONSTRAINT fk_dli_stitem  FOREIGN KEY (supplier_transaction_item_id) REFERENCES supplier_transaction_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 2. SYSTEM (notifications / audit_logs / evidence)  -- đặt cuối vì chỉ phụ thuộc internal_users
-- =============================================================================

CREATE TABLE notifications (
  notification_id BIGINT       NOT NULL AUTO_INCREMENT,
  user_id         BIGINT       NOT NULL,
  type            VARCHAR(50)  NOT NULL,
  title           VARCHAR(200) NOT NULL,
  content         TEXT         NULL,
  ref_type        VARCHAR(50)  NULL,
  ref_id          BIGINT       NULL,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  log_id      BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   BIGINT       NULL,
  old_value   JSON         NULL,
  new_value   JSON         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Polymorphic: ref_type/ref_id trỏ tới nhiều bảng report/payment/settlement (không đặt FK)
CREATE TABLE evidence (
  evidence_id BIGINT       NOT NULL AUTO_INCREMENT,
  ref_type    VARCHAR(50)  NOT NULL,
  ref_id      BIGINT       NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_type   VARCHAR(50)  NULL,
  uploaded_by BIGINT       NOT NULL,
  uploaded_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evidence_id),
  KEY idx_evidence_ref (ref_type, ref_id),
  CONSTRAINT fk_evidence_uploader FOREIGN KEY (uploaded_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- SEED DATA ĐẦY ĐỦ — phủ toàn bộ 60 bảng
-- Kịch bản: 3 đơn hàng ở các giai đoạn khác nhau
--   ĐƠN 1 (order_id=1): HOÀN TẤT + đã ghi nhận doanh thu (chạm mọi bảng)
--   ĐƠN 2 (order_id=2): đang thi công (in_progress)
--   ĐƠN 3 (order_id=3): mới xác nhận (confirmed)
-- Tài khoản test (mật khẩu):
--   admin/Admin@123 · manager01/Manager@123 · leader01/Leader@123
--   leader02/Leader@123 · tech01/Tech@123 · tech02/Tech@123
-- Giá & số liệu là MẪU.
-- =============================================================================
SET NAMES utf8mb4;

-- 1. ROLES
INSERT INTO roles (role_id, role_name, description) VALUES
  (1,'Admin','Quản trị hệ thống'),
  (2,'Manager','Điều hành đơn hàng & quyết toán'),
  (3,'Leader Staff','Trưởng nhóm hiện trường'),
  (4,'Technical Staff','Nhân viên kỹ thuật');

-- 2. INTERNAL USERS (hash bcrypt thật)
INSERT INTO internal_users (user_id, role_id, username, password_hash, full_name, email, phone) VALUES
  (1,1,'admin',    '$2b$10$l.QBcxMNBEFLd9Hx9TtLd.UgHf6vbeeJTnn1IE5AROMsgjCuLr7.q','Quản trị viên','admin@company.vn','0900000001'),
  (2,2,'manager01','$2b$10$VEImidEYNZ9H9W2JGYgBk.tT9NCEa1CiCzIoE5Oyw/hkguaFOMmSG','Nguyễn Văn Quản','manager@company.vn','0900000002'),
  (3,3,'leader01', '$2b$10$Ye4P1qRrfUXSWQYnbWhVV.IzcmMZvWgiRvBb2bSys1gKbrxw/ivIa','Trần Văn Trưởng','leader1@company.vn','0900000003'),
  (4,3,'leader02', '$2b$10$5feKO5nKzYVCTIUA8bS6zOZpcd5.ZhvIo9Om1aZs7Xpy9CgfhlhRW','Lê Thị Nhóm','leader2@company.vn','0900000004'),
  (5,4,'tech01',   '$2b$10$ExRltfVE5JUQqWI4ECoqTuhm8Q1cWcBh.weAtor3sW4OTFWuN2Cw2','Phạm Văn Kỹ','tech1@company.vn','0900000005'),
  (6,4,'tech02',   '$2b$10$jPNycqf9mSsvBGrkmZozs.ftBKTTj5OLMf1ezWB6s76q9b.ZlgiPG','Hoàng Văn Thuật','tech2@company.vn','0900000006');

-- 3. WAREHOUSES
INSERT INTO warehouses (warehouse_id, name, address) VALUES
  (1,'Kho chính','Hà Nội'),
  (2,'Kho phụ','Hà Nội');

-- 4. COMPANY BANK ACCOUNTS (sinh VietQR)
INSERT INTO company_bank_accounts (bank_account_id, bank_code, account_number, account_name, is_default) VALUES
  (1,'MB','0900000000000','CONG TY SU KIEN ABC',TRUE);

-- 5. BUSINESS POLICIES
INSERT INTO business_policies (policy_id, policy_type, name, config, effective_from, created_by) VALUES
  (1,'deposit','Cọc 30%','{"deposit_percent":30}','2026-01-01',1),
  (2,'cancellation','Hủy theo mốc','{"before_7d":0,"within_7d":50,"within_2d":100}','2026-01-01',1),
  (3,'compensation','Đền bù theo giá thay thế','{"basis":"replacement_value","rate":100}','2026-01-01',1),
  (4,'additional_fee','Phụ phí phát sinh','{"overtime_per_hour":100000}','2026-01-01',1);

-- 6. WAGE RULES
INSERT INTO wage_rules (wage_rule_id, role_in_task, rate_per_session, effective_from) VALUES
  (1,'leader',500000,'2026-01-01'),
  (2,'technical',350000,'2026-01-01');

-- 7. CATALOG ITEMS (danh mục thật)
INSERT INTO catalog_items (catalog_item_id, code, name, category, unit, current_rental_price, replacement_value) VALUES
  (1,'TBL-001','Bàn loại to','Bàn','cái',50000,800000),
  (2,'TBL-002','Bàn loại nhỏ','Bàn','cái',40000,600000),
  (3,'CHR-001','Ghế đẩu','Ghế','cái',8000,120000),
  (4,'CHR-002','Ghế inox (y nốc)','Ghế','cái',10000,180000),
  (5,'CHR-003','Ghế Tiffany tiệc cưới','Ghế','cái',25000,450000),
  (6,'TXT-001','Khăn bàn màu đỏ','Khăn bàn','cái',15000,150000),
  (7,'TXT-002','Khăn bàn màu vàng','Khăn bàn','cái',15000,150000),
  (8,'TXT-003','Khăn bàn màu trắng','Khăn bàn','cái',15000,150000),
  (9,'TXT-004','Áo ghế','Phụ kiện vải','cái',8000,80000),
  (10,'TXT-005','Nơ ghế','Phụ kiện vải','cái',3000,30000),
  (11,'TXT-006','Runner (dải trải bàn)','Phụ kiện vải','cái',10000,90000),
  (12,'TENT-001','Thanh sắt 2,5m','Khung nhà rạp','thanh',15000,250000),
  (13,'TENT-002','Thanh sắt 3m','Khung nhà rạp','thanh',18000,300000),
  (14,'TENT-003','Thanh sắt 4m','Khung nhà rạp','thanh',22000,400000),
  (15,'TENT-004','Cột chống','Khung nhà rạp','cái',10000,200000),
  (16,'TENT-005','Mẩu sắt nối','Khung nhà rạp','cái',2000,30000),
  (17,'TENT-006','Bạt trắng','Khung nhà rạp','tấm',50000,1200000),
  (18,'TENT-007','Rèm quây xung quanh','Khung nhà rạp','tấm',40000,800000),
  (19,'TENT-008','Quây trần nhà','Khung nhà rạp','tấm',60000,1500000),
  (20,'TENT-009','Đèn nhấp nháy','Khung nhà rạp','bộ',30000,250000),
  (21,'TENT-010','Đèn chùm','Khung nhà rạp','cái',80000,1500000),
  (22,'TENT-011','Đèn chạy dọc 20m','Khung nhà rạp','dây',50000,600000),
  (23,'TENT-012','Quạt công nghiệp','Khung nhà rạp','cái',70000,1800000),
  (24,'TENT-013','Quạt hơi nước','Khung nhà rạp','cái',100000,3500000),
  (25,'TENT-014','Thảm cỏ','Khung nhà rạp','cuộn',40000,700000),
  (26,'TENT-015','Thảm đỏ','Khung nhà rạp','cuộn',45000,800000),
  (27,'GATE-001','Khung cổng hình tròn','Cổng hoa','cái',150000,2000000),
  (28,'GATE-002','Khung cổng hình vuông','Cổng hoa','cái',150000,2000000),
  (29,'GATE-003','Khung cổng hình lục giác','Cổng hoa','cái',160000,2200000),
  (30,'GATE-004','Cổng vòm bằng sắt','Cổng hoa','cái',200000,2500000),
  (31,'GATE-005','Cổng vòm bằng nhựa','Cổng hoa','cái',180000,2000000),
  (32,'FLR-001','Hoa giả cụm - trắng','Hoa giả','cụm',30000,200000),
  (33,'FLR-002','Hoa giả cụm - hồng','Hoa giả','cụm',30000,200000),
  (34,'FLR-003','Hoa giả cụm - đỏ','Hoa giả','cụm',30000,200000),
  (35,'FLR-004','Hoa giả cụm - pastel','Hoa giả','cụm',30000,200000),
  (36,'FLR-005','Hoa giả cụm - sen đá','Hoa giả','cụm',35000,220000),
  (37,'FLR-006','Hoa giả dải dài - đa màu','Hoa giả','dải',50000,350000),
  (38,'GAL-001','Khay bánh cupcake','Phụ kiện gallery','cái',40000,300000),
  (39,'GAL-002','Khung ảnh trang trí','Phụ kiện gallery','cái',25000,200000),
  (40,'GAL-003','Hòm tiền mừng - hình ngôi nhà','Phụ kiện gallery','cái',50000,400000),
  (41,'GAL-004','Hòm tiền mừng - hình hòm thư','Phụ kiện gallery','cái',50000,400000),
  (42,'GAL-005','Hòm tiền mừng - mica trong suốt','Phụ kiện gallery','cái',60000,500000),
  (43,'GAL-006','Bình hoa thủy tinh - nhỏ','Phụ kiện gallery','cái',20000,150000),
  (44,'GAL-007','Bình hoa thủy tinh - vừa','Phụ kiện gallery','cái',30000,250000),
  (45,'GAL-008','Bình hoa thủy tinh - lớn','Phụ kiện gallery','cái',40000,400000),
  (46,'BDR-001','Chữ trên phông','Phông cưới hỏi','bộ',200000,1500000),
  (47,'BDR-002','Đèn sân khấu','Phông cưới hỏi','cái',100000,2000000),
  (48,'BDR-003','Trap (khung sân khấu) cưới hỏi','Phông cưới hỏi','bộ',300000,5000000),
  (49,'BDR-004','Phông quây','Phông cưới hỏi','tấm',150000,1500000),
  (50,'AUD-001','Hệ thống loa đài','Âm thanh','bộ',500000,15000000);

-- 8. INVENTORY (Kho chính)
INSERT INTO inventory (catalog_item_id, warehouse_id, total_quantity, available_quantity) VALUES
  (1,1,100,100),(2,1,100,100),(3,1,500,500),(4,1,300,300),(5,1,200,200),
  (6,1,200,200),(7,1,200,200),(8,1,200,200),(9,1,500,500),(10,1,500,500),
  (11,1,150,150),(12,1,300,300),(13,1,300,300),(14,1,200,200),(15,1,200,200),
  (16,1,1000,1000),(17,1,50,50),(18,1,80,80),(19,1,40,40),(20,1,100,100),
  (21,1,30,30),(22,1,40,40),(23,1,30,30),(24,1,15,13),(25,1,50,50),
  (26,1,40,40),(27,1,10,10),(28,1,10,10),(29,1,8,8),(30,1,6,6),
  (31,1,6,6),(32,1,100,100),(33,1,100,100),(34,1,100,100),(35,1,100,100),
  (36,1,80,80),(37,1,60,60),(38,1,30,30),(39,1,50,50),(40,1,15,15),
  (41,1,15,15),(42,1,20,20),(43,1,60,60),(44,1,50,50),(45,1,40,40),
  (46,1,20,20),(47,1,40,40),(48,1,10,10),(49,1,20,20),(50,1,10,10);

-- 9. SUPPLIERS
INSERT INTO suppliers (supplier_id, name, contact_person, phone, address) VALUES
  (1,'Cho thuê thiết bị Minh Anh','Anh Minh','0911111111','Hà Nội'),
  (2,'Hoa tươi Phương Nam','Chị Nam','0922222222','Hà Nội');

-- 10. CUSTOMERS
INSERT INTO customers (customer_id, full_name, phone, email, address) VALUES
  (1,'Trần Thị Hoa','0933333331','hoa@gmail.com','Cầu Giấy, Hà Nội'),
  (2,'Công ty TNHH Sự Kiện XYZ','0933333332','xyz@company.vn','Đống Đa, Hà Nội'),
  (3,'Nguyễn Văn Phúc','0933333333','phuc@gmail.com','Hà Đông, Hà Nội');

-- 11. ORDERS
INSERT INTO orders (order_id, customer_id, event_date, event_location, total_value, status, revenue_status, created_by) VALUES
  (1,1,'2026-05-10','Trung tâm tiệc cưới Sao Mai',50000000,'completed','recognized',2),
  (2,2,'2026-06-20','Hội trường công ty XYZ',30000000,'in_progress','pending',2),
  (3,3,'2026-07-15','Nhà văn hóa Hà Đông',18000000,'confirmed','pending',2);

-- 12. QUOTATIONS (1:1 với order)
INSERT INTO quotations (quotation_id, customer_id, order_id, total_amount, status, created_by) VALUES
  (1,1,1,50000000,'confirmed',2),
  (2,2,2,30000000,'confirmed',2),
  (3,3,3,18000000,'confirmed',2);

-- 13. QUOTATION ITEMS
INSERT INTO quotation_items (id, quotation_id, catalog_item_id, quantity, unit_price, line_total) VALUES
  (1,1,1,20,50000,1000000),(2,1,5,200,25000,5000000),(3,1,8,20,15000,300000),
  (4,1,27,1,150000,150000),(5,1,50,1,500000,500000),(6,1,46,1,200000,200000),
  (7,2,2,15,40000,600000),(8,2,4,150,10000,1500000),(9,2,50,1,500000,500000),
  (10,3,2,10,40000,400000),(11,3,3,80,8000,640000),(12,3,27,1,150000,150000);

-- 14. ORDER ITEMS
INSERT INTO order_items (id, order_id, catalog_item_id, quantity, unit_price, source) VALUES
  (1,1,1,20,50000,'internal'),(2,1,5,200,25000,'internal'),(3,1,8,20,15000,'internal'),
  (4,1,27,1,150000,'internal'),(5,1,50,1,500000,'internal'),(6,1,46,1,200000,'supplier'),
  (7,2,2,15,40000,'internal'),(8,2,4,150,10000,'internal'),(9,2,50,1,500000,'internal'),
  (10,3,2,10,40000,'internal'),(11,3,3,80,8000,'internal'),(12,3,27,1,150000,'internal');

-- 15. ORDER STATUS HISTORY
INSERT INTO order_status_history (id, order_id, from_status, to_status, changed_by, note, changed_at) VALUES
  (1,1,'draft','confirmed',2,'Nhận đủ cọc','2026-04-20 10:00:00'),
  (2,1,'confirmed','in_progress',2,'Bắt đầu thi công','2026-05-09 08:00:00'),
  (3,1,'in_progress','completed',2,'Đóng đơn vận hành','2026-05-11 18:00:00'),
  (4,2,'draft','confirmed',2,'Nhận đủ cọc','2026-06-01 09:00:00'),
  (5,2,'confirmed','in_progress',2,'Bắt đầu thi công','2026-06-19 08:00:00'),
  (6,3,'draft','confirmed',2,'Nhận đủ cọc','2026-07-01 09:00:00');

-- 16. PAYMENT REQUESTS (kèm VietQR transfer_code)
INSERT INTO payment_requests (payment_request_id, order_id, payment_type, amount, method_hint, bank_account_id, transfer_code, qr_url, status, created_by) VALUES
  (1,1,'deposit',15000000,'bank_transfer',1,'DH1COC','https://img.vietqr.io/image/MB-0900000000000-compact.png?amount=15000000&addInfo=DH1COC','paid',2),
  (2,1,'final',38500000,'bank_transfer',1,'DH1CK','https://img.vietqr.io/image/MB-0900000000000-compact.png?amount=38500000&addInfo=DH1CK','paid',2),
  (3,2,'deposit',9000000,'bank_transfer',1,'DH2COC','https://img.vietqr.io/image/MB-0900000000000-compact.png?amount=9000000&addInfo=DH2COC','paid',2),
  (4,3,'deposit',5400000,'bank_transfer',1,'DH3COC','https://img.vietqr.io/image/MB-0900000000000-compact.png?amount=5400000&addInfo=DH3COC','pending',2);

-- 17. PAYMENTS (chỉ tạo dòng khi đã xác nhận; order3 cọc chưa trả nên chưa có)
INSERT INTO payments (payment_id, payment_request_id, order_id, amount, method, status, paid_at, confirmed_by, confirmed_at) VALUES
  (1,1,1,15000000,'bank_transfer','success','2026-04-20 09:30:00',2,'2026-04-20 09:45:00'),
  (2,2,1,38500000,'bank_transfer','success','2026-05-10 20:00:00',2,'2026-05-10 20:15:00'),
  (3,3,2,9000000,'bank_transfer','success','2026-06-01 08:30:00',2,'2026-06-01 08:45:00');

-- 18. SETTLEMENTS (đơn 1 đã quyết toán)
INSERT INTO settlements (settlement_id, order_id, original_value, change_adjustment, additional_fee, compensation, total_paid, remaining_amount, payment_method, recorded_by, status, confirmed_by) VALUES
  (1,1,50000000,2000000,500000,1000000,53500000,0,'bank_transfer',3,'confirmed',2);

-- 19. SETTLEMENT LINES
INSERT INTO settlement_lines (id, settlement_id, line_type, ref_type, ref_id, description, amount) VALUES
  (1,1,'original',NULL,NULL,'Giá trị đơn gốc',50000000),
  (2,1,'change','change_request',1,'Thêm 1 cổng vòm sắt',2000000),
  (3,1,'additional_fee',NULL,NULL,'Phụ phí tăng ca 5h',500000),
  (4,1,'compensation','damage_loss_report',1,'Bồi thường hỏng/mất',1000000),
  (5,1,'deposit','payment',1,'Trừ tiền cọc đã thu',-15000000),
  (6,1,'payment','payment',2,'Thanh toán cuối',-38500000);

-- 20. SCHEDULE PLANS (1:1 với order)
INSERT INTO schedule_plans (schedule_plan_id, order_id, status, created_by) VALUES
  (1,1,'done',2),(2,2,'active',2),(3,3,'draft',2);

-- 21. SCHEDULE ACTIVITIES
INSERT INTO schedule_activities (activity_id, schedule_plan_id, activity_type, planned_start, planned_end, location, sort_order) VALUES
  (1,1,'preparation','2026-05-09 08:00:00','2026-05-09 12:00:00','Kho chính',1),
  (2,1,'transport','2026-05-09 13:00:00','2026-05-09 15:00:00','Đường vận chuyển',2),
  (3,1,'execution','2026-05-09 15:00:00','2026-05-10 10:00:00','TT tiệc cưới Sao Mai',3),
  (4,1,'collection','2026-05-11 08:00:00','2026-05-11 12:00:00','TT tiệc cưới Sao Mai',4),
  (5,1,'return','2026-05-11 13:00:00','2026-05-11 16:00:00','Kho chính',5),
  (6,2,'preparation','2026-06-19 08:00:00','2026-06-19 12:00:00','Kho chính',1),
  (7,2,'transport','2026-06-19 13:00:00','2026-06-19 15:00:00','Đường vận chuyển',2),
  (8,2,'execution','2026-06-19 15:00:00','2026-06-20 18:00:00','Hội trường XYZ',3),
  (9,3,'preparation','2026-07-14 08:00:00','2026-07-14 12:00:00','Kho chính',1);

-- 22. WORK TASKS
INSERT INTO work_tasks (work_task_id, order_id, task_category, schedule_activity_id, title, status, created_by) VALUES
  (1,1,'survey',NULL,'Khảo sát địa điểm đơn 1','done',2),
  (2,2,'survey',NULL,'Khảo sát địa điểm đơn 2','done',2),
  (3,3,'survey',NULL,'Khảo sát địa điểm đơn 3','assigned',2),
  (4,1,'operation',1,'Chuẩn bị & xuất kho đơn 1','done',2),
  (5,1,'operation',3,'Thi công lắp đặt đơn 1','done',2),
  (6,1,'operation',4,'Thu hồi đơn 1','done',2),
  (7,2,'operation',6,'Chuẩn bị & xuất kho đơn 2','in_progress',2);

-- 23. ASSIGNMENTS
INSERT INTO assignments (assignment_id, work_task_id, user_id, role_in_task, assigned_at) VALUES
  (1,1,3,'leader','2026-04-15 08:00:00'),(2,1,5,'technical','2026-04-15 08:00:00'),
  (3,4,3,'leader','2026-05-08 08:00:00'),(4,4,5,'technical','2026-05-08 08:00:00'),
  (5,5,3,'leader','2026-05-09 08:00:00'),(6,5,6,'technical','2026-05-09 08:00:00'),
  (7,6,3,'leader','2026-05-11 08:00:00'),
  (8,2,4,'leader','2026-05-25 08:00:00'),(9,7,4,'leader','2026-06-19 08:00:00');

-- 24. TASK PROGRESS UPDATES
INSERT INTO task_progress_updates (id, work_task_id, updated_by, progress_status, note, created_at) VALUES
  (1,5,3,'transport','Đã vận chuyển tới địa điểm','2026-05-09 15:00:00'),
  (2,5,3,'installation','Lắp xong khung rạp & sân khấu','2026-05-09 20:00:00'),
  (3,5,3,'done','Hoàn tất bàn giao','2026-05-10 10:00:00'),
  (4,7,4,'transport','Đang vận chuyển','2026-06-19 14:00:00');

-- 25. ATTENDANCE
INSERT INTO attendance (attendance_id, assignment_id, check_in, check_out, completion_status, confirmed_by, confirmed_at) VALUES
  (1,3,'2026-05-08 08:00:00','2026-05-08 12:00:00','completed',3,'2026-05-08 12:10:00'),
  (2,4,'2026-05-08 08:00:00','2026-05-08 12:00:00','completed',3,'2026-05-08 12:10:00'),
  (3,5,'2026-05-09 08:00:00','2026-05-10 11:00:00','completed',3,'2026-05-10 11:10:00'),
  (4,6,'2026-05-09 08:00:00','2026-05-10 11:00:00','completed',3,'2026-05-10 11:10:00'),
  (5,7,'2026-05-11 08:00:00','2026-05-11 12:00:00','completed',3,'2026-05-11 12:10:00');

-- 26. STAFF AVAILABILITY
INSERT INTO staff_availability (id, user_id, work_date, status, note) VALUES
  (1,3,'2026-05-09','available',NULL),(2,5,'2026-05-09','available',NULL),
  (3,6,'2026-05-09','available',NULL),(4,4,'2026-05-09','unavailable','Nghỉ phép'),
  (5,4,'2026-06-19','available',NULL);

-- 27. WAGE SUMMARIES (đơn 1, đã chi)
INSERT INTO wage_summaries (wage_summary_id, user_id, order_id, period, total_sessions, gross_amount, total_deduction, total_wage, status, confirmed_by) VALUES
  (1,3,1,'2026-05',2,1000000,0,1000000,'settled',2),
  (2,5,1,'2026-05',2,700000,50000,650000,'settled',2),
  (3,6,1,'2026-05',1,350000,0,350000,'settled',2);

-- 28. WAGE SUMMARY LINES
INSERT INTO wage_summary_lines (id, wage_summary_id, assignment_id, attendance_id, wage_rule_id, session_date, wage_rate, line_amount) VALUES
  (1,1,3,1,1,'2026-05-08',500000,500000),
  (2,1,5,3,1,'2026-05-09',500000,500000),
  (3,2,4,2,2,'2026-05-08',350000,350000),
  (4,2,4,2,2,'2026-05-09',350000,350000),
  (5,3,6,4,2,'2026-05-09',350000,350000);

-- 29. WAGE DEDUCTIONS
INSERT INTO wage_deductions (id, wage_summary_id, reason, amount, created_by) VALUES
  (1,2,'Đi muộn 30 phút',50000,2);

-- 30. WAGE PAYMENTS (lương đã chi ngoài hệ thống, ghi nhận lại)
INSERT INTO wage_payments (id, wage_summary_id, amount, paid_at, paid_by, note) VALUES
  (1,1,1000000,'2026-05-31 17:00:00',1,'Chi lương T5'),
  (2,2,650000,'2026-05-31 17:00:00',1,'Chi lương T5'),
  (3,3,350000,'2026-05-31 17:00:00',1,'Chi lương T5');

-- 31. INVENTORY RESERVATIONS
INSERT INTO inventory_reservations (reservation_id, order_id, event_date, status, created_by) VALUES
  (1,1,'2026-05-10','fulfilled',2),
  (2,2,'2026-06-20','reserved',2),
  (3,3,'2026-07-15','reserved',2);

-- 32. INVENTORY RESERVATION ITEMS
INSERT INTO inventory_reservation_items (id, reservation_id, catalog_item_id, reserved_quantity) VALUES
  (1,1,1,20),(2,1,5,200),(3,1,8,20),(4,1,27,1),(5,1,50,1),
  (6,2,2,15),(7,2,4,150),(8,2,50,1),
  (9,3,2,10),(10,3,3,80),(11,3,27,1);

-- 33. INVENTORY REPORTS
INSERT INTO inventory_reports (inventory_report_id, order_id, report_type, recorded_by, confirmed_by, status, note) VALUES
  (1,1,'checkout',3,2,'confirmed','Xuất kho đơn 1'),
  (2,1,'collection',3,2,'confirmed','Thu hồi tại hiện trường'),
  (3,1,'return',3,2,'confirmed','Trả về kho - có hụt'),
  (4,2,'checkout',4,NULL,'submitted','Xuất kho đơn 2');

-- 34. INVENTORY REPORT ITEMS (report return có expected vs quantity → phần hụt)
INSERT INTO inventory_report_items (id, inventory_report_id, catalog_item_id, expected_quantity, quantity, condition_status) VALUES
  (1,1,1,NULL,20,'good'),(2,1,5,NULL,200,'good'),(3,1,8,NULL,20,'good'),
  (4,2,1,NULL,20,'good'),(5,2,5,NULL,198,'good'),
  (6,3,1,20,20,'good'),(7,3,5,200,198,'good'),(8,3,8,20,20,'good');

-- 35. WAREHOUSE HISTORIES (chỉ sinh khi report confirmed)
INSERT INTO warehouse_histories (history_id, warehouse_id, order_id, inventory_report_id, movement_type, created_by) VALUES
  (1,1,1,1,'out',3),
  (2,1,1,3,'return',3);

-- 36. WAREHOUSE HISTORY ITEMS
INSERT INTO warehouse_history_items (id, history_id, catalog_item_id, quantity) VALUES
  (1,1,1,20),(2,1,5,200),(3,1,8,20),
  (4,2,1,20),(5,2,5,198),(6,2,8,20);

-- 37. PICK LISTS
INSERT INTO pick_lists (pick_list_id, order_id, purpose, status, created_by) VALUES
  (1,1,'preparation','done',2),(2,1,'checkout','done',3),(3,1,'return','done',3),
  (4,2,'preparation','active',2);

-- 38. PICK LIST ITEMS
INSERT INTO pick_list_items (id, pick_list_id, catalog_item_id, planned_quantity, actual_quantity) VALUES
  (1,1,1,20,20),(2,1,5,200,200),(3,1,8,20,20),
  (4,2,1,20,20),(5,2,5,200,200),
  (6,4,2,15,NULL),(7,4,4,150,NULL);

-- 39. EQUIPMENT MAINTENANCE
INSERT INTO equipment_maintenance (maintenance_id, catalog_item_id, warehouse_id, quantity, start_date, end_date, status, note) VALUES
  (1,24,1,2,'2026-06-01',NULL,'in_maintenance','2 quạt hơi nước hỏng bơm'),
  (2,21,1,1,'2026-05-01','2026-05-15','done','Đã sửa xong đèn chùm');

-- 40. SUPPLIER TRANSACTIONS
INSERT INTO supplier_transactions (supplier_transaction_id, supplier_id, order_id, type, total_cost, expected_delivery, status, created_by) VALUES
  (1,1,1,'rental',5000000,'2026-05-09','returned',2),
  (2,2,2,'purchase',3000000,'2026-06-18','received',2);

-- 41. SUPPLIER TRANSACTION ITEMS
INSERT INTO supplier_transaction_items (id, supplier_transaction_id, catalog_item_id, description, quantity, unit_cost) VALUES
  (1,1,46,'Thuê chữ phông cao cấp',1,3000000),
  (2,1,NULL,'Thuê backdrop đặc biệt',1,2000000),
  (3,2,NULL,'Mua hoa tươi trang trí',1,3000000);

-- 42. SUPPLIER RECEIPT REPORTS
INSERT INTO supplier_receipt_reports (receipt_report_id, supplier_transaction_id, recorded_by, confirmed_by, status, note) VALUES
  (1,1,3,2,'confirmed','Đã nhận đủ thiết bị thuê'),
  (2,2,4,2,'confirmed','Đã nhận hoa tươi');

-- 43. SUPPLIER RECEIPT REPORT ITEMS
INSERT INTO supplier_receipt_report_items (id, receipt_report_id, supplier_transaction_item_id, catalog_item_id, description, received_quantity, condition_status) VALUES
  (1,1,1,46,'Chữ phông',1,'good'),
  (2,1,2,NULL,'Backdrop',1,'good'),
  (3,2,3,NULL,'Hoa tươi',1,'good');

-- 44. SUPPLIER RETURN REPORTS (đơn thuê st1)
INSERT INTO supplier_return_reports (return_report_id, supplier_transaction_id, recorded_by, confirmed_by, total_compensation, status) VALUES
  (1,1,3,2,0,'confirmed');

-- 45. SUPPLIER RETURN REPORT ITEMS
INSERT INTO supplier_return_report_items (id, return_report_id, catalog_item_id, description, returned_quantity, condition_status, compensation_amount) VALUES
  (1,1,46,'Chữ phông',1,'good',0),
  (2,1,NULL,'Backdrop',1,'good',0);

-- 46. SUPPLIER DEBTS
INSERT INTO supplier_debts (debt_id, supplier_id, supplier_transaction_id, amount, paid_amount, status) VALUES
  (1,1,1,5000000,5000000,'paid'),
  (2,2,2,3000000,0,'open');

-- 47. SUPPLIER PAYMENTS (trả NCC ngoài hệ thống, ghi nhận lại)
INSERT INTO supplier_payments (payment_id, debt_id, amount, paid_at, recorded_by, note) VALUES
  (1,1,5000000,'2026-05-20 10:00:00',2,'Thanh toán NCC Minh Anh');

-- 48. SURVEY REPORTS
INSERT INTO survey_reports (survey_report_id, order_id, work_task_id, site_address, site_condition, feasibility_note, recorded_by, confirmed_by, status) VALUES
  (1,1,1,'TT tiệc cưới Sao Mai','Mặt bằng rộng 200m2, có điện 3 pha','Khả thi, cần 2 quạt CN',3,2,'confirmed'),
  (2,2,2,'Hội trường XYZ','Trong nhà, điều hòa sẵn','Khả thi',4,2,'confirmed'),
  (3,3,3,'Nhà văn hóa Hà Đông','Sân ngoài trời 150m2','Cần kiểm tra thời tiết',3,NULL,'submitted');

-- 49. CHANGE REQUESTS
INSERT INTO change_requests (change_request_id, order_id, requested_by, type, status, executed_at, approved_by, reconciled_by, reconciled_at) VALUES
  (1,1,3,'add','reconciled','2026-05-09 18:00:00',2,2,'2026-05-11 09:00:00'),
  (2,2,4,'replace','pending',NULL,NULL,NULL,NULL);

-- 50. CHANGE REQUEST ITEMS
INSERT INTO change_request_items (id, change_request_id, catalog_item_id, quantity, action) VALUES
  (1,1,30,1,'add'),
  (2,2,4,20,'replace');

-- 51. HANDOVER RECORDS
INSERT INTO handover_records (handover_id, order_id, recorded_by, confirmed_by, status, note) VALUES
  (1,1,3,2,'confirmed','Bàn giao hoàn tất, khách ký nhận'),
  (2,2,4,NULL,'submitted','Đang chờ Manager xác nhận');

-- 52. DAMAGE LOSS REPORTS
INSERT INTO damage_loss_reports (damage_loss_id, order_id, recorded_by, confirmed_by, total_compensation, status) VALUES
  (1,1,3,2,1000000,'confirmed');

-- 53. DAMAGE LOSS ITEMS (nội bộ + của NCC)
INSERT INTO damage_loss_items (id, damage_loss_id, catalog_item_id, quantity, damage_type, source, supplier_transaction_item_id, compensation_amount) VALUES
  (1,1,5,2,'lost','internal',NULL,900000),
  (2,1,46,1,'damaged','supplier',1,100000);

-- 54. ORDER OUTSTANDING CASES (đơn 1 - đã tất toán trước khi ghi nhận DT)
INSERT INTO order_outstanding_cases (case_id, order_id, case_type, reference_id, direction, amount, status, resolved_by, resolved_at) VALUES
  (1,1,'supplier_debt',1,'out',5000000,'resolved',2,'2026-05-20 10:00:00'),
  (2,1,'wage_pending',1,'out',2000000,'resolved',1,'2026-05-31 17:00:00');

-- 55. REVENUE RECORDS (đơn 1 đã ghi nhận - snapshot tài chính)
INSERT INTO revenue_records (revenue_record_id, order_id, recognized_period, gross_revenue, revenue_deduction, net_revenue, supplier_cost, wage_cost, gross_profit, recognized_at, recognized_by) VALUES
  (1,1,'2026-05',53500000,0,53500000,5000000,2000000,46500000,'2026-05-31 18:00:00',1);

-- 56. NOTIFICATIONS
INSERT INTO notifications (notification_id, user_id, type, title, content, ref_type, ref_id, is_read) VALUES
  (1,3,'task','Bạn được giao việc khảo sát','Khảo sát địa điểm đơn 1','work_task',1,TRUE),
  (2,2,'operational','Cần xác nhận bàn giao','Đơn 2 có handover chờ duyệt','handover_record',2,FALSE),
  (3,2,'operational','Cần phê duyệt change request','Đơn 2 yêu cầu đổi thiết bị','change_request',2,FALSE),
  (4,4,'task','Bạn được giao việc','Chuẩn bị & xuất kho đơn 2','work_task',7,FALSE);

-- 57. AUDIT LOGS
INSERT INTO audit_logs (log_id, user_id, action, entity_type, entity_id, new_value) VALUES
  (1,2,'login','internal_users',2,NULL),
  (2,2,'create','orders',1,'{"status":"draft"}'),
  (3,2,'confirm','payments',1,'{"status":"success"}'),
  (4,1,'recognize_revenue','revenue_records',1,'{"period":"2026-05"}');

-- 58. EVIDENCE (đa hình)
INSERT INTO evidence (evidence_id, ref_type, ref_id, file_url, file_type, uploaded_by) VALUES
  (1,'survey_report',1,'https://files.company.vn/survey1_a.jpg','image',3),
  (2,'payment',1,'https://files.company.vn/coc_dh1.jpg','image',2),
  (3,'payment',2,'https://files.company.vn/ck_dh1.jpg','image',3),
  (4,'handover_record',1,'https://files.company.vn/handover_dh1.jpg','image',3),
  (5,'damage_loss_report',1,'https://files.company.vn/damage_dh1.jpg','image',3),
  (6,'settlement',1,'https://files.company.vn/settlement_dh1.pdf','pdf',3),
  (7,'inventory_report',1,'https://files.company.vn/checkout_dh1.jpg','image',3),
  (8,'supplier_receipt_report',1,'https://files.company.vn/receipt_st1.jpg','image',3);

-- =============================================================================
-- 59. ITEM PRICE HISTORY (Dữ liệu bổ sung)
-- =============================================================================
INSERT INTO item_price_history (id, catalog_item_id, price, effective_from, effective_to, created_by) VALUES
  (1, 1, 45000, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1),
  (2, 1, 50000, '2026-01-01 00:00:00', NULL, 1),
  (3, 5, 22000, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1),
  (4, 5, 25000, '2026-01-01 00:00:00', NULL, 1);

-- =============================================================================
-- 60. ITEM COST HISTORY (Dữ liệu bổ sung)
-- =============================================================================
INSERT INTO item_cost_history (id, catalog_item_id, cost, effective_from, effective_to, created_by) VALUES
  (1, 1, 20000, '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1),
  (2, 1, 25000, '2026-01-01 00:00:00', NULL, 1),
  (3, 5, 8000,  '2025-01-01 00:00:00', '2025-12-31 23:59:59', 1),
  (4, 5, 10000, '2026-01-01 00:00:00', NULL, 1);