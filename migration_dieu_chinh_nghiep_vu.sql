-- ============================================================
-- 26/10/2026: Điều chỉnh nghiệp vụ theo "Các vấn đề cần điều chỉnh.docx"
--   1. Endpoint mới PUT /api/v1/stores/{id}/staff (đổi trưởng cửa hàng, thêm / bỏ / chuyển nhân viên của cửa hàng)
--   2. Cột ảnh chữ ký nhân viên (employee.signature_id)
--   3. Sửa ảnh đại diện đã lưu dạng khóa R2 ("images/xxx.png") → đường dẫn tải ảnh của backend
--   4. Khung giờ bắt buộc có số lượng tối đa (max): điền max cho khung giờ cũ còn trống
-- Chạy lại nhiều lần không lỗi.
-- ============================================================
USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. Quyền cho endpoint mới: cấp cho các vai trò đang được sửa cửa hàng (PUT /api/v1/stores/{id})
INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'PUT_STORES_ID_STAFF', 'PUT /api/v1/stores/{id}/staff',
       'Cập nhật nhân sự cửa hàng: trưởng cửa hàng, thêm / bỏ / chuyển nhân viên, đổi vị trí', '/api/v1/stores/{id}/staff', 'PUT'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE apiPath = '/api/v1/stores/{id}/staff' AND method = 'PUT');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT rp.role_id, staff.permission_id
FROM role_permission rp
JOIN permission store_put ON store_put.permission_id = rp.permission_id
     AND store_put.apiPath = '/api/v1/stores/{id}' AND store_put.method = 'PUT'
JOIN permission staff ON staff.apiPath = '/api/v1/stores/{id}/staff' AND staff.method = 'PUT';

-- 2. Cột ảnh chữ ký (backend có ddl-auto=update nên thường đã tự thêm; câu lệnh chỉ chạy khi cột chưa có)
SET @has_signature := (SELECT COUNT(*) FROM information_schema.COLUMNS
                       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employee' AND COLUMN_NAME = 'signature_id');
SET @sql := IF(@has_signature = 0, 'ALTER TABLE employee ADD COLUMN signature_id INT NULL AFTER id_card_back_id', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Ảnh đại diện lưu nhầm khóa R2 (không hiển thị được) → /api/v1/attachment/file/{id}
UPDATE employee e
JOIN attachment a ON a.file_path = e.avatar
SET e.avatar = CONCAT('/api/v1/attachment/file/', a.attachment_id)
WHERE e.avatar IS NOT NULL
  AND e.avatar NOT LIKE 'http%'
  AND e.avatar NOT LIKE 'data:%'
  AND e.avatar NOT LIKE '/%';

-- 4. Khung giờ chưa có max: dùng sức chứa mặc định 5 (giao diện đăng ký ca vẫn hiển thị 5 khi max trống), không nhỏ hơn min
UPDATE shift
SET max_capacity = GREATEST(COALESCE(min_capacity, 0), 5)
WHERE max_capacity IS NULL OR max_capacity <= 0;

SELECT p.method, p.apiPath, r.role_code
FROM role_permission rp
JOIN role r ON r.role_id = rp.role_id
JOIN permission p ON p.permission_id = rp.permission_id
WHERE p.apiPath = '/api/v1/stores/{id}/staff';
