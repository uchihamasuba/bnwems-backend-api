-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` BIGINT NOT NULL,
    `permission_id` BIGINT NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_devices` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `device_token` VARCHAR(255) NOT NULL,
    `deviceType` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_devices_device_token_key`(`device_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_policies` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `policy_value` DECIMAL(15, 2) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `description` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `updated_by` BIGINT NOT NULL,

    UNIQUE INDEX `business_policies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `catalog_categories_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalog_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `unit` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `catalog_items_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_price_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `catalog_item_id` BIGINT NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `valid_from` DATETIME(3) NOT NULL,
    `valid_to` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `address` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `warehouses_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `warehouse_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity_total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `quantity_available` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `quantity_reserved` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `quantity_damaged` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `location` VARCHAR(200) NULL,
    `last_updated` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_warehouse_id_catalog_item_id_key`(`warehouse_id`, `catalog_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `warehouse_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `before_qty` DECIMAL(10, 2) NOT NULL,
    `after_qty` DECIMAL(10, 2) NOT NULL,
    `reference_type` VARCHAR(100) NULL,
    `reference_id` BIGINT NULL,
    `notes` TEXT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_payables` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(191) NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `paid_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `transaction_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `reference_code` VARCHAR(100) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_payable_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_payable_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_id` BIGINT NOT NULL,
    `supplier_payable_id` BIGINT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `reference_code` VARCHAR(200) NULL,
    `notes` TEXT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `customer_id` BIGINT NOT NULL,
    `event_type` VARCHAR(100) NOT NULL,
    `event_date` DATE NOT NULL,
    `event_end_date` DATE NULL,
    `venue_name` VARCHAR(255) NULL,
    `venue_address` TEXT NULL,
    `guest_count` INTEGER NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_reservations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity_reserved` DECIMAL(10, 2) NOT NULL,
    `event_date` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'reserved',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `final_amount` DECIMAL(15, 2) NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `sent_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quotations_order_id_version_key`(`order_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_lines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quotation_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `item_name` VARCHAR(200) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `change_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `requested_by` BIGINT NOT NULL,
    `change_type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `requested_at` DATETIME(3) NOT NULL,
    `reviewed_by` BIGINT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `review_notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `payment_type` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `transaction_ref` VARCHAR(200) NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `confirmed_by` BIGINT NULL,
    `confirmed_at` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `total_service_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_extra_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_discount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_damage_recovery` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_paid` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `notes` TEXT NULL,
    `created_by` BIGINT NOT NULL,
    `approved_by` BIGINT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settlements_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settlement_lines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `settlement_id` BIGINT NOT NULL,
    `line_type` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `surveyed_by` BIGINT NOT NULL,
    `survey_date` DATE NOT NULL,
    `venue_notes` TEXT NULL,
    `requirement_notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `submitted_at` DATETIME(3) NULL,
    `approved_by` BIGINT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `survey_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `survey_report_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NULL,
    `item_name` VARCHAR(200) NOT NULL,
    `quantity_required` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `assigned_date` DATE NOT NULL,
    `session_type` VARCHAR(191) NOT NULL,
    `role_in_event` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'assigned',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assignment_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `status` VARCHAR(191) NOT NULL DEFAULT 'todo',
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pick_lists` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `assignment_id` BIGINT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pick_list_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `pick_list_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity_required` DECIMAL(10, 2) NOT NULL,
    `quantity_picked` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `handovers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `handover_type` VARCHAR(191) NOT NULL,
    `from_user_id` BIGINT NULL,
    `to_user_id` BIGINT NULL,
    `handover_date` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `handover_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `handover_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity_expected` DECIMAL(10, 2) NOT NULL,
    `quantity_actual` DECIMAL(10, 2) NULL,
    `condition_notes` TEXT NULL,
    `item_status` VARCHAR(191) NOT NULL DEFAULT 'ok',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `damage_loss_reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `reported_by` BIGINT NOT NULL,
    `report_date` DATE NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `reviewed_by` BIGINT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `damage_loss_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `damage_loss_report_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `damage_type` VARCHAR(191) NOT NULL,
    `estimated_cost` DECIMAL(15, 2) NOT NULL,
    `responsible_user_id` BIGINT NULL,
    `notes` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wage_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `session_type` VARCHAR(191) NOT NULL,
    `wage_amount` DECIMAL(15, 2) NOT NULL,
    `valid_from` DATE NOT NULL,
    `valid_to` DATE NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `assignment_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `work_date` DATE NOT NULL,
    `session_type` VARCHAR(191) NOT NULL,
    `check_in_time` DATETIME(3) NULL,
    `check_out_time` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'present',
    `verified_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendance_assignment_id_work_date_session_type_key`(`assignment_id`, `work_date`, `session_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wage_summaries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `period_month` TINYINT NOT NULL,
    `period_year` SMALLINT NOT NULL,
    `total_sessions` INTEGER NOT NULL DEFAULT 0,
    `total_base_wage` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_deductions` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `net_wage` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `created_by` BIGINT NOT NULL,
    `approved_by` BIGINT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wage_summaries_user_id_period_month_period_year_key`(`user_id`, `period_month`, `period_year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wage_deductions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wage_summary_id` BIGINT NOT NULL,
    `damage_loss_item_id` BIGINT NULL,
    `reason` TEXT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wage_payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wage_summary_id` BIGINT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_date` DATE NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL DEFAULT 'bank_transfer',
    `transaction_ref` VARCHAR(200) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `file_name` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(100) NOT NULL,
    `file_size` BIGINT NULL,
    `uploaded_by` BIGINT NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence_attachments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `evidence_file_id` BIGINT NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `action` VARCHAR(50) NOT NULL,
    `entity_type` VARCHAR(100) NOT NULL,
    `entity_id` BIGINT NOT NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `related_entity_type` VARCHAR(100) NULL,
    `related_entity_id` BIGINT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_devices` ADD CONSTRAINT `user_devices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalog_items` ADD CONSTRAINT `catalog_items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_price_history` ADD CONSTRAINT `item_price_history_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payables` ADD CONSTRAINT `supplier_payables_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payable_items` ADD CONSTRAINT `supplier_payable_items_supplier_payable_id_fkey` FOREIGN KEY (`supplier_payable_id`) REFERENCES `supplier_payables`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payable_items` ADD CONSTRAINT `supplier_payable_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payments` ADD CONSTRAINT `supplier_payments_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_payments` ADD CONSTRAINT `supplier_payments_supplier_payable_id_fkey` FOREIGN KEY (`supplier_payable_id`) REFERENCES `supplier_payables`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_reservations` ADD CONSTRAINT `inventory_reservations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_reservations` ADD CONSTRAINT `inventory_reservations_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_lines` ADD CONSTRAINT `quotation_lines_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_lines` ADD CONSTRAINT `quotation_lines_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `change_requests` ADD CONSTRAINT `change_requests_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlements` ADD CONSTRAINT `settlements_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settlement_lines` ADD CONSTRAINT `settlement_lines_settlement_id_fkey` FOREIGN KEY (`settlement_id`) REFERENCES `settlements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_reports` ADD CONSTRAINT `survey_reports_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_items` ADD CONSTRAINT `survey_items_survey_report_id_fkey` FOREIGN KEY (`survey_report_id`) REFERENCES `survey_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `survey_items` ADD CONSTRAINT `survey_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pick_lists` ADD CONSTRAINT `pick_lists_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pick_list_items` ADD CONSTRAINT `pick_list_items_pick_list_id_fkey` FOREIGN KEY (`pick_list_id`) REFERENCES `pick_lists`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pick_list_items` ADD CONSTRAINT `pick_list_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `handovers` ADD CONSTRAINT `handovers_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `handover_items` ADD CONSTRAINT `handover_items_handover_id_fkey` FOREIGN KEY (`handover_id`) REFERENCES `handovers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `handover_items` ADD CONSTRAINT `handover_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_loss_reports` ADD CONSTRAINT `damage_loss_reports_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_loss_items` ADD CONSTRAINT `damage_loss_items_damage_loss_report_id_fkey` FOREIGN KEY (`damage_loss_report_id`) REFERENCES `damage_loss_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_loss_items` ADD CONSTRAINT `damage_loss_items_catalog_item_id_fkey` FOREIGN KEY (`catalog_item_id`) REFERENCES `catalog_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `damage_loss_items` ADD CONSTRAINT `damage_loss_items_responsible_user_id_fkey` FOREIGN KEY (`responsible_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wage_rules` ADD CONSTRAINT `wage_rules_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wage_summaries` ADD CONSTRAINT `wage_summaries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wage_deductions` ADD CONSTRAINT `wage_deductions_wage_summary_id_fkey` FOREIGN KEY (`wage_summary_id`) REFERENCES `wage_summaries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wage_deductions` ADD CONSTRAINT `wage_deductions_damage_loss_item_id_fkey` FOREIGN KEY (`damage_loss_item_id`) REFERENCES `damage_loss_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wage_payments` ADD CONSTRAINT `wage_payments_wage_summary_id_fkey` FOREIGN KEY (`wage_summary_id`) REFERENCES `wage_summaries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence_attachments` ADD CONSTRAINT `evidence_attachments_evidence_file_id_fkey` FOREIGN KEY (`evidence_file_id`) REFERENCES `evidence_files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
