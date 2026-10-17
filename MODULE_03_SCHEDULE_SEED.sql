-- =========================================
-- MODULE 03: SCHEDULE & SHIFT
-- Dữ liệu mẫu bổ sung: kỳ lịch theo TUẦN (02/11 – 08/11/2026)
--
-- Chạy SAU file `sql` (cần store 1, employee 1–4, shift_group 1–2, shift 1–2).
-- Dùng id từ 101 để không trùng dữ liệu gốc; chạy lại nhiều lần không bị lỗi trùng khóa.
--
-- Mốc thời gian của kỳ: Kỳ (đợt đăng ký -> các phiên; duyệt) -> Áp dụng
--   26/10 – 29/10 : đợt đăng ký (phiên 1: nhóm cố định, phiên 2: nhóm linh hoạt)
--   30/10 – 31/10 : duyệt
--   02/11 – 08/11 : áp dụng
-- =========================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. SCHEDULE_PERIOD
INSERT INTO schedule_period (
  schedule_period_id, period_name, period_type,
  start_date, end_date, effective_start_date, effective_end_date, description,
  registration_open_at, registration_close_at, status, created_by, created_at
)
VALUES (
  101, 'Lịch tuần 02/11 – 08/11/2026', 'WEEK',
  '2026-10-26', '2026-10-31', '2026-11-02', '2026-11-08',
  'Kỳ lịch theo tuần đầu tháng 11/2026',
  '2026-10-26 08:00:00', '2026-10-29 23:59:59', 'OPEN', 2, NOW()
)
ON DUPLICATE KEY UPDATE schedule_period_id = schedule_period_id;

-- 2. SCHEDULE_ROUND (thuộc kỳ 101, cửa hàng 1)
INSERT INTO schedule_round (
  schedule_round_id, round_name, schedule_period_id, store_id,
  registration_start_at, registration_end_at, description, status, created_by, created_at
)
VALUES (
  101, 'Đợt 1 tuần 1 của 11/2026', 101, 1,
  '2026-10-26 08:00:00', '2026-10-29 23:59:59',
  'Đăng ký ca tuần 02/11 – 08/11', 'OPEN', 2, NOW()
)
ON DUPLICATE KEY UPDATE schedule_round_id = schedule_round_id;

-- 3. SCHEDULE_SESSION (mỗi nhóm ca một phiên)
INSERT INTO schedule_session (
  schedule_session_id, session_name, session_open_at, session_close_at,
  schedule_round_id, shift_group_id, description, status, created_by, created_at
)
VALUES
  (101, 'Phiên 1 - Nhóm ca cố định', '2026-10-26 08:00:00', '2026-10-27 23:59:59',
   101, 1, 'Nhóm ca cố định đăng ký trước', 'OPEN', 2, NOW()),
  (102, 'Phiên 2 - Nhóm ca linh hoạt', '2026-10-28 08:00:00', '2026-10-29 23:59:59',
   101, 2, 'Nhóm ca linh hoạt đăng ký sau', 'PENDING', 2, NOW())
ON DUPLICATE KEY UPDATE schedule_session_id = schedule_session_id;

-- 4. SHIFT_BY_DATE (ca sáng thuộc nhóm cố định, ca chiều thuộc nhóm linh hoạt)
INSERT INTO shift_by_date (
  shift_by_date_id, shift_id, schedule_period_id, schedule_round_id, schedule_session_id,
  work_date, capacity, shift_name, start_time, end_time, max_capacity, pay_rate,
  status, manager_note, created_at, updated_at
)
VALUES
  (101, 1, 101, 101, 101, '2026-11-02', 1, 'Ca sáng',  '07:00:00', '15:00:00', 5, 30000, 'OPEN', 'Tuần đầu tháng 11', NOW(), NOW()),
  (102, 2, 101, 101, 102, '2026-11-02', 1, 'Ca chiều', '15:00:00', '23:00:00', 5, 32000, 'OPEN', NULL, NOW(), NOW()),
  (103, 1, 101, 101, 101, '2026-11-03', 0, 'Ca sáng',  '07:00:00', '15:00:00', 5, 30000, 'OPEN', NULL, NOW(), NOW()),
  (104, 2, 101, 101, 102, '2026-11-03', 0, 'Ca chiều', '15:00:00', '23:00:00', 5, 32000, 'OPEN', NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE shift_by_date_id = shift_by_date_id;

-- 5. SHIFT_ASSIGNMENT
INSERT INTO shift_assignment (
  assignment_id, shift_by_date_id, employee_id, status, registered_at,
  approved_by, approved_at, cancelled_by, cancelled_at, cancellation_reason, note
)
VALUES
  (101, 101, 3, 'PENDING',  NOW(), NULL, NULL,  NULL, NULL, NULL, 'Đăng ký ca sáng 02/11'),
  (102, 102, 4, 'APPROVED', NOW(), 2,    NOW(), NULL, NULL, NULL, 'Đã duyệt ca chiều 02/11')
ON DUPLICATE KEY UPDATE assignment_id = assignment_id;

-- 6. EMERGENCY_REQUEST (đổi ca: từ ca 101 sang ca 103)
INSERT INTO emergency_request (
  emergency_request_id, employee_id, assignment_id, request_type,
  from_shift_assignment_id, to_assignment_id, reason, status,
  requested_at, processed_by, processed_at, process_note
)
VALUES (
  101, 3, 101, 'CHANGE', 101, 103,
  'Bị ốm nên muốn đổi sang ca sáng 03/11', 'PENDING',
  NOW(), NULL, NULL, NULL
)
ON DUPLICATE KEY UPDATE emergency_request_id = emergency_request_id;

-- 7. SPECIAL_EVENT
INSERT INTO special_event (
  event_id, event_name, description, event_type, start_date, end_date,
  status, created_by, created_at, updated_at
)
VALUES (
  101, 'Khuyến mãi đầu tháng 11', 'Dự kiến tăng 50% lượng khách, cần thêm người ca chiều',
  'SALE', '2026-11-02', '2026-11-03', 'SCHEDULED', 2, NOW(), NOW()
)
ON DUPLICATE KEY UPDATE event_id = event_id;

-- 8. KIỂM TRA NHANH: chuỗi kỳ -> đợt -> phiên -> ca theo ngày
SELECT p.period_name, r.round_name, s.session_name, g.shift_group_name, d.work_date, d.shift_name
FROM shift_by_date d
JOIN schedule_period p ON p.schedule_period_id = d.schedule_period_id
JOIN schedule_round r ON r.schedule_round_id = d.schedule_round_id
JOIN schedule_session s ON s.schedule_session_id = d.schedule_session_id
JOIN shift_group g ON g.shift_group_id = s.shift_group_id
WHERE p.schedule_period_id = 101
ORDER BY d.work_date, d.start_time;
