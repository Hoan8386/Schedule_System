-- ============================================================
-- Dữ liệu mẫu: lịch làm việc đầy đủ tháng 11/2026 cho kỳ "Lịch tháng 11/2026"
--  - Ca mẫu cho Cửa hàng Thủ Đức (nếu chưa có)
--  - Ca theo ngày cho mọi ngày 01–30/11 × mọi ca mẫu ACTIVE (gắn kỳ / đợt / phiên)
--  - Phân ca cho nhân viên thuộc nhóm ca: 01–15/11 đã duyệt, 16–30/11 chờ duyệt
-- Chạy lại nhiều lần không bị trùng (INSERT IGNORE theo khóa unique).
-- ============================================================

SET @period := (SELECT schedule_period_id FROM schedule_period
                WHERE period_name = 'Lịch tháng 11/2026' ORDER BY schedule_period_id LIMIT 1);
SET @from := DATE('2026-11-01');
SET @to := DATE('2026-11-30');
SET @manager := (SELECT e.employee_id FROM employee e JOIN user u ON u.user_id = e.user_id WHERE u.username = 'manager');

-- ---------- 1. Ca mẫu cho Cửa hàng Thủ Đức ----------
INSERT INTO shift (store_id, shift_group_id, shift_code, shift_name, start_time, end_time, max_capacity, pay_rate, status, note, created_at)
SELECT 2, 3, 'TD_CA_SANG', 'Ca sáng', '07:00:00', '15:00:00', 5, 30000, 'ACTIVE', 'Dữ liệu mẫu', NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM shift WHERE store_id = 2 AND shift_code = 'TD_CA_SANG');

INSERT INTO shift (store_id, shift_group_id, shift_code, shift_name, start_time, end_time, max_capacity, pay_rate, status, note, created_at)
SELECT 2, 5, 'TD_CA_CHIEU', 'Ca chiều', '15:00:00', '23:00:00', 5, 32000, 'ACTIVE', 'Dữ liệu mẫu', NOW()
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM shift WHERE store_id = 2 AND shift_code = 'TD_CA_CHIEU');

SET @td_sang := (SELECT shift_id FROM shift WHERE store_id = 2 AND shift_code = 'TD_CA_SANG');
SET @td_chieu := (SELECT shift_id FROM shift WHERE store_id = 2 AND shift_code = 'TD_CA_CHIEU');

-- ---------- 2. Ca theo ngày: mọi ngày trong tháng × mọi ca mẫu đang hoạt động ----------
INSERT IGNORE INTO shift_by_date
    (shift_id, schedule_period_id, schedule_round_id, schedule_session_id, work_date,
     shift_name, start_time, end_time, max_capacity, pay_rate, status, manager_note, created_at)
WITH RECURSIVE days AS (
    SELECT @from AS work_date
    UNION ALL
    SELECT work_date + INTERVAL 1 DAY FROM days WHERE work_date < @to
)
SELECT sh.shift_id, @period, r.schedule_round_id, s.schedule_session_id, d.work_date,
       sh.shift_name, sh.start_time, sh.end_time, sh.max_capacity, COALESCE(sh.pay_rate, sg.pay_rate), 'OPEN',
       'Dữ liệu mẫu tháng 11', NOW()
FROM days d
JOIN shift sh ON sh.status = 'ACTIVE'
LEFT JOIN shift_group sg ON sg.shift_group_id = sh.shift_group_id
LEFT JOIN schedule_round r ON r.schedule_period_id = @period AND r.store_id = sh.store_id
LEFT JOIN schedule_session s ON s.schedule_round_id = r.schedule_round_id AND s.shift_group_id = sh.shift_group_id;

-- ---------- 3. Phân ca cho nhân viên thuộc nhóm ca ----------
-- DAYOFWEEK: 1 = Chủ nhật, 2 = Thứ hai, ... 7 = Thứ bảy
INSERT IGNORE INTO shift_assignment (shift_by_date_id, employee_id, status, registered_at, approved_by, approved_at, note)
SELECT x.shift_by_date_id, x.employee_id,
       IF(x.work_date <= '2026-11-15', 'APPROVED', 'PENDING'),
       '2026-10-18 09:00:00',
       IF(x.work_date <= '2026-11-15', @manager, NULL),
       IF(x.work_date <= '2026-11-15', '2026-10-18 10:00:00', NULL),
       'Dữ liệu mẫu tháng 11'
FROM (
    -- Nguyễn Văn An (employee01, nhóm cố định Quận 1): Ca sáng T2, T3, T5, T6 + Ca tối T7
    SELECT sbd.shift_by_date_id, sbd.work_date, 3 AS employee_id FROM shift_by_date sbd
    WHERE sbd.shift_id = 1 AND sbd.work_date BETWEEN @from AND @to AND DAYOFWEEK(sbd.work_date) IN (2, 3, 5, 6)
    UNION ALL
    SELECT sbd.shift_by_date_id, sbd.work_date, 3 FROM shift_by_date sbd
    WHERE sbd.shift_id = 3 AND sbd.work_date BETWEEN @from AND @to AND DAYOFWEEK(sbd.work_date) = 7
    UNION ALL
    -- Trần Thị Lan (storemanager01, nhóm linh hoạt Quận 1): Ca chiều T2, T4, T6, CN
    SELECT sbd.shift_by_date_id, sbd.work_date, 2 FROM shift_by_date sbd
    WHERE sbd.shift_id = 2 AND sbd.work_date BETWEEN @from AND @to AND DAYOFWEEK(sbd.work_date) IN (1, 2, 4, 6)
    UNION ALL
    -- Lê Thị Mai (employee02, nhóm cố định Thủ Đức): Ca sáng T3, T5, T7, CN
    SELECT sbd.shift_by_date_id, sbd.work_date, 4 FROM shift_by_date sbd
    WHERE sbd.shift_id = @td_sang AND sbd.work_date BETWEEN @from AND @to AND DAYOFWEEK(sbd.work_date) IN (1, 3, 5, 7)
) x;

-- ---------- Kiểm tra ----------
SELECT st.store_name, sh.shift_name, COUNT(DISTINCT sbd.shift_by_date_id) AS so_ngay,
       COUNT(sa.assignment_id) AS luot_phan_ca,
       SUM(sa.status = 'APPROVED') AS da_duyet, SUM(sa.status = 'PENDING') AS cho_duyet
FROM shift_by_date sbd
JOIN shift sh ON sh.shift_id = sbd.shift_id
JOIN store st ON st.store_id = sh.store_id
LEFT JOIN shift_assignment sa ON sa.shift_by_date_id = sbd.shift_by_date_id
WHERE sbd.work_date BETWEEN @from AND @to
GROUP BY st.store_name, sh.shift_id, sh.shift_name
ORDER BY st.store_name, sh.start_time;
