# Checklist cập nhật – 19/10/2026

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
- [x] Đổi ca, thêm ca, hủy ca thuộc chức năng Đăng ký ca – cùng 1 UI (Đăng ký ca · Thêm ca · Đổi ca · Hủy ca), chọn loại thì UI đổi tương ứng; bỏ menu "Đổi ca" / "Hủy ca" riêng
- [x] Chế độ xem "Danh sách yêu cầu" trong Lịch làm việc (đăng ký + thêm / đổi / hủy ca), lọc theo loại, trạng thái, ngày làm, ngày gửi – tương tự trang Quản lý
- [x] (yêu cầu chung) Còn trong thời gian đăng ký (của phiên / đợt) mà bỏ đăng ký → xóa luôn như chưa từng có, không cần duyệt (kể cả đã duyệt), xóa luôn yêu cầu khẩn gắn với phân ca đó
- [x] (thêm) Duyệt yêu cầu Thêm / Đổi / Hủy ca giờ áp dụng thật vào lịch (trước đây chỉ đổi trạng thái); áp dụng cho cả duyệt hàng loạt và duyệt từng yêu cầu
- [x] (thêm) Sửa lỗi `requestedAt` gửi dạng chuỗi gây lỗi 500; nhân viên không tự đặt được trạng thái yêu cầu

## 3. Quản lý: lịch ca + cấu hình

- [ ] Sắp xếp lại thứ tự tab: Kỳ, Nhóm ca, Thời khóa biểu, Sự kiện
- [ ] Bỏ tab Khẩn cấp trong Quản lý lịch ca (chỉ nhân viên dùng chức năng này)
- [ ] TKB: chia màu theo nhóm ca và vùng màu (vd. nhóm Linh hoạt: Sáng xanh lam nhạt, Trưa xanh lam vừa, Tối xanh lam đậm; nhóm Cố định màu vàng)
- [ ] TKB: thêm ca theo ngày (cửa hàng theo bộ lọc hiện tại), chọn theo trình tự Kỳ* → Đợt* → Phiên → Ca mẫu* (chọn trước lọc sau); bắt buộc hết trừ đơn giá, số người tối đa, ghi chú
- [ ] TKB: đổi tên "Danh sách yêu cầu đăng ký" → "Danh sách yêu cầu" (gồm cả yêu cầu khẩn cấp)
- [ ] Quản lý và trưởng cửa hàng được phân bổ nhân viên vào ca cụ thể theo ngày nhưng phải đúng nhóm ca
- [ ] Cấu hình: phạm vi số lượng min / max cho tất cả khung giờ
- [ ] Cấu hình: ngưỡng ban đầu là min; khi tất cả ca đạt min → nâng lên max (chỉ áp dụng khi nhân viên đăng ký ca)
- [ ] Cấu hình: quản lý / trưởng cửa hàng được thêm nhân viên vượt ngưỡng min dù chưa thỏa điều kiện trên
- [x] Phản hồi: chỉ gửi loại Hệ thống (xem mục 1)

## 4. Admin tài khoản + Quản lý cửa hàng

- [ ] Tài khoản admin: không cho chỉnh quyền, không khóa, luôn hoạt động
- [ ] Không có chức năng xóa tài khoản
- [ ] Luôn có ít nhất 1 tài khoản quản lý đang hoạt động
- [ ] Cửa hàng: trạng thái chỉ OPENING / CLOSED
- [ ] Cửa hàng: tạo mới mặc định OPENING, chỉ chọn trạng thái khi chỉnh sửa
- [ ] Cửa hàng: bấm vào hiện popup chi tiết đầy đủ field, ảnh và danh sách nhân viên
- [ ] Cửa hàng: không cho xóa

## 5. Trưởng cửa hàng (và áp dụng chung)

- [x] Tổng quan: lỗi `NoClassDefFoundError: StatisticsResponse$EmployeeStat` (trang Quản lý cũng bị) — không phải lỗi code, do `target/classes` bị build lại khi backend đang chạy; khởi động lại backend là hết (đã kiểm tra 3 API thống kê trả 200)
- [ ] Quản lý nhân sự: danh sách giống trang Quản lý nhưng chỉ xem thông tin + lọc / tìm kiếm
- [ ] Đăng ký ca, xử lý yêu cầu ca, lịch làm việc gộp vào "Quản lý ca" giống UI trang Quản lý
- [ ] Xuất danh sách ca: chức năng nhỏ trong Lịch làm việc ở chế độ danh sách (thêm chế độ list nếu chưa có)
  - [ ] Tải về file Excel
  - [ ] Lọc thế nào tải về thế ấy
  - [ ] Đủ bộ lọc và khoảng thời gian
  - [ ] Áp dụng cho trang Quản lý
- [x] Feedback nhân viên + gửi phản hồi chỉ 1 menu "Quản lý phản hồi" (xem mục 1)
- [ ] Thông báo: việc cần xử lý / thông báo cần quan tâm hiện trên chuông thông báo (tất cả role)
