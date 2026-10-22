# Báo cáo tối ưu hiệu năng – Schedule System (22/10/2026)

## Cách đo

- Chạy jar **gốc** (commit `4537403`) và jar **mới** với thống kê Hibernate (`hibernate.generate_statistics`), đếm số câu SQL thực tế của từng request; gọi API bằng token của 4 vai trò `ADMIN`, `MANAGER`, `STORE_MANAGER`, `EMPLOYEE`.
- Hai bộ dữ liệu: DB dev hiện tại (414 phân ca, 24 nhân viên) và một **DB bản sao có dữ liệu lớn** (12.456 phân ca, 4.194 ca theo ngày, 2.024 nhân viên/tài khoản, 6.000 chấm công, 3.000 yêu cầu khẩn). DB bản sao đã xóa sau khi đo.
- Tương thích: lưu body JSON của 36 endpoint × 4 vai trò trên bản gốc rồi so từng byte với bản mới.

## 1. Điểm nghẽn phát hiện và nguyên nhân

| # | Điểm nghẽn | Nguyên nhân | Bằng chứng (bản gốc) |
|---|---|---|---|
| 1 | `GET /shift_assignment` cực chậm | `findAll()` toàn bảng rồi **mỗi dòng** gọi `isCurrentUserRole`, `currentEmployeeId`, `isGlobalUser`, `visibleStoreIds` (mỗi hàm truy vấn lại user → user_role → từng role → employee → store_manager) + lazy-load ca/cửa hàng | 12.456 dòng: **74.743 SQL / 185 giây** (admin), **166.106 SQL / 381 giây** (trưởng CH), 75.043 SQL / 145 giây (nhân viên, chỉ trả 27 dòng) |
| 2 | Kiểm tra phạm vi lặp lại mọi nơi | `StoreScopeService` không ghi nhớ gì trong request, tra role bằng `findById` từng dòng `user_role` | 89 nơi gọi trong 20 service |
| 3 | `GET /employees` | Lọc vai trò / phạm vi theo từng dòng (N+1) | 6.082 SQL / 14 giây; nhân viên: 12.157 SQL / 21 giây để trả 1 dòng |
| 4 | `GET /emergency_request` + tạo yêu cầu | Kiểm tra vai trò từng dòng; 3 chỗ `findAll()` toàn bảng chỉ để kiểm tra "có yêu cầu đang chờ" | 9.007–18.007 SQL / 32–43 giây |
| 5 | `GET /attendance` | Lazy-load nhân viên + ca cho từng dòng | 2.010 SQL |
| 6 | Mọi API dùng `DtoMapper` (user, user_role, role_permission, employee_store…) | `Introspector.getBeanInfo(cls, stopClass)` không được JDK cache → phân tích reflection lại cho từng dòng | `/user_role` 2.025 dòng: **18 giây với chỉ 6 SQL**; `/role_permission` 3 giây |
| 7 | `GET /stores` | Mỗi lần gọi danh sách đều tải ảnh từ R2 và nhúng base64; được 5 trang gọi nhưng chỉ trang Cửa hàng dùng ảnh | 145 KB cho 2 cửa hàng, ~1 giây |
| 8 | `PermissionInterceptor` (mọi request) | 3 truy vấn (user_role → role_permission → permission) + 4 lệnh `System.out.println` | +2 SQL & ghi console mỗi request |
| 9 | `ShiftByDate`, `Shift`, `EmployeeStore`, `StoreManager` | `findAll()` rồi lọc Java; trưởng CH gọi `findAll()` ca theo ngày 2 lần; N+1 tên cửa hàng / nhóm ca | `/shift` 70 SQL cho 4 dòng |
| 10 | Trang Tài khoản / Nhân sự / Chấm công | Frontend tải toàn bộ 2–4 danh sách rồi tự ghép theo id, lọc, đếm | Nhân sự: 4 request ~1,2 MB; Tài khoản: 4 request ~670 KB; Chấm công: 3,9 MB |
| 11 | Thiếu index | Lọc `shift_by_date` theo khoảng ngày = full scan; sắp chấm công theo giờ = filesort; `swap_assignment_id` không có index | `EXPLAIN`: `type=ALL`, `Using filesort` |
| 12 | Chuông thông báo | Poll 60 giây cả khi tab ẩn; mỗi lần focus cửa sổ gọi lại 2 API tuần tự | — |

## 2. API thiết kế lại / bổ sung

**Bổ sung (API tổng hợp có phân trang, mặc định 10, tối đa 100, `page` bắt đầu từ 1, `sort` theo danh sách cho phép):**

| Endpoint | Thay cho | Tham số | Sắp xếp |
|---|---|---|---|
| `GET /api/v1/employees/page` | `/employees` + `/stores` + `/employee_store` + `/store_manager` (frontend tự ghép) | `q, status, storeId, role, assignmentStatus, primary` | `newest` (mặc định), `name`, `code`, `hireDate` |
| `GET /api/v1/attendance/page` | `/attendance` toàn bộ | `q, status, employeeId, from, to` | `newest` (mặc định), `oldest` |
| `GET /api/v1/user/accounts` | `/user` + `/user_role` + `/role` + `/stores` | `q, role, status` | `newest` (mặc định), `username`, `lastLogin` |

**Sửa (giữ nguyên URL, tên field, kiểu dữ liệu):**

- `GET /shift_assignment`: lọc phạm vi trong SQL; thêm tham số tùy chọn `storeId, from, to, status`.
- `GET /stores`: thêm `includeLogo` (mặc định `true` để tương thích); frontend chỉ bật ở trang Cửa hàng.
- `GET /shift_by_date`, `/shift`, `/employees`, `/employee_store`, `/store_manager`, `/emergency_request`, `/attendance`: chuyển lọc phạm vi / bộ lọc vào SQL, JOIN FETCH quan hệ cần hiển thị.
- Thứ tự mặc định **mới nhất trước** (kèm `id DESC`): vi phạm (`violationTime`), yêu cầu khẩn (`requestedAt`), kỷ luật / todo / audit log (`createdAt`), thưởng (`payrollMonth`), giao bài test (`assignedAt`). Lịch / ca theo ngày giữ thứ tự nghiệp vụ.

## 3. DTO tạo mới / chỉnh sửa

- Mới: `EmployeePageResponse` (Item kèm `manager`, `assignments[]` có `storeName`; `Summary {total, active, managers}`), `AttendancePageResponse` (`Summary {total, pendingCheckout, absent, violations}`), `AccountPageResponse` (Item kèm `roleId/roleCode/roleName`; `Summary {total, managers, employees, locked, activeManagers}`), `PageSupport` (chuẩn hóa page/size/sort, chống truyền tên cột tùy ý).
- Frontend: `lib/api/types/page.types.ts` (`PageMeta`, `PageResult`, các kiểu Item/Summary/Params).
- DTO cũ không đổi cấu trúc.

## 4. Trang đã tích hợp phân trang backend

| Trang | Trước | Sau |
|---|---|---|
| Quản lý tài khoản (Admin) | 4 request, tải toàn bộ, lọc/đếm ở trình duyệt | 1 request/trang (2,2 KB); vai trò + cửa hàng chỉ tải khi mở form sửa |
| Quản lý nhân sự (Quản lý + Trưởng CH chỉ xem) | 4 request (~1,2 MB với 2.000 NV) | 2 request (6 KB + 0,7 KB) |
| Quản lý chấm công | `/attendance` toàn bộ (3,9 MB với 6.000 bản ghi) | 6,6 KB/trang, thống kê do backend đếm |

Cả 3 trang: tìm kiếm có debounce 350 ms và không phân biệt dấu (collation `utf8mb4_unicode_ci`, ví dụ "nguyen" khớp "Nguyễn"), đổi bộ lọc tự về trang 1, hủy request cũ (`AbortController`), có trạng thái đang tải / lỗi / rỗng, thanh phân trang dùng chung `components/ui/Pagination.tsx`.

## 5. N+1 và truy vấn đã tối ưu

- `StoreScopeService`: ghi nhớ user / vai trò / nhân viên / cửa hàng trong phạm vi 1 request; vai trò lấy bằng 1 câu JOIN; nhân viên theo cửa hàng đếm trong DB.
- `PermissionInterceptor`: 3 truy vấn → 1 câu `EXISTS` JOIN.
- `DtoMapper`: cache danh sách getter theo class.
- `ShiftAssignment`, `ShiftByDate` (JOIN FETCH ca/kỳ/đợt/phiên), `Shift` (JOIN FETCH cửa hàng/nhóm ca), `Employee`, `EmployeeStore` (vai trò so với store_manager bằng `EXISTS`), `StoreManager`, `Attendance` (JOIN FETCH nhân viên/ca): lọc trong SQL thay vì `findAll()` + Java.
- `EmergencyRequest`: 3 lần `findAll()` toàn bảng → `existsPendingForAssignment` / `existsPendingAdd`.
- Phạm vi nhân viên của trưởng CH dùng `EXISTS` theo cửa hàng thay vì truyền danh sách hàng nghìn id.

## 6. Index bổ sung (`migration_performance.sql`, có phần khôi phục)

| Index | Lý do | Kiểm tra |
|---|---|---|
| `shift_by_date(work_date)` | Lọc lịch theo khoảng ngày (lịch, chuông thông báo, thống kê); `uk_shift_by_date(shift_id, work_date)` không dùng được khi không lọc ca | `ALL` → `range` |
| `attendance(check_in_at, attendance_id)` | Trang chấm công sắp mới nhất trước + LIMIT | bỏ filesort |
| `attendance(employee_id, check_in_at)` | Lịch sử chấm công của một nhân viên | `Backward index scan`, MySQL tự thay index khóa ngoại cũ |
| `emergency_request(swap_assignment_id)` | Kiểm tra ca đang có yêu cầu chờ (`assignment_id OR swap_assignment_id`) | có index cho cả hai nhánh OR |

Không thêm index cho các bảng nhỏ (permission, role…) hoặc cột đã có index khóa ngoại.

## 7. File thay đổi

- Backend (34 file sửa, 4 file mới): `config/PermissionInterceptor`, `dto/DtoMapper`, `util/PageSupport` (mới), `dto/response/{Employee,Attendance,Account}PageResponse` (mới), controller `Attendance/Employee/ShiftAssignment/Store/User`, repository `Attendance/EmergencyRequest/Employee/EmployeeStore/Permission/ShiftAssignment/ShiftByDate/Shift/StoreManager/User/UserRole`, service `Attendance/AuditLog/BonusRecord/DisciplinaryRecord/EmergencyRequest/Employee/EmployeeStore/ShiftAssignment/ShiftByDate/Shift/StoreManager/StoreScope/TestAssignment/Todo/User/Violation`.
- Frontend (16 file sửa, 2 file mới): `lib/api/{http,index,admin,manager/hr,manager/operations}.ts`, `lib/api/types/page.types.ts` (mới), `lib/hooks.ts` (`usePagedList`, `useDebouncedValue`), `components/ui/Pagination.tsx` (mới), `components/ui/index.ts`, `components/layout/NotificationBell.tsx`, `features/admin/tai-khoan/{useAccounts.ts,QuanLyTaiKhoanPage.tsx,AccountTable.tsx}`, `features/management/nhan-su/{useEmployees.ts,NhanSuPage.tsx,components/EmployeeTable.tsx}`, `features/management/{ChamCongPage,CuaHangPage}.tsx`.
- `migration_performance.sql` (mới).

## 8. Kết quả test và build

| Hạng mục | Kết quả |
|---|---|
| `mvn package` / `mvn test` | BUILD SUCCESS (dự án chưa có test nào trong `src/test`) |
| `tsc --noEmit` | 0 lỗi |
| ESLint (file đã sửa) | 0 lỗi, 3 cảnh báo `<img>` có sẵn từ trước ở `CuaHangPage` |
| `next build` | Thành công |
| So sánh response gốc ↔ mới (36 endpoint × 4 vai trò, DB dev) | 136/144 giống từng byte; 8 khác biệt là 3 dòng quyền mới do migration thêm vào `/permission`, `/role_permission` |
| Kiểm thử hồi quy luồng ghi (DB bản sao) | 19/19 PASS: duyệt hàng loạt; trưởng CH duyệt ca cửa hàng khác → 403; nhân viên chỉ thấy dữ liệu của mình; đăng ký ca / gửi yêu cầu khẩn vẫn áp dụng đúng quy tắc nghiệp vụ; check-in → bản ghi mới ở đầu trang 1 → sửa → xóa; khóa / mở khóa tài khoản cập nhật số liệu; `sort` lạ → 400; `size` > 100 bị giới hạn; trang vượt quá → danh sách rỗng; `/user/accounts` chỉ ADMIN |
| Endpoint mới theo vai trò | Trưởng CH chỉ thấy 13/24 nhân viên cửa hàng mình; nhân viên chỉ thấy chính mình |

## 9. So sánh hiệu năng (dữ liệu lớn, cùng máy, không làm nóng)

| Endpoint | Vai trò | SQL trước → sau | Thời gian trước → sau |
|---|---|---|---|
| `/shift_assignment` (12.456 dòng) | ADMIN | 74.743 → 7 | 185,3 s → 0,31 s |
| `/shift_assignment` (8.251 dòng) | STORE_MANAGER | 166.106 → 9 | 380,9 s → 0,19 s |
| `/shift_assignment` (27 dòng) | EMPLOYEE | 75.043 → 9 | 145,4 s → 0,02 s |
| `/employees` | ADMIN / EMPLOYEE | 6.082 / 12.157 → 7 / 9 | 14,1 s / 21,1 s → 0,07 s / 0,03 s |
| `/emergency_request` | ADMIN / EMPLOYEE | 9.007 / 18.007 → 7 / 8 | 43,2 s / 32,4 s → 0,08 s / 0,03 s |
| `/attendance` | ADMIN | 2.010 → 7 | 2,1 s → 0,31 s |
| `/user_role`, `/user` (2.025 dòng) | ADMIN | 6 → 4 | 18,3 s / 13,7 s → 0,04 s / 0,05 s |
| `/employee_store` | ADMIN | 11 → 7 | 14,8 s → 0,06 s |
| `/shift` | STORE_MANAGER | 70 → 9 | 0,15 s → 0,03 s |
| `/notification/me/tasks` | STORE_MANAGER | 40 → 10 | 0,18 s → 0,04 s |
| `/stores` → `/stores?includeLogo=false` | ADMIN | 11 → 7 | 1,0 s / 142 KB → 0,03 s / 0,7 KB |

DB dev (dữ liệu nhỏ): `/shift_assignment` 2.491 → 7 SQL (3,2 s → 0,07 s) với admin, 5.546 → 9 SQL (7,4 s → 0,04 s) với trưởng CH; `/role_permission` 3,0 s → 0,04 s.

Số request khi mở trang: Tài khoản 4 → 1; Nhân sự 4 → 2; Chấm công 2 → 2 (nhưng 3,9 MB → 6,6 KB); Lịch 11 → 11 (ảnh cửa hàng 142 KB → 0,7 KB, request nặng nhất từ hàng chục nghìn SQL còn 7–9). Chưa đo CPU / RAM.

## 10. Chưa xử lý và lý do

1. **Trang Lịch (`useScheduleData`) vẫn tải toàn bộ ca theo ngày + phân ca của mọi kỳ** (~5 MB ở dữ liệu lớn). Các tab Kỳ, Đợt, Danh sách yêu cầu, drawer chi tiết đều tính trên dữ liệu đầy đủ; tải theo tuần/tháng cần thêm endpoint tổng hợp riêng cho từng tab. Truy vấn backend đã nhanh (7–9 SQL), còn lại là dung lượng truyền.
2. **Endpoint danh sách cũ chưa phân trang** (`/shift_assignment`, `/shift_by_date`, `/emergency_request`, `/violation`, `/todo`, `/feedback`, `/user`, `/user_role`…): vẫn được nhiều trang dùng nguyên danh sách; đổi sang phân trang phải sửa từng nơi gọi nên giữ nguyên để tương thích.
3. **Ô chọn nhân viên ở trang Chấm công** vẫn tải `/employees?status=ACTIVE` đầy đủ (~680 KB với 2.000 NV); nên đổi thành ô tìm kiếm gọi backend.
4. **Phạm vi dữ liệu (phát hiện khi rà, chưa sửa vì sẽ đổi hành vi hiện tại)**: `GET /attendance` và `GET /emergency_request` không giới hạn theo cửa hàng với trưởng CH; DB đang cấp `GET /user`, `/user_role`, `/role_permission`, `/audit_log` cho cả vai trò EMPLOYEE. Endpoint mới đã áp phạm vi đúng.
5. **Bộ test tự động**: dự án chưa có test; kiểm thử dùng script gọi API, chưa kiểm thử giao diện trên trình duyệt.
6. `FeedbackService.list()` vẫn đọc toàn bảng rồi lọc quyền trong Java (quy tắc xem nhiều nhánh); đã truy vấn theo lô, số bản ghi phản hồi hiện nhỏ.

## Việc cần làm khi triển khai

1. Chạy `migration_performance.sql` trên DB đích (đã chạy trên DB dev `schedule_system`); không chạy thì 3 endpoint mới trả 403.
2. Triển khai backend trước frontend (frontend mới gọi 3 endpoint mới và tham số `includeLogo`).
