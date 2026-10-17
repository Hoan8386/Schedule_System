-- Fake schedule seed: 100 shift-by-date records
-- Run after sql has created the schedule_system schema and base employees.
-- This script does not delete existing data.

USE schedule_system;
-- Kết nối dùng cùng collation với database để so sánh chuỗi/biến không bị lỗi 1267
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @fake_store_1_code = 'FAKE_STORE_001';
SET @fake_store_2_code = 'FAKE_STORE_002';

INSERT INTO store
    (store_code, store_name, address, phone, status, note, created_at, updated_at)
SELECT @fake_store_1_code, 'Cửa hàng Fake Quận 1',
       '01 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', '02810000001',
       'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM store WHERE store_code = @fake_store_1_code);

INSERT INTO store
    (store_code, store_name, address, phone, status, note, created_at, updated_at)
SELECT @fake_store_2_code, 'Cửa hàng Fake Thủ Đức',
       '02 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh', '02810000002',
       'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM store WHERE store_code = @fake_store_2_code);

DROP TEMPORARY TABLE IF EXISTS tmp_fake_store;
CREATE TEMPORARY TABLE tmp_fake_store (
    slot TINYINT PRIMARY KEY,
    store_id INT NOT NULL
);

SET @fake_store_1_id = (SELECT store_id FROM store WHERE store_code = @fake_store_1_code);
SET @fake_store_2_id = (SELECT store_id FROM store WHERE store_code = @fake_store_2_code);

INSERT INTO tmp_fake_store (slot, store_id) VALUES (1, @fake_store_1_id), (2, @fake_store_2_id);

-- Attach existing active employees to the fake stores so the schedule
-- also has employee-store and store-manager relationships.
INSERT INTO employee_store
    (employee_id, store_id, start_date, is_primary, status, created_at)
SELECT employee_id, store_id, '2026-01-01', FALSE, 'ACTIVE', NOW()
FROM (
    SELECT
        (SELECT MIN(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        @fake_store_1_id AS store_id
    UNION ALL
    SELECT
        (SELECT MAX(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        @fake_store_2_id AS store_id
) assignments
WHERE employee_id IS NOT NULL
  AND store_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM employee_store existing
      WHERE existing.employee_id = assignments.employee_id
        AND existing.store_id = assignments.store_id
  );

INSERT INTO store_manager
    (store_id, employee_id, start_date, status, note, created_at)
SELECT assignments.store_id, assignments.employee_id, '2026-01-01',
       'ACTIVE', 'Quản lý giả phục vụ kiểm thử', NOW()
FROM (
    SELECT
        (SELECT MIN(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        @fake_store_1_id AS store_id
    UNION ALL
    SELECT
        (SELECT MAX(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        @fake_store_2_id AS store_id
) assignments
WHERE employee_id IS NOT NULL
  AND store_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM store_manager existing
      WHERE existing.employee_id = assignments.employee_id
        AND existing.store_id = assignments.store_id
        AND existing.status = 'ACTIVE'
  );

-- Kỳ dùng chung (không gắn cửa hàng): đăng ký + duyệt 20/09 – 30/09, áp dụng tháng 10.
SET @fake_period_name = 'Dữ liệu giả - Tháng 10/2026';

INSERT INTO schedule_period
    (period_name, period_type, start_date, end_date,
     effective_start_date, effective_end_date, description,
     registration_open_at, registration_close_at, status, created_at)
SELECT @fake_period_name, 'MONTH', '2026-09-20', '2026-09-30',
       '2026-10-01', '2026-10-31', 'Kỳ giả phục vụ kiểm thử lịch',
       '2026-09-20 08:00:00', '2026-09-29 23:59:59', 'OPEN', NOW()
WHERE NOT EXISTS (SELECT 1 FROM schedule_period WHERE period_name = @fake_period_name);

SET @fake_period_id = (SELECT MIN(schedule_period_id) FROM schedule_period WHERE period_name = @fake_period_name);

-- Mỗi cửa hàng giả: một nhóm ca, một đợt đăng ký trong kỳ và một phiên cho nhóm ca đó.
INSERT INTO shift_group
    (store_id, shift_group_code, shift_group_name, description, pay_rate, status, created_at, updated_at)
SELECT store_id, 'FAKE_GROUP', CONCAT('Nhóm ca giả - Cửa hàng ', slot),
       'Dữ liệu giả phục vụ kiểm thử lịch', 30000, 'ACTIVE', NOW(), NOW()
FROM tmp_fake_store stores
WHERE NOT EXISTS (
    SELECT 1 FROM shift_group grp
    WHERE grp.store_id = stores.store_id AND grp.shift_group_code = 'FAKE_GROUP'
);

INSERT INTO schedule_round
    (round_name, schedule_period_id, store_id, registration_start_at, registration_end_at,
     description, status, created_at)
SELECT CONCAT('Dữ liệu giả - Đợt tháng 10/2026 - Cửa hàng ', slot), @fake_period_id, store_id,
       '2026-09-20 08:00:00', '2026-09-29 23:59:59',
       'Đợt giả phục vụ kiểm thử lịch', 'OPEN', NOW()
FROM tmp_fake_store stores
WHERE NOT EXISTS (
    SELECT 1 FROM schedule_round round_item
    WHERE round_item.store_id = stores.store_id
      AND round_item.round_name = CONCAT('Dữ liệu giả - Đợt tháng 10/2026 - Cửa hàng ', stores.slot)
);

DROP TEMPORARY TABLE IF EXISTS tmp_fake_round;
CREATE TEMPORARY TABLE tmp_fake_round (
    slot TINYINT PRIMARY KEY,
    store_id INT NOT NULL,
    period_id INT NOT NULL,
    round_id INT NOT NULL,
    group_id INT NOT NULL,
    session_id INT NULL
);

INSERT INTO tmp_fake_round (slot, store_id, period_id, round_id, group_id)
SELECT stores.slot, stores.store_id, @fake_period_id, round_item.schedule_round_id, grp.shift_group_id
FROM tmp_fake_store stores
JOIN schedule_round round_item
  ON round_item.store_id = stores.store_id
 AND round_item.round_name = CONCAT('Dữ liệu giả - Đợt tháng 10/2026 - Cửa hàng ', stores.slot)
JOIN shift_group grp
  ON grp.store_id = stores.store_id
 AND grp.shift_group_code = 'FAKE_GROUP';

INSERT INTO schedule_session
    (session_name, session_open_at, session_close_at, schedule_round_id, shift_group_id,
     description, status, created_at)
SELECT CONCAT('Phiên giả - Cửa hàng ', slot), '2026-09-20 08:00:00', '2026-09-29 23:59:59',
       round_id, group_id, 'Phiên giả phục vụ kiểm thử lịch', 'OPEN', NOW()
FROM tmp_fake_round fake_round
WHERE NOT EXISTS (
    SELECT 1 FROM schedule_session session_item
    WHERE session_item.schedule_round_id = fake_round.round_id
      AND session_item.shift_group_id = fake_round.group_id
);

UPDATE tmp_fake_round fake_round
JOIN schedule_session session_item
  ON session_item.schedule_round_id = fake_round.round_id
 AND session_item.shift_group_id = fake_round.group_id
SET fake_round.session_id = session_item.schedule_session_id;

INSERT INTO shift
    (store_id, shift_group_id, shift_code, shift_name, start_time, end_time,
     max_capacity, pay_rate, status, note, created_at, updated_at)
SELECT stores.store_id, stores.group_id, CONCAT('FAKE_', stores.slot, '_MORNING'),
       'Ca sáng - Dữ liệu giả', '07:00:00', '15:00:00',
       8, 30000, 'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
FROM tmp_fake_round stores
WHERE NOT EXISTS (
    SELECT 1 FROM shift item
    WHERE item.store_id = stores.store_id
      AND item.shift_code = CONCAT('FAKE_', stores.slot, '_MORNING')
);

INSERT INTO shift
    (store_id, shift_group_id, shift_code, shift_name, start_time, end_time,
     max_capacity, pay_rate, status, note, created_at, updated_at)
SELECT stores.store_id, stores.group_id, CONCAT('FAKE_', stores.slot, '_AFTERNOON'),
       'Ca chiều - Dữ liệu giả', '14:00:00', '22:00:00',
       8, 32000, 'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
FROM tmp_fake_round stores
WHERE NOT EXISTS (
    SELECT 1 FROM shift item
    WHERE item.store_id = stores.store_id
      AND item.shift_code = CONCAT('FAKE_', stores.slot, '_AFTERNOON')
);

DROP TEMPORARY TABLE IF EXISTS tmp_fake_shift;
CREATE TEMPORARY TABLE tmp_fake_shift (
    slot TINYINT NOT NULL,
    shift_kind TINYINT NOT NULL,
    shift_id INT NOT NULL,
    PRIMARY KEY (slot, shift_kind)
);

INSERT INTO tmp_fake_shift (slot, shift_kind, shift_id)
SELECT stores.slot,
       CASE WHEN item.shift_code LIKE '%\_MORNING' THEN 0 ELSE 1 END,
       item.shift_id
FROM tmp_fake_store stores
JOIN shift item
  ON item.store_id = stores.store_id
 AND item.shift_code IN (CONCAT('FAKE_', stores.slot, '_MORNING'), CONCAT('FAKE_', stores.slot, '_AFTERNOON'));

DROP TEMPORARY TABLE IF EXISTS tmp_fake_numbers;
CREATE TEMPORARY TABLE tmp_fake_numbers (n INT PRIMARY KEY);

INSERT INTO tmp_fake_numbers (n)
WITH RECURSIVE sequence_numbers AS (
    SELECT 0 AS n
    UNION ALL
    SELECT n + 1 FROM sequence_numbers WHERE n < 99
)
SELECT n FROM sequence_numbers;

-- Four shifts per day for 25 days = exactly 100 shift-by-date records.
INSERT INTO shift_by_date
    (shift_id, schedule_period_id, schedule_round_id, schedule_session_id, work_date, capacity, shift_name,
     start_time, end_time, max_capacity, pay_rate, status,
     manager_note, created_at, updated_at)
SELECT item.shift_id,
       period.period_id,
       period.round_id,
       period.session_id,
       DATE_ADD('2026-10-01', INTERVAL FLOOR(numbers.n / 4) DAY),
       8,
       CASE WHEN MOD(numbers.n, 2) = 0
            THEN 'Ca sáng - Dữ liệu giả'
            ELSE 'Ca chiều - Dữ liệu giả'
       END,
       CASE WHEN MOD(numbers.n, 2) = 0 THEN '07:00:00' ELSE '14:00:00' END,
       CASE WHEN MOD(numbers.n, 2) = 0 THEN '15:00:00' ELSE '22:00:00' END,
       8,
       CASE WHEN MOD(numbers.n, 2) = 0 THEN 30000 ELSE 32000 END,
       CASE WHEN MOD(numbers.n, 5) = 0 THEN 'FULL' ELSE 'OPEN' END,
       'Ca giả được tạo tự động để kiểm thử thời khóa biểu',
       NOW(), NOW()
FROM tmp_fake_numbers numbers
JOIN tmp_fake_store stores
  ON stores.slot = CASE WHEN MOD(numbers.n, 4) < 2 THEN 1 ELSE 2 END
JOIN tmp_fake_round period ON period.slot = stores.slot
JOIN tmp_fake_shift fake_shift
  ON fake_shift.slot = stores.slot
 AND fake_shift.shift_kind = MOD(numbers.n, 2)
JOIN shift item ON item.shift_id = fake_shift.shift_id
WHERE NOT EXISTS (
    SELECT 1
    FROM shift_by_date existing
    WHERE existing.shift_id = item.shift_id
      AND existing.work_date = DATE_ADD('2026-10-01', INTERVAL FLOOR(numbers.n / 4) DAY)
);

-- Add one employee assignment for every generated shift.
INSERT INTO shift_assignment
    (shift_by_date_id, employee_id, status, registered_at, note)
SELECT shift_date.shift_by_date_id,
       COALESCE(
           (
               SELECT employee_store.employee_id
               FROM employee_store
               WHERE employee_store.store_id = item.store_id
                 AND employee_store.status = 'ACTIVE'
               ORDER BY employee_store.employee_id
               LIMIT 1
           ),
           (SELECT MIN(employee_id) FROM employee WHERE status = 'ACTIVE')
       ),
       CASE
           WHEN MOD(DAYOFMONTH(shift_date.work_date), 5) = 0 THEN 'PENDING'
           ELSE 'APPROVED'
       END,
       NOW(),
       'phân bổ giả phục vụ kiểm thử'
FROM shift_by_date shift_date
JOIN shift item ON item.shift_id = shift_date.shift_id
WHERE item.shift_code LIKE 'FAKE\\_%' ESCAPE '\\'
  AND shift_date.work_date BETWEEN '2026-10-01' AND '2026-10-25'
  AND NOT EXISTS (
      SELECT 1
      FROM shift_assignment assignment
      WHERE assignment.shift_by_date_id = shift_date.shift_by_date_id
  );

DROP TEMPORARY TABLE IF EXISTS tmp_fake_shift;
DROP TEMPORARY TABLE IF EXISTS tmp_fake_round;
DROP TEMPORARY TABLE IF EXISTS tmp_fake_store;
DROP TEMPORARY TABLE IF EXISTS tmp_fake_numbers;

SELECT COUNT(*) AS generated_shift_by_date_count
FROM shift_by_date shift_date
JOIN shift item ON item.shift_id = shift_date.shift_id
WHERE item.shift_code LIKE 'FAKE\\_%' ESCAPE '\\'
  AND shift_date.work_date BETWEEN '2026-10-01' AND '2026-10-25';
