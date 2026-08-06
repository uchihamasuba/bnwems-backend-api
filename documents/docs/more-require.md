# Yêu cầu bổ sung từ Backend — Order Detail Page (Manager)

Phát hiện trong lúc build `src/app/manager/orders/[id]/page.tsx` (tab "Thanh toán & Quyết toán").
Toàn bộ mục dưới đây đọc trực tiếp `D:\bnwems-backend-api` (routes/controllers/services/validators/
`prisma/schema.prisma`) để xác nhận — không suy diễn từ `docs/api/` một mình.

## (a) Thiếu GET Settlement theo orderId

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: backend đã bổ sung đúng endpoint đề xuất.
> `src/routes/settlement.route.ts` giờ có `nestedSettlementRouter.get('/', ...)` (mount tại
> `GET /api/v1/orders/:orderId/settlement`, role `ADMIN`/`MANAGER`) →
> `settlement.controller.ts getSettlementByOrder` → `settlement.service.ts getSettlementByOrder`
> (`prisma.settlement.findFirst({ where: { orderId }, orderBy: { createdAt: 'desc' }, include:
> { settlementLines: true } })`, ném `404` nếu chưa có settlement). Frontend (`types/settlement.ts`,
> service layer) chưa gọi endpoint này — cần nối API thật để bỏ giới hạn "chỉ xem lại được settlement
> vừa ghi trong cùng phiên" đã nêu bên dưới. Giữ nguyên mô tả gốc để tra cứu lịch sử.

`src/routes/settlement.route.ts` chỉ có `POST /orders/:orderId/settlement` và
`PUT /settlements/:id/confirm` — không có GET nào (không theo `id`, không theo `orderId`).

Hệ quả: Manager không xem lại được nội dung một settlement đã ghi nhận trước đó (vd do Leader
Staff ghi nhận tại hiện trường qua mobile). Web hiện chỉ dùng được nút "Xác nhận quyết toán" khi
chính phiên làm việc đó vừa gọi `POST .../settlement` và còn giữ `settlementId` trả về trong
state — không có cách "mở lại" một settlement đã tồn tại để xem rồi confirm riêng.

Đề xuất: `GET /api/v1/orders/:orderId/settlement`.

## (b) Thiếu GET Damage-Loss list theo orderId

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: đã kiểm tra lại toàn bộ `src/routes/*.ts` — vẫn chỉ có
> `router.post('/:orderId/damage-loss', ...)` trong `order.route.ts` (không có file
> `damageloss.route.ts` riêng — controller/service damage-loss được mount trực tiếp trong
> `order.route.ts`). Không có route `GET` nào cho damage-loss. Đề xuất bên dưới vẫn còn nguyên giá
> trị.

`src/routes/damageloss.route.ts` (nested dưới order routes) chỉ có
`POST /orders/:orderId/damage-loss` — không có GET.

Đề xuất: `GET /api/v1/orders/:orderId/damage-loss`.

## (c) `responsible` / `responsibleUserId` không được lưu lại

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model `DamageLossItem`
> giờ đã có đúng 2 cột đề xuất: `responsibleParty String? @map("responsible_party")` (thay vì enum
> cứng, nhưng cùng ý nghĩa `customer`/`staff`) và `responsibleUserId BigInt? @map
> ("responsible_user_id")`. `damageloss.service.ts recordDamageLoss` giờ ghi cả 2 giá trị thật từ
> request body (`responsibleParty: item.responsibleParty, responsibleUserId: item.responsibleUserId
> ? BigInt(item.responsibleUserId) : null`) — không còn chỉ dùng để suy ra `source` như trước.
> `damageloss.validator.ts` cũng đã đổi field bắt buộc thành `responsibleParty` (không phải
> `responsible` như mô tả gốc). Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

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

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: đã đọc lại toàn bộ `damageloss.service.ts` — vẫn KHÔNG
> có bất kỳ phép tính nào gán `compensationAmount`/`totalCompensation` (grep `compensationAmount` /
> `totalCompensation` trong `src/` chỉ ra khai báo cột trong `damageloss.service.ts`) — cả 2 field
> vẫn giữ nguyên default `0` sau khi tạo damage-loss report. Điểm (a) nay đã được bổ sung (GET
> Settlement theo orderId — xem mục (a) ở trên) nhưng (b) GET Damage-Loss theo orderId vẫn CHƯA có
> (xem mục (b)), nên xem lại số tiền đền bù thực tế qua API vẫn chưa khả thi kể cả khi service có
> tính đúng. Đề xuất bên dưới vẫn còn nguyên giá trị.

Cả hai cột có default `0` trong schema và KHÔNG được `recordDamageLoss` set giá trị thực. Ngay cả
khi (a)/(b) được bổ sung, số tiền đền bù hiển thị vẫn sẽ là 0 cho tới khi service tính
`compensationAmount = giá mua thiết bị × số lượng hỏng/mất` (theo CLAUDE.md mục "Quy tắc nghiệp vụ
cốt lõi" — đền bù thiết bị hỏng/mất) và set lại cả 2 field này khi tạo damage-loss report.

## (e) GET /orders/:orderId/payments thiếu `paymentType` — không phân biệt được "Đặt cọc" vs "Cuối kỳ"

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: `payment.service.ts getPaymentsByOrder` hiện tại vẫn
> chỉ `prisma.payment.findMany` thuần, không `include`/join `paymentRequest`. Response vẫn không có
> `paymentType`. Đề xuất bên dưới vẫn còn nguyên giá trị.

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

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: backend đã đổi route đúng theo đề xuất.
> `src/routes/index.ts` giờ mount 2 router riêng: `router.use('/payments', paymentRouter)` (rỗng,
> chỉ giữ chỗ) và `router.use('/payment-requests', paymentRequestRouter)`. Route confirm giờ nằm ở
> `paymentRequestRouter.put('/:id/confirm', ...)` → `PUT /api/v1/payment-requests/:id/confirm`,
> tham số `:id` đúng là `paymentRequestId`. `paymentRequestRouter.get('/:id', ...)` cũng đã có sẵn
> (`getPaymentRequestById`, trả kèm `payments[]` liên quan). `paymentRouter` (mount tại `/payments`)
> giờ **rỗng** — không còn route `PUT`/`GET` nào đăng ký trên đó.
>
> ⚠️ **Frontend đang gọi sai đường dẫn theo route mới**: `src/services/payment.service.ts:23` vẫn gọi
> `PUT /payments/${paymentRequestId}/confirm` (đường dẫn cũ) — với routing hiện tại của backend, gọi
> này sẽ nhận `404` thật (route không tồn tại nữa dưới `/payments`). Cần sửa
> `payment.service.ts` để gọi `PUT /payment-requests/${paymentRequestId}/confirm` và đồng bộ lại
> `docs/api/11-payments-settlement.md` (mục (f) bên dưới). Giữ nguyên mô tả gốc bên dưới để tra cứu
> lịch sử.

`payment.controller.ts confirmPayment` → `paymentService.confirmPayment(id, ...)` →
`prisma.paymentRequest.findUnique({ where: { paymentRequestId: BigInt(id) }})`. Tham số `:id` ở
route này thực chất là `paymentRequestId` (id trả về từ `POST .../payments/request`), KHÔNG phải
`paymentId` xuất hiện trong các dòng trả về bởi `GET .../payments`. Tên route/tên tham số gây hiểu
nhầm.

Đề xuất: đổi route thành `PUT /payment-requests/:paymentRequestId/confirm` để rõ nghĩa, hoặc ít
nhất ghi rõ trong `docs/api/11-payments-settlement.md`.

## (h) `Order.status` nhận thêm giá trị không có trong enum 5 giá trị tự khai

> **CẬP NHẬT (đã triển khai một phần, rà soát lại 2026-07-04)**: comment nội bộ của
> `prisma/schema.prisma` (model `Order`) đã được sửa lại đúng, giờ ghi đủ 7 giá trị runtime thật:
> `// draft, confirmed, deposit_paid, in_progress, settlement_pending, completed, cancelled` — không
> còn lệch với chính comment schema như mô tả gốc. Việc còn lại (`docs/api/09-orders.md` vẫn có thể
> đang mô tả 5 giá trị PascalCase cũ kèm `QUOTED` không tồn tại) chưa xác minh lại trong lượt rà soát
> này — vẫn nên đối chiếu doc đó trước khi coi là đã đồng bộ hoàn toàn. Giữ nguyên mô tả gốc bên dưới
> để tra cứu lịch sử.

`prisma/schema.prisma` (model `Order`) ghi comment chỉ có 5 giá trị: `draft, confirmed, in_progress,
completed, cancelled`. Nhưng runtime thực tế còn ghi thêm:

- `'deposit_paid'` (`payment.service.ts confirmPayment`, khi `paymentType` là `deposit`)
- `'settlement_pending'` (`settlement.service.ts confirmSettlement`)

Hai giá trị này lệch khỏi CHÍNH comment nội bộ của schema, không chỉ lệch `docs/api/09-orders.md`.

Đề xuất: rà toàn bộ literal `status: '...'` ghi vào `Order` trong mọi `*.service.ts`, chốt lại tập
giá trị đầy đủ thực sự dùng trong runtime, cập nhật comment schema + `docs/api/09-orders.md` +
frontend `OrderStatus` type cho khớp.

## (i) `Settlement.changeAdjustment` và model `SettlementLine` tồn tại nhưng không được dùng

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: `settlement.service.ts recordSettlement` giờ
> nhận và set `changeAdjustment` thật từ request body (dùng trong công thức
> `expectedRemaining = originalValue + changeAdjustment + additionalFee - compensation - discount -
> totalPaid`), và tạo `SettlementLine` thật khi body có mảng `settlementLines` (`lineType`, `amount`,
> `note` — đúng 6 giá trị `lineType` đã khai báo). `getSettlementByOrder` (mục (a)) trả kèm
> `settlementLines` qua `include`. Đây là nguồn dữ liệu thật cho phần "Chi tiết phụ thu"/"Chi tiết bồi
> thường" từng được đề cập — frontend cần bỏ mock và dùng `settlementLines` thật khi nối API GET ở
> mục (a). Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

Cả hai là cột/model riêng trong schema (`changeAdjustment` default 0, `SettlementLine` có
`lineType: original|change|additional_fee|compensation|deposit|payment`) nhưng `recordSettlement`
không bao giờ set/tạo. Có khả năng dự định cho khoản điều chỉnh do đổi ngày/đổi thiết bị
(CLAUDE.md — đổi ngày miễn phí, thay thiết bị = cũ − giá cũ + giá mới) và cho breakdown từng dòng
phụ thu/bồi thường, nhưng chưa được wiring.

Đề xuất: xác nhận ý định rồi bổ sung logic tính + set field/tạo `SettlementLine` tương ứng — nếu
làm đúng, đây cũng là nguồn dữ liệu thật cho phần "Chi tiết phụ thu"/"Chi tiết bồi thường" mà
frontend hiện đang phải mock.

## (j) ⚠️ ĐẢO NGƯỢC: `additionalFee` (số ít) mới là đúng — kết luận cũ ở mục này đã lỗi thời

> **CẬP NHẬT QUAN TRỌNG (rà soát lại 2026-07-04)**: đọc lại trực tiếp `settlement.validator.ts`
> hiện tại — `recordSettlementSchema` giờ khai báo field body là **`additionalFee` (số ít)**:
> `additionalFee: z.number().min(0).optional()`, không còn là `additionalFees` (số nhiều) như lúc
> viết mục này lần đầu. `settlement.service.ts recordSettlement` cũng destructure `additionalFee`
> (số ít) và dùng trong công thức `expectedRemaining`. Field name đã đổi ở đâu đó giữa 2 lần rà soát
> — kết luận "không có discrepancy" bên dưới **không còn đúng nữa**.
>
> Frontend (`src/types/settlement.ts`, dòng có comment "additionalFees số nhiều — đã xác nhận khớp
> validator thật") vẫn khai `additionalFees` (số nhiều) trong `RecordSettlementPayload` — nếu có code
> nào thật sự POST lên `.../settlement` dùng field này, Zod sẽ bỏ qua field lạ (schema không có
> `.passthrough()`) và `additionalFee` phía service sẽ luôn nhận `undefined` → mặc định `0`, làm sai
> lệch quyết toán một cách âm thầm (không lỗi rõ ràng, số liệu tài chính sai). Cần sửa lại
> `types/settlement.ts` dùng `additionalFee` (số ít) và rà soát lại comment liên quan trước khi bất kỳ
> luồng nào (web hoặc mobile) thật sự gọi endpoint này.

Đã đọc trực tiếp `settlement.validator.ts` (Zod schema `recordSettlementSchema`) — field bắt buộc
trong request body là `additionalFees` (số nhiều), khớp `docs/api/11-payments-settlement.md`. Cột
Prisma `additionalFee` (số ít) chỉ là tên cột DB nội bộ, không lộ ra HTTP — không cần đổi gì ở phía
frontend. Mục này chỉ để xác nhận đã kiểm tra kỹ, không phải một gap thật. **(Kết luận này đã lỗi
thời — xem cập nhật ở trên.)**

## (k) Settlement không có field giảm trừ/ưu đãi (discount)

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model `Settlement`
> giờ có cột `discount Decimal @default(0)`. `settlement.validator.ts recordSettlementSchema` nhận
> `discount: z.number().min(0).optional()`, và `settlement.service.ts recordSettlement` đã đưa vào
> đúng công thức: `expectedRemaining = originalValue + changeAdjustment + additionalFee -
> compensation - discount - totalPaid`. Dòng "Giảm trừ/Ưu đãi" trong UI quyết toán giờ có nguồn dữ
> liệu thật — frontend cần bỏ mock (`SettlementPreviewMock.discount`, ghi chú "(\*) chưa có trong
> API") và gửi/hiển thị `discount` thật khi nối API record + GET (mục (a)) thật. Giữ nguyên mô tả gốc
> bên dưới để tra cứu lịch sử.

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

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: backend đã làm đúng versioning thật.
> `prisma/schema.prisma` model `Quotation` — `orderId` không còn `@unique` (đã đổi sang quan hệ
> 1-nhiều với `version Int @default(1)` là cột thật, không hardcode). `quotation.service.ts`:
> - `createQuotation` tính `newVersion = latestQuote.version + 1` (tra theo `orderBy: { version:
>   'desc' }`) thay vì luôn ghi đè.
> - `getQuotationsByOrder` giờ dùng `prisma.quotation.findMany(...)` (không phải `findUnique`), có
>   phân trang (`page`, `limit`), sắp theo `version: 'desc'`, trả đúng danh sách nhiều bản ghi.
> - Đã có thêm `getQuotationById`, `updateQuotation` (chặn sửa khi `status` đã `confirmed`),
>   `deleteQuotation` (chặn xóa khi đã `confirmed`, khớp `docs/api/08-quotations.md`), và
>   `updateQuotationStatus`.
>
> Frontend tab "Báo giá" đã bỏ dropdown chọn version trước đây (vì lúc đó luôn chỉ có 1 lựa chọn) —
> giờ nên thêm lại dropdown/lịch sử version vì dữ liệu đã hỗ trợ thật. Field naming
> (`quotationId`, `items` top-level, `unitPrice`/`lineTotal`) không đổi — vẫn khớp những gì
> `src/types/quotation.ts` đã sửa trước đó. Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

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

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: grep `OrderStatusHistory`/`status-history` toàn bộ
> `src/` chỉ ra model tồn tại trong schema nhưng không route/controller/service nào tham chiếu tới
> nó — vẫn chưa có record nào được tạo hay đọc. Đề xuất bên dưới vẫn còn nguyên giá trị. (Xem thêm
> `order.service.ts getWorkflowTimeline` — endpoint mới `GET /orders/:id/workflow-timeline` đã
> implement, nhưng lấy dữ liệu từ `AuditLog`/`WorkTask`/`Payment`/`ChangeRequest`, KHÔNG phải từ
> `OrderStatusHistory` — không thay thế được nhu cầu ở mục này.)

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

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: backend đã bổ sung đúng endpoint đề xuất
> (gộp khảo sát + thi công). `src/routes/order.route.ts` có
> `router.get('/:orderId/assignments', authorizeRoles('ADMIN', 'MANAGER'),
> assignmentController.getAssignments)` → `GET /api/v1/orders/:orderId/assignments`. Service
> `assignment.service.ts getAssignmentsByOrder` trả mỗi assignment kèm đúng field cần:
> `{ assignmentId, workTaskId, userId, assignedRole, fieldStatus, fullName, taskTitle }` — vượt cả
> yêu cầu gốc (có thêm `fieldStatus` — xem mục (p) — và `taskTitle`). Route riêng theo `GET
> /tasks/:id/assignments` (không gộp) chưa có, nhưng route theo order đã đủ dùng cho mock hiện tại
> (`src/app/api/v1/orders/[id]/assignments`, `mockOrderAssignments`) — cần thay bằng gọi API thật.
> Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

Chỉ có `POST /tasks/:id/assignments` để ghi phân công — KHÔNG có endpoint đọc lại danh sách nhân sự
đã phân công (kèm tên user + assignedRole) cho 1 task hoặc 1 order. Web không hiển thị lại được
"Phân công khảo sát" và "Phân công nhân sự thi công" sau khi đã giao việc.

Đề xuất: `GET /api/v1/orders/:orderId/assignments` (gộp khảo sát + thi công) và/hoặc
`GET /api/v1/tasks/:id/assignments`, trả mỗi assignment kèm `{ userId, fullName, assignedRole }`.

## (o) `GET /tasks/:id/survey-report` không trả danh tính khảo sát viên

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: `task.service.ts viewSurveyReport` vẫn chỉ trả
> `{ taskId, notes, evidences, submittedAt }` — không có `surveyedBy`/`recordedBy`. Lưu ý:
> `SurveyReport.recordedBy` ĐÃ được lưu thật khi `recordSurveyReport` tạo report (dữ liệu có sẵn
> trong DB), chỉ là `viewSurveyReport` chưa join/trả field này ra response — sửa sẽ đơn giản hơn dự
> kiến ban đầu (không cần thêm cột, chỉ cần include + map). Đề xuất bên dưới vẫn còn nguyên giá trị.

Response chỉ có `notes, evidences[], submittedAt` — không có `surveyedBy`/`userId` của người khảo
sát. UI phải lấy tên KSV từ mock phân công.

Đề xuất: thêm `surveyedBy: { userId, fullName }` (hoặc `submittedBy`) vào response survey-report.

## (p) Không có trạng thái hiện trường theo từng nhân sự

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model `Assignment`
> giờ có cột `fieldStatus String @default("pending") @map("field_status")` — đúng 4 giá trị đề xuất:
> comment schema ghi `pending, ready, in_setup, completed`. Đã expose trong `GET
> /orders/:orderId/assignments` (mục (n), field `fieldStatus`) và trong `GET /tasks/assigned`
> (`task.service.ts getAssignedTasks`, field `fieldStatus` lấy từ assignment). Hiện chưa thấy endpoint
> nào cho phép **set** `fieldStatus` (không có trong `assignStaffSchema`/`updateTaskProgressSchema`)
> — có thể do đây là hành động phía mobile (Leader/Technical Staff) chưa cần trên web, nhưng nên xác
> nhận lại nếu web cần đổi field-status thay mặt. Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

`WorkTask.status` chỉ ở cấp task (`pending|in_progress|completed`); `Assignment` không có status
riêng. Thiết kế cần field-status theo từng staff ("SẴN SÀNG", "ĐANG SETUP"...).

Đề xuất: thêm cột `fieldStatus` trên `Assignment` (vd `pending|ready|in_setup|completed`) và expose
trong GET ở mục (n).

## (q) Không có % tiến độ thi công

> **CẬP NHẬT (đã triển khai, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model `WorkTask` giờ
> có cột `progressPercent Int @default(0) @map("progress_percent")` đúng như đề xuất. Set được qua
> `PUT /tasks/:id/progress` (`updateTaskProgressSchema` nhận thêm `progressPercent:
> z.number().min(0).max(100).optional()`, `task.service.ts updateTaskProgress` ghi vào
> `updateData.progressPercent` khi có truyền). `GET /tasks` (`task.service.ts getTasks`) trả nguyên
> object `WorkTask` (không `select` field cụ thể) nên `progressPercent` đã có sẵn trong response —
> frontend có thể bỏ cách map tạm theo status và hiển thị % thật. Giữ nguyên mô tả gốc bên dưới để
> tra cứu lịch sử.

Thiết kế "Theo dõi thi công" hiển thị "ĐANG THỰC HIỆN (70%)" nhưng `GET /tasks` chỉ trả enum
status, không có phần trăm. Web tạm chỉ map theo status (không hiển thị %).

Đề xuất: thêm `progressPercent` (0–100) trên `WorkTask` nếu cần hiển thị tiến độ chi tiết.

## (r) Change Request thiếu mô tả + phụ thu dự kiến

> **CẬP NHẬT (đã triển khai một phần, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model
> `ChangeRequest` giờ đã có cột `reason String? @db.Text` và `estimatedCost Decimal? @map
> ("estimated_cost")` — đúng ý nghĩa "mô tả"/"phụ thu dự kiến" đề xuất (không có cột tên
> `description`/`estimatedSurcharge` riêng, nhưng `reason`/`estimatedCost` phục vụ đúng mục đích).
> `changerequest.service.ts getChangeRequests`/`getChangeRequestById` trả nguyên object (spread
> `...req`) nên 2 field này ĐÃ có trong response nếu được set. Đồng thời, phần "tên thiết bị" đã được
> giải quyết tốt hơn đề xuất gốc: `ChangeRequestItem` giờ include quan hệ `equipmentItem`, response
> trả kèm `equipmentItemName`/`equipmentItemCode` cho từng item.
>
> **Vẫn còn gap**: `changerequest.validator.ts createChangeRequestSchema` (body cho `POST
> /orders/:orderId/change-requests`) **chưa nhận** `reason`/`estimatedCost` — chỉ có `type`,
> `items[]`. `changerequest.service.ts createChangeRequest` cũng chỉ set `type`, `status`,
> `requestedBy` khi tạo. Vì vậy 2 cột này tồn tại trong schema nhưng hiện luôn `null` trong thực tế —
> chưa có đường ghi giá trị thật qua API (có thể do đây là hành động tạo change-request từ mobile
> Leader Staff, ngoài phạm vi web, nhưng validator vẫn cần cập nhật ở phía backend trước khi có dữ
> liệu thật để web hiển thị). Đề xuất giữ nguyên: cần thêm `reason`/`estimatedCost` vào
> `createChangeRequestSchema` + service để mobile ghi được giá trị thật. Giữ nguyên mô tả gốc bên
> dưới để tra cứu lịch sử.

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

> **CẬP NHẬT (đã triển khai)**: đọc lại backend khi recode `CreateOrderModal` → trang
> `src/app/manager/orders/create/page.tsx` (khảo sát ngày hôm nay) cho thấy `model Order` giờ
> **đã có** cột `eventEndDate DateTime? @map("event_end_date")`, và `createOrderSchema`/
> `order.controller.ts`/`order.service.ts createOrder` đã nhận + lưu field này thật. Frontend đã bỏ
> mock/`helpText` cảnh báo và gửi `eventEndDate` thật lên API. Giữ nguyên phần mô tả gốc bên dưới để
> tra cứu lịch sử.

`model Order` (`prisma/schema.prisma`) lúc phát hiện gap này chỉ có 1 cột ngày sự kiện: `eventDate
DateTime @db.Date` — không có `eventEndDate`/ngày kết thúc nào. `createOrderSchema`
(`order.validator.ts`) lúc đó cũng chỉ nhận `customerId, eventDate, venueAddress` ở body.

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

> **CẬP NHẬT (đã triển khai một phần, rà soát lại 2026-07-04)**: `prisma/schema.prisma` model
> `Order` giờ đã có cột `orderNumber String? @unique @map("order_number") @db.VarChar(30)`, và
> `order.service.ts getOrders` đã bật lại filter `search` theo đúng cột này
> (`whereClause.orderNumber = { contains: search }`) — không còn nguy cơ 500 như mô tả gốc.
>
> **Vẫn còn gap — phần quan trọng nhất chưa làm**: `order.service.ts createOrder` vẫn **KHÔNG sinh
> giá trị `orderNumber`** khi tạo order — object truyền vào `prisma.order.create({ data: {...} })`
> không có field này, nên cột vẫn luôn `null` cho MỌI order tạo mới (cũ lẫn mới). Hệ quả: `GET
> /orders`/`GET /orders/:id` giờ có field `orderNumber` thật trong response (không lỗi), nhưng giá
> trị luôn `null` — và filter `search` theo `orderNumber` vẫn không match được gì vì không có order
> nào có giá trị. Frontend vẫn cần giữ cách tự sinh mã tạm (`ORD-{year}-{orderId}`) hiển thị in
> nghiêng cho tới khi `createOrder` thật sự implement logic sinh mã `ORD-{YYYY}-{NNNN}`.
>
> `src/app/manager/orders/page.tsx` hiện đang disable ô search với comment "chưa có cột orderNumber
> (mục t)" (dòng ~86, ~109, ~307-316) — cột đã có, có thể bật lại request `search` param an toàn
> (không còn 500), nhưng đừng kỳ vọng match được order nào cho tới khi `createOrder` sinh giá trị
> thật; giữ UI disabled/note lại cho tới khi generate logic xong sẽ tránh gây hiểu nhầm "search không
> hoạt động". Đề xuất giữ nguyên: chỉ còn thiếu bước generate trong `createOrder`, schema đã sẵn
> sàng. Giữ nguyên mô tả gốc bên dưới để tra cứu lịch sử.

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

> **CẬP NHẬT (đã triển khai)**: `model Order` giờ đã có cột `eventType String? @map("event_type")`,
> `createOrderSchema` nhận `eventType` optional, `order.service.ts createOrder` đã lưu thật. Frontend
> đã thêm `Select` "Loại sự kiện" vào `src/app/manager/orders/create/page.tsx` và gửi giá trị thật.
> `mockEventType` ở `orders/page.tsx` vẫn giữ lại làm fallback hiển thị cho các order tạo trước khi
> có field này hoặc khi để trống — chỉ hiển thị in nghiêng khi thực sự là mock (`!row.eventType`).

Design hiển thị cột "Loại sự kiện" (Tiệc cưới, Sự kiện công ty, Sinh nhật, Khai trương, Hội nghị)
nhưng lúc phát hiện gap này `model Order` không có cột này. Frontend mock bằng cách chọn deterministic
theo `parseInt(orderId) % EVENT_TYPES.length`.

Đề xuất:

- Thêm cột `eventType VARCHAR(50)` (hoặc `enum('wedding','corporate','birthday','opening','other')`)
  vào `model Order`.
- Thêm `eventType` vào `createOrderSchema` (optional), `order.service.ts`, response GET/POST.
- Cập nhật `CreateOrderModal` để cho phép chọn loại sự kiện khi tạo đơn.
- Đồng bộ lại `docs/api/09-orders.md`.

## (w) Thiếu trường số lượng khách (`guestCount`)

> **CẬP NHẬT (đã triển khai)**: `model Order` giờ đã có cột `guestCount Int? @map("guest_count")`,
> `createOrderSchema` nhận `guestCount` optional, `order.service.ts createOrder` đã lưu thật (lưu ý:
> service dùng `guestCount || null` nên nếu nhập `0` sẽ bị lưu thành `null` — hành vi backend, không
> sửa ở đây). Frontend đã thêm input "Số lượng khách" vào trang tạo đơn hàng mới và gửi giá trị thật.
> Bảng danh sách (`orders/page.tsx`) hiện chưa có cột "Số khách" (không có mock công thức giả nào
> đang chạy thật trong code, khác với mô tả gốc bên dưới) — có thể bổ sung cột này ở việc khác nếu
> cần hiển thị.

Design hiển thị cột "Số khách" (50–800 khách). Lúc phát hiện gap này `model Order` không có cột này.
Frontend mock bằng công thức `50 + (parseInt(orderId) * 37) % 750` — hoàn toàn là số giả.

Đề xuất:

- Thêm cột `guestCount INT` (nullable, vì có thể chưa biết khi tạo đơn) vào `model Order`.
- Thêm `guestCount` vào `createOrderSchema` (optional), `order.service.ts`, response GET/POST.
- Cập nhật `CreateOrderModal` để có input số lượng khách (optional).
- Đồng bộ lại `docs/api/09-orders.md`.

Xem thêm: mục (s) về `eventEndDate` — cùng nhóm "thông tin cơ bản order" cần bổ sung.
Xem thêm: mục (h) về `deposit_paid`/`settlement_pending` — 2 giá trị `Order.status` runtime
chưa được khai báo chính thức; frontend đã thêm vào `OrderStatus` type và `ORDER_STATUS_LABEL`.

---

# Yêu cầu bổ sung từ Backend — Trang "Tạo đơn hàng mới" (Manager)

Phát hiện khi recode `src/components/orders/CreateOrderModal.tsx` (modal) thành trang riêng
`src/app/manager/orders/create/page.tsx` theo bố cục prototype
(`docs/bnwems-manager-portal/src/components/OrdersView.tsx:1759-2063`). Đọc trực tiếp
`D:\bnwems-backend-api` để xác nhận.

## (x) Order vẫn thiếu `eventName` (tên sự kiện) và `notes` (ghi chú ban đầu)

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: `prisma/schema.prisma` model `Order` hiện tại (đã đối
> chiếu toàn bộ field) vẫn không có cột `eventName` hay `notes`. Đề xuất bên dưới vẫn còn nguyên giá
> trị — trang tạo đơn hàng vẫn đúng là chưa nên thêm 2 input này cho tới khi có cột lưu thật.

Prototype có 2 field "Tên sự kiện / Ghi danh hợp đồng" và "Ghi chú yêu cầu ban đầu" trên form tạo
đơn hàng. `model Order` (`prisma/schema.prisma`) không có cột `eventName` hay `notes` nào — khác với
`eventEndDate`/`eventType`/`guestCount` ở mục (s)/(u)/(w) đã được backend bổ sung, 2 field này **chưa
từng được model hóa**.

Vì không có nơi lưu trữ thật, trang "Tạo đơn hàng mới" thật **không** đưa 2 field này vào form (khác
với cách xử lý "hiển thị mock in nghiêng" cho dữ liệu đọc — thu thập ghi chú/tên sự kiện do người
dùng nhập rồi âm thầm không lưu được sẽ gây mất dữ liệu thật, rủi ro hơn là không hiển thị).

Đề xuất nếu nghiệp vụ cần:
- Thêm cột `eventName VARCHAR(255)?` và `notes TEXT?` vào `model Order`.
- Thêm 2 field (optional) vào `createOrderSchema`, `order.controller.ts`/`order.service.ts
  createOrder`, và response `GET /orders`/`GET /orders/:id`.
- Sau đó thêm lại 2 input "Tên sự kiện"/"Ghi chú" vào trang tạo đơn hàng và (nếu cần) hiển thị ở
  trang chi tiết đơn hàng.

# Yêu cầu bổ sung từ Backend — Nút "Hủy đơn hàng" (Manager, Order Detail)

Phát hiện khi code phần "Hủy bỏ đơn hàng & giải phóng kho" theo prototype
(`docs/bnwems-manager-portal/src/components/OrdersView.tsx:1689-1753`) cho
`src/app/manager/orders/[id]/page.tsx`. Đọc trực tiếp `D:\bnwems-backend-api` để xác nhận.

## (y) Không có endpoint hủy đơn hàng nào ở backend

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: đã đọc lại toàn bộ `order.route.ts`/`order.service.ts`
> hiện tại — vẫn chỉ có 4 route mutation trên order: `confirm`, `change-date`, `close`, và route mới
> `GET /:orderId/assignments` (đọc, không phải mutation). Không có route/controller/service nào set
> `status = 'cancelled'` hay tên có chữ `cancel` gắn với Order (chỉ có `cancelTask` cho `WorkTask`,
> là entity khác). `CancelOrderModal.tsx` gọi `PUT .../orders/:id/cancel` vẫn sẽ nhận `404` thật.
> Không tìm thấy tham chiếu `CANCELLATION`/policy nào áp dụng cho order ở bất kỳ service nào. Đề xuất
> bên dưới vẫn còn nguyên giá trị.

`order.route.ts` chỉ có 3 hành động chuyển trạng thái: `PUT /:id/confirm`, `PUT /:id/change-date`,
`PUT /:id/close`. Không có route/controller/service nào set `status = 'cancelled'` — dù giá trị này
đã tồn tại trong comment enum của `model Order` (xem mục (h)) và trong `OrderStatus` type ở frontend.
Cũng không có logic giải phóng inventory reservation, hủy lịch Schedule Plan/Work Task, hay áp dụng
chính sách hoàn cọc (CLAUDE.md — ≥30 ngày hoàn 100%, 7–30 ngày hoàn 50%, <7 ngày không hoàn) gắn với
việc hủy đơn.

Vì đây là một hành động ghi (mutation) làm thay đổi trạng thái đơn hàng thật — không phải dữ liệu
hiển thị — nên **không áp dụng cách xử lý "mock in nghiêng"**: `CancelOrderModal.tsx` gọi thật
`PUT /api/v1/orders/:id/cancel` (suy theo đúng convention của 3 endpoint lifecycle kể trên, request
body `{ reason: string }`), không tự làm giả trạng thái "đã hủy" ở local state khi chưa có phản hồi
thành công từ server — nút bấm sẽ nhận lỗi 404 thật cho tới khi backend bổ sung endpoint này, thay vì
âm thầm hiển thị hủy thành công trong khi dữ liệu backend không đổi.

Đề xuất:
- Thêm route `PUT /api/v1/orders/:id/cancel`, `validator` (`reason` bắt buộc, string), controller
  `cancelOrder`, và `orderService.cancelOrder(id, reason)`.
- Business rules cần áp dụng trong service (theo CLAUDE.md):
  - Chỉ cho phép hủy khi `status` chưa phải `completed`/`cancelled`.
  - Set `status = 'cancelled'`, ghi `reason` vào audit log (bảng `AuditLog` nếu có, hoặc cột riêng
    trên `Order` nếu cần hiển thị lại lý do hủy sau này).
  - Giải phóng toàn bộ inventory reservation đã khóa cho order (UC 2.13 — Date-based Inventory
    Lock), hủy/đóng các Schedule Plan & Work Task chưa hoàn thành liên quan tới order.
  - Tính % hoàn cọc theo policy `CANCELLATION` (`docs/api/06-policies-wage.md`) dựa trên số ngày
    còn lại tới `eventDate` tại thời điểm hủy — hiện tại policy này tồn tại ở dạng CRUD chung
    (`GET/POST/PUT /policies`) nhưng chưa có chỗ nào áp dụng nó vào một order cụ thể.
- Response nên trả về `{ status: 'cancelled' }` giống format của `confirm`/`close` để frontend không
  cần đoán field.

# Yêu cầu bổ sung từ Backend — Sửa đơn hàng & Đổi ngày sự kiện (Manager, Order Detail)

Phát hiện khi code nút "Sửa đơn hàng" và "Đổi ngày sự kiện" trên `OrderDetailHeader.tsx` (2 nút này
trước đó bị disable với tooltip "Tính năng đang phát triển"). Đọc trực tiếp
`D:\bnwems-backend-api\src\routes\order.route.ts`, `order.service.ts`, `order.validator.ts` để xác
nhận (không chỉ dựa vào `docs/api/09-orders.md`).

## (z) Thiếu endpoint update chung + `change-date` chưa áp dụng đúng nghiệp vụ

> **VẪN CÒN GAP (rà soát lại 2026-07-04)**: cả 3 điểm mô tả bên dưới vẫn đúng nguyên trạng.
> `order.route.ts` vẫn không có `PUT /:id` chung. `order.controller.ts changeEventDate` /
> `order.service.ts changeEventDate` vẫn dùng đúng field `newEventDate` (điểm 2 — vẫn khớp, không
> đổi) nhưng service vẫn chỉ làm `prisma.order.update({ data: { eventDate: new Date(newEventDate) }
> })` — không kiểm tra tồn kho, không áp policy `DATE_CHANGE`, không chặn theo `status` (điểm 3 —
> grep `CANCELLATION`/`DATE_CHANGE` toàn bộ `src/` không ra kết quả nào, xác nhận chưa có service nào
> áp dụng 2 policy này cho order). `EditOrderModal.tsx` gọi `PUT .../orders/:id` vẫn sẽ nhận `404`
> thật. Đề xuất bên dưới vẫn còn nguyên giá trị.

**1. Không có endpoint update chung cho thông tin đơn hàng.** `order.route.ts` chỉ có 3 route
mutation: `PUT /:id/confirm`, `PUT /:id/change-date`, `PUT /:id/close`. Không có route/controller/
service nào cho phép sửa `eventType`, `eventEndDate`, `eventLocation`, `guestCount` sau khi đơn đã
được tạo — dù các cột này đã là field thật, được lưu lúc `createOrder` (mục s/u/w).

Vì đây là hành động ghi làm thay đổi dữ liệu đơn hàng thật, áp dụng đúng cách đã làm với `cancelOrder`
(mục y): `EditOrderModal.tsx` gọi thật `PUT /api/v1/orders/:id` (suy theo REST convention chung, body
`{ eventType?, eventEndDate?, venueAddress?, guestCount? }`), không giả lập thành công ở local state —
nút bấm sẽ nhận lỗi 404 thật cho tới khi backend bổ sung endpoint này.

Đề xuất:
- Thêm route `PUT /api/v1/orders/:id`, validator (tất cả field optional, không cho sửa `customerId`/
  `eventDate`/`status`), controller `updateOrder`, service `orderService.updateOrder(id, data)` chỉ
  update các cột được truyền lên.
- Chặn update khi `status` đã là `completed`/`cancelled` (tương tự đề xuất ở mục y cho cancel).
- Response nên trả về đơn hàng đã cập nhật (giống `GET /orders/:id`) để frontend không cần gọi lại
  GET riêng.

**2. `PUT /:id/change-date` — field body thật khác với doc.** `docs/api/09-orders.md` ghi body là
`{ newEventStartDate }`, nhưng `changeEventDateSchema`
(`D:\bnwems-backend-api\src\validators\order.validator.ts:37-44`) và `order.controller.ts:81-95` xác
nhận field thật là **`newEventDate`**. Frontend (`ChangeEventDateModal.tsx`) dùng đúng field thật;
`docs/api/09-orders.md` cần được đồng bộ lại.

**3. `changeEventDate` (backend) chưa áp dụng nghiệp vụ đã tài liệu hóa.** Implementation thật
(`D:\bnwems-backend-api\src\services\order.service.ts:96-101`) chỉ làm
`prisma.order.update({ data: { eventDate: new Date(newEventDate) } })` — không có:
- BR-11-06 (kiểm tra `newEventDate` có sẵn tồn kho cho các item đã giữ chỗ hay không).
- BR-11-07 / chính sách "miễn phí nếu yêu cầu trước >3 ngày so với ngày lắp đặt" (CLAUDE.md) — không
  tính hay áp phí đổi ngày nào.
- Giới hạn theo `status` đơn hàng (có thể đổi ngày kể cả khi đơn đã `completed`/`cancelled`).

Vì backend không tính phí, `ChangeEventDateModal.tsx` chỉ hiển thị banner tham khảo (miễn phí hay có
thể phát sinh phí dựa trên số ngày còn lại tới `eventDate` hiện tại), không tự tính/hiển thị số tiền
cụ thể. Đề xuất: bổ sung kiểm tra tồn kho + áp dụng policy `DATE_CHANGE`
(`docs/api/06-policies-wage.md`, theo đúng cách chưa làm với policy `CANCELLATION` ở mục y) + chặn khi
`status` là `completed`/`cancelled`.

## (aa) `QuotationItem.equipmentItemId` tham chiếu bảng `Equipment`, không phải `CatalogItem` — thiếu hẳn trong `docs/api/`

Phát hiện khi build luồng xem báo giá (`/manager/quotations`, `FinalQuotation.tsx`). Đọc trực tiếp
`D:\bnwems-backend-api\prisma\schema.prisma`: model `QuotationItem` lưu cột `equipmentItemId`
(`quotation.service.ts createQuotation`/`updateQuotation` đọc `item.equipmentItemId`, không phải
`catalogItemId`) — tham chiếu tới model **`Equipment`** riêng (`equipmentItemId`, `code`, `name`,
`category`, `unit`, `rentalPrice`, `costPrice`, `replacementValue`, `status`), hoàn toàn khác bảng
`CatalogItem` (`itemId`, `name`, `itemType`, `basePrice`...) mà `docs/api/03-catalog.md` mô tả.
Backend có route riêng `GET/POST/PUT/PATCH /api/v1/equipment` (`equipment.route.ts`,
`equipment.controller.ts`, `equipment.service.ts`) — route này **chưa được ghi nhận ở đâu trong
`docs/api/`** của repo frontend (chỉ có comment "Equipment (formerly CatalogItem)" trong tài liệu nội
bộ của repo backend, không có mô tả endpoint đầy đủ).

Hệ quả: `src/types/quotation.ts` (`QuotationItem.catalogItemId`) và `FinalQuotation.tsx` (gọi
`catalogApiService.getCatalogItems()` để tra tên hạng mục báo giá) trước đây tra sai bảng — tên hạng
mục luôn rơi về fallback `#${id}` vì field thật trả về là `equipmentItemId`, không phải
`catalogItemId`. Đã sửa trong lần này: đổi field trong `QuotationItem`/`SaveQuotationPayload` thành
`equipmentItemId`, thêm `src/services/equipment.service.ts` + `src/types/equipment.ts` gọi đúng
`GET /api/v1/equipment`, và cập nhật `FinalQuotation.tsx` + trang `/manager/quotations` tra tên theo
bảng `Equipment`.

Đề xuất: bổ sung tài liệu (file `docs/api/14-equipment.md` mới, hoặc gộp vào `03-catalog.md`) mô tả
đầy đủ `GET/POST/PUT/PATCH /api/v1/equipment`, đồng thời làm rõ với backend team liệu `CatalogItem`
(dùng ở `/catalog-items`) và `Equipment` (dùng ở `/equipment`, được `QuotationItem` tham chiếu) có
phải 2 bảng cố ý tách riêng (vd. `CatalogItem` = dịch vụ/gói giá bán, `Equipment` = thiết bị vật lý
theo dõi tồn kho) hay là dữ liệu trùng lặp còn sót lại từ đợt đổi tên "CatalogItem → Equipment".

---

## (bb) `WorkTask` không khớp `docs/api/10-survey-assignment.md` — không có cột thời gian; lịch dự kiến thật nằm ở model `Schedule` riêng nhưng `GET /schedules` chưa triển khai (501)

Phát hiện khi build trang "Khảo sát" (`/manager/survey`) và chuẩn bị build "Lịch trình"
(`/manager/schedule/plans`, `/manager/schedule/tasks`) — 2 trang trước đó chỉ là placeholder rỗng.
Đối chiếu `types/workTask.ts` (đã có sẵn trong repo, dùng cho `ScheduleTimeline.tsx` ở Dashboard và
`SurveyPersonnelTab.tsx` ở chi tiết đơn hàng) với response thật của `GET /api/v1/tasks` và trực tiếp
`D:\bnwems-backend-api\prisma\schema.prisma` — phát hiện lệch hoàn toàn, không chỉ so với
`docs/api/10-survey-assignment.md` mà so với cả type cũ đã tồn tại sẵn trong FE.

**1. `WorkTask` thật (model Prisma, `work_tasks` table) không có `scheduledStart`/`scheduledEnd`.**
Field thật:
```
workTaskId, orderId, scheduleId (BigInt?, FK), taskCategory ('survey' | 'operation'),
title (string, mô tả tự do vd "Khảo sát địa điểm đơn 1"), description (string?),
status ('draft' | 'assigned' | 'in_progress' | 'done'), progressPercent (Int),
createdBy, createdAt, updatedAt
```
Không có field nào tên `taskType` (thật ra là `taskCategory`, chỉ 2 giá trị `survey`/`operation`,
không phải `preparation`/`installation`/`transport`/`collection` như doc/type cũ giả định), và
tuyệt đối không có ngày/giờ dự kiến thực hiện nào trên `WorkTask`.

**2. Lịch dự kiến thật (ngày, giờ bắt đầu/kết thúc, địa điểm) nằm ở model `Schedule` riêng** —
đây chính là khái niệm nghiệp vụ "Schedule Plan" mô tả ở CLAUDE.md (tách biệt với Work Task):
```
model Schedule {
  scheduleId, orderId,
  activityType ('survey'|'preparation'|'transport'|'execution'|'collection'|'return'),
  plannedDate (Date), plannedStart (DateTime?), plannedEnd (DateTime?),
  location (string?), note (string?), status ('planned'|'done'|'cancelled'),
  createdBy, createdAt, updatedAt
}
```
`WorkTask.scheduleId` là FK trỏ tới bảng này. Đây đúng là dữ liệu cần cho cột "ngày khảo sát"/lịch
tháng/lịch tuần — nhưng **`GET /api/v1/schedules` (`schedule.route.ts`) hiện chỉ trả
`501 Not Implemented`** (`export const getSchedules = async (req, res) => { res.status(501)... }`,
route đã đăng ký với `authorizeRoles('ADMIN','MANAGER','LEADER_STAFF')` nhưng handler chưa viết gì).
Không có cách nào đọc được dữ liệu `Schedule` qua API ở thời điểm hiện tại — kể cả muốn tự query
theo `orderId` cũng không có endpoint nào khác thay thế.

**3. Bug filter `taskType` trên `GET /tasks`** — `task.service.ts getTasks`:
```ts
if (taskType) whereClause.title = taskType;
```
Query param `taskType` (đúng tên tham số trong `docs/api/10-survey-assignment.md`) bị so khớp nhầm
vào cột `title` (mô tả tự do) thay vì cột phân loại thật `taskCategory` — gọi
`GET /tasks?taskType=survey` luôn trả rỗng vì không có `title` nào đúng bằng chuỗi `"survey"`.

**Đã xử lý ở FE (phiên này) để không chặn tiến độ:**
- Sửa lại `types/workTask.ts` khớp đúng field thật (`taskCategory`, `title`, `description`,
  `status` 4 giá trị `draft/assigned/in_progress/done`, `progressPercent`, `scheduleId`).
- `workTaskApiService.getTasks` bỏ tham số `taskType` khỏi `GetTasksQuery` (không còn dùng được do
  bug mục 3) — trang Khảo sát gọi `GET /tasks` không filter rồi tự lọc `taskCategory === 'survey'`
  phía client.
- `ScheduleTimeline.tsx` (Dashboard) và `SurveyPersonnelTab.tsx`/`ExecutionTrackingCard.tsx` (tab
  "Khảo sát & Nhân sự" của đơn hàng) sửa lại dùng `taskCategory`/`title`/`status` thật thay vì
  `taskType`/`scheduledStart`/`scheduledEnd` cũ. **Lưu ý side-effect đã tồn tại từ trước phiên này**:
  vì `ScheduleTimeline.tsx` trước đó nhóm task theo `new Date(task.scheduledStart)` (field không tồn
  tại → luôn `Invalid Date`), widget "Lịch trình & Lịch sự kiện" ở Dashboard trước nay **không bao
  giờ hiển thị được task nào** dù `GET /tasks` có dữ liệu thật — task luôn không khớp bất kỳ ngày nào
  trên mini-calendar. Đã sửa tạm bằng cách nhóm theo `createdAt` (dữ liệu thật, nhưng là ngày TẠO
  task chứ không phải ngày dự kiến thi công thật) + progress bar dùng thẳng `progressPercent` thật
  (chính xác hơn cách tính cũ dựa trên khung giờ scheduledStart/End không tồn tại).
- Trang "Khảo sát" (`/manager/survey`) và trang "Lịch trình" sắp build: cột "ngày khảo sát"/lịch
  tháng-tuần tạm dùng **ngày mock** (suy ra từ `createdAt + offset cố định`, ổn định qua các lần tải
  lại) — **luôn hiển thị in nghiêng** kèm tooltip "Dữ liệu minh họa" để phân biệt rõ với dữ liệu thật,
  theo đúng quy tắc mock data ở CLAUDE.md mục 4.

**Đề xuất cho backend:**
1. Triển khai thật `GET /api/v1/schedules` (hiện 501) — tối thiểu nên hỗ trợ filter `orderId`,
   `activityType`, `status`, khoảng ngày (`dateFrom`/`dateTo`), trả đúng field model `Schedule` ở
   trên. Đây là điều kiện tiên quyết để có bất kỳ tính năng lịch/calendar thật nào ở FE.
2. Cân nhắc để `GET /tasks` trả kèm thông tin `Schedule` liên quan (join theo `scheduleId`, hoặc trả
   thêm `plannedDate/plannedStart/plannedEnd/location` ngay trong response) — tránh FE phải gọi
   thêm N request theo từng `scheduleId` sau khi có mục 1.
3. Sửa bug mục 3: `task.service.ts getTasks` nên lọc theo `taskCategory` khi nhận `taskType`/
   `taskCategory` param (đổi tên param cho khớp cột thật để tránh nhầm lẫn tiếp).
4. Đồng bộ lại `docs/api/10-survey-assignment.md`: `WorkTask` response mẫu hiện ghi
   `taskType`/`scheduledStart`/`scheduledEnd`/status `pending|in_progress|completed` — không khớp
   field thật liệt kê ở mục 1.
5. Bổ sung tài liệu cho `taskType` (thực chất là `title`) trong `createTaskSchema`/`updateTaskSchema`
   ở `task.validator.ts`: `task.service.ts createTask` ghi `title: taskType` nguyên văn và chỉ đặc
   cách `taskCategory: 'survey'` khi `taskType` đúng bằng chuỗi `"survey"` — nghĩa là task khảo sát
   tạo qua API luôn có `title` hiển thị đúng là chữ "survey" (không đặt được tiêu đề khác), còn với
   "operation" thì chuỗi nhập vào vừa là `taskCategory` vừa là `title` hiển thị. Ngoài ra
   `scheduledStart`/`scheduledEnd`/`location` không được lưu vào cột riêng nào — bị nhét nguyên dạng
   `JSON.stringify(...)` vào cột `description` (đè hoàn toàn nội dung `description` cũ nếu có ở
   `updateTask`), và **không nơi nào đọc lại/parse cột này** (`getTasks` trả `description` dạng
   string thô) — dữ liệu coi như ghi one-way, không dùng lại được cho hiển thị lịch. Đề xuất: sau khi
   mục 1 (bảng `Schedule` có GET thật) được triển khai, `createTask`/`updateTask` nên ghi
   `scheduledStart/End/location` vào đúng bảng `Schedule` (tạo/liên kết qua `scheduleId`) thay vì
   nhét JSON vào `description`.

## (cc) `GET /api/v1/users` chỉ cho phép role `ADMIN` — Manager không tự tra được danh sách Leader/Technical Staff để phân công

Phát hiện khi build tính năng "Phân công nhân sự" ở trang Kanban "Giao việc cho nhân sự"
(`/manager/schedule/tasks`, dùng lại đúng pattern `AssignStaffModal.tsx` đã có sẵn ở tab "Khảo sát &
Nhân sự" của chi tiết đơn hàng). `user.route.ts`:
```ts
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));
router.get('/', validate(getUsersSchema), userController.getUsers);
```
Toàn bộ router `/api/v1/users` (bao gồm `GET /`) chỉ cho phép `ADMIN` — gọi bằng tài khoản `MANAGER`
luôn nhận `403 "You do not have permission to perform this action."`.

**Đây không phải lỗi mới do tính năng này** — `AssignStaffModal.tsx` (component đã tồn tại từ trước,
dùng ở `SurveyPersonnelTab.tsx`) cũng gọi y hệt `userApiService.getUsers(...)` để lấy danh sách nhân
sự, nên nút "Phân công nhân sự thi công"/"Đổi người khảo sát" ở tab "Khảo sát & Nhân sự" của đơn hàng
**cũng đã luôn thất bại tương tự cho tài khoản Manager** — chỉ là chưa ai click thử/nhận ra vì lỗi bị
nuốt gọn thành text "Không tải được danh sách nhân sự" (catch rồi set rỗng), không có exception nào
nổi lên rõ ràng. Theo CLAUDE.md, Manager mới là role chịu trách nhiệm điều phối nhân sự (Admin không
xử lý vận hành hằng ngày) — nên đây là một gap chặn đúng luồng nghiệp vụ chính, không phải use-case
biên.

Đề xuất: cho phép `MANAGER` gọi `GET /api/v1/users` (ít nhất filter theo `role=LEADER_STAFF,
TECHNICAL_STAFF` để không lộ toàn bộ danh sách tài khoản/Admin khác), hoặc bổ sung endpoint riêng nhẹ
hơn (vd `GET /api/v1/staff` chỉ trả `{ id, fullName, username, role }` của Leader/Technical Staff) mà
Manager được phép gọi.
