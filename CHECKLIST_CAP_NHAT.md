# Checklist cập nhật – 19/10/2026 (bổ sung 20/10/2026)

Nguồn: `feedback.md`. Lưu ý chung: cập nhật cho những role còn lại nếu có cùng chức năng và nghiệp vụ.

Ký hiệu: `[x]` đã xong · `[ ]` chưa làm · `[~]` đang làm

Thứ tự thực hiện: **1. Phản hồi → 2. Nhân viên: lịch & đăng ký ca → 3. Quản lý lịch ca + Cấu hình → 4. Admin tài khoản + Cửa hàng → 5. Trưởng cửa hàng (nhân sự, quản lý ca, xuất Excel, thông báo)**

---

## 1. Phản hồi (Admin · Quản lý · Trưởng cửa hàng · Nhân viên) — ✅ xong 20/10/2026

- [x] Bỏ "Từ chối", chỉ còn 4 trạng thái: PENDING → REVIEWED → RESOLVED, CLOSED
  - [x] PENDING: sau khi gửi
  - [x] REVIEWED: Admin / Quản lý / Trưởng cửa hàng chọn sau PENDING
  - [x] RESOLVED: chọn sau REVIEWED; RESOLVED quay về REVIEWED được
  - [x] CLOSED: chọn sau PENDING hoặc RESOLVED; là trạng thái cuối, không chuyển được nữa
- [x] Lọc theo thời gian gửi (từ ngày – đến ngày) và vai trò người gửi
- [x] Chỉ 3 loại phản hồi, có chú thích khi hover:
  - [x] Ca làm – bắt buộc chọn ca cụ thể (có ngày) · "Góp ý hay báo cáo vấn đề của ca làm"
  - [x] Đồng nghiệp – chỉ đích danh (không bắt buộc) · "Nhận xét về đồng nghiệp"
  - [x] Hệ thống – luôn gửi tới admin · "Báo cáo tình trạng hệ thống nếu gặp lỗi, chi tiết chức năng hay chứng cứ ảnh lỗi (nếu có)"
- [x] Người gửi chỉ được xem lại phản hồi (bỏ thu hồi / xóa)
- [x] Quản lý: chỉ gửi phản hồi loại Hệ thống
- [x] Trưởng cửa hàng: gộp "Feedback nhân viên" + "Gửi phản hồi" thành 1 menu **Quản lý phản hồi** (xem danh sách, nút gửi phản hồi)
- [x] (thêm) Upload / xem ảnh đính kèm trực tiếp; phản hồi ca chỉ khi ca đã duyệt và đang trong giờ làm

## 2. Nhân viên: lịch làm việc & đăng ký ca — ✅ xong 20/10/2026

- [x] Lịch làm việc chỉ hiển thị ca làm khi kỳ đăng ký lịch đã kết thúc (hết `registration_close_at` / đã chốt); có thông báo số ca đang ẩn và link sang Đăng ký ca
- [x] ~~Đổi ca, thêm ca, hủy ca thuộc chức năng Đăng ký ca~~ → 20/10 chuyển sang Lịch làm việc (Đặt lịch khẩn, xem mục 2b)
- [x] Chế độ xem "Danh sách yêu cầu" trong Lịch làm việc (đăng ký + thêm / đổi / hủy ca), lọc theo loại, trạng thái, ngày làm, ngày gửi – tương tự trang Quản lý
- [x] (yêu cầu chung) Còn trong thời gian đăng ký (của phiên / đợt) mà bỏ đăng ký → xóa luôn như chưa từng có, không cần duyệt (kể cả đã duyệt), xóa luôn yêu cầu khẩn gắn với phân ca đó
- [x] (thêm) Duyệt yêu cầu Thêm / Đổi / Hủy ca giờ áp dụng thật vào lịch (trước đây chỉ đổi trạng thái); áp dụng cho cả duyệt hàng loạt và duyệt từng yêu cầu
- [x] (thêm) Sửa lỗi `requestedAt` gửi dạng chuỗi gây lỗi 500; nhân viên không tự đặt được trạng thái yêu cầu

## 2b. Feedback 20/10/2026 — Phản hồi thay + Đặt lịch khẩn — ✅ xong 20/10/2026

> Cần khởi động lại backend (ddl-auto tự thêm bảng `feedback_history`, cột `feedback.handler_role`, `emergency_request.swap_assignment_id`; hoặc chạy tay `migration_feedback.sql` + `migration_urgent_swap.sql`)

**Quản lý – Phản hồi**
- [x] Quản lý (quản lý chuỗi) phản hồi / chuyển trạng thái thay trưởng cửa hàng với phản hồi gửi tới trưởng cửa hàng; popup báo "bạn đang phản hồi thay", danh sách + chi tiết gắn nhãn "Quản lý phản hồi thay"
- [x] Mỗi lần chuyển trạng thái có ô nhận xét (ghi chú) riêng → lưu lịch sử `feedback_history` (trạng thái cũ → mới, người xử lý, vai trò, thời gian, ghi chú); hiện dòng thời gian "Lịch sử xử lý" cho cả người gửi và người xử lý (áp dụng cả Admin / Trưởng cửa hàng)

**Nhân viên – Đặt lịch khẩn (Thêm / Đổi / Hủy ca)**
- [x] Bỏ Thêm / Đổi / Hủy ca khỏi trang Đăng ký ca (trang này chỉ còn đăng ký); chuyển sang trang Lịch làm việc
- [x] Chỉ áp dụng cho lịch đang dùng (kỳ đã kết thúc đăng ký) – kiểm tra cả frontend và backend
- [x] Chỉ cho ca bắt đầu sau thời điểm hiện tại (so cả ngày + giờ bắt đầu) – cả ca hiện tại lẫn ca muốn thêm / đổi sang
- [x] Gọi chung là **Đặt lịch khẩn**: 1 popup, chọn loại Thêm / Đổi / Hủy thì các trường đổi theo; mở từ nút "Đặt lịch khẩn", nút Thêm / Đổi / Hủy cuối trang, nút Đổi / Hủy trên thẻ ca (chọn sẵn ca) và từ Tổng quan
- [x] Chung 1 danh sách "Danh sách yêu cầu" phân loại Đăng ký ca / Đặt lịch khẩn (+ loại Thêm / Đổi / Hủy)
- [x] Đổi ca bắt buộc chọn nhân viên đang làm ca muốn đổi sang → khi duyệt hai người đổi chỗ, số lượng mỗi ca giữ nguyên (backend kiểm tra: đồng nghiệp đã duyệt vào ca đích, thuộc nhóm ca của ca cũ, chưa có trong ca cũ, không có yêu cầu chờ khác); ca của đồng nghiệp cũng hiện "chờ đổi"; danh sách yêu cầu của Quản lý hiện "đổi với ..."
- [x] Bộ lọc cho các trường: popup lọc ca theo từ ngày / đến ngày / cửa hàng / tên ca-nhóm-giờ, lọc nhân viên đổi theo tên-mã; danh sách yêu cầu lọc theo phân loại, loại, trạng thái, cửa hàng, người đổi cùng, ngày làm, ngày gửi, tìm kiếm

## 3. Quản lý: lịch ca + cấu hình — ✅ xong 20/10/2026

- [x] Sắp xếp lại thứ tự tab: Kỳ, Nhóm ca, Thời khóa biểu, Sự kiện (+ tab mới Cấu hình ở cuối)
- [x] Bỏ tab Khẩn cấp trong Quản lý lịch ca (yêu cầu khẩn của nhân viên duyệt trong Danh sách yêu cầu của TKB)
- [x] TKB: chia màu theo nhóm ca và vùng màu – mỗi nhóm một họ màu, Sáng nhạt → Trưa vừa → Tối đậm (nhóm "Linh hoạt" xanh lam, nhóm "Cố định" vàng, nhóm khác lần lượt xanh lá / tím / hồng...); áp dụng cả tuần, tháng, danh sách + chú thích màu
- [x] TKB: thêm ca theo ngày – cửa hàng theo bộ lọc hiện tại, chọn theo trình tự Kỳ* → Đợt* → Phiên → Ca mẫu* (chọn trước lọc sau: đợt theo kỳ + cửa hàng, phiên theo đợt, ca mẫu theo cửa hàng / nhóm ca của phiên); bắt buộc hết trừ đơn giá, số người tối đa, ghi chú; tên ca / giờ tự điền theo ca mẫu, ngày làm giới hạn trong kỳ
- [x] TKB: đổi tên "Danh sách yêu cầu ĐK / đăng ký" → "Danh sách yêu cầu" (gồm cả đặt lịch khẩn)
- [x] Quản lý và trưởng cửa hàng phân bổ nhân viên vào ca cụ thể theo ngày nhưng phải đúng nhóm ca – backend chặn mọi phân bổ sai nhóm (trước chỉ chặn khi tự đăng ký) + không cho trùng người trong ca; form phân bổ chỉ liệt kê thành viên nhóm ca chưa có trong ca
- [x] Cấu hình: phạm vi số lượng min / max cho tất cả khung giờ – tab **Cấu hình** liệt kê mọi khung giờ (ca mẫu) theo nhóm, sửa min / max từng dòng hoặc "Điền cho tất cả", kiểm tra min ≤ max; form ca mẫu thêm trường min
- [x] Cấu hình: ngưỡng ban đầu là min; khi tất cả khung giờ của nhóm ca trong ngày đạt min → nâng lên max (chỉ áp dụng khi nhân viên tự đăng ký; ô đăng ký hiện "Đủ tối thiểu – đăng ký khung giờ khác trước")
- [x] Cấu hình: quản lý / trưởng cửa hàng được thêm nhân viên vượt min dù chưa thỏa điều kiện trên (chỉ giới hạn bởi max)
- [x] Phản hồi: chỉ gửi loại Hệ thống (xem mục 1)

## 4. Admin tài khoản + Quản lý cửa hàng — ✅ xong 20/10/2026

- [x] Tài khoản admin: không cho chỉnh quyền, không khóa, luôn hoạt động (giao diện khóa ô vai trò / trạng thái, backend chặn đổi trạng thái và gán / gỡ quyền của admin)
- [x] Không có chức năng xóa tài khoản (bỏ nút xóa, API xóa user trả lỗi)
- [x] Luôn có ít nhất 1 tài khoản quản lý đang hoạt động (không khóa / gỡ quyền được quản lý hoạt động cuối cùng; đổi vai trò thất bại thì không gán thêm vai trò mới)
- [x] Cửa hàng: trạng thái chỉ OPENING / CLOSED (dữ liệu cũ ACTIVE → OPENING, INACTIVE → CLOSED; bộ lọc + nhãn mới)
- [x] Cửa hàng: tạo mới mặc định OPENING, chỉ chọn trạng thái khi chỉnh sửa (backend ép OPENING khi tạo, chỉ nhận OPENING / CLOSED)
- [x] Cửa hàng: bấm vào (thẻ hoặc dòng bảng) hiện popup chi tiết đầy đủ field, ảnh và danh sách nhân viên (có tìm kiếm, đánh dấu trưởng cửa hàng)
- [x] Cửa hàng: không cho xóa (bỏ nút xóa, API xóa trả lỗi)

## 5. Trưởng cửa hàng (và áp dụng chung) — ✅ xong 20/10/2026

- [x] Tổng quan: lỗi `NoClassDefFoundError: StatisticsResponse$EmployeeStat` (trang Quản lý cũng bị) — không phải lỗi code, do `target/classes` bị build lại khi backend đang chạy; khởi động lại backend là hết (đã kiểm tra 3 API thống kê trả 200)
- [x] Quản lý nhân sự: menu mới, dùng chung danh sách của trang Quản lý ở chế độ chỉ xem (xem hồ sơ + lọc / tìm kiếm, không thêm / sửa / xóa); backend giới hạn theo cửa hàng
- [x] Đăng ký ca, xử lý yêu cầu ca, lịch làm việc gộp vào 1 menu **Quản lý ca** (tab Lịch làm việc · Xử lý yêu cầu ca · Đăng ký ca của tôi); Lịch làm việc dùng chính giao diện TKB của trang Quản lý
- [x] Xuất danh sách ca: chế độ **Danh sách** trong Lịch làm việc (bỏ menu "Xuất danh sách ca" riêng)
  - [x] Tải về file Excel (.xlsx thật, không cần thư viện – đã mở thử bằng Excel)
  - [x] Lọc thế nào tải về thế ấy (xuất đúng các dòng đang hiển thị)
  - [x] Đủ bộ lọc và khoảng thời gian: từ ngày – đến ngày, cửa hàng, kỳ, nhóm ca, trạng thái ca, nhân viên, trạng thái phân ca (gồm "ca chưa có nhân viên"), tìm kiếm
  - [x] Áp dụng cho trang Quản lý (cùng component)
- [x] Feedback nhân viên + gửi phản hồi chỉ 1 menu "Quản lý phản hồi" (xem mục 1)
- [x] Thông báo: chuông hiện mục "Việc cần xử lý & cần quan tâm" cho mọi role, bấm để mở trang; chấm cam = số việc cần xử lý
  - Quản lý / trưởng cửa hàng: đăng ký ca chờ duyệt, đặt lịch khẩn chờ duyệt, ca thiếu người 7 ngày tới, phản hồi chờ xử lý (+ todo chưa xong với trưởng cửa hàng)
  - Admin: phản hồi chờ xử lý
  - Nhân viên: ca ngày mai, đang mở đăng ký ca, yêu cầu vừa được xử lý, phản hồi có cập nhật

> **Trước khi chạy:** khởi động lại backend và chạy `migration_store_account.sql` (trạng thái cửa hàng, cột `shift.min_capacity`) + `migration_quan_ly_ca.sql` (quyền API cho trưởng cửa hàng dùng Quản lý ca / Nhân sự và endpoint `GET /api/v1/notification/me/tasks` cho mọi role).
