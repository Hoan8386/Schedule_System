-- ============================================================
-- 20/10/2026: Đặt lịch khẩn – Đổi ca phải chọn nhân viên ở ca đích để đổi chỗ (giữ nguyên số lượng mỗi ca)
--   emergency_request.swap_assignment_id → shift_assignment của đồng nghiệp ở ca đích
-- (ddl-auto=update cũng tự thêm cột; script này để chạy tay khi cần). Chạy lại nhiều lần không lỗi.
-- ============================================================
USE schedule_system;

DROP PROCEDURE IF EXISTS add_swap_column;
DELIMITER //
CREATE PROCEDURE add_swap_column()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'emergency_request'
                     AND COLUMN_NAME = 'swap_assignment_id') THEN
        ALTER TABLE emergency_request ADD COLUMN swap_assignment_id INT NULL AFTER to_assignment_id;
    END IF;
END //
DELIMITER ;
CALL add_swap_column();
DROP PROCEDURE add_swap_column;

DESCRIBE emergency_request;
