-- ============================================================
-- 20/10/2026: Cửa hàng chỉ còn 2 trạng thái OPENING (đang hoạt động) / CLOSED (đã đóng)
--   ACTIVE → OPENING, INACTIVE → CLOSED (backend cũng tự quy đổi khi đọc, script này để đồng bộ dữ liệu)
-- Khung giờ (ca mẫu): thêm min_capacity (ddl-auto=update cũng tự thêm)
-- Chạy lại nhiều lần không lỗi.
-- ============================================================
USE schedule_system;

UPDATE store SET status = 'OPENING' WHERE status IS NULL OR status IN ('ACTIVE');
UPDATE store SET status = 'CLOSED' WHERE status IN ('INACTIVE');

DROP PROCEDURE IF EXISTS add_min_capacity;
DELIMITER //
CREATE PROCEDURE add_min_capacity()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shift' AND COLUMN_NAME = 'min_capacity') THEN
        ALTER TABLE shift ADD COLUMN min_capacity INT NULL AFTER end_time;
    END IF;
END //
DELIMITER ;
CALL add_min_capacity();
DROP PROCEDURE add_min_capacity;

SELECT status, COUNT(*) FROM store GROUP BY status;
