-- =========================================
-- MODULE 03: SCHEDULE & SHIFT
-- Seed data mẫu cho hệ thống lịch làm việc
-- =========================================

-- 1. STORE
INSERT INTO store (store_id, store_code, store_name, address, phone, status, created_at, updated_at)
VALUES
  (1, 'ST001', 'Cửa hàng Quận 1', '123 Lê Lợi, Q1', '0900000001', 'ACTIVE', NOW(), NOW());

-- 2. USER / EMPLOYEE
-- Giả sử đã có user và employee trong hệ thống
-- Ví dụ dưới đây chỉ mẫu để test module schedule
INSERT INTO employee (employee_id, user_id, employee_code, full_name, store_id, position, status, created_at)
VALUES
  (101, 1, 'NV001', 'Nguyễn Văn A', 1, 'STAFF', 'ACTIVE', NOW()),
  (102, 2, 'NV002', 'Trần Thị B', 1, 'STAFF', 'ACTIVE', NOW()),
  (103, 3, 'NV003', 'Lê Văn C', 1, 'MANAGER', 'ACTIVE', NOW());

-- 3. SCHEDULE_PERIOD
INSERT INTO schedule_period (
  schedule_period_id,
  period_name,
  period_type,
  effective_start_date,
  effective_end_date,
  approval_start_date,
  approval_end_date,
  status,
  created_by,
  created_at
)
VALUES
  (
    1,
    'Kỳ đăng ký tháng 10/2026',
    'MONTH',
    '2026-10-01',
    '2026-10-31',
    '2026-09-20',
    '2026-09-25',
    'OPEN',
    103,
    NOW()
  );

-- 4. SCHEDULE_ROUND
INSERT INTO schedule_round (
  schedule_round_id,
  round_name,
  registration_start_at,
  registration_end_at,
  status,
  created_by,
  created_at
)
VALUES
  (
    1,
    'Đợt 1 tuần 1-2 của 10/2026',
    '2026-10-01 08:00:00',
    '2026-10-02 17:00:00',
    'OPEN',
    103,
    NOW()
  );

-- 5. SHIFT_GROUP
INSERT INTO shift_group (
  shift_group_id,
  store_id,
  shift_group_code,
  shift_group_name,
  description,
  pay_rate,
  status,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    1,
    1,
    'G1',
    'Nhóm ca dài hạn',
    'Nhóm ca cố định cho nhân viên bán hàng',
    25000,
    'ACTIVE',
    103,
    NOW(),
    NOW()
  );

-- 6. SHIFT
INSERT INTO shift (
  shift_id,
  shift_group_id,
  shift_code,
  shift_name,
  start_time,
  end_time,
  max_capacity,
  pay_rate,
  status,
  note,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    1,
    1,
    'S1',
    'Ca sáng',
    '08:00:00',
    '12:00:00',
    5,
    32000,
    'ACTIVE',
    'Ca sáng chính',
    103,
    NOW(),
    NOW()
  ),
  (
    2,
    1,
    'S2',
    'Ca chiều',
    '13:00:00',
    '17:00:00',
    5,
    35000,
    'ACTIVE',
    'Ca chiều chính',
    103,
    NOW(),
    NOW()
  );

-- 7. SCHEDULE_SESSION
INSERT INTO schedule_session (
  schedule_session_id,
  session_name,
  session_open_at,
  session_close_at,
  shift_group_id,
  status,
  created_by,
  created_at
)
VALUES
  (
    1,
    'Phiên đăng ký ca sáng',
    '2026-10-03 08:00:00',
    '2026-10-03 12:00:00',
    1,
    'OPEN',
    103,
    NOW()
  );

-- 8. SHIFT_BY_DATE
INSERT INTO shift_by_date (
  shift_by_date_id,
  shift_id,
  schedule_period_id,
  work_date,
  capacity,
  shift_name,
  start_time,
  end_time,
  pay_rate,
  status,
  manager_note,
  created_at,
  updated_at
)
VALUES
  (
    1,
    1,
    1,
    '2026-10-05',
    2,
    'Ca sáng',
    '08:00:00',
    '12:00:00',
    32000,
    'OPEN',
    'Bắt đầu thử nghiệm',
    NOW(),
    NOW()
  ),
  (
    2,
    2,
    1,
    '2026-10-05',
    1,
    'Ca chiều',
    '13:00:00',
    '17:00:00',
    35000,
    'OPEN',
    'Ca chiều',
    NOW(),
    NOW()
  );

-- 9. SHIFT_ASSIGNMENT
INSERT INTO shift_assignment (
  assignment_id,
  shift_by_date_id,
  employee_id,
  status,
  registered_at,
  approved_by,
  approved_at,
  cancelled_by,
  cancelled_at,
  cancellation_reason,
  note
)
VALUES
  (
    1,
    1,
    101,
    'PENDING',
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Đăng ký ca đầu tiên'
  ),
  (
    2,
    2,
    102,
    'APPROVED',
    NOW(),
    103,
    NOW(),
    NULL,
    NULL,
    NULL,
    'Đã duyệt ca'
  );

-- 10. EMERGENCY_REQUEST
INSERT INTO emergency_request (
  emergency_request_id,
  employee_id,
  assignment_id,
  request_type,
  from_shift_assignment_id,
  to_assignment_id,
  reason,
  status,
  requested_at,
  processed_by,
  processed_at,
  process_note
)
VALUES
  (
    1,
    101,
    1,
    'CHANGE',
    1,
    2,
    'Bị bệnh nên muốn đổi ca',
    'PENDING',
    NOW(),
    NULL,
    NULL,
    NULL
  );

-- 11. SPECIAL_EVENT (nếu bạn có bảng riêng cho sự kiện đặc biệt)
INSERT INTO special_event (
  event_id,
  event_name,
  description,
  event_type,
  start_date,
  end_date,
  status,
  created_by,
  created_at,
  updated_at
)
VALUES
  (
    1,
    'Khuyến mãi cuối tuần',
    'Lớn hơn 50% doanh số',
    'SALE',
    '2026-10-10',
    '2026-10-12',
    'SCHEDULED',
    103,
    NOW(),
    NOW()
  );

-- 12. SAMPLE QUERY CHECK
SELECT * FROM schedule_period;
SELECT * FROM schedule_round;
SELECT * FROM shift_group;
SELECT * FROM shift;
SELECT * FROM schedule_session;
SELECT * FROM shift_by_date;
SELECT * FROM shift_assignment;
SELECT * FROM emergency_request;
SELECT * FROM special_event;
