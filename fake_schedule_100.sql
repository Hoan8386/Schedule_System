-- Fake schedule seed: 100 shift-by-date records
-- Run after sql has created the schedule_system schema and base employees.
-- This script does not delete existing data.

USE schedule_system;

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

INSERT INTO tmp_fake_store (slot, store_id)
SELECT 1, store_id FROM store WHERE store_code = @fake_store_1_code
UNION ALL
SELECT 2, store_id FROM store WHERE store_code = @fake_store_2_code;

-- Attach existing active employees to the fake stores so the schedule
-- also has employee-store and store-manager relationships.
INSERT INTO employee_store
    (employee_id, store_id, start_date, is_primary, status, created_at)
SELECT employee_id, store_id, '2026-01-01', FALSE, 'ACTIVE', NOW()
FROM (
    SELECT
        (SELECT MIN(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        (SELECT store_id FROM tmp_fake_store WHERE slot = 1) AS store_id
    UNION ALL
    SELECT
        (SELECT MAX(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        (SELECT store_id FROM tmp_fake_store WHERE slot = 2) AS store_id
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
        (SELECT store_id FROM tmp_fake_store WHERE slot = 1) AS store_id
    UNION ALL
    SELECT
        (SELECT MAX(employee_id) FROM employee WHERE status = 'ACTIVE') AS employee_id,
        (SELECT store_id FROM tmp_fake_store WHERE slot = 2) AS store_id
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

INSERT INTO schedule_period
    (store_id, period_name, period_type, start_date, end_date,
     registration_open_at, registration_close_at, status, created_at)
SELECT store_id, CONCAT('Dữ liệu giả - Tháng 10/2026 - Cửa hàng ', slot),
       'MONTH', '2026-10-01', '2026-10-31',
       '2026-09-20 08:00:00', '2026-09-29 23:59:59',
       'OPEN', NOW()
FROM tmp_fake_store stores
WHERE NOT EXISTS (
    SELECT 1
    FROM schedule_period period
    WHERE period.store_id = stores.store_id
      AND period.period_name = CONCAT('Dữ liệu giả - Tháng 10/2026 - Cửa hàng ', stores.slot)
);

DROP TEMPORARY TABLE IF EXISTS tmp_fake_period;
CREATE TEMPORARY TABLE tmp_fake_period (
    slot TINYINT PRIMARY KEY,
    period_id INT NOT NULL,
    store_id INT NOT NULL
);

INSERT INTO tmp_fake_period (slot, period_id, store_id)
SELECT stores.slot, period.schedule_period_id, stores.store_id
FROM tmp_fake_store stores
JOIN schedule_period period
  ON period.store_id = stores.store_id
 AND period.period_name = CONCAT('Dữ liệu giả - Tháng 10/2026 - Cửa hàng ', stores.slot);

INSERT INTO shift
    (store_id, shift_code, shift_name, start_time, end_time,
     max_capacity, pay_rate, status, note, created_at, updated_at)
SELECT stores.store_id, CONCAT('FAKE_', stores.slot, '_MORNING'),
       'Ca sáng - Dữ liệu giả', '07:00:00', '15:00:00',
       8, 30000, 'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
FROM tmp_fake_store stores
WHERE NOT EXISTS (
    SELECT 1 FROM shift item
    WHERE item.store_id = stores.store_id
      AND item.shift_code = CONCAT('FAKE_', stores.slot, '_MORNING')
);

INSERT INTO shift
    (store_id, shift_code, shift_name, start_time, end_time,
     max_capacity, pay_rate, status, note, created_at, updated_at)
SELECT stores.store_id, CONCAT('FAKE_', stores.slot, '_AFTERNOON'),
       'Ca chiều - Dữ liệu giả', '14:00:00', '22:00:00',
       8, 32000, 'ACTIVE', 'Dữ liệu giả phục vụ kiểm thử lịch', NOW(), NOW()
FROM tmp_fake_store stores
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
SELECT stores.slot, 0, item.shift_id
FROM tmp_fake_store stores
JOIN shift item
  ON item.store_id = stores.store_id
 AND item.shift_code = CONCAT('FAKE_', stores.slot, '_MORNING')
UNION ALL
SELECT stores.slot, 1, item.shift_id
FROM tmp_fake_store stores
JOIN shift item
  ON item.store_id = stores.store_id
 AND item.shift_code = CONCAT('FAKE_', stores.slot, '_AFTERNOON');

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
    (shift_id, schedule_period_id, work_date, capacity, shift_name,
     start_time, end_time, max_capacity, pay_rate, status,
     manager_note, created_at, updated_at)
SELECT item.shift_id,
       period.period_id,
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
       CASE WHEN MOD(numbers.n, 5) = 0 THEN 'PENDING' ELSE 'OPEN' END,
       'Ca giả được tạo tự động để kiểm thử thời khóa biểu',
       NOW(), NOW()
FROM tmp_fake_numbers numbers
JOIN tmp_fake_store stores
  ON stores.slot = CASE WHEN MOD(numbers.n, 4) < 2 THEN 1 ELSE 2 END
JOIN tmp_fake_period period ON period.slot = stores.slot
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
       'Phân công giả phục vụ kiểm thử'
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
DROP TEMPORARY TABLE IF EXISTS tmp_fake_period;
DROP TEMPORARY TABLE IF EXISTS tmp_fake_store;
DROP TEMPORARY TABLE IF EXISTS tmp_fake_numbers;

SELECT COUNT(*) AS generated_shift_by_date_count
FROM shift_by_date shift_date
JOIN shift item ON item.shift_id = shift_date.shift_id
WHERE item.shift_code LIKE 'FAKE\\_%' ESCAPE '\\'
  AND shift_date.work_date BETWEEN '2026-10-01' AND '2026-10-25';
