# Yêu cầu bổ sung từ Backend — Order Detail Page (Manager)

Phát hiện trong lúc build `src/app/manager/orders/[id]/page.tsx` (tab "Thanh toán & Quyết toán").
Toàn bộ mục dưới đây đọc trực tiếp `D:\bnwems-backend-api` (routes/controllers/services/validators/
`prisma/schema.prisma`) để xác nhận — không suy diễn từ `docs/api/` một mình.

## (a) Thiếu GET Settlement theo orderId

`src/routes/settlement.route.ts` chỉ có `POST /orders/:orderId/settlement` và
`PUT /settlements/:id/confirm` — không có GET nào (không theo `id`, không theo `orderId`).

Hệ quả: Manager không xem lại được nội dung một settlement đã ghi nhận trước đó (vd do Leader
Staff ghi nhận tại hiện trường qua mobile). Web hiện chỉ dùng được nút "Xác nhận quyết toán" khi
chính phiên làm việc đó vừa gọi `POST .../settlement` và còn giữ `settlementId` trả về trong
state — không có cách "mở lại" một settlement đã tồn tại để xem rồi confirm riêng.

Đề xuất: `GET /api/v1/orders/:orderId/settlement`.

## (b) Thiếu GET Damage-Loss list theo orderId

`src/routes/damageloss.route.ts` (nested dưới order routes) chỉ có
`POST /orders/:orderId/damage-loss` — không có GET.

Đề xuất: `GET /api/v1/orders/:orderId/damage-loss`.

## (c) `responsible` / `responsibleUserId` không được lưu lại

`damageloss.validator.ts` (`recordDamageLossSchema`) yêu cầu `responsible` bắt buộc theo BR-28-01,
nhưng `damageloss.service.ts` (`recordDamageLoss`) chỉ dùng giá trị này để suy ra
`source: 'internal' | 'supplier'` (nguồn gốc thiết bị) trên `DamageLossItem` — giá trị `responsible`
gốc (khách hàng hay nhân viên chịu trách nhiệm) KHÔNG được lưu vào DB. Trường `responsibleUserId`
không tồn tại trong `prisma/schema.prisma` ở model `DamageLossItem` — chưa từng được model hóa,
không phải bị bỏ sau khi đọc.

Đề xuất: thêm 2 cột vào `DamageLossItem` — `responsibleParty enum('customer','staff')` và
`responsibleUserId BigInt?` (FK tới `User`, chỉ có giá trị khi `responsibleParty = 'staff'`) — rồi
cập nhật `recordDamageLoss` để ghi lại đúng giá trị nhận từ request body thay vì chỉ dùng để suy
ra `source`.

## (d) `DamageLossItem.compensationAmount` / `DamageLossReport.totalCompensation` luôn = 0

Cả hai cột có default `0` trong schema và KHÔNG được `recordDamageLoss` set giá trị thực. Ngay cả
khi (a)/(b) được bổ sung, số tiền đền bù hiển thị vẫn sẽ là 0 cho tới khi service tính
`compensationAmount = giá mua thiết bị × số lượng hỏng/mất` (theo CLAUDE.md mục "Quy tắc nghiệp vụ
cốt lõi" — đền bù thiết bị hỏng/mất) và set lại cả 2 field này khi tạo damage-loss report.

## (e) GET /orders/:orderId/payments thiếu `paymentType` — không phân biệt được "Đặt cọc" vs "Cuối kỳ"

Response thật (`payment.service.ts getPaymentsByOrder` → `prisma.payment.findMany`) chỉ trả field
của model `Payment`: `paymentId, paymentRequestId, orderId, amount, method, status, paidAt,
confirmedBy, confirmedAt, createdAt`. `paymentType` (deposit/final) chỉ tồn tại trên
`PaymentRequest`, không được join/include sang response của `Payment`.

Đề xuất: `getPaymentsByOrder` include `paymentRequest: { select: { paymentType: true } }` khi
query, hoặc denormalize thêm cột `paymentType` ngay trên `Payment`.

## (f) `docs/api/11-payments-settlement.md` mô tả response GET .../payments dày hơn thực tế

Doc hiện ghi response có `paymentType`, `paymentMethod` (không phải `method`), `paymentDate`
(không phải `paidAt`), `evidences: [...]` lồng nhau. Response thật không có field nào trong số này
ngoại trừ tên khác (`method`/`status`/`paidAt`). Cần đồng bộ lại doc theo response thật, hoặc nếu
ý định là làm response giàu hơn thì bổ sung code JOIN evidence + payment request vào.

## (g) `PUT /payments/:id/confirm` dùng `paymentRequestId`, không phải `paymentId`

`payment.controller.ts confirmPayment` → `paymentService.confirmPayment(id, ...)` →
`prisma.paymentRequest.findUnique({ where: { paymentRequestId: BigInt(id) }})`. Tham số `:id` ở
route này thực chất là `paymentRequestId` (id trả về từ `POST .../payments/request`), KHÔNG phải
`paymentId` xuất hiện trong các dòng trả về bởi `GET .../payments`. Tên route/tên tham số gây hiểu
nhầm.

Đề xuất: đổi route thành `PUT /payment-requests/:paymentRequestId/confirm` để rõ nghĩa, hoặc ít
nhất ghi rõ trong `docs/api/11-payments-settlement.md`.

## (h) `Order.status` nhận thêm giá trị không có trong enum 5 giá trị tự khai

`prisma/schema.prisma` (model `Order`) ghi comment chỉ có 5 giá trị: `draft, confirmed, in_progress,
completed, cancelled`. Nhưng runtime thực tế còn ghi thêm:

- `'deposit_paid'` (`payment.service.ts confirmPayment`, khi `paymentType` là `deposit`)
- `'settlement_pending'` (`settlement.service.ts confirmSettlement`)

Hai giá trị này lệch khỏi CHÍNH comment nội bộ của schema, không chỉ lệch `docs/api/09-orders.md`.

Đề xuất: rà toàn bộ literal `status: '...'` ghi vào `Order` trong mọi `*.service.ts`, chốt lại tập
giá trị đầy đủ thực sự dùng trong runtime, cập nhật comment schema + `docs/api/09-orders.md` +
frontend `OrderStatus` type cho khớp.

## (i) `Settlement.changeAdjustment` và model `SettlementLine` tồn tại nhưng không được dùng

Cả hai là cột/model riêng trong schema (`changeAdjustment` default 0, `SettlementLine` có
`lineType: original|change|additional_fee|compensation|deposit|payment`) nhưng `recordSettlement`
không bao giờ set/tạo. Có khả năng dự định cho khoản điều chỉnh do đổi ngày/đổi thiết bị
(CLAUDE.md — đổi ngày miễn phí, thay thiết bị = cũ − giá cũ + giá mới) và cho breakdown từng dòng
phụ thu/bồi thường, nhưng chưa được wiring.

Đề xuất: xác nhận ý định rồi bổ sung logic tính + set field/tạo `SettlementLine` tương ứng — nếu
làm đúng, đây cũng là nguồn dữ liệu thật cho phần "Chi tiết phụ thu"/"Chi tiết bồi thường" mà
frontend hiện đang phải mock.

## (j) Xác nhận: `additionalFees` (số nhiều) là đúng, KHÔNG có discrepancy

Đã đọc trực tiếp `settlement.validator.ts` (Zod schema `recordSettlementSchema`) — field bắt buộc
trong request body là `additionalFees` (số nhiều), khớp `docs/api/11-payments-settlement.md`. Cột
Prisma `additionalFee` (số ít) chỉ là tên cột DB nội bộ, không lộ ra HTTP — không cần đổi gì ở phía
frontend. Mục này chỉ để xác nhận đã kiểm tra kỹ, không phải một gap thật.

## (k) Settlement không có field giảm trừ/ưu đãi (discount)

`settlement.service.ts` tính `remainingAmount = originalValue + additionalFees - compensation -
paidAmount` — không có field discount nào trong công thức hay trong `recordSettlementSchema`.
`Quotation` thật (`prisma/schema.prisma`) cũng chỉ có `totalAmount`, không có `subtotal/tax/discount`
dù `src/types/quotation.ts` ở frontend hiện khai các field đó (vấn đề có từ trước, ngoài phạm vi
lần này).

Hệ quả: dòng "Giảm trừ/Ưu đãi" trong UI quyết toán không có nguồn dữ liệu thật ở đâu cả — frontend
hiện hiển thị mock cho dòng này (đã ghi chú "(\*) chưa có trong API" trong UI) và KHÔNG gửi giá trị
này lên `POST .../settlement`.

Đề xuất: nếu nghiệp vụ thực sự cần giảm trừ ở bước quyết toán cuối, thêm field `discount` vào
`recordSettlementSchema` + công thức `remainingAmount` + cột tương ứng trên `Settlement`.

## (m) Quotation không có versioning thật — `getQuotationsByOrder` luôn trả tối đa 1 bản ghi

`quotation.service.ts getQuotationsByOrder` dùng `prisma.quotation.findUnique({ where: { orderId }
})` (Prisma schema đặt `orderId @unique` trên model `Quotation`) — nghĩa là **mỗi order chỉ có
thể có tối đa 1 quotation thật trong DB**, không có lịch sử nhiều phiên bản. `version` trong response
luôn hardcode = `1` ở service (`...quotation, version: 1, ...`), không phải cột thật.

CLAUDE.md mục 1 và `docs/api/08-quotations.md` (UC 2.10) đều mô tả "Báo giá (Quotation, có
versioning)" là nghiệp vụ cần có. Frontend tab "Báo giá" hiện đã bỏ dropdown chọn version (vì luôn
chỉ có 1 lựa chọn) để tránh tạo cảm giác có tính năng mà dữ liệu không hỗ trợ.

Đề xuất: nếu versioning là yêu cầu thật, đổi `orderId` từ `@unique` thành quan hệ 1-nhiều, thêm cột
`version` thật, và `getQuotationsByOrder` trả đúng danh sách nhiều bản ghi theo `orderId`.

Đồng thời ghi nhận: response thật của `quotation.service.ts` dùng field `quotationId` (theo Prisma,
không rename), `items` nằm ở top-level (không nested trong `details.items`), item dùng
`unitPrice`/`lineTotal` (không phải `price`) — khác với mô tả trong
`docs/api/08-quotations.md`. Frontend `src/types/quotation.ts` đã được sửa lại khớp response thật;
cần đồng bộ lại doc khi có dịp.

## (l) Model `OrderStatusHistory` tồn tại nhưng không có GET expose ra API

`prisma/schema.prisma` có model `OrderStatusHistory` (`orderId, fromStatus, toStatus, ...`) nhưng
không tìm thấy route/controller nào expose lịch sử đổi trạng thái cho 1 order. Tab "Lịch sử trạng
thái" trên web hiện chỉ hiển thị được mốc tạo đơn + trạng thái hiện tại.

Đề xuất: `GET /api/v1/orders/:orderId/status-history`.

---

# Yêu cầu bổ sung từ Backend — Tab "Khảo sát & Nhân sự" (Manager)

Phát hiện khi build tab "Khảo sát & Nhân sự" trong `src/app/manager/orders/[id]/page.tsx`
(`src/components/orders/SurveyPersonnelTab.tsx`). `docs/api/10-survey-assignment.md` chỉ có
`POST /tasks/:id/assignments`, `GET /tasks`, `GET /tasks/:id/survey-report` — thiếu phần đọc lại
phân công + một số field mà thiết kế cần. Phần thiếu hiện được phục vụ bằng mock route
(`src/app/api/v1/orders/[id]/assignments`, seed `mockOrderAssignments`/`mockSurveyReports`).

## (n) Thiếu GET danh sách phân công theo order/task

Chỉ có `POST /tasks/:id/assignments` để ghi phân công — KHÔNG có endpoint đọc lại danh sách nhân sự
đã phân công (kèm tên user + assignedRole) cho 1 task hoặc 1 order. Web không hiển thị lại được
"Phân công khảo sát" và "Phân công nhân sự thi công" sau khi đã giao việc.

Đề xuất: `GET /api/v1/orders/:orderId/assignments` (gộp khảo sát + thi công) và/hoặc
`GET /api/v1/tasks/:id/assignments`, trả mỗi assignment kèm `{ userId, fullName, assignedRole }`.

## (o) `GET /tasks/:id/survey-report` không trả danh tính khảo sát viên

Response chỉ có `notes, evidences[], submittedAt` — không có `surveyedBy`/`userId` của người khảo
sát. UI phải lấy tên KSV từ mock phân công.

Đề xuất: thêm `surveyedBy: { userId, fullName }` (hoặc `submittedBy`) vào response survey-report.

## (p) Không có trạng thái hiện trường theo từng nhân sự

`WorkTask.status` chỉ ở cấp task (`pending|in_progress|completed`); `Assignment` không có status
riêng. Thiết kế cần field-status theo từng staff ("SẴN SÀNG", "ĐANG SETUP"...).

Đề xuất: thêm cột `fieldStatus` trên `Assignment` (vd `pending|ready|in_setup|completed`) và expose
trong GET ở mục (n).

## (q) Không có % tiến độ thi công

Thiết kế "Theo dõi thi công" hiển thị "ĐANG THỰC HIỆN (70%)" nhưng `GET /tasks` chỉ trả enum
status, không có phần trăm. Web tạm chỉ map theo status (không hiển thị %).

Đề xuất: thêm `progressPercent` (0–100) trên `WorkTask` nếu cần hiển thị tiến độ chi tiết.

## (r) Change Request thiếu mô tả + phụ thu dự kiến

Thiết kế khối "Yêu cầu thay đổi từ hiện trường" hiển thị câu mô tả tự nhiên + "Dự kiến phụ thu:
500.000đ", nhưng `ChangeRequest` (GET /change-requests) chỉ có `items[]` (catalogItemId, quantity,
action) + `type`. Web hiện tự suy mô tả từ số lượng item, KHÔNG hiển thị được tên thiết bị hay phụ
thu dự kiến.

Đề xuất: bổ sung `description?` (hoặc trả kèm tên catalog item) và `estimatedSurcharge?` vào response
change request.

---

# Yêu cầu bổ sung từ Backend — Modal "Tạo đơn hàng" (Manager)

Phát hiện khi build `src/components/orders/CreateOrderModal.tsx` (modal "Tạo đơn hàng" mở từ
`/manager/orders`). Đọc trực tiếp `D:\bnwems-backend-api` (`prisma/schema.prisma`,
`src/validators/order.validator.ts`, `src/controllers/order.controller.ts`,
`src/services/order.service.ts`) để xác nhận — không suy diễn từ `docs/api/`.

## (s) Order không có "ngày kết thúc" (event end date)

`model Order` (`prisma/schema.prisma`) chỉ có 1 cột ngày sự kiện: `eventDate DateTime @db.Date` —
không có `eventEndDate`/ngày kết thúc nào. `createOrderSchema`
(`order.validator.ts`) cũng chỉ nhận `customerId, eventDate, venueAddress` ở body.

Hai chỗ khác có tên gần giống `endDate` nhưng KHÔNG liên quan đến field này, dễ gây nhầm khi tra
code:

- `GET /orders` có query param `endDate` — chỉ là bộ lọc khoảng ngày để filter danh sách theo
  `eventDate` (`order.service.ts getOrders`, `whereClause.eventDate.lte`), không phải field lưu
  trên 1 Order cụ thể.
- Model `EquipmentMaintenance` có cột `endDate` riêng (ngày kết thúc bảo trì thiết bị) — không liên
  quan Order/event.

Hệ quả: không có cách lưu "ngày kết thúc" cho 1 đơn hàng/sự kiện (vd sự kiện kéo dài nhiều ngày,
hoặc cần biết mốc dọn dẹp/thu hồi). Modal "Tạo đơn hàng" ở frontend hiện chỉ có field "Ngày tổ
chức" (map `eventDate`), chưa thêm "Ngày kết thúc" vì không có cột tương ứng để lưu.

Đề xuất:

- Thêm cột `eventEndDate DateTime? @db.Date @map("event_end_date")` vào `model Order`.
- `createOrderSchema`: thêm `eventEndDate: z.string().optional()` vào body.
- `order.controller.ts createOrder` + `order.service.ts createOrder`: nhận và lưu `eventEndDate`.
- `getOrders`/`getOrderById`: trả thêm `eventEndDate` trong response.
- Đồng bộ lại `docs/api/09-orders.md` (request/response `POST /orders`, `GET /orders`,
  `GET /orders/:id`) sau khi có cột thật.

---

# Yêu cầu bổ sung từ Backend — Danh sách đơn hàng (Manager)

Phát hiện khi recode `src/app/manager/orders/page.tsx` theo thiết kế Stitch "Danh sách đơn hàng -
Manager Dashboard (Database Focused)". Các field hiển thị trong design chưa có trong backend hoặc
chưa được expose qua API. Frontend hiện **mock tạm thời** bằng helper functions có chú thích
rõ — khi backend implement xong, chỉ cần xóa mock và dùng field thật.

## (t) `orderNumber` chưa được sinh (BR-11-01)

`model Order` không có cột `orderNumber`. `docs/api/09-orders.md` mô tả BR-11-01 "Auto-generates
unique orderNumber" nhưng `order.service.ts createOrder` chưa implement logic này — response
`POST /orders` chỉ trả `orderId`, và `GET /orders` không có field `orderNumber` trong response.

Design hiển thị mã dạng `ORD-2023-001`. Frontend mock bằng cách tự sinh
`ORD-{year(createdAt)}-{orderId.padStart(4,'0')}` — không phải số thứ tự thật nên có thể trùng
hoặc sai thứ tự nếu orderId không liên tiếp.

Đề xuất:

- Thêm cột `orderNumber VARCHAR(20) UNIQUE` vào `model Order`.
- `order.service.ts createOrder`: sinh mã theo format `ORD-{YYYY}-{NNNN}` dùng sequence hoặc
  `MAX(orderId) + 1` được padding 4 chữ số.
- Expose `orderNumber` trong response `GET /orders`, `GET /orders/:id`, `POST /orders`.
- Bật lại `search` param trong `GET /orders` để filter theo `orderNumber` (hiện frontend đã có
  UI search nhưng disabled vì backend sẽ 500 khi không có cột).
- Đồng bộ lại `docs/api/09-orders.md`.

## (u) Thiếu trường loại sự kiện (`eventType`)

Design hiển thị cột "Loại sự kiện" (Tiệc cưới, Sự kiện công ty, Sinh nhật, Khai trương, Hội nghị)
nhưng `model Order` không có cột này. Frontend mock bằng cách chọn deterministic theo
`parseInt(orderId) % EVENT_TYPES.length`.

Đề xuất:

- Thêm cột `eventType VARCHAR(50)` (hoặc `enum('wedding','corporate','birthday','opening','other')`)
  vào `model Order`.
- Thêm `eventType` vào `createOrderSchema` (optional), `order.service.ts`, response GET/POST.
- Cập nhật `CreateOrderModal` để cho phép chọn loại sự kiện khi tạo đơn.
- Đồng bộ lại `docs/api/09-orders.md`.

## (w) Thiếu trường số lượng khách (`guestCount`)

Design hiển thị cột "Số khách" (50–800 khách). `model Order` không có cột này. Frontend mock bằng
công thức `50 + (parseInt(orderId) * 37) % 750` — hoàn toàn là số giả.

Đề xuất:

- Thêm cột `guestCount INT` (nullable, vì có thể chưa biết khi tạo đơn) vào `model Order`.
- Thêm `guestCount` vào `createOrderSchema` (optional), `order.service.ts`, response GET/POST.
- Cập nhật `CreateOrderModal` để có input số lượng khách (optional).
- Đồng bộ lại `docs/api/09-orders.md`.

Xem thêm: mục (s) về `eventEndDate` — cùng nhóm "thông tin cơ bản order" cần bổ sung.
Xem thêm: mục (h) về `deposit_paid`/`settlement_pending` — 2 giá trị `Order.status` runtime
chưa được khai báo chính thức; frontend đã thêm vào `OrderStatus` type và `ORDER_STATUS_LABEL`.
