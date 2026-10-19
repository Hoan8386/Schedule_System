-- ============================================================
-- Quyền cho API duyệt hàng loạt (danh sách yêu cầu đăng ký trên Thời khóa biểu)
--   PATCH /api/v1/shift_assignment/approve   – duyệt đăng ký ca
--   PATCH /api/v1/emergency_request/approve  – duyệt yêu cầu khẩn
-- Cấp cho ADMIN, MANAGER, STORE_MANAGER (không cấp cho EMPLOYEE).
-- Chạy lại nhiều lần không bị trùng.
-- ============================================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT * FROM (
    SELECT 'PATCH_SHIFT_ASSIGNMENT_APPROVE' AS code, 'PATCH /api/v1/shift_assignment/approve' AS name,
           'Duyệt hàng loạt đăng ký ca' AS description, '/api/v1/shift_assignment/approve' AS path, 'PATCH' AS method
    UNION ALL
    SELECT 'PATCH_EMERGENCY_REQUEST_APPROVE', 'PATCH /api/v1/emergency_request/approve',
           'Duyệt hàng loạt yêu cầu khẩn', '/api/v1/emergency_request/approve', 'PATCH'
) p
WHERE NOT EXISTS (SELECT 1 FROM permission existing WHERE existing.permission_code = p.code);

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role r
JOIN permission p ON p.permission_code IN ('PATCH_SHIFT_ASSIGNMENT_APPROVE', 'PATCH_EMERGENCY_REQUEST_APPROVE')
WHERE r.role_code IN ('ADMIN', 'MANAGER', 'STORE_MANAGER');

SELECT p.permission_code, GROUP_CONCAT(r.role_code ORDER BY r.role_id) AS roles
FROM permission p
JOIN role_permission rp ON rp.permission_id = p.permission_id
JOIN role r ON r.role_id = rp.role_id
WHERE p.permission_code LIKE 'PATCH_%_APPROVE'
GROUP BY p.permission_code;
