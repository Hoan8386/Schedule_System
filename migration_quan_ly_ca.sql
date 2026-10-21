-- ============================================================
-- 20/10/2026: Trưởng cửa hàng dùng chung giao diện "Quản lý ca" (thời khóa biểu) của trang Quản lý
--             + chuông thông báo hiện việc cần xử lý cho mọi vai trò.
-- Dữ liệu vẫn được backend giới hạn theo cửa hàng của trưởng cửa hàng (StoreScopeService).
-- Chạy lại nhiều lần không lỗi.
-- ============================================================
USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. Endpoint mới: việc cần xử lý trên chuông thông báo
INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'GET_NOTIFICATION_ME_TASKS', 'GET /api/v1/notification/me/tasks',
       'Việc cần xử lý / thông báo cần quan tâm (chuông thông báo)', '/api/v1/notification/me/tasks', 'GET'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE apiPath = '/api/v1/notification/me/tasks' AND method = 'GET');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role r
JOIN permission p ON p.apiPath = '/api/v1/notification/me/tasks' AND p.method = 'GET'
WHERE r.role_code IN ('ADMIN', 'MANAGER', 'STORE_MANAGER', 'EMPLOYEE');

-- 2. Trưởng cửa hàng: đọc dữ liệu lịch ca, thêm / sửa ca theo ngày, phân bổ nhân viên, xem nhân sự
INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role r
JOIN permission p ON (p.method = 'GET' AND p.apiPath IN (
        '/api/v1/stores', '/api/v1/employees', '/api/v1/employees/{id}', '/api/v1/employee_store', '/api/v1/store_manager',
        '/api/v1/schedule_period', '/api/v1/schedule_round', '/api/v1/schedule_session',
        '/api/v1/shift', '/api/v1/shift_group', '/api/v1/shift_by_date', '/api/v1/shift_assignment',
        '/api/v1/special_event', '/api/v1/emergency_request'))
   OR (p.method IN ('POST', 'PUT') AND p.apiPath IN (
        '/api/v1/shift_by_date', '/api/v1/shift_by_date/{id}', '/api/v1/shift_assignment', '/api/v1/shift_assignment/{id}',
        '/api/v1/emergency_request/{id}'))
WHERE r.role_code = 'STORE_MANAGER';

SELECT p.method, p.apiPath
FROM role_permission rp
JOIN role r ON r.role_id = rp.role_id AND r.role_code = 'STORE_MANAGER'
JOIN permission p ON p.permission_id = rp.permission_id
ORDER BY p.apiPath, p.method;
