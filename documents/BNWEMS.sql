-- =====================================================================
-- WEMS DATABASE v2 — ĐÃ ĐỐI CHIẾU VỚI 2 APP (Manager App + Admin App)
-- MySQL 8.x / InnoDB / utf8mb4 — chạy tuần tự từ trên xuống
-- Nguồn: ERD + Use Case UC-01..90 + code TSX của 2 app AI Studio
--
-- (v6.1) Bỏ pick_lists/pick_list_items: pick list sinh từ order_items
-- (thêm prepared_qty, prepared_by để tick tiến độ soạn từng dòng).
-- (v6) Cập nhật theo ERD mới: Deposit thay Payment; work_tasks là DANH MỤC
-- đầu công việc, schedule_plans là chi tiết giao việc (ai/ngày/địa điểm);
-- attendances gắn với việc được giao; evidences là kho minh chứng Firebase,
-- các bảng deposits/settlements/schedule_plans(bàn giao)/attendances(check-in)
-- trỏ evidence_id về evidences; inventory KHÔNG có cột location.
-- (v4) Doanh nghiệp CHỈ CÓ 1 KHO duy nhất => KHÔNG có bảng warehouses;
-- tồn kho quản lý trực tiếp trên inventory (mỗi thiết bị 1 dòng, cột location
-- là vị trí kệ trong kho). Danh mục & thiết bị theo danh sách thực tế của
-- doanh nghiệp (đồ cưới hỏi/nhà rạp); địa bàn hoạt động: Hà Nội.
-- Nguyên tắc (v3): TOÀN BỘ DỮ LIỆU LƯU TRONG DATABASE DÙNG TIẾNG VIỆT.
--  * Mọi ENUM và giá trị seed đều là tiếng Việt (trừ định danh kỹ thuật:
--    username, email, URL Firebase, FCM token, platform android/ios/web,
--    và các mã hiển thị DH-/BG-/EQ-/KS-... vốn là mã định danh).
--  * LƯU Ý: App Admin hiện so sánh vài chuỗi tiếng Anh trong code
--    (vd 'Admin', 'Suspended', 'Active', 'Deposit'); khi nối DB này,
--    frontend cần đổi các literal đó sang giá trị tiếng Việt tương ứng
--    hoặc map ở tầng API.
--  * Mỗi thực thể app hiển thị mã (DH-, BG-, KS-, PL-, NCC-...) có cột *_code.
--  * Các bảng bắt buộc giữ nguyên: internal_users(avatar_url,bio),
--    device_tokens, notifications, notification_recipients.
--  * Bảng cho Staff app (chưa có UI): collected_equipment_reports — giữ theo Use Case.
-- =====================================================================

DROP DATABASE IF EXISTS bnwems;
CREATE DATABASE bnwems DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bnwems;

-- ============ NHÓM NGƯỜI DÙNG ============

-- [v2] status thêm 'Suspended' theo UserManagementView; role đúng 4 giá trị app dùng
CREATE TABLE internal_users (
  user_id       BIGINT NOT NULL AUTO_INCREMENT,
  username      VARCHAR(100) NOT NULL COMMENT 'Tên đăng nhập (LoginView)',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã băm',
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NULL,
  phone         VARCHAR(20)  NULL,
  address       VARCHAR(255) NULL,
  role          ENUM('Quản trị viên','Quản lý','Trưởng nhóm','Nhân viên kỹ thuật') NOT NULL
                COMMENT '4 vai trò: Admin/Manager/Leader Staff/Technical Staff',
  status        ENUM('Hoạt động','Ngừng hoạt động','Tạm khóa') NOT NULL DEFAULT 'Hoạt động'
                COMMENT 'Tạm khóa = Suspended trên UserManagementView',
  avatar_url    VARCHAR(500) NULL COMMENT 'Lưu URL ảnh đại diện từ Firebase',
  bio           VARCHAR(255) NULL COMMENT 'Mô tả ngắn gọn về nhân viên',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_username (username),
  UNIQUE KEY uq_user_email (email)
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
  PRIMARY KEY (device_token_id),
  UNIQUE KEY uq_devtoken (fcm_token),
  KEY idx_devtoken_user (user_id),
  CONSTRAINT fk_devtoken_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
  log_id      BIGINT NOT NULL AUTO_INCREMENT,
  user_id     BIGINT NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id   BIGINT NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  ip_address  VARCHAR(45) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (log_id),
  KEY idx_audit_user (user_id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_time (created_at),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ MINH CHỨNG (Evidence — User uploads Evidence theo ERD) ============
-- Bảng lưu các minh chứng được upload lên Firebase. Các bảng nghiệp vụ
-- (deposits: đặt cọc, settlements: quyết toán, schedule_plans: bàn giao,
-- attendances: check-in) có cột evidence_id trỏ về đây.
CREATE TABLE evidences (
  evidence_id BIGINT NOT NULL AUTO_INCREMENT,
  file_url    VARCHAR(500) NOT NULL COMMENT 'URL minh chứng trên Firebase Storage',
  description VARCHAR(255) NULL COMMENT 'Mô tả minh chứng',
  uploaded_by BIGINT NOT NULL COMMENT 'Người upload (User uploads Evidence)',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evidence_id),
  KEY idx_evidence_uploader (uploaded_by),
  CONSTRAINT fk_evidence_uploader FOREIGN KEY (uploaded_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Kho minh chứng: ảnh giao dịch (đặt cọc, quyết toán, bàn giao) và ảnh check-in';

-- ============ NHÓM THÔNG BÁO (Topbar NotificationItem: title, content, type, time, read) ============

CREATE TABLE notifications (
  notification_id   BIGINT NOT NULL AUTO_INCREMENT,
  title             VARCHAR(255) NOT NULL,
  content           TEXT NULL,
  notification_type ENUM('Hệ thống','Tồn kho','Chính sách','Người dùng','Báo cáo','Đơn hàng','Công việc','Lịch trình','Thanh toán','Khảo sát','Lương','Nhà cung cấp','Khác')
                    NOT NULL DEFAULT 'Hệ thống'
                    COMMENT 'Map sang badge Topbar Admin: Tồn kho=Inventory, Chính sách=Policy, Người dùng=User, Báo cáo=Report',
  ref_type          VARCHAR(50) NULL,
  ref_id            BIGINT NULL,
  created_by        BIGINT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Map sang trường time của app',
  PRIMARY KEY (notification_id),
  KEY idx_notif_type (notification_type),
  KEY idx_notif_ref (ref_type, ref_id),
  CONSTRAINT fk_notif_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notification_recipients (
  recipient_id    BIGINT NOT NULL AUTO_INCREMENT,
  notification_id BIGINT NOT NULL,
  user_id         BIGINT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Map sang trường read của app',
  sent_at         DATETIME NULL,
  read_at         DATETIME NULL,
  push_status     ENUM('Chờ gửi','Đã gửi','Thất bại') NOT NULL DEFAULT 'Chờ gửi',
  PRIMARY KEY (recipient_id),
  UNIQUE KEY uq_notif_user (notification_id, user_id),
  KEY idx_nr_user_unread (user_id, is_read),
  CONSTRAINT fk_nr_notification FOREIGN KEY (notification_id)
    REFERENCES notifications (notification_id) ON DELETE CASCADE,
  CONSTRAINT fk_nr_user FOREIGN KEY (user_id) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM KHÁCH HÀNG & CHÍNH SÁCH ============

-- [v2] thêm customer_code; status tiếng Việt theo CustomersView
CREATE TABLE customers (
  customer_id   BIGINT NOT NULL AUTO_INCREMENT,
  customer_code VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị KH-001 trên app',
  customer_name VARCHAR(150) NOT NULL COMMENT 'Trường name của app',
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(150) NULL,
  address       VARCHAR(255) NULL,
  notes         VARCHAR(500) NULL COMMENT 'Trường notes của app',
  status        ENUM('Hoạt động','Ngừng hoạt động') NOT NULL DEFAULT 'Hoạt động',
  created_by    BIGINT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customer_code (customer_code),
  KEY idx_customer_phone (phone),
  CONSTRAINT fk_customer_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='ordersCount & lastOrderDate của app là giá trị TÍNH từ orders, không lưu cột';

-- [v2] theo PoliciesView: code, name, description, policy_value, unit(Ngày/%/VNĐ), updated_by
CREATE TABLE business_policies (
  policy_id    BIGINT NOT NULL AUTO_INCREMENT,
  policy_code  VARCHAR(30) NOT NULL COMMENT 'Trường code của app',
  policy_name  VARCHAR(200) NOT NULL,
  policy_type  ENUM('Đặt cọc','Hủy đơn','Bồi thường','Phụ phí','Lương') NOT NULL
               COMMENT 'Phân loại nghiệp vụ theo UC-21',
  description  TEXT NULL,
  policy_value DECIMAL(15,2) NOT NULL COMMENT 'Trường policy_value của app',
  unit         ENUM('Ngày','%','VNĐ') NOT NULL COMMENT 'Đơn vị giá trị, đúng 3 option của app',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by   BIGINT NULL COMMENT 'Trường updated_by của app',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (policy_id),
  UNIQUE KEY uq_policy_code (policy_code),
  KEY idx_policy_type_active (policy_type, is_active),
  CONSTRAINT fk_policy_updater FOREIGN KEY (updated_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM THIẾT BỊ & KHO (1 kho duy nhất — không có bảng warehouses) ============

-- [v5 — theo sơ đồ] Phân cấp danh mục 3 tầng:
--   item_categories (loại)  ->  item_types (chi tiết loại)  ->  items (item)
--   item_type_specs (thông tin từng loại): mô tả cấu thành của một chi tiết loại,
--   VD chi tiết loại "Bàn ghế chavari" = 1 bàn chavari + 6 ghế lớn (chavari).
--   inventory chỉ nối với items, KHÔNG chứa thông tin danh mục (đúng ghi chú sơ đồ).

-- ===== Bảng LOẠI (vd: Bàn ghế, Cổng hoa, Ấm chén...) =====
CREATE TABLE item_categories (
  category_id   BIGINT NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL COMMENT 'Tên loại: Bàn ghế, Cổng hoa, Ấm chén...',
  description   VARCHAR(255) NULL,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='LOẠI thiết bị (tầng 1 theo sơ đồ)';

-- ===== Bảng CHI TIẾT LOẠI (vd: Bàn ghế chavari, Bàn ghế nhỏ thuộc loại Bàn ghế;
--       Cổng hoa vàng, Cổng hoa hồng thuộc loại Cổng hoa) =====
CREATE TABLE item_types (
  type_id     BIGINT NOT NULL AUTO_INCREMENT,
  category_id BIGINT NOT NULL COMMENT 'Thuộc loại nào',
  type_name   VARCHAR(150) NOT NULL COMMENT 'Tên chi tiết loại: Bàn ghế chavari, Cổng hoa vàng...',
  description VARCHAR(255) NULL,
  PRIMARY KEY (type_id),
  UNIQUE KEY uq_type_name (category_id, type_name),
  KEY idx_type_category (category_id),
  CONSTRAINT fk_type_category FOREIGN KEY (category_id) REFERENCES item_categories (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CHI TIẾT LOẠI (tầng 2 theo sơ đồ)';

-- ===== Bảng ITEM (đơn vị cho thuê thực tế, gắn với chi tiết loại) =====
CREATE TABLE items (
  item_id      BIGINT NOT NULL AUTO_INCREMENT,
  item_code    VARCHAR(30) NOT NULL COMMENT 'Mã thiết bị, VD GHE-CHIAVARI',
  item_name    VARCHAR(200) NOT NULL,
  type_id      BIGINT NOT NULL COMMENT 'Thuộc chi tiết loại nào',
  description  TEXT NULL,
  unit         VARCHAR(50) NOT NULL DEFAULT 'Cái',
  rental_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  price_valid_from DATE NULL COMMENT 'Giá hiệu lực từ',
  price_valid_to   DATE NULL COMMENT 'Giá hiệu lực đến',
  image_url    VARCHAR(500) NULL COMMENT 'URL ảnh minh họa thiết bị từ Firebase',
  status       ENUM('Đang hoạt động','Ngừng hoạt động','Bảo trì') NOT NULL DEFAULT 'Đang hoạt động',
  created_by   BIGINT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id),
  UNIQUE KEY uq_item_code (item_code),
  KEY idx_item_type (type_id),
  CONSTRAINT fk_item_type    FOREIGN KEY (type_id)    REFERENCES item_types (type_id),
  CONSTRAINT fk_item_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='ITEM cho thuê (tầng 3); loại của item suy ra qua item_types -> item_categories';

-- ===== Bảng THÔNG TIN TỪNG LOẠI (cấu thành của một chi tiết loại; "có thể là 1" dòng) =====
CREATE TABLE item_type_specs (
  spec_id           BIGINT NOT NULL AUTO_INCREMENT,
  type_id           BIGINT NOT NULL COMMENT 'Chi tiết loại được mô tả',
  component_item_id BIGINT NULL COMMENT 'Item cấu thành (nếu là thiết bị có trong danh mục)',
  component_name    VARCHAR(200) NOT NULL COMMENT 'Tên thành phần, VD: bàn chavari, ghế lớn (chavari)',
  quantity          INT NOT NULL DEFAULT 1 COMMENT 'Số lượng thành phần, VD 1 bàn + 6 ghế',
  note              VARCHAR(255) NULL,
  PRIMARY KEY (spec_id),
  KEY idx_spec_type (type_id),
  CONSTRAINT fk_spec_type FOREIGN KEY (type_id) REFERENCES item_types (type_id) ON DELETE CASCADE,
  CONSTRAINT fk_spec_component FOREIGN KEY (component_item_id) REFERENCES items (item_id),
  CONSTRAINT chk_spec_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='THÔNG TIN TỪNG LOẠI: VD Bàn ghế chavari = 1 bàn chavari + 6 ghế lớn';

-- inventory KHÔNG có phần danh mục (đúng sơ đồ) — chỉ nối items qua item_id
CREATE TABLE inventory (
  inventory_id      BIGINT NOT NULL AUTO_INCREMENT,
  item_id           BIGINT NOT NULL,
  quantity_total    INT NOT NULL DEFAULT 0,
  quantity_damaged  INT NOT NULL DEFAULT 0,
  quantity_reserved INT NOT NULL DEFAULT 0 COMMENT 'Sinh tự động từ đơn hàng (UC-13)',
  quantity_available INT GENERATED ALWAYS AS (quantity_total - quantity_damaged - quantity_reserved) STORED
                    COMMENT 'Tự tính = total - damaged - reserved',
  updated_by        BIGINT NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    COMMENT 'Map sang last_updated của app',
  PRIMARY KEY (inventory_id),
  -- Doanh nghiệp chỉ có 1 kho nên mỗi thiết bị đúng 1 dòng tồn kho:
  UNIQUE KEY uq_inventory_item (item_id),
  CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES items (item_id),
  CONSTRAINT fk_inventory_updater FOREIGN KEY (updated_by) REFERENCES internal_users (user_id),
  CONSTRAINT chk_inventory_qty CHECK (quantity_total >= 0 AND quantity_damaged >= 0 AND quantity_reserved >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM BÁO GIÁ (QuotationsView) ============

-- [v2] thêm quotation_code, version, subtotal, discount_total; status tiếng Việt
CREATE TABLE quotations (
  quotation_id   BIGINT NOT NULL AUTO_INCREMENT,
  quotation_code VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị BG-2026-001',
  customer_id    BIGINT NOT NULL,
  version        VARCHAR(10) NOT NULL DEFAULT 'v1.0' COMMENT 'Trường version của app',
  subtotal       DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Tổng trước giảm giá',
  discount_total DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Trường discountTotal của app',
  total_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  status         ENUM('Nháp','Đã duyệt','Từ chối') NOT NULL DEFAULT 'Nháp'
                 COMMENT 'Đúng 3 trạng thái QuotationsView lọc',
  notes          VARCHAR(500) NULL,
  created_by     BIGINT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Map sang createdAt của app',
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (quotation_id),
  UNIQUE KEY uq_quotation_code (quotation_code),
  KEY idx_quotation_customer (customer_id),
  KEY idx_quotation_status (status),
  CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
  CONSTRAINT fk_quotation_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- [v2] item_id nullable + snapshot name/category/unit + discount theo dòng (QuotationItem của app)
CREATE TABLE quotation_items (
  quotation_item_id BIGINT NOT NULL AUTO_INCREMENT,
  quotation_id BIGINT NOT NULL,
  item_id      BIGINT NULL COMMENT 'FK items; NULL nếu là mục nhập tay',
  item_name    VARCHAR(200) NOT NULL COMMENT 'Snapshot trường name',
  category     VARCHAR(100) NULL COMMENT 'Snapshot trường category',
  unit         VARCHAR(50) NOT NULL DEFAULT 'Cái',
  quantity     INT NOT NULL,
  price        DECIMAL(15,2) NOT NULL COMMENT 'Trường price của app',
  discount     DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Giảm giá theo dòng',
  line_total   DECIMAL(15,2) GENERATED ALWAYS AS (quantity * price - discount) STORED,
  PRIMARY KEY (quotation_item_id),
  KEY idx_qitem_quotation (quotation_id),
  CONSTRAINT fk_qitem_quotation FOREIGN KEY (quotation_id) REFERENCES quotations (quotation_id) ON DELETE CASCADE,
  CONSTRAINT fk_qitem_item      FOREIGN KEY (item_id)      REFERENCES items (item_id),
  CONSTRAINT chk_qitem_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM ĐƠN HÀNG (OrdersView + OrderAuditView) ============

-- [v2] thêm event_type/event_name/guest_count/payment_status; status tiếng Việt đúng app
CREATE TABLE orders (
  order_id       BIGINT NOT NULL AUTO_INCREMENT,
  order_code     VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị DH-2026-001',
  customer_id    BIGINT NOT NULL,
  quotation_id   BIGINT NULL COMMENT 'Báo giá gắn với đơn (app link 2 chiều qua cột này)',
  policy_id      BIGINT NULL,
  event_type     VARCHAR(100) NOT NULL COMMENT 'Tiệc Cưới Trọn Gói / Hội Nghị Khách Hàng... (option app)',
  event_name     VARCHAR(200) NULL COMMENT 'Trường eventName của app',
  event_date     DATE NOT NULL COMMENT 'Trường eventDate của app',
  location       VARCHAR(255) NOT NULL,
  guest_count    INT NULL COMMENT 'Trường guestCount của app',
  total_amount   DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_status ENUM('Chưa thanh toán','Đã cọc','Đã thanh toán') NOT NULL DEFAULT 'Chưa thanh toán'
                 COMMENT 'Trường paymentStatus hiển thị trên OrdersView/OrderAuditView',
  order_status   ENUM('Mới','Đã xác nhận','Đang thực hiện','Hoàn thành','Đã hủy') NOT NULL DEFAULT 'Mới'
                 COMMENT 'Trường orderStatus của app (UC-40)',
  cancel_reason  VARCHAR(500) NULL,
  notes          VARCHAR(500) NULL,
  created_by     BIGINT NOT NULL COMMENT 'Manager tạo — map managerName trên OrderAuditView',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  UNIQUE KEY uq_order_code (order_code),
  KEY idx_order_customer (customer_id),
  KEY idx_order_status (order_status),
  KEY idx_order_event_date (event_date),
  CONSTRAINT fk_order_customer  FOREIGN KEY (customer_id)  REFERENCES customers (customer_id),
  CONSTRAINT fk_order_quotation FOREIGN KEY (quotation_id) REFERENCES quotations (quotation_id),
  CONSTRAINT fk_order_policy    FOREIGN KEY (policy_id)    REFERENCES business_policies (policy_id),
  CONSTRAINT fk_order_creator   FOREIGN KEY (created_by)   REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  order_item_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id     BIGINT NOT NULL,
  item_id      BIGINT NOT NULL,
  quantity     INT NOT NULL,
  unit_price   DECIMAL(15,2) NOT NULL,
  subtotal     DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  source       ENUM('Kho nội bộ','Nhà cung cấp') NOT NULL DEFAULT 'Kho nội bộ',
  prepared_qty INT NOT NULL DEFAULT 0 COMMENT 'Số lượng đã soạn tại kho — thay cho pick list (UC-57, 75)',
  prepared_by  BIGINT NULL COMMENT 'Nhân viên soạn hàng dòng này',
  notes        VARCHAR(255) NULL,
  PRIMARY KEY (order_item_id),
  UNIQUE KEY uq_order_item (order_id, item_id),
  CONSTRAINT fk_oitem_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oitem_item  FOREIGN KEY (item_id)  REFERENCES items (item_id),
  CONSTRAINT fk_oitem_preparer FOREIGN KEY (prepared_by) REFERENCES internal_users (user_id),
  CONSTRAINT chk_oitem_qty CHECK (quantity > 0 AND prepared_qty >= 0 AND prepared_qty <= quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Pick list = query order_items (source=Kho nội bộ) của đơn, gắn với schedule_plans đầu việc Chuẩn bị';

-- [v2] BẢNG MỚI: cảnh báo đơn hàng — OrderAuditView có warnings[] và cho phép "resolve"
CREATE TABLE order_warnings (
  warning_id  BIGINT NOT NULL AUTO_INCREMENT,
  order_id    BIGINT NOT NULL,
  content     VARCHAR(500) NOT NULL COMMENT 'Nội dung cảnh báo rủi ro',
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Admin xóa bỏ cảnh báo trên OrderAuditView',
  resolved_by BIGINT NULL,
  resolved_at DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (warning_id),
  KEY idx_warning_order (order_id, is_resolved),
  CONSTRAINT fk_warning_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT fk_warning_resolver FOREIGN KEY (resolved_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM ĐẦU VIỆC & LỊCH TRÌNH & CHẤM CÔNG ============

-- [v6 — theo yêu cầu] WORK_TASKS là DANH MỤC các đầu công việc
-- (Khảo sát, Giám sát, Thi công, Thu hồi...). Chi tiết giao việc nằm ở schedule_plans.
CREATE TABLE work_tasks (
  task_id     BIGINT NOT NULL AUTO_INCREMENT,
  task_code   VARCHAR(20) NOT NULL,
  task_name   VARCHAR(150) NOT NULL COMMENT 'Đầu công việc: Khảo sát, Giám sát, Thi công, Thu hồi...',
  description VARCHAR(255) NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (task_id),
  UNIQUE KEY uq_task_code (task_code),
  UNIQUE KEY uq_task_name (task_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='DANH MỤC đầu công việc (Order has Work Task thông qua schedule_plans)';

-- [v6] SCHEDULE_PLANS: chi tiết đầu việc — giao cho AI, NGÀY nào, ở đâu, trạng thái;
-- có evidence_id lưu ảnh minh chứng BÀN GIAO/hoàn thành đầu việc (đẩy vào evidences).
CREATE TABLE schedule_plans (
  plan_id     BIGINT NOT NULL AUTO_INCREMENT,
  plan_code   VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị SP-001',
  order_id    BIGINT NOT NULL COMMENT 'Đơn hàng (Schedule Plan planned by Order)',
  task_id     BIGINT NOT NULL COMMENT 'Đầu công việc từ danh mục work_tasks',
  assigned_to BIGINT NOT NULL COMMENT 'Đầu việc giao cho ai (User performs Schedule Plan)',
  start_time  DATETIME NOT NULL COMMENT 'Ngày giờ thực hiện',
  end_time    DATETIME NULL,
  location    VARCHAR(255) NULL,
  status      ENUM('Chờ xử lý','Đã xác nhận','Đang thực hiện','Hoàn thành','Đã hủy') NOT NULL DEFAULT 'Chờ xử lý',
  evidence_id BIGINT NULL COMMENT 'Ảnh minh chứng bàn giao/hoàn thành đầu việc (lưu ở evidences)',
  notes       VARCHAR(500) NULL,
  created_by  BIGINT NOT NULL COMMENT 'Manager tạo lịch',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (plan_id),
  UNIQUE KEY uq_plan_code (plan_code),
  KEY idx_plan_order (order_id),
  KEY idx_plan_assignee (assigned_to),
  KEY idx_plan_time (start_time),
  CONSTRAINT fk_plan_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_plan_task     FOREIGN KEY (task_id)     REFERENCES work_tasks (task_id),
  CONSTRAINT fk_plan_assignee FOREIGN KEY (assigned_to) REFERENCES internal_users (user_id),
  CONSTRAINT fk_plan_evidence FOREIGN KEY (evidence_id) REFERENCES evidences (evidence_id),
  CONSTRAINT fk_plan_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Chi tiết giao đầu việc: ai làm, ngày nào, ở đâu, trạng thái, minh chứng bàn giao';

-- [v6] ATTENDANCES: check-in/check-out GẮN VỚI VIỆC ĐƯỢC GIAO (schedule_plans);
-- ảnh check-in lưu ở evidences qua check_in_evidence_id (User mark Attendance theo ERD).
CREATE TABLE attendances (
  attendance_id        BIGINT NOT NULL AUTO_INCREMENT,
  plan_id              BIGINT NOT NULL COMMENT 'Việc được giao (schedule_plans)',
  user_id              BIGINT NOT NULL COMMENT 'Nhân viên chấm công',
  check_in_at          DATETIME NULL,
  check_in_evidence_id BIGINT NULL COMMENT 'Ảnh check-in — đẩy vào evidences để lưu Firebase (UC-85)',
  check_out_at         DATETIME NULL COMMENT 'UC-86',
  note                 VARCHAR(255) NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (attendance_id),
  UNIQUE KEY uq_attendance (plan_id, user_id),
  KEY idx_att_user (user_id),
  CONSTRAINT fk_att_plan     FOREIGN KEY (plan_id) REFERENCES schedule_plans (plan_id),
  CONSTRAINT fk_att_user     FOREIGN KEY (user_id) REFERENCES internal_users (user_id),
  CONSTRAINT fk_att_evidence FOREIGN KEY (check_in_evidence_id) REFERENCES evidences (evidence_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Chấm công theo việc được giao — đầu vào tính lương (Wage Summary)';

-- ============ NHÓM KHẢO SÁT (SurveyView) ============

-- [v2] thêm report_code + các trường đo đạc hiện trường của app
CREATE TABLE survey_reports (
  survey_id    BIGINT NOT NULL AUTO_INCREMENT,
  report_code  VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị KS-001',
  order_id     BIGINT NOT NULL,
  plan_id      BIGINT NULL COMMENT 'Đầu việc Khảo sát liên quan (schedule_plans)',
  evidence_id  BIGINT NULL COMMENT 'Ảnh hiện trường chính (lưu ở evidences)',
  survey_date  DATE NOT NULL COMMENT 'Trường surveyDate',
  location     VARCHAR(255) NOT NULL COMMENT 'Trường location',
  area         DECIMAL(10,2) NULL COMMENT 'Diện tích m2 (trường area)',
  length       DECIMAL(10,2) NULL COMMENT 'Chiều dài m (trường length)',
  width        DECIMAL(10,2) NULL COMMENT 'Chiều rộng m (trường width)',
  entrance     VARCHAR(255) NULL COMMENT 'Lối vào/bốc dỡ (trường entrance)',
  site_constraints    TEXT NULL COMMENT 'Ràng buộc hiện trường (trường siteConstraints)',
  additional_requests TEXT NULL COMMENT 'Yêu cầu phát sinh (trường additionalRequests)',
  proposed_items      TEXT NULL COMMENT 'Thiết bị đề xuất (trường proposedItems)',
  notes        VARCHAR(500) NULL,
  status       ENUM('Nháp','Cần xem xét','Đã nộp','Đã xác nhận') NOT NULL DEFAULT 'Nháp'
               COMMENT '3 trạng thái SurveyView + Đã xác nhận khi Manager confirm (UC-55)',
  reported_by  BIGINT NOT NULL,
  confirmed_by BIGINT NULL,
  confirmed_at DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (survey_id),
  UNIQUE KEY uq_report_code (report_code),
  KEY idx_survey_order (order_id),
  CONSTRAINT fk_survey_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_survey_plan      FOREIGN KEY (plan_id)      REFERENCES schedule_plans (plan_id),
  CONSTRAINT fk_survey_evidence  FOREIGN KEY (evidence_id)  REFERENCES evidences (evidence_id),
  CONSTRAINT fk_survey_reporter  FOREIGN KEY (reported_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_survey_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Trường images của app = evidences với ref_type=SURVEY_REPORT';

-- ============ NHÓM NHÀ CUNG CẤP & MUA SẮM (SuppliersView) ============

-- [v2] thêm supplier_code, service_type, rating; status tiếng Việt
CREATE TABLE suppliers (
  supplier_id   BIGINT NOT NULL AUTO_INCREMENT,
  supplier_code VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị NCC-001',
  supplier_name VARCHAR(200) NOT NULL,
  service_type  VARCHAR(150) NOT NULL COMMENT 'Hoa tươi & Decor / Âm thanh ánh sáng & LED... (option app)',
  contact_person VARCHAR(150) NULL,
  phone         VARCHAR(20)  NULL,
  email         VARCHAR(150) NULL,
  address       VARCHAR(255) NULL,
  rating        TINYINT NULL COMMENT 'Đánh giá 1-5 sao (trường rating)',
  notes         VARCHAR(500) NULL,
  status        ENUM('Hoạt động','Ngừng hoạt động') NOT NULL DEFAULT 'Hoạt động',
  created_by    BIGINT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id),
  UNIQUE KEY uq_supplier_code (supplier_code),
  CONSTRAINT fk_supplier_creator FOREIGN KEY (created_by) REFERENCES internal_users (user_id),
  CONSTRAINT chk_supplier_rating CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- [v2] khớp ProcurementRequest: service_title, estimated_cost, deposit_amount; status tiếng Việt
CREATE TABLE supplier_transactions (
  transaction_id   BIGINT NOT NULL AUTO_INCREMENT,
  transaction_code VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị PR-001',
  supplier_id      BIGINT NOT NULL,
  order_id         BIGINT NOT NULL,
  transaction_type ENUM('Thuê','Mua') NOT NULL DEFAULT 'Thuê',
  service_title    VARCHAR(255) NOT NULL COMMENT 'Trường serviceTitle của app',
  estimated_cost   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Trường estimatedCost',
  deposit_amount   DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Trường depositAmount',
  payment_status   ENUM('Chưa thanh toán','Đã cọc','Đã thanh toán') NOT NULL DEFAULT 'Chưa thanh toán'
                   COMMENT 'UC-60 Record Supplier Payment',
  status           ENUM('Chờ duyệt','Đã duyệt','Đang thực hiện','Hoàn thành','Đã hủy') NOT NULL DEFAULT 'Chờ duyệt'
                   COMMENT 'Đúng 5 trạng thái option của SuppliersView',
  received_by      BIGINT NULL COMMENT 'Leader xác nhận nhận hàng (UC-78)',
  received_at      DATETIME NULL,
  returned_by      BIGINT NULL COMMENT 'Leader xác nhận trả hàng thuê (UC-80)',
  returned_at      DATETIME NULL,
  notes            VARCHAR(500) NULL,
  created_by       BIGINT NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (transaction_id),
  UNIQUE KEY uq_st_code (transaction_code),
  KEY idx_st_supplier (supplier_id),
  KEY idx_st_order (order_id),
  CONSTRAINT fk_st_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
  CONSTRAINT fk_st_order    FOREIGN KEY (order_id)    REFERENCES orders (order_id),
  CONSTRAINT fk_st_creator  FOREIGN KEY (created_by)  REFERENCES internal_users (user_id),
  CONSTRAINT fk_st_receiver FOREIGN KEY (received_by) REFERENCES internal_users (user_id),
  CONSTRAINT fk_st_returner FOREIGN KEY (returned_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE supplier_transaction_items (
  st_item_id     BIGINT NOT NULL AUTO_INCREMENT,
  transaction_id BIGINT NOT NULL,
  item_id        BIGINT NULL,
  item_name      VARCHAR(200) NOT NULL,
  quantity       INT NOT NULL,
  unit_cost      DECIMAL(15,2) NOT NULL,
  subtotal       DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  received_quantity INT NOT NULL DEFAULT 0 COMMENT 'Số thực nhận khi Leader đối chiếu (UC-78)',
  notes          VARCHAR(255) NULL,
  PRIMARY KEY (st_item_id),
  KEY idx_stitem_txn (transaction_id),
  CONSTRAINT fk_stitem_txn  FOREIGN KEY (transaction_id) REFERENCES supplier_transactions (transaction_id) ON DELETE CASCADE,
  CONSTRAINT fk_stitem_item FOREIGN KEY (item_id) REFERENCES items (item_id),
  CONSTRAINT chk_stitem_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM THANH TOÁN & QUYẾT TOÁN (PaymentsView) ============

CREATE TABLE settlements (
  settlement_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id      BIGINT NOT NULL,
  additional_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
  compensation  DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  final_amount  DECIMAL(15,2) NOT NULL COMMENT 'Số tiền còn phải thu = tổng + phụ phí + bồi thường - cọc - giảm',
  payment_method VARCHAR(100) NULL COMMENT 'VD: Chuyển khoản ngân hàng (thủ công)',
  qr_code_url   VARCHAR(500) NULL COMMENT 'URL ảnh QR quyết toán nhúng số tiền, lưu Firebase (UC-90)',
  paid_at       DATETIME NULL COMMENT 'Thời điểm khách thanh toán quyết toán',
  evidence_id   BIGINT NULL COMMENT 'Ảnh minh chứng thanh toán quyết toán (lưu ở evidences, UC-89)',
  status        ENUM('Nháp','Đã thống nhất','Đã yêu cầu','Đã thanh toán','Đã xác nhận') NOT NULL DEFAULT 'Nháp',
  requested_by  BIGINT NULL,
  requested_at  DATETIME NULL,
  confirmed_by  BIGINT NULL,
  confirmed_at  DATETIME NULL,
  notes         VARCHAR(500) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (settlement_id),
  KEY idx_settlement_order (order_id),
  CONSTRAINT fk_settle_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_settle_evidence  FOREIGN KEY (evidence_id)  REFERENCES evidences (evidence_id),
  CONSTRAINT fk_settle_requester FOREIGN KEY (requested_by) REFERENCES internal_users (user_id),
  CONSTRAINT fk_settle_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Quyết toán (Settlement is settled by Order theo ERD)';

-- [v6 — theo ERD] Bảng DEPOSITS (Deposit is paid by Order): yêu cầu & xác nhận đặt cọc.
-- Có cột evidence_id lưu ảnh minh chứng chuyển cọc (đẩy vào evidences -> Firebase).
CREATE TABLE deposits (
  deposit_id    BIGINT NOT NULL AUTO_INCREMENT,
  deposit_code  VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị DEP-001',
  order_id      BIGINT NOT NULL,
  amount        DECIMAL(15,2) NOT NULL COMMENT 'Số tiền cọc (theo chính sách Đặt cọc)',
  due_date      DATE NULL COMMENT 'Hạn đặt cọc',
  payment_date  DATE NULL COMMENT 'Ngày khách chuyển tiền thực tế',
  payment_method VARCHAR(100) NULL COMMENT 'VD: Chuyển khoản ngân hàng (thủ công)',
  qr_code_url   VARCHAR(500) NULL COMMENT 'URL ảnh QR nhúng số tiền, lưu Firebase (UC-70)',
  status        ENUM('Chờ đặt cọc','Thành công','Quá hạn','Đã hủy') NOT NULL DEFAULT 'Chờ đặt cọc',
  evidence_id   BIGINT NULL COMMENT 'Ảnh minh chứng chuyển cọc (lưu ở evidences, UC-71)',
  requested_by  BIGINT NOT NULL COMMENT 'Manager tạo yêu cầu cọc (UC-69)',
  approved_by   BIGINT NULL COMMENT 'Người xác nhận đã nhận cọc',
  approved_at   DATETIME NULL,
  notes         VARCHAR(500) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (deposit_id),
  UNIQUE KEY uq_deposit_code (deposit_code),
  KEY idx_deposit_order (order_id),
  KEY idx_deposit_status (status),
  CONSTRAINT fk_deposit_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_deposit_evidence  FOREIGN KEY (evidence_id)  REFERENCES evidences (evidence_id),
  CONSTRAINT fk_deposit_requester FOREIGN KEY (requested_by) REFERENCES internal_users (user_id),
  CONSTRAINT fk_deposit_approver  FOREIGN KEY (approved_by)  REFERENCES internal_users (user_id),
  CONSTRAINT chk_deposit_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM THU HỒI & XUẤT NHẬP KHO (Staff app — giữ theo Use Case) ============

CREATE TABLE collected_equipment_reports (
  report_id      BIGINT NOT NULL AUTO_INCREMENT,
  order_id       BIGINT NOT NULL,
  report_type    ENUM('Kho công ty','Nhà cung cấp') NOT NULL,
  transaction_id BIGINT NULL,
  status         ENUM('Đã nộp','Đã xác nhận') NOT NULL DEFAULT 'Đã nộp',
  reported_by    BIGINT NOT NULL,
  confirmed_by   BIGINT NULL,
  confirmed_at   DATETIME NULL,
  notes          VARCHAR(500) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (report_id),
  KEY idx_cer_order (order_id),
  CONSTRAINT fk_cer_order     FOREIGN KEY (order_id)       REFERENCES orders (order_id),
  CONSTRAINT fk_cer_txn       FOREIGN KEY (transaction_id) REFERENCES supplier_transactions (transaction_id),
  CONSTRAINT fk_cer_reporter  FOREIGN KEY (reported_by)    REFERENCES internal_users (user_id),
  CONSTRAINT fk_cer_confirmer FOREIGN KEY (confirmed_by)   REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE collected_equipment_report_items (
  cer_item_id    BIGINT NOT NULL AUTO_INCREMENT,
  report_id      BIGINT NOT NULL,
  item_id        BIGINT NOT NULL,
  good_quantity  INT NOT NULL DEFAULT 0,
  damaged_quantity INT NOT NULL DEFAULT 0,
  lost_quantity  INT NOT NULL DEFAULT 0,
  notes          VARCHAR(255) NULL,
  PRIMARY KEY (cer_item_id),
  UNIQUE KEY uq_cer_item (report_id, item_id),
  CONSTRAINT fk_ceritem_report FOREIGN KEY (report_id) REFERENCES collected_equipment_reports (report_id) ON DELETE CASCADE,
  CONSTRAINT fk_ceritem_item   FOREIGN KEY (item_id)   REFERENCES items (item_id),
  CONSTRAINT chk_cer_qty CHECK (good_quantity >= 0 AND damaged_quantity >= 0 AND lost_quantity >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inventory_movements (
  movement_id   BIGINT NOT NULL AUTO_INCREMENT,
  item_id       BIGINT NOT NULL,
  order_id      BIGINT NULL,
  report_id     BIGINT NULL,
  movement_type ENUM('Xuất kho','Nhập kho','Điều chỉnh') NOT NULL,
  quantity      INT NOT NULL,
  performed_by  BIGINT NOT NULL,
  notes         VARCHAR(255) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (movement_id),
  KEY idx_move_item (item_id),
  KEY idx_move_order (order_id),
  KEY idx_move_time (created_at),
  CONSTRAINT fk_move_item      FOREIGN KEY (item_id)      REFERENCES items (item_id),
  CONSTRAINT fk_move_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_move_report    FOREIGN KEY (report_id)    REFERENCES collected_equipment_reports (report_id),
  CONSTRAINT fk_move_performer FOREIGN KEY (performed_by) REFERENCES internal_users (user_id),
  CONSTRAINT chk_move_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ NHÓM CÔNG & LƯƠNG (WagesView) ============

-- [v2] ĐỔI CẤU TRÚC: app tính lương theo TỪNG ĐƠN HÀNG (WageRecord), không theo kỳ tháng
CREATE TABLE wage_records (
  wage_id     BIGINT NOT NULL AUTO_INCREMENT,
  wage_code   VARCHAR(20) NOT NULL COMMENT 'Mã hiển thị LC-001',
  order_id    BIGINT NOT NULL COMMENT 'Đơn hàng phát sinh công (trường orderId)',
  user_id     BIGINT NOT NULL COMMENT 'Nhân viên (app hiển thị staffName qua join)',
  wage_role   ENUM('Setup Nhân sự','Thi công Decor','Kỹ thuật Âm thanh','Leader Điều phối','MC / Ca sĩ') NOT NULL
              COMMENT 'Đúng 5 vai trò option của WagesView (trường role)',
  shifts      INT NOT NULL DEFAULT 1 COMMENT 'Số ca (trường shifts) — đối chiếu bảng attendances',
  wage_rate   DECIMAL(15,2) NOT NULL COMMENT 'Đơn giá/ca (trường wageRate)',
  total_wage  DECIMAL(15,2) GENERATED ALWAYS AS (shifts * wage_rate) STORED
              COMMENT 'Trường totalWage = shifts × wageRate',
  status      ENUM('Nháp','Chờ duyệt','Đã xác nhận','Đã thanh toán') NOT NULL DEFAULT 'Nháp'
              COMMENT 'Đúng 4 trạng thái option của WagesView (UC-66)',
  confirmed_by BIGINT NULL COMMENT 'Manager xác nhận (UC-66)',
  confirmed_at DATETIME NULL,
  notes       VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (wage_id),
  UNIQUE KEY uq_wage_code (wage_code),
  UNIQUE KEY uq_wage_order_user_role (order_id, user_id, wage_role),
  CONSTRAINT fk_wage_order     FOREIGN KEY (order_id)     REFERENCES orders (order_id),
  CONSTRAINT fk_wage_user      FOREIGN KEY (user_id)      REFERENCES internal_users (user_id),
  CONSTRAINT fk_wage_confirmer FOREIGN KEY (confirmed_by) REFERENCES internal_users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- ==================  DỮ LIỆU MẪU (SEED DATA)  ========================
-- Catalog theo danh sách thiết bị THỰC TẾ của doanh nghiệp (đồ cưới hỏi,
-- nhà rạp); 28 nhân sự (1 Admin, 2 Manager, 5 Leader, 20 Technical);
-- địa điểm lắp đặt thực tế trên địa bàn Hà Nội; 1 kho duy nhất
-- (địa chỉ kho: thôn Lai Xá, xã Kim Chung, huyện Hoài Đức, Hà Nội).
-- =====================================================================

-- ---------- 1. NGƯỜI DÙNG: 1 Admin + 2 Manager + 5 Leader + 20 Technical = 28 ----------
-- Hash là placeholder bcrypt của admin123/manager123 — backend thay bằng hash thật.
INSERT INTO internal_users (user_id, username, password_hash, full_name, email, phone, address, role, status, avatar_url, bio) VALUES
(1, 'binhnguyen.admin', '$2a$10$hrmzWv0ZdLH6PxLT1/Cc6ulMmumg2M2x99dp/8ihMK7Vd6tXmyEee', 'Nguyễn Thanh Bình', 'binhnguyen.admin@binhnguyenwems.vn', '0903111222', 'Phường Dịch Vọng, quận Cầu Giấy, Hà Nội', 'Quản trị viên', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Fbinhnguyen.jpg?alt=media', 'Quản trị hệ thống WEMS'),
(2, 'trinhtran.mgr', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Trần Tuyết Trinh', 'vutuyettrinh2004@gmail.com', '0903222333', 'Phường Mỹ Đình 1, quận Nam Từ Liêm, Hà Nội', 'Quản lý', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Ftrinhtran.jpg?alt=media', 'Quản lý vận hành sự kiện'),
(3, 'huy.mgr', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Lê Quang Huy', 'huy.mgr@binhnguyenwems.vn', '0903333444', 'Phường Quan Hoa, quận Cầu Giấy, Hà Nội', 'Quản lý', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Fhuy.jpg?alt=media', 'Quản lý kho & cung ứng'),
(4, 'tuan.leader', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Trần Anh Tuấn', 'tuan.leader@binhnguyenwems.vn', '0904445555', 'Xã An Khánh, huyện Hoài Đức, Hà Nội', 'Trưởng nhóm', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Ftuan.jpg?alt=media', 'Trưởng nhóm thi công lắp đặt'),
(5, 'tu.leader', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Vũ Đình Tú', 'tu.leader@binhnguyenwems.vn', '0904445556', 'Phường Phú Diễn, quận Bắc Từ Liêm, Hà Nội', 'Trưởng nhóm', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Ftu.jpg?alt=media', 'Trưởng nhóm thi công lắp đặt'),
(6, 'son.leader', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Ngô Văn Sơn', 'son.leader@binhnguyenwems.vn', '0904445557', 'Xã Kim Chung, huyện Hoài Đức, Hà Nội', 'Trưởng nhóm', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Fson.jpg?alt=media', 'Trưởng nhóm thi công lắp đặt'),
(7, 'dat.leader', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Đặng Quốc Đạt', 'dat.leader@binhnguyenwems.vn', '0904445558', 'Phường Tây Tựu, quận Bắc Từ Liêm, Hà Nội', 'Trưởng nhóm', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Fdat.jpg?alt=media', 'Trưởng nhóm thi công lắp đặt'),
(8, 'long.leader', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Phùng Văn Long', 'long.leader@binhnguyenwems.vn', '0904445559', 'Xã Vân Canh, huyện Hoài Đức, Hà Nội', 'Trưởng nhóm', 'Hoạt động', 'https://firebasestorage.googleapis.com/v0/b/wems/o/avatars%2Flong.jpg?alt=media', 'Trưởng nhóm thi công lắp đặt'),
(9, 'thai.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Phạm Hồng Thái', 'thai.tech@binhnguyenwems.vn', '09120300', 'Phường Cổ Nhuế 1, quận Bắc Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(10, 'nam.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Lê Hoàng Nam', 'nam.tech@binhnguyenwems.vn', '09120301', 'Phường Xuân Phương, quận Nam Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(11, 'hainguyen.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Nguyễn Hải', 'hainguyen.tech@binhnguyenwems.vn', '09120302', 'Phường Mai Dịch, quận Cầu Giấy, Hà Nội', 'Nhân viên kỹ thuật', 'Tạm khóa', NULL, 'Tài khoản bị tạm khóa — test luồng chặn đăng nhập'),
(12, 'cuong.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Đỗ Mạnh Cường', 'cuong.tech@binhnguyenwems.vn', '09120303', 'Xã Đức Thượng, huyện Hoài Đức, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(13, 'hieu.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Bùi Trung Hiếu', 'hieu.tech@binhnguyenwems.vn', '09120304', 'Phường Yên Nghĩa, quận Hà Đông, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(14, 'quan.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Nguyễn Minh Quân', 'quan.tech@binhnguyenwems.vn', '09120305', 'Phường Cổ Nhuế 1, quận Bắc Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(15, 'duc.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Trần Văn Đức', 'duc.tech@binhnguyenwems.vn', '09120306', 'Phường Xuân Phương, quận Nam Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(16, 'kien.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Hoàng Văn Kiên', 'kien.tech@binhnguyenwems.vn', '09120307', 'Phường Mai Dịch, quận Cầu Giấy, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(17, 'phong.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Đinh Thanh Phong', 'phong.tech@binhnguyenwems.vn', '09120308', 'Xã Đức Thượng, huyện Hoài Đức, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(18, 'tam.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Lưu Văn Tám', 'tam.tech@binhnguyenwems.vn', '09120309', 'Phường Yên Nghĩa, quận Hà Đông, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(19, 'hung.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Nguyễn Việt Hùng', 'hung.tech@binhnguyenwems.vn', '09120310', 'Phường Cổ Nhuế 1, quận Bắc Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(20, 'toan.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Phan Văn Toàn', 'toan.tech@binhnguyenwems.vn', '09120311', 'Phường Xuân Phương, quận Nam Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(21, 'binh.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Vũ Thanh Bình', 'binh.tech@binhnguyenwems.vn', '09120312', 'Phường Mai Dịch, quận Cầu Giấy, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(22, 'dai.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Nguyễn Văn Đại', 'dai.tech@binhnguyenwems.vn', '09120313', 'Xã Đức Thượng, huyện Hoài Đức, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(23, 'khoa.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Lý Đăng Khoa', 'khoa.tech@binhnguyenwems.vn', '09120314', 'Phường Yên Nghĩa, quận Hà Đông, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(24, 'thanh.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Trịnh Quang Thành', 'thanh.tech@binhnguyenwems.vn', '09120315', 'Phường Cổ Nhuế 1, quận Bắc Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(25, 'vinh.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Mai Văn Vinh', 'vinh.tech@binhnguyenwems.vn', '09120316', 'Phường Xuân Phương, quận Nam Từ Liêm, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(26, 'lam.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Hồ Tùng Lâm', 'lam.tech@binhnguyenwems.vn', '09120317', 'Phường Mai Dịch, quận Cầu Giấy, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(27, 'sang.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Chu Văn Sáng', 'sang.tech@binhnguyenwems.vn', '09120318', 'Xã Đức Thượng, huyện Hoài Đức, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt'),
(28, 'tien.tech', '$2a$10$eBfnpq97VVorXWNjTku..e6XR1r1xb60V5XloVoJdqKzRu9qZ4dCi', 'Ngô Minh Tiến', 'tien.tech@binhnguyenwems.vn', '09120319', 'Phường Yên Nghĩa, quận Hà Đông, Hà Nội', 'Nhân viên kỹ thuật', 'Hoạt động', NULL, 'Nhân viên kỹ thuật lắp đặt');

-- ---------- 2. DEVICE TOKENS (FCM) ----------
INSERT INTO device_tokens (user_id, fcm_token, platform, device_name, is_active, last_used_at) VALUES
(2, 'fcm-token-trinh-web-001', 'web', 'Chrome trên laptop quản lý', TRUE, '2026-07-04 09:15:00'),
(4, 'fcm-token-tuan-android-001', 'android', 'Samsung Galaxy A54', TRUE, '2026-07-04 07:30:00'),
(9, 'fcm-token-thai-android-001', 'android', 'Xiaomi Redmi Note 12', TRUE, '2026-07-03 18:00:00');

-- ---------- 3. LOẠI -> CHI TIẾT LOẠI -> ITEM -> THÔNG TIN TỪNG LOẠI (theo sơ đồ) ----------
INSERT INTO item_categories (category_id, category_name) VALUES
(1, 'Bàn ghế'),
(2, 'Khăn bàn & Runner'),
(3, 'Áo ghế & Nơ ghế'),
(4, 'Ấm chén'),
(5, 'Quạt'),
(6, 'Khung nhà rạp'),
(7, 'Bạt che'),
(8, 'Rèm & Quây trần'),
(9, 'Đèn trang trí'),
(10, 'Thảm'),
(11, 'Cổng hoa'),
(12, 'Hoa giả'),
(13, 'Phụ kiện bàn gallery'),
(14, 'Phông cưới hỏi & Sân khấu'),
(15, 'Loa đài');

INSERT INTO item_types (type_id, category_id, type_name) VALUES
(1, 1, 'Bàn ghế chavari'),
(2, 1, 'Bàn ghế nhỏ'),
(3, 1, 'Bàn lẻ'),
(4, 1, 'Ghế lẻ'),
(5, 2, 'Khăn bàn'),
(6, 2, 'Runner'),
(7, 3, 'Áo ghế'),
(8, 3, 'Nơ ghế'),
(9, 4, 'Bộ ấm chén'),
(10, 5, 'Quạt công nghiệp'),
(11, 5, 'Quạt hơi nước'),
(12, 6, 'Thanh sắt'),
(13, 6, 'Cột chống & Kèo'),
(14, 6, 'Mẩu sắt nối'),
(15, 7, 'Bạt trắng'),
(16, 8, 'Rèm'),
(17, 8, 'Quây trần'),
(18, 9, 'Đèn trang trí'),
(19, 10, 'Thảm'),
(20, 11, 'Khung cổng hoa'),
(21, 11, 'Cổng hoa vàng'),
(22, 11, 'Cổng hoa hồng'),
(23, 12, 'Hoa giả'),
(24, 13, 'Hòm tiền mừng'),
(25, 13, 'Phụ kiện trang trí gallery'),
(26, 14, 'Phông cưới hỏi & Sân khấu'),
(27, 15, 'Hệ thống loa đài');

-- 72 item: 67 thiết bị lẻ + 3 bộ trọn gói + hoa vàng (bổ sung cho Cổng hoa vàng)
INSERT INTO items (item_id, item_code, item_name, type_id, unit, rental_price, price_valid_from, price_valid_to, status, created_by) VALUES
(1, 'BAN-TO', 'Bàn loại to', 3, 'Cái', 25000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(2, 'BAN-NHO', 'Bàn loại nhỏ', 3, 'Cái', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(3, 'GHE-DAU', 'Ghế đẩu', 4, 'Cái', 3000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(4, 'GHE-INOX', 'Ghế inox', 4, 'Cái', 5000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(5, 'GHE-CHIAVARI', 'Ghế chiavari', 4, 'Cái', 12000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(6, 'KHAN-DO', 'Khăn bàn màu đỏ', 5, 'Chiếc', 10000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(7, 'KHAN-VANG', 'Khăn bàn màu vàng', 5, 'Chiếc', 10000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(8, 'KHAN-TRANG', 'Khăn bàn màu trắng', 5, 'Chiếc', 10000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(9, 'RUNNER', 'Runner (dải vải trải dọc giữa bàn)', 6, 'Chiếc', 8000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(10, 'AO-GHE', 'Áo ghế', 7, 'Chiếc', 4000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(11, 'NO-GHE', 'Nơ ghế', 8, 'Chiếc', 2000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(12, 'BO-COC-CHEN', 'Bộ cốc, chén, ấm nước', 9, 'Bộ', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(13, 'QUAT-CN', 'Quạt công nghiệp', 10, 'Cái', 80000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(14, 'QUAT-HOI-NUOC', 'Quạt hơi nước', 11, 'Cái', 150000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(15, 'SAT-2M5', 'Thanh sắt 2,5m', 12, 'Thanh', 8000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(16, 'SAT-3M', 'Thanh sắt 3m', 12, 'Thanh', 10000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(17, 'SAT-4M', 'Thanh sắt 4m', 12, 'Thanh', 12000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(18, 'COT-CHONG', 'Cột chống', 13, 'Cái', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(19, 'KEO-RAP', 'Kèo', 13, 'Cái', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(20, 'SAT-LAP-NOC', 'Thanh sắt lắp nóc', 12, 'Thanh', 12000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(21, 'NOI-GOC', 'Mẩu sắt nối góc', 14, 'Cái', 3000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(22, 'NOI-DAU-CONG', 'Mẩu sắt nối dấu cộng (+)', 14, 'Cái', 3000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(23, 'NOI-2-THANH', 'Mẩu nối 2 thanh sắt', 14, 'Cái', 3000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(24, 'NOI-XA-TREN', 'Mẩu nối thanh xà trên', 14, 'Cái', 3000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(25, 'NOI-LAP-NOC', 'Mẩu lắp nóc', 14, 'Cái', 4000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(26, 'NOI-LAP-KEO', 'Mẩu lắp kèo', 14, 'Cái', 4000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(27, 'BAT-3X4', 'Bạt trắng 3x4m', 15, 'Tấm', 40000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(28, 'BAT-4X3', 'Bạt trắng 4x3m', 15, 'Tấm', 40000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(29, 'BAT-4X4', 'Bạt trắng 4x4m', 15, 'Tấm', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(30, 'BAT-4X5', 'Bạt trắng 4x5m', 15, 'Tấm', 60000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(31, 'BAT-6X3', 'Bạt trắng 6x3m', 15, 'Tấm', 60000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(32, 'BAT-6X4', 'Bạt trắng 6x4m', 15, 'Tấm', 70000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(33, 'BAT-6X5', 'Bạt trắng 6x5m', 15, 'Tấm', 80000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(34, 'BAT-6X7', 'Bạt trắng 6x7m', 15, 'Tấm', 100000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(35, 'BAT-6X9', 'Bạt trắng 6x9m', 15, 'Tấm', 120000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(36, 'BAT-8X3', 'Bạt trắng 8x3m', 15, 'Tấm', 80000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(37, 'BAT-8X4', 'Bạt trắng 8x4m', 15, 'Tấm', 100000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(38, 'BAT-8X5', 'Bạt trắng 8x5m', 15, 'Tấm', 120000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(39, 'REM-QUAY', 'Rèm quây xung quanh (đủ màu)', 16, 'Bộ', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(40, 'REM-TAO-SONG', 'Rèm tạo sóng', 16, 'Bộ', 70000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(41, 'QUAY-TRAN', 'Quây trần nhà', 17, 'Bộ', 100000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(42, 'DEN-NHAP-NHAY', 'Đèn nhấp nháy', 18, 'Dây', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(43, 'DEN-CHUM', 'Đèn chùm', 18, 'Cái', 100000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(44, 'DEN-CHAY-DOC-20M', 'Đèn chạy dọc 20m', 18, 'Dây', 120000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(45, 'DEN-CHIM', 'Đèn chim', 18, 'Cái', 30000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(46, 'THAM-CO', 'Thảm cỏ', 19, 'Tấm', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(47, 'THAM-DO', 'Thảm đỏ', 19, 'Cuộn', 80000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(48, 'CONG-HOA-TRON', 'Khung cổng hoa hình tròn', 20, 'Bộ', 200000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(49, 'CONG-HOA-VUONG', 'Khung cổng hoa hình vuông', 20, 'Bộ', 200000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(50, 'CONG-HOA-LUC-GIAC', 'Khung cổng hoa hình lục giác', 20, 'Bộ', 250000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(51, 'CONG-VOM', 'Cổng vòm sắt/nhựa gắn hoa', 20, 'Bộ', 250000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(52, 'HOA-GIA-TRANG', 'Hoa giả tone trắng (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(53, 'HOA-GIA-HONG', 'Hoa giả tone hồng (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(54, 'HOA-GIA-DO', 'Hoa giả tone đỏ (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(55, 'HOA-GIA-PASTEL', 'Hoa giả tone pastel (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(56, 'HOA-GIA-SEN-DA', 'Hoa giả tone sen đá (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(57, 'KHUNG-ANH', 'Khung ảnh trang trí', 25, 'Cái', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(58, 'HOM-TIEN-NHA', 'Hòm tiền mừng hình ngôi nhà', 24, 'Cái', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(59, 'HOM-TIEN-THU', 'Hòm tiền mừng hình hòm thư', 24, 'Cái', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(60, 'HOM-TIEN-MICA', 'Hòm tiền mừng mica trong suốt', 24, 'Cái', 50000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(61, 'BINH-HOA-TT', 'Bình hoa thủy tinh (đủ kích thước)', 25, 'Cái', 15000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(62, 'KHAY-3-TANG', 'Khay 3 tầng để bánh kẹo', 25, 'Cái', 25000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(63, 'CHU-PHONG', 'Chữ trang trí trên phông', 26, 'Bộ', 100000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(64, 'DEN-SAN-KHAU', 'Đèn sân khấu', 26, 'Cái', 120000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(65, 'TRAP-CUOI-HOI', 'Trap ăn cưới hỏi', 26, 'Bộ', 150000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(66, 'PHONG-QUAY', 'Phông quây', 26, 'Bộ', 200000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(67, 'LOA-DAI', 'Hệ thống loa đài', 27, 'Bộ', 1500000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(68, 'BO-BAN-GHE-CHAVARI', 'Bộ bàn ghế chavari (1 bàn to + 6 ghế chiavari)', 1, 'Bộ', 95000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(69, 'BO-BAN-GHE-NHO', 'Bộ bàn ghế nhỏ (1 bàn nhỏ + 6 ghế đẩu)', 2, 'Bộ', 30000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(70, 'HOA-GIA-VANG', 'Hoa giả tone vàng (cụm/dải)', 23, 'Cụm', 20000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(71, 'CONG-HOA-VANG-SET', 'Cổng hoa vàng (khung vòm + hoa giả tone vàng)', 21, 'Bộ', 400000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1),
(72, 'CONG-HOA-HONG-SET', 'Cổng hoa hồng (khung vòm + hoa giả tone hồng)', 22, 'Bộ', 400000, '2026-01-01', '2026-12-31', 'Đang hoạt động', 1);

-- Thông tin từng loại: cấu thành của các chi tiết loại dạng BỘ ("có thể là 1" dòng trở lên)
INSERT INTO item_type_specs (type_id, component_item_id, component_name, quantity, note) VALUES
(1, 1, 'Bàn chavari (bàn loại to)', 1, 'Theo sơ đồ: 1 bàn chavari và 6 ghế lớn (chavari)'),
(1, 5, 'Ghế lớn (chavari)', 6, NULL),
(2, 2, 'Bàn loại nhỏ', 1, NULL),
(2, 3, 'Ghế đẩu', 6, NULL),
(21, 51, 'Khung cổng vòm', 1, NULL),
(21, 70, 'Hoa giả tone vàng', 12, 'Cắm sẵn thành cụm phủ khung'),
(22, 51, 'Khung cổng vòm', 1, NULL),
(22, 53, 'Hoa giả tone hồng', 12, 'Cắm sẵn thành cụm phủ khung'),
(9, 12, 'Ấm nước', 1, 'Mỗi bộ gồm 1 ấm + 6 chén + 6 cốc'),
(9, 12, 'Chén', 6, NULL),
(9, 12, 'Cốc', 6, NULL);

-- ---------- 5. TỒN KHO (1 kho duy nhất; khả dụng tự tính; giữ chỗ sinh từ đơn) ----------
INSERT INTO inventory (item_id, quantity_total, quantity_damaged, quantity_reserved, updated_by) VALUES
(1, 80, 2, 30, 1),
(2, 60, 0, 20, 1),
(3, 500, 15, 0, 1),
(4, 400, 10, 200, 1),
(5, 400, 5, 300, 1),
(6, 150, 4, 0, 1),
(7, 150, 0, 0, 1),
(8, 150, 6, 30, 1),
(9, 100, 0, 0, 1),
(10, 500, 20, 300, 1),
(11, 600, 0, 300, 1),
(12, 200, 8, 0, 1),
(13, 30, 2, 0, 1),
(14, 12, 1, 0, 1),
(15, 300, 5, 0, 1),
(16, 400, 8, 60, 1),
(17, 200, 4, 0, 1),
(18, 150, 3, 0, 1),
(19, 120, 2, 0, 1),
(20, 150, 0, 0, 1),
(21, 250, 5, 0, 1),
(22, 200, 0, 0, 1),
(23, 300, 6, 0, 1),
(24, 200, 0, 0, 1),
(25, 150, 2, 0, 1),
(26, 150, 0, 0, 1),
(27, 15, 1, 0, 1),
(28, 12, 0, 0, 1),
(29, 15, 0, 0, 1),
(30, 15, 1, 0, 1),
(31, 10, 0, 0, 1),
(32, 12, 0, 0, 1),
(33, 12, 1, 0, 1),
(34, 10, 0, 0, 1),
(35, 10, 2, 6, 1),
(36, 8, 0, 0, 1),
(37, 8, 0, 0, 1),
(38, 8, 1, 0, 1),
(39, 40, 2, 0, 1),
(40, 20, 0, 0, 1),
(41, 15, 1, 0, 1),
(42, 100, 5, 0, 1),
(43, 20, 1, 0, 1),
(44, 15, 0, 0, 1),
(45, 50, 2, 0, 1),
(46, 30, 2, 0, 1),
(47, 15, 1, 2, 1),
(48, 6, 0, 0, 1),
(49, 5, 0, 0, 1),
(50, 4, 0, 0, 1),
(51, 8, 1, 1, 1),
(52, 60, 0, 0, 1),
(53, 60, 0, 0, 1),
(54, 60, 2, 0, 1),
(55, 60, 0, 20, 1),
(56, 40, 0, 0, 1),
(57, 40, 1, 0, 1),
(58, 10, 0, 0, 1),
(59, 10, 0, 0, 1),
(60, 12, 1, 0, 1),
(61, 80, 4, 0, 1),
(62, 60, 2, 0, 1),
(63, 20, 0, 0, 1),
(64, 24, 2, 4, 1),
(65, 10, 0, 0, 1),
(66, 15, 1, 1, 1),
(67, 5, 0, 2, 1),
(68, 40, 0, 0, 1),
(69, 50, 0, 0, 1),
(70, 60, 0, 0, 1),
(71, 4, 0, 0, 1),
(72, 4, 0, 1, 1);

-- ---------- 6. CHÍNH SÁCH ----------
INSERT INTO business_policies (policy_id, policy_code, policy_name, policy_type, description, policy_value, unit, is_active, updated_by) VALUES
(1, 'POL-DEP-30',  'Đặt cọc tối thiểu 30% giá trị đơn',            'Đặt cọc',    'Khách hàng đặt cọc 30% khi xác nhận đơn hàng.',       30,     '%',   TRUE, 1),
(2, 'POL-CAN-07',  'Hủy đơn trước sự kiện 7 ngày hoàn cọc 100%',   'Hủy đơn',    'Hủy trước 7 ngày: hoàn toàn bộ cọc; sau đó mất cọc.',  7,      'Ngày', TRUE, 1),
(3, 'POL-COM-100', 'Bồi thường 100% giá trị thiết bị hư hỏng/mất', 'Bồi thường', 'Theo giá trị thiết bị tại thời điểm sự kiện.',         100,    '%',   TRUE, 1),
(4, 'POL-FEE-OT',  'Phụ phí phát sinh ngoài giờ',                  'Phụ phí',    'Phụ phí cố định mỗi giờ phát sinh sau 22h.',           200000, 'VNĐ', TRUE, 1),
(5, 'POL-WAGE-CA', 'Đơn giá công chuẩn mỗi ca kỹ thuật',           'Lương',      'Đơn giá tham chiếu khi lập bảng công.',                350000, 'VNĐ', TRUE, 1);

-- ---------- 7. KHÁCH HÀNG (địa bàn Hà Nội) ----------
INSERT INTO customers (customer_id, customer_code, customer_name, phone, email, address, notes, status, created_by) VALUES
(1, 'KH-001', 'Nguyễn Văn An',   '0912345678', 'an.nguyen@gmail.com',  'Thôn Ngãi Cầu, xã An Khánh, huyện Hoài Đức, Hà Nội', 'Đám cưới con trai — khách quen', 'Hoạt động', 2),
(2, 'KH-002', 'Trần Minh Quân',  '0987654321', 'quan.tran@gmail.com',  'Ngõ 68 Xuân Đỉnh, quận Bắc Từ Liêm, Hà Nội',        'Yêu cầu decor tông đỏ truyền thống', 'Hoạt động', 2),
(3, 'KH-003', 'Công ty TNHH Sao Việt', '0243123456', 'contact@saoviet.vn', 'Tầng 5, tòa nhà CTM, 299 Cầu Giấy, quận Cầu Giấy, Hà Nội', 'Khách doanh nghiệp — hội nghị định kỳ', 'Hoạt động', 3);

-- ---------- 8. BÁO GIÁ ----------
INSERT INTO quotations (quotation_id, quotation_code, customer_id, version, subtotal, discount_total, total_amount, status, notes, created_by, created_at) VALUES
(1, 'BG-2026-001', 1, 'v1.0', 18280000, 0, 18280000, 'Đã duyệt', 'Đám cưới 30 mâm tại tư gia — trọn gói nhà rạp + bàn ghế + loa đài', 2, '2026-06-20 09:00:00'),
(2, 'BG-2026-002', 3, 'v1.0', 9780000, 0, 9780000, 'Nháp',     'Hội nghị khách hàng 200 ghế tại nhà văn hóa', 2, '2026-07-01 10:30:00');

INSERT INTO quotation_items (quotation_id, item_id, item_name, category, unit, quantity, price, discount) VALUES
(1, 1, 'Bàn loại to', 'Bàn ghế', 'Cái', 30, 25000, 0),
(1, 5, 'Ghế chiavari', 'Bàn ghế', 'Cái', 300, 12000, 0),
(1, 8, 'Khăn bàn màu trắng', 'Khăn bàn & Runner', 'Chiếc', 30, 10000, 0),
(1, 10, 'Áo ghế', 'Áo ghế & Nơ ghế', 'Chiếc', 300, 4000, 0),
(1, 11, 'Nơ ghế', 'Áo ghế & Nơ ghế', 'Chiếc', 300, 2000, 0),
(1, 51, 'Cổng vòm sắt/nhựa gắn hoa', 'Cổng hoa', 'Bộ', 1, 250000, 0),
(1, 55, 'Hoa giả tone pastel (cụm/dải)', 'Hoa giả', 'Cụm', 20, 20000, 0),
(1, 67, 'Hệ thống loa đài', 'Loa đài', 'Bộ', 1, 1500000, 0),
(1, 66, 'Phông quây', 'Phông cưới hỏi & Sân khấu', 'Bộ', 1, 200000, 0),
(1, 47, 'Thảm đỏ', 'Thảm', 'Cuộn', 2, 80000, 0),
(1, 16, 'Thanh sắt 3m', 'Khung nhà rạp', 'Thanh', 60, 10000, 0),
(1, 35, 'Bạt trắng 6x9m', 'Bạt che', 'Tấm', 6, 120000, 0),
(1, NULL, 'Nhân công lắp đặt nhà rạp & setup trọn gói', NULL, 'Gói', 1, 8000000, 0),
(2, 4, 'Ghế inox', 'Bàn ghế', 'Cái', 200, 5000, 0),
(2, 2, 'Bàn loại nhỏ', 'Bàn ghế', 'Cái', 20, 15000, 0),
(2, 67, 'Hệ thống loa đài', 'Loa đài', 'Bộ', 1, 1500000, 0),
(2, 64, 'Đèn sân khấu', 'Phông cưới hỏi & Sân khấu', 'Cái', 4, 120000, 0),
(2, 14, 'Quạt hơi nước', 'Quạt', 'Cái', 10, 150000, 0),
(2, NULL, 'Nhân công setup hội nghị', NULL, 'Gói', 1, 5000000, 0);

-- ---------- 9. ĐƠN HÀNG (địa điểm lắp đặt tại Hà Nội) ----------
INSERT INTO orders (order_id, order_code, customer_id, quotation_id, policy_id, event_type, event_name, event_date, location, guest_count, total_amount, payment_status, order_status, notes, created_by) VALUES
(1, 'DH-2026-001', 1, 1, 1, 'Tiệc Cưới Trọn Gói',  'Đám cưới An & Ngọc (30 mâm)',      '2026-07-14', 'Tư gia, thôn Ngãi Cầu, xã An Khánh, huyện Hoài Đức, Hà Nội', 300, 18280000, 'Đã cọc',          'Đã xác nhận', 'Dựng rạp từ chiều hôm trước', 2),
(2, 'DH-2026-002', 3, 2, 1, 'Hội Nghị Khách Hàng', 'Hội nghị khách hàng Sao Việt Q3',  '2026-08-05', 'Nhà văn hóa phường Dịch Vọng Hậu, quận Cầu Giấy, Hà Nội',    200, 9780000, 'Chưa thanh toán', 'Mới',         'Chờ khách duyệt báo giá', 2),
(3, 'DH-2026-003', 2, NULL, 1, 'Tiệc Đính Hôn',    'Lễ đính hôn Quân & Hà',            '2026-06-28', 'Tư gia, ngõ 68 Xuân Đỉnh, quận Bắc Từ Liêm, Hà Nội',           80, 5830000, 'Đã thanh toán',   'Hoàn thành',  'Đã quyết toán đầy đủ', 2);

INSERT INTO order_items (order_id, item_id, quantity, unit_price, source, prepared_qty, prepared_by, notes) VALUES
(1, 1, 30, 25000, 'Kho nội bộ', 0, NULL, NULL),
(1, 5, 300, 12000, 'Kho nội bộ', 0, NULL, NULL),
(1, 8, 30, 10000, 'Kho nội bộ', 0, NULL, NULL),
(1, 10, 300, 4000, 'Kho nội bộ', 0, NULL, NULL),
(1, 11, 300, 2000, 'Kho nội bộ', 0, NULL, NULL),
(1, 51, 1, 250000, 'Kho nội bộ', 0, NULL, NULL),
(1, 55, 20, 20000, 'Kho nội bộ', 0, NULL, NULL),
(1, 67, 1, 1500000, 'Kho nội bộ', 0, NULL, NULL),
(1, 66, 1, 200000, 'Kho nội bộ', 0, NULL, NULL),
(1, 47, 2, 80000, 'Kho nội bộ', 0, NULL, NULL),
(1, 16, 60, 10000, 'Kho nội bộ', 60, 4, NULL),
(1, 35, 6, 120000, 'Kho nội bộ', 6, 4, NULL),
(2, 4, 200, 5000, 'Kho nội bộ', 0, NULL, NULL),
(2, 2, 20, 15000, 'Kho nội bộ', 0, NULL, NULL),
(2, 67, 1, 1500000, 'Kho nội bộ', 0, NULL, NULL),
(2, 64, 4, 120000, 'Kho nội bộ', 0, NULL, NULL),
(2, 14, 10, 150000, 'Nhà cung cấp', 0, NULL, 'Kho chỉ còn 11 khả dụng — thuê thêm từ NCC'),
(3, 5, 60, 12000, 'Kho nội bộ', 60, 5, NULL),
(3, 1, 6, 25000, 'Kho nội bộ', 6, 5, NULL),
(3, 6, 6, 10000, 'Kho nội bộ', 6, 5, NULL),
(3, 48, 1, 200000, 'Kho nội bộ', 1, 5, NULL),
(3, 54, 10, 20000, 'Kho nội bộ', 10, 5, NULL),
(3, 67, 1, 1500000, 'Kho nội bộ', 1, 5, NULL);

-- ---------- 10. CẢNH BÁO ĐƠN (Audit) ----------
INSERT INTO order_warnings (order_id, content, is_resolved, resolved_by, resolved_at) VALUES
(1, 'Số lượng ghế chiavari đặt (300) chiếm phần lớn khả dụng của kho — cần khóa hàng sớm.', FALSE, NULL, NULL),
(2, 'Đơn chưa có tiền cọc dù đã quá 3 ngày từ khi tạo báo giá.', FALSE, NULL, NULL),
(3, 'Chênh lệch nhỏ giữa báo giá miệng và giá trị quyết toán.', TRUE, 1, '2026-06-30 09:00:00');

-- ---------- 11. MINH CHỨNG (upload trước, các bảng nghiệp vụ trỏ evidence_id về đây) ----------
INSERT INTO evidences (evidence_id, file_url, description, uploaded_by) VALUES
(1, 'https://firebasestorage.googleapis.com/v0/b/wems/o/checkin%2Fsp001-tuan.jpg?alt=media',   'Ảnh check-in đầu việc Khảo sát — Trần Anh Tuấn', 4),
(2, 'https://firebasestorage.googleapis.com/v0/b/wems/o/checkin%2Fsp001-thai.jpg?alt=media',   'Ảnh check-in đầu việc Khảo sát — Phạm Hồng Thái', 9),
(3, 'https://firebasestorage.googleapis.com/v0/b/wems/o/checkin%2Fsp005-tu.jpg?alt=media',     'Ảnh check-in đầu việc Thu hồi — Vũ Đình Tú', 5),
(4, 'https://firebasestorage.googleapis.com/v0/b/wems/o/handover%2Fsp001-hoanthanh.jpg?alt=media', 'Ảnh bàn giao kết quả khảo sát hiện trường', 4),
(5, 'https://firebasestorage.googleapis.com/v0/b/wems/o/surveys%2Fks001-hientruong.jpg?alt=media', 'Ảnh hiện trường sân dựng rạp (khảo sát KS-001)', 4),
(6, 'https://firebasestorage.googleapis.com/v0/b/wems/o/handover%2Fsp005-thuhoi.jpg?alt=media','Ảnh bàn giao hoàn tất thu hồi sau lễ đính hôn', 5),
(7, 'https://firebasestorage.googleapis.com/v0/b/wems/o/deposits%2Fdep001-unc.jpg?alt=media',  'Ủy nhiệm chi đặt cọc đơn DH-2026-001', 2),
(8, 'https://firebasestorage.googleapis.com/v0/b/wems/o/settlements%2Fpay001-bienlai.jpg?alt=media', 'Biên lai thanh toán quyết toán đơn DH-2026-003', 5);

-- ---------- 12. DANH MỤC ĐẦU CÔNG VIỆC + CHI TIẾT GIAO VIỆC + CHẤM CÔNG ----------
INSERT INTO work_tasks (task_id, task_code, task_name, description) VALUES
(1, 'DV-KS', 'Khảo sát',   'Khảo sát hiện trường trước sự kiện'),
(2, 'DV-GS', 'Giám sát',   'Giám sát vận hành trong sự kiện'),
(3, 'DV-CB', 'Chuẩn bị',   'Soạn hàng tại kho theo danh sách thiết bị của đơn'),
(4, 'DV-VC', 'Vận chuyển', 'Vận chuyển thiết bị đến/đi khỏi địa điểm'),
(5, 'DV-TC', 'Thi công',   'Dựng rạp, lắp đặt, setup'),
(6, 'DV-BG', 'Bàn giao',   'Bàn giao mặt bằng/thiết bị cho khách'),
(7, 'DV-TH', 'Thu hồi',    'Thu hồi thiết bị sau sự kiện, phân loại tốt/hỏng/mất'),
(8, 'DV-HT', 'Hoàn trả',   'Hoàn trả thiết bị về kho hoặc trả nhà cung cấp');

INSERT INTO schedule_plans (plan_id, plan_code, order_id, task_id, assigned_to, start_time, end_time, location, status, evidence_id, notes, created_by) VALUES
(1, 'SP-001', 1, 1, 4, '2026-07-05 08:00:00', '2026-07-05 09:30:00', 'Tư gia, thôn Ngãi Cầu, xã An Khánh, Hoài Đức, Hà Nội', 'Hoàn thành',     4,    'Đo sân dựng rạp 6x9, kiểm tra nguồn điện', 2),
(2, 'SP-002', 1, 3, 4, '2026-07-13 08:00:00', '2026-07-13 12:00:00', 'Kho Lai Xá, xã Kim Chung, Hoài Đức, Hà Nội',           'Đang thực hiện', NULL, 'Soạn hàng theo danh sách thiết bị của đơn DH-2026-001', 2),
(3, 'SP-003', 1, 4, 5, '2026-07-13 13:00:00', '2026-07-13 16:00:00', 'Kho Lai Xá → thôn Ngãi Cầu, An Khánh, Hoài Đức',       'Đã xác nhận',    NULL, 'Xe tải 3,5 tấn, đi 2 chuyến', 2),
(4, 'SP-004', 1, 5, 4, '2026-07-13 16:00:00', '2026-07-13 21:00:00', 'Tư gia, thôn Ngãi Cầu, xã An Khánh, Hoài Đức, Hà Nội', 'Đã xác nhận',    NULL, 'Dựng khung 6x9 x2 gian, căng bạt, setup 30 mâm', 2),
(5, 'SP-005', 3, 7, 5, '2026-06-28 21:00:00', '2026-06-28 23:30:00', 'Ngõ 68 Xuân Đỉnh, quận Bắc Từ Liêm, Hà Nội',           'Hoàn thành',     6,    'Thu hồi ngay sau tiệc, phân loại tốt/hỏng/mất', 2),
(6, 'SP-006', 1, 2, 6, '2026-07-14 09:00:00', '2026-07-14 15:00:00', 'Tư gia, thôn Ngãi Cầu, xã An Khánh, Hoài Đức, Hà Nội', 'Chờ xử lý',      NULL, 'Giám sát vận hành trong tiệc cưới', 2);

INSERT INTO attendances (plan_id, user_id, check_in_at, check_in_evidence_id, check_out_at, note) VALUES
(1, 4, '2026-07-05 07:55:00', 1, '2026-07-05 09:50:00', NULL),
(1, 9, '2026-07-05 08:02:00', 2, '2026-07-05 09:50:00', 'Kỹ thuật đi cùng hỗ trợ đo đạc'),
(5, 5, '2026-06-28 20:55:00', 3, '2026-06-29 00:05:00', NULL);

-- ---------- 14. KHẢO SÁT ----------
INSERT INTO survey_reports (survey_id, report_code, order_id, plan_id, evidence_id, survey_date, location, area, length, width, entrance, site_constraints, additional_requests, proposed_items, notes, status, reported_by, confirmed_by, confirmed_at) VALUES
(1, 'KS-001', 1, 1, 5, '2026-07-05', 'Sân trước tư gia, thôn Ngãi Cầu, xã An Khánh, Hoài Đức, Hà Nội', 108.00, 12.00, 9.00, 'Ngõ rộng 4m — xe tải 3,5 tấn vào tận sân', 'Sân nghiêng nhẹ về phía cổng, có 1 cột điện góc sân cần né khi dựng khung', 'Gia đình xin thêm 2 quạt hơi nước vì tiệc giữa trưa', 'Khung rạp 6x9 x2 gian; bạt 6x9 x6; thảm đỏ lối đi; cổng hoa hồng trọn bộ', 'Nguồn điện 3 pha có sẵn ở bếp', 'Đã nộp', 4, 2, '2026-07-05 15:00:00');

-- ---------- 15. NHÀ CUNG CẤP (Hà Nội) & THUÊ NGOÀI ----------
INSERT INTO suppliers (supplier_id, supplier_code, supplier_name, service_type, contact_person, phone, email, address, rating, status, created_by) VALUES
(1, 'NCC-001', 'Hoa Lụa Hà Thành',            'Hoa giả & Decor',            'Ngô Thị Lan',  '0911222333', 'lan@hoaluahathanh.vn', 'Phường Quảng An, quận Tây Hồ, Hà Nội',    5, 'Hoạt động', 2),
(2, 'NCC-002', 'Âm Thanh Ánh Sáng Thăng Long','Loa đài & Đèn sân khấu',     'Đỗ Văn Kiên',  '0922333444', 'kien@thanglongav.vn',  'Phường Mộ Lao, quận Hà Đông, Hà Nội',     4, 'Hoạt động', 2),
(3, 'NCC-003', 'Thiết Bị Sự Kiện Đại Phát',   'Quạt & Bạt rạp & Bàn ghế',   'Bùi Minh Đức', '0933444555', 'duc@daiphat.vn',       'Xã Hà Hồi, huyện Thường Tín, Hà Nội',     4, 'Hoạt động', 3);

INSERT INTO supplier_transactions (transaction_id, transaction_code, supplier_id, order_id, transaction_type, service_title, estimated_cost, deposit_amount, payment_status, status, notes, created_by) VALUES
(1, 'PR-001', 3, 2, 'Thuê', 'Thuê 10 quạt hơi nước cho hội nghị Sao Việt (kho nội bộ không đủ)', 1200000, 400000, 'Đã cọc', 'Đã duyệt', 'NCC giao tận nhà văn hóa trước 06:00 ngày sự kiện', 3);

INSERT INTO supplier_transaction_items (transaction_id, item_id, item_name, quantity, unit_cost, received_quantity, notes) VALUES
(1, 14, 'Quạt hơi nước', 10, 120000, 0, 'Đơn giá thuê/cái/ngày');

-- ---------- 16. ĐẶT CỌC & QUYẾT TOÁN (minh chứng trỏ về evidences) ----------
INSERT INTO deposits (deposit_id, deposit_code, order_id, amount, due_date, payment_date, payment_method, qr_code_url, status, evidence_id, requested_by, approved_by, approved_at, notes) VALUES
(1, 'DEP-001', 1, 5484000, '2026-07-08', '2026-07-03', 'Chuyển khoản ngân hàng (thủ công)', 'https://firebasestorage.googleapis.com/v0/b/wems/o/qr%2Fdep001.png?alt=media', 'Thành công',  7,    2, 2, '2026-07-03 14:20:00', 'Cọc 30% theo chính sách POL-DEP-30'),
(2, 'DEP-002', 2, 2934000, '2026-07-20', NULL,        NULL,                                'https://firebasestorage.googleapis.com/v0/b/wems/o/qr%2Fdep002.png?alt=media', 'Chờ đặt cọc', NULL, 2, NULL, NULL, 'Chờ khách duyệt báo giá BG-2026-002'),
(3, 'DEP-003', 3, 1749000, '2026-06-20', '2026-06-18', 'Chuyển khoản ngân hàng (thủ công)', NULL, 'Thành công', NULL, 2, 2, '2026-06-18 10:00:00', 'Cọc 30% lễ đính hôn');

INSERT INTO settlements (settlement_id, order_id, additional_fee, compensation, discount, final_amount, payment_method, qr_code_url, paid_at, evidence_id, status, requested_by, requested_at, confirmed_by, confirmed_at, notes) VALUES
(1, 3, 200000, 150000, 0, 4431000, 'Chuyển khoản ngân hàng (thủ công)', 'https://firebasestorage.googleapis.com/v0/b/wems/o/qr%2Fpay001.png?alt=media', '2026-06-29 10:00:00', 8, 'Đã xác nhận', 5, '2026-06-28 23:00:00', 2, '2026-06-29 10:00:00', 'Phụ phí quá giờ 1h + bồi thường 5 ghế chiavari gãy chân');

-- ---------- 17. THU HỒI & XUẤT NHẬP KHO (đơn DH-2026-003) ----------
INSERT INTO collected_equipment_reports (report_id, order_id, report_type, status, reported_by, confirmed_by, confirmed_at, notes) VALUES
(1, 3, 'Kho công ty', 'Đã xác nhận', 5, 2, '2026-06-29 09:00:00', 'Thu hồi sau lễ đính hôn Quân & Hà');

INSERT INTO collected_equipment_report_items (report_id, item_id, good_quantity, damaged_quantity, lost_quantity, notes) VALUES
(1, 5, 55, 5, 0, '5 ghế chiavari gãy chân — đã tính bồi thường'),
(1, 1, 6, 0, 0, NULL),
(1, 48, 1, 0, 0, NULL),
(1, 67, 1, 0, 0, NULL);

INSERT INTO inventory_movements (item_id, order_id, report_id, movement_type, quantity, performed_by, notes, created_at) VALUES
(5, 3, NULL, 'Xuất kho', 60, 5, 'Xuất kho phục vụ DH-2026-003', '2026-06-28 08:00:00'),
(1, 3, NULL, 'Xuất kho', 6, 5, 'Xuất kho phục vụ DH-2026-003', '2026-06-28 08:00:00'),
(5, 3, 1, 'Nhập kho', 60, 5, 'Nhập lại (55 tốt + 5 hỏng chuyển khu hỏng)', '2026-06-29 09:30:00'),
(1, 3, 1, 'Nhập kho', 6, 5, 'Nhập kho lại bàn to', '2026-06-29 09:30:00');

-- ---------- 18. CÔNG & LƯƠNG ----------
INSERT INTO wage_records (wage_id, wage_code, order_id, user_id, wage_role, shifts, wage_rate, status, confirmed_by, confirmed_at, notes) VALUES
(1, 'LC-001', 3, 5,  'Leader Điều phối',  2, 500000, 'Đã thanh toán', 2, '2026-06-30 09:00:00', 'DH-2026-003: ca sự kiện + ca thu hồi'),
(2, 'LC-002', 3, 15, 'Setup Nhân sự',     2, 350000, 'Đã thanh toán', 2, '2026-06-30 09:00:00', NULL),
(3, 'LC-003', 1, 4,  'Leader Điều phối',  3, 500000, 'Đã xác nhận',   2, '2026-07-04 08:00:00', 'DH-2026-001: khảo sát + soạn hàng + thi công'),
(4, 'LC-004', 1, 10, 'Thi công Decor',    2, 350000, 'Chờ duyệt',     NULL, NULL, NULL),
(5, 'LC-005', 1, 9,  'Kỹ thuật Âm thanh', 2, 350000, 'Nháp',          NULL, NULL, NULL);

-- ---------- 19. THÔNG BÁO ----------
INSERT INTO notifications (notification_id, title, content, notification_type, ref_type, ref_id, created_by, created_at) VALUES
(1, 'Đơn DH-2026-001 đã nhận cọc',      'Khách Nguyễn Văn An đã chuyển cọc 5.484.000đ — đơn chuyển sang Đã xác nhận.', 'Thanh toán', 'Đơn hàng', 1, NULL, '2026-07-03 14:21:00'),
(2, 'Báo cáo khảo sát KS-001 đã nộp',   'Trần Anh Tuấn đã nộp báo cáo khảo sát tại An Khánh, Hoài Đức — chờ Manager xác nhận.', 'Khảo sát', 'Báo cáo khảo sát', 1, 4, '2026-07-05 10:30:00'),
(3, 'Nhắc soạn hàng đơn DH-2026-001',   'Danh sách thiết bị đơn DH-2026-001 cần soạn xong trước 12:00 ngày 13/07.', 'Tồn kho', 'Đơn hàng', 1, NULL, '2026-07-04 08:00:00'),
(4, 'Kho: 5 ghế chiavari hỏng',         'Sau thu hồi DH-2026-003, 5 ghế chiavari gãy chân được chuyển sang số lượng hỏng.', 'Tồn kho', 'Thiết bị', 5, 1, '2026-06-29 09:35:00'),
(5, 'Người dùng bị tạm khóa',           'Tài khoản hainguyen.tech (Nguyễn Hải) đã bị Admin chuyển sang trạng thái Tạm khóa.', 'Người dùng', 'Người dùng', 11, 1, '2026-07-02 09:00:00');

INSERT INTO notification_recipients (notification_id, user_id, is_read, sent_at, read_at, push_status) VALUES
(1, 2, TRUE,  '2026-07-03 14:21:05', '2026-07-03 14:25:00', 'Đã gửi'),
(2, 2, FALSE, '2026-07-05 10:30:05', NULL,                  'Đã gửi'),
(3, 2, FALSE, '2026-07-04 08:00:05', NULL,                  'Đã gửi'),
(3, 4, TRUE,  '2026-07-04 08:00:05', '2026-07-04 08:10:00', 'Đã gửi'),
(4, 1, FALSE, '2026-06-29 09:35:05', NULL,                  'Đã gửi'),
(5, 1, TRUE,  '2026-07-02 09:00:05', '2026-07-02 09:05:00', 'Đã gửi');

-- ---------- 20. NHẬT KÝ THAO TÁC ----------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, ip_address, created_at) VALUES
(1, 'Đăng nhập',        NULL,     NULL, NULL,                                    '113.161.35.10', '2026-07-04 07:58:00'),
(2, 'Tạo đơn hàng',     'Đơn hàng',  1, JSON_OBJECT('order_code','DH-2026-001'), '113.161.35.11', '2026-06-21 09:12:00'),
(1, 'Cập nhật tồn kho', 'Tồn kho', 5, JSON_OBJECT('quantity_damaged',5),      '113.161.35.10', '2026-06-29 09:35:00'),
(2, 'Xác nhận đặt cọc', 'Đặt cọc', 1, JSON_OBJECT('status','Thành công'),     '113.161.35.11', '2026-07-03 14:20:00');

-- ============================== HẾT ==================================