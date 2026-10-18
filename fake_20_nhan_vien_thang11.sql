-- ============================================================
-- Dữ liệu mẫu: 20 nhân viên + 20 tài khoản (role EMPLOYEE) và đăng ký ca tháng 11/2026
--  - Tài khoản employee03 … employee22, mật khẩu giống employee01 (dùng chung password_hash)
--  - Mã nhân viên NV0005 … NV0024
--  - Chia 4 nhóm ca, mỗi nhóm 5 người:
--      Quận 1  · Nhóm cố định (ca sáng / ca tối)   employee03 … employee07
--      Quận 1  · Nhóm linh hoạt (ca chiều)         employee08 … employee12
--      Thủ Đức · Nhóm cố định (ca sáng)            employee13 … employee17
--      Thủ Đức · Nhóm linh hoạt (ca chiều)         employee18 … employee22
--  - Mỗi người đăng ký 4/7 ngày (xoay vòng), trạng thái PENDING (chờ duyệt)
--    → mỗi ca/ngày tối đa 4 người mới + 1 người cũ = 5 = max_capacity
-- Chạy lại nhiều lần không bị trùng.
-- ============================================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @from := DATE('2026-11-01');
SET @to := DATE('2026-11-30');
SET @pwd := (SELECT password_hash FROM user WHERE username = 'employee01');
SET @role_employee := (SELECT role_id FROM role WHERE role_code = 'EMPLOYEE');
SET @admin_user := (SELECT user_id FROM user WHERE username = 'admin');
SET @manager := (SELECT e.employee_id FROM employee e JOIN user u ON u.user_id = e.user_id WHERE u.username = 'manager');

DROP TEMPORARY TABLE IF EXISTS tmp_fake_emp;
CREATE TEMPORARY TABLE tmp_fake_emp (
    seq TINYINT PRIMARY KEY,          -- 0..19
    username VARCHAR(100),
    employee_code VARCHAR(20),
    full_name VARCHAR(255),
    gender VARCHAR(10),
    dob DATE,
    store_id INT,
    shift_group_id INT
) DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO tmp_fake_emp VALUES
 ( 0, 'employee03', 'NV0005', 'Phạm Minh Tuấn',     'MALE',   '1998-02-14', 1, 1),
 ( 1, 'employee04', 'NV0006', 'Hoàng Thị Hương',    'FEMALE', '1999-05-21', 1, 1),
 ( 2, 'employee05', 'NV0007', 'Vũ Đức Anh',         'MALE',   '2000-08-03', 1, 1),
 ( 3, 'employee06', 'NV0008', 'Đặng Thu Trang',     'FEMALE', '2001-11-12', 1, 1),
 ( 4, 'employee07', 'NV0009', 'Bùi Quốc Bảo',       'MALE',   '1997-03-30', 1, 1),
 ( 5, 'employee08', 'NV0010', 'Đỗ Ngọc Ánh',        'FEMALE', '2002-01-09', 1, 2),
 ( 6, 'employee09', 'NV0011', 'Hồ Thanh Phong',     'MALE',   '2003-06-17', 1, 2),
 ( 7, 'employee10', 'NV0012', 'Ngô Thị Thảo',       'FEMALE', '2002-09-25', 1, 2),
 ( 8, 'employee11', 'NV0013', 'Dương Văn Khánh',    'MALE',   '2001-12-02', 1, 2),
 ( 9, 'employee12', 'NV0014', 'Lý Mỹ Linh',         'FEMALE', '2003-04-11', 1, 2),
 (10, 'employee13', 'NV0015', 'Trịnh Công Danh',    'MALE',   '1996-07-19', 2, 3),
 (11, 'employee14', 'NV0016', 'Phan Thị Ngọc',      'FEMALE', '1998-10-05', 2, 3),
 (12, 'employee15', 'NV0017', 'Võ Hoàng Long',      'MALE',   '1999-01-28', 2, 3),
 (13, 'employee16', 'NV0018', 'Huỳnh Kim Ngân',     'FEMALE', '2000-03-16', 2, 3),
 (14, 'employee17', 'NV0019', 'Mai Xuân Trường',    'MALE',   '1997-12-24', 2, 3),
 (15, 'employee18', 'NV0020', 'Tạ Thị Yến',         'FEMALE', '2002-05-07', 2, 5),
 (16, 'employee19', 'NV0021', 'Lâm Gia Huy',        'MALE',   '2003-08-22', 2, 5),
 (17, 'employee20', 'NV0022', 'Châu Bảo Ngọc',      'FEMALE', '2001-02-13', 2, 5),
 (18, 'employee21', 'NV0023', 'Cao Minh Nhật',      'MALE',   '2002-11-30', 2, 5),
 (19, 'employee22', 'NV0024', 'Tôn Nữ Diễm My',     'FEMALE', '2003-07-04', 2, 5);

-- ---------- 1. Tài khoản ----------
INSERT INTO user (username, password_hash, email, phone, status, created_at, updated_at)
SELECT t.username, @pwd, CONCAT(t.username, '@schedulesystem.local'), CONCAT('09100000', LPAD(t.seq + 5, 2, '0')),
       'ACTIVE', NOW(), NOW()
FROM tmp_fake_emp t
WHERE NOT EXISTS (SELECT 1 FROM user u WHERE u.username = t.username);

INSERT IGNORE INTO user_role (user_id, role_id, assigned_by, assigned_at)
SELECT u.user_id, @role_employee, @admin_user, NOW()
FROM tmp_fake_emp t JOIN user u ON u.username = t.username;

-- ---------- 2. Nhân viên ----------
INSERT INTO employee (user_id, employee_code, full_name, date_of_birth, gender, email, phone, address,
                      hire_date, status, note, created_at, updated_at)
SELECT u.user_id, t.employee_code, t.full_name, t.dob, t.gender, u.email, u.phone,
       IF(t.store_id = 1, 'Quận 1, TP. Hồ Chí Minh', 'TP. Thủ Đức, TP. Hồ Chí Minh'),
       '2026-06-01', 'ACTIVE', 'Dữ liệu mẫu', NOW(), NOW()
FROM tmp_fake_emp t JOIN user u ON u.username = t.username
WHERE NOT EXISTS (SELECT 1 FROM employee e WHERE e.employee_code = t.employee_code);

-- ---------- 3. Gắn cửa hàng + nhóm ca ----------
INSERT INTO employee_store (employee_id, store_id, start_date, is_primary, status, assigned_by, created_at)
SELECT e.employee_id, t.store_id, '2026-06-01', 1, 'ACTIVE', @manager, NOW()
FROM tmp_fake_emp t JOIN employee e ON e.employee_code = t.employee_code
WHERE NOT EXISTS (SELECT 1 FROM employee_store es WHERE es.employee_id = e.employee_id AND es.store_id = t.store_id);

INSERT IGNORE INTO shift_group_employee (shift_group_id, employee_id, assigned_by, assigned_at)
SELECT t.shift_group_id, e.employee_id, @manager, NOW()
FROM tmp_fake_emp t JOIN employee e ON e.employee_code = t.employee_code;

-- ---------- 4. Đăng ký ca tháng 11 ----------
-- k = vị trí trong nhóm (0..4). Ngày làm khi (ngày + k) % 7 ∈ {3,4,5,6} → 4/7 ngày, mỗi ngày ≤ 4 người/nhóm.
-- Nhóm cố định Quận 1 có 2 ca không chồng giờ: ngày chẵn theo (ngày + k) → ca sáng, lẻ → ca tối.
INSERT IGNORE INTO shift_assignment (shift_by_date_id, employee_id, status, registered_at, note)
SELECT sbd.shift_by_date_id, e.employee_id, 'PENDING',
       TIMESTAMP('2026-10-18 08:00:00') + INTERVAL (t.seq * 7) MINUTE,
       'Dữ liệu mẫu tháng 11'
FROM tmp_fake_emp t
JOIN employee e ON e.employee_code = t.employee_code
JOIN shift sh ON sh.shift_group_id = t.shift_group_id AND sh.status = 'ACTIVE'
             AND sh.shift_code IN ('CA_SANG', 'CA_TOI', 'CA_CHIEU', 'TD_CA_SANG', 'TD_CA_CHIEU')
JOIN shift_by_date sbd ON sbd.shift_id = sh.shift_id AND sbd.work_date BETWEEN @from AND @to
WHERE (DAYOFMONTH(sbd.work_date) + t.seq % 5) % 7 IN (3, 4, 5, 6)
  AND (sh.shift_code <> 'CA_SANG' OR (DAYOFMONTH(sbd.work_date) + t.seq % 5) % 2 = 0)
  AND (sh.shift_code <> 'CA_TOI'  OR (DAYOFMONTH(sbd.work_date) + t.seq % 5) % 2 = 1);

-- ---------- Kiểm tra ----------
SELECT st.store_name, sh.shift_name, COUNT(sa.assignment_id) AS luot_dang_ky,
       SUM(sa.status = 'PENDING') AS cho_duyet, SUM(sa.status = 'APPROVED') AS da_duyet,
       MAX(per_day.c) AS max_nguoi_1_ngay, MAX(sbd.max_capacity) AS suc_chua
FROM shift_by_date sbd
JOIN shift sh ON sh.shift_id = sbd.shift_id
JOIN store st ON st.store_id = sh.store_id
LEFT JOIN shift_assignment sa ON sa.shift_by_date_id = sbd.shift_by_date_id
LEFT JOIN (SELECT shift_by_date_id, COUNT(*) c FROM shift_assignment GROUP BY shift_by_date_id) per_day
       ON per_day.shift_by_date_id = sbd.shift_by_date_id
WHERE sbd.work_date BETWEEN @from AND @to
GROUP BY st.store_name, sh.shift_id, sh.shift_name
ORDER BY st.store_name, sh.start_time;
