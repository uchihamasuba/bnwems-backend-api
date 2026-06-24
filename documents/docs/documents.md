# CONTEXT_VI.md — ERP Quản lý Sự kiện (Bình Nguyễn)

> Nguồn: Software Requirement Specification (Báo cáo 3, tháng 6/2026)
> Mục đích: Input cho `/grill-with-docs` — xác lập ngôn ngữ chung trước khi code.

---

## 1. Tổng quan hệ thống

**Hệ thống là gì:** Ứng dụng ERP nội bộ gồm web + mobile cho công ty tổ chức tiệc cưới và sự kiện (tên thương hiệu "Bình Nguyễn" trong mockup UI).

**Quản lý gì:** Toàn bộ vòng đời của đơn hàng sự kiện — từ báo giá và đặt cọc, qua thực thi hiện trường (khảo sát, lắp đặt, bàn giao), đến thanh toán cuối và hoàn trả thiết bị.

**Nền tảng:**

- **Web app:** Vai trò Admin, Manager
- **Mobile app:** Vai trò Leader Staff, Technical Staff

**Tích hợp bên ngoài:** Cổng thanh toán VNPay (tạo mã QR, callback trạng thái thanh toán)

---

## 2. Các Tác nhân (Vai trò)

| Vai trò                                  | Nền tảng      | Trách nhiệm                                                                                                       |
| ---------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Administrator (Quản trị viên)**        | Web           | Quản lý user/role/permission, dữ liệu master (thiết bị, dịch vụ, nhà cung cấp, kho), cấu hình chính sách, báo cáo |
| **Manager (Quản lý)**                    | Web           | Toàn bộ vòng đời đơn hàng, báo giá, thanh toán, phân công nhân sự, giám sát hiện trường, quyết toán               |
| **Leader Staff (Nhân viên trưởng nhóm)** | Mobile        | Thực thi tại chỗ: khảo sát, xuất kho, cập nhật tiến độ, bàn giao, ghi nhận hư hỏng/mất mát, xác nhận điểm danh    |
| **Technical Staff (Nhân viên kỹ thuật)** | Mobile        | Xem nhiệm vụ, chuẩn bị thiết bị, ghi nhận điểm danh                                                               |
| **VNPay**                                | API bên ngoài | Tạo mã QR thanh toán và trả về trạng thái thanh toán                                                              |

---

## 3. Ngôn ngữ Nghiệp vụ Chung (Domain Glossary)

### Vòng đời Đơn hàng

**Đơn hàng (Order)** — Giao dịch dịch vụ với khách hàng từ yêu cầu ban đầu đến hoàn thành hoặc hủy. Bắt buộc có: Khách hàng, Ngày sự kiện, Địa điểm, liên kết Báo giá. Vòng đời: `Nháp → Đã xác nhận → Đang thực hiện → Đã quyết toán → Hoàn thành/Đóng | Đã hủy`.

**Báo giá (Quotation)** — Tài liệu định giá có version do Manager tạo trước khi xác nhận đơn hàng. Chứa các Hạng mục báo giá (dịch vụ, thiết bị, gói) với số lượng và đơn giá. Phải được Xác nhận trước khi có thể xác nhận Đơn hàng. Không thể sửa sau khi đơn hàng đã xác nhận.

**Hạng mục báo giá (Quotation Item)** — Một dòng trong Báo giá: Danh mục hàng hóa + số lượng + đơn giá đã báo.

**Xác nhận đơn hàng (Order Confirmation)** — Hành động khóa Đơn hàng sau khi cả Báo giá và Thanh toán đặt cọc đều được xác nhận. Kích hoạt Đặt chỗ kho hàng theo Ngày sự kiện.

**Ngày sự kiện (Event Date)** — Ngày diễn ra sự kiện của khách hàng. Quyết định kiểm tra tồn kho, đặt chỗ và lịch trình. Chỉ được thay đổi theo Chính sách đổi ngày.

**Trạng thái đơn hàng (Order Status)** — Giai đoạn hiện tại trong vòng đời Đơn hàng. Quyết định các thao tác được phép (cập nhật, xác nhận, hủy, đổi ngày).

**Lịch sử trạng thái đơn hàng (Order Status History)** — Nhật ký bất biến của tất cả các lần chuyển trạng thái.

### Thanh toán & Quyết toán

**Đặt cọc (Deposit)** — Khoản thanh toán trước một phần, bắt buộc trước khi Xác nhận đơn hàng. Số tiền tính theo Chính sách đặt cọc hiện hành áp dụng trên tổng báo giá đã xác nhận.

**Yêu cầu thanh toán đặt cọc (Deposit Payment Request)** — Bản ghi hệ thống do Manager tạo sau khi Báo giá được xác nhận. Khởi động quy trình tạo mã QR hoặc tải lên chứng từ thanh toán thủ công.

**Chứng từ thanh toán (Payment Evidence)** — File (ảnh chụp màn hình chuyển khoản, hình biên lai tiền mặt) được tải lên bởi Leader Staff hoặc tự động nhận từ callback VNPay. Phải được Manager xác nhận trước khi thanh toán được chấp nhận.

**Quyết toán (Settlement)** — Đối soát tài chính cuối cùng của Đơn hàng. Gồm: giá trị đơn hàng + phụ phí + bồi thường hư hỏng/mất mát + số tiền đã thanh toán + số dư còn lại. Phải được Manager xác nhận trước khi thanh toán cuối.

**Thanh toán cuối (Final Payment)** — Khoản thanh toán cuối để đóng Đơn hàng. Sau khi thanh toán cuối + tất cả dữ liệu vận hành bắt buộc được xác nhận → trạng thái đơn hàng → `Hoàn thành/Đóng`.

**Thanh toán QR (QR Payment)** — Liên kết thanh toán/mã QR do VNPay tạo cho một số tiền cụ thể. Dự phòng: thanh toán thủ công bằng chứng từ nếu VNPay không khả dụng.

### Danh mục & Giá

**Danh mục hàng hóa (Catalog Item)** — Dịch vụ, thiết bị, vật liệu, hàng tiêu hao hoặc gói dịch vụ dùng trong Báo giá và Đơn hàng. Loại: `Dịch vụ | Thiết bị | Vật liệu | Hàng tiêu hao | Gói dịch vụ`.

**Gói dịch vụ (Package)** — Danh mục hàng hóa được cấu thành từ nhiều Danh mục hàng hóa khác (định nghĩa qua Catalog Item Composition).

**Giá hàng hóa (Item Price)** — Bản ghi giá của Danh mục hàng hóa theo ngày hiệu lực. Chỉ một giá hiện hành cho mỗi item+loại_giá tại một thời điểm. Lịch sử giá được lưu giữ (không bao giờ xóa). Hàng hóa không hoạt động không được cấu hình giá mới.

**Danh mục dịch vụ (Service Category)** — Nhóm phân loại Danh mục dịch vụ (ví dụ: Âm thanh/Ánh sáng, Ăn uống).

**Danh mục thiết bị (Equipment Category)** — Nhóm phân loại Danh mục thiết bị (ví dụ: Sân khấu, Trang trí).

### Kho hàng & Tồn kho

**Số dư tồn kho (Inventory Balance)** — Số lượng hiện có của một Danh mục hàng hóa trong Kho, phân chia theo tình trạng vật lý (Có sẵn, Đang sử dụng, Bảo trì, Hư hỏng).

**Đặt chỗ kho hàng (Inventory Reservation)** — Số lượng Danh mục hàng hóa được đặt chỗ cho một Đơn hàng đã xác nhận theo Ngày sự kiện. Hàng đã đặt chỗ không thể phân bổ cho Đơn hàng khác cùng ngày.

**Kiểm tra tồn kho theo ngày (Date-based Inventory Check)** — Kiểm tra tồn kho còn trống (chưa đặt chỗ) cho một Ngày sự kiện và danh sách thiết bị cần thiết. KHÔNG tạo đặt chỗ.

**Phiếu xuất kho (Pick List)** — Danh sách có thứ tự gồm Danh mục hàng hóa + số lượng do Manager tạo cho một nhiệm vụ vận hành cụ thể (xuất kho, vận chuyển, lắp đặt, thu hồi, hoàn trả). Chỉ nhân viên được phân công mới xem được phiếu của mình.

**Giao dịch kho (Warehouse Transaction)** — Sự kiện dịch chuyển vật lý: xuất kho, nhập kho, điều chỉnh.

**Xác nhận xuất kho (Warehouse Check-out)** — Leader Staff xác nhận số lượng thiết bị thực tế lấy ra khỏi kho. Số lượng có thể khác Phiếu xuất kho (chênh lệch phải ghi lý do).

### Vận hành hiện trường

**Nhiệm vụ công việc (Work Task)** — Nhiệm vụ vận hành rời rạc liên kết với Đơn hàng. Loại: `Khảo sát | Chuẩn bị | Vận chuyển | Lắp đặt | Thu hồi | Hoàn trả kho | Nhận thiết bị NCC | Trả thiết bị NCC`.

**Phân công (Assignment)** — Liên kết một Người dùng nội bộ (Leader hoặc Technical Staff) cụ thể vào một Nhiệm vụ công việc.

**Khảo sát (Survey)** — Kiểm tra thực địa bởi Leader Staff trước khi hoàn thiện báo giá/kế hoạch. Kết quả: Báo cáo khảo sát với số đo thực tế, ảnh, hạn chế địa điểm.

**Báo cáo khảo sát (Survey Report)** — Do Leader Staff nộp, Manager xem xét. Kích hoạt Kiểm tra lại tồn kho sau khảo sát.

**Cập nhật tiến độ hiện trường (Field Progress Update)** — Leader Staff ghi nhận tiến độ vận chuyển/lắp đặt/thu hồi/hoàn trả, trạng thái, ghi chú và bằng chứng trong quá trình thực thi.

**Yêu cầu thay đổi (Change Request)** — Yêu cầu tại chỗ của Leader Staff để thêm/bỏ/thay thế thiết bị trong quá trình thực thi. Trạng thái: `Chờ duyệt → Đã duyệt | Từ chối`. Chỉ ảnh hưởng chi phí/kho SAU KHI Manager duyệt.

**Biên bản bàn giao (Handover Record)** — Leader Staff ghi nhận và tải lên bằng chứng bàn giao thiết bị cho khách hàng sau lắp đặt. Manager xác nhận.

**Biên bản hư hỏng/mất mát (Damage/Loss Record)** — Leader Staff ghi nhận thiết bị hư hỏng hoặc mất mát kèm bằng chứng. Manager xác nhận. Có thể kích hoạt tính toán bồi thường.

**Thiết bị đã thu hồi (Collected Equipment)** — Thiết bị được Leader Staff ghi nhận là đã thu gom từ địa điểm sau khi sự kiện kết thúc. Trước bước Hoàn trả kho.

**Báo cáo hoàn trả kho (Inventory Return Report)** — Tổng hợp do Leader Staff nộp về toàn bộ thiết bị đã thu hồi + hoàn trả + phân loại. Kích hoạt xác nhận tồn kho từ Manager.

**Phân loại thiết bị hoàn trả (Classify Returned Equipment)** — Leader Staff gán tình trạng cho từng thiết bị trả về: `Bình thường | Mất mát | Hư hỏng | Cần bảo trì | Cần vệ sinh`.

### Nhà cung cấp (Supplier)

**Nhà cung cấp (Supplier)** — Đối tác bên thứ ba cung cấp thiết bị thuê hoặc vật tư mua.

**Giao dịch nhà cung cấp (Supplier Transaction)** — Bản ghi thuê hoặc mua với Nhà cung cấp cho một Đơn hàng.

**Công nợ nhà cung cấp (Supplier Payable)** — Số tiền còn nợ Nhà cung cấp từ một giao dịch. Trạng thái: `Chưa thanh toán | Thanh toán một phần | Đã thanh toán`.

**Biên bản nhận thiết bị NCC (Supplier Equipment Receipt)** — Leader Staff ghi nhận thiết bị thuê từ NCC nhận được (số lượng, tình trạng, thời gian). Liên kết với Giao dịch thuê NCC.

**Biên bản trả thiết bị NCC (Supplier Equipment Return)** — Leader Staff ghi nhận thiết bị trả lại cho NCC (số lượng, tình trạng). Chênh lệch số lượng phải ghi lý do.

### Nhân sự & Lương

**Điểm danh (Attendance)** — Bản ghi ca làm việc của một nhân viên trong nhiệm vụ được phân công. Technical Staff được xác nhận điểm danh bởi Leader Staff; Leader Staff được xác nhận bởi Manager.

**Quy tắc lương (Wage Rule)** — Mức lương theo ca làm việc do Admin cấu hình, theo vai trò nhân sự (Leader Staff hoặc Technical Staff) với ngày hiệu lực. Chỉ một quy tắc hiện hành cho mỗi vai trò tại một thời điểm.

**Tổng hợp lương (Wage Summary)** — Tóm tắt bảng lương theo tháng cho từng nhân viên dựa trên bản ghi Điểm danh đã xác nhận và Quy tắc lương hiện hành.

**Khấu trừ lương (Wage Deduction)** — Giảm trừ từ lương nhân viên, ví dụ: bồi thường thiết bị hư hỏng/mất mát thuộc trách nhiệm của họ.

### Chính sách (Admin cấu hình)

**Chính sách đặt cọc (Deposit Policy)** — Định nghĩa tỷ lệ/số tiền đặt cọc, ngày hiệu lực. Một chính sách hiện hành tại một thời điểm. Lịch sử được lưu giữ.

**Chính sách hủy đơn (Cancellation Policy)** — Định nghĩa các mức hoàn tiền theo ngưỡng số ngày trước sự kiện. Một chính sách hiện hành tại một thời điểm. Lịch sử được lưu giữ.

**Chính sách bồi thường (Compensation Policy)** — Định nghĩa quy tắc tính bồi thường cho thiết bị hư hỏng/mất mát.

**Chính sách phụ phí (Additional Fee Policy)** — Quy tắc tính phí phát sinh thêm (tăng ca, thay đổi gấp, thiết bị bổ sung, phụ phí khoảng cách). Nhiều loại phí, mỗi loại có ngày hiệu lực riêng.

**Chính sách đổi ngày (Date-Change Policy)** — Quy tắc quy định điều kiện cho phép thay đổi Ngày sự kiện của Đơn hàng.

### Xác thực & Phân quyền

**Vai trò (Role)** — Nhóm trách nhiệm hệ thống. Giá trị: `Admin | Manager | Leader Staff | Technical Staff`.

**Quyền (Permission)** — Một chức năng hệ thống hoặc quyền truy cập cụ thể. Gán cho Vai trò, không gán trực tiếp cho người dùng.

**Nhật ký hoạt động (Activity Log / Audit Log)** — Bản ghi bất biến về tất cả các hành động quan trọng. Bắt buộc cho: đăng nhập, CRUD user, thay đổi chính sách, thay đổi vai trò, chuyển trạng thái đơn hàng, xác nhận thanh toán, các thao tác lương.

**File bằng chứng (Evidence File)** — File đính kèm hỗ trợ (ảnh, PDF, biên lai). Liên kết với: Báo cáo khảo sát, Biên bản hư hỏng/mất mát, Yêu cầu thay đổi, Chứng từ thanh toán, Biên bản bàn giao.

---

## 4. Quy trình Nghiệp vụ Cốt lõi

### 4.1 Giai đoạn Trước đơn hàng

1. Manager đăng ký Khách hàng (nếu mới)
2. Manager tạo Báo giá (chọn Danh mục hàng hóa, hệ thống tính tổng tiền)
3. Manager kiểm tra sơ bộ Tồn kho theo ngày (chưa đặt chỗ)
4. Manager lên lịch và phân công Khảo sát cho Leader Staff
5. Leader Staff thực hiện khảo sát, nộp Báo cáo khảo sát kèm ảnh
6. Manager xem Báo cáo, kiểm tra lại Tồn kho
7. Manager cập nhật Báo giá nếu cần
8. Manager xác nhận Báo giá (khách hàng đồng ý ngoài hệ thống)
9. Manager tạo Yêu cầu thanh toán đặt cọc
10. Khách hàng đặt cọc (QR hoặc thủ công)
11. Leader Staff tải lên Chứng từ thanh toán (nếu tại chỗ) HOẶC callback VNPay tự xác nhận
12. Manager xác nhận Chứng từ thanh toán
13. Manager xác nhận Đơn hàng → Hệ thống đặt chỗ Tồn kho theo Ngày sự kiện

### 4.2 Giai đoạn Lập kế hoạch (sau khi đơn hàng đã xác nhận)

1. Manager tạo Phiếu xuất kho cho từng nhiệm vụ
2. Manager phân công Leader Staff và Technical Staff
3. Manager lập Lịch trình vận chuyển
4. Manager ghi nhận các giao dịch Thuê thiết bị NCC cần thiết

### 4.3 Giai đoạn Thực thi (ngày sự kiện)

1. Leader Staff xác nhận Xuất kho (số lượng thực tế vs phiếu)
2. Leader Staff ghi nhận Biên bản nhận thiết bị NCC
3. Leader Staff cập nhật Tiến độ hiện trường (vận chuyển → lắp đặt → dựng)
4. Leader Staff ghi nhận Biên bản bàn giao
5. Leader Staff nộp Yêu cầu thay đổi nếu phát sinh (Manager duyệt/từ chối)
6. Manager giám sát Tiến độ hiện trường theo thời gian thực
7. Leader Staff ghi nhận Chi tiết quyết toán + tải lên Chứng từ thanh toán khách hàng
8. Leader Staff nộp Quyết toán để Manager duyệt
9. Manager xác nhận Biên bản bàn giao
10. Manager duyệt Yêu cầu thay đổi
11. Manager xác nhận Chứng từ thanh toán

### 4.4 Giai đoạn Sau sự kiện

1. Leader Staff ghi nhận Thiết bị đã thu hồi
2. Leader Staff ghi nhận Hoàn trả thiết bị nội bộ
3. Leader Staff phân loại Tình trạng thiết bị hoàn trả
4. Leader Staff ghi nhận Biên bản hư hỏng/mất mát (nếu có)
5. Leader Staff nộp Báo cáo hoàn trả kho
6. Leader Staff ghi nhận Trả thiết bị NCC
7. Manager xác nhận Biên bản hư hỏng/mất mát
8. Manager xác nhận Hoàn trả kho
9. Manager xác nhận Quyết toán
10. Manager ghi nhận Thanh toán cuối → nếu đủ điều kiện → đơn hàng `Hoàn thành/Đóng`

### 4.5 Giai đoạn Lương thưởng

1. Nhân viên ghi nhận Điểm danh cho từng ca làm việc
2. Leader Staff xác nhận Điểm danh của Technical Staff
3. Manager xác nhận các ca làm việc hợp lệ
4. Manager xác nhận Dữ liệu lương (đối chiếu với Quy tắc lương hiện hành)
5. Admin xem Báo cáo lương

---

## 5. Danh sách Use Case (107 UC)

### Xác thực (Tất cả vai trò)

- UC-1: Đăng nhập
- UC-2: Đăng xuất
- UC-3: Quên mật khẩu
- UC-4: Đổi mật khẩu
- UC-5: Xem hồ sơ cá nhân
- UC-7: Nhận thông báo

### Admin — Quản lý người dùng & phân quyền

- UC-8: Xem danh sách người dùng
- UC-9: Tạo tài khoản người dùng
- UC-10: Cập nhật thông tin người dùng
- UC-11: Vô hiệu hóa tài khoản
- UC-12: Đặt lại mật khẩu người dùng
- UC-13: Gán vai trò cho người dùng
- UC-14: Xem danh sách vai trò
- UC-15: Tạo vai trò
- UC-16: Cập nhật vai trò
- UC-17: Vô hiệu hóa vai trò
- UC-18: Gán quyền cho vai trò

### Admin — Dữ liệu master & tham chiếu

- UC-19: Xem danh mục thiết bị
- UC-20: Tạo thiết bị
- UC-21: Cập nhật thiết bị
- UC-22: Vô hiệu hóa thiết bị
- UC-23: Xem danh mục dịch vụ
- UC-24: Tạo dịch vụ
- UC-25: Cập nhật dịch vụ
- UC-26: Vô hiệu hóa dịch vụ
- UC-27: Quản lý giá dịch vụ
- UC-28: Xem danh sách nhà cung cấp
- UC-29: Tạo nhà cung cấp
- UC-30: Cập nhật nhà cung cấp
- UC-31: Vô hiệu hóa nhà cung cấp
- UC-32: Xem thông tin kho
- UC-33: Cập nhật thông tin kho

### Admin — Cấu hình chính sách

- UC-34: Cấu hình chính sách đặt cọc
- UC-35: Cấu hình chính sách hủy đơn
- UC-36: Cấu hình chính sách bồi thường
- UC-37: Cấu hình chính sách phụ phí
- UC-38: Cấu hình quy tắc lương nhân sự

### Admin — Báo cáo

- UC-39A: Xem dashboard quản trị
- UC-40: Xem báo cáo doanh thu
- UC-41: Xem thống kê đơn hàng
- UC-42: Xem thống kê tồn kho
- UC-43: Xem thống kê nhân lực
- UC-44: Xem báo cáo hoàn trả kho
- UC-45: Xem báo cáo công nợ NCC
- UC-46: Xem báo cáo lương nhân sự

### Manager — Khách hàng

- UC-47: Xem thông tin khách hàng
- UC-48: Đăng ký khách hàng mới
- UC-49: Cập nhật thông tin khách hàng

### Manager — Báo giá

- UC-50: Tạo báo giá
- UC-51: Cập nhật báo giá
- UC-52: Xác nhận báo giá

### Manager — Vòng đời đơn hàng

- UC-39B: Xem dashboard vận hành
- UC-53: Xem danh sách đơn hàng
- UC-54: Xem chi tiết đơn hàng
- UC-55: Theo dõi trạng thái đơn hàng
- UC-56: Tạo đơn hàng
- UC-57: Cập nhật đơn hàng
- UC-58: Xác nhận đơn hàng
- UC-59: Đổi ngày sự kiện
- UC-60: Hủy đơn hàng

### Manager — Khảo sát

- UC-62: Lên lịch khảo sát
- UC-63: Phân công khảo sát
- UC-64: Giám sát tiến độ khảo sát
- UC-65: Xem báo cáo khảo sát

### Manager — Tồn kho

- UC-66: Kiểm tra sơ bộ tồn kho
- UC-67: Kiểm tra lại tồn kho sau khảo sát
- UC-68: Tạo phiếu xuất kho
- UC-69: Xem trạng thái hoàn trả kho
- UC-70: Xác nhận hoàn trả kho

### Manager — Nhà cung cấp

- UC-71: Ghi nhận thuê thiết bị NCC
- UC-72: Ghi nhận mua hàng NCC
- UC-73: Giám sát công nợ NCC
- UC-74: Ghi nhận thanh toán NCC

### Manager — Phân công & vận hành

- UC-75: Phân công nhân sự
- UC-76: Lập lịch vận chuyển
- UC-77: Xác nhận công việc nhân sự
- UC-78: Xác nhận dữ liệu lương nhân sự
- UC-79: Giám sát tiến độ hiện trường
- UC-80: Duyệt yêu cầu thay đổi
- UC-81: Xác nhận biên bản bàn giao
- UC-82: Xác nhận biên bản hư hỏng/mất mát

### Manager — Thanh toán & Quyết toán

- UC-83: Tạo yêu cầu thanh toán đặt cọc
- UC-84: Tạo thanh toán QR
- UC-85: Xác nhận chứng từ thanh toán
- UC-86: Xác nhận quyết toán
- UC-87: Ghi nhận thanh toán cuối

### Leader Staff (Mobile)

- UC-88: Xem danh sách nhiệm vụ được phân công
- UC-89: Xem chi tiết nhiệm vụ
- UC-90: Xem phiếu xuất kho
- UC-91: Thực hiện và nộp báo cáo khảo sát
- UC-92: Xác nhận xuất kho
- UC-93: Ghi nhận nhận thiết bị NCC
- UC-94: Ghi nhận trả thiết bị NCC
- UC-95: Cập nhật tiến độ hiện trường
- UC-96: Ghi nhận bằng chứng bàn giao
- UC-97: Nộp yêu cầu thay đổi
- UC-98: Ghi nhận biên bản hư hỏng/mất mát
- UC-99: Ghi nhận thiết bị đã thu hồi
- UC-100: Ghi nhận hoàn trả thiết bị nội bộ
- UC-101: Phân loại thiết bị hoàn trả
- UC-102: Nộp báo cáo hoàn trả kho
- UC-103: Ghi nhận điểm danh (chung với Technical Staff)
- UC-104: Xác nhận điểm danh Technical Staff
- UC-105: Tải lên chứng từ thanh toán khách hàng
- UC-106: Ghi nhận chi tiết quyết toán
- UC-107: Nộp quyết toán để Manager duyệt

### Technical Staff (Mobile)

- UC-88: Xem danh sách nhiệm vụ được phân công
- UC-89: Xem chi tiết nhiệm vụ
- UC-90: Xem phiếu xuất kho
- UC-103: Ghi nhận điểm danh

---

## 6. Mô hình thực thể (45 Entity)

### Xác thực & Phân quyền

| #   | Entity          | Thuộc tính chính                                                    |
| --- | --------------- | ------------------------------------------------------------------- |
| 1   | Role            | name, status                                                        |
| 2   | Permission      | name, feature                                                       |
| 3   | Role Permission | role_id, permission_id                                              |
| 4   | Internal User   | full_name, username, email, phone, role_id, status, platform_access |
| 4b  | Password Reset Token | user_id, otp, token, expires_at, is_used                       |

### Nghiệp vụ cốt lõi

| #   | Entity                   | Thuộc tính chính                                                                       |
| --- | ------------------------ | -------------------------------------------------------------------------------------- |
| 5   | Customer                 | full_name, phone, email, dob, group (VIP/Thân thiết/Khách mới), address, notes         |
| 6   | Supplier                 | name, contact_person, phone, email, address, tax_code, category, payment_terms, status |
| 7   | Warehouse                | name, location, address                                                                |
| 8   | Catalog Item             | name, type (Dịch vụ/Thiết bị/Vật liệu/Tiêu hao/Gói), category_id, status               |
| 9   | Catalog Item Composition | package_id → component_item_id, quantity                                               |
| 10  | Item Price               | item_id, price_type, value, effective_date, note                                       |
| 11  | Business Policy          | type (Đặt cọc/Hủy đơn/Bồi thường/Phụ phí/Đổi ngày), rules_json, effective_date         |
| 12  | Wage Rule                | role (LeaderStaff/TechnicalStaff), wage_per_session, deduction_rules, effective_date   |

### Đơn hàng

| #   | Entity               | Thuộc tính chính                                                                                |
| --- | -------------------- | ----------------------------------------------------------------------------------------------- |
| 13  | Order                | customer_id, event_name, event_type, event_date, location, status, created_by                   |
| 14  | Order Item           | order_id, item_id, quantity, agreed_price                                                       |
| 15  | Quotation            | order_id, version, total_amount, status (Nháp/Đã xác nhận), created_by                          |
| 16  | Quotation Item       | quotation_id, item_id, quantity, unit_price, subtotal, discount                                 |
| 17  | Payment              | order_id, type (Đặt cọc/Cuối/Tại chỗ/Hoàn tiền), amount, method, date, status, evidence_file_id |
| 18  | Order Date Change    | order_id, old_date, new_date, reason, status, approved_by                                       |
| 19  | Order Cancellation   | order_id, reason, refund_amount, refund_status, policy_applied                                  |
| 20  | Order Status History | order_id, from_status, to_status, changed_by, changed_at                                        |

### Vận hành

| #   | Entity               | Thuộc tính chính                                                              |
| --- | -------------------- | ----------------------------------------------------------------------------- |
| 21  | Order Schedule       | order_id, milestone_type, scheduled_at, actual_at                             |
| 22  | Work Task            | order_id, type, status, scheduled_start, scheduled_end, notes                 |
| 23  | Assignment           | task_id, user_id, role                                                        |
| 24  | Survey Report        | task_id, order_id, site_info, constraints, submitted_by, submitted_at, status |
| 25  | Task Progress Update | task_id, status, notes, issues, evidence_files, updated_by, updated_at        |
| 26  | Pick List            | order_id, task_id, generated_by, status                                       |
| 27  | Pick List Item       | pick_list_id, item_id, quantity, unit, notes                                  |

### Tồn kho

| #   | Entity                     | Thuộc tính chính                                                             |
| --- | -------------------------- | ---------------------------------------------------------------------------- |
| 28  | Inventory Balance          | warehouse_id, item_id, total_qty, available_qty, in_use_qty, maintenance_qty |
| 29  | Inventory Reservation      | order_id, item_id, reserved_qty, event_date, status                          |
| 30  | Warehouse Transaction      | order_id, type (Xuất/Nhập/Điều chỉnh), performed_by, performed_at            |
| 31  | Warehouse Transaction Item | transaction_id, item_id, quantity, actual_quantity, condition, notes         |

### Vận hành NCC

| #   | Entity                    | Thuộc tính chính                                                        |
| --- | ------------------------- | ----------------------------------------------------------------------- |
| 32  | Supplier Transaction      | supplier_id, order_id, type (Thuê/Mua), total_cost, status              |
| 33  | Supplier Transaction Item | transaction_id, item_id, quantity, unit_cost, condition                 |
| 34  | Supplier Payable          | transaction_id, amount, paid_amount, status (Chưa TT/TT một phần/Đã TT) |

### Sự kiện hiện trường

| #   | Entity              | Thuộc tính chính                                                                                  |
| --- | ------------------- | ------------------------------------------------------------------------------------------------- |
| 35  | Change Request      | order_id, task_id, type (Thêm/Bỏ/Thay thế), items_json, reason, cost_impact, status, submitted_by |
| 36  | Change Request Item | request_id, item_id, quantity, action                                                             |
| 37  | Handover Record     | order_id, task_id, handover_time, recipient_info, notes, status                                   |
| 38  | Damage/Loss Record  | order_id, task_id, status (Chờ/Đã xác nhận/Từ chối), submitted_by                                 |
| 39  | Damage/Loss Item    | record_id, item_id, quantity, type (Hư hỏng/Mất mát), description, responsibility                 |

### Quyết toán

| #   | Entity     | Thuộc tính chính                                                                        |
| --- | ---------- | --------------------------------------------------------------------------------------- |
| 40  | Settlement | order_id, order_value, extra_fees, compensation, paid_amount, remaining_balance, status |

### Bảng lương

| #   | Entity         | Thuộc tính chính                                                                        |
| --- | -------------- | --------------------------------------------------------------------------------------- |
| 41  | Attendance     | assignment_id, user_id, task_id, recorded_at, status (Chờ xác nhận/Đã xác nhận/Từ chối) |
| 42  | Wage Summary   | user_id, period (tháng/năm), total_sessions, gross_wage, deductions, net_wage           |
| 43  | Wage Deduction | wage_summary_id, reason, amount                                                         |

### Hỗ trợ

| #   | Entity        | Thuộc tính chính                                                      |
| --- | ------------- | --------------------------------------------------------------------- |
| 44  | Evidence File | entity_type, entity_id, file_url, file_type, uploaded_by, uploaded_at |

---

## 7. Quy tắc Nghiệp vụ (Danh sách đầy đủ)

### Xác thực

- BR-LG01: Đăng nhập bằng username + password
- BR-LG02: Kiểm tra trạng thái tài khoản trước khi cấp quyền
- BR-LG03: Kiểm tra vai trò + quyền nền tảng sau xác thực
- BR-LG04: Đăng nhập sai nhiều lần → khóa tài khoản tạm thời
- BR-LG05: Đăng nhập thành công phải ghi vào Activity Log
- BR-FP01–05: Đặt lại mật khẩu chỉ do Admin thực hiện sau khi xác minh ngoài hệ thống
- BR-CP01–06: Đổi mật khẩu cần mật khẩu hiện tại; mật khẩu mới phải đúng chính sách; ghi log

### Quản lý người dùng

- BR-AU01: Username phải là duy nhất
- BR-AU02: Mỗi người dùng phải có đúng một vai trò
- BR-AU03: Vai trò không hoạt động không được gán cho người dùng mới
- BR-AU04: Chỉ Admin tạo tài khoản người dùng
- BR-AU05: Tạo tài khoản phải ghi log
- BR-DU01–05: Tài khoản bị vô hiệu hóa không thể đăng nhập; lịch sử nghiệp vụ được giữ lại; Admin không thể tự vô hiệu hóa tài khoản mình
- BR-RP01–06: Chỉ Admin đặt lại mật khẩu; không thể đặt lại mật khẩu của chính mình; tài khoản bị vô hiệu hóa không được đặt lại
- BR-AR01–06: Mỗi người dùng có một vai trò; tài khoản bị vô hiệu hóa không được gán vai trò mới; vai trò không hoạt động không được gán
- BR-PR01–05: Quyền chỉ qua vai trò, không gán trực tiếp cho người dùng; không cập nhật quyền cho vai trò không hoạt động; thay đổi ảnh hưởng tất cả người dùng trong vai trò đó

### Giá

- BR-SP01–06: Giá do Admin cấu hình; giá > 0; phải có effective_date; lịch sử giữ lại; một giá hiện hành cho mỗi item+loại_giá tại một thời điểm; hàng không hoạt động không được cấu hình giá mới

### Chính sách

- BR-DP01–06: Chính sách đặt cọc do Admin; phải có effective_date; tỷ lệ trong phạm vi cho phép; lịch sử giữ lại; một chính sách hiện hành tại một thời điểm
- BR-CPOL01–06: Chính sách hủy đơn do Admin; hoàn tiền 0–100%; mỗi mức phải có ngưỡng ngày; một chính sách hiện hành tại một thời điểm
- BR-AF01–07: Chính sách phụ phí do Admin; phải có phương pháp tính + effective_date; một chính sách hiện hành cho mỗi loại_phí+phạm_vi tại một thời điểm
- BR-WR01–07: Quy tắc lương do Admin; mức lương > 0; quy tắc khác nhau cho Leader và Technical Staff; một quy tắc hiện hành cho mỗi vai trò tại một thời điểm; Manager xác nhận nhưng không cấu hình

### Báo giá

- BR-QT01–05: Chỉ Manager tạo báo giá; phải liên kết Khách hàng; chỉ dùng hàng hóa đang hoạt động; giá từ bảng giá hiện hành; ghi log
- BR-UQ01–04: Chỉ cập nhật trước khi bị khóa bởi xác nhận đơn hàng; tổng tiền được tính lại; hàng không hoạt động không được dùng
- BR-CQ01–04: Chỉ Manager xác nhận; phải hoàn chỉnh; bắt buộc trước yêu cầu đặt cọc; không sửa sau khi đơn hàng xác nhận

### Đơn hàng

- BR-CO01–05: Chỉ Manager tạo đơn; phải liên kết Khách hàng; event_date + địa điểm bắt buộc; trạng thái ban đầu được thiết lập; ghi log
- BR-UO01–04: Chỉ cập nhật khi trạng thái cho phép; thay đổi ảnh hưởng báo giá/kho được phản ánh; đổi ngày theo UC-59
- BR-COR01–05: Xác nhận cần báo giá đã xác nhận + đặt cọc đã xác nhận; đặt chỗ kho; kho đã đặt chỗ bị khóa theo event_date; ghi log
- BR-CED01–04: Đổi ngày theo chính sách; kiểm tra lại kho; giải phóng đặt chỗ cũ chỉ sau khi xác nhận ngày mới khả dụng; ghi log
- BR-CAN01–05: Hủy chỉ khi trạng thái cho phép; áp dụng chính sách hủy đơn; giải phóng kho đã đặt chỗ; lý do hủy bắt buộc; ghi log

### Tồn kho

- BR-IA01–04: Kiểm tra theo event_date; hàng đã đặt chỗ không được tính là có sẵn; kiểm tra ban đầu không tạo đặt chỗ
- BR-RI01–03: Kiểm tra lại sau khảo sát; kết quả dùng trước kế hoạch cuối; không tự động đặt chỗ
- BR-PL01–04: Phiếu xuất từ hàng đã xác nhận/lên kế hoạch; phải có item+số_lượng+đơn_vị+nhiệm_vụ; nhân viên chỉ xem phiếu của nhiệm vụ được phân công; ghi log
- BR-CIR01–05: Chỉ Manager xác nhận hoàn trả; số lượng hoàn trả ≤ số lượng xuất kho; hư hỏng/mất mát cần biên bản đã xác nhận; cập nhật trạng thái tồn kho; bắt buộc trước khi hoàn thành đơn

### NCC

- BR-SR01–04: Thuê phải liên kết NCC; có thể liên kết Đơn hàng; chi phí theo dõi trong Supplier Payable
- BR-SPU01–04: Mua phải liên kết NCC; số tiền > 0; ảnh hưởng Supplier Payable
- BR-SPAY01–04: Số tiền thanh toán > 0; số tiền ≤ dư nợ; Supplier Payable được cập nhật; ghi log

### Phân công nhân sự

- BR-AS01–04: Chỉ nhân viên đang hoạt động được phân công; vai trò phải phù hợp; không được double-booking khi xung đột lịch; thông báo sau phân công
- BR-TS01–04: Lịch trình theo thứ tự sự kiện; giao hàng trước lắp đặt; thu hồi+hoàn trả sau sự kiện
- BR-CW01–04: Công việc hợp lệ = có phân công + điểm danh; ca đã xác nhận dùng tính lương; không dùng ca bị từ chối
- BR-WD01–04: Lương từ ca đã xác nhận; dùng quy tắc lương hiện hành; Manager xác nhận trước khi báo cáo

### Vận hành hiện trường

- BR-SV01–05: Chỉ Leader Staff được phân công mới nộp báo cáo; thông tin bắt buộc đầy đủ; ảnh nếu yêu cầu bằng chứng; Manager xem xét; ghi log
- BR-WC01–05: Xuất kho từ phiếu; ghi số lượng thực tế từng item; chênh lệch cần lý do; cập nhật trạng thái thiết bị + tiến độ; ghi log
- BR-FP01–05: Chỉ Leader Staff được phân công cập nhật tiến độ; chuyển trạng thái hợp lệ; bằng chứng cho các mốc quan trọng; Manager có thể xem; ghi log
- BR-HO01–05: Liên kết đơn/nhiệm vụ; bằng chứng bắt buộc trước khi nộp; Leader nộp, Manager xác nhận; ghi log
- BR-CR01–05: Leader nộp, không thể tự duyệt; phải có loại+lý do+hàng hóa; tác động chi phí cần ghi chú; đơn hàng không cập nhật đến khi Manager duyệt; ghi log
- BR-DL01–04: Liên kết đơn+hàng hóa; bằng chứng bắt buộc; số lượng ≤ đã phân công/xuất kho; Manager xác nhận trước khi hoàn tất bồi thường

### Điểm danh

- BR-RA01–04: Điểm danh chỉ cho nhiệm vụ được phân công; không duplicate; phải xác nhận trước khi tính lương; Technical Staff được Leader xác nhận, Leader được Manager xác nhận
- BR-TA01–04: Leader xác nhận điểm danh Technical Staff thuộc nhóm mình quản lý; Technical Staff không tự xác nhận; từ chối cần lý do; điểm danh đã xác nhận dùng tính lương

### Thanh toán

- BR-DPR01–04: Yêu cầu đặt cọc cần báo giá đã xác nhận; số tiền theo Chính sách đặt cọc; không tạo trùng yêu cầu đặt cọc đang hoạt động; xác nhận đơn chỉ sau khi đặt cọc hợp lệ
- BR-QR01–04: Chỉ tạo QR khi VNPay khả dụng; số tiền khớp yêu cầu; lưu gateway reference; dự phòng thủ công nếu VNPay không khả dụng
- BR-PE01–05: Chỉ Manager xác nhận chứng từ; chứng từ khớp đơn+số tiền+phương thức; từ chối cần lý do; xác nhận cập nhật trạng thái thanh toán; ghi log
- BR-FP01–05: Chỉ sau quyết toán đã xác nhận; số tiền khớp dư nợ; đơn Hoàn thành/Đóng chỉ khi thanh toán + tất cả dữ liệu vận hành hoàn chỉnh; đính kèm bằng chứng cho chuyển khoản

### Quyết toán

- BR-ST01–04: Liên kết đơn; phụ phí + bồi thường cần lý do + bằng chứng; Leader ghi, Manager duyệt
- BR-SA01–04: Chi tiết quyết toán bắt buộc trước khi nộp; bằng chứng thanh toán bắt buộc được đính kèm; Leader nộp, Manager duyệt; chỉ hoàn tất sau xác nhận Manager
- BR-HR01–04: Chỉ Manager xác nhận bàn giao; bằng chứng bắt buộc nếu được yêu cầu; từ chối cần lý do; ghi log

---

## 8. Mã tin nhắn hệ thống (MSG)

| Tiền tố  | Nghiệp vụ                  |
| -------- | -------------------------- |
| MSG-LG   | Đăng nhập                  |
| MSG-FP   | Quên mật khẩu              |
| MSG-CP   | Đổi mật khẩu               |
| MSG-AU   | Tạo người dùng             |
| MSG-DU   | Vô hiệu hóa tài khoản      |
| MSG-RP   | Đặt lại mật khẩu           |
| MSG-AR   | Gán vai trò                |
| MSG-PR   | Quyền                      |
| MSG-SP   | Giá dịch vụ                |
| MSG-DP   | Chính sách đặt cọc         |
| MSG-CPOL | Chính sách hủy đơn         |
| MSG-AF   | Chính sách phụ phí         |
| MSG-WR   | Quy tắc lương              |
| MSG-QT   | Báo giá                    |
| MSG-UQ   | Cập nhật báo giá           |
| MSG-CQ   | Xác nhận báo giá           |
| MSG-CO   | Tạo đơn hàng               |
| MSG-UO   | Cập nhật đơn hàng          |
| MSG-COR  | Xác nhận đơn hàng          |
| MSG-CED  | Đổi ngày sự kiện           |
| MSG-CAN  | Hủy đơn hàng               |
| MSG-IA   | Kiểm tra tồn kho           |
| MSG-RI   | Kiểm tra lại tồn kho       |
| MSG-PL   | Phiếu xuất kho             |
| MSG-VR   | Trạng thái hoàn trả kho    |
| MSG-CIR  | Xác nhận hoàn trả kho      |
| MSG-SR   | Thuê/Nhận thiết bị NCC     |
| MSG-SPU  | Mua hàng NCC               |
| MSG-SPAY | Thanh toán NCC             |
| MSG-SD   | Công nợ NCC                |
| MSG-AS   | Phân công nhân sự          |
| MSG-TS   | Lịch vận chuyển            |
| MSG-CW   | Xác nhận công việc         |
| MSG-WD   | Dữ liệu lương              |
| MSG-MF   | Giám sát hiện trường       |
| MSG-CR   | Yêu cầu thay đổi           |
| MSG-HR   | Biên bản bàn giao          |
| MSG-DL   | Hư hỏng/mất mát            |
| MSG-DPR  | Yêu cầu thanh toán đặt cọc |
| MSG-QR   | Thanh toán QR              |
| MSG-PE   | Chứng từ thanh toán        |
| MSG-SV   | Khảo sát                   |
| MSG-WC   | Xuất kho                   |
| MSG-FP   | Tiến độ hiện trường        |
| MSG-HO   | Bằng chứng bàn giao        |
| MSG-CE   | Thiết bị đã thu hồi        |
| MSG-IER  | Hoàn trả thiết bị nội bộ   |
| MSG-CL   | Phân loại thiết bị         |
| MSG-IR   | Báo cáo hoàn trả kho       |
| MSG-RA   | Ghi nhận điểm danh         |
| MSG-TA   | Xác nhận điểm danh         |
| MSG-ST   | Chi tiết quyết toán        |
| MSG-SA   | Nộp quyết toán             |

---

## 9. Yêu cầu phi chức năng

### Giao diện bên ngoài

- Cổng thanh toán VNPay: tạo mã QR, callback trạng thái
- Lưu trữ file bằng chứng (ảnh, PDF)

### Thuộc tính chất lượng (SRS đề cập nhưng chưa chi tiết — cần làm rõ khi grill)

- Xác thực và quản lý phiên
- Kiểm soát truy cập dựa trên vai trò (RBAC)
- Ghi log kiểm toán cho tất cả hành động quan trọng
- Băm mật khẩu + chính sách đặt lại
- Mobile app cho Leader Staff + Technical Staff
- Web app cho Admin + Manager

---

## 10. Danh sách màn hình & tính năng

### Web App (Admin + Manager)

**Xác thực:**

- Màn hình Đăng nhập | Quên mật khẩu | Đặt lại mật khẩu | Hồ sơ cá nhân | Modal đổi mật khẩu

**Admin — Người dùng & Phân quyền:**

- Danh sách người dùng + Dialog tạo + Chi tiết người dùng + Dialog chỉnh sửa

**Admin — Dữ liệu master:**

- Danh mục dịch vụ (List + Create/Edit + Detail)
- Danh mục thiết bị (List + Create/Edit + Detail)
- Nhà cung cấp (List + Create/Edit + Detail + Lịch sử giao dịch)

**Admin — Chính sách:**

- Danh sách chính sách + Tạo + Chi tiết + Dialog chỉnh sửa

**Admin — Báo cáo:**

- Dashboard quản trị
- Báo cáo doanh thu, Thống kê đơn hàng, Thống kê tồn kho, Thống kê nhân lực, Báo cáo hoàn trả kho, Báo cáo công nợ NCC, Báo cáo lương

**Manager — Dashboard:**

- Dashboard vận hành (KPI: Tổng sự kiện, Đơn hàng hoạt động, Doanh thu tháng, Yêu cầu chờ xử lý; Widget lịch sự kiện; Log hoạt động; Sidebar phê duyệt)
- Modal chi tiết yêu cầu thay đổi

**Manager — Khách hàng:**

- Danh sách + Tạo mới + Chi tiết + Chỉnh sửa + Modal tạo sự kiện

**Manager — Đơn hàng:**

- Danh sách đơn + Chi tiết đơn (+ Modal hủy đơn + Modal đổi ngày)

**Manager — Tồn kho:**

- Danh sách kiểm kê + Báo cáo tồn kho

**Admin — Kiểm toán:**

- Danh sách kiểm toán đơn + Chi tiết + Nhật ký + Dialog điều chỉnh dữ liệu

### Mobile App (Leader Staff + Technical Staff)

- Danh sách nhiệm vụ được phân công
- Chi tiết nhiệm vụ
- Xem phiếu xuất kho
- Form báo cáo khảo sát + Nộp
- Xác nhận xuất kho
- Form nhận/trả thiết bị NCC
- Cập nhật tiến độ hiện trường
- Form bằng chứng bàn giao
- Form yêu cầu thay đổi
- Form biên bản hư hỏng/mất mát
- Form thiết bị đã thu hồi
- Form hoàn trả thiết bị nội bộ
- Form phân loại thiết bị
- Nộp báo cáo hoàn trả kho
- Ghi nhận điểm danh
- Xác nhận điểm danh Technical Staff (Leader only)
- Tải lên chứng từ thanh toán khách hàng (Leader only)
- Form chi tiết quyết toán (Leader only)
- Nộp quyết toán (Leader only)

---

## 11. Câu hỏi mở cho `/grill-with-docs`

> Đây là những điểm SRS chưa đặc tả rõ — khi chạy `/grill-with-docs` trong Claude Code sẽ cần làm rõ:

1. **State machine trạng thái đơn hàng** — Tất cả trạng thái hợp lệ và tất cả các chuyển đổi được phép là gì? (SRS đề cập trạng thái nhưng không liệt kê đầy đủ state machine)
2. **Trigger thông báo** — Hành động nào gửi thông báo, cho vai trò nào, qua cơ chế gì (push/email/in-app)?
3. **Chính sách đổi ngày** — SRS tham chiếu đến chính sách nhưng chưa định nghĩa nội dung cụ thể. Các quy tắc là gì?
4. **Luồng callback VNPay** — VNPay callback cập nhật trạng thái thanh toán như thế nào? Webhook? Polling?
5. **Lưu trữ file bằng chứng** — S3? Local? Giới hạn dung lượng/loại file?
6. **Logic nâng hạng khách hàng** — Khách hàng chuyển từ "Khách mới" → "Thân thiết" → "VIP" như thế nào? Tự động hay thủ công?
7. **Theo dõi tình trạng tồn kho** — Chuyển đổi tình trạng (Có sẵn → Đang dùng → Cần bảo trì → Hỏng)? Ai cập nhật?
8. **Versioning báo giá** — BR-UQ03 ghi "giữ lịch sử nếu hỗ trợ versioning" — versioning có bắt buộc không?
9. **Tự động tính quyết toán** — Hệ thống tự tính Settlement hay Leader Staff nhập thủ công?
10. **Hỗ trợ nhiều kho** — Một kho hay nhiều kho? Inventory Balance có theo từng kho không?
11. **Enum loại nhiệm vụ** — Danh sách đầy đủ loại Work Task và các chuyển đổi trạng thái tiến độ được phép?
12. **Phạm vi dữ liệu báo cáo** — Báo cáo real-time hay pre-aggregated? Khoảng thời gian?
13. **Offline mobile** — Leader Staff có thể ghi dữ liệu offline và đồng bộ sau không?
14. **Tự động tạo Supplier Payable** — Supplier Payable có tự động tạo khi ghi Supplier Transaction không?
15. **Order Item vs Quotation Item** — Đây có phải hai bản ghi riêng biệt không? SRS liệt kê cả hai là entity riêng.

---

_Kết thúc CONTEXT_VI.md — v1.0 | Nguồn: SRS Báo cáo 3, tháng 6/2026_
