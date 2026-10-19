-- ============================================================
-- Quyền cho API nhân viên tự hủy đăng ký ca khi còn chờ duyệt
--   DELETE /api/v1/shift_group/me/register?shiftId=..&workDate=..
-- Cấp cho cùng các vai trò đang được đăng ký ca (POST /api/v1/shift_group/me/register).
-- Chạy lại nhiều lần không bị trùng.
-- ============================================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'DELETE_SHIFT_GROUP_ME_REGISTER', 'DELETE /api/v1/shift_group/me/register',
       'Hủy đăng ký ca của tôi (khi còn chờ duyệt)', '/api/v1/shift_group/me/register', 'DELETE'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE permission_code = 'DELETE_SHIFT_GROUP_ME_REGISTER');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, (SELECT permission_id FROM permission WHERE permission_code = 'DELETE_SHIFT_GROUP_ME_REGISTER')
FROM role_permission rp
JOIN permission p ON p.permission_id = rp.permission_id
WHERE p.permission_code = 'POST_SHIFT_GROUP_ME_REGISTER';

SELECT p.permission_code, GROUP_CONCAT(r.role_code ORDER BY r.role_id) AS roles
FROM permission p
JOIN role_permission rp ON rp.permission_id = p.permission_id
JOIN role r ON r.role_id = rp.role_id
WHERE p.permission_code = 'DELETE_SHIFT_GROUP_ME_REGISTER'
GROUP BY p.permission_code;
