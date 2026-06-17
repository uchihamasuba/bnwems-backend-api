# Software Requirement Specification (SRS) - Binh Nguyen Wedding Event Management System (BNWEMS)

## I. Record of Changes (Nhật ký thay đổi)
| Date | Action | In charge | Change Description |
| :--- | :--- | :--- | :--- |
| 15/06/2026 | Added | BA Team / Technical Writer | Chuyển đổi toàn diện tài liệu sang định dạng Markdown tối ưu hóa cho AI Agents. |

*Ghi chú hành động:* A - Added (Thêm mới), M - Modified (Sửa đổi), D - Deleted (Xóa bỏ)

---

## II. Software Requirement Specification (Đặc tả yêu cầu phần mềm)

### 1. Overall Requirements (Yêu cầu tổng quan)

#### 1.1 Context Diagram (Sơ đồ ngữ cảnh)
Hệ thống **Binh Nguyen Wedding Event Management System (BNWEMS)** là hạt nhân trung tâm điều phối thông tin giữa các Actors:
* **Admin (Quản trị viên):** Nhận Operational Reports & Audit Data, Inventory Report, Supplier Debt Report, Staff Wage Report. Cung cấp User & Permission Data, Master Data, Policy & Rule Configuration, System Configuration.
* **Manager (Quản lý):** Xử lý Customer Request & Order Data, Quotation Data, Payment Confirmation Data, Assignment & Planning Data, Supplier Rental/Purchase Record, Approval Decision, Order Closure & Wage Confirmation Data. Nhận Pending Requests & Approval Alerts, Inventory Availability & Conflict Alerts, Survey & Field Reports, Execution Progress Dashboard.
* **Leader Staff (Trưởng nhóm nhân viên):** Nhận Assignment Details, Pick-list & Execution Checklist, Approval Result, Inventory Availability Result. Cung cấp Survey Report & Image, Field Execution Updates, Change Request Data, Handover, Damage/Lost & Settlement Evidence, Field Payment Evidence, Inventory Movement Confirmation, Payment Request Data.
* **Technical Staff (Nhân viên kỹ thuật):** Nhận Assigned Task Details, Preparation Pick-list. Cung cấp Work Progress Updates, Task Completion Data.
* **VNPay (Cổng thanh toán liên kết):** Nhận Payment Request Data, Refund Request Data. Trả về Payment Result, Refund Result.

#### 1.2 Main Workflows (Các quy trình nghiệp vụ chính)
Hệ thống quản lý vòng đời sự kiện tiệc cưới qua 3 giai đoạn chính:

##### 1.2.1 Pre-Order Process (Giai đoạn Trước Đặt Hàng)
* **Manager:** Nhận đơn hàng từ khách hàng (Receive customer order) -> Tạo đơn hàng (Create order) -> Phân công nhiệm vụ khảo sát (Assign Survey Task) -> Xác nhận báo cáo khảo sát (Confirm Survey Report) -> Tạo báo cáo báo giá cuối cùng (Create Final Quotation) -> Gửi yêu cầu đặt cọc (Generate Payment QR).
* **Leader Staff:** Nhận nhiệm vụ khảo sát -> Tiến hành khảo sát thực địa tại địa điểm (Conduct Site Survey) -> Nộp báo cáo khảo sát kèm hình ảnh lên hệ thống (Submit Survey Report).
* **System:** Tiếp nhận đơn hàng -> Tự động kiểm tra kho ban đầu (Check Initial Inventory Availability) -> Lưu báo cáo & Cập nhật trạng thái đơn hàng (Save Report & Update Status) -> Gửi thông báo đến khách hàng & quản lý.

##### 1.2.2 Preparation, Execution and Change Request Phase (Giai đoạn Chuẩn bị, Thực hiện & Yêu cầu thay đổi)
* **Manager:** Phân công nhân sự & Nhà cung cấp (Assign Staff & Vendors) -> Quản lý phê duyệt/tử chối yêu cầu thay đổi (Approve/Reject Change Request).
* **Leader Staff:** Nhận thông báo phân công -> Giám sát Check-out thiết bị và nhận đồ từ Supplier -> Giám sát tiến độ & Cập nhật Checklist (Monitor Progress & Update Checklist) -> Ghi nhận và nộp yêu cầu thay đổi phát sinh tại hiện trường (Submit Change Request to System) -> Thảo luận chi phí & Xác nhận sự đồng ý của khách hàng (Discuss Cost & Confirm Customer Acceptance).
* **Technical Staff:** Mở Pick-list & Thực hiện Check-out thiết bị nội bộ (Open Pick-list & Check-out Internal Items) -> Vận chuyển & Thi công lắp đặt tại hiện trường (Transport & Execute Installation at Site) -> Điều chỉnh lắp đặt theo Checklist mới sau khi thay đổi được duyệt (Adjust installation according to New Checklist).
* **System:** Gửi thông báo phân công -> Kiểm tra kho thiết bị nội bộ sẵn có khi có Change Request -> Cập nhật dữ liệu đơn hàng khi có phê duyệt.

##### 1.2.3 Handover, Recovery & Final Settlement Phase (Giai đoạn Bàn giao, Thu hồi & Quyết toán cuối cùng)
* **Leader Staff:** Chụp ảnh & Nộp yêu cầu bàn giao nghiệm thu (Take Photos & Submit Handover Request) -> Kiểm tra thiết bị hỏng hóc/mất mát (Any Damaged/Lost Items?) -> Chụp ảnh vật chứng, xác định trách nhiệm & Nộp báo cáo hư hại (Take Photos, Fix Responsibility & Submit Damage Report) -> Nhập số lượng Check-in trên ứng dụng (Input Check-in Quantities on App) -> Ghi nhận chi tiết quyết toán, phụ phí, đền bù (Record Settlement Details) -> Nộp hồ sơ quyết toán lên Quản lý (Submit Settlement for Manager Approval).
* **Technical Staff:** Hoàn tất lắp đặt nghiệm thu -> Tháo dỡ & Thu gom thiết bị (Dismantle & Collect Items) -> Vận chuyển thiết bị về kho & Phân loại trạng thái (Transport Back to Warehouse & Categorize Status).
* **Manager:** Xác nhận báo cáo bàn giao trên hệ thống (Confirm Handover Report on System) -> Xem xét & Cập nhật phạt quyết toán nếu do lỗi của nhân viên (Review & Update Settlement Penalty) -> Phê duyệt Check-in & Xác minh hồ sơ quyết toán cuối cùng (Approve Check-in & Verify Final Settlement) -> Xác minh thanh toán cuối cùng và Đóng đơn hàng (Verify Payment & Close Order).
* **System:** Tự động cập nhật trạng thái đơn hàng sang READY / EVENT HAPPENING -> Thu thập dữ liệu trạng thái thu hồi thiết bị (RETURNED_PENDING) -> Chuyển trạng thái đơn hàng sang COMPLETED sau khi quyết toán thành công.

---

### 1.3 User Requirements (Yêu cầu người dùng)

#### 1.3.1 Actors (Các tác nhân hệ thống)
| # | Actor | Description (Mô tả hành vi nghiệp vụ) |
| :-: | :--- | :--- |
| 1 | **Administrator** | Chịu trách nhiệm cấu hình và bảo trì toàn bộ hệ thống. Quản lý tài khoản người dùng, vai trò & phân quyền (Roles & Permissions), danh mục dịch vụ (Service Catalogs), danh mục thiết bị kho, chính sách giá (Pricing Policies), quản lý thông tin nhà cung cấp (Suppliers), nhà kho (Warehouses) và các thiết lập hệ thống khác. Giám sát các Operational Reports và Audit Data toàn hệ thống. |
| 2 | **Manager** | Chịu trách nhiệm quản lý toàn bộ vòng đời đơn hàng (Order Lifecycle) và các hoạt động vận hành. Tạo và cập nhật đơn hàng, lên lịch khảo sát, điều phối và phân công nhân sự, phân bổ thiết bị kho nội bộ, lập báo giá (Quotations), xử lý thanh toán, điều phối giao hàng, nghiệm thu kết quả vận hành, và giám sát tiến độ qua Dashboards & Reports. |
| 3 | **Leader Staff** | Chịu trách nhiệm thực thi và giám sát trực tiếp các hoạt động tại hiện trường sự kiện. Thực hiện khảo sát địa điểm, giám sát bốc xếp và vận chuyển thiết bị, cập nhật tiến độ thi công lắp đặt, ghi nhận và gửi các yêu cầu thay đổi (Change Requests), xử lý thanh toán thực địa của khách hàng, quản lý thu hồi thiết bị và trả kho, nộp các báo cáo vận hành, và xác nhận chấm công (Attendance) của nhân viên kỹ thuật. |
| 4 | **Technical Staff** | Chịu trách nhiệm thực hiện các công việc kỹ thuật/vận hành được phân công. Xem danh sách công việc và chi tiết đơn hàng, chuẩn bị thiết bị theo Pick-list, xác nhận hoàn thành tác vụ (Task Completion), và thực hiện chấm công (Record Attendance) để làm cơ sở tính lương payroll. |
| 5 | **VNPay Payment Gateway** | Hệ thống cổng thanh toán ngoại vi hỗ trợ tạo mã QR và xử lý giao dịch thanh toán trực tuyến. Giao tiếp với hệ thống để hỗ trợ các giao dịch thanh toán của khách hàng và trả về thông tin trạng thái giao dịch (Payment Status). |

#### 1.3.2 Use Cases List (Danh sách Use Cases)
| ID | Use Case | Feature Group | Role | Description |
| :-: | :--- | :--- | :--- | :--- |
| 1 | Login | Authentication Management | All | Cho phép người dùng đăng nhập bằng thông tin xác thực. |
| 2 | Logout | Authentication Management | All | Kết thúc phiên làm việc an toàn của tài khoản. |
| 3 | Forgot Password | Authentication Management | All | Khôi phục quyền truy cập tài khoản thông qua Admin xác minh. |
| 4 | Change Password | Personal Account Management | All | Cho phép người dùng chủ động thay đổi mật khẩu hiện tại. |
| 5 | View Profile | Personal Account Management | All | Xem thông tin tài khoản cá nhân và nhật ký hoạt động. |
| 7 | Receive Notifications | Notification Management | All | Nhận thông báo hệ thống, tác vụ vận hành theo vai trò. |
| 8 | View User List | User & Permission Management | Admin | Xem danh sách toàn bộ tài khoản nhân sự nội bộ. |
| 9 | Create User Information | User & Permission Management | Admin | Tạo mới một tài khoản nhân sự nội bộ và cấp quyền ban đầu. |
| 10 | Update User Information | User & Permission Management | Admin | Cập nhật thông tin hồ sơ của tài khoản nhân sự hiện có. |
| 11 | Deactivate User | User & Permission Management | Admin | Vô hiệu hóa tài khoản người dùng nhưng giữ lại lịch sử dữ liệu. |
| 12 | Reset User Password | User & Permission Management | Admin | Admin đặt lại mật khẩu tạm thời cho nhân sự sau khi xác minh. |
| 13 | Assign Role to User | User & Permission Management | Admin | Thay đổi hoặc gán Vai trò (Role) cho tài khoản nhân sự. |
| 14 | View Role List | User & Permission Management | Admin | Xem danh sách các vai trò hệ thống hiện có. |
| 15 | Create Role | User & Permission Management | Admin | Tạo một Vai trò hệ thống mới phục vụ phân quyền. |
| 16 | Update Role | User & Permission Management | Admin | Sửa đổi thông tin tên/mô tả của một vai trò. |
| 17 | Deactivate Role | User & Permission Management | Admin | Vô hiệu hóa một vai trò hệ thống không còn sử dụng. |
| 18 | Assign Permissions to Role | User & Permission Management | Admin | Gán tập hợp các quyền chi tiết (Permissions) cho Vai trò. |
| 19 | View Equipment Catalog | Master & Reference Data | Admin/All | Xem danh mục toàn bộ thiết bị vật tư của công ty. |
| 20 | Create Equipment | Master & Reference Data | Admin | Thêm một thiết bị mới vào danh mục tổng của hệ thống. |
| 21 | Update Equipment | Master & Reference Data | Admin | Cập nhật thông số, hình ảnh, phân loại của thiết bị. |
| 22 | Deactivate Equipment | Master & Reference Data | Admin | Vô hiệu hóa thiết bị khỏi danh mục kinh doanh hiện tại. |
| 23 | View Service Catalog | Master & Reference Data | Admin/Manager | Xem danh mục dịch vụ và các gói giải pháp tổ chức sự kiện. |
| 24 | Create Service | Master & Reference Data | Admin | Tạo mới một dịch vụ hoặc gói dịch vụ sự kiện tiệc cưới. |
| 25 | Update Service | Master & Reference Data | Admin | Sửa đổi thông tin dịch vụ hoặc kết cấu của gói dịch vụ. |
| 26 | Deactivate Service | Master & Reference Data | Admin | Ngừng kinh doanh một dịch vụ hoặc gói dịch vụ cụ thể. |
| 27 | Manage Service Pricing | Master & Reference Data | Admin | Cấu hình biểu giá dịch vụ và thiết bị theo dòng thời gian hiệu lực. |
| 28 | View Supplier List | Master & Reference Data | Admin/Manager | Xem danh sách các nhà cung cấp bên thứ ba liên kết. |
| 29 | Create Supplier | Master & Reference Data | Admin | Thêm mới thông tin hồ sơ nhà cung cấp vào hệ thống. |
| 30 | Update Supplier | Master & Reference Data | Admin | Cập nhật thông tin liên hệ, điều khoản của nhà cung cấp. |
| 31 | Deactivate Supplier | Master & Reference Data | Admin | Vô hiệu hóa nhà cung cấp để chặn các giao dịch tương lai. |
| 32 | View Warehouse Info | Master & Reference Data | All | Xem thông tin hạ tầng vật lý của các nhà kho chứa đồ. |
| 33 | Update Warehouse Info | Master & Reference Data | Admin | Cập nhật thông tin quản lý, địa chỉ của nhà kho. |
| 34 | Configure Deposit Policy | Policy Configuration | Admin | Cấu hình quy định về tỷ lệ đặt cọc và hoàn cọc đơn hàng. |
| 35 | Configure Cancellation Policy | Policy Configuration | Admin | Cấu hình chính sách hủy đơn và phạt hủy theo mốc thời gian. |
| 36 | Configure Compensation Policy | Policy Configuration | Admin | Cấu hình quy định đền bù tài sản khi thiết bị hỏng/mất. |
| 37 | Configure Additional Fee Policy| Policy Configuration | Admin | Cấu hình quy tắc tính phụ phí (phụ phí tăng cường, ngoài giờ...). |
| 38 | Configure Staff Wage Rules | Policy Configuration | Admin | Cấu hình định mức lương và phạt chấm công cho nhân sự. |
| 39A| View Administrative Dashboard | Reporting Management | Admin | Dashboard tổng quan báo cáo quản trị và kiểm toán dữ liệu. |
| 39B| View Operational Dashboard | Operational Dashboard | Manager | Dashboard theo dõi trực quan trạng thái đơn hàng, vận hành. |
| 40 | View Revenue Reports | Reporting Management | Admin | Xem báo cáo doanh thu chi tiết phục vụ kiểm toán tài chính. |
| 41 | View Order Statistics | Reporting Management | Admin | Xem thống kê số lượng đơn hàng, tỷ lệ chuyển đổi đơn. |
| 42 | View Inventory Statistics | Reporting Management | Admin/Manager | Xem thống kê tỷ lệ sử dụng thiết bị, khấu hao vật tư. |
| 43 | View Workforce Statistics | Reporting Management | Admin | Xem thống kê số ca làm việc, hiệu suất của nhân sự. |
| 44 | View Inventory Return Report | Reporting Management | Admin/Manager | Xem báo cáo hoàn kho thiết bị sau sự kiện. |
| 45 | View Supplier Debt Report | Reporting Management | Admin/Manager | Xem báo cáo tổng hợp công nợ đối với các Supplier ngoại vi. |
| 46 | View Staff Wage Report | Reporting Management | Admin/Manager | Xem báo cáo tổng hợp lương thưởng và các khoản khấu trừ nhân sự. |
| 47 | View Customer Information | Customer Management | Manager | Xem danh sách và thông tin chi tiết của khách hàng. |
| 48 | Register Customer | Customer Management | Manager | Tạo mới hồ sơ khách hàng khi nhận yêu cầu đặt tiệc. |
| 49 | Update Customer | Customer Management | Manager | Cập nhật thông tin liên hệ cá nhân của khách hàng. |
| 50 | Create Quotation | Quotation Management | Manager | Tạo bảng báo giá chi tiết gồm các hạng mục dịch vụ/thiết bị. |
| 51 | Update Quotation | Quotation Management | Manager | Điều chỉnh bảng báo giá (thay đổi số lượng, áp mã giảm giá). |
| 52 | Confirm Quotation | Quotation Management | Manager | Chốt phương án báo giá agreed với khách hàng. |
| 53 | View Order List | Order Lifecycle Management | Manager | Xem toàn bộ danh sách đơn hàng đang vận hành. |
| 54 | View Order Details | Order Lifecycle Management | Manager/Staff | Xem chi tiết thông tin đơn hàng, tiến độ, tài chính, nhân sự. |
| 55 | Track Order Status | Order Lifecycle Management | Manager/Staff | Theo dõi mốc trạng thái hiện tại trong vòng đời đơn hàng. |
| 56 | Create Order | Order Lifecycle Management | Manager | Khởi tạo một đơn hàng tiệc cưới mới trong hệ thống. |
| 57 | Update Order | Order Lifecycle Management | Manager | Thay đổi thông tin địa điểm, thời gian sự kiện của đơn hàng. |
| 58 | Confirm Order | Order Lifecycle Management | Manager | Xác nhận đơn hàng chạy chính thức sau khi nhận cọc thành công. |
| 59 | Change Event Date | Order Lifecycle Management | Manager | Xử lý nghiệp vụ thay đổi ngày cưới (Tự động tính lại kho date-based). |
| 60 | Cancel Order | Order Lifecycle Management | Manager | Hủy đơn hàng và áp dụng chính sách hoàn tiền tự động. |
| 62 | Schedule Survey | Survey Management | Manager | Lên lịch khảo sát hiện trường mặt bằng cho đơn hàng. |
| 63 | Assign Survey | Survey Management | Manager | Giao tác vụ khảo sát cho Leader Staff cụ thể. |
| 64 | Monitor Survey Progress | Survey Management | Manager | Giám sát trạng thái tiến độ thực hiện ca khảo sát. |
| 66 | Check Initial Inventory | Date-based Inventory | Manager | Kiểm tra nhanh độ sẵn sàng của kho thiết bị theo ngày sự kiện. |
| 67 | Recheck Inventory After Survey | Date-based Inventory | Manager | Kiểm tra lại kho sau khi khảo sát để tối ưu hóa thiết bị thực tế. |
| 68 | Generate Pick List | Staff Assignment | Manager | Tự động tạo Pick-list chuẩn bị đồ cho ca vận hành. |
| 69 | View Inventory Return Status | Result Verification | Manager | Theo dõi tiến độ gom đồ và trạng thái thiết bị trả về kho. |
| 70 | Confirm Inventory Return | Result Verification | Manager | Xác nhận chốt số lượng thiết bị thực tế đã hoàn kho an toàn. |
| 71 | Record Supplier Rental | Supplier Management | Manager | Ghi nhận thông tin thuê ngoài thiết bị từ Supplier. |
| 72 | Record Supplier Purchase | Supplier Management | Manager | Ghi nhận mua vật tư tiêu hao từ nhà cung cấp cho sự kiện. |
| 73 | Monitor Supplier Debt | Supplier Management | Manager | Giám sát số tiền công nợ chưa thanh toán cho các Supplier. |
| 74 | Record Supplier Payment | Supplier Management | Manager | Ghi nhận chứng từ đã thanh toán tiền công nợ cho Supplier. |
| 75 | Assign Staff | Staff Assignment | Manager | Điều phối Leader Staff và Technical Staff vào các Work Tasks. |
| 76 | Plan Transportation Schedule | Staff Assignment | Manager/Staff | Lập lịch chi tiết về thời gian xe chạy, bốc xếp, thi công. |
| 77 | Confirm Staff Work | Wage Confirmation | Manager | Xác nhận tính hợp lệ của ca làm việc dựa trên dữ liệu chấm công. |
| 78 | Confirm Staff Wage Data | Wage Confirmation | Manager | Chốt số tiền lương ca và các khoản phạt đền bù của nhân sự. |
| 79 | Monitor Field Operation | Field Approval | Manager | Theo dõi thời gian thực tiến độ thi công ngoài hiện trường. |
| 80 | Approve Change Request | Field Approval | Manager | Phê duyệt trực tuyến yêu cầu tăng/giảm đồ từ hiện trường gửi về. |
| 81 | Confirm Handover Report | Result Verification | Manager | Phê duyệt biên bản bàn giao nghiệm thu mặt bằng sạch với khách. |
| 82 | Confirm Damage/Loss Report | Result Verification | Manager | Phê duyệt biên bản ghi nhận thiết bị hỏng/mất để phạt đền bù. |
| 83 | Create Deposit Payment Request| Payment & Settlement | Manager | Phát hành yêu cầu khách hàng đóng tiền đặt cọc đơn hàng. |
| 84 | Generate QR Payment | Payment & Settlement | Manager | Gọi API cổng thanh toán tạo mã QR động chứa số tiền cọc/chốt. |
| 85 | Confirm Payment Evidence | Payment & Settlement | Manager | Kiểm tra hình ảnh chuyển khoản ngân hàng của khách để duyệt tiền. |
| 86 | Confirm Settlement | Payment & Settlement | Manager | Xác nhận bảng cân đối kế toán quyết toán cuối cùng của sự kiện. |
| 87 | Record Final Payment | Payment & Settlement | Manager | Ghi nhận số tiền thanh toán cuối để tự động Đóng/Hoàn tất đơn hàng. |
| 88 | View Assigned Tasks | Field Task Management| Staff | Nhân viên xem danh sách các Tasks được phân công trên Mobile App. |
| 89 | View Task Details | Field Task Management| Staff | Xem chi tiết vị trí, mốc thời gian, checklist của Task. |
| 90 | View Pick List | Pick-list Viewing | Staff | Xem danh sách chi tiết các thiết bị cần bốc xếp cho Task. |
| 91 | Conduct & Submit Survey Report| Survey Reporting | Leader Staff | Nhập số liệu đo đạc mặt bằng, chụp ảnh hiện trường nộp về hệ thống.|
| 92 | Confirm Warehouse Check-out | Warehouse Supervision| Leader Staff | Chốt số lượng thiết bị thực tế bốc lên xe rời kho nội bộ. |
| 93 | Record Supplier Item Receipt | Supplier Support | Leader Staff | Ghi nhận số lượng thiết bị bốc nhận từ xe của Supplier giao đến. |
| 94 | Record Supplier Item Return | Supplier Support | Leader Staff | Ghi nhận hoàn trả thiết bị thuê ngoài cho Supplier tại hiện trường. |
| 95 | Update Field Progress | Field Progress Tracking| Leader Staff | Bấm cập nhật trạng thái thi công (Đang chạy, Hoàn thành) kèm ảnh. |
| 96 | Record Handover Evidence | Handover Management | Leader Staff | Tải lên ảnh biên bản nghiệm thu có chữ ký khách hàng. |
| 97 | Submit Change Request | Field Change Request | Leader Staff | Tạo và gửi yêu cầu phát sinh thêm đồ ngoài hiện trường về Manager.|
| 98 | Record Damage/Loss Report | Damage/Loss Recording | Leader Staff | Lập biên bản hiện trường ghi nhận thiết bị móp méo, vỡ, mất đồ. |
| 99 | Record Collected Equipment | Field Progress Tracking| Leader Staff | Ghi nhận số lượng kiểm đếm thiết bị thu gom sau khi tiệc kết thúc.|
| 100| Record Internal Item Return | Field Progress Tracking| Leader Staff | Ghi nhận số lượng thiết bị thực tế áp tải về đến cửa kho công ty. |
| 101| Classify Returned Equipment | Damage/Loss Recording | Leader Staff | Phân loại thiết bị hoàn trả: Bình thường, Bẩn, Hỏng, Bảo trì. |
| 102| Submit Inventory Return Report| Field Progress Tracking| Leader Staff | Khóa hồ sơ hoàn trả thiết bị gửi về cho Manager kiểm tra chốt hạ.|
| 103| Record Attendance | Attendance & Task | Staff | Nhân viên bấm Check-in/Check-out chấm công bằng định vị GPS App.|
| 104| Confirm Tech Staff Attendance | Attendance & Task | Leader Staff | Trưởng nhóm duyệt giờ chấm công thực tế của các nhân viên kỹ thuật.|
| 105| Upload Customer Pay Evidence | Field Settlement | Leader Staff | Chụp ảnh hóa đơn tiền mặt hoặc ảnh chuyển khoản của khách tại tiệc.|
| 106| Record Settlement Details | Field Settlement | Leader Staff | Nhập số liệu tính toán phụ phí, đền bù thực tế thỏa thuận tại sảnh.|
| 107| Submit Settlement for Approval | Field Settlement | Leader Staff | Gửi toàn bộ hồ sơ quyết toán sảnh về hệ thống chờ Manager duyệt. |

---

### 1.4 Screen Authorization Matrix (Bảng phân quyền màn hình)
| Màn hình chức năng (Screen) | Administrator | Manager | Leader Staff | Technical Staff |
| :--- | :---: | :---: | :---: | :---: |
| Login / Logout / Forgot Password / View Profile | X | X | X | X |
| View / Create / Update / Deactivate User List & Roles | X | | | |
| Assign Permissions to Role | X | | | |
| View Equipment Catalog | X | X | X | X |
| Create / Update / Deactivate Equipment | X | | | |
| View Service Catalog & Suppliers List | X | X | | |
| Create / Update / Deactivate Service & Pricing | X | | | |
| Create / Update / Deactivate Supplier | X | | | |
| View Warehouse Information | X | X | X | X |
| Update Warehouse Information | X | | | |
| Configure Deposit / Cancellation / Compensation Policies | X | | | |
| View Administrative Dashboard & Revenue Reports | X | | | |
| View Operational Dashboard | | X | | |
| View Order / Inventory / Workforce Statistics Reports | X | X | | |
| View Supplier Debt & Staff Wage Reports | X | X | | |
| Register / Update / View Customer Information | | X | | |
| Create / Update / Confirm Quotation | | X | | |
| Create / Update / Confirm Order | | X | | |
| Change Event Date / Cancel Order | | X | | |
| Schedule & Assign Survey Tasks | | X | | |
| Monitor Survey Progress & View Survey Reports | | X | X | |
| Conduct and Submit Survey Report (Mobile App) | | | X | |
| Check Initial Inventory / Recheck Inventory | | X | | |
| Generate Pick List | | X | | |
| View Pick List / Plan Transportation Schedule | | X | X | X |
| View Inventory Return Status & Confirm Return | | X | X | |
| Record Supplier Rental / Purchase / Payment | | X | | |
| Assign Staff to Operational Tasks | | X | | |
| Confirm Staff Work & Wage Data | | X | | |
| Monitor Field Operation Progress | | X | X | |
| Approve Change Request | | X | | |
| Confirm Handover & Damage/Loss Reports | | X | | |
| Create Deposit Payment Request & Generate QR | | X | | |
| Confirm Payment Evidence & Settlement | | X | | |
| Record Final Payment | | X | | |
| View Assigned Tasks & Task Details (Mobile App) | | | X | X |
| Confirm Warehouse Check-out (Mobile App) | | | X | |
| Record Supplier Equipment Receipt / Return | | | X | |
| Update Field Progress & Record Handover Evidence | | | X | |
| Submit Change Request (Mobile App) | | | X | |
| Record Damage/Loss Report (Mobile App) | | | X | |
| Record Collected Equipment & Internal Return | | | X | |
| Classify Returned Equipment & Submit Return Report | | | X | |
| Record Attendance (Check-in/out GPS Mobile) | | | X | X |
| Confirm Technical Staff Attendance | | | X | |
| Upload Customer Payment Evidence (Mobile App) | | | X | |
| Record Settlement Details & Submit for Approval | | | X | |

---

### 1.5 Non-UI Functions (Các chức năng xử lý ngầm / Logic Backend)
| # | Feature Domain | System Function | Description / Business Logic |
| :-: | :--- | :--- | :--- |
| 1 | Authentication | User Authentication | Xác thực thông tin đăng nhập, token hóa session JWT, kiểm tra trạng thái active. |
| 2 | Security | Password Management | Hashing mật khẩu bằng BCrypt, xử lý mã hóa Token reset-password. |
| 3 | Authorization | Role-Based Access Control | Kiểm tra quyền (ACL Matrix) tại tầng API Gateway trước khi điều phối dữ liệu. |
| 4 | Audit Management | Audit Log Recording | Tự động ghi lại lịch sử bất biến đối với các hành động tài chính, chính sách, chuyển đổi trạng thái đơn hàng. |
| 5 | Notification | Notification Processing | Tạo và phân phối Push Notification qua App/Web khi có tác vụ điều phối phân công mới. |
| 6 | Master Data | Master Data Validation | Ràng buộc tính toàn vẹn dữ liệu (Data Integrity) khi thực hiện tác vụ CRUD danh mục. |
| 7 | Policy Evaluation | Business Policy Evaluation | Tự động tính toán tiền cọc tối thiểu, tỷ lệ phạt hủy tiệc dựa trên chính sách đang hiệu lực. |
| 8 | Financial Calculation| Quotation Calculation | Tính toán tự động tổng giá trị báo giá: `Tổng = (Đơn giá * Số lượng) + Phụ phí - Chiết khấu`. |
| 9 | Workflow Processing | Order Workflow Processing | Kiểm soát State Machine của đơn hàng, ngăn chặn việc cập nhật sai luồng trạng thái quy định. |
| 10| Inventory Control | Date-based Inventory Check | Thực hiện truy vấn kho động: `Sẵn có = Tổng tồn kho - Số lượng đã bị reserve bởi các đơn trùng ngày`. |
| 11| Inventory Control | Inventory Reservation | Đóng băng (Reserve) thiết bị ngay khi đơn hàng chuyển sang trạng thái Confirmed. |
| 12| HR Management | Staff Assignment Validation | Kiểm tra lịch trình, ngăn chặn double-booking một nhân viên vào hai tác vụ trùng giờ. |
| 13| Payroll Calculation | Attendance and Wage | Tự động tính lương: `Lương = (Số ca hợp lệ * Đơn giá ca) - Khoản khấu trừ đền bù hỏng/mất tài sản`. |

---

## III. Use Case Specifications (Đặc tả chi tiết luồng Use Cases)

### 2.1 Module Authentication (Xác thực tài khoản)

#### UC-1: Login (Đăng nhập hệ thống)
* **Primary Actors:** Admin, Manager, Leader Staff, Technical Staff.
* **Description:** Người dùng nhập thông tin tài khoản để truy cập vào hệ thống theo phân quyền của vai trò trên Web hoặc Mobile.
* **Preconditions:** Tài khoản đã được khởi tạo và ở trạng thái Active. Người dùng truy cập đúng nền tảng (Web cho Admin/Manager, Mobile cho Staff).
* **Postconditions:** Đăng nhập thành công, hệ thống sinh mã JWT Token session hợp lệ, ghi nhận lịch sử vào Activity Log và điều hướng về trang chủ tương ứng.
* **Normal Flow:**
  - 1. Người dùng mở ứng dụng Web hoặc Mobile App.
  - 2. Hệ thống hiển thị giao diện Màn hình Đăng nhập.
  - 3. Người dùng nhập thông tin tài khoản gồm Username và Password.
  - 4. Người dùng bấm nút "Login".
  - 5. Hệ thống tiếp nhận payload, xác thực thông tin và kiểm tra quyền truy cập nền tảng.
  - 6. Hệ thống cho phép truy cập, khởi tạo phiên làm việc hợp lệ.
  - 7. Hệ thống ghi nhận sự kiện đăng nhập thành công vào Activity Log.
  - 8. Hệ thống điều hướng người dùng vào trang Dashboard tương ứng.
* **Alternative Flows:**
  - **A1: Thiếu thông tin bắt buộc:**
    - 1. Tại bước 3, người dùng bỏ trống trường Username và/hoặc Password.
    - 2. Client-side tự động chặn lại và hiển thị cảnh báo validation màu đỏ dưới text box.
    - 3. Người dùng nhập bổ sung thông tin thiếu. Luồng quay lại bước 3 quy trình chuẩn.
* **Exception Flows:**
  - **E1: Hệ thống xác thực thất bại:**
    - 1. Tại bước 5, thông tin credentials không chính xác hoặc không thỏa mãn điều kiện hệ thống.
    - 2. Hệ thống trả về mã lỗi và thông điệp tương ứng:
      - Sai Username/Password: Hiển thị lỗi `MSG-LG01`.
      - Tài khoản đang bị Deactivated: Hiển thị lỗi `MSG-LG02`.
      - Tài khoản đang bị khóa tạm thời: Hiển thị lỗi `MSG-LG03`.
      - Vai trò không được phép truy cập nền tảng này: Hiển thị lỗi `MSG-LG04`.
    - 3. Client hiển thị thông báo lỗi. Người dùng sửa lại thông tin. Use case kết thúc ở trạng thái lỗi.
  - **E2: Vượt quá giới hạn đăng nhập sai (Brute-force protection):**
    - 1. Tại bước 5, hệ thống phát hiện số lần nhập sai mật khẩu liên tiếp đạt ngưỡng giới hạn cấu hình.
    - 2. Hệ thống tự động khóa tài khoản tạm thời.
    - 3. Hệ thống trả về cảnh báo lock tài khoản.
    - 4. Client hiển thị thông điệp cảnh báo `MSG-LG05`. Use case kết thúc.
* **Business Rules:**
  - `BR-LG01`: Đăng nhập bắt buộc sử dụng Username/Email và Password.
  - `BR-LG02`: Hệ thống phải thực hiện kiểm tra trạng thái hoạt động (Account Status) trước khi cấp Token.
  - `BR-LG03`: Bắt buộc kiểm tra quyền hạn truy cập nền tảng (Nền tảng Web chặn Role Technical Staff).
  - `BR-LG04`: Kích hoạt cơ chế tự động khóa tài khoản trong 15 phút nếu đăng nhập sai quá 5 lần liên tiếp.
  - `BR-LG05`: Tất cả các sự kiện đăng nhập thành công bắt buộc phải được ghi vết vào Audit Log hệ thống.

#### UC-3: Forgot Password (Quên mật khẩu)
* **Primary Actors:** Tất cả các vai trò nội bộ.
* **Preconditions:** Tài khoản tồn tại trên hệ thống. Người dùng cung cấp chính xác Username/Email.
* **Postconditions:** Bản ghi yêu cầu cấp lại mật khẩu được lưu nhận. Mật khẩu không tự động thay đổi khi chưa có xác minh từ Admin.
* **Normal Flow:**
  - 1. Người dùng chọn "Quên mật khẩu" tại giao diện đăng nhập.
  - 2. Hệ thống hiển thị màn hình Yêu cầu khôi phục mật khẩu.
  - 3. Người dùng nhập thông tin Email/Username tài khoản.
  - 4. Hệ thống thực hiện kiểm tra sự tồn tại của tài khoản trong DB.
  - 5. Hệ thống ghi nhận yêu cầu khôi phục mật khẩu và hiển thị chỉ dẫn liên hệ Admin xác minh danh tính (`MSG-FP03`).
  - 6. Admin thực hiện xác minh danh tính nhân sự ngoài đời thực (ngoại vi hệ thống).
  - 7. Admin truy cập màn hình quản trị hệ thống bấm nút "Reset User Password" (UC-12).
  - 8. Hệ thống ghi vết hoạt động đặt lại mật khẩu vào Audit Log.
  - 9. Nhân viên nhận mật khẩu tạm thời mới để tiến hành đăng nhập lại.
* **Alternative Flows:**
  - **A1: Liên hệ Admin trực tiếp:** Người dùng không gửi yêu cầu qua giao diện phần mềm mà liên hệ trực tiếp bộ phận IT. Admin xác minh danh tính và thực hiện Reset Password tại màn hình admin (Bỏ qua bước 1 đến 5).
* **Exception Flows:**
  - **E1: Không tìm thấy tài khoản:** Tại bước 4, Email/Username không tồn tại. Hệ thống trả về mã lỗi `MSG-FP01`. Hệ thống giữ nguyên trạng thái bảo mật thông tin tài khoản.
* **Business Rules:**
  - `BR-FP01`: Hệ thống không tự động cấp và hiển thị mật khẩu mới lên màn hình mà không có lớp bảo mật xác minh hoặc Admin can thiệp.

#### UC-4: Change Password (Chủ động đổi mật khẩu)
* **Primary Actors:** Toàn bộ nhân sự đã login thành công.
* **Preconditions:** Người dùng đang ở trạng thái đăng nhập hợp lệ, tài khoản active, biết mật khẩu cũ.
* **Postconditions:** Mật khẩu cập nhật thành công, lưu log, toàn bộ các Token session cũ trên thiết bị khác bị hủy bỏ.
* **Normal Flow:**
  - 1. Người dùng truy cập mục "Thông tin cá nhân" (Profile).
  - 2. Hệ thống hiển thị thông tin tài khoản và nút hành động.
  - 3. Người dùng chọn tính năng "Đổi mật khẩu" (Change Password).
  - 4. Hệ thống hiển thị Popup Modal đổi mật khẩu.
  - 5. Người dùng nhập các thông tin: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
  - 6. Người dùng bấm nút "Cập nhật".
  - 7. Hệ thống thực hiện các tầng validation: Kiểm tra mật khẩu cũ chính xác, kiểm tra độ mạnh mật khẩu mới, kiểm tra tính trùng khớp của chuỗi nhập lại.
  - 8. Hệ thống mã hóa mật khẩu mới và lưu vào cơ sở dữ liệu.
  - 9. Ghi nhận hành động đổi mật khẩu vào Activity Log.
  - 10. Hệ thống hiển thị thông báo thành công `MSG-CP05`.
* **Exception Flows:**
  - **E1: Mật khẩu cũ không chính xác:** Tại bước 7, hệ thống kiểm tra mật khẩu hiện tại không khớp. Hệ thống trả về mã lỗi `MSG-CP02`. Form giữ nguyên để người dùng nhập lại.
  - **E2: Mật khẩu mới không đạt chuẩn an toàn:** Tại bước 7, mật khẩu mới không thỏa mãn độ phức tạp chính sách. Hệ thống trả về mã lỗi `MSG-CP03`.
  - **E3: Mật khẩu mới và mật khẩu xác nhận không trùng khớp:** Trả về lỗi `MSG-CP04`.
* **Business Rules:**
  - `BR-CP01`: Bắt buộc phải xác thực tính chính xác của mật khẩu hiện tại trước khi cho phép ghi đè chuỗi mật khẩu mới.
  - `BR-CP02`: Mật khẩu mới không được phép trùng với mật khẩu của lần đổi gần nhất (Mật khẩu cũ hiện tại).

---

### 2.2 Module Quản trị hệ thống (Admin Use Cases)

#### UC-9: Create User Information (Tạo mới tài khoản nhân sự)
* **Primary Actors:** Administrator.
* **Preconditions:** Admin đã đăng nhập hệ thống Web thành công. Vai trò dự định gán phải tồn tại và đang hoạt động.
* **Postconditions:** Tài khoản nhân sự mới được tạo lập trong DB, gán Vai trò (Role) và trạng thái mặc định, tạo log kiểm toán.
* **Normal Flow:**
  - 1. Admin truy cập phân hệ "Quản lý người dùng" (User Management).
  - 2. Hệ thống hiển thị danh sách nhân sự hiện tại và các nút hành động.
  - 3. Admin bấm nút "Tạo người dùng" (Create User Information).
  - 4. Hệ thống hiển thị Form khai báo thông tin tài khoản.
  - 5. Admin nhập các thông tin bắt buộc: Họ và tên, Username, Số điện thoại, Email, gán Vai trò (Role), chọn Quyền truy cập nền tảng và Trạng thái ban đầu.
  - 6. Admin bấm nút "Lưu dữ liệu".
  - 7. Hệ thống chạy logic kiểm tra tính hợp lệ của dữ liệu (Validation).
  - 8. Hệ thống lưu bản ghi tài khoản mới vào DB, tự động tạo mật khẩu tạm thời ngẫu nhiên được mã hóa.
  - 9. Hệ thống gán Vai trò tương ứng vào bảng liên kết thực thể quyền.
  - 10. Ghi vết hành động tạo tài khoản nhân sự mới vào Activity Log.
  - 11. Hệ thống hiển thị thông báo thành công `MSG-AU06`.
* **Exception Flows:**
  - **E1: Trùng lặp Username hoặc Email:** Tại bước 7, hệ thống phát hiện Username hoặc Email đã tồn tại trong DB. Trả về mã lỗi `MSG-AU02`. Hệ thống chặn đứng tác vụ ghi file database, giữ nguyên form để Admin sửa đổi thông tin trùng lặp.
* **Business Rules:**
  - `BR-AU01`: Thuộc tính Username và Email bắt buộc phải là duy nhất trên toàn hệ thống.
  - `BR-AU03`: Tuyệt đối không cho phép gán một Vai trò đang ở trạng thái Inactive cho một người dùng mới tạo.

#### UC-11: Deactivate User (Vô hiệu hóa tài khoản)
* **Primary Actors:** Administrator.
* **Preconditions:** Admin đã đăng nhập Web, tài khoản mục tiêu cần vô hiệu hóa phải tồn tại và đang ở trạng thái Active.
* **Postconditions:** Trạng thái tài khoản mục tiêu chuyển sang Deactivated, chặn truy cập đăng nhập tương lai, dữ liệu lịch sử vận hành/đơn hàng được bảo toàn nguyên vẹn trong DB (Chống cascade delete).
* **Normal Flow:**
  - 1. Admin mở mục Quản lý người dùng và chọn tài khoản nhân sự cụ thể.
  - 2. Hệ thống hiển thị màn hình chi tiết thông tin nhân sự.
  - 3. Admin bấm chọn nút "Vô hiệu hóa tài khoản" (Deactivate User).
  - 4. Hệ thống hiển thị Popup Modal yêu cầu xác nhận hành động nguy hiểm.
  - 5. Admin bấm nút "Xác nhận vô hiệu hóa".
  - 6. Hệ thống kiểm tra các ràng buộc nghiệp vụ hệ thống đối với tài khoản này.
  - 7. Hệ thống cập nhật trường trạng thái tài khoản sang `Status = Deactivated`.
  - 8. Tự động thu hồi/invalidate toàn bộ các Token session đang hoạt động của tài khoản bị khóa.
  - 9. Ghi vết hành động vào Activity Log của Admin.
  - 10. Hiển thị thông báo thành công `MSG-DU04`.
* **Exception Flows:**
  - **E1: Admin tự khóa chính mình:** Tại bước 6, hệ thống phát hiện ID tài khoản mục tiêu trùng khớp với ID tài khoản Admin đang thực hiện phiên làm việc. Hệ thống trả về lỗi nghiêm trọng `MSG-DU02` và hủy bỏ tác vụ.
* **Business Rules:**
  - `BR-DU02`: Nghiêm cấm sử dụng lệnh xóa vật lý (Physical Delete - `DELETE FROM`) đối với thực thể người dùng. Tất cả phải sử dụng cơ chế xóa mềm / vô hiệu hóa trạng thái (Soft Delete) để đảm bảo tính toàn vẹn của dữ liệu kiểm toán đơn hàng quá khứ.

---

### 2.3 Module Quản lý đơn hàng & Vận hành (Manager Use Cases)

#### UC-50: Create Quotation (Khởi tạo bảng báo giá)
* **Primary Actors:** Manager.
* **Preconditions:** Manager đã đăng nhập thành công. Thông tin khách hàng đã có hoặc sẵn sàng đăng ký mới. Danh mục biểu giá dịch vụ/thiết bị của Admin đang có hiệu lực.
* **Postconditions:** Một bản ghi báo giá (Quotation) mới được thiết lập kèm theo danh sách các mặt hàng chi tiết, tổng giá trị được tính toán tự động, sẵn sàng để gửi duyệt hoặc chỉnh sửa.
* **Normal Flow:**
  - 1. Manager mở phân hệ "Quản lý báo giá" (Quotation Management).
  - 2. Hệ thống hiển thị danh sách báo giá và nút hành động.
  - 3. Manager chọn "Tạo báo giá mới" (Create Quotation).
  - 4. Hệ thống hiển thị Form thiết kế báo giá sự kiện.
  - 5. Manager thực hiện chọn Hồ sơ khách hàng từ dropdown list.
  - 6. Manager nhập thông tin sự kiện và bấm chọn các Gói dịch vụ, Thiết bị thuê lẻ từ danh mục hệ thống, điền số lượng tương ứng, nhập tỷ lệ chiết khấu (Discount) nếu có.
  - 7. Hệ thống tự động gọi cấu hình giá hiệu lực, thực hiện nhân chuỗi số lượng và tính toán tổng số tiền real-time hiển thị lên màn hình.
  - 8. Manager rà soát toàn bộ cấu trúc bảng giá.
  - 9. Manager bấm nút "Nộp báo giá".
  - 10. Hệ thống thực hiện kiểm tra validation toàn vẹn dữ liệu.
  - 11. Hệ thống lưu thông tin báo giá với trạng thái khởi tạo.
  - 12. Ghi nhật ký hành động vào Activity Log. Displays thành công `MSG-QT04`.
* **Exception Flows:**
  - **E1: Thiếu cấu hình giá (Active Pricing Missing):** Tại bước 7, hệ thống phát hiện một hoặc nhiều thiết bị/dịch vụ được chọn chưa được Admin cấu hình định mức giá trong khoảng thời gian diễn ra sự kiện. Hệ thống chặn lại, đánh dấu đỏ vào dòng sản phẩm lỗi và hiển thị cảnh báo lỗi `MSG-QT02`. Manager bắt buộc phải gỡ bỏ hạng mục đó hoặc yêu cầu Admin cập nhật biểu giá trước khi tiếp tục.

#### UC-56: Create Order (Khởi tạo đơn hàng sự kiện)
* **Primary Actors:** Manager.
* **Preconditions:** Đã đăng nhập hệ thống, thông tin khách hàng và nhu cầu đặt tiệc cơ bản thu thập thành công.
* **Postconditions:** Bản ghi đơn hàng (Order) được khởi tạo với mã code định danh duy nhất, trạng thái ban đầu là Draft/Pending, kết nối với thông tin khách hàng, làm tiền đề để chạy các luồng khảo sát, báo giá.
* **Normal Flow:**
  - 1. Manager mở mục Quản lý vòng đời đơn hàng (Order Lifecycle Management).
  - 2. Bấm chọn tính năng "Tạo đơn hàng mới" (Create Order).
  - 3. Hệ thống hiển thị giao diện nhập liệu thông tin đơn hàng.
  - 4. Manager liên kết đơn hàng với hồ sơ khách hàng.
  - 5. Manager nhập các tham số bắt buộc: Ngày dự kiến tổ chức sự kiện (Event Date), Địa điểm tổ chức (Event Location), các yêu cầu dịch vụ sơ bộ và ghi chú chú đặc biệt.
  - 6. Manager kết nối bảng báo giá (Quotation) tương ứng (nếu đã lập trước) hoặc để bổ sung sau.
  - 7. Manager bấm nút "Khởi tạo đơn hàng".
  - 8. Hệ thống chạy tầng validation dữ liệu đầu vào.
  - 9. Hệ thống tạo lập thực thể Order trong database với trạng thái mặc định ban đầu.
  - 10. Ghi log sự kiện, hiển thị thông báo thành công `MSG-CO03`.
* **Exception Flows:**
  - **E1: Ngày sự kiện trống hoặc không hợp lệ:** Hệ thống kiểm tra Ngày sự kiện bỏ trống hoặc nằm trong quá khứ so với thời gian thực của hệ thống. Hệ thống hiển thị thông báo lỗi `MSG-CO02`, yêu cầu điều chỉnh dữ liệu mốc thời gian.

#### UC-58: Confirm Order (Xác nhận đơn hàng & Khóa kho thiết bị)
* **Primary Actors:** Manager.
* **Preconditions:** Đơn hàng hiện hữu, Báo giá đã được Khách hàng chốt (Confirmed Quotation), Hồ sơ minh chứng đóng tiền đặt cọc (Deposit Payment Evidence) đã được phê duyệt xác thực thành công.
* **Postconditions:** Trạng thái đơn hàng chuyển dịch sang Confirmed. Hệ thống kích hoạt ngầm lệnh đóng băng kho, giữ chỗ (Reserve) toàn bộ danh sách thiết bị nội bộ theo ngày sự kiện của đơn hàng, ngăn chặn tuyệt đối các đơn hàng khác thuê trùng gây thiếu hụt đồ.
* **Normal Flow:**
  - 1. Manager mở danh sách đơn hàng, tìm kiếm đơn hàng đạt điều kiện chốt.
  - 2. Hệ thống hiển thị chi tiết hồ sơ đơn hàng, trạng thái báo giá và lịch sử giao dịch đặt cọc.
  - 3. Manager bấm chọn nút "Xác nhận đơn hàng" (Confirm Order).
  - 4. Hệ thống chạy thuật toán kiểm tra chéo tự động: Trạng thái Quotation = Confirmed; Trạng thái cọc = Paid/Confirmed; Kiểm tra độ sẵn sàng thực tế của kho vật tư cho ngày cưới đó.
  - 5. Hệ thống thực hiện phân bổ và lưu bản ghi đóng băng kho (Reserve Internal Inventory) tương ứng với số lượng thiết bị của đơn hàng.
  - 6. Hệ thống cập nhật trạng thái đơn hàng sang `Status = Confirmed`.
  - 7. Ghi nhật ký kiểm toán tài chính và vận hành vào Activity Log.
  - 8. Hiển thị thông báo thành công `MSG-COR04`.
* **Exception Flows:**
  - **E1: Thiếu hụt kho thực tế (Inventory Conflict):** Tại bước 4, trong quá trình chạy quét kiểm tra kho động, hệ thống phát hiện số lượng tồn kho khả dụng của một hoặc nhiều thiết bị tại ngày sự kiện đó nhỏ hơn số lượng đơn hàng yêu cầu (do các đơn hàng chốt trước đã chiếm dụng hết slot khả dụng). Hệ thống chặn đứng quy trình chuyển đổi trạng thái, hiển thị danh sách các thiết bị thiếu hụt kèm số lượng chênh lệch (`MSG-COR03`). Manager bắt buộc phải chuyển sang phương án Thuê ngoài từ Supplier (UC-71) để bù đắp số lượng thiếu hụt trước khi hệ thống cho phép chốt đơn hàng chính thức.

---

### 2.4 Module Vận hành hiện trường (Leader Staff Use Cases)

#### UC-91: Conduct and Submit Survey Report (Thực hiện và nộp báo cáo khảo sát hiện trường)
* **Primary Actors:** Leader Staff.
* **Secondary Actors:** Manager.
* **Preconditions:** Leader Staff đã đăng nhập Mobile App thành công, Task khảo sát sảnh cưới đã được Manager phân công trực tiếp cho Leader này.
* **Postconditions:** Dữ liệu báo cáo khảo sát được lưu trữ thành công trên mây, trạng thái Task chuyển sang Completed, hệ thống bắn Alert thông báo đến Manager.
* **Normal Flow:**
  - 1. Leader Staff mở ứng dụng Mobile App, truy cập phân hệ "Quản lý tác vụ hiện trường" (Assigned Field Task Management).
  - 2. Hệ thống hiển thị danh sách các Tasks khảo sát được giao.
  - 3. Leader chọn tác vụ khảo sát của đơn hàng mục tiêu.
  - 4. Hệ thống hiển thị thông tin tóm tắt: Vị trí sảnh, thông tin liên hệ, sơ đồ cơ bản, checklist khảo sát.
  - 5. Leader Staff thực hiện đo đạc thực tế tại sảnh cưới và nhập các dữ liệu trường thông tin: Kích thước dài/rộng/cao, điều kiện đường vận chuyển xe tải, phương án nguồn cấp điện thi công, các lưu ý ràng buộc của trung tâm hội nghị.
  - 6. Leader Staff kích hoạt camera trên App để chụp ảnh hiện trường thực địa và tải trực tiếp lên form báo cáo.
  - 7. Leader Staff kiểm tra lại cấu trúc văn bản báo cáo.
  - 8. Leader Staff bấm nút "Nộp báo cáo khảo sát" (Submit Survey Report).
  - 9. Hệ thống chạy logic validation kiểm tra các trường bắt buộc và tệp tin đính kèm.
  - 10. Hệ thống lưu trữ dữ liệu báo cáo khảo sát vào DB, cập nhật trạng thái tác vụ vận hành.
  - 11. Hệ thống phát tín hiệu thông báo Web Socket gửi đến giao diện của Manager.
  - 12. Hiển thị thông báo thành công trên giao diện điện thoại `MSG-SV03`.
* **Alternative Flows:**
  - **A1: Lưu bản nháp (Save as Draft):** Tại bước 8, Leader Staff chưa thu thập đủ thông số hoặc mất kết nối mạng tạm thời, chọn nút "Lưu bản nháp". Hệ thống lưu trữ cục bộ/tạm thời dữ liệu hiện có (`MSG-SV04`), không chuyển trạng thái tác vụ và không phát thông báo cho Manager.
* **Exception Flows:**
  - **E1: Lỗi tải lên tệp tin hình ảnh (Upload Failure):** Tại bước 6, tệp tin hình ảnh dung lượng quá lớn hoặc kết nối mạng internet hiện trường bị ngắt quãng giữa chừng. Ứng dụng hiển thị thông báo lỗi `MSG-SV01`. Bản báo cáo bị giữ lại không cho submit cho đến khi hình ảnh được upload thành công.
* **Business Rules:**
  - `BR-SV01`: Chỉ có tài khoản Leader Staff được gán trực tiếp vào Task khảo sát mới có quyền thao tác nhập liệu và Submit báo cáo cho đơn hàng đó.
  - `BR-SV03`: Hình ảnh hiện trường mặt bằng là điều kiện validation bắt buộc (Mandatory Evidence) nhằm chống gian lận báo cáo khống.

#### UC-92: Confirm Warehouse Check-out (Xác nhận xuất kho thiết bị vật tư)
* **Primary Actors:** Leader Staff.
* **Secondary Actors:** Manager.
* **Preconditions:** Đơn hàng trạng thái Confirmed, Pick-list thiết bị đã được hệ thống và Manager phê duyệt xuất kho.
* **Postconditions:** Số lượng thiết bị bốc lên xe tải thực tế được ghi nhận chính xác, trạng thái thiết bị chuyển sang trạng thái Đang vận chuyển/Checked-out, số dư tồn kho vật lý bị trừ khấu trừ tương ứng.
* **Normal Flow:**
  - 1. Leader Staff mở Tác vụ xuất kho được giao trên Mobile App.
  - 2. Hệ thống hiển thị danh sách thiết bị cần chuẩn bị dựa theo cấu trúc Pick-list.
  - 3. Nhân viên kho bàn giao thiết bị, Leader Staff thực hiện kiểm đếm vật lý số lượng thực tế bốc lên xe.
  - 4. Leader Staff nhập con số số lượng thực tế xuất kho (Actual Check-out Quantity) cho từng dòng thiết bị trên App.
  - 5. Leader chọn trạng thái chất lượng thiết bị lúc rời kho (mặc định là Normal).
  - 6. Leader Staff bấm nút "Xác nhận xuất kho" (Submit check-out confirmation).
  - 7. Hệ thống kiểm tra đối chiếu chênh lệch giữa số lượng dự kiến (Pick-list) và số lượng thực tế nhập vào.
  - 8. Hệ thống lưu biên bản xuất kho, cập nhật trạng thái thiết bị sang trạng thái ngoài hiện trường.
  - 9. Hiển thị thông báo thành công `MSG-WC03`.
* **Alternative Flows:**
  - **A1: Phát hiện sai lệch số lượng so với kế hoạch:** Tại bước 4, số lượng thiết bị thực tế bốc lên xe bị thiếu hoặc thừa so với Pick-list dự kiến (do kho thiếu đồ đột xuất hoặc Leader chủ động đổi phương án). Hệ thống tự động kích hoạt highlight dòng thiết bị sai lệch (`MSG-WC01`) và bắt buộc Leader Staff phải nhập nội dung text "Lý do sai lệch" (Reason Note) vào ô trống bên cạnh thì mới kích hoạt được nút Submit.

---

### 2.5 Module Chấm công (Technical Staff Use Cases)

#### UC-103: Record Attendance (Chấm công nhân sự qua Mobile GPS)
* **Primary Actors:** Technical Staff.
* **Secondary Actors:** Leader Staff (Duyệt ca).
* **Preconditions:** Nhân viên đã đăng nhập Mobile App thành công, có ca làm việc/nhiệm vụ được phân công cụ thể trong ngày sự kiện. Thiết bị di động đã kích hoạt quyền truy cập định vị vị trí (GPS Location).
* **Postconditions:** Bản ghi chấm công thời gian thực được khởi tạo (Check-in/Check-out Timestamp) kèm tọa độ GPS địa điểm, trạng thái hiển thị là Chờ trưởng nhóm xác nhận (Pending Confirmation).
* **Normal Flow:**
  - 1. Nhân viên kỹ thuật đến địa điểm sảnh cưới, mở ứng dụng Mobile App.
  - 2. Truy cập vào chi tiết Tác vụ thi công/vận hành được giao trong ngày.
  - 3. Bấm chọn nút "Ghi nhận chấm công" (Record Attendance).
  - 4. Hệ thống hiển thị form chấm công gồm nút Check-in và Check-out.
  - 5. Nhân viên thực hiện bấm nút "Check-in" khi bắt đầu ca làm việc (hoặc "Check-out" khi kết thúc ca).
  - 6. Ứng dụng tự động bắt mốc thời gian thực từ server (Timestamp) và quét tọa độ vị trí vật lý của thiết bị di động (GPS Coordinates).
  - 7. Hệ thống thực hiện chạy thuật toán đối chiếu vị trí: Tọa độ GPS của nhân viên có nằm trong bán kính cho phép (ví dụ: 200m) so với tọa độ GPS của Địa điểm cưới cấu hình trên Đơn hàng hay không.
  - 8. Hệ thống lưu bản ghi lịch sử chấm công hợp lệ vào cơ sở dữ liệu.
  - 9. Cập nhật trạng thái chấm công sang Pending Confirmation chờ Trưởng nhóm sảnh cưới duyệt ca.
  - 10. Hiển thị thông báo chấm công thành công `MSG-RA04`.
* **Exception Flows:**
  - **E1: Nhân viên không có tên trong danh sách phân công (Roster Violation):** Tại bước 7, hệ thống đối chiếu ID tài khoản không nằm trong danh sách nhân sự được phân bổ cho Task này. Hệ thống chặn lại, không ghi nhận chấm công và trả về mã lỗi `MSG-RA01` ("Bạn không được phân công nhiệm vụ cho tác vụ này").
  - **E2: Gian lận vị trí chấm công (Geofence Breach):** Tại bước 7, hệ thống phát hiện tọa độ GPS của thiết bị di động vượt ra ngoài bán kính ranh giới cho phép của sảnh cưới sự kiện. Hệ thống chặn đứng tác vụ chấm công, lưu bản ghi trạng thái lỗi/gian lận để cảnh báo lên Dashboard của quản lý.
  - **E3: Chấm công trùng lặp ca (Duplicate Log):** Nhân viên bấm Check-in liên tiếp nhiều lần trong cùng một ca. Hệ thống trả về lỗi xung đột trùng lặp `MSG-RA02` và bỏ qua yêu cầu.
* **Business Rules:**
  - `BR-RA01`: Chỉ có nhân sự có tên trong danh sách phân công chính thức của Task mới được phép thực hiện chấm công ca đó.
  - `BR-RA03`: Dữ liệu chấm công thô bắt buộc phải đi qua 2 tầng xác nhận: Trưởng nhóm hiện trường duyệt (UC-104) và Quản lý chốt lương (UC-77) thì mới được đưa vào làm tham số đầu vào cho hàm tính toán lương Payroll.

---

## IV. Functional Requirements (Mô tả chi tiết cấu trúc Màn hình chức năng)

### 3.1 Giao diện Authentication Feature (Xác thực người dùng)

#### 3.1.1 Màn hình Đăng nhập (User Login Screen)
* **Bảng đặc tả thành phần giao diện (UI Component Specs):**
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **Email/Username** | Text Box | Ô nhập liệu chuỗi ký tự định danh tài khoản. Chống SQL Injection validation. Trường bắt buộc. |
  | 2 | **Password** | Password Box | Ô nhập chuỗi mật khẩu bảo mật. Tự động che dấu bằng ký tự dấu chấm (`*`). Có icon mắt bật/tắt hiển thị clear text. |
  | 3 | **Remember Me** | Checkbox | Cấu hình lưu trữ LocalStorage Token phiên làm việc dài hạn trên trình duyệt. |
  | 4 | **Forgot Password** | Hyperlink | Link điều hướng chuyển trang sang giao diện Khôi phục mật khẩu. |
  | 5 | **Login Button** | Button | Nút bấm gửi gói tin Payload `(username, password)` về API xác thực. Kích hoạt hiệu ứng loading spinner khi chờ phản hồi. |

#### 3.1.2 Màn hình Quên mật khẩu (Forgot Password Screen)
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **Email Address** | Text Box | Ô nhập Email liên kết tài khoản. Bắt buộc validate đúng định dạng RegEx Email (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`). |
  | 2 | **Send Reset Link**| Button | Nút kích hoạt gửi yêu cầu. Gọi API kiểm tra và kích hoạt chuỗi logic quy trình xác minh ngoại vi của Admin. |
  | 3 | **Back to Login** | Hyperlink | Hủy bỏ tác vụ nhập liệu, điều hướng quay trở lại màn hình Đăng nhập gốc. |

---

### 3.2 Giao diện Phân hệ Quản lý tài khoản & Nhân sự (User & Permission Management)

#### 3.2.1 Màn hình Danh sách nhân sự (User List Screen)
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **Refresh Button** | Icon Button | Bấm để kích hoạt tải lại dữ liệu bảng (Asynchronous Reload) từ Database mà không reload trang. |
  | 2 | **Create User Button**| Button | Nút hành động nổi bật màu xanh, bấm vào để mở Popup Modal Tạo tài khoản mới. |
  | 3 | **Search Input** | Text Box | Ô tìm kiếm tự động lọc danh sách nhân viên theo từ khóa chứa trong trường Tên hoặc trường Email. |
  | 4 | **Role Filter** | Dropdown | Menu thả xuống lọc nhanh nhân sự theo Vai trò. Giá trị mặc định là "All Roles". |
  | 5 | **Status Filter** | Dropdown | Bộ lọc trạng thái tài khoản (Active, Inactive, Deactivated). Mặc định là "All Statuses". |
  | 6 | **User Data Table** | Table Grid | Lưới dữ liệu gồm các cột: Ảnh Avatar, Họ và Tên, Email, Vai trò, Trạng thái (hiển thị Badge màu sắc), Ngày đăng nhập cuối, Cột Thao tác (Xem, Sửa, Khóa). |
  | 7 | **Pagination Controls**| Pagination | Thanh điều hướng phân trang (Trước, các số trang 1, 2, 3..., Sau), định mức hiển thị 10/25/50 bản ghi. |

#### 3.2.2 Giao diện Chi tiết tài khoản người dùng (User Detail Screen)
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **View History Button**| Button | Điều hướng admin sang màn hình xem toàn bộ lịch sử vết Audit Trail chi tiết của nhân viên này. |
  | 2 | **Edit User Button** | Button | Kích hoạt mở Popup Form chỉnh sửa thông tin nhân viên nhanh. |
  | 3 | **Personal Info Block**| Data Grid | Khối hiển thị thông tin tĩnh dạng nhãn đọc (Read-only): Mã nhân viên, Số điện thoại, Vị trí phòng ban, Địa chỉ. |
  | 4 | **Recent Activities Timeline**| Timeline | Bảng dòng thời gian hiển thị các hành động nghiệp vụ gần nhất của nhân sự thực hiện trên hệ thống. |
  | 5 | **Permissions Checklist**| Checklist | Hiển thị danh sách quyền hạn chi tiết (Permissions ACL) được thừa hưởng từ Vai trò tổng. |

---

### 3.3 Phân hệ Phụ trợ & Đối tác ngoại vi (Service, Equipment & Supplier Catalogs)

#### 3.3.1 Giao diện Danh mục nhóm dịch vụ (Service Category List Screen)
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **Search Input Field** | Text Box | Tìm kiếm danh mục theo chuỗi tên nhóm dịch vụ. |
  | 2 | **Status Filter** | Dropdown | Lọc trạng thái nhóm dịch vụ (Đang kinh doanh - Active, Ngừng kinh doanh - Inactive). |
  | 3 | **Create Category Button**| Button | Mở form khởi tạo một nhóm dịch vụ mới lên hệ thống. |
  | 4 | **Service Category Table**| Table Grid | Bảng hiển thị thông tin gồm: Mã danh mục, Tên nhóm dịch vụ, Mô tả ngắn, Số lượng dịch vụ con đính kèm, Trạng thái hoạt động, Ngày tạo. |

#### 3.3.2 Giao diện Hồ sơ chi tiết nhà cung cấp (Supplier Detail Screen)
  | No | Component Name | UI Type | Technical Specification / Business Logic |
  | :-: | :--- | :--- | :--- |
  | 1 | **Supplier Header Block**| Data Block | Hiển thị Tên Supplier lớn, Mã nhà cung cấp (`SUP-001`), kèm theo Trạng thái xác minh hợp tác dưới dạng Badge màu sắc. |
  | 2 | **Edit Button** | Button | Mở form Sửa đổi thông tin Supplier (Edit Supplier Dialog). |
  | 3 | **Basic Information Block**| Data Grid | Lưới hiển thị các trường dữ liệu: Tên người đại diện, Mã số thuế, Điều khoản thanh toán mặc định (Net 30, gối đầu ca). |
  | 4 | **Contact Info Panel**| Info Panel | Hiển thị thông tin liên lạc: Số điện thoại hotline, Địa chỉ email nhận PO, Link Website. |
  | 5 | **Current Debt Counter**| Text Counter| Hiển thị tổng số tiền công nợ hiện tại công ty đang nợ Supplier (Hiển thị màu đỏ đậm). |
  | 6 | **Create Purchase Order**| Button | Cho phép Manager khởi tạo ngay một đơn hàng thuê/mua vật tư thiết bị mới (PO) kết nối với Supplier này. |
  | 7 | **Recent Orders Table** | Table Grid | Bảng danh sách đơn hàng giao dịch gần đây: Mã đơn hàng (Hyperlink), Tên sự kiện sử dụng, Ngày giao hàng, Tổng số tiền, Trạng thái thanh toán công nợ. |

---

## V. Yêu cầu phi chức năng & Phụ lục hệ thống (Non-Functional Requirements & Appendix)

### 4.1 Hệ thống Tin nhắn thông báo mẫu (System Messages Appendix)

#### 4.1.1 Nhóm Đăng nhập & Xác thực (Authentication Messages - `MSG-LG`)
* `MSG-LG01` (In red, under the text box): "Tên đăng nhập hoặc mật khẩu không chính xác."
* `MSG-LG02` (In red, under the text box): "Tài khoản này hiện đang bị tạm khóa hoặc đã deactive."
* `MSG-LG03` (Toast message): "Tài khoản của bạn đã bị khóa tạm thời do nhập sai quá số lần quy định. Vui lòng thử lại sau 15 phút."
* `MSG-LG04` (In red, under the text box): "Vai trò của tài khoản này không được cấp phép quyền truy cập vào nền tảng Web quản trị."
* `MSG-LG05` (Toast message): "Quá nhiều lần đăng nhập thất bại. Tài khoản của bạn đã bị khóa tạm thời."

#### 4.1.2 Nhóm Quản lý người dùng (User Management Messages - `MSG-AU / MSG-DU`)
* `MSG-AU01` (In red, under text box): "Tên đăng nhập là bắt buộc."
* `MSG-AU02` (In red, under text box): "Tên người dùng hoặc địa chỉ Email này đã tồn tại trên hệ thống."
* `MSG-AU03` (In red, under text box): "Vai trò là bắt buộc."
* `MSG-AU04` (In red, under text box): "Vai trò được chọn hiện đang không hoạt động."
* `MSG-AU05` (In red, under text box): "Hệ thống không thể tạo tài khoản người dùng."
* `MSG-AU06` (Toast message): "Tài khoản nhân sự mới đã được khởi tạo thành công."
* `MSG-DU01` (In red): "Tài khoản này đã bị vô hiệu hóa từ trước."
* `MSG-DU02` (Popup dialog alert): "Bạn không được phép tự vô hiệu hóa tài khoản active chính mình đang sử dụng."
* `MSG-DU03` (In red): "Tài khoản này không thể vô hiệu hóa do ràng buộc quy tắc hệ thống."
* `MSG-DU04` (Toast message): "Tài khoản người dùng đã được vô hiệu hóa thành công, toàn bộ session phiên làm việc đã bị hủy bỏ."

#### 4.1.3 Nhóm Quản lý Báo giá & Đơn hàng (Quotation & Order Messages - `MSG-QT / MSG-COR`)
* `MSG-QT01` (In red, under the combo box): "Vui lòng lựa chọn hồ sơ thông tin khách hàng liên kết với báo giá."
* `MSG-QT02` (Popup warning block): "Thiếu dữ liệu cấu hình biểu giá có hiệu lực của Admin cho một số hạng mục thiết bị được chọn."
* `MSG-QT03` (In red): "Thông tin báo giá không hợp lệ hoặc không đầy đủ."
* `MSG-QT04` (Toast message): "Báo giá đã được tạo thành công."
* `MSG-COR01` (In red): "Báo giá phải được xác nhận trước khi xác nhận đơn hàng."
* `MSG-COR02` (In red): "Khoản tiền đặt cọc phải được xác nhận trước khi xác nhận đơn hàng."
* `MSG-COR03` (Toast window): "Xung đột kho thiết bị! Một số thiết bị nội bộ không đủ số lượng khả dụng cho ngày sự kiện yêu cầu."
* `MSG-COR04` (Toast message): "Đơn hàng tiệc cưới đã được xác nhận thành công. Hệ thống đã đóng băng giữ chỗ thiết bị kho."

#### 4.1.4 Nhóm Vận hành hiện trường (Field Operation Messages - `MSG-SV / MSG-WC / MSG-ST`)
* `MSG-SV01` (Toast message): "Lỗi tải ảnh hiện trường thất bại. Vui lòng kiểm tra lại cấu hình kết nối mạng internet di động."
* `MSG-SV02` (In red): "Thông tin báo cáo khảo sát bị thiếu hoặc không hợp lệ."
* `MSG-SV03` (Toast message): "Báo cáo khảo sát đã được gửi cho Quản lý thành công."
* `MSG-SV04` (Toast message): "Báo cáo khảo sát đã được lưu dưới dạng bản nháp."
* `MSG-WC01` (In line input box): "Số lượng bốc xuất thực tế sai lệch so với Pick-list dự kiến. Bạn bắt buộc phải bổ sung lý do giải trình."
* `MSG-WC02` (In red): "Thông tin xuất kho không hợp lệ hoặc không đầy đủ."
* `MSG-WC03` (Toast message): "Xác nhận xuất kho vật tư thành công."
* `MSG-RA01` (In line error message): "Lỗi xác thực định vị! Bạn không được phân công nhiệm vụ vận hành tại Task hiện sảnh này."
* `MSG-RA02` (In line error message): "Chấm công ca làm việc này đã được ghi nhận trước đó."
* `MSG-RA03` (In line error message): "Trạng thái tác vụ không cho phép thực hiện ghi nhận chấm công."
* `MSG-RA04` (Toast message): "Chấm công ca làm việc đã được ghi nhận thành công."
* `MSG-ST01` (In red, under text area): "Thông tin quyết toán sảnh không hợp lệ hoặc tính toán sai lệch giá trị cân đối balance."
* `MSG-ST02` (Toast message): "Báo cáo chi tiết số liệu quyết toán thực địa đã được ghi nhận và lưu trữ thành công."
* `MSG-SA01` (In red): "Thông tin nộp phê duyệt quyết toán không hợp lệ hoặc thiếu chứng từ."
* `MSG-SA02` (Toast message): "Hồ sơ quyết toán sự kiện đã được gửi lên cho Manager phê duyệt trực tuyến thành công."