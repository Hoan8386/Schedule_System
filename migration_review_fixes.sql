-- ============================================================
-- 21/10/2026: Endpoint mới sau review
--   - PUT /api/v1/user_role/change : đổi vai trò tài khoản trong một giao dịch
--     (thay cho cặp gỡ vai trò cũ + gán vai trò mới ở giao diện).
--     Cấp cho các vai trò đang được gỡ vai trò (DELETE /api/v1/user_role).
--   - PUT /api/v1/shift/capacity : lưu min / max nhiều ca mẫu trong một giao dịch.
--     Cấp cho các vai trò đang được sửa ca mẫu (PUT /api/v1/shift/{id}).
-- Chạy lại nhiều lần không lỗi.
-- ============================================================
USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'PUT_USER_ROLE_CHANGE', 'PUT /api/v1/user_role/change',
       'Đổi vai trò tài khoản (gỡ vai trò cũ, gán vai trò mới trong một giao dịch)', '/api/v1/user_role/change', 'PUT'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE apiPath = '/api/v1/user_role/change' AND method = 'PUT');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, p.permission_id
FROM role_permission rp
JOIN permission old ON old.permission_id = rp.permission_id AND old.apiPath = '/api/v1/user_role' AND old.method = 'DELETE'
JOIN permission p ON p.apiPath = '/api/v1/user_role/change' AND p.method = 'PUT';

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'PUT_SHIFT_CAPACITY', 'PUT /api/v1/shift/capacity',
       'Lưu số lượng tối thiểu / tối đa của nhiều khung giờ (ca mẫu)', '/api/v1/shift/capacity', 'PUT'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE apiPath = '/api/v1/shift/capacity' AND method = 'PUT');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, p.permission_id
FROM role_permission rp
JOIN permission old ON old.permission_id = rp.permission_id AND old.apiPath = '/api/v1/shift/{id}' AND old.method = 'PUT'
JOIN permission p ON p.apiPath = '/api/v1/shift/capacity' AND p.method = 'PUT';
