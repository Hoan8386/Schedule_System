-- ============================================================
-- Tối ưu hiệu năng (2026-10)
-- 1. Quyền cho các endpoint danh sách mới có phân trang:
--      GET /api/v1/employees/page   – trang Nhân sự        (cấp như GET /api/v1/employees)
--      GET /api/v1/attendance/page  – trang Chấm công      (cấp như GET /api/v1/attendance)
--      GET /api/v1/user/accounts    – trang Quản lý tài khoản (chỉ ADMIN; trang chỉ có ở không gian Admin)
-- 2. Index cho các truy vấn lọc / sắp xếp thường xuyên (đã kiểm tra bằng EXPLAIN):
--      shift_by_date(work_date)                 – lọc lịch theo khoảng ngày (lịch, task chuông thông báo, thống kê);
--                                                 uk_shift_by_date (shift_id, work_date) không dùng được khi không lọc shift_id.
--      attendance(check_in_at, attendance_id)   – trang chấm công sắp xếp mới nhất trước (bỏ filesort + LIMIT sớm).
--      attendance(employee_id, check_in_at)     – lịch sử chấm công của một nhân viên, mới nhất trước.
--      emergency_request(swap_assignment_id)    – kiểm tra "ca đang có yêu cầu chờ duyệt" (assignment_id OR swap_assignment_id);
--                                                 assignment_id đã có index từ khóa ngoại, swap_assignment_id thì chưa.
-- Chạy lại nhiều lần không lỗi / không trùng. Phần KHÔI PHỤC ở cuối file.
-- ============================================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------ 1. Quyền

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT * FROM (
    SELECT 'GET_EMPLOYEES_PAGE' AS code, 'GET /api/v1/employees/page' AS name,
           'Danh sách nhân sự có phân trang' AS description, '/api/v1/employees/page' AS path, 'GET' AS method
    UNION ALL
    SELECT 'GET_ATTENDANCE_PAGE', 'GET /api/v1/attendance/page',
           'Danh sách chấm công có phân trang', '/api/v1/attendance/page', 'GET'
    UNION ALL
    SELECT 'GET_USER_ACCOUNTS', 'GET /api/v1/user/accounts',
           'Danh sách tài khoản kèm vai trò, có phân trang', '/api/v1/user/accounts', 'GET'
) p
WHERE NOT EXISTS (SELECT 1 FROM permission existing WHERE existing.permission_code = p.code);

-- Endpoint phân trang cấp cho đúng các vai trò đang có quyền với endpoint danh sách gốc
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, np.permission_id
FROM permission base
JOIN role_permission rp ON rp.permission_id = base.permission_id
JOIN permission np ON np.permission_code = CASE base.permission_code
        WHEN 'GET_EMPLOYEES' THEN 'GET_EMPLOYEES_PAGE'
        WHEN 'GET_ATTENDANCE' THEN 'GET_ATTENDANCE_PAGE'
    END
WHERE base.permission_code IN ('GET_EMPLOYEES', 'GET_ATTENDANCE');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role r
JOIN permission p ON p.permission_code = 'GET_USER_ACCOUNTS'
WHERE r.role_code = 'ADMIN';

-- ------------------------------------------------------------ 2. Index (chỉ tạo khi chưa có)

DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER //
CREATE PROCEDURE add_index_if_missing(IN tbl VARCHAR(64), IN idx VARCHAR(64), IN cols VARCHAR(255))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.statistics
                   WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx) THEN
        SET @ddl = CONCAT('CREATE INDEX ', idx, ' ON ', tbl, ' (', cols, ')');
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL add_index_if_missing('shift_by_date', 'idx_shift_by_date_work_date', 'work_date');
CALL add_index_if_missing('attendance', 'idx_attendance_check_in', 'check_in_at, attendance_id');
CALL add_index_if_missing('attendance', 'idx_attendance_employee_check_in', 'employee_id, check_in_at');
CALL add_index_if_missing('emergency_request', 'idx_emergency_swap_assignment', 'swap_assignment_id');

DROP PROCEDURE add_index_if_missing;

-- Kiểm tra
SELECT p.permission_code, GROUP_CONCAT(r.role_code ORDER BY r.role_id) AS roles
FROM permission p
LEFT JOIN role_permission rp ON rp.permission_id = p.permission_id
LEFT JOIN role r ON r.role_id = rp.role_id
WHERE p.permission_code IN ('GET_EMPLOYEES_PAGE', 'GET_ATTENDANCE_PAGE', 'GET_USER_ACCOUNTS')
GROUP BY p.permission_code;

-- ============================================================
-- KHÔI PHỤC (chạy thủ công nếu cần quay lại):
-- DROP INDEX idx_shift_by_date_work_date ON shift_by_date;
-- DROP INDEX idx_attendance_check_in ON attendance;
-- DROP INDEX idx_attendance_employee_check_in ON attendance;
-- DROP INDEX idx_emergency_swap_assignment ON emergency_request;
-- DELETE rp FROM role_permission rp JOIN permission p ON p.permission_id = rp.permission_id
--   WHERE p.permission_code IN ('GET_EMPLOYEES_PAGE', 'GET_ATTENDANCE_PAGE', 'GET_USER_ACCOUNTS');
-- DELETE FROM permission WHERE permission_code IN ('GET_EMPLOYEES_PAGE', 'GET_ATTENDANCE_PAGE', 'GET_USER_ACCOUNTS');
-- ============================================================
