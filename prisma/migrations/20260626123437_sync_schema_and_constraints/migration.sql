/*
  Warnings:

  - The primary key for the `assignments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assigned_date` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `role_in_event` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `session_type` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `assignments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `assignments` table. All the data in the column will be lost.
  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `check_in_time` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `check_out_time` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `session_type` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `verified_by` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `work_date` on the `attendance` table. All the data in the column will be lost.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `new_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `old_values` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `entity_type` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - The primary key for the `business_policies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `business_policies` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `business_policies` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `business_policies` table. All the data in the column will be lost.
  - You are about to drop the column `policy_value` on the `business_policies` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `business_policies` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `business_policies` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `business_policies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - The primary key for the `catalog_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category_id` on the `catalog_items` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `catalog_items` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `catalog_items` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `catalog_items` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `catalog_items` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - You are about to alter the column `unit` on the `catalog_items` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(30)`.
  - The primary key for the `change_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `change_type` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `requested_at` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `review_notes` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `change_requests` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_by` on the `change_requests` table. All the data in the column will be lost.
  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_by` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - You are about to drop the column `damage_loss_report_id` on the `damage_loss_items` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_cost` on the `damage_loss_items` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `damage_loss_items` table. All the data in the column will be lost.
  - You are about to drop the column `responsible_user_id` on the `damage_loss_items` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `damage_loss_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - The primary key for the `damage_loss_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `damage_loss_reports` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `damage_loss_reports` table. All the data in the column will be lost.
  - You are about to drop the column `report_date` on the `damage_loss_reports` table. All the data in the column will be lost.
  - You are about to drop the column `reported_by` on the `damage_loss_reports` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `damage_loss_reports` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_by` on the `damage_loss_reports` table. All the data in the column will be lost.
  - The primary key for the `inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_available` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_damaged` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_reserved` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_total` on the `inventory` table. All the data in the column will be lost.
  - The primary key for the `inventory_reservations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catalog_item_id` on the `inventory_reservations` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `inventory_reservations` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_reserved` on the `inventory_reservations` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `item_price_history` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `item_price_history` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `item_price_history` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `item_price_history` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `read_at` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `related_entity_id` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `related_entity_type` on the `notifications` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `event_end_date` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `event_type` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `guest_count` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `venue_address` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `venue_name` on the `orders` table. All the data in the column will be lost.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_by` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_ref` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - You are about to drop the column `notes` on the `pick_list_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_picked` on the `pick_list_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity_required` on the `pick_list_items` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pick_list_items` table. All the data in the column will be lost.
  - The primary key for the `pick_lists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignment_id` on the `pick_lists` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `pick_lists` table. All the data in the column will be lost.
  - The primary key for the `quotations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved_at` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `discount_amount` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `final_amount` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `quotations` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `quotations` table. All the data in the column will be lost.
  - You are about to alter the column `total_amount` on the `quotations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `settlement_lines` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `settlement_lines` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `settlements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved_at` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `total_damage_recovery` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `total_discount` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `total_extra_amount` on the `settlements` table. All the data in the column will be lost.
  - You are about to drop the column `total_service_amount` on the `settlements` table. All the data in the column will be lost.
  - You are about to alter the column `total_paid` on the `settlements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `supplier_payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `reference_code` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_id` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_payable_id` on the `supplier_payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `supplier_payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `suppliers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `suppliers` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `suppliers` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `suppliers` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - The primary key for the `survey_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved_at` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `requirement_notes` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_at` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `survey_date` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `surveyed_by` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `venue_notes` on the `survey_reports` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `wage_deductions` table. All the data in the column will be lost.
  - You are about to drop the column `damage_loss_item_id` on the `wage_deductions` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `wage_deductions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - You are about to drop the column `created_at` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_date` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_ref` on the `wage_payments` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `wage_payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(12,2)`.
  - The primary key for the `wage_rules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `session_type` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `valid_from` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `valid_to` on the `wage_rules` table. All the data in the column will be lost.
  - You are about to drop the column `wage_amount` on the `wage_rules` table. All the data in the column will be lost.
  - The primary key for the `wage_summaries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approved_at` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `net_wage` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `period_month` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `period_year` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `total_base_wage` on the `wage_summaries` table. All the data in the column will be lost.
  - You are about to drop the column `total_deductions` on the `wage_summaries` table. All the data in the column will be lost.
  - The primary key for the `warehouses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `warehouses` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `warehouses` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `warehouses` table. The data in that column could be lost. The data in that column will be cast from `VarChar(200)` to `VarChar(150)`.
  - You are about to drop the `catalog_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evidence_attachments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evidence_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `handover_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `handovers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotation_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier_payable_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier_payables` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `survey_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `quotations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_name]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignment_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_in_task` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `work_task_id` to the `assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendance_id` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `log_id` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `config` to the `business_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `business_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `effective_from` to the `business_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policy_id` to the `business_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policy_type` to the `business_policies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalog_item_id` to the `catalog_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `change_request_id` to the `change_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `change_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `change_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `damage_loss_id` to the `damage_loss_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `damage_loss_id` to the `damage_loss_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recorded_by` to the `damage_loss_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventory_id` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservation_id` to the `inventory_reservations` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_by` on table `inventory_reservations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `effective_from` to the `item_price_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notification_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_request_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Made the column `confirmed_by` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `planned_quantity` to the `pick_list_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pick_list_id` to the `pick_lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `pick_lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quotation_id` to the `quotations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_name` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_value` to the `settlements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settlement_id` to the `settlements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `debt_id` to the `supplier_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_at` to the `supplier_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_id` to the `supplier_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recorded_by` to the `supplier_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_id` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recorded_by` to the `survey_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survey_report_id` to the `survey_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `wage_deductions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_at` to the `wage_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_by` to the `wage_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `effective_from` to the `wage_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate_per_session` to the `wage_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_in_task` to the `wage_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wage_rule_id` to the `wage_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wage_summary_id` to the `wage_summaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warehouse_id` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assignments` DROP FOREIGN KEY `assignments_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `assignments` DROP FOREIGN KEY `assignments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `catalog_items` DROP FOREIGN KEY `catalog_items_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `change_requests` DROP FOREIGN KEY `change_requests_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `damage_loss_items` DROP FOREIGN KEY `damage_loss_items_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `damage_loss_items` DROP FOREIGN KEY `damage_loss_items_damage_loss_report_id_fkey`;

-- DropForeignKey
ALTER TABLE `damage_loss_items` DROP FOREIGN KEY `damage_loss_items_responsible_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `damage_loss_reports` DROP FOREIGN KEY `damage_loss_reports_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `evidence_attachments` DROP FOREIGN KEY `evidence_attachments_evidence_file_id_fkey`;

-- DropForeignKey
ALTER TABLE `handover_items` DROP FOREIGN KEY `handover_items_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `handover_items` DROP FOREIGN KEY `handover_items_handover_id_fkey`;

-- DropForeignKey
ALTER TABLE `handovers` DROP FOREIGN KEY `handovers_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory` DROP FOREIGN KEY `inventory_warehouse_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_reservations` DROP FOREIGN KEY `inventory_reservations_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_reservations` DROP FOREIGN KEY `inventory_reservations_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_transactions` DROP FOREIGN KEY `inventory_transactions_warehouse_id_fkey`;

-- DropForeignKey
ALTER TABLE `item_price_history` DROP FOREIGN KEY `item_price_history_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `pick_list_items` DROP FOREIGN KEY `pick_list_items_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `pick_list_items` DROP FOREIGN KEY `pick_list_items_pick_list_id_fkey`;

-- DropForeignKey
ALTER TABLE `pick_lists` DROP FOREIGN KEY `pick_lists_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_lines` DROP FOREIGN KEY `quotation_lines_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotation_lines` DROP FOREIGN KEY `quotation_lines_quotation_id_fkey`;

-- DropForeignKey
ALTER TABLE `quotations` DROP FOREIGN KEY `quotations_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `role_permissions` DROP FOREIGN KEY `role_permissions_permission_id_fkey`;

-- DropForeignKey
ALTER TABLE `role_permissions` DROP FOREIGN KEY `role_permissions_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `settlement_lines` DROP FOREIGN KEY `settlement_lines_settlement_id_fkey`;

-- DropForeignKey
ALTER TABLE `settlements` DROP FOREIGN KEY `settlements_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier_payable_items` DROP FOREIGN KEY `supplier_payable_items_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier_payable_items` DROP FOREIGN KEY `supplier_payable_items_supplier_payable_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier_payables` DROP FOREIGN KEY `supplier_payables_supplier_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier_payments` DROP FOREIGN KEY `supplier_payments_supplier_id_fkey`;

-- DropForeignKey
ALTER TABLE `supplier_payments` DROP FOREIGN KEY `supplier_payments_supplier_payable_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_items` DROP FOREIGN KEY `survey_items_catalog_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_items` DROP FOREIGN KEY `survey_items_survey_report_id_fkey`;

-- DropForeignKey
ALTER TABLE `survey_reports` DROP FOREIGN KEY `survey_reports_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `tasks` DROP FOREIGN KEY `tasks_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_devices` DROP FOREIGN KEY `user_devices_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `wage_deductions` DROP FOREIGN KEY `wage_deductions_damage_loss_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `wage_deductions` DROP FOREIGN KEY `wage_deductions_wage_summary_id_fkey`;

-- DropForeignKey
ALTER TABLE `wage_payments` DROP FOREIGN KEY `wage_payments_wage_summary_id_fkey`;

-- DropForeignKey
ALTER TABLE `wage_rules` DROP FOREIGN KEY `wage_rules_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `wage_summaries` DROP FOREIGN KEY `wage_summaries_user_id_fkey`;

-- DropIndex
DROP INDEX `assignments_order_id_fkey` ON `assignments`;

-- DropIndex
DROP INDEX `assignments_user_id_fkey` ON `assignments`;

-- DropIndex
DROP INDEX `attendance_assignment_id_work_date_session_type_key` ON `attendance`;

-- DropIndex
DROP INDEX `attendance_user_id_fkey` ON `attendance`;

-- DropIndex
DROP INDEX `business_policies_code_key` ON `business_policies`;

-- DropIndex
DROP INDEX `catalog_items_category_id_fkey` ON `catalog_items`;

-- DropIndex
DROP INDEX `change_requests_order_id_fkey` ON `change_requests`;

-- DropIndex
DROP INDEX `damage_loss_items_catalog_item_id_fkey` ON `damage_loss_items`;

-- DropIndex
DROP INDEX `damage_loss_items_damage_loss_report_id_fkey` ON `damage_loss_items`;

-- DropIndex
DROP INDEX `damage_loss_items_responsible_user_id_fkey` ON `damage_loss_items`;

-- DropIndex
DROP INDEX `damage_loss_reports_order_id_fkey` ON `damage_loss_reports`;

-- DropIndex
DROP INDEX `inventory_catalog_item_id_fkey` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_warehouse_id_catalog_item_id_key` ON `inventory`;

-- DropIndex
DROP INDEX `inventory_reservations_catalog_item_id_fkey` ON `inventory_reservations`;

-- DropIndex
DROP INDEX `inventory_reservations_order_id_fkey` ON `inventory_reservations`;

-- DropIndex
DROP INDEX `item_price_history_catalog_item_id_fkey` ON `item_price_history`;

-- DropIndex
DROP INDEX `orders_code_key` ON `orders`;

-- DropIndex
DROP INDEX `orders_customer_id_fkey` ON `orders`;

-- DropIndex
DROP INDEX `payments_order_id_fkey` ON `payments`;

-- DropIndex
DROP INDEX `pick_list_items_catalog_item_id_fkey` ON `pick_list_items`;

-- DropIndex
DROP INDEX `pick_list_items_pick_list_id_fkey` ON `pick_list_items`;

-- DropIndex
DROP INDEX `pick_lists_order_id_fkey` ON `pick_lists`;

-- DropIndex
DROP INDEX `quotations_order_id_version_key` ON `quotations`;

-- DropIndex
DROP INDEX `roles_name_key` ON `roles`;

-- DropIndex
DROP INDEX `settlement_lines_settlement_id_fkey` ON `settlement_lines`;

-- DropIndex
DROP INDEX `supplier_payments_supplier_id_fkey` ON `supplier_payments`;

-- DropIndex
DROP INDEX `supplier_payments_supplier_payable_id_fkey` ON `supplier_payments`;

-- DropIndex
DROP INDEX `survey_reports_order_id_fkey` ON `survey_reports`;

-- DropIndex
DROP INDEX `wage_deductions_damage_loss_item_id_fkey` ON `wage_deductions`;

-- DropIndex
DROP INDEX `wage_deductions_wage_summary_id_fkey` ON `wage_deductions`;

-- DropIndex
DROP INDEX `wage_payments_wage_summary_id_fkey` ON `wage_payments`;

-- DropIndex
DROP INDEX `wage_rules_role_id_fkey` ON `wage_rules`;

-- DropIndex
DROP INDEX `wage_summaries_user_id_period_month_period_year_key` ON `wage_summaries`;

-- DropIndex
DROP INDEX `warehouses_name_key` ON `warehouses`;

-- AlterTable
ALTER TABLE `assignments` DROP PRIMARY KEY,
    DROP COLUMN `assigned_date`,
    DROP COLUMN `created_at`,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `order_id`,
    DROP COLUMN `role_in_event`,
    DROP COLUMN `session_type`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `assignment_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `role_in_task` VARCHAR(191) NOT NULL,
    ADD COLUMN `work_task_id` BIGINT NOT NULL,
    ADD PRIMARY KEY (`assignment_id`);

-- AlterTable
ALTER TABLE `attendance` DROP PRIMARY KEY,
    DROP COLUMN `check_in_time`,
    DROP COLUMN `check_out_time`,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `session_type`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    DROP COLUMN `verified_by`,
    DROP COLUMN `work_date`,
    ADD COLUMN `attendance_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `check_in` DATETIME(3) NULL,
    ADD COLUMN `check_out` DATETIME(3) NULL,
    ADD COLUMN `completion_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `confirmed_at` DATETIME(3) NULL,
    ADD COLUMN `confirmed_by` BIGINT NULL,
    ADD PRIMARY KEY (`attendance_id`);

-- AlterTable
ALTER TABLE `audit_logs` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `ip_address`,
    DROP COLUMN `new_values`,
    DROP COLUMN `old_values`,
    DROP COLUMN `user_agent`,
    ADD COLUMN `log_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `new_value` JSON NULL,
    ADD COLUMN `old_value` JSON NULL,
    MODIFY `action` VARCHAR(100) NOT NULL,
    MODIFY `entity_type` VARCHAR(50) NOT NULL,
    MODIFY `entity_id` BIGINT NULL,
    ADD PRIMARY KEY (`log_id`);

-- AlterTable
ALTER TABLE `business_policies` DROP PRIMARY KEY,
    DROP COLUMN `code`,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    DROP COLUMN `policy_value`,
    DROP COLUMN `unit`,
    DROP COLUMN `updated_by`,
    ADD COLUMN `config` JSON NOT NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` BIGINT NOT NULL,
    ADD COLUMN `effective_from` DATE NOT NULL,
    ADD COLUMN `effective_to` DATE NULL,
    ADD COLUMN `policy_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `policy_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    MODIFY `name` VARCHAR(150) NOT NULL,
    ADD PRIMARY KEY (`policy_id`);

-- AlterTable
ALTER TABLE `catalog_items` DROP PRIMARY KEY,
    DROP COLUMN `category_id`,
    DROP COLUMN `created_by`,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    ADD COLUMN `catalog_item_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `category` VARCHAR(100) NULL,
    ADD COLUMN `current_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `current_rental_price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `replacement_value` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `unit` VARCHAR(30) NULL,
    ADD PRIMARY KEY (`catalog_item_id`);

-- AlterTable
ALTER TABLE `change_requests` DROP PRIMARY KEY,
    DROP COLUMN `change_type`,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    DROP COLUMN `requested_at`,
    DROP COLUMN `review_notes`,
    DROP COLUMN `reviewed_at`,
    DROP COLUMN `reviewed_by`,
    ADD COLUMN `approved_by` BIGINT NULL,
    ADD COLUMN `change_request_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `executed_at` DATETIME(3) NULL,
    ADD COLUMN `reconciled_at` DATETIME(3) NULL,
    ADD COLUMN `reconciled_by` BIGINT NULL,
    ADD COLUMN `type` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`change_request_id`);

-- AlterTable
ALTER TABLE `customers` DROP PRIMARY KEY,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_by`,
    ADD COLUMN `customer_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `full_name` VARCHAR(150) NOT NULL,
    MODIFY `phone` VARCHAR(20) NULL,
    MODIFY `email` VARCHAR(150) NULL,
    MODIFY `address` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`customer_id`);

-- AlterTable
ALTER TABLE `damage_loss_items` DROP COLUMN `damage_loss_report_id`,
    DROP COLUMN `estimated_cost`,
    DROP COLUMN `notes`,
    DROP COLUMN `responsible_user_id`,
    ADD COLUMN `compensation_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `damage_loss_id` BIGINT NOT NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'internal',
    ADD COLUMN `supplier_transaction_item_id` BIGINT NULL,
    MODIFY `quantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `damage_loss_reports` DROP PRIMARY KEY,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    DROP COLUMN `report_date`,
    DROP COLUMN `reported_by`,
    DROP COLUMN `reviewed_at`,
    DROP COLUMN `reviewed_by`,
    ADD COLUMN `confirmed_by` BIGINT NULL,
    ADD COLUMN `damage_loss_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `recorded_by` BIGINT NOT NULL,
    ADD COLUMN `total_compensation` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    ADD PRIMARY KEY (`damage_loss_id`);

-- AlterTable
ALTER TABLE `inventory` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `last_updated`,
    DROP COLUMN `location`,
    DROP COLUMN `quantity_available`,
    DROP COLUMN `quantity_damaged`,
    DROP COLUMN `quantity_reserved`,
    DROP COLUMN `quantity_total`,
    ADD COLUMN `available_quantity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `inventory_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `total_quantity` INTEGER NOT NULL DEFAULT 0,
    ADD PRIMARY KEY (`inventory_id`);

-- AlterTable
ALTER TABLE `inventory_reservations` DROP PRIMARY KEY,
    DROP COLUMN `catalog_item_id`,
    DROP COLUMN `id`,
    DROP COLUMN `quantity_reserved`,
    ADD COLUMN `reservation_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `created_by` BIGINT NOT NULL,
    ADD PRIMARY KEY (`reservation_id`);

-- AlterTable
ALTER TABLE `item_price_history` DROP COLUMN `created_at`,
    DROP COLUMN `valid_from`,
    DROP COLUMN `valid_to`,
    ADD COLUMN `effective_from` DATETIME(3) NOT NULL,
    ADD COLUMN `effective_to` DATETIME(3) NULL,
    MODIFY `price` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `notifications` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `message`,
    DROP COLUMN `read_at`,
    DROP COLUMN `related_entity_id`,
    DROP COLUMN `related_entity_type`,
    ADD COLUMN `content` TEXT NULL,
    ADD COLUMN `notification_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `ref_id` BIGINT NULL,
    ADD COLUMN `ref_type` VARCHAR(50) NULL,
    MODIFY `type` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`notification_id`);

-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    DROP COLUMN `code`,
    DROP COLUMN `event_end_date`,
    DROP COLUMN `event_type`,
    DROP COLUMN `guest_count`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `updated_by`,
    DROP COLUMN `venue_address`,
    DROP COLUMN `venue_name`,
    ADD COLUMN `event_location` VARCHAR(255) NULL,
    ADD COLUMN `order_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `revenue_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN `total_value` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    ADD PRIMARY KEY (`order_id`);

-- AlterTable
ALTER TABLE `payments` DROP PRIMARY KEY,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `payment_date`,
    DROP COLUMN `payment_method`,
    DROP COLUMN `payment_type`,
    DROP COLUMN `transaction_ref`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `method` VARCHAR(191) NOT NULL,
    ADD COLUMN `paid_at` DATETIME(3) NULL,
    ADD COLUMN `payment_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `payment_request_id` BIGINT NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL,
    MODIFY `confirmed_by` BIGINT NOT NULL,
    ADD PRIMARY KEY (`payment_id`);

-- AlterTable
ALTER TABLE `pick_list_items` DROP COLUMN `notes`,
    DROP COLUMN `quantity_picked`,
    DROP COLUMN `quantity_required`,
    DROP COLUMN `status`,
    ADD COLUMN `actual_quantity` INTEGER NULL,
    ADD COLUMN `planned_quantity` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `pick_lists` DROP PRIMARY KEY,
    DROP COLUMN `assignment_id`,
    DROP COLUMN `id`,
    ADD COLUMN `pick_list_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `purpose` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    ADD PRIMARY KEY (`pick_list_id`);

-- AlterTable
ALTER TABLE `quotations` DROP PRIMARY KEY,
    DROP COLUMN `approved_at`,
    DROP COLUMN `discount_amount`,
    DROP COLUMN `final_amount`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `sent_at`,
    DROP COLUMN `version`,
    ADD COLUMN `customer_id` BIGINT NOT NULL,
    ADD COLUMN `quotation_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD PRIMARY KEY (`quotation_id`);

-- AlterTable
ALTER TABLE `roles` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `name`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `role_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `role_name` VARCHAR(50) NOT NULL,
    MODIFY `description` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`role_id`);

-- AlterTable
ALTER TABLE `settlement_lines` DROP COLUMN `created_at`,
    ADD COLUMN `ref_id` BIGINT NULL,
    ADD COLUMN `ref_type` VARCHAR(50) NULL,
    MODIFY `description` VARCHAR(255) NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `settlements` DROP PRIMARY KEY,
    DROP COLUMN `approved_at`,
    DROP COLUMN `approved_by`,
    DROP COLUMN `balance`,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `total_damage_recovery`,
    DROP COLUMN `total_discount`,
    DROP COLUMN `total_extra_amount`,
    DROP COLUMN `total_service_amount`,
    ADD COLUMN `additional_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `change_adjustment` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `compensation` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `confirmed_by` BIGINT NULL,
    ADD COLUMN `original_value` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `payment_method` VARCHAR(191) NULL,
    ADD COLUMN `recorded_by` BIGINT NULL,
    ADD COLUMN `remaining_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `settlement_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `total_paid` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD PRIMARY KEY (`settlement_id`);

-- AlterTable
ALTER TABLE `supplier_payments` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `notes`,
    DROP COLUMN `payment_date`,
    DROP COLUMN `payment_method`,
    DROP COLUMN `reference_code`,
    DROP COLUMN `supplier_id`,
    DROP COLUMN `supplier_payable_id`,
    ADD COLUMN `debt_id` BIGINT NOT NULL,
    ADD COLUMN `note` VARCHAR(255) NULL,
    ADD COLUMN `paid_at` DATETIME(3) NOT NULL,
    ADD COLUMN `payment_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `recorded_by` BIGINT NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL,
    ADD PRIMARY KEY (`payment_id`);

-- AlterTable
ALTER TABLE `suppliers` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `created_by`,
    DROP COLUMN `email`,
    DROP COLUMN `id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `supplier_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `contact_person` VARCHAR(150) NULL,
    MODIFY `address` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`supplier_id`);

-- AlterTable
ALTER TABLE `survey_reports` DROP PRIMARY KEY,
    DROP COLUMN `approved_at`,
    DROP COLUMN `approved_by`,
    DROP COLUMN `id`,
    DROP COLUMN `requirement_notes`,
    DROP COLUMN `submitted_at`,
    DROP COLUMN `survey_date`,
    DROP COLUMN `surveyed_by`,
    DROP COLUMN `venue_notes`,
    ADD COLUMN `confirmed_by` BIGINT NULL,
    ADD COLUMN `feasibility_note` TEXT NULL,
    ADD COLUMN `recorded_by` BIGINT NOT NULL,
    ADD COLUMN `site_address` VARCHAR(255) NULL,
    ADD COLUMN `site_condition` TEXT NULL,
    ADD COLUMN `survey_report_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD COLUMN `work_task_id` BIGINT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    ADD PRIMARY KEY (`survey_report_id`);

-- AlterTable
ALTER TABLE `wage_deductions` DROP COLUMN `created_at`,
    DROP COLUMN `damage_loss_item_id`,
    ADD COLUMN `created_by` BIGINT NOT NULL,
    MODIFY `reason` VARCHAR(255) NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `wage_payments` DROP COLUMN `created_at`,
    DROP COLUMN `created_by`,
    DROP COLUMN `payment_date`,
    DROP COLUMN `payment_method`,
    DROP COLUMN `status`,
    DROP COLUMN `transaction_ref`,
    ADD COLUMN `note` VARCHAR(255) NULL,
    ADD COLUMN `paid_at` DATETIME(3) NOT NULL,
    ADD COLUMN `paid_by` BIGINT NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `wage_rules` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `role_id`,
    DROP COLUMN `session_type`,
    DROP COLUMN `valid_from`,
    DROP COLUMN `valid_to`,
    DROP COLUMN `wage_amount`,
    ADD COLUMN `effective_from` DATE NOT NULL,
    ADD COLUMN `effective_to` DATE NULL,
    ADD COLUMN `rate_per_session` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `role_in_task` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `wage_rule_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`wage_rule_id`);

-- AlterTable
ALTER TABLE `wage_summaries` DROP PRIMARY KEY,
    DROP COLUMN `approved_at`,
    DROP COLUMN `approved_by`,
    DROP COLUMN `created_by`,
    DROP COLUMN `id`,
    DROP COLUMN `net_wage`,
    DROP COLUMN `period_month`,
    DROP COLUMN `period_year`,
    DROP COLUMN `total_base_wage`,
    DROP COLUMN `total_deductions`,
    ADD COLUMN `confirmed_by` BIGINT NULL,
    ADD COLUMN `gross_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `order_id` BIGINT NULL,
    ADD COLUMN `period` VARCHAR(20) NULL,
    ADD COLUMN `total_deduction` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `total_wage` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `wage_summary_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`wage_summary_id`);

-- AlterTable
ALTER TABLE `warehouses` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `warehouse_id` BIGINT NOT NULL AUTO_INCREMENT,
    MODIFY `name` VARCHAR(150) NOT NULL,
    MODIFY `address` VARCHAR(255) NULL,
    ADD PRIMARY KEY (`warehouse_id`);

-- DropTable
DROP TABLE `catalog_categories`;

-- DropTable
DROP TABLE `evidence_attachments`;

-- DropTable
DROP TABLE `evidence_files`;

-- DropTable
DROP TABLE `handover_items`;

-- DropTable
DROP TABLE `handovers`;

-- DropTable
DROP TABLE `inventory_transactions`;

-- DropTable
DROP TABLE `permissions`;

-- DropTable
DROP TABLE `quotation_lines`;

-- DropTable
DROP TABLE `role_permissions`;

-- DropTable
DROP TABLE `supplier_payable_items`;

-- DropTable
DROP TABLE `supplier_payables`;

-- DropTable
DROP TABLE `survey_items`;

-- DropTable
DROP TABLE `tasks`;

-- DropTable
DROP TABLE `user_devices`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `internal_users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(20) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `internal_users_username_key`(`username`),
    UNIQUE INDEX `internal_users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_cost_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `catalog_item_id` BIGINT NOT NULL,
    `cost` DECIMAL(12, 2) NOT NULL,
    `effective_from` DATETIME(3) NOT NULL,
    `effective_to` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `quotation_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `line_total` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'internal',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `from_status` VARCHAR(30) NULL,
    `to_status` VARCHAR(30) NOT NULL,
    `changed_by` BIGINT NOT NULL,
    `note` VARCHAR(255) NULL,
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_outstanding_cases` (
    `case_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `case_type` VARCHAR(191) NOT NULL,
    `reference_id` BIGINT NOT NULL,
    `direction` VARCHAR(191) NOT NULL DEFAULT 'out',
    `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `resolved_by` BIGINT NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`case_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue_records` (
    `revenue_record_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `recognized_period` VARCHAR(7) NOT NULL,
    `gross_revenue` DECIMAL(12, 2) NOT NULL,
    `revenue_deduction` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `net_revenue` DECIMAL(12, 2) NOT NULL,
    `supplier_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `wage_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `gross_profit` DECIMAL(12, 2) NOT NULL,
    `recognized_at` DATETIME(3) NOT NULL,
    `recognized_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `revenue_records_order_id_key`(`order_id`),
    PRIMARY KEY (`revenue_record_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_bank_accounts` (
    `bank_account_id` BIGINT NOT NULL AUTO_INCREMENT,
    `bank_code` VARCHAR(20) NOT NULL,
    `account_number` VARCHAR(30) NOT NULL,
    `account_name` VARCHAR(150) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',

    PRIMARY KEY (`bank_account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_requests` (
    `payment_request_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `payment_type` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method_hint` VARCHAR(191) NULL,
    `bank_account_id` BIGINT NULL,
    `transfer_code` VARCHAR(50) NULL,
    `qr_url` VARCHAR(500) NULL,
    `due_date` DATE NULL,
    `instruction` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_requests_transfer_code_key`(`transfer_code`),
    PRIMARY KEY (`payment_request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_plans` (
    `schedule_plan_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `schedule_plans_order_id_key`(`order_id`),
    PRIMARY KEY (`schedule_plan_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule_activities` (
    `activity_id` BIGINT NOT NULL AUTO_INCREMENT,
    `schedule_plan_id` BIGINT NOT NULL,
    `activity_type` VARCHAR(191) NOT NULL,
    `planned_start` DATETIME(3) NOT NULL,
    `planned_end` DATETIME(3) NULL,
    `location` VARCHAR(255) NULL,
    `note` TEXT NULL,
    `sort_order` INTEGER NULL,

    PRIMARY KEY (`activity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `work_tasks` (
    `work_task_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `task_category` VARCHAR(191) NOT NULL DEFAULT 'operation',
    `schedule_activity_id` BIGINT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`work_task_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_progress_updates` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `work_task_id` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `progress_status` VARCHAR(50) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_availability` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `work_date` DATE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `note` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wage_summary_lines` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wage_summary_id` BIGINT NOT NULL,
    `assignment_id` BIGINT NULL,
    `attendance_id` BIGINT NULL,
    `wage_rule_id` BIGINT NULL,
    `session_date` DATE NULL,
    `wage_rate` DECIMAL(12, 2) NOT NULL,
    `line_amount` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_reservation_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reservation_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `reserved_quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_reports` (
    `inventory_report_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `report_type` VARCHAR(191) NOT NULL,
    `recorded_by` BIGINT NOT NULL,
    `confirmed_by` BIGINT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`inventory_report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_report_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `inventory_report_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `expected_quantity` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `condition_status` VARCHAR(191) NOT NULL DEFAULT 'good',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouse_histories` (
    `history_id` BIGINT NOT NULL AUTO_INCREMENT,
    `warehouse_id` BIGINT NOT NULL,
    `order_id` BIGINT NULL,
    `inventory_report_id` BIGINT NULL,
    `movement_type` VARCHAR(191) NOT NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`history_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouse_history_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `history_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment_maintenance` (
    `maintenance_id` BIGINT NOT NULL AUTO_INCREMENT,
    `catalog_item_id` BIGINT NOT NULL,
    `warehouse_id` BIGINT NULL,
    `quantity` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'in_maintenance',
    `note` TEXT NULL,

    PRIMARY KEY (`maintenance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_transactions` (
    `supplier_transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_id` BIGINT NOT NULL,
    `order_id` BIGINT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `total_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `expected_delivery` DATE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`supplier_transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_transaction_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_transaction_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NULL,
    `description` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL,
    `unit_cost` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_receipt_reports` (
    `receipt_report_id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_transaction_id` BIGINT NOT NULL,
    `recorded_by` BIGINT NOT NULL,
    `confirmed_by` BIGINT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`receipt_report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_receipt_report_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `receipt_report_id` BIGINT NOT NULL,
    `supplier_transaction_item_id` BIGINT NULL,
    `catalog_item_id` BIGINT NULL,
    `description` VARCHAR(255) NULL,
    `received_quantity` INTEGER NOT NULL,
    `condition_status` VARCHAR(191) NOT NULL DEFAULT 'good',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_return_reports` (
    `return_report_id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_transaction_id` BIGINT NOT NULL,
    `recorded_by` BIGINT NOT NULL,
    `confirmed_by` BIGINT NULL,
    `total_compensation` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`return_report_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_return_report_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `return_report_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NULL,
    `description` VARCHAR(255) NULL,
    `returned_quantity` INTEGER NOT NULL,
    `condition_status` VARCHAR(191) NOT NULL,
    `compensation_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_debts` (
    `debt_id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_id` BIGINT NOT NULL,
    `supplier_transaction_id` BIGINT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`debt_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `change_request_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `change_request_id` BIGINT NOT NULL,
    `catalog_item_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `handover_records` (
    `handover_id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `recorded_by` BIGINT NOT NULL,
    `confirmed_by` BIGINT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'submitted',
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`handover_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence` (
    `evidence_id` BIGINT NOT NULL AUTO_INCREMENT,
    `ref_type` VARCHAR(50) NOT NULL,
    `ref_id` BIGINT NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NULL,
    `uploaded_by` BIGINT NOT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`evidence_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `quotations_order_id_key` ON `quotations`(`order_id`);

-- CreateIndex
CREATE UNIQUE INDEX `roles_role_name_key` ON `roles`(`role_name`);

-- AddForeignKey
ALTER TABLE `internal_users` ADD CONSTRAINT `internal_users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
