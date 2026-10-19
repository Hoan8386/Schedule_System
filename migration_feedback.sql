-- ============================================================
-- Feedback: chọn đối tượng nhận (trưởng cửa hàng / quản lý / admin), tiêu đề, ảnh đính kèm.
--   + title, sender_role, target_role, attachment_ids
--   content / response chuyển sang TEXT (trước đây varchar(255) dễ bị tràn).
-- Quyền API giữ nguyên (GET/POST/PUT/DELETE /api/v1/feedback, POST /api/v1/attachment/upload);
-- phạm vi xem / trả lời được kiểm tra trong FeedbackService theo vai trò.
-- Chạy lại nhiều lần không lỗi.
-- ============================================================

USE schedule_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS add_feedback_column;
DELIMITER //
CREATE PROCEDURE add_feedback_column(IN col VARCHAR(64), IN definition VARCHAR(255))
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'feedback' AND COLUMN_NAME = col) THEN
        SET @ddl = CONCAT('ALTER TABLE feedback ADD COLUMN ', col, ' ', definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL add_feedback_column('title', 'VARCHAR(255) NULL AFTER feedback_type');
CALL add_feedback_column('sender_role', 'VARCHAR(30) NULL');
CALL add_feedback_column('target_role', 'VARCHAR(30) NULL');
CALL add_feedback_column('attachment_ids', 'VARCHAR(500) NULL');
DROP PROCEDURE add_feedback_column;

ALTER TABLE feedback MODIFY content TEXT NOT NULL;
ALTER TABLE feedback MODIFY response TEXT NULL;

-- Phản hồi cũ chưa có đối tượng nhận: coi như gửi tới trưởng cửa hàng
UPDATE feedback SET target_role = 'STORE_MANAGER' WHERE target_role IS NULL;
UPDATE feedback SET status = 'PENDING' WHERE status IN ('NEW', 'OPEN');

DESCRIBE feedback;

-- ============================================================
-- 20/10/2026: luồng trạng thái mới PENDING → REVIEWED → RESOLVED / CLOSED (bỏ PROCESSING, REJECTED)
--             + API danh sách đồng nghiệp cho phản hồi loại Đồng nghiệp
-- ============================================================
UPDATE feedback SET status = 'REVIEWED' WHERE status = 'PROCESSING';
UPDATE feedback SET status = 'CLOSED' WHERE status = 'REJECTED';

INSERT INTO permission (permission_code, permission_name, description, apiPath, method)
SELECT 'GET_FEEDBACK_COLLEAGUES', 'GET /api/v1/feedback/colleagues',
       'Danh sách đồng nghiệp cùng cửa hàng (phản hồi loại Đồng nghiệp)', '/api/v1/feedback/colleagues', 'GET'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE permission_code = 'GET_FEEDBACK_COLLEAGUES');

INSERT IGNORE INTO role_permission (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM role r
JOIN permission p ON p.permission_code = 'GET_FEEDBACK_COLLEAGUES'
WHERE r.role_code IN ('ADMIN', 'MANAGER', 'STORE_MANAGER', 'EMPLOYEE');

SELECT status, COUNT(*) FROM feedback GROUP BY status;
